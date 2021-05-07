import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import { mainPages, pageIcons, pageTitle } from "../../util/constants";
import { UserContext } from "../../util/contexts";
import { hasKey, iconObject, pageConditions } from "../../util/functions";
import { RecentSet, SetType } from "../../util/types";
import { Card, CardMedia, CardMediaContent, CardPrimaryAction } from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import "./RecentSetCard.scss";
import { Button } from "@rmwc/button";

type RecentSetCardProps = {
  recentSet: RecentSet;
  detailSet: SetType;
  openDetails: (set: SetType) => void;
  setPage: (page: string) => void;
};

export const RecentSetCard = (props: RecentSetCardProps) => {
  const { recentSet } = props;
  const { currentSet: set } = recentSet;
  const { favorites, hidden } = useContext(UserContext);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (props.recentSet.currentSet) {
      const falsePages: Record<typeof mainPages[number], boolean> = {
        calendar: false,
        live: false,
        ic: false,
        previous: false,
        timeline: false,
        archive: false,
        favorites: false,
        hidden: false,
      };
      const pageBools: Record<typeof mainPages[number], boolean> = set
        ? pageConditions(set, favorites, hidden)
        : falsePages;
      const keysetPages = Object.keys(pageBools).filter((key) => {
        if (hasKey(pageBools, key)) {
          return pageBools[key];
        }
        return false;
      });
      setPages(keysetPages);
    }
  }, [props.recentSet]);

  return (
    <Card className={classNames("set-changelog", { "mdc-card--selected": props.detailSet === set, deleted: !set })}>
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
            className={classNames({ "mdc-card__primary-action--selected": props.detailSet === set })}
          >
            {children}
          </CardPrimaryAction>
        )}
      >
        <LazyLoad debounce={false} offsetVertical={480} className="lazy-load">
          <CardMedia
            sixteenByNine
            style={set ? { backgroundImage: `url(${set.image.replace("keysets", "thumbs")})` } : undefined}
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
              </CardMediaContent>
            ) : null}
          </CardMedia>
        </LazyLoad>
        <div className="info-container">
          <div className="overline">
            <Typography use="overline" tag="h3">
              {set ? set.designer.join(", ") : "Deleted"}
            </Typography>
          </div>
          <Typography use="headline5" tag="h2">
            {set ? `${set.profile} ${set.colorway}` : recentSet.title}
          </Typography>
          <Typography use="subtitle2" tag="p">
            Last updated: {moment(recentSet.latestTimestamp).format("Do MMM YYYY HH:mm")}
          </Typography>
        </div>
      </ConditionalWrapper>
      {pages.length > 0 ? (
        <div className="page-list">
          <div className="button-container">
            {pages.map((page) => {
              const title = page === "previous" ? pageTitle[page].split(" ")[0] : pageTitle[page];
              return (
                <Button outlined label={title} icon={pageIcons[page]} onClick={() => props.setPage(page)} key={page} />
              );
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
};
