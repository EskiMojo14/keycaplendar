import React from "react";
import PropTypes from "prop-types";
import { Button } from "@rmwc/button";
import { Tooltip } from "@rmwc/tooltip";
import "./ToggleGroup.scss";

export const ToggleGroup = (props) => {
  return (
    <div {...props} className={`toggle-group ${props.className}`}>
      {props.children}
    </div>
  );
};

export const ToggleGroupButton = (props) => {
  if (props.tooltip) {
    return (
      <Tooltip
        enterDelay={props.tooltip.enterDelay ? props.tooltip.enterDelay : null}
        align={props.tooltip.align ? props.tooltip.align : null}
        content={props.tooltip.content ? props.tooltip.content : null}
      >
        <Button
          {...props}
          outlined
          className={
            (props.selected ? "mdc-button--selected" : "") +
            (props.className ? ` ${props.className}` : "") +
            (props.icon && !props.label ? " only-icon" : "")
          }
        />
      </Tooltip>
    );
  }
  return (
    <Button
      {...props}
      outlined
      className={
        (props.selected ? "mdc-button--selected" : "") +
        (props.className ? ` ${props.className}` : "") +
        (props.icon && !props.label ? " only-icon" : "")
      }
    />
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
    enterDelay: PropTypes.number,
    align: PropTypes.string,
    content: PropTypes.node.isRequired,
  }),
};
