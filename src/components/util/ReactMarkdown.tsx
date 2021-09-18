import { useState } from "react";
import classNames from "classnames";
import BEMHelper from "@s/common/bemHelper";
import {
  headerOneCommand,
  headerTwoCommand,
  headerThreeCommand,
  headerFourCommand,
  headerFiveCommand,
  headerSixCommand,
  insertTableCommand,
  insertTableColumnAfter,
} from "@s/common/markdownCommands";
import { markdownIcons } from "@s/common/markdownConstants";
import { componentBuilder, typographyBuilder } from "@s/common/markdownFunctions";
import ReactMarkdown, { ReactMarkdownOptions } from "react-markdown";
import ReactMde, { ChildProps, Classes, L18n, ReactMdeProps } from "react-mde";
import { CommandMap } from "react-mde/lib/definitions/types";
import gfm from "remark-gfm";
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
import { SegmentedButton, SegmentedButtonSegment } from "./SegmentedButton";
import "./ReactMarkdown.scss";

const input = Object.assign(
  (props: Record<string, any>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, node, ...allProps } = props;
    if (type === "checkbox") {
      return <Checkbox {...allProps} />;
    } else {
      return <input type={type} {...allProps} />;
    }
  },
  { displayName: "Custom Input" }
);

const dataTableContainer = Object.assign(
  (props: Record<string, any>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { node, children, ...allProps } = props;
    return (
      <DataTable {...allProps}>
        <DataTableContent>{children}</DataTableContent>
      </DataTable>
    );
  },
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
  input: input,
  table: dataTableContainer,
  thead: componentBuilder("thead", DataTableHead),
  tbody: componentBuilder("tbody", DataTableBody),
  tr: componentBuilder("tr", DataTableRow),
  th: componentBuilder("th", DataTableHeadCell),
  td: componentBuilder("td", DataTableCell),
};

type CustomReactMarkdownProps = ReactMarkdownOptions;

export const CustomReactMarkdown = (props: CustomReactMarkdownProps) => {
  const { components, className, children, ...filteredProps } = props;
  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      components={{ ...customComponents, ...components }}
      className={classNames("markdown", className)}
      {...filteredProps}
    >
      {children}
    </ReactMarkdown>
  );
};
const bemClasses = new BEMHelper("markdown-editor");

type CustomReactMdeProps = Omit<ReactMdeProps, "generateMarkdownPreview" | "selectedTab" | "onTabChange"> & {
  required?: boolean;
};

export const CustomReactMde = (props: CustomReactMdeProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toolbarCommands, l18n, classes, childProps, required, value, ...filteredProps } = props;
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
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
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
      required: required,
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
