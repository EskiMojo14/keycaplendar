import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Checkbox } from "@rmwc/checkbox";
import { Chip, ChipSet } from "@rmwc/chip";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import {
  imageAdapter,
  selectFolders,
  selectImageMap,
  setLoading,
} from "@s/images";
import { listAll } from "@s/images/thunks";
import { batchStorageDelete, filterFalsey, pluralise } from "@s/util/functions";
import "./dialog-delete.scss";

type DialogDeleteProps = {
  checkedImages: EntityId[];
  clearChecked: () => void;
  close: () => void;
  open: boolean;
  toggleImageChecked: (image: EntityId) => void;
};

export const DialogDelete = ({
  checkedImages,
  clearChecked,
  close,
  open,
  toggleImageChecked,
}: DialogDeleteProps) => {
  const dispatch = useAppDispatch();

  const folders = useAppSelector(selectFolders);
  const imagesMap = useAppSelector(selectImageMap);
  const images = useMemo(
    () => checkedImages.map((id) => imagesMap[id]).filter(filterFalsey),
    [checkedImages, imagesMap]
  );

  const [deleteAllVersions, setDeleteAllVersions] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeleteAllVersions(e.target.checked);
  };
  const createArray = (allVersions = deleteAllVersions) =>
    allVersions
      ? images
          .map((image) => folders.map((folder) => `${folder}/${image.name}`))
          .flat(1)
      : images.map((image) => image.fullPath);
  const deleteImages = async () => {
    const array = createArray();
    dispatch(setLoading(true));
    try {
      await batchStorageDelete(array);

      queue.notify({ title: "Successfully deleted files." });
      clearChecked();
      close();
      dispatch(listAll());
    } catch (error) {
      queue.notify({ title: `Failed to delete files: ${error}` });
      console.log(error);
      dispatch(setLoading(false));
    }
  };
  return (
    <Dialog className="delete-image-dialog" onClose={close} open={open}>
      <DialogTitle>{pluralise`Delete ${[images.length, "image"]}`}</DialogTitle>
      <DialogContent>
        {pluralise`The following ${[images.length, "image"]} will be deleted:`}
        <div className="chips-container">
          <ChipSet>
            {images.map((image) => (
              <Chip
                key={image.fullPath}
                disabled
                label={image.name}
                onTrailingIconInteraction={() =>
                  toggleImageChecked(imageAdapter.selectId(image))
                }
                trailingIcon="close"
              />
            ))}
          </ChipSet>
        </div>
        {`Are you sure you want to delete ${
          images.length > 1 ? "these" : "this"
        }?`}{" "}
        This cannot be undone.
      </DialogContent>
      <DialogActions>
        <div className="checkbox-container">
          <Checkbox
            checked={deleteAllVersions}
            label="Delete all versions"
            onChange={handleChange}
          />
        </div>
        <DialogButton action="close" label="Close" onClick={close} />
        <DialogButton
          className="delete"
          label="Delete"
          onClick={deleteImages}
        />
      </DialogActions>
    </Dialog>
  );
};
