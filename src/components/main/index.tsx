import { useEffect, useState } from "react";
import { DrawerAppContent } from "@rmwc/drawer";
import { Fab } from "@rmwc/fab";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { DialogDelete } from "@c/main/admin/dialog-delete";
import { ModalCreate, ModalEdit } from "@c/main/admin/modal-entry";
import { SnackbarDeleted } from "@c/main/admin/snackbar-deleted";
import { AppBar } from "@c/main/app_bar/app-bar";
import { ContentEmpty } from "@c/main/content/content-empty";
import { ContentGrid } from "@c/main/content/content-grid";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import { selectDevice, selectPage } from "@s/common";
import {
  selectAllSets,
  selectLinkedFavorites,
  selectSetGroups,
  selectURLSet,
  setURLSet,
} from "@s/main";
import { blankKeyset, blankPreset } from "@s/main/constants";
import type { PresetType, SetType } from "@s/main/types";
import { selectBottomNav, selectView } from "@s/settings";
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

  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);
  const view = useAppSelector(selectView);

  const page = useAppSelector(selectPage);

  const user = useAppSelector(selectUser);

  const contentBool = !!useAppSelector(selectSetGroups).length;
  const allSets = useAppSelector(selectAllSets);
  const urlSet = useAppSelector(selectURLSet);
  const linkedFavorites = useAppSelector(selectLinkedFavorites);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailSet, setDetailSet] = useState(blankKeyset);
  const [filterOpen, setFilterOpen] = useState(false);
  const closeFilter = () => {
    closeModal();
    setFilterOpen(false);
  };
  const closeDetails = () => {
    closeModal();
    setDetailsOpen(false);
    setTimeout(() => setDetailSet(blankKeyset), 300);
  };
  const openFilter = () => {
    const open = () => {
      if (filterOpen && device === "desktop") {
        closeFilter();
      } else {
        if (device !== "desktop" || view === "compact") {
          openModal();
        }
        setFilterOpen(true);
      }
    };
    if (detailsOpen) {
      closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const openDetails = (set: SetType, clearUrl = true) => {
    const open = () => {
      if (device !== "desktop" || view === "compact") {
        openModal();
      }
      setDetailsOpen(true);
      setDetailSet(set);

      if (clearUrl) {
        if (urlSet) {
          dispatch(setURLSet("id", ""));
        }
        const params = new URLSearchParams(window.location.search);
        if (
          params.has("keysetId") ||
          params.has("keysetAlias") ||
          params.has("keysetName")
        ) {
          params.delete("keysetId");
          params.delete("keysetAlias");
          params.delete("keysetName");
          const questionParam = params.has("page") ? `?${params}` : "/";
          window.history.pushState({}, "KeycapLendar", questionParam);
        }
      }
    };
    if (filterOpen) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };

  useEffect(() => {
    if (urlSet.value) {
      const keyset = allSets.find((set) => {
        if (urlSet.prop === "name") {
          return urlSet.value === `${set.profile} ${set.colorway}`;
        } else {
          return set[urlSet.prop] === urlSet.value;
        }
      });
      if (keyset) {
        openDetails(keyset, false);
      }
    }
  }, [allSets, urlSet]);

  const [salesOpen, setSalesOpen] = useState(false);
  const [salesSet, setSalesSet] = useState(blankKeyset);
  const openSales = (set: SetType) => {
    setSalesOpen(true);
    setSalesSet(set);
  };
  const closeSales = () => {
    setSalesOpen(false);
    setTimeout(() => setSalesSet(blankKeyset), 300);
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
  const [editSet, setEditSet] = useState(blankKeyset);
  const openEdit = (set: SetType) => {
    openModal();
    setEditOpen(true);
    setEditSet(set);
  };
  const closeEdit = () => {
    closeModal();
    setEditOpen(false);
    setTimeout(() => setEditSet(blankKeyset), 300);
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

  const shareDialog =
    page === "favorites" && user.email && linkedFavorites.array.length === 0 ? (
      <DialogShareFavorites close={closeShare} open={shareOpen} />
    ) : null;

  const filterPresetElements = user.email ? (
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
  ) : null;

  const deleteElements = user.isEditor ? (
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
  ) : null;

  const editorElements =
    user.isEditor || user.isDesigner ? (
      <ConditionalWrapper
        condition={device === "desktop"}
        wrapper={(children) => (
          <div className="editor-elements">{children}</div>
        )}
      >
        <Fab
          className={classNames("create-fab", { middle: bottomNav })}
          icon="add"
          label={device === "desktop" ? "Create" : null}
          onClick={openCreate}
        />
        <ModalCreate close={closeCreate} open={createOpen} />
        <ModalEdit close={closeEdit} open={editOpen} set={editSet} />
        {deleteElements}
      </ConditionalWrapper>
    ) : null;

  const content = contentBool ? (
    <ContentGrid
      closeDetails={closeDetails}
      details={openDetails}
      detailSet={detailSet}
      edit={openEdit}
    />
  ) : (
    <ContentEmpty />
  );

  const drawerOpen = (detailsOpen || filterOpen) && device === "desktop";
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
      {bottomNav ? null : <TopAppBarFixedAdjust />}
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
          open={detailsOpen}
          openSales={openSales}
          set={detailSet}
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
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
