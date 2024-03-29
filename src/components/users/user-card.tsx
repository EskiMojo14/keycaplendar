import { useEffect, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { Avatar } from "@rmwc/avatar";
import {
  Card,
  CardActionButtons,
  CardActionIcon,
  CardActionIcons,
  CardActions,
} from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { IconButton } from "@rmwc/icon-button";
import {
  CollapsibleList,
  List,
  ListItem,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
  SimpleListItem,
} from "@rmwc/list";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { DateTime } from "luxon";
import { useImmer } from "use-immer";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { Autocomplete } from "@c/util/autocomplete";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import firebase from "@s/firebase";
import { selectAllDesigners } from "@s/main";
import { selectUser } from "@s/user";
import { userRoleIcons } from "@s/users/constants";
import type { UserType } from "@s/users/types";
import { hasKey, iconObject, ordinal } from "@s/util/functions";
import { Delete, Save } from "@i";

type UserCardProps = {
  delete: (user: UserType) => void;
  getUsers: () => void;
  user: UserType;
};

const roles = ["designer", "editor", "admin"] as const;

export const UserCard = ({
  delete: deleteFn,
  getUsers,
  user: propsUser,
}: UserCardProps) => {
  const device = useAppSelector(selectDevice);

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
  const toggleRole = (role: typeof roles[number]) => {
    if (roles.includes(role)) {
      updateUser((user) => {
        user[role] = !user[role];
      });
      setEdited(true);
    }
  };

  const setRoles = () => {
    setLoading(true);
    const setRolesFn = firebase.functions().httpsCallable("setRoles");
    setRolesFn({
      admin: user.admin,
      designer: user.designer,
      editor: user.editor,
      email: user.email,
      nickname: user.nickname,
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
          title: `Failed to edit user permissions: ${result.data.error}`,
        });
      } else {
        queue.notify({ title: "Failed to edit user permissions." });
      }
    });
  };

  const saveButton = loading ? (
    <CircularProgress />
  ) : (
    <CardActionIcon
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
    <Card className="user">
      <List nonInteractive>
        <ListItem className="three-line" ripple={false}>
          <Avatar
            className="mdc-list-item__graphic"
            size="xlarge"
            src={user.photoURL}
          />
          <ListItemText>
            <div className="overline">{user.nickname}</div>
            <ListItemPrimaryText>{user.displayName}</ListItemPrimaryText>
            <ListItemSecondaryText>{user.email}</ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta>{deleteButton}</ListItemMeta>
        </ListItem>
      </List>
      <CollapsibleList
        handle={<SimpleListItem metaIcon="expand_more" text="Account dates" />}
      >
        <List nonInteractive twoLine>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Date created</ListItemPrimaryText>
              <ListItemSecondaryText>
                {DateTime.fromISO(user.dateCreated).toFormat(
                  `HH:mm d'${ordinal(
                    DateTime.fromISO(user.dateCreated).day
                  )}' MMM yyyy`
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Last signed in</ListItemPrimaryText>
              <ListItemSecondaryText>
                {DateTime.fromISO(user.lastSignIn).toFormat(
                  `HH:mm d'${ordinal(
                    DateTime.fromISO(user.lastSignIn).day
                  )}' MMM yyyy`
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
          <ListItem ripple={false}>
            <ListItemText>
              <ListItemPrimaryText>Last active</ListItemPrimaryText>
              <ListItemSecondaryText>
                {DateTime.fromISO(user.lastActive).toFormat(
                  `HH:mm d'${ordinal(
                    DateTime.fromISO(user.lastActive).day
                  )}' MMM yyyy`
                )}
              </ListItemSecondaryText>
            </ListItemText>
          </ListItem>
        </List>
      </CollapsibleList>
      <div className="text-field-container">
        <MenuSurfaceAnchor>
          <TextField
            className="nickname"
            label="Nickname"
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
      </div>
      <CardActions>
        <CardActionButtons>
          <SegmentedButton toggle>
            {roles.map((role) => (
              <SegmentedButtonSegment
                key={role}
                disabled={
                  (user.email === currentUser.email ||
                    user.email === "ben.j.durrant@gmail.com") &&
                  role !== "designer"
                }
                icon={
                  device === "desktop" && hasKey(userRoleIcons, role)
                    ? userRoleIcons[role]
                    : null
                }
                label={role}
                onClick={() => {
                  toggleRole(role);
                }}
                selected={hasKey(user, role) && !!user[role]}
              />
            ))}
          </SegmentedButton>
        </CardActionButtons>
        <CardActionIcons>{saveButton}</CardActionIcons>
      </CardActions>
    </Card>
  );
};

export default UserCard;
