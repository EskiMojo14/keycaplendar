import React from "react";
import PropTypes from "prop-types";
import Twemoji from "react-twemoji";
import { userTypes, setTypes } from "../util/propTypeTemplates";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import "./DrawerDetails.scss";

export class DrawerDetails extends React.Component {
  setScroll() {
    const chipSet = document.getElementById("search-chip-set");
    if (chipSet.querySelector(".mdc-chip--selected")) {
      const selectedChip = chipSet.querySelector(".mdc-chip-set .mdc-chip--selected");
      chipSet.scrollLeft = selectedChip.offsetLeft - 24;
    } else {
      chipSet.scrollLeft = 0;
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.search !== prevProps.search || this.props.set !== prevProps.set) {
      this.setScroll();
    }
    if (this.props.set !== prevProps.set) {
      document.querySelector(".details-drawer .mdc-drawer__content").scrollTop = 0;
    }
  }
  render() {
    const dismissible = this.props.device === "desktop" && this.props.view !== "compact";
    let set = this.props.set;
    if (!set.image) {
      set.image = "";
    }
    const today = new Date();
    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const nth = function (d) {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    let gbLaunch;
    let gbEnd;
    let icDate;
    let verb;
    let ic;
    let gb;
    let shippedLine;
    let chips = [];
    const chipsContent = ["profile", "colorway", "designer", "vendors"];
    let sortedVendors = set.vendors
      ? set.vendors.sort((a, b) => {
          var regionA = a.region.toLowerCase();
          var regionB = b.region.toLowerCase();
          if (regionA < regionB) {
            return -1;
          }
          if (regionA > regionB) {
            return 1;
          }
          return 0;
        })
      : [];

    if (set.icDate) {
      gbLaunch = set.gbLaunch.includes("Q") ? set.gbLaunch : new Date(set.gbLaunch);
      gbEnd = new Date(set.gbEnd);
      icDate = new Date(set.icDate);
      ic = `IC posted ${icDate.getUTCDate() + nth(icDate.getUTCDate())}\xa0${
        month[icDate.getUTCMonth()] +
        (icDate.getUTCFullYear() !== today.getUTCFullYear() ? ` ${icDate.getUTCFullYear()}` : "")
      }.`;
      if (gbLaunch <= today && gbEnd >= today) {
        verb = "Running";
      } else if (gbEnd <= today) {
        verb = "Ran";
      } else if (gbLaunch > today) {
        verb = "Will run";
      } else {
        verb = "Runs";
      }
      if (set.gbLaunch !== "" && set.gbEnd) {
        gb = `${verb} from ${gbLaunch.getUTCDate() + nth(gbLaunch.getUTCDate())}\xa0${
          month[gbLaunch.getUTCMonth()] +
          (gbLaunch.getUTCFullYear() !== today.getUTCFullYear() && gbLaunch.getUTCFullYear() !== gbEnd.getUTCFullYear()
            ? ` ${gbLaunch.getUTCFullYear()}`
            : "")
        } until ${gbEnd.getUTCDate() + nth(gbEnd.getUTCDate())}\xa0${
          month[gbEnd.getUTCMonth()] +
          (gbEnd.getUTCFullYear() !== today.getUTCFullYear() ? ` ${gbEnd.getUTCFullYear()}` : "")
        }.`;
      } else if (set.gbLaunch.includes("Q")) {
        gb = "GB expected " + gbLaunch + ".";
      } else if (set.gbMonth && set.gbLaunch !== "") {
        gb = "Expected " + month[gbLaunch.getUTCMonth()] + ".";
      } else if (set.gbLaunch !== "") {
        gb = `${verb} from ${gbLaunch.getUTCDate() + nth(gbLaunch.getUTCDate())}\xa0${
          month[gbLaunch.getUTCMonth()] +
          (gbLaunch.getUTCFullYear() !== today.getUTCFullYear() && gbLaunch.getUTCFullYear() !== gbEnd.getUTCFullYear()
            ? ` ${gbLaunch.getUTCFullYear()}`
            : "")
        }.`;
      } else {
        gb = false;
      }
      chipsContent.forEach((prop) => {
        if (prop === "vendors") {
          sortedVendors.forEach((vendor) => {
            chips.push(vendor.name);
          });
        } else {
          if (!Array.isArray(set[prop])) {
            chips.push(set[prop]);
          } else {
            set[prop].forEach((entry) => {
              chips.push(entry);
            });
          }
        }
      });
      shippedLine =
        gbEnd <= today ? (
          this.props.set.shipped ? (
            <Typography use="body2" tag="p">
              This set has shipped.
            </Typography>
          ) : (
            <Typography use="body2" tag="p">
              This set has not shipped.
            </Typography>
          )
        ) : null;
    }
    const gbLine = gb ? (
      <Typography use="body2" tag="p">
        {gb}
      </Typography>
    ) : null;
    const vendorList =
      set.vendors && set.vendors.length > 0 ? (
        <div className="details-list">
          <Typography className="subheader" use="caption" tag="h4">
            Vendors
          </Typography>
          <List twoLine>
            {sortedVendors.map((vendor) => {
              return vendor.storeLink !== "" ? (
                <a key={vendor.name} href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                  <ListItem>
                    <ListItemText>
                      <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                      <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                    </ListItemText>
                    <ListItemMeta icon="launch" />
                  </ListItem>
                </a>
              ) : (
                <ListItem key={vendor.name} disabled>
                  <ListItemText>
                    <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                    <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        </div>
      ) : null;
    const editorButtons =
      this.props.user.isEditor ||
      (this.props.user.isDesigner && set.designer && set.designer.includes(this.props.user.nickname)) ? (
        <div className="editor-buttons">
          <Button
            className="edit"
            outlined
            label="Edit"
            onClick={() => this.props.edit(set)}
            icon={{
              strategy: "component",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
                  <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
                </svg>
              ),
            }}
          />
          {this.props.user.isEditor ? (
            <Button
              className="delete"
              outlined
              danger
              label="Delete"
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M8 9h8v10H8z" opacity=".3" />
                    <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
                  </svg>
                ),
              }}
              onClick={() => this.props.delete(this.props.set)}
            />
          ) : null}
        </div>
      ) : null;
    const lichButton =
      this.props.set.colorway === "Lich" ? (
        <IconButton
          onClick={this.props.toggleLichTheme}
          icon={{
            strategy: "component",
            icon: (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10s1.5.67 1.5 1.5S7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm4.5 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"
                    opacity=".3"
                  />
                  <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm4 13h-1.77c-1.38 0-2.5 1.12-2.5 2.5 0 .61.22 1.19.63 1.65.06.07.14.19.14.35 0 .28-.22.5-.5.5-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.14 8 7c0 2.21-1.79 4-4 4z" />
                  <circle cx="6.5" cy="11.5" r="1.5" />
                  <circle cx="9.5" cy="7.5" r="1.5" />
                  <circle cx="14.5" cy="7.5" r="1.5" />
                  <circle cx="17.5" cy="11.5" r="1.5" />
                </svg>
              </div>
            ),
          }}
        />
      ) : null;
    const closeIcon = dismissible ? (
      <Tooltip enterDelay={500} content="Close" align="bottom">
        <IconButton className="close-icon" icon="close" onClick={this.props.close} />
      </Tooltip>
    ) : null;
    const salesButton = this.props.set.sales ? (
      <Button outlined label="Sales" icon="bar_chart" onClick={() => this.props.openSales(set)} />
    ) : null;
    return (
      <Drawer
        dismissible={dismissible}
        modal={!dismissible}
        open={this.props.open}
        onClose={this.props.close}
        className="details-drawer drawer-right"
      >
        <DrawerHeader>
          <DrawerTitle>Details</DrawerTitle>
          {lichButton}
          {closeIcon}
        </DrawerHeader>
        <DrawerContent>
          <div>
            <div
              className="details-image"
              style={{ backgroundImage: "url(" + set.image.replace("keysets", "card") + ")" }}
            ></div>
            <div className="details-text">
              <Typography use="overline" tag="h3">
                Designed by {set.designer ? set.designer.join(" + ") : ""}
              </Typography>
              <Typography use="headline4" tag="h1">
                <Twemoji options={{ className: "twemoji" }}>
                  {`${set.profile ? set.profile : ""} ${set.colorway ? set.colorway : ""}`}
                </Twemoji>
              </Typography>
              {gbLine}
              {shippedLine}
              <Typography use="body2" tag="p">
                {ic}
              </Typography>
            </div>
            <div className="details-button">
              <Button
                outlined
                label="Link"
                icon="launch"
                tag="a"
                href={set.details}
                target="_blank"
                rel="noopener noreferrer"
              />
              {salesButton}
            </div>
            {vendorList}
          </div>
        </DrawerContent>
        {editorButtons}
        <div className="search-chips-container">
          <div className="search-chips">
            <ChipSet id="search-chip-set" choice>
              {chips.map((value, index) => {
                return (
                  <Chip
                    icon="search"
                    label={value}
                    key={value.toLowerCase() + index}
                    selected={this.props.search.toLowerCase() === value.toLowerCase()}
                    onClick={() => {
                      this.props.setSearch(value);
                      if (!dismissible) {
                        this.props.close();
                      }
                    }}
                  />
                );
              })}
            </ChipSet>
          </div>
        </div>
      </Drawer>
    );
  }
}

export default DrawerDetails;

DrawerDetails.propTypes = {
  close: PropTypes.func,
  delete: PropTypes.func,
  device: PropTypes.string,
  edit: PropTypes.func,
  open: PropTypes.bool,
  openSales: PropTypes.func,
  search: PropTypes.string,
  set: PropTypes.shape(setTypes()),
  setSearch: PropTypes.func,
  toggleLichTheme: PropTypes.func,
  user: PropTypes.shape(userTypes),
  view: PropTypes.string,
};
