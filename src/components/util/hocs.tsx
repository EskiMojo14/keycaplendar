import { Tooltip, TooltipProps } from "@rmwc/tooltip";

export const withTooltip = (
  children: TooltipProps["children"],
  content: TooltipProps["content"],
  props?: Omit<TooltipProps, "content" | "children">
) => (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  );
