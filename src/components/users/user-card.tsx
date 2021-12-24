import { useEffect, useState, FocusEvent, ChangeEvent } from "react";
import firebase from "@s/firebase";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { selectDevice } from "@s/common";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user";
import { userRoleIcons } from "@s/users/constants";
import { User } from "@s/users/constructors";
import { UserType } from "@s/users/types";
import { hasKey, iconObject, mergeObjects, ordinal } from "@s/util/functions";
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
import { Autocomplete } from "@c/util/autocomplete";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { Delete, Save } from "@i";

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

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };
  const handleBlur = () => {
    setFocused("");
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser((user) => mergeObjects(user, { [e.target.name]: e.target.value }));
    setEdited(true);
  };
  const selectValue = (prop: string, value: string | boolean) => {
    setUser((user) => mergeObjects(user, { [prop]: value }));
    setEdited(true);
  };
  const toggleRole = (role: string) => {
    if (hasKey(user, role)) {
      setUser((user) => mergeObjects(user, { [role]: !user[role] }));
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
