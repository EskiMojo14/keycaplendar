import React, { useContext, useState } from "react";
import firebase from "../../firebase";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { queue } from "../../app/snackbarQueue";
import { UserContext, DeviceContext } from "../../util/contexts";
import { useBoolStates } from "../../util/functions";
import { Avatar } from "@rmwc/avatar";
import { Badge, BadgeAnchor } from "@rmwc/badge";
import { Button } from "@rmwc/button";
import { Card } from "@rmwc/card";
import { FormField } from "@rmwc/formfield";
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
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";
import { Footer } from "../common/Footer";
import { DialogDelete } from "../settings/DialogDelete";
import "./ContentSettings.scss";

type ContentSettingsProps = {
  applyTheme: string;
  bottomNav: boolean;
  darkTheme: string;
  density: string;
  fromTimeTheme: string;
  lightTheme: string;
  manualTheme: boolean;
  openNav: () => void;
  setApplyTheme: (applyTheme: string) => void;
  setBottomNav: (bottomNav: boolean) => void;
  setDarkTheme: (darkTheme: string) => void;
  setDensity: (density: string) => void;
  setFromTimeTheme: (fromTimeTheme: string) => void;
  setLightTheme: (lightTheme: string) => void;
  setManualTheme: (manualTheme: boolean) => void;
  setToTimeTheme: (toTimeTheme: string) => void;
  toTimeTheme: string;
};

export const ContentSettings = (props: ContentSettingsProps) => {
  const { user, setUser, syncSettings, setSyncSettings } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const [deleteDialogOpen, setDialogDeleteOpen] = useState(false);
  const [closeDeleteDialog, openDeleteDialog] = useBoolStates(setDialogDeleteOpen);
  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        setUser({});
      })
      .catch((error) => {
        console.log("Error signing out: " + error);
        queue.notify({ title: "Error signing out: " + error });
      });
  };
  const setApplyTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.setApplyTheme(e.target.value.toLowerCase());
  };
  const userBadge =
    user.isAdmin || user.isEditor || user.isDesigner ? (
      <Badge
        label={
          user.isAdmin ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18px" height="18px">
              <path fill="none" d="M0,0h18v18H0V0z" />
              <path
                d="M9,0.8l-6.8,3v4.5c0,4.2,2.9,8.1,6.8,9c3.9-0.9,6.8-4.8,6.8-9V3.8L9,0.8z M14.3,8.3c0,3.4-2.2,6.5-5.3,7.4
  c-3-0.9-5.3-4.1-5.3-7.4V4.7L9,2.4l5.3,2.3V8.3z"
              />
              <path opacity="0.3" d="M3.8,4.7v3.5c0,3.4,2.2,6.5,5.3,7.4c3-0.9,5.3-4.1,5.3-7.4V4.7L9,2.4L3.8,4.7z" />
            </svg>
          ) : user.isEditor ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
              <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
            </svg>
          ) : user.isDesigner ? (
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
          ) : null
        }
        className="user-icon material-icons"
      />
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
  const bottomNav =
    device === "mobile" ? (
      <div className="settings-group">
        <div className="subheader">
          <Typography use="caption">UI</Typography>
        </div>
        <Card>
          <div className="switch-container">
            <Switch
              label="Bottom navigation"
              checked={props.bottomNav}
              onChange={(evt) => props.setBottomNav(evt.currentTarget.checked)}
            />
          </div>
        </Card>
      </div>
    ) : null;
  const themeOptions =
    props.applyTheme === "system" ? null : props.applyTheme === "timed" ? (
      <div className="theme-form-field--flex">
        <FormField className="theme-form-field">
          <Typography use="body2">From</Typography>
          <div>
            <TextField
              outlined
              icon={{
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.25 12.15L11 13V7h1.5v5.25l4.5 2.67-.75 1.23z"
                      opacity=".3"
                    />
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                ),
              }}
              pattern="^\d{2}:\d{2}"
              placeholder="--:--"
              helpText={{ persistent: false, validationMsg: true, children: "hh:yy (24hr)" }}
              type="time"
              value={props.fromTimeTheme}
              onChange={(e) => {
                props.setFromTimeTheme((e.target as HTMLInputElement).value);
              }}
            />
          </div>
        </FormField>
        <FormField className="theme-form-field">
          <Typography use="body2">To</Typography>
          <div>
            <TextField
              outlined
              icon={{
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.25 12.15L11 13V7h1.5v5.25l4.5 2.67-.75 1.23z"
                      opacity=".3"
                    />
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                ),
              }}
              pattern="^\d{2}:\d{2}"
              placeholder="--:--"
              helpText={{ persistent: false, validationMsg: true, children: "hh:yy (24hr)" }}
              type="time"
              value={props.toTimeTheme}
              onChange={(e) => {
                props.setToTimeTheme((e.target as HTMLInputElement).value);
              }}
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
            checked={props.manualTheme}
            onChange={(e) => {
              props.setManualTheme((e.target as HTMLInputElement).checked);
            }}
          />
        </div>
      </FormField>
    );
  const density =
    device === "desktop" ? (
      <div className="settings-group">
        <div className="subheader">
          <Typography use="caption">Density</Typography>
        </div>
        <Card className="density-card">
          <SegmentedButton toggle className="density-toggle">
            <SegmentedButtonSegment
              label="Default"
              selected={props.density === "default"}
              onClick={() => {
                props.setDensity("default");
              }}
            />
            <SegmentedButtonSegment
              label="Comfortable"
              selected={props.density === "comfortable"}
              onClick={() => {
                props.setDensity("comfortable");
              }}
            />
            <SegmentedButtonSegment
              label="Compact"
              selected={props.density === "compact"}
              onClick={() => {
                props.setDensity("compact");
              }}
            />
          </SegmentedButton>
        </Card>
      </div>
    ) : null;
  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": props.bottomNav })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>Settings</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="admin-main">
        <div className="settings-container">
          <div className="settings">
            {userDisplay}
            {bottomNav}
            <div className="settings-group">
              <div className="subheader">
                <Typography use="caption">Light theme</Typography>
              </div>
              <Card className="theme-card">
                <List className="theme-list">
                  <ListItem onClick={() => props.setLightTheme("light")} className="light">
                    Light
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.lightTheme === "light"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => props.setLightTheme("sepia")} className="sepia">
                    Sepia
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.lightTheme === "sepia"} readOnly />
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
                    value={props.applyTheme === "system" ? "System" : props.applyTheme === "timed" ? "Timed" : "Manual"}
                    options={["Manual", "Timed", "System"]}
                    onChange={setApplyTheme}
                  />
                </FormField>
                {themeOptions}
                <List className="theme-list">
                  <ListItem onClick={() => props.setDarkTheme("ocean")} className="ocean">
                    Ocean
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.darkTheme === "ocean"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => props.setDarkTheme("grey")} className="grey">
                    Grey
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.darkTheme === "grey"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => props.setDarkTheme("deep-ocean")} className="deep-ocean">
                    Deep Ocean
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.darkTheme === "deep-ocean"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => props.setDarkTheme("deep")} className="deep">
                    Deep Purple
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.darkTheme === "deep"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                  <ListItem onClick={() => props.setDarkTheme("dark")} className="dark">
                    Dark
                    <ListItemMeta>
                      <Radio tabIndex={-1} checked={props.darkTheme === "dark"} readOnly />
                    </ListItemMeta>
                  </ListItem>
                </List>
              </Card>
            </div>
            {density}
          </div>
        </div>
      </div>
      <Footer />
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      {deleteUserDialog}
    </>
  );
};
