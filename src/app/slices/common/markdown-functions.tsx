import type { FunctionComponent } from "react";
import { Typography } from "@rmwc/typography";
import type { TypographyT } from "@rmwc/typography";

export const componentBuilder = (name: string, Component: FunctionComponent) =>
  Object.assign(
    ({
      /* eslint-disable @typescript-eslint/no-unused-vars */
      inline,
      isHeader,
      level,
      node,
      ordered,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...props
    }: Record<string, any>) => <Component {...props} />,
    { displayName: `Custom ${name}` }
  );

export const typographyBuilder = (tag: string, typography: TypographyT) =>
  Object.assign(
    ({
      children,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      inline,
      level,
      node,
      ordered,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...props
    }: Record<string, any>) => (
      <Typography tag={tag} use={typography} {...props}>
        {children}
      </Typography>
    ),
    { displayName: `Custom ${tag}` }
  );
