import React from "react";
import { Tooltip, TooltipProps } from "@rmwc/tooltip";

export const withTooltip = (
  children: TooltipProps["children"],
  content: TooltipProps["content"],
  props?: Omit<TooltipProps, "content" | "children">
) => {
  const defaultProps: Omit<TooltipProps, "content" | "children"> = { enterDelay: 500, align: "bottom" };
  return (
    <Tooltip content={content} {...defaultProps} {...props}>
      {children}
    </Tooltip>
  );
};
