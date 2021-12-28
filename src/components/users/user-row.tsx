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
import { User } from "@s/users/constructors";
import type { UserType } from "@s/users/types";
import { arrayIncludes, hasKey, iconObject, ordinal, truncate } from "@s/util/functions";
import { Delete, Save } from "@i";

type UserRowProps = {
  delete: (user: UserType) => void;
  getUsers: () => void;
  user: UserType;
};

const roles = ["designer", "editor", "admin"] as const;

export const UserRow = (props: UserRowProps) => {
  const currentUser = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);

  const blankUser = new User();
  const [user, updateUser] = useImmer<UserType>(blankUser);
  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const keyedUpdate = <T extends UserType, K extends keyof T>(key: K, payload: T[K]) => (draft: T) => {
    draft[key] = payload;
  };

  useEffect(() => {
    if (props.user !== user) {
      updateUser(props.user);
      setEdited(false);
    }
  }, [props.user]);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => setFocused(e.target.name);
  const handleBlur = () => setFocused("");

  const handleCheckboxChange = ({ target: { name, checked } }: ChangeEvent<HTMLInputElement>) => {
    if (arrayIncludes(roles, name)) {
      updateUser(keyedUpdate(name, checked));
      setEdited(true);
    }
  };

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    if (hasKey(user, name)) {
      updateUser(keyedUpdate(name, value));
      setEdited(true);
    }
  };

  const selectValue = <Key extends keyof UserType>(prop: Key, value: UserType[Key]) => {
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
        props.getUsers();
      } else if (result.data.error) {
        queue.notify({ title: "Failed to edit user permissions: " + result.data.error });
      } else {
        queue.notify({ title: "Failed to edit user permissions." });
      }
    });
  };
  const saveButton = loading ? (
    <CircularProgress />
  ) : (
    <IconButton
      onClick={() => {
        if (edited) {
          setRoles();
        }
      }}
      icon={iconObject(<Save />)}
      disabled={!edited}
    />
  );
  const deleteButton =
    user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com" ? null : (
      <IconButton
        onClick={() => {
          props.delete(user);
        }}
        icon={iconObject(<Delete />)}
      />
    );
  return (
    <DataTableRow>
      <DataTableCell>
        <Avatar src={user.photoURL} name={user.displayName} size="large" />
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
            outlined
            className="nickname"
            name="nickname"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={user.nickname}
          />
          <Autocomplete
            open={focused === "nickname"}
            array={allDesigners}
            query={user.nickname}
            prop="nickname"
            select={(prop, item) => hasKey(user, prop) && selectValue(prop, item)}
            minChars={2}
          />
        </MenuSurfaceAnchor>
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox name="designer" checked={user.designer} onChange={handleCheckboxChange} />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          name="editor"
          checked={user.editor}
          onChange={handleCheckboxChange}
          disabled={user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com"}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          name="admin"
          checked={user.admin}
          onChange={handleCheckboxChange}
          disabled={user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com"}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>{saveButton}</DataTableCell>
      <DataTableCell hasFormControl>{deleteButton}</DataTableCell>
    </DataTableRow>
  );
};

export default UserRow;
