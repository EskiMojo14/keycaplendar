import { useEffect, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { CircularProgress } from "@rmwc/circular-progress";
import { Fab } from "@rmwc/fab";
import { LinearProgress } from "@rmwc/linear-progress";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { confirmDelete } from "~/app/dialog-queue";
import { notify } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { ModalCreate, ModalEdit } from "@c/guides/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { withTooltip } from "@c/util/hocs";
import { useAppDispatch, useAppSelector } from "@h";
import useBoolStates from "@h/use-bool-states";
import useBottomNav from "@h/use-bottom-nav";
import useDelayedValue from "@h/use-delayed-value";
import useDevice from "@h/use-device";
import { useSearchParams } from "@h/use-search-params";
import {
  selectEntries,
  selectEntryMap,
  useDeleteGuideEntryMutation,
  useGetGuidesQuery,
} from "@s/guides";
import { replace } from "@s/router";
import { pageTitle } from "@s/router/constants";
import { selectUser } from "@s/user";
import { EntriesList } from "./entries-list";
import { GuideEntry } from "./guide-entry";
import { ModalDetail } from "./modal-detail";
import emptyImg from "@m/empty.svg";
import "./index.scss";

type ContentGuidesProps = {
  openNav: () => void;
};

export const ContentGuides = ({ openNav }: ContentGuidesProps) => {
  const dispatch = useAppDispatch();

  const { entries, entryMap, loading, refetch } = useGetGuidesQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => ({
      entries: data && selectEntries(data),
      entryMap: data && selectEntryMap(data),
      loading: isFetching,
    }),
  });

  const device = useDevice();

  const bottomNav = useBottomNav();

  const user = useAppSelector(selectUser);

  const { id } = useParams<{ id?: string }>();
  const urlEntry = useDelayedValue(
    id && entryMap && id in entryMap ? id : undefined,
    300,
    {
      delayed: [undefined],
    }
  );
  const searchParams = useSearchParams();

  const openDetail = (entry: EntityId) => {
    dispatch(replace(`/guides/${entry}`));
  };
  const closeDetail = () => {
    dispatch(replace("/guides"));
  };

  useEffect(() => {
    if (!id && !searchParams.has("guideId") && device === "desktop") {
      openDetail("Di1F9XkWTG2M9qbP2ZcN"); // open welcome guide if none currently open
    }
  }, [entries, urlEntry, searchParams]);

  const [createOpen, setCreateOpen] = useState(false);
  const [closeCreate, openCreate] = useBoolStates(
    setCreateOpen,
    "setCreateOpen"
  );

  const [_editEntry, setEditEntry] = useState<EntityId>("");
  const editEntry = useDelayedValue(_editEntry, 300, { delayed: [""] });
  const openEdit = (entry: EntityId) => {
    const open = () => setEditEntry(entry);
    if (urlEntry && device !== "desktop") {
      closeDetail();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeEdit = () => setEditEntry("");

  const [deleteEntry] = useDeleteGuideEntryMutation({
    selectFromResult: () => ({}),
  });

  const openDelete = async (id: EntityId) => {
    const { [id]: entry } = entryMap ?? {};
    if (entry) {
      const confirmed = await confirmDelete({
        body: `Are you sure you want to delete the guide entry "${entry.title}"? This cannot be undone.`,
        title: `Delete "${entry.title}"`,
      });
      if (confirmed) {
        try {
          await deleteEntry(id).unwrap();
          notify({ title: "Successfully deleted entry." });
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const refreshButton =
    (user.isAdmin || user.isEditor || user.isDesigner) &&
    (loading ? (
      <CircularProgress />
    ) : (
      withTooltip(
        <TopAppBarActionItem icon="refresh" onClick={() => refetch()} />,
        "Refresh"
      )
    ));

  const buttons = <>{refreshButton}</>;

  const indent = user.isAdmin && bottomNav && <AppBarIndent />;

  const editorElements = user.isAdmin && (
    <>
      <Fab
        className={classNames("create-fab", { middle: bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : undefined}
        onClick={openCreate}
      />
      <ModalCreate onClose={closeCreate} open={createOpen} />
      <ModalEdit entryId={editEntry} onClose={closeEdit} open={!!_editEntry} />
    </>
  );

  const leftButtons = !indent ? (
    <TopAppBarTitle>{pageTitle.guides}</TopAppBarTitle>
  ) : (
    buttons
  );
  const rightButtons = !indent && (
    <TopAppBarSection alignEnd>{buttons}</TopAppBarSection>
  );

  const content =
    device === "desktop" ? (
      <div className="guides-container">
        <EntriesList detailEntry={urlEntry} openEntry={openDetail} />
        <div className="main drawer-margin">
          <div className="guide-container">
            {urlEntry ? (
              <GuideEntry
                delete={openDelete}
                edit={openEdit}
                entryId={urlEntry}
              />
            ) : (
              <div className="empty-container">
                <img alt="Empty" className="image" src={emptyImg} />
                <Typography className="title" tag="h3" use="headline6">
                  Nothing to see here
                </Typography>
                <Typography className="subtitle" tag="p" use="body1">
                  No guide selected.
                </Typography>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    ) : (
      <div className="guides-container">
        <div className="main">
          <EntriesList detailEntry={urlEntry} openEntry={openDetail} />
          <ModalDetail
            delete={openDelete}
            edit={openEdit}
            entryId={urlEntry}
            onClose={closeDetail}
            open={!!id}
          />
          <Footer />
        </div>
      </div>
    );

  return (
    <>
      <TopAppBar
        className={classNames({
          "bottom-app-bar": bottomNav,
          "bottom-app-bar--indent": bottomNav && user.isAdmin,
        })}
        fixed
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            {leftButtons}
          </TopAppBarSection>
          {rightButtons}
          {indent}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        {content}
        {editorElements}
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
