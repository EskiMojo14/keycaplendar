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
import { useAppDispatch, useAppSelector } from "@h";
import firebase from "@s/firebase";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user";
import { selectUserById } from "@s/users";
import { partialUser } from "@s/users/constructors";
import { getUsers } from "@s/users/thunks";
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
};

const roles = ["designer", "editor", "admin"] as const;

export const UserRow = ({ delete: deleteFn, userId }: UserRowProps) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectUser);
  const propsUser = useAppSelector((state) => selectUserById(state, userId));

  const allDesigners = useAppSelector(selectAllDesigners);

  const [user, updateUser] = useImmer<UserType>(partialUser());
  const [loading, setLoading] = useState(false);
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

  const setRoles = async () => {
    setLoading(true);
    const setRolesFn = firebase.functions().httpsCallable("setRoles");
    try {
      const result = await setRolesFn({
        admin: user.admin,
        designer: user.designer,
        editor: user.editor,
        email: user.email,
        nickname: user.nickname,
      });
      setLoading(false);
      if (
        result.data.designer === user.designer &&
        result.data.editor === user.editor &&
        result.data.admin === user.admin
      ) {
        notify({ title: "Successfully edited user permissions." });
        dispatch(getUsers());
      } else if (result.data.error) {
        notify({
          title: `Failed to edit user permissions: ${result.data.error}`,
        });
      } else {
        notify({ title: "Failed to edit user permissions." });
      }
    } catch (error) {
      notify({
        title: `Failed to edit user permissions: ${error}`,
      });
    }
  };
  const saveButton = loading ? (
    <CircularProgress />
  ) : (
    <IconButton
      disabled={!edited}
      icon={iconObject(<Save />)}
      onClick={() => {
        if (edited) {
          setRoles();
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
