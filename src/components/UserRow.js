import React from 'react';
import firebase from "./firebase";
import { DataTableRow, DataTableCell } from '@rmwc/data-table';
import { Ripple } from '@rmwc/ripple';
import { Checkbox } from '@rmwc/checkbox';
import { CircularProgress } from '@rmwc/circular-progress';

export class UserRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                editor: false,
                admin: false
            },
            edited: false,
            loading: false
        }
    }
    componentDidMount() {
        this.setState({ user: this.props.user })
    }
    componentDidUpdate() {
        if (this.props.user !== this.state.user) {
            this.setState({ user: this.props.user, edited: false })
        }
    }
    handleChange = (e) => {
        const newUser = this.state.user;
        newUser[e.target.name] = e.target.checked;
        if (e.target.name === 'admin' && e.target.checked) {
            newUser.editor = true;
        }
        this.setState({ 
            user: newUser,
            edited: true
        });
    }
    setRoles = () => {
        this.setState({ loading: true });
        const setRolesFn = firebase.functions().httpsCallable('setRoles');
        setRolesFn({
            email: this.state.user.email, 
            editor: this.state.user.editor,
            admin: this.state.user.admin
        }).then((result) => {
            this.setState({ loading: false });
            if (result.editor === this.state.editor && result.admin === this.state.admin) {
                this.props.snackbarQueue.notify({ title: 'Successfully edited user permissions.'});
                this.props.getUsers();
            } else if (result.error) {
                this.props.snackbarQueue.notify({ title: 'Failed to edit user permissions: ' + result.error});
            } else {
                this.props.snackbarQueue.notify({ title: 'Failed to edit user permissions.'});
            }
        });
    }
    render() {
        const user = this.state.user;
        const editorCheckbox = (
            <Checkbox name="editor" checked={user.editor} onChange={this.handleChange} disabled={(user.email === this.props.currentUser.email || user.email === 'ben.j.durrant@gmail.com')}/>
        )
        const adminCheckbox = (
            <Checkbox name="admin" checked={user.admin} onChange={this.handleChange} disabled={(user.email === this.props.currentUser.email || user.email === 'ben.j.durrant@gmail.com')}/>
        )
        const saveButton = (this.state.loading ? (<CircularProgress />) : (user.email === this.props.currentUser.email || user.email === 'ben.j.durrant@gmail.com' ? '' : (
                    <div onClick={() => { if (this.state.edited) { this.setRoles(); }}}>
                        <Ripple unbounded disabled={!this.state.edited}>
                            <div tabIndex="0" className={"svg-container mdc-icon-button" + (this.state.edited ? '' : ' disabled')} >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 5v14h14V7.83L16.17 5H5zm7 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-8H6V6h9v4z" opacity=".3" /><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z" /></svg>
                            </div>
                        </Ripple>
                    </div>
                )));
        const deleteButton = (user.email === this.props.currentUser.email || user.email === 'ben.j.durrant@gmail.com' ? '' : (
                    <div onClick={() => { this.props.delete(user); }} >
                        <Ripple unbounded>
                            <div tabIndex="0" className="svg-container mdc-icon-button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 9h8v10H8z" opacity=".3"/><path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z"/></svg>
                            </div>
                        </Ripple>
                    </div>
                ));
        return (
            <DataTableRow>
                <DataTableCell className="user-cell">
                    <div className="user">
                        <div className="avatar" style={{ backgroundImage: 'url(' + user.photoURL + ')' }} />
                        {user.displayName}
                    </div>
                </DataTableCell>
                <DataTableCell>{user.email}</DataTableCell>
                <DataTableCell className="checkbox-cell">
                    {editorCheckbox}
                </DataTableCell>
                <DataTableCell className="checkbox-cell">
                    {adminCheckbox}
                </DataTableCell>
                <DataTableCell className="icon-cell">
                    {saveButton}
                </DataTableCell>
                <DataTableCell className="icon-cell">
                    {deleteButton}
                </DataTableCell>
                <DataTableCell>
                </DataTableCell>
            </DataTableRow>
        )
    }
}

export default UserRow;