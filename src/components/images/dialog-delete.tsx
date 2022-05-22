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
import { notify } from "~/app/snackbar-queue";
import { useAppSelector } from "@h";
import {
  imageAdapter,
  selectCurrentFolder,
  selectImageMap,
  useDeleteImagesMutation,
  useGetAllImagesQuery,
} from "@s/images";
import { filterFalsey, pluralise } from "@s/util/functions";
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
  const currentFolder = useAppSelector(selectCurrentFolder);

  const { imagesMap = {} } = useGetAllImagesQuery(currentFolder, {
    selectFromResult: ({ data }) => ({
      imagesMap: data && selectImageMap(data),
    }),
  });

  const images = useMemo(
    () => checkedImages.map((id) => imagesMap[id]).filter(filterFalsey),
    [checkedImages, imagesMap]
  );

  const [deleteAllVersions, setDeleteAllVersions] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeleteAllVersions(e.target.checked);
  };
  const [deleteImagesFn] = useDeleteImagesMutation({
    selectFromResult: () => ({}),
  });
  const deleteImages = async () => {
    try {
      await deleteImagesFn({ all: deleteAllVersions, images }).unwrap();
      notify({ title: "Successfully deleted files." });
      clearChecked();
      close();
    } catch (error) {
      console.log(error);
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
