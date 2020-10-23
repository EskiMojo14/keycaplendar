import React from "react";
import firebase from "../firebase";
import { Link } from "react-router-dom";
import { Avatar } from "@rmwc/avatar";
import { Badge, BadgeAnchor } from "@rmwc/badge";
import { Button } from "@rmwc/button";
import { Dialog, DialogTitle, DialogContent } from "@rmwc/dialog";
import { FormField } from "@rmwc/formfield";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import { Select } from "@rmwc/select";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DialogSettings.scss";

export const DialogSettings = (props) => {
  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        props.setUser({
          id: null,
          email: null,
          name: null,
          avatar: null,
        });
      })
      .catch((error) => {
        console.log("Error signing out: " + error);
        props.snackbarQueue.notify({ title: "Error signing out: " + error });
      });
  };
  const setApplyTheme = (e) => {
    const applyThemeOptions = ["manual", "timed", "system"];
    props.changeApplyTheme(applyThemeOptions[e.detail.index]);
  };
  const createThumbs = () => {
    const createThumbsFn = firebase.functions().httpsCallable("createThumbs");
    createThumbsFn()
      .then((result) => {
        if (result.data.error) {
          props.snackbarQueue.notify({ title: "Error creating thumbs: " + result.data.error });
        }
        console.log(result.data);
        props.snackbarQueue.notify({ title: "Successfully created thumbs." });
      })
      .catch((error) => {
        props.snackbarQueue.notify({ title: "Error creating thumbs: " + error });
      });
  };
  const bottomNav = props.changeBottomNav ? (
    <div className="group">
      <Typography use="subtitle2" tag="h3">
        UI
      </Typography>
      <Switch
        label="Bottom navigation"
        checked={props.bottomNav}
        onChange={(evt) => props.changeBottomNav(evt.currentTarget.checked)}
      />
    </div>
  ) : null;
  const userBadge =
    props.user.isAdmin || props.user.isEditor || props.user.isDesigner ? (
      <Badge
        label={
          props.user.isAdmin ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18px" height="18px">
              <path fill="none" d="M0,0h18v18H0V0z" />
              <path
                d="M9,0.8l-6.8,3v4.5c0,4.2,2.9,8.1,6.8,9c3.9-0.9,6.8-4.8,6.8-9V3.8L9,0.8z M14.3,8.3c0,3.4-2.2,6.5-5.3,7.4
c-3-0.9-5.3-4.1-5.3-7.4V4.7L9,2.4l5.3,2.3V8.3z"
              />
              <path opacity="0.3" d="M3.8,4.7v3.5c0,3.4,2.2,6.5,5.3,7.4c3-0.9,5.3-4.1,5.3-7.4V4.7L9,2.4L3.8,4.7z" />
            </svg>
          ) : props.user.isEditor ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
              <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
            </svg>
          ) : props.user.isDesigner ? (
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
  const user = props.user.name ? (
    <div className="group">
      <Typography use="subtitle2" tag="h3">
        Account
      </Typography>
      <ListItem className="account three-line">
        <BadgeAnchor className="avatar">
          <Avatar src={props.user.avatar} size="xlarge" />
          {userBadge}
        </BadgeAnchor>
        <ListItemText>
          <div className="overline">{props.user.nickname}</div>
          <ListItemPrimaryText>{props.user.name}</ListItemPrimaryText>
          <ListItemSecondaryText>{props.user.email}</ListItemSecondaryText>
        </ListItemText>
        <div className="button">
          <Button raised label="Log out" onClick={signOut} />
        </div>
      </ListItem>
    </div>
  ) : null;
  const admin = props.user.isAdmin ? (
    <div className="group">
      <Typography use="subtitle2" tag="h3">
        Admin
      </Typography>
      <div className="buttons">
        <Link to="/audit">
          <Button label="Audit log" onClick={props.close} />
        </Link>
        <Link to="/users">
          <Button label="Manage users" onClick={props.close} />
        </Link>
        <Button label="Refresh data" onClick={props.getData} />
        <Button label="Create thumbnails" onClick={createThumbs} />
      </div>
    </div>
  ) : null;
  const themeOptions =
    props.applyTheme === "system" ? null : props.applyTheme === "timed" ? (
      <FormField className="theme-form-field theme-form-field--flex">
        <div className="theme-form-field__text">
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
                props.setFromTimeTheme(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="theme-form-field__text">
          <Typography use="body2">to</Typography>
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
                props.setToTimeTheme(e.target.value);
              }}
            />
          </div>
        </div>
      </FormField>
    ) : (
      <FormField className="theme-form-field">
        <Typography use="body2" tag="label" htmlFor="manualTheme">
          Dark theme
        </Typography>
        <Switch
          id="manualTheme"
          checked={props.manualTheme}
          onChange={(e) => {
            props.setManualTheme(e.target.checked);
          }}
        />
      </FormField>
    );
  return (
    <Dialog open={props.open} onClose={props.close} className="settings-dialog">
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <div className="group">
          <Typography use="subtitle2" tag="h3">
            Light theme
          </Typography>
          <List className="theme-list">
            <ListItem onClick={() => props.setLightTheme("light")} className="light">
              Light
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.lightTheme === "light"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem onClick={() => props.setLightTheme("sepia")} className="sepia">
              Sepia
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.lightTheme === "sepia"} readOnly />
              </ListItemMeta>
            </ListItem>
          </List>
        </div>
        <div className="group">
          <Typography use="subtitle2" tag="h3">
            Dark theme
          </Typography>
          <FormField className="theme-form-field">
            <Typography use="body2">Apply dark theme</Typography>
            <Select
              enhanced
              outlined
              value={props.applyTheme === "system" ? "System" : props.applyTheme === "timed" ? "Timed" : "Manual"}
              options={["Manual", "Timed", "System"]}
              onChange={(e) => {
                setApplyTheme(e);
              }}
            />
          </FormField>
          {themeOptions}
          <List className="theme-list">
            <ListItem onClick={() => props.setDarkTheme("ocean")} className="ocean">
              Ocean
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.darkTheme === "ocean"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem onClick={() => props.setDarkTheme("grey")} className="grey">
              Grey
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.darkTheme === "grey"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem onClick={() => props.setDarkTheme("deep-ocean")} className="deep-ocean">
              Deep Ocean
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.darkTheme === "deep-ocean"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem onClick={() => props.setDarkTheme("deep")} className="deep">
              Deep Purple
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.darkTheme === "deep"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem onClick={() => props.setDarkTheme("dark")} className="dark">
              Dark
              <ListItemMeta>
                <Radio tabIndex="-1" checked={props.darkTheme === "dark"} readOnly />
              </ListItemMeta>
            </ListItem>
          </List>
        </div>
        {bottomNav}
        <div className="group">
          <Typography use="subtitle2" tag="h3">
            Density
          </Typography>
          <ToggleGroup className="density-toggle">
            <ToggleGroupButton
              label="Default"
              selected={props.density === "default"}
              onClick={() => {
                props.setDensity("default");
              }}
            />
            <ToggleGroupButton
              label="Comfortable"
              selected={props.density === "comfortable"}
              onClick={() => {
                props.setDensity("comfortable");
              }}
            />
            <ToggleGroupButton
              label="Compact"
              selected={props.density === "compact"}
              onClick={() => {
                props.setDensity("compact");
              }}
            />
          </ToggleGroup>
        </div>
        {user}
        {admin}
      </DialogContent>
    </Dialog>
  );
};

export default DialogSettings;
