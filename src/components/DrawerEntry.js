import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { TextField } from '@rmwc/textfield';
import { Button } from '@rmwc/button';
import { Select } from '@rmwc/select';
import './DrawerEntry.scss';

export class DrawerCreate extends React.Component {
    render() {
        return (
            <Drawer modal open={this.props.open} onClose={this.props.close} className="entry-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Create Entry</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                    <div className="form">
                        <div className="form-double">
                            <Select className="select" label="Profile" outlined enhanced required options={['KAT']}/>
                            <TextField className="field" outlined required label="Colourway" />
                        </div>
                        <TextField icon={{icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon="link" outlined label="Geekhack/IC" required pattern="https?://.+"/>
                        <TextField icon="link" outlined label="Image" required pattern="https?://.+" helpText={{ persistent: true, validationMsg: true, children: 'Must be direct link' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>           
                        <TextField outlined label="Vendor" />
                        <TextField icon="link" outlined label="Store link" pattern="https?://.+"/>
                    </div>
                </DrawerContent>
                <div className="drawer-footer">
                    <Button label="Save" onClick={this.props.close}/>
                </div>
            </Drawer>
        );
    }
};

export class DrawerEdit extends React.Component {
    render() {
        return (
            <Drawer modal open={this.props.open} onClose={this.props.close} className="entry-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Edit Entry</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                    <div className="form">
                        <div className="form-double">
                            <Select className="select" label="Profile" outlined enhanced required options={['KAT']}/>
                            <TextField className="field" outlined required label="Colourway" />
                        </div>
                        <TextField icon={{icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon="link" outlined label="Geekhack/IC" required pattern="https?://.+"/>
                        <TextField icon="link" outlined label="Image" required pattern="https?://.+" helpText={{ persistent: true, validationMsg: true, children: 'Must be direct link' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>           
                        <TextField outlined label="Vendor" />
                        <TextField icon="link" outlined label="Store link" pattern="https?://.+"/>
                    </div>
                </DrawerContent>
                <div className="drawer-footer">
                    <Button label="Save" onClick={this.props.close}/>
                </div>
            </Drawer>
        );
    }
};

export default DrawerCreate;