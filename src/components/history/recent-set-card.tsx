import { useEffect, useState } from "react";
import { Button } from "@rmwc/button";
import {
  Card,
  CardMedia,
  CardMediaContent,
  CardPrimaryAction,
} from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import LazyLoad from "react-lazy-load";
import { useAppSelector } from "~/app/hooks";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { mainPages, pageIcons, pageTitle } from "@s/common/constants";
import { setPage } from "@s/common/functions";
import type { MainPage } from "@s/common/types";
import type { RecentSet } from "@s/history/types";
import { pageConditions } from "@s/main/functions";
import type { SetType } from "@s/main/types";
import { selectBought, selectFavorites, selectHidden } from "@s/user";
import {
  arrayIncludes,
  iconObject,
  objectKeys,
  ordinal,
} from "@s/util/functions";
import { FilterVariantRemove, ImageNotSupported } from "@i";
import "./recent-set-card.scss";

type RecentSetCardProps = {
  filterChangelog: (set: RecentSet) => void;
  filtered: boolean;
  openDetails: (set: SetType) => void;
  recentSet: RecentSet;
  selected: boolean;
};

export const RecentSetCard = ({
  filterChangelog,
  filtered,
  openDetails,
  recentSet,
  selected,
}: RecentSetCardProps) => {
  const { currentSet: set, deleted } = recentSet;
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (recentSet.currentSet) {
      const falsePages: Record<MainPage, boolean> = {
        archive: false,
        bought: false,
        calendar: false,
        favorites: false,
        hidden: false,
        ic: false,
        live: false,
        previous: false,
        timeline: false,
      };
      const pageBools: Record<MainPage, boolean> = set
        ? pageConditions(set, favorites, bought, hidden)
        : falsePages;
      const keysetPages = objectKeys(pageBools).filter((key) => pageBools[key]);
      setPages(keysetPages);
    }
  }, [recentSet.currentSet]);

  return (
    <Card
      className={classNames("set-changelog", {
        deleted,
        "mdc-card--selected": selected,
      })}
    >
      <ConditionalWrapper
        condition={!!set}
        wrapper={(children) => (
          <CardPrimaryAction
            className={classNames({
              "mdc-card__primary-action--selected": selected,
            })}
            onClick={set ? () => openDetails(set) : undefined}
          >
            {children}
          </CardPrimaryAction>
        )}
      >
        <LazyLoad className="lazy-load" debounce={false} offsetVertical={480}>
          <CardMedia
            sixteenByNine
            style={
              !deleted && set
                ? {
                    backgroundImage: `url(${set.image.replace(
                      "keysets",
                      "thumbs"
                    )})`,
                  }
                : undefined
            }
          >
            {!set ? (
              <CardMediaContent>
                <Icon
                  icon={iconObject(<ImageNotSupported />, { size: "xlarge" })}
                />
                {deleted ? (
                  <Typography
                    className="deleted-indicator"
                    tag="div"
                    use="overline"
                  >
                    Deleted
                  </Typography>
                ) : null}
              </CardMediaContent>
            ) : null}
          </CardMedia>
        </LazyLoad>
        <div className="info-container">
          <div className="overline">
            <Typography tag="h3" use="overline">
              {set?.designer.join(" + ") ?? recentSet.designer?.join(" + ")}
            </Typography>
          </div>
          <Typography tag="h2" use="headline5">
            {set ? `${set.profile} ${set.colorway}` : recentSet.title}
          </Typography>
          <Typography tag="p" use="subtitle2">
            Last updated:{" "}
            {DateTime.fromISO(recentSet.latestTimestamp, {
              zone: "utc",
            }).toFormat(
              `d'${ordinal(
                DateTime.fromISO(recentSet.latestTimestamp, { zone: "utc" }).day
              )}' MMM yyyy HH:mm`
            )}
          </Typography>
        </div>
      </ConditionalWrapper>
      <div className="filter-button-container">
        <Button
          icon={filtered ? iconObject(<FilterVariantRemove />) : "filter_list"}
          label={filtered ? "Clear filter" : "Filter changelog"}
          onClick={() => filterChangelog(recentSet)}
          outlined
        />
      </div>
      {pages.length > 0 ? (
        <div className="page-list">
          <Typography className="caption" use="caption">
            Pages
          </Typography>
          <div className="button-container">
            {pages.map((page) => {
              if (arrayIncludes(mainPages, page)) {
                const title =
                  page === "previous"
                    ? pageTitle[page].split(" ")[0]
                    : pageTitle[page];
                return (
                  <Button
                    key={page}
                    icon={pageIcons[page]}
                    label={title}
                    onClick={() => setPage(page)}
                    outlined
                  />
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
