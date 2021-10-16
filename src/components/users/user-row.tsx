import { useEffect, useState, FocusEvent, ChangeEvent } from "react";
import { DateTime } from "luxon";
import firebase from "@s/firebase";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user";
import { User } from "@s/users/constructors";
import { UserType } from "@s/users/types";
import { iconObject, mergeObject, ordinal, truncate } from "@s/util/functions";
import { Avatar } from "@rmwc/avatar";
import { Checkbox } from "@rmwc/checkbox";
import { CircularProgress } from "@rmwc/circular-progress";
import { DataTableRow, DataTableCell } from "@rmwc/data-table";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { Autocomplete } from "@c/util/autocomplete";
import { Delete, Save } from "@i";

type UserRowProps = {
  delete: (user: UserType) => void;
  getUsers: () => void;
  user: UserType;
};

export const UserRow = (props: UserRowProps) => {
  const currentUser = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);

  const blankUser = new User();
  const [user, setUser] = useState<UserType>(blankUser);
  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (props.user !== user) {
      setUser(props.user);
      setEdited(false);
    }
  }, [props.user]);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };
  const handleBlur = () => {
    setFocused("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser((user) => mergeObject(user, { [e.target.name]: e.target.checked }));
    setEdited(true);
  };
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser((user) => mergeObject(user, { [e.target.name]: e.target.value }));
    setEdited(true);
  };
  const selectValue = (prop: string, value: string | boolean) => {
    setUser((user) => mergeObject(user, { [prop]: value }));
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
      if (result.data.editor === user.editor && result.data.admin === user.admin) {
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
            onChange={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={user.nickname}
          />
          <Autocomplete
            open={focused === "nickname"}
            array={allDesigners}
            query={user.nickname}
            prop="nickname"
            select={selectValue}
            minChars={2}
          />
        </MenuSurfaceAnchor>
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox name="designer" checked={user.designer} onChange={handleChange} />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          name="editor"
          checked={user.editor}
          onChange={handleChange}
          disabled={user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com"}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>
        <Checkbox
          name="admin"
          checked={user.admin}
          onChange={handleChange}
          disabled={user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com"}
        />
      </DataTableCell>
      <DataTableCell hasFormControl>{saveButton}</DataTableCell>
      <DataTableCell hasFormControl>{deleteButton}</DataTableCell>
    </DataTableRow>
  );
};

export default UserRow;
