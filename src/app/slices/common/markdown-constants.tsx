import { IconPropT } from "@rmwc/types";
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
  header: "title",
  bold: "format_bold",
  italic: "format_italic",
  strikethrough: "strikethrough_s",
  link: "link",
  quote: "format_quote",
  code: "code",
  image: iconObject(<Image />, {}, true),
  "unordered-list": "format_list_bulleted",
  "ordered-list": "format_list_numbered",
  "checked-list": "checklist",
  h1: iconObject(<FormatHeader1 />, {}, true),
  h2: iconObject(<FormatHeader2 />, {}, true),
  h3: iconObject(<FormatHeader3 />, {}, true),
  h4: iconObject(<FormatHeader4 />, {}, true),
  h5: iconObject(<FormatHeader5 />, {}, true),
  h6: iconObject(<FormatHeader6 />, {}, true),
  "insert-table": iconObject(<TablePlus />, {}, true),
  "column-after": iconObject(<TableColumnAddAfter />, {}, true),
};
