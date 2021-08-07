import React from "react";
import { Tooltip, TooltipProps } from "@rmwc/tooltip";

export const withTooltip = (
  children: TooltipProps["children"],
  content: TooltipProps["content"],
  props?: Omit<TooltipProps, "content" | "children">
) => {
  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  );
};
