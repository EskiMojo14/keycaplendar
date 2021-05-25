/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { TypographyT, Typography } from "@rmwc/typography";

export const typographyBuilder = (tag: string, typography: TypographyT) => {
  const component = (props: Record<string, any>) => {
    const { node, ordered, level, inline, children, ...allProps } = props;
    return (
      <Typography use={typography} tag={tag} {...allProps}>
        {children}
      </Typography>
    );
  };
  component.displayName = "Custom " + tag;
  return component;
};
