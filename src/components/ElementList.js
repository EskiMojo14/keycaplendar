import React from 'react';
import { ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from '@rmwc/list';

import './ElementList.scss';

export class ElementList extends React.Component {
    render() {
        return (
            <ListItem tag="a" href={this.props.geekhack} target="_blank" rel="noopener noreferrer">
                <div className="list-image" style={{backgroundImage: 'url(' + this.props.image + ')'}}>
                </div>   
                <ListItemText>
                    <ListItemPrimaryText>{this.props.title}</ListItemPrimaryText>
                    <ListItemSecondaryText>{this.props.subtitle}</ListItemSecondaryText>
                </ListItemText>
                <ListItemMeta icon="launch" />
            </ListItem>
        )
    }
}

export default ElementList;