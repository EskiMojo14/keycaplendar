import type { FunctionComponent } from "react";
import { Typography } from "@rmwc/typography";
import type { TypographyT } from "@rmwc/typography";

export const componentBuilder = (name: string, Component: FunctionComponent) =>
  Object.assign(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ node, ordered, level, inline, isHeader, ...allProps }: Record<string, any>) => <Component {...allProps} />,
    { displayName: "Custom " + name }
  );

export const typographyBuilder = (tag: string, typography: TypographyT) =>
  Object.assign(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ node, ordered, level, inline, children, ...allProps }: Record<string, any>) => (
      <Typography use={typography} tag={tag} {...allProps}>
        {children}
      </Typography>
    ),
    { displayName: "Custom " + tag }
  );
