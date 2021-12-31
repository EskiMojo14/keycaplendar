import { memo } from "react";

const SvgFilterEdit = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M21 8H3V6h18v2zm-3 3H6v2h12v-2zm-4 6.116V16h-4v2h3.115l.885-.884zm7.04-3.986c.14 0 .27.06.38.17l1.28 1.28c.22.21.22.56 0 .77l-1 1-2.05-2.05 1-1c.11-.11.25-.17.39-.17m-1.97 1.75l2.05 2.05L15.06 23H13v-2.06l6.07-6.06" />
  </svg>
);

const MemoSvgFilterEdit = memo(SvgFilterEdit);
export default MemoSvgFilterEdit;
