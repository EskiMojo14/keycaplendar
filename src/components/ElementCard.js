import React from 'react';
import { GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import { Card, CardPrimaryAction, CardActions, CardActionButtons, CardActionButton, CardMedia } from '@rmwc/card';

import './ElementCard.scss';

export class ElementCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {expanded: false};
    }
    toggleExpand = () => {
        this.setState(prevState => ({ expanded: !prevState.expanded}))
    }
    render() {
        return (
            <GridCell desktop={6} tablet={4} phone={4}>
                <Card>
                    <CardPrimaryAction onClick={this.toggleExpand}>
                        <div className="text-container">
                            <Typography use="headline5" tag="h2">{this.props.title}</Typography>
                            <Typography use="subtitle2" tag="p" theme="textSecondaryOnBackground">{this.props.subtitle}</Typography>
                        </div>
                        <CardMedia sixteenByNine style={{ backgroundImage: 'url(' + this.props.image + ')' }} />
                    </CardPrimaryAction>
                    <div className={`expand-actions ${this.state.expanded ? "expanded" : ""}`}>
                        <CardActions>
                            <CardActionButtons>
                                <a href={this.props.geekhack} target="_blank" rel="noopener noreferrer"><CardActionButton>Geekhack</CardActionButton></a>
                                <a href={this.props.store} target="_blank" rel="noopener noreferrer"><CardActionButton>Store</CardActionButton></a>
                            </CardActionButtons>
                        </CardActions>
                    </div>
                </Card>
            </GridCell>
        )
    }
}

export default ElementCard;