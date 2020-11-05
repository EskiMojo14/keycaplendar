import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@rmwc/dialog";
import "./DialogSales.scss";

export const DialogSales = (props) => {
  return (
    <Dialog className="sales-dialog" open={props.open} onClose={props.close}>
      <DialogTitle>Sales - {props.set.profile + " " + props.set.colorway}</DialogTitle>
      <div className="sales-image">
        <img alt="Sales graph" src={props.set.sales} />
      </div>
      <DialogContent>Created by dvorcol.</DialogContent>
    </Dialog>
  );
};

export default DialogSales;
