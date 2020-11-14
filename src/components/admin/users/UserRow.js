import React from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { userTypes } from "../../util/propTypeTemplates";
import { Avatar } from "@rmwc/avatar";
import { Checkbox } from "@rmwc/checkbox";
import { CircularProgress } from "@rmwc/circular-progress";
import { DataTableRow, DataTableCell } from "@rmwc/data-table";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { Autocomplete } from "../../util/Autocomplete";

export class UserRow extends React.Component {
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
    const saveButton = this.state.loading ? (
      <CircularProgress />
    ) : (
      <IconButton
        onClick={() => {
          if (this.state.edited) {
            this.setRoles();
          }
        }}
        icon={{
          strategy: "component",
          icon: (
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
          ),
        }}
        disabled={!this.state.edited}
      />
    );
    const deleteButton =
      user.email === this.props.currentUser.email || user.email === "ben.j.durrant@gmail.com" ? null : (
        <IconButton
          onClick={() => {
            this.props.delete(user);
          }}
          icon={{
            strategy: "component",
            icon: (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M8 9h8v10H8z" opacity=".3" />
                  <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
                </svg>
              </div>
            ),
          }}
        />
      );
    return (
      <DataTableRow>
        <DataTableCell>
          <Avatar src={user.photoURL} name={user.displayName} size="large" />
        </DataTableCell>
        <DataTableCell>{user.displayName}</DataTableCell>
        <DataTableCell>{user.email}</DataTableCell>
        <DataTableCell>
          <MenuSurfaceAnchor>
            <TextField
              outlined
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
        </DataTableCell>
        <DataTableCell hasFormControl>
          <Checkbox name="designer" checked={user.designer} onChange={this.handleChange} />
        </DataTableCell>
        <DataTableCell hasFormControl>
          <Checkbox
            name="editor"
            checked={user.editor}
            onChange={this.handleChange}
            disabled={user.email === this.props.currentUser.email || user.email === "ben.j.durrant@gmail.com"}
          />
        </DataTableCell>
        <DataTableCell hasFormControl>
          <Checkbox
            name="admin"
            checked={user.admin}
            onChange={this.handleChange}
            disabled={user.email === this.props.currentUser.email || user.email === "ben.j.durrant@gmail.com"}
          />
        </DataTableCell>
        <DataTableCell hasFormControl>{saveButton}</DataTableCell>
        <DataTableCell hasFormControl>{deleteButton}</DataTableCell>
      </DataTableRow>
    );
  }
}

export default UserRow;

UserRow.propType = {
  allDesigner: PropTypes.arrayOf(PropTypes.string),
  currentuser: PropTypes.shape(userTypes),
  delete: PropTypes.func,
  getUsers: PropTypes.func,
  snackbarQueue: PropTypes.object,
  user: PropTypes.shape(userTypes),
};
