import React, { useEffect, useState } from "react";
import firebase from "@s/firebase";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { IconOptions } from "@rmwc/types";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbarQueue";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
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
} from "@s/settings/functions";
import { selectShareName, selectUser, setUser } from "@s/user";
import { userRoleIcons } from "@s/users/constants";
import { debouncedSyncShareName } from "@s/user/functions";
import { useBoolStates } from "@s/util/functions";
import { Avatar } from "@rmwc/avatar";
import { Badge, BadgeAnchor } from "@rmwc/badge";
import { Button } from "@rmwc/button";
import { Card } from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { FormField } from "@rmwc/formfield";
import { Icon } from "@rmwc/icon";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import { Select } from "@rmwc/select";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Footer } from "@c/common/Footer";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import { TimePicker } from "@c/util/pickers/TimePicker";
import { DialogDelete } from "./DialogDelete";
import "./index.scss";

type ContentSettingsProps = {
  openNav: () => void;
};

export const ContentSettings = (props: ContentSettingsProps) => {
  const dispatch = useAppDispatch();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "shareName") {
      setShareName(value);
      dispatch(setShareNameLoading(true));
      debouncedSyncShareName(value);
    }
  };

  const [deleteDialogOpen, setDialogDeleteOpen] = useState(false);
  const [closeDeleteDialog, openDeleteDialog] = useBoolStates(setDialogDeleteOpen);
  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch(setUser({}));
      })
      .catch((error) => {
        console.log("Error signing out: " + error);
        queue.notify({ title: "Error signing out: " + error });
      });
  };
  const selectApplyTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setApplyTheme(e.target.value.toLowerCase());
  };
  const permissionIcon = user.isAdmin
    ? userRoleIcons.admin
    : user.isEditor
    ? userRoleIcons.editor
    : user.isDesigner
    ? userRoleIcons.designer
    : null;
  const sizedIcon =
    permissionIcon && typeof permissionIcon === "object" && "strategy" in permissionIcon
      ? ({
          ...permissionIcon,
          size: "xsmall",
        } as IconOptions)
      : permissionIcon;
  const userBadge =
    user.isAdmin || user.isEditor || user.isDesigner ? (
      <Badge label={<Icon icon={sizedIcon} />} className="user-icon material-icons" />
    ) : null;
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
        <ListItem disabled className="account">
          {user.avatar ? (
            <BadgeAnchor className="avatar">
              <Avatar
                src={user.avatar}
                size={user.name || user.nickname ? "xlarge" : "large"}
                name={user.name ? user.name : ""}
              />
              {userBadge}
            </BadgeAnchor>
          ) : (
            <BadgeAnchor className="avatar">
              <Avatar size={user.name || user.nickname ? "xlarge" : "large"} name={user.name ? user.name : ""} />
              {userBadge}
            </BadgeAnchor>
          )}
          {user.name ? (
            <ListItemText>
              {user.nickname ? <div className="overline">{user.nickname}</div> : null}
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
            <Button raised label="Log out" onClick={signOut} />
          </div>
        </ListItem>
        <div className="text-field-container account">
          <FormField className="text-form-field">
            <label className="text-field-label" htmlFor="shareName">
              <Typography use="body2">Display name</Typography>
              <Typography use="caption">
                Used for features where a name would be displayed to other users, such as shared favorites.
              </Typography>
            </label>
            <TextField
              outlined
              id="shareName"
              name="shareName"
              value={shareName}
              className="name-field"
              onChange={handleChange}
              trailingIcon={shareNameLoading ? <CircularProgress size="medium" /> : undefined}
            />
          </FormField>
        </div>
        <div className="switch-container account">
          <Switch
            label="Sync settings to account"
            checked={syncSettings}
            onChange={(evt) => setSyncSettings(evt.currentTarget.checked)}
          />
        </div>
        <div className="delete-container">
          <Button className="delete" label="Delete account" outlined onClick={openDeleteDialog} />
        </div>
      </Card>
    </div>
  ) : (
    <div className="settings-group">
      <div className="subheader">
        <Typography use="caption">Account</Typography>
      </div>
      <Card className="placeholder-account">
        <ListItem disabled className="account">
          No user logged in.
          <div className="button">
            <Link to="/login">
              <Button raised label="Log in" />
            </Link>
          </div>
        </ListItem>
      </Card>
    </div>
  );
  const deleteUserDialog = user.email ? (
    <DialogDelete open={deleteDialogOpen} close={closeDeleteDialog} signOut={signOut} />
  ) : null;
  const bottomNavOptions =
    device === "mobile" ? (
      <div className="settings-group">
        <div className="subheader">
          <Typography use="caption">UI</Typography>
        </div>
        <Card>
          <div className="switch-container">
            <Switch
              label="Bottom navigation"
              checked={bottomNav}
              onChange={(evt) => setBottomNav(evt.currentTarget.checked)}
            />
          </div>
        </Card>
      </div>
    ) : null;
  const themeOptions =
    applyTheme === "system" ? null : applyTheme === "timed" ? (
      <div className="theme-form-field--flex">
        <FormField className="theme-form-field has-help-text">
          <Typography use="body2">From</Typography>
          <div className="field-container">
            <TimePicker
              outlined
              icon="history"
              value={fromTimeTheme}
              onChange={setFromTimeTheme}
              showNowButton
              saveOnClose
            />
          </div>
        </FormField>
        <FormField className="theme-form-field has-help-text">
          <Typography use="body2">To</Typography>
          <div className="field-container">
            <TimePicker
              outlined
              icon="update"
              value={toTimeTheme}
              onChange={setToTimeTheme}
              showNowButton
              saveOnClose
            />
          </div>
        </FormField>
      </div>
    ) : (
      <FormField className="theme-form-field">
        <Typography use="body2" tag="label" htmlFor="manualTheme">
          Dark theme
        </Typography>
        <div className="switch-container">
          <Switch
            id="manualTheme"
            checked={manualTheme}
            onChange={(e) => {
              setManualTheme((e.target as HTMLInputElement).checked);
            }}
          />
        </div>
      </FormField>
    );
  const densityOptions =
    device === "desktop" ? (
      <div className="settings-group">
        <div className="subheader">
          <Typography use="caption">Density</Typography>
        </div>
        <Card className="density-card">
          <SegmentedButton toggle className="density-toggle">
            <SegmentedButtonSegment
              label="Default"
              selected={density === "default"}
              onClick={() => {
                setDensity("default");
              }}
            />
            <SegmentedButtonSegment
              label="Comfortable"
              selected={density === "comfortable"}
              onClick={() => {
                setDensity("comfortable");
              }}
            />
            <SegmentedButtonSegment
              label="Compact"
              selected={density === "compact"}
              onClick={() => {
                setDensity("compact");
              }}
            />
          </SegmentedButton>
        </Card>
      </div>
    ) : null;
  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNavSetting })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.settings}</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {bottomNavSetting ? null : <TopAppBarFixedAdjust />}
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
                  <ListItem onClick={() => setLightTheme("light")} className="light">
                    Light
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={lightTheme === "light"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => setLightTheme("sepia")} className="sepia">
                    Sepia
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={lightTheme === "sepia"} readOnly />
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
                    outlined
                    value={applyTheme === "system" ? "System" : applyTheme === "timed" ? "Timed" : "Manual"}
                    options={["Manual", "Timed", "System"]}
                    onChange={selectApplyTheme}
                  />
                </FormField>
                {themeOptions}
                <List className="theme-list">
                  <ListItem onClick={() => setDarkTheme("ocean")} className="ocean">
                    Ocean
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={darkTheme === "ocean"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => setDarkTheme("grey")} className="grey">
                    Grey
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={darkTheme === "grey"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => setDarkTheme("deep-ocean")} className="deep-ocean">
                    Deep Ocean
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={darkTheme === "deep-ocean"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => setDarkTheme("deep")} className="deep">
                    Deep Purple
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={darkTheme === "deep"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => setDarkTheme("dark")} className="dark">
                    Dark
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={darkTheme === "dark"} readOnly />
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
      {bottomNavSetting ? <TopAppBarFixedAdjust /> : null}
      {deleteUserDialog}
    </>
  );
};
