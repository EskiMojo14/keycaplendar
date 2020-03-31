import React from 'react';
import firebase from "./firebase";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { DataTable, DataTableContent, DataTableHead, DataTableRow, DataTableHeadCell, DataTableBody } from '@rmwc/data-table';
import { IconButton } from '@rmwc/icon-button';
import { CircularProgress } from '@rmwc/circular-progress';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import { UserRow } from './UserRow';
import './Users.scss';
export class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            deleteDialogOpen: false,
            deletedUser: { displayName: '' },
            loading: false
        }
    }
    getUsers = () => {
        this.setState({ loading: true })
        const listUsersFn = firebase.functions().httpsCallable('listUsers');
        listUsersFn().then((result) => {
            if (result) {
                if (result.data.error) {
                    this.props.snackbarQueue.notify({ title: result.data.error });
                    this.setState({
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                    result.data.sort((a, b) => {
                        const x = a.email.toLowerCase();
                        const y = b.email.toLowerCase();
                        if (x < y) { return -1; }
                        if (x > y) { return 1; }
                        return 0;
                    })
                    setTimeout(() => {
                        this.setState({
                            users: result.data,
                            loading: false
                        });
                    }, 150);
                }
            }
        }).catch((error) => {
            this.props.snackbarQueue.notify({ title: 'Error listing users: ' + error });
            this.setState({
                loading: false
            });
        });
    }
    openDeleteDialog = (user) => {
        this.setState({
            deleteDialogOpen: true,
            deletedUser: user
        });
    }
    closeDeleteDialog = () => {
        this.setState({
            deleteDialogOpen: false
        });
        setTimeout(() => {
            this.setState({
                deletedUser: { displayName: '' }
            })
        }, 75);
    }
    deleteUser = (user) => {
        this.closeDeleteDialog();
        this.setState({ loading: true })
        const deleteUser = firebase.functions().httpsCallable('deleteUser');
        deleteUser(user).then((result) => {
            if (result.data.error) {
                this.props.snackbarQueue.notify({ title: result.data.error });
                this.setState({
                    loading: false
                });
            } else {
                this.props.snackbarQueue.notify({ title: 'User ' + user.displayName + ' successfully deleted.' });
                this.getUsers();
            }
        }).catch((error) => {
            this.props.snackbarQueue.notify({ title: 'Error deleting user: ' + error });
            this.setState({
                loading: false
            });
        });
    }
    componentDidMount() {
        this.getUsers();
    }
    render() {
        const refreshButton = (this.state.loading ? (<CircularProgress />) : (<IconButton icon="refresh" onClick={this.getUsers}/>))
        return (
            <div>
                <TopAppBar>
                    <TopAppBarRow>
                        <TopAppBarSection>
                            <TopAppBarTitle>Users</TopAppBarTitle>
                        </TopAppBarSection>
                    </TopAppBarRow>
                </TopAppBar>
                <TopAppBarFixedAdjust />
                <div className="users-container">
                    <DataTable>
                        <DataTableContent>
                            <DataTableHead>
                                <DataTableRow>
                                    <DataTableHeadCell>User</DataTableHeadCell>
                                    <DataTableHeadCell>Email</DataTableHeadCell>
                                    <DataTableHeadCell>Editor</DataTableHeadCell>
                                    <DataTableHeadCell>Admin</DataTableHeadCell>
                                    <DataTableHeadCell>Save</DataTableHeadCell>
                                    <DataTableHeadCell>Delete</DataTableHeadCell>
                                    <DataTableHeadCell className="icon-cell">
                                        {refreshButton}
                                    </DataTableHeadCell>
                                </DataTableRow>
                            </DataTableHead>
                            <DataTableBody>
                                {
                                    this.state.users.map((user, index) => {
                                        return (
                                            <UserRow user={user} currentUser={this.props.user} delete={this.openDeleteDialog} getUsers={this.getUsers} snackbarQueue={this.props.snackbarQueue} key={index} />
                                        );
                                    })
                                }
                            </DataTableBody>
                        </DataTableContent>
                    </DataTable>
                </div>
                <Dialog open={this.state.deleteDialogOpen}>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete the user {this.state.deletedUser.displayName}?
                    </DialogContent>
                    <DialogActions>
                        <DialogButton action="close" onClick={this.closeDeleteDialog} isDefaultAction>Cancel</DialogButton>
                        <DialogButton action="accept" className="delete" onClick={() => this.deleteUser(this.state.deletedUser)}>Delete</DialogButton>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
export default Users;