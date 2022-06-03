import type { EntityId } from "@reduxjs/toolkit";
import { Card } from "@rmwc/card";
import { ImageList } from "@rmwc/image-list";
import { List, ListDivider } from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import ElementCard from "@c/main/views/card/element-card";
import ElementCompact from "@c/main/views/compact/element-compact";
import ElementImage from "@c/main/views/image-list/element-image";
import ElementList from "@c/main/views/list/element-list";
import { SkeletonBlock } from "@c/util/skeleton-block";
import { useAppSelector } from "@h";
import useLocatedSelector from "@h/use-located-selector";
import { selectAllSetGroups, useGetAllKeysetsQuery } from "@s/main";
import { selectView } from "@s/settings";
import "./content-grid.scss";
import "./view-card.scss";
import "./view-compact.scss";
import "./view-list.scss";

type ContentGridProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId | undefined;
  edit: (set: EntityId) => void;
};

export const ContentGrid = ({
  closeDetails,
  details,
  detailSet,
  edit,
}: ContentGridProps) => {
  const view = useAppSelector(selectView);

  const setGroups = useLocatedSelector(selectAllSetGroups);
  const { loading } = useGetAllKeysetsQuery(undefined, {
    selectFromResult: ({ isLoading }) => ({ loading: isLoading }),
  });

  const createGroup = (sets: EntityId[]) => {
    switch (view) {
      case "card": {
        return (
          <div className="group-container">
            {sets.map((setId) => (
              <ElementCard
                key={setId}
                selected={detailSet === setId}
                {...{
                  closeDetails,
                  details,
                  edit,
                  loading,
                  setId,
                }}
              />
            ))}
          </div>
        );
      }
      case "list": {
        return (
          <List
            className="view-list three-line"
            nonInteractive={loading}
            twoLine
          >
            {sets.map((setId) => (
              <ElementList
                key={setId}
                selected={detailSet === setId}
                {...{
                  closeDetails,
                  details,
                  setId,
                }}
              />
            ))}
            <ListDivider />
          </List>
        );
      }
      case "imageList": {
        return (
          <ImageList style={{ margin: -2 }} withTextProtection>
            {sets.map((setId) => (
              <ElementImage
                key={setId}
                selected={detailSet === setId}
                {...{ closeDetails, details, loading, setId }}
              />
            ))}
          </ImageList>
        );
      }
      case "compact": {
        return (
          <Card>
            <List nonInteractive={loading} twoLine>
              {sets.map((setId) => (
                <ElementCompact
                  key={setId}
                  selected={detailSet === setId}
                  {...{ closeDetails, details, loading, setId }}
                />
              ))}
            </List>
          </Card>
        );
      }
      default:
        return null;
    }
  };
  return (
    <div className="content-grid">
      {setGroups.map((group) => (
        <div key={group.title} className="outer-container">
          <div className="subheader">
            {loading ? (
              <SkeletonBlock
                maxContentLength={16}
                minContentLength={12}
                typography="caption"
              />
            ) : (
              <Typography use="caption">
                {group.title} <b>{`(${group.sets.length})`}</b>
              </Typography>
            )}
          </div>
          {createGroup(group.sets)}
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;
