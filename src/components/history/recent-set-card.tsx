import { useMemo } from "react";
import type { EntityId } from "@reduxjs/toolkit";
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
import { selectRecentSetById } from "@s/history";
import { pageConditions, selectLinkedFavorites, selectSetById } from "@s/main";
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
  filterChangelog: (set: EntityId) => void;
  filtered: boolean;
  openDetails: (set: EntityId) => void;
  recentSetId: EntityId;
  selected: boolean;
};

export const RecentSetCard = ({
  filterChangelog,
  filtered,
  openDetails,
  recentSetId,
  selected,
}: RecentSetCardProps) => {
  const recentSet = useAppSelector((state) =>
    selectRecentSetById(state, recentSetId)
  );

  if (!recentSet) {
    return null;
  }

  const { deleted, id } = recentSet;
  const currentSet = useAppSelector((state) => selectSetById(state, id));
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);
  const linkedFavorites = useAppSelector(selectLinkedFavorites);

  const pages = useMemo(() => {
    if (currentSet) {
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
      const pageBools: Record<MainPage, boolean> = currentSet
        ? pageConditions(currentSet, favorites, bought, hidden, linkedFavorites)
        : falsePages;
      const keysetPages = objectKeys(pageBools).filter((key) => pageBools[key]);
      return keysetPages;
    }
    return [];
  }, [currentSet]);

  return (
    <Card
      className={classNames("set-changelog", {
        deleted,
        "mdc-card--selected": selected,
      })}
    >
      <ConditionalWrapper
        condition={!!currentSet}
        wrapper={(children) => (
          <CardPrimaryAction
            className={classNames({
              "mdc-card__primary-action--selected": selected,
            })}
            onClick={currentSet ? () => openDetails(id) : undefined}
          >
            {children}
          </CardPrimaryAction>
        )}
      >
        <LazyLoad className="lazy-load" debounce={false} offsetVertical={480}>
          <CardMedia
            sixteenByNine
            style={
              !deleted && currentSet
                ? {
                    backgroundImage: `url(${currentSet.image.replace(
                      "keysets",
                      "thumbs"
                    )})`,
                  }
                : undefined
            }
          >
            {!currentSet && (
              <CardMediaContent>
                <Icon
                  icon={iconObject(<ImageNotSupported />, { size: "xlarge" })}
                />
                {deleted && (
                  <Typography
                    className="deleted-indicator"
                    tag="div"
                    use="overline"
                  >
                    Deleted
                  </Typography>
                )}
              </CardMediaContent>
            )}
          </CardMedia>
        </LazyLoad>
        <div className="info-container">
          <div className="overline">
            <Typography tag="h3" use="overline">
              {currentSet?.designer.join(" + ") ??
                recentSet.designer?.join(" + ")}
            </Typography>
          </div>
          <Typography tag="h2" use="headline5">
            {currentSet
              ? `${currentSet.profile} ${currentSet.colorway}`
              : recentSet.title}
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
          onClick={() => filterChangelog(recentSetId)}
          outlined
        />
      </div>
      {pages.length > 0 && (
        <div className="page-list">
          <Typography className="caption" use="caption">
            Pages
          </Typography>
          <div className="button-container">
            {pages.map((page) => {
              if (arrayIncludes(mainPages, page)) {
                const [title] = pageTitle[page].split(" ");
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
      )}
    </Card>
  );
};
