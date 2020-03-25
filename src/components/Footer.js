import React from 'react';
import { Typography } from '@rmwc/typography';
import { Tooltip } from '@rmwc/tooltip';
import './Footer.scss';

export class Footer extends React.Component {
    render() {
        return (
            <div className='footer'>
                <Typography use="body2" tag="p">
                    Site created by&nbsp;
                    <Tooltip align="top" content="eskimojo" showArrow><span className="bold">Ben Durrant</span></Tooltip>
                    , inspired by the spreadsheet created by&nbsp;
                    <Tooltip align="top" content="Langelandia" showArrow><span className="bold">Jeff Langeland</span></Tooltip>
                    .
                </Typography>
                <Typography use="body2" tag="p">
                    Something to add/adjust? Contact me via&nbsp;
                    <Tooltip align="top" content="eskimojo#0014" showArrow><span className="bold">Discord</span></Tooltip>
                    &nbsp;or&nbsp;
                    <Tooltip align="top" content="keycaplendar@gmail.com" showArrow><a href="mailto:keycaplendar@gmail.com?subject=KeycapLendar%20Change" target="_blank" rel="noopener noreferrer" className="bold">Email</a></Tooltip>
                    .
                </Typography>
            </div>
        )
    }
}

export default Footer;