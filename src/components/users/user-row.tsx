import { useEffect, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { Avatar } from "@rmwc/avatar";
import { Checkbox } from "@rmwc/checkbox";
import { CircularProgress } from "@rmwc/circular-progress";
import { DataTableCell, DataTableRow } from "@rmwc/data-table";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { DateTime } from "luxon";
import { useImmer } from "use-immer";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { Autocomplete } from "@c/util/autocomplete";
import firebase from "@s/firebase";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user";
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
  delete: (user: UserType) => void;
  getUsers: () => void;
  user: UserType;
};

const roles = ["designer", "editor", "admin"] as const;

export const UserRow = ({
  delete: deleteFn,
  getUsers,
  user: propsUser,
}: UserRowProps) => {
  const currentUser = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);

  const [user, updateUser] = useImmer<UserType>(propsUser);
  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const keyedUpdate =
    <T extends UserType, K extends keyof T>(key: K, payload: T[K]) =>
    (draft: T) => {
      draft[key] = payload;
    };

  useEffect(() => {
    if (propsUser !== user) {
      updateUser(user);
      setEdited(false);
    }
  }, [propsUser]);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) =>
    setFocused(e.target.name);
  const handleBlur = () => setFocused("");

  const handleCheckboxChange = ({
    target: { name, checked },
  }: ChangeEvent<HTMLInputElement>) => {
    if (arrayIncludes(roles, name)) {
      updateUser(keyedUpdate(name, checked));
      setEdited(true);
    }
  };

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (hasKey(user, name)) {
      updateUser(keyedUpdate(name, value));
      setEdited(true);
    }
  };

  const selectValue = <Key extends keyof UserType>(
    prop: Key,
    value: UserType[Key]
  ) => {
    updateUser(keyedUpdate(prop, value));
    setEdited(true);
  };

  const setRoles = () => {
    setLoading(true);
    const setRolesFn = firebase.functions().httpsCallable("setRoles");
    setRolesFn({
      email: user.email,
      nickname: user.nickname,
      designer: user.designer,
      editor: user.editor,
      admin: user.admin,
    }).then((result) => {
      setLoading(false);
      if (
        result.data.designer === user.designer &&
        result.data.editor === user.editor &&
        result.data.admin === user.admin
      ) {
        queue.notify({ title: "Successfully edited user permissions." });
        getUsers();
      } else if (result.data.error) {
        queue.notify({
          title: "Failed to edit user permissions: " + result.data.error,
        });
      } else {
        queue.notify({ title: "Failed to edit user permissions." });
      }
    });
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
  const deleteButton =
    user.email === currentUser.email ||
    user.email === "ben.j.durrant@gmail.com" ? null : (
      <IconButton
        icon={iconObject(<Delete />)}
        onClick={() => deleteFn(user)}
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
            select={(prop, item) =>
              hasKey(user, prop) && selectValue(prop, item)
            }
          />
        </MenuSurfaceAnchor>
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          checked={user.designer}
          name="designer"
          onChange={handleCheckboxChange}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          checked={user.editor}
          disabled={
            user.email === currentUser.email ||
            user.email === "ben.j.durrant@gmail.com"
          }
          name="editor"
          onChange={handleCheckboxChange}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          checked={user.admin}
          disabled={
            user.email === currentUser.email ||
            user.email === "ben.j.durrant@gmail.com"
          }
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
