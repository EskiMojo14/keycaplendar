import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { CircularProgress } from "@rmwc/circular-progress";
import { Dialog, DialogContent, DialogTitle } from "@rmwc/dialog";
import { IconButton } from "@rmwc/icon-button";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { nanoid } from "nanoid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { selectShareNameLoading, setShareNameLoading } from "@s/settings";
import { selectFavoritesId, selectShareName, setFavoritesId } from "@s/user";
import {
  debouncedSyncFavoritesId,
  debouncedSyncShareName,
} from "@s/user/functions";
import "./dialog-share-favorites.scss";

type DialogShareFavoritesProps = {
  open: boolean;
  close: () => void;
};

export const DialogShareFavorites = ({
  open,
  close,
}: DialogShareFavoritesProps) => {
  const dispatch = useAppDispatch();

  const docShareName = useAppSelector(selectShareName);
  const shareNameLoading = useAppSelector(selectShareNameLoading);

  const [shareName, setShareName] = useState("");

  useEffect(() => {
    setShareName(docShareName);
  }, [docShareName]);

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "shareName") {
      setShareName(value);
      dispatch(setShareNameLoading(true));
      debouncedSyncShareName(value);
    }
  };

  const favoritesId = useAppSelector(selectFavoritesId);

  const shareable = !!favoritesId;

  const arr = window.location.href.split("/");

  const shareLink =
    arr[0] + "//" + arr[2] + "/favorites?favoritesId=" + favoritesId;

  const copyLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const handleSwitchChange = ({
    target: { name, checked },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "shareFavorites") {
      const newId = checked ? nanoid() : "";
      dispatch(setFavoritesId(newId));
      debouncedSyncFavoritesId(newId);
    }
  };

  return (
    <Dialog className="share-dialog" onClose={close} open={open}>
      <DialogTitle>Share favorites</DialogTitle>
      <DialogContent>
        <div className="group">
          <div className="text-field-container">
            <TextField
              className="name-field"
              helpText={{
                persistent: true,
                validationMsg: false,
                children: "Displayed username to link viewers.",
              }}
              label="Display name"
              name="shareName"
              onChange={handleChange}
              outlined
              trailingIcon={
                shareNameLoading ? (
                  <CircularProgress size="medium" />
                ) : undefined
              }
              value={shareName}
            />
          </div>
        </div>
        <div className="group">
          <div className="switch-container">
            <Switch
              checked={shareable}
              label="Allow others to view"
              name="shareFavorites"
              onChange={handleSwitchChange}
            />
          </div>
          {shareable ? (
            <>
              <Typography use="caption">
                Note that switching this off and back on will generate a new ID,
                thus breaking any existing links.
              </Typography>
              <TextField
                className="display-link"
                helpText={{
                  persistent: true,
                  validationMsg: false,
                  children: "Anyone with the link can view.",
                }}
                outlined
                readOnly
                trailingIcon={
                  <IconButton icon="content_copy" onClick={copyLink} />
                }
                value={shareLink}
              />
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
