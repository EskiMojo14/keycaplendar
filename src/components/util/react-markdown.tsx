import { useState } from "react";
import { Checkbox } from "@rmwc/checkbox";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from "@rmwc/data-table";
import { IconButton } from "@rmwc/icon-button";
import classNames from "classnames";
import ReactMarkdown from "react-markdown";
import type { ReactMarkdownOptions } from "react-markdown";
import ReactMde from "react-mde";
import type { ChildProps, Classes, L18n, ReactMdeProps } from "react-mde";
import type { CommandMap } from "react-mde/lib/definitions/types";
import gfm from "remark-gfm";
import BEMHelper from "@s/common/bem-helper";
import {
  headerFiveCommand,
  headerFourCommand,
  headerOneCommand,
  headerSixCommand,
  headerThreeCommand,
  headerTwoCommand,
  insertTableColumnAfter,
  insertTableCommand,
} from "@s/common/markdown-commands";
import { markdownIcons } from "@s/common/markdown-constants";
import { componentBuilder, typographyBuilder } from "@s/common/markdown-functions";
import { SegmentedButton, SegmentedButtonSegment } from "./segmented-button";
import "./react-markdown.scss";

const input = Object.assign(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ type, node, ...allProps }: Record<string, any>) => {
    if (type === "checkbox") {
      return <Checkbox {...allProps} />;
    } else {
      return <input type={type} {...allProps} />;
    }
  },
  { displayName: "Custom Input" }
);

const dataTableContainer = Object.assign(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ node, children, ...allProps }: Record<string, any>) => (
    <DataTable {...allProps}>
      <DataTableContent>{children}</DataTableContent>
    </DataTable>
  ),
  { displayName: "Custom table" }
);

const customComponents = {
  h1: typographyBuilder("h1", "headline5"),
  h2: typographyBuilder("h2", "headline6"),
  h3: typographyBuilder("h3", "overline"),
  h4: typographyBuilder("h4", "subtitle1"),
  h5: typographyBuilder("h4", "subtitle2"),
  h6: typographyBuilder("h5", "caption"),
  p: typographyBuilder("p", "body2"),
  li: typographyBuilder("li", "body2"),
  code: typographyBuilder("code", "body2"),
  input,
  table: dataTableContainer,
  thead: componentBuilder("thead", DataTableHead),
  tbody: componentBuilder("tbody", DataTableBody),
  tr: componentBuilder("tr", DataTableRow),
  th: componentBuilder("th", DataTableHeadCell),
  td: componentBuilder("td", DataTableCell),
};

type CustomReactMarkdownProps = ReactMarkdownOptions;

export const CustomReactMarkdown = ({ components, className, ...filteredProps }: CustomReactMarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[gfm]}
    components={{ ...customComponents, ...components }}
    className={classNames("markdown", className)}
    {...filteredProps}
  />
);

const bemClasses = new BEMHelper("markdown-editor");

type CustomReactMdeProps = Omit<ReactMdeProps, "generateMarkdownPreview" | "onTabChange" | "selectedTab"> & {
  required?: boolean;
};

export const CustomReactMde = ({
  toolbarCommands,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  l18n,
  classes,
  childProps,
  required,
  value,
  ...filteredProps
}: CustomReactMdeProps) => {
  const customCommands: CommandMap = {
    h1: headerOneCommand,
    h2: headerTwoCommand,
    h3: headerThreeCommand,
    h4: headerFourCommand,
    h5: headerFiveCommand,
    h6: headerSixCommand,
    "insert-table": insertTableCommand,
    "column-after": insertTableColumnAfter,
  };
  const customToolbarCommands = toolbarCommands
    ? toolbarCommands
    : [
        ["bold", "italic", "strikethrough"],
        ["link", "quote", "code", "image"],
        ["unordered-list", "ordered-list", "checked-list"],
        ["insert-table", "column-after"],
        ["h1", "h2", "h3", "h4", "h5", "h6"],
      ];
  const [selectedTab, setSelectedTab] = useState<"preview" | "write">("write");
  const customTabButtons: L18n = {
    write: (
      <SegmentedButton toggle>
        <SegmentedButtonSegment
          label="Write"
          tag="div"
          selected={selectedTab === "write"}
          onClick={() => setSelectedTab("write")}
        />
        <SegmentedButtonSegment
          label="Preview"
          tag="div"
          selected={selectedTab === "preview"}
          onClick={() => setSelectedTab("preview")}
        />
      </SegmentedButton>
    ),
    preview: null,
    uploadingImage: "Uploading image...",
    pasteDropSelect: "Attach files by dragging & dropping, selecting or pasting them.",
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onTabChange = () => {};

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const customClasses: Classes = {
    reactMde: [bemClasses(), classes ? classes.reactMde : ""],
    toolbar: [bemClasses("toolbar"), classes ? classes.toolbar : ""],
    preview: [bemClasses("preview"), classes ? classes.preview : ""],
    textArea: [bemClasses("textarea", { hovered, focused, invalid }), classes ? classes.textArea : ""],
    suggestionsDropdown: [bemClasses("dropdown"), classes ? classes.suggestionsDropdown : ""],
  };

  const customChildProps: ChildProps = {
    ...childProps,
    textArea: {
      ...childProps?.textArea,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => {
        setFocused(false);
        if (required) {
          setInvalid(value.length === 0);
        }
      },
      onInvalid: () => setInvalid(true),
      required,
    },
  };
  return (
    <ReactMde
      selectedTab={selectedTab}
      onTabChange={onTabChange}
      value={value}
      commands={customCommands}
      toolbarCommands={customToolbarCommands}
      l18n={customTabButtons}
      classes={customClasses}
      getIcon={(command) => <IconButton tag="div" icon={markdownIcons[command]} />}
      generateMarkdownPreview={(markdown) => Promise.resolve(<CustomReactMarkdown>{markdown}</CustomReactMarkdown>)}
      childProps={customChildProps}
      {...filteredProps}
    />
  );
};
