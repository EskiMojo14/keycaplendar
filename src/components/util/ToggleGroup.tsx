import React from "react";
import * as RMWC from "@rmwc/types";
import BEMHelper from "../../util/bemHelper";
import { HTMLProps } from "../../util/types";
import { ConditionalWrapper } from "./ConditionalWrapper";
import { Button } from "@rmwc/button";
import { Tooltip, TooltipProps } from "@rmwc/tooltip";
import "./ToggleGroup.scss";

const bemClasses = new BEMHelper("toggle-group");

export const ToggleGroup = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ extra: props.className })}>
      {props.children}
    </div>
  );
};

type ToggleGroupButtonProps = HTMLProps & {
  icon?: RMWC.IconPropT;
  label: string;
  onClick: () => void;
  selected: boolean;
  tooltip: TooltipProps;
};

export const ToggleGroupButton = (props: ToggleGroupButtonProps) => {
  const { tooltip, ...filteredProps } = props;
  return (
    <ConditionalWrapper condition={!!tooltip} wrapper={(children) => <Tooltip {...tooltip}>{children}</Tooltip>}>
      <Button
        {...filteredProps}
        outlined
        className={bemClasses(
          "button",
          { "only-icon": !!props.icon && !props.label, selected: props.selected },
          props.className,
        )}
      />
    </ConditionalWrapper>
  );
};
