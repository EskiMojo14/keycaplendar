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
import { Autocomplete } from "@c/util/Autocomplete";

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
      icon={iconObject(
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M5 5v14h14V7.83L16.17 5H5zm7 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-8H6V6h9v4z"
              opacity=".3"
            />
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z" />
          </svg>
        </div>
      )}
      disabled={!edited}
    />
  );
  const deleteButton =
    user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com" ? null : (
      <IconButton
        onClick={() => {
          props.delete(user);
        }}
        icon={iconObject(
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M8 9h8v10H8z" opacity=".3" />
              <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
            </svg>
          </div>
        )}
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
