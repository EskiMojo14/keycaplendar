import React from 'react';
import firebase from "./firebase";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { DataTable, DataTableContent, DataTableHead, DataTableRow, DataTableHeadCell, DataTableBody, DataTableCell } from '@rmwc/data-table';
import { Checkbox } from '@rmwc/checkbox';
import { IconButton } from '@rmwc/icon-button';
import { LinearProgress } from '@rmwc/linear-progress';
import './Users.scss';

export class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: false
        }
    }
    componentDidMount() {
        //const grantRoleFn = firebase.functions().httpsCallable('grantRole');
        //grantRoleFn({email: 'ben.j.durrant@gmail.com', role: 'editor'}).then((result) => console.log(result.data));
        this.setState({ loading: true })
        const listUsersFn = firebase.functions().httpsCallable('listUsers');
        listUsersFn().then((result) => {
            if (result) {
                if (result.data.error) {
                    console.log(result.data.error);
                    this.setState({
                        loading: false
                    });
                } else {
                    this.setState({
                      loading: false
                    });
                    console.log(result.data);
                    setTimeout(() => {this.setState({
                        users: result.data,
                        loading: false
                    });}, 150);
                }
            }
        }).catch((error) => {
            console.log('Error listing users: ' + error);
            this.setState({
                loading: false
            });
        });
    }
    render() {
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
                                    <DataTableHeadCell>Delete</DataTableHeadCell>
                                </DataTableRow>
                            </DataTableHead>
                            <DataTableBody>
                                {
                                    this.state.users.map((user, index) => {
                                        return (
                                            <DataTableRow key={index}>
                                                <DataTableCell className="user-cell">
                                                    <div className="user">
                                                        <div className="avatar" style={{ backgroundImage: 'url(' + user.photoURL + ')' }} />
                                                        {user.displayName}
                                                    </div>
                                                </DataTableCell>
                                                <DataTableCell>{user.email}</DataTableCell>
                                                <DataTableCell className="checkbox-cell">
                                                    <Checkbox checked={user.editor} />
                                                </DataTableCell>
                                                <DataTableCell className="checkbox-cell">
                                                    <Checkbox checked={user.admin} />
                                                </DataTableCell>
                                                <DataTableCell className="icon-cell">
                                                    <IconButton icon="delete" />
                                                </DataTableCell>
                                            </DataTableRow>
                                        );
                                    })
                                }
                            </DataTableBody>
                        </DataTableContent>
                        <LinearProgress className={this.state.loading ? 'visible' : ''}/>
                    </DataTable>
                </div>
            </div>
        );
    }
}
export default Users;