import React from "react";
import firebase from "./firebase";
import { Link } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent } from "@rmwc/dialog";
import { Typography } from "@rmwc/typography";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText } from "@rmwc/list";
import { Button } from "@rmwc/button";
import { Switch } from "@rmwc/switch";
import { Select } from "@rmwc/select";
import { FormField } from "@rmwc/formfield";
import { TextField } from "@rmwc/textfield";
import { Radio } from "@rmwc/radio";
import { Avatar } from "@rmwc/avatar";
import "./DialogSettings.scss";

export class DialogSettings extends React.Component {
  signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.setUser({
          id: null,
          email: null,
          name: null,
          avatar: null,
        });
      })
      .catch((error) => {
        console.log("Error signing out: " + error);
        this.props.snackbarQueue.notify({ title: "Error signing out: " + error });
      });
  };
  setApplyTheme = (e) => {
    const applyThemeOptions = ["manual", "timed", "system"];
    this.props.changeApplyTheme(applyThemeOptions[e.detail.index]);
  };
  createThumbs = () => {
    const createThumbsFn = firebase.functions().httpsCallable("createThumbs");
    createThumbsFn()
      .then((result) => {
        if (result.data.error) {
          this.props.snackbarQueue.notify({ title: "Error creating thumbs: " + result.data.error });
        }
        console.log(result.data);
        this.props.snackbarQueue.notify({ title: "Successfully created thumbs." });
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error creating thumbs: " + error });
      });
  };
  render() {
    const bottomNav = this.props.changeBottomNav ? (
      <div className="group">
        <Typography use="subtitle2" tag="h3">
          UI
        </Typography>
        <Switch
          label="Bottom navigation"
          checked={this.props.bottomNav}
          onChange={(evt) => this.props.changeBottomNav(evt.currentTarget.checked)}
        />
      </div>
    ) : null;
    const user = this.props.user.name ? (
      <div className="group">
        <Typography use="subtitle2" tag="h3">
          Account
        </Typography>
        <ListItem className="account">
          <Avatar src={this.props.user.avatar} size="xlarge" />
          <ListItemText>
            <div className="overline">{this.props.user.nickname}</div>
            <ListItemPrimaryText>{this.props.user.name}</ListItemPrimaryText>
            <ListItemSecondaryText>{this.props.user.email}</ListItemSecondaryText>
          </ListItemText>
          <div className="button">
            <Button raised label="Log out" onClick={this.signOut} />
          </div>
        </ListItem>
      </div>
    ) : null;
    const admin = this.props.user.isAdmin ? (
      <div className="group">
        <Typography use="subtitle2" tag="h3">
          Admin
        </Typography>
        <div className="buttons">
          <Link to="/audit">
            <Button label="Audit log" onClick={this.props.close} />
          </Link>
          <Link to="/users">
            <Button label="Manage users" onClick={this.props.close} />
          </Link>
          <Button label="Refresh data" onClick={this.props.getData} />
          <Button label="Create thumbnails" onClick={this.createThumbs} />
        </div>
      </div>
    ) : null;
    const themeOptions =
      this.props.applyTheme === "system" ? null : this.props.applyTheme === "timed" ? (
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
                value={this.props.fromTimeTheme}
                onChange={(e) => {
                  this.props.setFromTimeTheme(e.target.value);
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
                value={this.props.toTimeTheme}
                onChange={(e) => {
                  this.props.setToTimeTheme(e.target.value);
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
            checked={this.props.manualTheme}
            onChange={(e) => {
              this.props.setManualTheme(e.target.checked);
            }}
          />
        </FormField>
      );
    return (
      <Dialog open={this.props.open} onClose={this.props.close} className="settings-dialog">
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <div className="group">
            <Typography use="subtitle2" tag="h3">
              Dark theme
            </Typography>
            <FormField className="theme-form-field">
              <Typography use="body2">Apply dark theme</Typography>
              <Select
                enhanced={{ fixed: true }}
                outlined
                value={
                  this.props.applyTheme === "system" ? "System" : this.props.applyTheme === "timed" ? "Timed" : "Manual"
                }
                options={["Manual", "Timed", "System"]}
                onChange={(e) => {
                  this.setApplyTheme(e);
                }}
              />
            </FormField>
            {themeOptions}
            <List>
              <ListItem onClick={() => this.props.setDarkTheme("grey")} className="grey">
                <FormField>
                  <Radio tabIndex="-1" checked={this.props.darkTheme === "grey"} readOnly />
                  Grey
                </FormField>
              </ListItem>
              <ListItem onClick={() => this.props.setDarkTheme("ocean")} className="ocean">
                <FormField>
                  <Radio tabIndex="-1" checked={this.props.darkTheme === "ocean"} readOnly />
                  Ocean
                </FormField>
              </ListItem>
              <ListItem onClick={() => this.props.setDarkTheme("deep")} className="deep">
                <FormField>
                  <Radio tabIndex="-1" checked={this.props.darkTheme === "deep"} readOnly />
                  Deep
                </FormField>
              </ListItem>
              <ListItem onClick={() => this.props.setDarkTheme("dark")} className="dark">
                <FormField>
                  <Radio tabIndex="-1" checked={this.props.darkTheme === "dark"} readOnly />
                  Dark
                </FormField>
              </ListItem>
            </List>
          </div>
          {bottomNav}
          {user}
          {admin}
        </DialogContent>
      </Dialog>
    );
  }
}

export default DialogSettings;
