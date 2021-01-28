import React, { useState, useEffect } from "react";
import BEMHelper from "../../util/bemHelper";
import { TopAppBar, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import "./FullScreenDialog.scss";

const bemClasses = new BEMHelper("full-screen-dialog");

export const FullScreenDialog = (props) => {
  const [open, setOpen] = useState(!!props.open);
  const [opening, setOpening] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (props.open) {
      openDialog();
    } else {
      closeDialog();
    }
  }, [props.open]); // eslint-disable-line react-hooks/exhaustive-deps
  const openDialog = () => {
    setOpen(true);
    setAnimate(true);
    setTimeout(() => {
      setOpening(true);
    }, 1);
    setTimeout(() => {
      setAnimate(false);
      setOpening(false);
    }, 450);
  };
  const closeDialog = () => {
    setClosing(true);
    setTimeout(() => {
      if (props.onClose) {
        props.onClose();
      }
      setOpen(false);
      setClosing(false);
    }, 400);
  };
  const { open: propsOpen, ...filteredProps } = props;
  return (
    <>
      <div
        {...filteredProps}
        className={bemClasses({
          modifiers: {
            open: open,
            opening: opening,
            closing: closing,
            animate: animate,
          },
          extra: props.className,
        })}
      >
        {props.children}
      </div>
      <div className="full-screen-dialog-scrim"></div>
    </>
  );
};

export const FullScreenDialogAppBar = (props) => {
  return (
    <>
      <TopAppBar {...props} className={bemClasses({ element: "app-bar", extra: props.className })}>
        {props.children}
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export const FullScreenDialogContent = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "content", extra: props.className })}>
      {props.children}
    </div>
  );
};
