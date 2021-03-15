import React from "react";
import BEMHelper from "../../util/bemHelper";
import { HTMLProps } from "../../util/types";
import { Button, ButtonProps } from "@rmwc/button";
import "./ToggleGroup.scss";

const bemClasses = new BEMHelper("toggle-group");

export const ToggleGroup = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ extra: props.className })}>
      {props.children}
    </div>
  );
};

type ToggleGroupButtonProps = HTMLProps &
  ButtonProps & {
    selected: boolean;
  };

export const ToggleGroupButton = (props: ToggleGroupButtonProps) => {
  return (
    <Button
      {...props}
      outlined
      className={bemClasses(
        "button",
        { "only-icon": !!props.icon && !props.label, selected: props.selected },
        props.className
      )}
    />
  );
};
