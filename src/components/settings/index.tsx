import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Avatar } from "@rmwc/avatar";
import { Badge, BadgeAnchor } from "@rmwc/badge";
import { Button } from "@rmwc/button";
import { Card } from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { FormField } from "@rmwc/formfield";
import { Icon } from "@rmwc/icon";
import {
  List,
  ListItem,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import { Select } from "@rmwc/select";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import type { IconOptions } from "@rmwc/types";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { TimePicker } from "@c/util/pickers/time-picker";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import firebase from "@s/firebase";
import {
  selectBottomNav,
  selectSettings,
  selectShareNameLoading,
  selectSyncSettings,
  setShareNameLoading,
} from "@s/settings";
import {
  setApplyTheme,
  setBottomNav,
  setDarkTheme,
  setDensity,
  setFromTimeTheme,
  setLightTheme,
  setManualTheme,
  setSyncSettings,
  setToTimeTheme,
} from "@s/settings/thunks";
import { selectShareName, selectUser, setUser } from "@s/user";
import { createDebouncedSyncShareName } from "@s/user/thunks";
import { userRoleIcons } from "@s/users/constants";
import { useBoolStates } from "@s/util/functions";
import { DialogDelete } from "./dialog-delete";
import "./index.scss";

type ContentSettingsProps = {
  openNav: () => void;
};

export const ContentSettings = ({ openNav }: ContentSettingsProps) => {
  const dispatch = useAppDispatch();

  const debouncedSyncShareName = useCallback(
    createDebouncedSyncShareName(dispatch),
    [dispatch]
  );

  const {
    applyTheme,
    bottomNav,
    darkTheme,
    density,
    fromTimeTheme,
    lightTheme,
    manualTheme,
    toTimeTheme,
  } = useAppSelector(selectSettings);
  const bottomNavSetting = useAppSelector(selectBottomNav);
  const device = useAppSelector(selectDevice);
  const syncSettings = useAppSelector(selectSyncSettings);

  const user = useAppSelector(selectUser);
  const docShareName = useAppSelector(selectShareName);
  const shareNameLoading = useAppSelector(selectShareNameLoading);

  const [shareName, setShareName] = useState("");

  useEffect(() => {
    setShareName(docShareName);
  }, [docShareName]);

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "shareName") {
      setShareName(value);
      dispatch(setShareNameLoading(true));
      debouncedSyncShareName(value);
    }
  };

  const [deleteDialogOpen, setDialogDeleteOpen] = useState(false);
  const [closeDeleteDialog, openDeleteDialog] =
    useBoolStates(setDialogDeleteOpen);
  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      dispatch(setUser({}));
    } catch (error) {
      console.log(`Error signing out: ${error}`);
      queue.notify({ title: `Error signing out: ${error}` });
    }
  };
  const selectApplyTheme = (e: ChangeEvent<HTMLSelectElement>) =>
    dispatch(setApplyTheme(e.target.value.toLowerCase()));
  const permissionIcon = user.isAdmin
    ? userRoleIcons.admin
    : user.isEditor
    ? userRoleIcons.editor
    : user.isDesigner
    ? userRoleIcons.designer
    : null;
  const sizedIcon =
    permissionIcon &&
    typeof permissionIcon === "object" &&
    "strategy" in permissionIcon
      ? ({
          ...permissionIcon,
          size: "xsmall",
        } as IconOptions)
      : permissionIcon;
  const userBadge = (user.isAdmin || user.isEditor || user.isDesigner) && (
    <Badge
      className="user-icon material-icons"
      label={<Icon icon={sizedIcon} />}
    />
  );
  const userDisplay = user.email ? (
    <div className="settings-group">
      <div className="subheader">
        <Typography use="caption">Account</Typography>
      </div>
      <Card
        className={classNames({
          "mdc-list--two-line": user.name || user.nickname,
          "three-line": user.nickname && user.name,
        })}
      >
        <ListItem className="account" disabled>
          {user.avatar ? (
            <BadgeAnchor className="avatar">
              <Avatar
                name={user.name ?? ""}
                size={user.name || user.nickname ? "xlarge" : "large"}
                src={user.avatar}
              />
              {userBadge}
            </BadgeAnchor>
          ) : (
            <BadgeAnchor className="avatar">
              <Avatar
                name={user.name ?? ""}
                size={user.name || user.nickname ? "xlarge" : "large"}
              />
              {userBadge}
            </BadgeAnchor>
          )}
          {user.name ? (
            <ListItemText>
              {user.nickname && <div className="overline">{user.nickname}</div>}
              <ListItemPrimaryText>{user.name}</ListItemPrimaryText>
              <ListItemSecondaryText>{user.email}</ListItemSecondaryText>
            </ListItemText>
          ) : user.nickname ? (
            <ListItemText>
              <ListItemPrimaryText>{user.nickname}</ListItemPrimaryText>
              <ListItemSecondaryText>{user.email}</ListItemSecondaryText>
            </ListItemText>
          ) : (
            user.email
          )}
          <div className="button">
            <Button label="Log out" onClick={signOut} raised />
          </div>
        </ListItem>
        <div className="text-field-container account">
          <FormField className="text-form-field">
            <label className="text-field-label" htmlFor="shareName">
              <Typography use="body2">Display name</Typography>
              <Typography use="caption">
                Used for features where a name would be displayed to other
                users, such as shared favorites.
              </Typography>
            </label>
            <TextField
              className="name-field"
              id="shareName"
              name="shareName"
              onChange={handleChange}
              outlined
              trailingIcon={
                shareNameLoading ? (
                  <CircularProgress size="medium" />
                ) : undefined
              }
              value={shareName}
            />
          </FormField>
        </div>
        <div className="switch-container account">
          <Switch
            checked={syncSettings}
            label="Sync settings to account"
            onChange={(evt) =>
              dispatch(setSyncSettings(evt.currentTarget.checked))
            }
          />
        </div>
        <div className="delete-container">
          <Button
            className="delete"
            label="Delete account"
            onClick={openDeleteDialog}
            outlined
          />
        </div>
      </Card>
    </div>
  ) : (
    <div className="settings-group">
      <div className="subheader">
        <Typography use="caption">Account</Typography>
      </div>
      <Card className="placeholder-account">
        <ListItem className="account" disabled>
          No user logged in.
          <div className="button">
            <Link to="/login">
              <Button label="Log in" raised />
            </Link>
          </div>
        </ListItem>
      </Card>
    </div>
  );
  const deleteUserDialog = user.email && (
    <DialogDelete
      close={closeDeleteDialog}
      open={deleteDialogOpen}
      signOut={signOut}
    />
  );
  const bottomNavOptions = device === "mobile" && (
    <div className="settings-group">
      <div className="subheader">
        <Typography use="caption">UI</Typography>
      </div>
      <Card>
        <div className="switch-container">
          <Switch
            checked={bottomNav}
            label="Bottom navigation"
            onChange={(evt) =>
              dispatch(setBottomNav(evt.currentTarget.checked))
            }
          />
        </div>
      </Card>
    </div>
  );
  const themeOptions =
    applyTheme === "system" ? null : applyTheme === "timed" ? (
      <div className="theme-form-field--flex">
        <FormField className="theme-form-field has-help-text">
          <Typography use="body2">From</Typography>
          <div className="field-container">
            <TimePicker
              icon="history"
              onChange={(time) => dispatch(setFromTimeTheme(time))}
              outlined
              saveOnClose
              showNowButton
              value={fromTimeTheme}
            />
          </div>
        </FormField>
        <FormField className="theme-form-field has-help-text">
          <Typography use="body2">To</Typography>
          <div className="field-container">
            <TimePicker
              icon="update"
              onChange={(time) => dispatch(setToTimeTheme(time))}
              outlined
              saveOnClose
              showNowButton
              value={toTimeTheme}
            />
          </div>
        </FormField>
      </div>
    ) : (
      <FormField className="theme-form-field">
        <Typography htmlFor="manualTheme" tag="label" use="body2">
          Dark theme
        </Typography>
        <div className="switch-container">
          <Switch
            checked={manualTheme}
            id="manualTheme"
            onChange={(e) =>
              dispatch(setManualTheme((e.target as HTMLInputElement).checked))
            }
          />
        </div>
      </FormField>
    );
  const densityOptions = device === "desktop" && (
    <div className="settings-group">
      <div className="subheader">
        <Typography use="caption">Density</Typography>
      </div>
      <Card className="density-card">
        <SegmentedButton className="density-toggle" toggle>
          <SegmentedButtonSegment
            label="Default"
            onClick={() => dispatch(setDensity("default"))}
            selected={density === "default"}
          />
          <SegmentedButtonSegment
            label="Comfortable"
            onClick={() => dispatch(setDensity("comfortable"))}
            selected={density === "comfortable"}
          />
          <SegmentedButtonSegment
            label="Compact"
            onClick={() => dispatch(setDensity("compact"))}
            selected={density === "compact"}
          />
        </SegmentedButton>
      </Card>
    </div>
  );
  return (
    <>
      <TopAppBar
        className={classNames({ "bottom-app-bar": bottomNavSetting })}
        fixed
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            <TopAppBarTitle>{pageTitle.settings}</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {!bottomNavSetting && <TopAppBarFixedAdjust />}
      <div className="admin-main">
        <div className="settings-container">
          <div className="settings">
            {userDisplay}
            {bottomNavOptions}
            <div className="settings-group">
              <div className="subheader">
                <Typography use="caption">Light theme</Typography>
              </div>
              <Card className="theme-card">
                <List className="theme-list">
                  <ListItem
                    className="light"
                    onClick={() => dispatch(setLightTheme("light"))}
                  >
                    Light
                    <ListItemMeta>
                      <Radio
                        checked={lightTheme === "light"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem
                    className="sepia"
                    onClick={() => dispatch(setLightTheme("sepia"))}
                  >
                    Sepia
                    <ListItemMeta>
                      <Radio
                        checked={lightTheme === "sepia"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                </List>
              </Card>
            </div>
            <div className="settings-group">
              <div className="subheader">
                <Typography use="caption">Dark theme</Typography>
              </div>
              <Card className="theme-card">
                <FormField className="theme-form-field">
                  <Typography use="body2">Apply dark theme</Typography>
                  <Select
                    enhanced
                    onChange={selectApplyTheme}
                    options={["Manual", "Timed", "System"]}
                    outlined
                    value={
                      applyTheme === "system"
                        ? "System"
                        : applyTheme === "timed"
                        ? "Timed"
                        : "Manual"
                    }
                  />
                </FormField>
                {themeOptions}
                <List className="theme-list">
                  <ListItem
                    className="ocean"
                    onClick={() => dispatch(setDarkTheme("ocean"))}
                  >
                    Ocean
                    <ListItemMeta>
                      <Radio
                        checked={darkTheme === "ocean"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem
                    className="grey"
                    onClick={() => dispatch(setDarkTheme("grey"))}
                  >
                    Grey
                    <ListItemMeta>
                      <Radio
                        checked={darkTheme === "grey"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem
                    className="deep-ocean"
                    onClick={() => dispatch(setDarkTheme("deep-ocean"))}
                  >
                    Deep Ocean
                    <ListItemMeta>
                      <Radio
                        checked={darkTheme === "deep-ocean"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem
                    className="deep"
                    onClick={() => dispatch(setDarkTheme("deep"))}
                  >
                    Deep Purple
                    <ListItemMeta>
                      <Radio
                        checked={darkTheme === "deep"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem
                    className="dark"
                    onClick={() => dispatch(setDarkTheme("dark"))}
                  >
                    Dark
                    <ListItemMeta>
                      <Radio
                        checked={darkTheme === "dark"}
                        readOnly
                        tabIndex={-1}
                      />
                    </ListItemMeta>
                  </ListItem>
                </List>
              </Card>
            </div>
            {densityOptions}
          </div>
        </div>
      </div>
      <Footer />
      {bottomNavSetting && <TopAppBarFixedAdjust />}
      {deleteUserDialog}
    </>
  );
};
