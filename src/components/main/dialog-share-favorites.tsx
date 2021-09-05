import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectShareNameLoading, setShareNameLoading } from "@s/settings";
import { selectFavoritesId, selectShareName, setFavoritesId } from "@s/user";
import { debouncedSyncFavoritesId, debouncedSyncShareName } from "@s/user/functions";
import { CircularProgress } from "@rmwc/circular-progress";
import { Dialog, DialogContent, DialogTitle } from "@rmwc/dialog";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import "./dialog-share-favorites.scss";
import { Typography } from "@rmwc/typography";
import { IconButton } from "@rmwc/icon-button";
import { queue } from "~/app/snackbar-queue";

type DialogShareFavoritesProps = {
  open: boolean;
  close: () => void;
};

export const DialogShareFavorites = (props: DialogShareFavoritesProps) => {
  const dispatch = useAppDispatch();

  const docShareName = useAppSelector(selectShareName);
  const shareNameLoading = useAppSelector(selectShareNameLoading);

  const [shareName, setShareName] = useState("");

  useEffect(() => {
    setShareName(docShareName);
  }, [docShareName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "shareName") {
      setShareName(value);
      dispatch(setShareNameLoading(true));
      debouncedSyncShareName(value);
    }
  };

  const favoritesId = useAppSelector(selectFavoritesId);

  const shareable = !!favoritesId;

  const arr = window.location.href.split("/");

  const shareLink = arr[0] + "//" + arr[2] + "/favorites?favoritesId=" + favoritesId;

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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const checked = e.target.checked;
    if (name === "shareFavorites") {
      const newId = checked ? nanoid() : "";
      dispatch(setFavoritesId(newId));
      debouncedSyncFavoritesId(newId);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.close} className="share-dialog">
      <DialogTitle>Share favorites</DialogTitle>
      <DialogContent>
        <div className="group">
          <div className="text-field-container">
            <TextField
              outlined
              name="shareName"
              label="Display name"
              className="name-field"
              trailingIcon={shareNameLoading ? <CircularProgress size="medium" /> : undefined}
              helpText={{ persistent: true, validationMsg: false, children: "Displayed username to link viewers." }}
              value={shareName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="group">
          <div className="switch-container">
            <Switch
              label="Allow others to view"
              name="shareFavorites"
              checked={shareable}
              onChange={handleSwitchChange}
            />
          </div>
          {shareable ? (
            <>
              <Typography use="caption">
                Note that switching this off and back on will generate a new ID, thus breaking any existing links.
              </Typography>
              <TextField
                outlined
                readOnly
                value={shareLink}
                className="display-link"
                trailingIcon={<IconButton icon="content_copy" onClick={copyLink} />}
                helpText={{ persistent: true, validationMsg: false, children: "Anyone with the link can view." }}
              />
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
