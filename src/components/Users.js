import React from 'react';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { DataTable, DataTableContent, DataTableHead, DataTableRow, DataTableHeadCell, DataTableBody, DataTableCell } from '@rmwc/data-table';
import { Checkbox } from '@rmwc/checkbox';
import { IconButton } from '@rmwc/icon-button';
//import { Redirect } from 'react-router-dom';
import './Users.scss';

export class Users extends React.Component {
    render() {
        /*if (!this.props.admin) {
            return (
                <Redirect to="/" />
            )
        }*/
        const exampleUser = {
            email: 'ben.j.durrant@gmail.com',
            displayName: 'Ben Durrant',
            photoUrl: 'https://lh3.googleusercontent.com/a-/AOh14Gj0pbb2qlQOR6vD-YYBAyIfq21N5m1EDtJTXDT_hg',
            editor: true,
            admin: false
        };
        const exampleUsers = [exampleUser, exampleUser, exampleUser, exampleUser]
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
                                    exampleUsers.map((user, index) => {
                                        return (
                                            <DataTableRow key={index}>
                                                <DataTableCell className="user-cell">
                                                    <div className="user">
                                                        <div className="avatar" style={{ backgroundImage: 'url(' + user.photoUrl + ')'}}/>
                                                        {user.displayName}
                                                    </div>
                                                </DataTableCell>
                                                <DataTableCell>{user.email}</DataTableCell>
                                                <DataTableCell className="checkbox-cell">
                                                    <Checkbox checked={user.editor}/>
                                                </DataTableCell>
                                                <DataTableCell className="checkbox-cell">
                                                    <Checkbox checked={user.admin}/>
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
                    </DataTable>
                </div>
            </div>
        );
    }
}
export default Users;