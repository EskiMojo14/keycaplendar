import React from 'react';
import { Link } from 'react-router-dom';
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
                    <Link className="link" to="/privacy">Privacy Policy</Link>
                    <Link className="link" to="/terms">Terms of Service</Link>
                </Typography>
                <Typography use="body2" tag="p">
                    Something to add/adjust? Contact me via&nbsp;
                    <Tooltip align="top" content="eskimojo#0014" showArrow><span className="bold">Discord</span></Tooltip>
                    &nbsp;or&nbsp;
                    <Tooltip align="top" content="keycaplendar@gmail.com" showArrow><a href="mailto:keycaplendar@gmail.com?subject=KeycapLendar%20Change" target="_blank" rel="noopener noreferrer" className="bold">Email</a></Tooltip>
                    . Please note that for your IC to be included, it needs a render of the keyset on a board (not rendered by keycaprenders.com).
                </Typography>
            </div>
        )
    }
}

export default Footer;