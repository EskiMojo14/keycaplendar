import React, { useEffect, useState } from "react";
import firebase from "../../firebase";
import moment from "moment";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/commonSlice";
import { selectUser } from "../../app/slices/userSlice";
import { queue } from "../../app/snackbarQueue";
import { User } from "../../util/constructors";
import { hasKey, iconObject, mergeObject } from "../../util/functions";
import { UserType } from "../../util/types";
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
import { Autocomplete } from "../util/Autocomplete";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";

type UserCardProps = {
  allDesigners: string[];
  delete: (user: UserType) => void;
  getUsers: () => void;
  user: UserType;
};

export const UserCard = (props: UserCardProps) => {
  const device = useAppSelector(selectDevice);
  const currentUser = useAppSelector(selectUser);
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
  const roleIcons = {
    designer: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10s1.5.67 1.5 1.5S7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm4.5 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"
          opacity=".3"
        />
        <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm4 13h-1.77c-1.38 0-2.5 1.12-2.5 2.5 0 .61.22 1.19.63 1.65.06.07.14.19.14.35 0 .28-.22.5-.5.5-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.14 8 7c0 2.21-1.79 4-4 4z" />
        <circle cx="6.5" cy="11.5" r="1.5" />
        <circle cx="9.5" cy="7.5" r="1.5" />
        <circle cx="14.5" cy="7.5" r="1.5" />
        <circle cx="17.5" cy="11.5" r="1.5" />
      </svg>
    ),
    editor: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
      </svg>
    ),
    admin: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18px" height="18px">
        <path fill="none" d="M0,0h18v18H0V0z" />
        <path
          d="M9,0.8l-6.8,3v4.5c0,4.2,2.9,8.1,6.8,9c3.9-0.9,6.8-4.8,6.8-9V3.8L9,0.8z M14.3,8.3c0,3.4-2.2,6.5-5.3,7.4
  c-3-0.9-5.3-4.1-5.3-7.4V4.7L9,2.4l5.3,2.3V8.3z"
        />
        <path opacity="0.3" d="M3.8,4.7v3.5c0,3.4,2.2,6.5,5.3,7.4c3-0.9,5.3-4.1,5.3-7.4V4.7L9,2.4L3.8,4.7z" />
      </svg>
    ),
  };
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
                {moment.utc(user.dateCreated, moment.ISO_8601).format("HH:mm Do MMM YYYY")}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Last signed in</ListItemPrimaryText>
              <ListItemSecondaryText>
                {moment.utc(user.lastSignIn, moment.ISO_8601).format("HH:mm Do MMM YYYY")}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Last active</ListItemPrimaryText>
              <ListItemSecondaryText>
                {moment.utc(user.lastActive, moment.ISO_8601).format("HH:mm Do MMM YYYY")}
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
            array={props.allDesigners}
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
                  icon={device === "desktop" && hasKey(roleIcons, role) ? iconObject(roleIcons[role]) : null}
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
