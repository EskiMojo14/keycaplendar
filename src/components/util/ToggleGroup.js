import React from "react";
import { Button } from "@rmwc/button";
import "./ToggleGroup.scss";

export const ToggleGroup = (props) => {
  return <div className={"toggle-group" + (props.className ? " " + props.className : "")}>{props.children}</div>;
};

export const ToggleGroupButton = (props) => {
  return (
    <Button
      outlined
      label={props.label ? props.label : null}
      icon={props.icon ? props.icon : null}
      className={
        (props.selected
          ? "mdc-button--selected" + (props.className ? " " + props.className : "")
          : props.className
          ? " " + props.className
          : "") + (props.icon && !props.label ? " only-icon" : "")
      }
      onClick={props.onClick}
    />
  );
};
