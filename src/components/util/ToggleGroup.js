import React from "react";
import PropTypes from "prop-types";
import BEMHelper from "../../util/bemHelper";
import { ConditionalWrapper } from "./ConditionalWrapper";
import { Button } from "@rmwc/button";
import { Tooltip } from "@rmwc/tooltip";
import "./ToggleGroup.scss";

const bemClasses = new BEMHelper("toggle-group");

export const ToggleGroup = (props) => {
  return (
    <div {...props} className={bemClasses({ extra: props.className })}>
      {props.children}
    </div>
  );
};

export const ToggleGroupButton = (props) => {
  const { tooltip, ...filteredProps } = props;
  return (
    <ConditionalWrapper condition={tooltip} wrapper={(children) => <Tooltip {...tooltip}>{children}</Tooltip>}>
      <Button
        {...filteredProps}
        outlined
        className={bemClasses(
          "button",
          { "only-icon": props.icon && !props.label, selected: props.selected },
          props.className
        )}
      />
    </ConditionalWrapper>
  );
};

ToggleGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

ToggleGroupButton.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      strategy: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    }),
  ]),
  label: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  tooltip: PropTypes.shape({
    content: PropTypes.node.isRequired,
  }),
};
