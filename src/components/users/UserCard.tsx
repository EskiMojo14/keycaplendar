import React, { useEffect, useState } from "react";
import firebase from "@s/firebase";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbarQueue";
import { selectDevice } from "@s/common";
import { hasKey, iconObject, mergeObject, ordinal } from "@s/common/functions";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user/userSlice";
import { userRoleIcons } from "@s/users/constants";
import { User } from "@s/users/constructors";
import { UserType } from "@s/users/types";
import { Avatar } from "@rmwc/avatar";
import { Card, CardActions, CardActionIcons, CardActionIcon, CardActionButtons } from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { IconButton } from "@rmwc/icon-button";
import {
  List,
  ListItem,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemMeta,
  CollapsibleList,
  SimpleListItem,
} from "@rmwc/list";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { Autocomplete } from "@c/util/Autocomplete";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";

type UserCardProps = {
  delete: (user: UserType) => void;
  getUsers: () => void;
  user: UserType;
};

export const UserCard = (props: UserCardProps) => {
  const device = useAppSelector(selectDevice);

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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };
  const handleBlur = () => {
    setFocused("");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((user) => mergeObject(user, { [e.target.name]: e.target.value }));
    setEdited(true);
  };
  const selectValue = (prop: string, value: string | boolean) => {
    setUser((user) => mergeObject(user, { [prop]: value }));
    setEdited(true);
  };
  const toggleRole = (role: string) => {
    if (hasKey(user, role)) {
      setUser((user) => mergeObject(user, { [role]: !user[role] }));
      setEdited(true);
    }
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
  const roles = ["designer", "editor", "admin"];
  const saveButton = loading ? (
    <CircularProgress />
  ) : (
    <CardActionIcon
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
    <Card className="user">
      <List nonInteractive>
        <ListItem ripple={false} className="three-line">
          <Avatar src={user.photoURL} className="mdc-list-item__graphic" size="xlarge" />
          <ListItemText>
            <div className="overline">{props.user.nickname}</div>
            <ListItemPrimaryText>{user.displayName}</ListItemPrimaryText>
            <ListItemSecondaryText>{user.email}</ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta>{deleteButton}</ListItemMeta>
        </ListItem>
      </List>
      <CollapsibleList handle={<SimpleListItem text="Account dates" metaIcon="expand_more" />}>
        <List nonInteractive twoLine>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Date created</ListItemPrimaryText>
              <ListItemSecondaryText>
                {DateTime.fromISO(user.dateCreated).toFormat(
                  `HH:mm d'${ordinal(DateTime.fromISO(user.dateCreated).day)}' MMM yyyy`
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Last signed in</ListItemPrimaryText>
              <ListItemSecondaryText>
                {DateTime.fromISO(user.lastSignIn).toFormat(
                  `HH:mm d'${ordinal(DateTime.fromISO(user.lastSignIn).day)}' MMM yyyy`
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Last active</ListItemPrimaryText>
              <ListItemSecondaryText>
                {DateTime.fromISO(user.lastActive).toFormat(
                  `HH:mm d'${ordinal(DateTime.fromISO(user.lastActive).day)}' MMM yyyy`
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
        </List>
      </CollapsibleList>
      <div className="text-field-container">
        <MenuSurfaceAnchor>
          <TextField
            outlined
            label="Nickname"
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
            select={selectValue}
            minChars={2}
          />
        </MenuSurfaceAnchor>
      </div>
      <CardActions>
        <CardActionButtons>
          <SegmentedButton toggle>
            {roles.map((role) => {
              return (
                <SegmentedButtonSegment
                  key={role}
                  label={role}
                  icon={device === "desktop" && hasKey(userRoleIcons, role) ? userRoleIcons[role] : null}
                  selected={hasKey(user, role) && !!user[role]}
                  onClick={() => {
                    toggleRole(role);
                  }}
                  disabled={
                    (user.email === currentUser.email || user.email === "ben.j.durrant@gmail.com") &&
                    role !== "designer"
                  }
                />
              );
            })}
          </SegmentedButton>
        </CardActionButtons>
        <CardActionIcons>{saveButton}</CardActionIcons>
      </CardActions>
    </Card>
  );
};

export default UserCard;
