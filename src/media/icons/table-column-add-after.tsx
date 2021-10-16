import { memo } from "react";

const SvgTableColumnAddAfter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      d="M11 14H4v-4h7zm0 2H4v4h7zM4 8h7V4H4z"
      opacity={0.3}
      style={{
        isolation: "isolate",
      }}
    />
    <path d="M11 2a2 2 0 012 2v16a2 2 0 01-2 2H2V2h9m-7 8v4h7v-4H4m0 6v4h7v-4H4M4 4v4h7V4H4m11 7h3V8h2v3h3v2h-3v3h-2v-3h-3z" />
  </svg>
);

const MemoSvgTableColumnAddAfter = memo(SvgTableColumnAddAfter);
export default MemoSvgTableColumnAddAfter;
