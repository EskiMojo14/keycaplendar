import { useEffect, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Avatar } from "@rmwc/avatar";
import { Checkbox } from "@rmwc/checkbox";
import { CircularProgress } from "@rmwc/circular-progress";
import { DataTableCell, DataTableRow } from "@rmwc/data-table";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { DateTime } from "luxon";
import { useImmer } from "use-immer";
import { notify } from "~/app/snackbar-queue";
import { Autocomplete } from "@c/util/autocomplete";
import { useAppSelector } from "@h";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user";
import {
  selectReverseSort,
  selectSort,
  selectUserById,
  useGetUsersQuery,
  useSetRolesMutation,
} from "@s/users";
import { partialUser } from "@s/users/constructors";
import type { UserType } from "@s/users/types";
import {
  arrayIncludes,
  hasKey,
  iconObject,
  ordinal,
  truncate,
} from "@s/util/functions";
import { Delete, Save } from "@i";

type UserRowProps = {
  delete: (user: EntityId) => void;
  userId: EntityId;
  nextPageToken?: string;
};

const roles = ["designer", "editor", "admin"] as const;

export const UserRow = ({
  delete: deleteFn,
  nextPageToken,
  userId,
}: UserRowProps) => {
  const currentUser = useAppSelector(selectUser);

  const userSort = useAppSelector(selectSort);
  const reverseUserSort = useAppSelector(selectReverseSort);

  const { propsUser } = useGetUsersQuery(
    { nextPageToken },
    {
      selectFromResult: ({ data }) => ({
        propsUser:
          data && selectUserById(data.users, userSort, reverseUserSort, userId),
      }),
    }
  );

  const allDesigners = useAppSelector(selectAllDesigners);

  const [user, updateUser] = useImmer<UserType>(partialUser());
  const [focused, setFocused] = useState("");

  const edited = propsUser !== user;

  const keyedUpdate =
    <T extends UserType, K extends keyof T>(key: K, payload: T[K]) =>
    (draft: T) => {
      draft[key] = payload;
    };

  useEffect(() => {
    updateUser(propsUser ?? partialUser());
  }, [propsUser]);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) =>
    setFocused(e.target.name);
  const handleBlur = () => setFocused("");

  const handleCheckboxChange = ({
    target: { checked, name },
  }: ChangeEvent<HTMLInputElement>) => {
    if (arrayIncludes(roles, name)) {
      updateUser(keyedUpdate(name, checked));
    }
  };

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (hasKey(user, name)) {
      updateUser(keyedUpdate(name, value));
    }
  };

  const selectValue = <Key extends keyof UserType>(
    prop: Key,
    value: UserType[Key]
  ) => updateUser(keyedUpdate(prop, value));

  const [setRoles, { loading }] = useSetRolesMutation({
    selectFromResult: ({ isLoading }) => ({ loading: isLoading }),
  });

  const saveRoles = async () => {
    try {
      await setRoles({
        claims: {
          admin: user.admin,
          designer: user.designer,
          editor: user.editor,
          id: user.id,
          nickname: user.nickname,
        },
      }).unwrap();
      notify({ title: "Successfully edited user permissions." });
    } catch {}
  };

  const saveButton = loading ? (
    <CircularProgress />
  ) : (
    <IconButton
      disabled={!edited}
      icon={iconObject(<Save />)}
      onClick={() => {
        if (edited) {
          saveRoles();
        }
      }}
    />
  );
  const myEmail = "ben.j.durrant@gmail.com";
  const cantEdit =
    (user.email === currentUser.email && currentUser.email !== myEmail) ||
    (user.email === myEmail && currentUser.email !== myEmail);
  const deleteButton = cantEdit ? null : (
    <IconButton
      icon={iconObject(<Delete />)}
      onClick={() => deleteFn(userId)}
    />
  );
  return (
    <DataTableRow>
      <DataTableCell>
        <Avatar name={user.displayName} size="large" src={user.photoURL} />
      </DataTableCell>
      <DataTableCell>{user.displayName}</DataTableCell>
      <DataTableCell>{truncate(user.email, 20)}</DataTableCell>
      <DataTableCell>
        {DateTime.fromISO(user.dateCreated).toFormat(
          `HH:mm d'${ordinal(DateTime.fromISO(user.dateCreated).day)}' MMM yyyy`
        )}
      </DataTableCell>
      <DataTableCell>
        {DateTime.fromISO(user.lastSignIn).toFormat(
          `HH:mm d'${ordinal(DateTime.fromISO(user.lastSignIn).day)}' MMM yyyy`
        )}
      </DataTableCell>
      <DataTableCell>
        {DateTime.fromISO(user.lastActive).toFormat(
          `HH:mm d'${ordinal(DateTime.fromISO(user.lastActive).day)}' MMM yyyy`
        )}
      </DataTableCell>
      <DataTableCell>
        <MenuSurfaceAnchor>
          <TextField
            className="nickname"
            name="nickname"
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            outlined
            value={user.nickname}
          />
          <Autocomplete
            array={allDesigners}
            minChars={2}
            open={focused === "nickname"}
            prop="nickname"
            query={user.nickname}
            select={(prop, item) => {
              if (hasKey(user, prop)) {
                selectValue(prop, item);
              }
            }}
          />
        </MenuSurfaceAnchor>
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          checked={user.designer}
          disabled={cantEdit}
          name="designer"
          onChange={handleCheckboxChange}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          checked={user.editor}
          disabled={cantEdit}
          name="editor"
          onChange={handleCheckboxChange}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          checked={user.admin}
          disabled={cantEdit}
          name="admin"
          onChange={handleCheckboxChange}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>{saveButton}</DataTableCell>
      <DataTableCell hasFormControl>{deleteButton}</DataTableCell>
    </DataTableRow>
  );
};

export default UserRow;
