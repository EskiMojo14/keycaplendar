import { FunctionComponent } from "react";
import { Typography, TypographyT } from "@rmwc/typography";

export const componentBuilder = (name: string, Component: FunctionComponent) =>
  Object.assign(
    (props: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { node, ordered, level, inline, isHeader, ...allProps } = props;
      return <Component {...allProps} />;
    },
    { displayName: "Custom " + name }
  );

export const typographyBuilder = (tag: string, typography: TypographyT) =>
  Object.assign(
    (props: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { node, ordered, level, inline, children, ...allProps } = props;
      return (
        <Typography use={typography} tag={tag} {...allProps}>
          {children}
        </Typography>
      );
    },
    { displayName: "Custom " + tag }
  );
