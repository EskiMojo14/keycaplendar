import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import { useAppSelector } from "../../app/hooks";
import { mainPages, pageIcons, pageTitle } from "../../app/slices/common/constants";
import { setPage } from "../../app/slices/common/coreFunctions";
import { arrayIncludes, hasKey, iconObject, ordinal } from "../../app/slices/common/functions";
import { MainPage } from "../../app/slices/common/types";
import { pageConditions } from "../../app/slices/main/functions";
import { SetType } from "../../app/slices/main/types";
import { RecentSet } from "../../app/slices/history/types";
import { selectBought, selectFavorites, selectHidden } from "../../app/slices/user/userSlice";
import { Button } from "@rmwc/button";
import { Card, CardMedia, CardMediaContent, CardPrimaryAction } from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import "./RecentSetCard.scss";

type RecentSetCardProps = {
  recentSet: RecentSet;
  filtered: boolean;
  selected: boolean;
  filterChangelog: (set: RecentSet) => void;
  openDetails: (set: SetType) => void;
};

export const RecentSetCard = (props: RecentSetCardProps) => {
  const { recentSet, filtered, selected } = props;
  const { currentSet: set, deleted } = recentSet;
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (props.recentSet.currentSet) {
      const falsePages: Record<MainPage, boolean> = {
        calendar: false,
        live: false,
        ic: false,
        previous: false,
        timeline: false,
        archive: false,
        favorites: false,
        bought: false,
        hidden: false,
      };
      const pageBools: Record<MainPage, boolean> = set ? pageConditions(set, favorites, bought, hidden) : falsePages;
      const keysetPages = Object.keys(pageBools).filter((key) => {
        if (hasKey(pageBools, key)) {
          return pageBools[key];
        }
        return false;
      });
      setPages(keysetPages);
    }
  }, [props.recentSet.currentSet]);

  return (
    <Card className={classNames("set-changelog", { "mdc-card--selected": selected, deleted: deleted })}>
      <ConditionalWrapper
        condition={!!set}
        wrapper={(children) => (
          <CardPrimaryAction
            onClick={
              set
                ? () => {
                    props.openDetails(set);
                  }
                : undefined
            }
            className={classNames({ "mdc-card__primary-action--selected": selected })}
          >
            {children}
          </CardPrimaryAction>
        )}
      >
        <LazyLoad debounce={false} offsetVertical={480} className="lazy-load">
          <CardMedia
            sixteenByNine
            style={!deleted && set ? { backgroundImage: `url(${set.image.replace("keysets", "thumbs")})` } : undefined}
          >
            {!set ? (
              <CardMediaContent>
                <Icon
                  icon={iconObject(
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                      <g>
                        <rect fill="none" height="24" width="24" />
                        <g>
                          <path
                            d="M7.83,5H19v11.17L7.83,5z M16.17,19l-2-2H6l3-4l2,2.72l0.84-1.05L5,7.83V19H16.17z"
                            opacity=".3"
                          />
                          <path d="M5.83,3H19c1.1,0,2,0.9,2,2v13.17l-2-2V5H7.83L5.83,3z M20.49,23.31L18.17,21H5c-1.1,0-2-0.9-2-2V5.83L0.69,3.51L2.1,2.1 l1.49,1.49L5,5l8.11,8.11l2.69,2.69L19,19l1.41,1.41l1.49,1.49L20.49,23.31z M16.17,19l-2-2H6l3-4l2,2.72l0.84-1.05L5,7.83V19 H16.17z" />
                        </g>
                      </g>
                    </svg>,
                    { size: "xlarge" }
                  )}
                />
                {deleted ? (
                  <Typography use="overline" tag="div" className="deleted-indicator">
                    Deleted
                  </Typography>
                ) : null}
              </CardMediaContent>
            ) : null}
          </CardMedia>
        </LazyLoad>
        <div className="info-container">
          <div className="overline">
            <Typography use="overline" tag="h3">
              {set
                ? set.designer.join(" + ")
                : recentSet.designer
                ? recentSet.designer.join(" + ")
                : recentSet.designer}
            </Typography>
          </div>
          <Typography use="headline5" tag="h2">
            {set ? `${set.profile} ${set.colorway}` : recentSet.title}
          </Typography>
          <Typography use="subtitle2" tag="p">
            Last updated:{" "}
            {DateTime.fromISO(recentSet.latestTimestamp, { zone: "utc" }).toFormat(
              `d'${ordinal(DateTime.fromISO(recentSet.latestTimestamp, { zone: "utc" }).day)}' MMM yyyy HH:mm`
            )}
          </Typography>
        </div>
      </ConditionalWrapper>
      <div className="filter-button-container">
        <Button
          outlined
          label={filtered ? "Clear filter" : "Filter changelog"}
          icon={
            filtered
              ? iconObject(
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path fill="none" d="M0,0h24v24H0V0z" />
                    <path d="M21 8H3V6H21V8M13.81 16H10V18H13.09C13.21 17.28 13.46 16.61 13.81 16M18 11H6V13H18V11M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z" />
                  </svg>
                )
              : "filter_list"
          }
          onClick={() => props.filterChangelog(recentSet)}
        />
      </div>
      {pages.length > 0 ? (
        <div className="page-list">
          <Typography use="caption" className="caption">
            Pages
          </Typography>
          <div className="button-container">
            {pages.map((page) => {
              if (arrayIncludes(mainPages, page)) {
                const title = page === "previous" ? pageTitle[page].split(" ")[0] : pageTitle[page];
                return (
                  <Button outlined label={title} icon={pageIcons[page]} onClick={() => setPage(page)} key={page} />
                );
              }
              return null;
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
};
