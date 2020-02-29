import React from 'react';
import emptyImg from '../empty.svg'
import { Typography } from '@rmwc/typography';
import './ContentEmpty.scss';

export class ContentEmpty extends React.Component {
    render() {
        return(
            <div className="empty-container">
                <img className="image"src={emptyImg} alt="Empty"/>
                <Typography className="title" use="headline6" tag="h3">Nothing to see here</Typography>
                <Typography className="subtitle"use="body1" tag="p">No results, check your filters.</Typography>
            </div>
        )
    }
};

export default ContentEmpty;