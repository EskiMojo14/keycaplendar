import React from 'react';
import { ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from '@rmwc/list';
import { Ripple } from '@rmwc/ripple';
import { Tooltip } from '@rmwc/tooltip';

import './ElementList.scss';

export class ElementList extends React.Component {
    render() {
        const editIcon = (this.props.admin ? (
            <Tooltip content="Edit" align="bottom">
                <div className="edit-icon" onClick={() => this.props.edit(this.props.set)}>
                    <Ripple unbounded>
                        <div className='svg-container'>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" /><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" /></svg>
                        </div>
                    </Ripple>
                </div>
            </Tooltip>
        ) : '');
        return (
            <div className="list-item-container">
                <ListItem tag="a" href={this.props.details} target="_blank" rel="noopener noreferrer">
                    <div className="list-image" style={{ backgroundImage: 'url(' + this.props.image + ')' }}>
                    </div>
                    <ListItemText>
                        <ListItemPrimaryText>{this.props.title}</ListItemPrimaryText>
                        <ListItemSecondaryText>{this.props.subtitle}</ListItemSecondaryText>
                    </ListItemText>
                    <div className="icons">
                        <div className="time-indicator">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12.07 6.01c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm1 8h-2v-6h2v6z" opacity=".3" /><path d="M9.07 1.01h6v2h-6zm2 7h2v6h-2zm8.03-.62l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.14 4.74 14.19 4 12.07 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.11-.74-4.07-1.97-5.61zm-7.03 12.62c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" /></svg>
                        </div>
                        <ListItemMeta icon="launch" />
                    </div>
                </ListItem>
                {editIcon}
            </div>
        )
    }
}

export default ElementList;