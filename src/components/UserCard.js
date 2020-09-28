import React from "react";
import firebase from "./firebase";
import { Checkbox } from "@rmwc/checkbox";
import { CircularProgress } from "@rmwc/circular-progress";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { Ripple } from "@rmwc/ripple";
import { TextField } from "@rmwc/textfield";
import { Avatar } from "@rmwc/avatar";
import { Autocomplete } from "./common/Autocomplete";
import { Card, CardActions } from "@rmwc/card";
import {
  CollapsibleList,
  ListItem,
  ListItemMeta,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
} from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import { FormField } from "@rmwc/formfield";

export class UserCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        nickname: "",
        designer: false,
        editor: false,
        admin: false,
      },
      edited: false,
      loading: false,
      focused: "",
    };
  }
  componentDidMount() {
    this.setState({ user: this.props.user });
  }
  componentDidUpdate() {
    if (this.props.user !== this.state.user) {
      this.setState({ user: this.props.user, edited: false });
    }
  }
  handleChange = (e) => {
    const newUser = this.state.user;
    newUser[e.target.name] = e.target.checked;
    if (e.target.name === "admin" && e.target.checked) {
      newUser.editor = true;
    }
    this.setState({
      user: newUser,
      edited: true,
    });
  };
  handleFocus = (e) => {
    this.setState({
      focused: e.target.name,
    });
  };
  handleBlur = () => {
    this.setState({
      focused: "",
    });
  };
  handleTextChange = (e) => {
    const newUser = this.state.user;
    newUser[e.target.name] = e.target.value;
    this.setState({
      user: newUser,
      edited: true,
    });
  };
  selectValue = (prop, value) => {
    const newUser = this.state.user;
    newUser[prop] = value;
    this.setState({
      user: newUser,
      edited: true,
    });
  };
  setRoles = () => {
    this.setState({ loading: true });
    const setRolesFn = firebase.functions().httpsCallable("setRoles");
    setRolesFn({
      email: this.state.user.email,
      nickname: this.state.user.nickname,
      designer: this.state.user.designer,
      editor: this.state.user.editor,
      admin: this.state.user.admin,
    }).then((result) => {
      this.setState({ loading: false });
      if (result.editor === this.state.editor && result.admin === this.state.admin) {
        this.props.snackbarQueue.notify({ title: "Successfully edited user permissions." });
        this.props.getUsers();
      } else if (result.error) {
        this.props.snackbarQueue.notify({ title: "Failed to edit user permissions: " + result.error });
      } else {
        this.props.snackbarQueue.notify({ title: "Failed to edit user permissions." });
      }
    });
  };
  render() {
    const user = this.state.user;
    const roles = ["designer", "editor", "admin"];
    const saveButton = this.state.loading ? (
      <CircularProgress />
    ) : (
      <Ripple unbounded disabled={!this.state.edited}>
        <div
          tabIndex="0"
          className={
            "svg-container mdc-card__action mdc-card__action--icon mdc-icon-button" +
            (this.state.edited ? "" : " disabled")
          }
          onClick={() => {
            if (this.state.edited) {
              this.setRoles();
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M5 5v14h14V7.83L16.17 5H5zm7 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-8H6V6h9v4z"
              opacity=".3"
            />
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z" />
          </svg>
        </div>
      </Ripple>
    );
    const deleteButton =
      user.email === this.props.currentUser.email || user.email === "ben.j.durrant@gmail.com" ? (
        ""
      ) : (
        <Ripple unbounded>
          <div
            tabIndex="0"
            className="svg-container mdc-card__action mdc-card__action--icon mdc-icon-button"
            onClick={() => {
              this.props.delete(user);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M8 9h8v10H8z" opacity=".3" />
              <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
            </svg>
          </div>
        </Ripple>
      );
    return (
      <Card className="user">
        <CollapsibleList
          handle={
            <ListItem>
              <Avatar src={user.photoURL} className="mdc-list-item__graphic" size="xlarge" />
              <ListItemText>
                <div className="overline">{user.nickname}</div>
                <ListItemPrimaryText>{user.displayName}</ListItemPrimaryText>
                <ListItemSecondaryText>{user.email}</ListItemSecondaryText>
              </ListItemText>
              <ListItemMeta icon="expand_more" />
            </ListItem>
          }
        >
          <div className="text-field-container">
            <MenuSurfaceAnchor>
              <TextField
                outlined
                label="Nickname"
                className="nickname"
                name="nickname"
                onChange={this.handleTextChange}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                value={this.state.user.nickname}
              />
              <Autocomplete
                open={this.state.focused === "nickname"}
                array={this.props.allDesigners}
                query={this.state.user.nickname}
                prop="nickname"
                select={this.selectValue}
                minChars={2}
              />
            </MenuSurfaceAnchor>
          </div>
          <div className="roles-form">
            <div className="subheader">
              <Typography use="caption">Roles</Typography>
            </div>
            <div className="checkbox-group">
              {roles.map((role) => {
                return (
                  <FormField key={role}>
                    <Checkbox
                      label={role.charAt(0).toUpperCase() + role.slice(1)}
                      checked={user[role]}
                      name={role}
                      onClick={this.handleChange}
                      disabled={(user.email === this.props.currentUser.email || user.email === "ben.j.durrant@gmail.com") && role !== "designer" }
                    />
                  </FormField>
                );
              })}
            </div>
          </div>
        </CollapsibleList>
        <CardActions>
          {saveButton}
          {deleteButton}
        </CardActions>
      </Card>
    );
  }
}

export default UserCard;
