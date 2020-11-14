import React from "react";
import PropTypes from "prop-types";
import { setTypes } from "../util/propTypeTemplates";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import "./DialogSales.scss";

export const DialogSales = (props) => {
  return (
    <Dialog className="sales-dialog" open={props.open} onClose={props.close}>
      <DialogTitle>Sales - {props.set.profile + " " + props.set.colorway}</DialogTitle>
      <DialogContent>
        <div className="sales-image">
          <img alt="Sales graph" src={props.set.sales} />
        </div>
        Created by dvorcol.
      </DialogContent>
      <DialogActions>
        <DialogButton label="Open original" tag="a" href={props.set.sales} target="_blank" rel="noopener noreferrer" />
        <DialogButton label="Close" onClick={props.close} />
      </DialogActions>
    </Dialog>
  );
};

export default DialogSales;

DialogSales.propTypes = {
  close: PropTypes.func,
  open: PropTypes.bool,
  set: PropTypes.shape(setTypes()),
};
