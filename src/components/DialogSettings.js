import React from "react";
import firebase from "./firebase";
import { Link } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent } from "@rmwc/dialog";
import { Typography } from "@rmwc/typography";
import { List, ListItem, ListItemGraphic, ListItemMeta } from "@rmwc/list";
import { Button } from "@rmwc/button";
import { Switch } from "@rmwc/switch";
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
    ) : (
      ""
    );
    const user = this.props.user.name ? (
      <div className="group">
        <Typography use="subtitle2" tag="h3">
          Account
        </Typography>
        <div className="account">
          <div className="avatar" style={{ backgroundImage: "url(" + this.props.user.avatar + ")" }}></div>
          <div className="text">
            <Typography use="subtitle1" className="primary">
              {this.props.user.name}
            </Typography>
            <Typography use="body2" className="secondary">
              {this.props.user.email}
            </Typography>
          </div>
          <div className="button">
            <Button raised label="Log out" onClick={this.signOut} />
          </div>
        </div>
      </div>
    ) : (
      ""
    );
    const admin = this.props.user.isAdmin ? (
      <div className="group">
        <Typography use="subtitle2" tag="h3">
          Admin
        </Typography>
        <div className="buttons">
          <Link to="/users">
            <Button label="Manage users" onClick={this.props.close} />
          </Link>
          <Button label="Refresh data" onClick={this.props.getData} />
        </div>
      </div>
    ) : (
      ""
    );
    return (
      <Dialog open={this.props.open} onClose={this.props.close} className="settings-dialog">
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <div className="group">
            <Typography use="subtitle2" tag="h3">
              Theme
            </Typography>
            <List>
              <ListItem onClick={() => this.props.changeTheme("light")} className="light">
                <ListItemGraphic
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
                        <path d="M24 0H0v24h24V0z" fill="none" />
                        <path
                          d="M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76V5.1L7.76 9.35C6.62 10.48 6 11.99 6 13.59z"
                          opacity=".3"
                        />
                        <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                      </svg>
                    ),
                  }}
                />
                Light
                {this.props.theme === "light" ? <ListItemMeta icon="check" /> : ""}
              </ListItem>
              <ListItem onClick={() => this.props.changeTheme("grey")} className="grey">
                <ListItemGraphic
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
                        <path d="M24 0H0v24h24V0z" fill="none" />
                        <path
                          d="M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76V5.1L7.76 9.35C6.62 10.48 6 11.99 6 13.59z"
                          opacity=".3"
                        />
                        <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                      </svg>
                    ),
                  }}
                />
                Grey
                {this.props.theme === "grey" ? <ListItemMeta icon="check" /> : ""}
              </ListItem>
              <ListItem onClick={() => this.props.changeTheme("ocean")} className="ocean">
                <ListItemGraphic
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
                        <path d="M24 0H0v24h24V0z" fill="none" />
                        <path
                          d="M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76V5.1L7.76 9.35C6.62 10.48 6 11.99 6 13.59z"
                          opacity=".3"
                        />
                        <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                      </svg>
                    ),
                  }}
                />
                Ocean
                {this.props.theme === "ocean" ? <ListItemMeta icon="check" /> : ""}
              </ListItem>
              <ListItem onClick={() => this.props.changeTheme("deep")} className="deep">
                <ListItemGraphic
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
                        <path d="M24 0H0v24h24V0z" fill="none" />
                        <path
                          d="M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76V5.1L7.76 9.35C6.62 10.48 6 11.99 6 13.59z"
                          opacity=".3"
                        />
                        <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                      </svg>
                    ),
                  }}
                />
                Deep
                {this.props.theme === "deep" ? <ListItemMeta icon="check" /> : ""}
              </ListItem>
              <ListItem onClick={() => this.props.changeTheme("dark")} className="dark">
                <ListItemGraphic
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px">
                        <path d="M24 0H0v24h24V0z" fill="none" />
                        <path
                          d="M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76V5.1L7.76 9.35C6.62 10.48 6 11.99 6 13.59z"
                          opacity=".3"
                        />
                        <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                      </svg>
                    ),
                  }}
                />
                Dark
                {this.props.theme === "dark" ? <ListItemMeta icon="check" /> : ""}
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
