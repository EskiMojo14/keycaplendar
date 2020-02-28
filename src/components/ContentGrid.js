import React from 'react';
import { Grid, GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import { ViewCard } from './ViewCard';
import { ViewList } from './ViewList';
import { ViewImageList } from './ViewImageList';

import './ContentGrid.scss';

export class ContentGrid extends React.Component {
    render() {
        const backgroundClass = (this.props.view === 'list' ? 'list-grid' : '');
        let view;
        if (this.props.view === 'card') {
            view = <ViewCard sets={this.props.sets} admin={this.props.admin} edit={this.props.edit} />;
        } else if (this.props.view === 'list') {
            view = <ViewList sets={this.props.sets} admin={this.props.admin} edit={this.props.edit} />;
        } else if (this.props.view === 'imageList') {
            view = <ViewImageList sets={this.props.sets} admin={this.props.admin} edit={this.props.edit} />;
        }
        return (
            <Grid className={backgroundClass}>
                {this.props.vendors.map((value, index) => {
                    return (
                        <GridCell className="outer-container" desktop={6} tablet={8} phone={4} key={index}>
                            <div className="subheader">
                                <Typography use="subtitle2" theme="textSecondaryOnBackground" key={index}>{value}</Typography>
                            </div>
                            {view}
                        </GridCell>
                    )
                })}
            </Grid>
        );
    }
}
export default ContentGrid;