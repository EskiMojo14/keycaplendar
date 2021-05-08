/* eslint-disable @typescript-eslint/no-unused-vars */
import { Typography } from "@rmwc/typography";
import React from "react";
import ReactMarkdown, { ReactMarkdownOptions } from "react-markdown";

const h1 = (props: Record<string, any>) => {
  const { node, children, ...allProps } = props;
  return (
    <Typography use="headline5" tag="h1" {...allProps}>
      {children}
    </Typography>
  );
};

const p = (props: Record<string, any>) => {
  const { node, children, ...allProps } = props;
  return (
    <Typography use="body2" tag="p" {...allProps}>
      {children}
    </Typography>
  );
};

const components = {
  h1: h1,
  p: p,
};

type CustomReactMarkdownProps = ReactMarkdownOptions;

export const CustomReactMarkdown = (props: CustomReactMarkdownProps) => {
  return <ReactMarkdown components={components}>{props.children}</ReactMarkdown>;
};
