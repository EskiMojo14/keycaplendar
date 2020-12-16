import React, { useContext } from "react";
import PropTypes from "prop-types";
import { UserContext } from "../../util/contexts";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";

export const DialogDeleteFilterPreset = (props) => {
  const { deletePreset } = useContext(UserContext);
  const deleteFn = (e) => {
    e.preventDefault();
    deletePreset(props.preset);
    props.close();
  };
  return (
    <Dialog open={props.open}>
      <DialogTitle>Delete {`${props.preset.name}`}</DialogTitle>
      <DialogContent>Are you sure you want to delete the filter preset {props.preset.name}?</DialogContent>
      <DialogActions>
        <DialogButton action="close" onClick={props.close} isDefaultAction>
          Cancel
        </DialogButton>
        <DialogButton action="accept" className="delete" onClick={deleteFn}>
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeleteFilterPreset;

DialogDeleteFilterPreset.propTypes = {
  close: PropTypes.func,
  open: PropTypes.bool,
  preset: PropTypes.object,
};
