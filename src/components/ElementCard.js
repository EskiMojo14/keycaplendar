import React from "react";
import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import { Typography } from "@rmwc/typography";
import { Card, CardMedia, CardPrimaryAction, CardActions, CardActionIcons, CardActionIcon } from "@rmwc/card";
import "./ElementCard.scss";

export class ElementCard extends React.Component {
  render() {
    const liveIndicator =
      this.props.live && this.props.page !== "live" ? (
        <div className="live-indicator">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M18.49 9.89l.26-2.79-2.74-.62-1.43-2.41L12 5.18 9.42 4.07 7.99 6.48l-2.74.62.26 2.78L3.66 12l1.85 2.11-.26 2.8 2.74.62 1.43 2.41L12 18.82l2.58 1.11 1.43-2.41 2.74-.62-.26-2.79L20.34 12l-1.85-2.11zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"
              opacity=".3"
            />
            <path d="M20.9 5.54l-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12l-2.44-2.78.34-3.68zM18.75 16.9l-2.74.62-1.43 2.41L12 18.82l-2.58 1.11-1.43-2.41-2.74-.62.26-2.8L3.66 12l1.85-2.12-.26-2.78 2.74-.61 1.43-2.41L12 5.18l2.58-1.11 1.43 2.41 2.74.62-.26 2.79L20.34 12l-1.85 2.11.26 2.79zM11 15h2v2h-2zm0-8h2v6h-2z" />
          </svg>
        </div>
      ) : (
        ""
      );
    const timeIndicator = this.props.thisWeek ? (
      <Typography use="overline" tag="h4" className="time-indicator">
        {this.props.daysLeft} day{this.props.daysLeft > 1 ? "s" : ""}
      </Typography>
    ) : (
      ""
    );
    return (
      <div className="card-container">
        <Card className={this.props.selected ? "mdc-card--selected" : ""}>
          <CardActions className="hover-button">
            <CardActionIcons>
              <CardActionIcon
                icon="open_in_new"
                tag="a"
                href={this.props.link}
                target="_blank"
                rel="noopener noreferrer"
                label={"Link to " + this.props.title}
              />
            </CardActionIcons>
          </CardActions>
          <CardPrimaryAction
            className={this.props.selected ? "mdc-card__primary-action--selected" : ""}
            onClick={() => (!this.props.selected ? this.props.details(this.props.set) : this.props.closeDetails())}
          >
            <div className="media-container">
              <LazyLoad debounce={false} offsetVertical={480} className="lazy-load">
                <CardMedia sixteenByNine style={{ backgroundImage: "url(" + this.props.image + ")" }} />
              </LazyLoad>
              {timeIndicator}
            </div>
            <div className="text-row" onClick={this.toggleExpand}>
              <div className="text-container">
                <div className="overline">
                  <Typography use="overline" tag="h3">
                    {this.props.designer}
                  </Typography>
                  {liveIndicator}
                </div>
                <div className="title">
                  <Typography use="headline5" tag="h2">
                    <Twemoji options={{ className: "twemoji" }}>{this.props.title}</Twemoji>
                  </Typography>
                </div>
                <Typography use="subtitle2" tag="p">
                  {this.props.subtitle}
                </Typography>
              </div>
            </div>
          </CardPrimaryAction>
        </Card>
      </div>
    );
  }
}

export default ElementCard;
