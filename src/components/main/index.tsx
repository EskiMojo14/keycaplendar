import { useEffect, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { DrawerAppContent } from "@rmwc/drawer";
import { Fab } from "@rmwc/fab";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { confirmDelete } from "~/app/dialog-queue";
import { notify } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { ModalCreate, ModalEdit } from "@c/main/admin/modal-entry";
import { AppBar } from "@c/main/app_bar/app-bar";
import { ContentEmpty } from "@c/main/content/content-empty";
import { ContentGrid } from "@c/main/content/content-grid";
import ContentSkeleton from "@c/main/content/content-skeleton";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import { useAppDispatch, useAppSelector } from "@h";
import useBoolStates from "@h/use-bool-states";
import useBottomNav from "@h/use-bottom-nav";
import useDelayedValue from "@h/use-delayed-value";
import useDevice from "@h/use-device";
import useLocatedSelector from "@h/use-located-selector";
import usePage from "@h/use-page";
import { useSearchParams } from "@h/use-search-params";
import firestore from "@s/firebase/firestore";
import type { KeysetDoc, KeysetId } from "@s/firebase/types";
import {
  deleteSet,
  selectKeysetByString,
  selectLinkedFavorites,
  selectLinkedFavoritesLoading,
  selectLoading,
  selectPresetById,
  selectSetById,
  selectSetGroupTotal,
  setSet,
  useGetAllKeysetsQuery,
} from "@s/main";
import { blankPreset } from "@s/main/constants";
import { deleteGlobalPreset, deletePreset } from "@s/main/thunks";
import type { PresetType, SetType } from "@s/main/types";
import { replace } from "@s/router";
import { selectView } from "@s/settings";
import { selectUser } from "@s/user";
import { getLinkedFavorites } from "@s/user/thunks";
import {
  batchStorageDelete,
  closeModal,
  getStorageFolders,
} from "@s/util/functions";
import { selectFromState } from "@s/util/thunks";
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
  const params = useSearchParams();

  const view = useAppSelector(selectView);

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);

  const contentBool = useLocatedSelector(
    (state, location) => !!selectSetGroupTotal(state, location)
  );

  const { keyset = "" } = useParams<{ keyset?: string }>();

  const { originalUrlSet } = useGetAllKeysetsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      originalUrlSet: data && selectKeysetByString(data, keyset),
    }),
  });

  const urlSet = useDelayedValue(originalUrlSet, 300, { delayed: [undefined] });

  const linkedFavorites = useAppSelector(selectLinkedFavorites);
  const linkedFavoritesLoading = useAppSelector(selectLinkedFavoritesLoading);
  useEffect(() => {
    if (
      page === "favorites" &&
      params.has("favoritesId") &&
      linkedFavorites.array.length === 0
    ) {
      dispatch(getLinkedFavorites(params.get("favoritesId") ?? ""));
    }
  }, [linkedFavorites, page, params]);

  const [filterOpen, setFilterOpen] = useState(false);
  const closeFilter = () => {
    closeModal();
    setFilterOpen(false);
  };
  const closeDetails = () => {
    if (!(!contentBool && loading)) {
      closeModal();
      dispatch(replace(`/${page}`));
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
      dispatch(replace(`/${page}/${set}`));
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
  const [closeCreate, openCreate] = useBoolStates(
    setCreateOpen,
    "setCreateOpen"
  );

  const [_editSet, setEditSet] = useState<EntityId>("");
  const editSet = useDelayedValue(_editSet, 300, { delayed: [""] });
  const openEdit = (set: EntityId) => setEditSet(set);
  const closeEdit = () => setEditSet("");

  const openDeleteSnackbar = ({ id, ...set }: SetType) => {
    const deleteImages = async (name: string) => {
      try {
        const folders = await getStorageFolders();
        const allImages = folders.map((folder) => `${folder}/${name}`);
        await batchStorageDelete(allImages);
        notify({ title: "Successfully deleted thumbnails." });
      } catch (error) {
        notify({ title: `Failed to delete thumbnails: ${error}` });
        console.log(error);
      }
    };
    const recreateEntry = async () => {
      try {
        await firestore
          .collection("keysets")
          .doc(id as KeysetId)
          .set(
            {
              ...set,
              gbLaunch: set.gbMonth ? set.gbLaunch.slice(0, 7) : set.gbLaunch,
              latestEditor: user.id,
            },
            { merge: true }
          );
        console.log("Document recreated with ID: ", id);
        notify({ title: "Entry successfully recreated." });
        dispatch(setSet({ id, ...set }));
      } catch (error) {
        console.error("Error recreating document: ", error);
        notify({ title: `Error recreating document: ${error}` });
      }
    };
    notify({
      actions: [
        {
          label: "Undo",
          onClick: recreateEntry,
        },
      ],
      dismissesOnAction: true,
      onClose: (e) => {
        switch (e.detail.reason) {
          case "action":
            return;
          default: {
            const fileNameRegex = /keysets%2F(.*)\?/;
            const regexMatch = set.image.match(fileNameRegex);
            if (regexMatch) {
              const [, imageName] = regexMatch;
              deleteImages(imageName);
            }
          }
        }
      },
      title: `${set.profile} ${set.colorway} has been deleted.`,
    });
  };

  const openDeleteDialog = async (id: EntityId) => {
    closeDetails();
    const set = dispatch(selectFromState((state) => selectSetById(state, id)));
    if (set) {
      const confirmed = await confirmDelete({
        body: `Are you sure you want to delete the entry for ${set.profile} ${set.colorway}?`,
        title: `Delete ${set.profile} ${set.colorway}`,
      });
      if (confirmed) {
        try {
          await firestore
            .collection("keysets")
            .doc(set.id as KeysetId)
            .set({
              latestEditor: user.id,
            } as KeysetDoc);
          openDeleteSnackbar(set);
          dispatch(deleteSet(set.id));
        } catch (error) {
          console.error("Error deleting document: ", error);
          notify({ title: `Error deleting document: ${error}` });
        }
      }
    }
  };

  const [filterPresetOpen, setFilterPresetOpen] = useState(false);
  const [filterPreset, setFilterPreset] = useState(blankPreset);
  const openFilterPreset = (preset: PresetType) => {
    const open = () => {
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
    setFilterPresetOpen(false);
    setTimeout(() => setFilterPreset(blankPreset), 300);
  };

  const openDeleteFilterPreset = (id: EntityId) => {
    const open = async () => {
      const preset = dispatch(
        selectFromState((state) => selectPresetById(state, id))
      );
      if (preset) {
        const confirmed = await confirmDelete({
          body: `Are you sure you want to delete the${
            preset.global ? " global" : ""
          } filter preset "${preset.name}"?`,
          title: `Delete "${preset.name}"`,
        });
        if (confirmed) {
          dispatch(
            preset.global
              ? deleteGlobalPreset(preset.id)
              : deletePreset(preset.id)
          );
        }
      }
    };
    if (filterOpen && (view === "compact" || device !== "desktop")) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };

  const [shareOpen, setShareOpen] = useState(false);
  const [closeShare, openShare] = useBoolStates(setShareOpen, "setShareOpen");

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
      <ModalEdit onClose={closeEdit} open={!!_editSet} set={editSet} />
    </ConditionalWrapper>
  );

  const content =
    (!contentBool && loading) ||
    (page === "favorites" && linkedFavoritesLoading) ? (
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
          set={urlSet}
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
