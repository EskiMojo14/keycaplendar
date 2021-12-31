import type { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";
import {
  FormatHeader1,
  FormatHeader2,
  FormatHeader3,
  FormatHeader4,
  FormatHeader5,
  FormatHeader6,
  Image,
  TableColumnAddAfter,
  TablePlus,
} from "@i";

export const markdownIcons: Record<string, IconPropT> = {
  bold: "format_bold",
  "checked-list": "checklist",
  code: "code",
  "column-after": iconObject(<TableColumnAddAfter />),
  h1: iconObject(<FormatHeader1 />),
  h2: iconObject(<FormatHeader2 />),
  h3: iconObject(<FormatHeader3 />),
  h4: iconObject(<FormatHeader4 />),
  h5: iconObject(<FormatHeader5 />),
  h6: iconObject(<FormatHeader6 />),
  header: "title",
  image: iconObject(<Image />),
  "insert-table": iconObject(<TablePlus />),
  italic: "format_italic",
  link: "link",
  "ordered-list": "format_list_numbered",
  quote: "format_quote",
  strikethrough: "strikethrough_s",
  "unordered-list": "format_list_bulleted",
};
