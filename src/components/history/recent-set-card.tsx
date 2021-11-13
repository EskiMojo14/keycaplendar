import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import { useAppSelector } from "~/app/hooks";
import { mainPages, pageIcons, pageTitle } from "@s/common/constants";
import { setPage } from "@s/common/functions";
import { MainPage } from "@s/common/types";
import { pageConditions } from "@s/main/functions";
import { SetType } from "@s/main/types";
import { RecentSet } from "@s/history/types";
import { selectBought, selectFavorites, selectHidden } from "@s/user";
import { arrayIncludes, iconObject, objectKeys, ordinal } from "@s/util/functions";
import { Button } from "@rmwc/button";
import { Card, CardMedia, CardMediaContent, CardPrimaryAction } from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { FilterVariantRemove, ImageNotSupported } from "@i";
import "./recent-set-card.scss";

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
      const keysetPages = objectKeys(pageBools).filter((key) => {
        return pageBools[key];
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
                <Icon icon={iconObject(<ImageNotSupported />, { size: "xlarge" })} />
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
              {set?.designer.join(" + ") ?? recentSet.designer?.join(" + ")}
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
          icon={filtered ? iconObject(<FilterVariantRemove />) : "filter_list"}
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
