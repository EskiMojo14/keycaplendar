import React from 'react';
import { Grid, GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import { ViewCard } from './ViewCard';

import './ContentGrid.scss';

export class ContentGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = { view: this.props.view };
    }
    render() {
        const vendors = ['NovelKeys', 'NovelKeys', 'NovelKeys','NovelKeys', 'NovelKeys', 'NovelKeys']
        const katLich = {
            profile: 'KAT', 
            colourway: 'Lich', 
            icDate: '2019-10-31', 
            ghThread: 'https://geekhack.org/index.php?topic=104129.0', 
            image: 'https://i.imgur.com/x0EkNCQ.jpg', 
            gbLaunch: '2020-01-07', 
            gbEnd: '2020-01-31',
            vendor: 'NovelKeys',
            storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
        };
        const sets = [katLich,katLich,katLich]
        const backgroundClass = (this.state.view === 'list' ? 'list-grid' : '');
        let view;
        view = <ViewCard sets={sets} />

        return (
            <Grid className={backgroundClass}>
                {vendors.map((value, index) => {
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