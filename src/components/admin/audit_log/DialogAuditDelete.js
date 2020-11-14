import React from "react";
import PropTypes from "prop-types";
import { actionTypes } from "../../util/propTypeTemplates";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";

export const DialogAuditDelete = (props) => {
  return (
    <Dialog open={props.open}>
      <DialogTitle>Delete Action</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the changelog entry with the ID {props.deleteAction.changelogId}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" onClick={props.close} isDefaultAction>
          Cancel
        </DialogButton>
        <DialogButton
          action="accept"
          className="delete"
          onClick={() => {
            props.deleteActionFn(props.deleteAction);
          }}
        >
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

DialogAuditDelete.propTypes = {
  close: PropTypes.func,
  deleteAction: PropTypes.shape(actionTypes),
  deleteActionFn: PropTypes.func,
  open: PropTypes.bool,
};
