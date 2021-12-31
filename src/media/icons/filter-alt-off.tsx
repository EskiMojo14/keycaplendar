import { memo } from "react";

const SvgFilterAltOff = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M0 0h24m0 24H0" fill="none" />
    <path d="M9.284 6l-1.98-2H18.95a.998.998 0 01.79 1.61c-1.372 1.76-3.526 4.534-4.768 6.136l-1.41-1.424L17 6zM22 21.5l-8-8.082v-.04l-1.59-1.607-.018.023-4.017-4.058-.163-.206-3.454-3.49c-.01.004-.019.01-.029.013L2.4 1.7 1.1 3l5.24 5.294L10 13v6a1.003 1.003 0 001 1h2a1.003 1.003 0 001-1v-2.968l6.7 6.768z" />
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      opacity={0.3}
      style={{
        isolation: "isolate",
      }}
      d="M13.563 10.322L17 6H9.284l4.279 4.322z"
    />
  </svg>
);

const MemoSvgFilterAltOff = memo(SvgFilterAltOff);
export default MemoSvgFilterAltOff;
