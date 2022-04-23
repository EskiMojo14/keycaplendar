import { useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { DrawerAppContent } from "@rmwc/drawer";
import { Fab } from "@rmwc/fab";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { Footer } from "@c/common/footer";
import { DialogDelete } from "@c/main/admin/dialog-delete";
import { ModalCreate, ModalEdit } from "@c/main/admin/modal-entry";
import { SnackbarDeleted } from "@c/main/admin/snackbar-deleted";
import { AppBar } from "@c/main/app_bar/app-bar";
import { ContentEmpty } from "@c/main/content/content-empty";
import { ContentGrid } from "@c/main/content/content-grid";
import ContentSkeleton from "@c/main/content/content-skeleton";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import { useAppDispatch, useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDelayedValue from "@h/use-delayed-value";
import useDevice from "@h/use-device";
import useLocatedSelector from "@h/use-located-selector";
import usePage from "@h/use-page";
import {
  selectKeysetByString,
  selectLinkedFavorites,
  selectLoading,
  selectSetGroupTotal,
} from "@s/main";
import { blankKeyset, blankPreset } from "@s/main/constants";
import type { PresetType, SetType } from "@s/main/types";
import { push } from "@s/router";
import { selectView } from "@s/settings";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
import { DialogDeleteFilterPreset } from "./dialog-delete-filter-preset";
import { DialogSales } from "./dialog-sales";
import { DialogShareFavorites } from "./dialog-share-favorites";
import { DrawerDetails } from "./drawer-details";
import { DrawerFilter } from "./drawer-filter";
import { ModalFilterPreset } from "./modal-filter-preset";

type ContentMainProps = {
  openNav: () => void;
};

export const ContentMain = ({ openNav }: ContentMainProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();
  const bottomNav = useBottomNav();

  const page = usePage();

  const view = useAppSelector(selectView);

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);

  const contentBool = useLocatedSelector(
    (state, location) => !!selectSetGroupTotal(state, location)
  );

  const { keyset = "" } = useParams<{ keyset?: string }>();

  const originalUrlSet = useAppSelector((state) =>
    selectKeysetByString(state, keyset)
  );

  const urlSet = useDelayedValue(originalUrlSet, 300, { delayed: [undefined] });

  const linkedFavorites = useAppSelector(selectLinkedFavorites);

  const [filterOpen, setFilterOpen] = useState(false);
  const closeFilter = () => {
    closeModal();
    setFilterOpen(false);
  };
  const closeDetails = () => {
    if (!(!contentBool && loading)) {
      closeModal();
      dispatch(push(`/${page}`));
    }
  };
  const openFilter = () => {
    const open = () => {
      if (filterOpen && device === "desktop") {
        closeFilter();
      } else {
        setFilterOpen(true);
      }
    };
    if (originalUrlSet) {
      closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const openDetails = (set: EntityId) => {
    const open = () => {
      dispatch(push(`/${page}/${set}`));
    };
    if (filterOpen) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };

  const [salesOpen, setSalesOpen] = useState(false);
  const [salesSet, setSalesSet] = useState<EntityId>("");
  const openSales = (set: EntityId) => {
    setSalesOpen(true);
    setSalesSet(set);
  };
  const closeSales = () => {
    setSalesOpen(false);
    setTimeout(() => setSalesSet(""), 300);
  };

  const [createOpen, setCreateOpen] = useState(false);
  const openCreate = () => {
    openModal();
    setCreateOpen(true);
  };
  const closeCreate = () => {
    closeModal();
    setCreateOpen(false);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editSet, setEditSet] = useState<EntityId>("");
  const openEdit = (set: EntityId) => {
    openModal();
    setEditOpen(true);
    setEditSet(set);
  };
  const closeEdit = () => {
    closeModal();
    setEditOpen(false);
    setTimeout(() => setEditSet(""), 300);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);
  const [deleteSet, setDeleteSet] = useState(blankKeyset);
  const openDeleteDialog = (set: SetType) => {
    closeDetails();
    setDeleteDialogOpen(true);
    setDeleteSet(set);
  };
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const openDeleteSnackbar = () => {
    setDeleteSnackbarOpen(true);
  };

  const closeDeleteSnackbar = () => {
    setDeleteSnackbarOpen(false);
    setTimeout(() => setDeleteSet(blankKeyset), 300);
  };

  const [filterPresetOpen, setFilterPresetOpen] = useState(false);
  const [filterPreset, setFilterPreset] = useState(blankPreset);
  const openFilterPreset = (preset: PresetType) => {
    const open = () => {
      openModal();
      setFilterPresetOpen(true);
      setFilterPreset(preset);
    };
    if (filterOpen && (view === "compact" || device !== "desktop")) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeFilterPreset = () => {
    closeModal();
    setFilterPresetOpen(false);
    setTimeout(() => setFilterPreset(blankPreset), 300);
  };

  const [deleteFilterPresetOpen, setDeleteFilterPresetOpen] = useState(false);
  const [deleteFilterPreset, setDeleteFilterPreset] = useState(blankPreset);
  const openDeleteFilterPreset = (preset: PresetType) => {
    const open = () => {
      openModal();
      setDeleteFilterPresetOpen(true);
      setDeleteFilterPreset(preset);
    };
    if (filterOpen && (view === "compact" || device !== "desktop")) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeDeleteFilterPreset = () => {
    closeModal();
    setDeleteFilterPresetOpen(false);
    setTimeout(() => setDeleteFilterPreset(blankPreset), 300);
  };

  const [shareOpen, setShareOpen] = useState(false);
  const openShare = () => {
    openModal();
    setShareOpen(true);
  };
  const closeShare = () => {
    closeModal();
    setShareOpen(false);
  };

  const shareDialog = page === "favorites" &&
    user.email &&
    linkedFavorites.array.length === 0 && (
      <DialogShareFavorites close={closeShare} open={shareOpen} />
    );

  const filterPresetElements = user.email && (
    <>
      <ModalFilterPreset
        close={closeFilterPreset}
        open={filterPresetOpen}
        preset={filterPreset}
      />
      <DialogDeleteFilterPreset
        close={closeDeleteFilterPreset}
        open={deleteFilterPresetOpen}
        preset={deleteFilterPreset}
      />
    </>
  );

  const deleteElements = user.isEditor && (
    <>
      <DialogDelete
        close={closeDeleteDialog}
        open={deleteDialogOpen}
        openSnackbar={openDeleteSnackbar}
        set={deleteSet}
      />
      <SnackbarDeleted
        close={closeDeleteSnackbar}
        open={deleteSnackbarOpen}
        set={deleteSet}
      />
    </>
  );

  const editorElements = (user.isEditor || user.isDesigner) && (
    <ConditionalWrapper
      condition={device === "desktop"}
      wrapper={(children) => <div className="editor-elements">{children}</div>}
    >
      <Fab
        className={classNames("create-fab", { middle: bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : undefined}
        onClick={openCreate}
      />
      <ModalCreate onClose={closeCreate} open={createOpen} />
      <ModalEdit onClose={closeEdit} open={editOpen} set={editSet} />
      {deleteElements}
    </ConditionalWrapper>
  );

  const content =
    !contentBool && loading ? (
      <ContentSkeleton />
    ) : contentBool ? (
      <ContentGrid
        closeDetails={closeDetails}
        details={openDetails}
        detailSet={urlSet?.id}
        edit={openEdit}
      />
    ) : (
      <ContentEmpty />
    );

  const drawerOpen = (urlSet || filterOpen) && device === "desktop";
  const wrapperClasses = classNames("main", view, {
    "drawer-open": drawerOpen,
    "extended-app-bar": view === "card" && !bottomNav && contentBool,
  });
  return (
    <>
      <AppBar
        indent={user.isDesigner || user.isEditor}
        openFilter={openFilter}
        openNav={openNav}
        openShare={openShare}
      />
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div className="content-container">
        <DrawerFilter
          close={closeFilter}
          deletePreset={openDeleteFilterPreset}
          open={filterOpen}
          openPreset={openFilterPreset}
        />
        <DrawerDetails
          close={closeDetails}
          delete={openDeleteDialog}
          edit={openEdit}
          open={!!originalUrlSet}
          openSales={openSales}
          set={urlSet?.id}
        />
        <BoolWrapper
          condition={device === "desktop"}
          falseWrapper={(children) => (
            <div className={wrapperClasses}>{children}</div>
          )}
          trueWrapper={(children) => (
            <DrawerAppContent className={wrapperClasses}>
              {children}
            </DrawerAppContent>
          )}
        >
          {content}
          <Footer />
        </BoolWrapper>
        <DialogSales close={closeSales} open={salesOpen} set={salesSet} />
        {shareDialog}
        {filterPresetElements}
        {editorElements}
      </div>
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};
