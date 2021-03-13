import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@rmwc/card";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableHeadCell,
  DataTableCell,
} from "@rmwc/data-table";
import { Fab } from "@rmwc/fab";
import { Button } from "@rmwc/button";
import { iconObject } from "../../../util/functions";
import "./Guides.scss";

export const EntryGuide = () => {
  return (
    <>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection>
            <Link to="/">
              <TopAppBarNavigationIcon icon="arrow_back" />
            </Link>
            <TopAppBarTitle>Guide: Entries</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
      <div className="guide-container-container">
        <div className="guide-container">
          <Card className="guide">
            <Typography use="headline4" tag="h1">
              Actions
            </Typography>
            <div>
              <Typography use="headline5" tag="h2">
                Create
              </Typography>
              <Typography use="body2" tag="p">
                To create an entry, click the{" "}
                <Typography use="button" tag="span">
                  CREATE
                </Typography>{" "}
                button in the bottom right/middle of the screen.
              </Typography>
              <Typography use="body2" tag="p">
                Designers are only able to create entries with their manually set nickname.
              </Typography>
              <Typography use="body2" tag="p" className="secondary">
                Please contact Eskimojo if you wish for your nickname to be changed, or an editor via the{" "}
                <a href="https://discord.gg/zrcN3qF" target="_blank" rel="noopener noreferrer">
                  Discord server
                </a>{" "}
                if a set should have multiple designers.
              </Typography>
              <div className="demo">
                <Fab label="Create" icon="add" />
                <Fab icon="add" />
              </div>
              <Typography use="caption" tag="p" className="secondary">
                Please note that entries in KeycapLendar should have existing public ICs; ideally on Geekhack, Keebtalk,
                or Deskthority (though Reddit threads will suffice). KeycapLendar is <span className="bold">not</span> a
                place to IC, it is a tracker of ICs and GBs. There is also a minimum requirement of a render/photograph
                of the keycaps on a board. This is to ensure a consistent look across the site.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Edit
              </Typography>
              <Typography use="body2" tag="p">
                To edit an entry, select the set and click{" "}
                <Typography use="button" tag="span">
                  EDIT
                </Typography>{" "}
                in the details drawer.
              </Typography>
              <Typography use="body2" tag="p">
                Designers are only able to edit their own sets, which is verified using their manually set nickname.
              </Typography>
              <div className="demo">
                <Button
                  className="edit"
                  outlined
                  label="Edit"
                  icon={iconObject(
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
                      <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
                    </svg>
                  )}
                />
              </div>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Delete
              </Typography>
              <Typography use="body2" tag="p">
                To delete an entry, select the set and click{" "}
                <Typography use="button" tag="span" className="delete">
                  Delete
                </Typography>{" "}
                in the details drawer. You will then need to confirm this decision in a dialog.
              </Typography>
              <Typography use="body2" tag="p">
                Designers are not able to delete sets.
              </Typography>
              <Typography use="body2" tag="p" className="secondary">
                Please contact an editor via the{" "}
                <a href="https://discord.gg/zrcN3qF" target="_blank" rel="noopener noreferrer">
                  Discord server
                </a>{" "}
                if you believe an entry should be deleted.
              </Typography>
              <div className="demo">
                <Button className="delete" outlined label="Delete" />
              </div>
            </div>
          </Card>
          <Card className="guide">
            <Typography use="headline4" tag="h1">
              Data Fields
            </Typography>
            <Typography use="caption" tag="p" className="secondary">
              *Starred fields are mandatory.
            </Typography>
            <div>
              <Typography use="headline5" tag="h2">
                Profile*
              </Typography>
              <Typography use="body2" tag="p">
                Hopefully self-explanatory.
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                Use the autocomplete menu to ensure that the field matches existing entries exactly.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Colorway*
              </Typography>
              <Typography use="body2" tag="p">
                The name of the colorway.
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                This can include a suffix such as “r2” if it is a revision, using lowercase{" "}
                <span className="code">r</span> to avoid confusion with SA R3.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Designer*
              </Typography>
              <Typography use="body2" tag="p">
                The name of the designer (either well-known name, or forum username). If the set is a collaboration,
                this can include multiple designers by separating each with a comma (the site will add a space after a
                comma - make sure not to add an extra one).
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                Use autocomplete and own discretion to ensure that this is consistent with other entries with the same
                designer.
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                This field is disabled for designers.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                IC date*
              </Typography>
              <Typography use="body2" tag="p">
                The date of the first IC, in ISO 8601 format (<span className="code">YYYY-MM-DD</span>). This ideally
                should be when the Geekhack/Keebtalk IC was posted, or when a Reddit thread was posted if there is no GH
                thread.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Details*
              </Typography>
              <Typography use="body2" tag="p">
                The link to the IC/GB info. Geekhack is preferred, but failing that, a Reddit thread or dedicated site
                such as MiTo’s is acceptable.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Image*
              </Typography>
              <Typography use="body2" tag="p">
                The thumbnail to display for the set. This should be a render of the keycap set on a board,{" "}
                <span className="bold">not by keycaprenders.com</span>.
              </Typography>
              <Typography use="body2" tag="p">
                You can upload from a link such as Imgur (make sure it’s{" "}
                <span className="code">https://i.imgur.com/&lt;code&gt;.&lt;png/jpg&gt;</span>, not{" "}
                <span className="code">https://imgur.com/&lt;code&gt;</span>), or you can upload from file by clicking{" "}
                <Typography use="button" tag="span">
                  FROM FILE
                </Typography>{" "}
                and browsing or dragging the file in.
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                Please note that images will be resized to 480px upon upload, and will be cropped to 16:9 or 1:1 when
                displayed on the site. For this reason, angled renders/shots look better than straight on.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Month/Date
              </Typography>
              <Typography use="body2" tag="p">
                If only a month for the GB is known, then enter it in the GB month field in{" "}
                <span className="code">YYYY-MM</span> format (e.g. 2020-10 for October 2020).
              </Typography>
              <Typography use="body2" tag="p">
                If an exact date for the GB is known, then you can click{" "}
                <Typography use="button" tag="span">
                  DATE
                </Typography>{" "}
                and enter the exact date in the fields given. GB end date is not mandatory, but should be added once
                known.
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                It is also possible to enter a year quarter as a date (e.g. Q3 2020). The set will remain on the IC page
                until a month/date is given.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Shipped
              </Typography>
              <Typography use="body2" tag="p">
                Whether the set has shipped to customers.
              </Typography>
              <Typography use="caption" tag="p" className="secondary">
                You don’t have to be too strict with this. As long as there are pictures of the set by customers (not
                the designer or vendors), it should be fine to confirm.
              </Typography>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Vendors
              </Typography>
              <Typography use="body2" tag="p">
                Click{" "}
                <Typography use="button" tag="span">
                  ADD VENDOR
                </Typography>{" "}
                to add a vendor to the set.
              </Typography>
              <Typography use="headline6" tag="h3">
                Fields
              </Typography>
              <div>
                <Typography use="subtitle1" tag="h4">
                  Name*
                </Typography>
                <Typography use="body2" tag="p">
                  The name of the vendor.
                </Typography>
                <Typography use="caption" tag="p" className="secondary">
                  Use the autocomplete suggestions to ensure that the formatting is consistent with other sets (e.g.
                  Cannon Keys not CannonKeys).
                </Typography>
              </div>
              <div>
                <Typography use="subtitle1" tag="h4">
                  Region*
                </Typography>
                <Typography use="body2" tag="p">
                  The region the vendor covers.
                </Typography>
                <Typography use="caption" tag="p" className="secondary">
                  Use the autocomplete suggestions to ensure that the naming is consistent with other sets.
                </Typography>
                <Typography use="caption" tag="p" className="secondary">
                  If the vendor is covering multiple regions, separate each region with a comma. If a single vendor
                  covers all regions, then enter “Global”. Common regions are listed below.
                </Typography>
                <div className="table-container">
                  <DataTable>
                    <DataTableContent>
                      <DataTableHead>
                        <DataTableRow>
                          <DataTableHeadCell>Do</DataTableHeadCell>
                          <DataTableHeadCell>
                            Don&apos;t<sup>†</sup>
                          </DataTableHeadCell>
                        </DataTableRow>
                      </DataTableHead>
                      <DataTableBody>
                        <DataTableRow>
                          <DataTableCell>America</DataTableCell>
                          <DataTableCell>
                            US
                            <br />
                            NA
                            <br />
                            USA
                          </DataTableCell>
                        </DataTableRow>
                        <DataTableRow>
                          <DataTableCell>Asia</DataTableCell>
                          <DataTableCell>
                            China<sup>‡</sup>
                            <br />
                            Japan
                          </DataTableCell>
                        </DataTableRow>
                        <DataTableRow>
                          <DataTableCell>Oceania</DataTableCell>
                          <DataTableCell>Australia</DataTableCell>
                        </DataTableRow>
                        <DataTableRow>
                          <DataTableCell>South East Asia</DataTableCell>
                          <DataTableCell>Singapore</DataTableCell>
                        </DataTableRow>
                        <DataTableRow>
                          <DataTableCell>Europe</DataTableCell>
                          <DataTableCell>United Kingdom</DataTableCell>
                        </DataTableRow>
                        <DataTableRow>
                          <DataTableCell>Canada</DataTableCell>
                          <DataTableCell></DataTableCell>
                        </DataTableRow>
                      </DataTableBody>
                    </DataTableContent>
                  </DataTable>
                </div>
                <Typography use="caption" tag="p" className="secondary">
                  <sup>†</sup>Unless there are separate vendors for these regions, such as proto[Typist] and MyKeyboard
                  on the same set.
                </Typography>
                <Typography use="caption" tag="p" className="secondary">
                  <sup>‡</sup>zFrontier is a common exception, as their site has a{" "}
                  <a href="https://www.zfrontier.com" target="_blank" rel="noopener noreferrer">
                    separate link
                  </a>{" "}
                  for China. In this case, enter the Chinese link as a separate vendor, named zFrontier (CN).
                </Typography>
              </div>
              <div>
                <Typography use="subtitle1" tag="h4">
                  Store link
                </Typography>
                <Typography use="body2" tag="p">
                  The link to the store product.
                </Typography>
                <Typography use="caption" tag="p" className="secondary">
                  This should be a direct link to the product/collection, not a link to the homepage of the store. If no
                  specific link exists yet, leave blank.
                </Typography>
              </div>
            </div>
            <div>
              <Typography use="headline5" tag="h2">
                Sales
              </Typography>
              <Typography use="body2" tag="p">
                A direct link to a sales graph created by dvorcol. This can be including extras or excluding extras -
                ideally this distinction should be clear in the image.
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EntryGuide;
