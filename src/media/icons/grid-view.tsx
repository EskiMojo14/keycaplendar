import { memo } from "react";

const SvgGridView = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      d="M5 5h4v4H5zM5 15h4v4H5zM15 15h4v4h-4zM15 5h4v4h-4z"
      opacity={0.3}
    />
    <path d="M3 21h8v-8H3v8zm2-6h4v4H5v-4zM3 11h8V3H3v8zm2-6h4v4H5V5zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4z" />
  </svg>
);

const MemoSvgGridView = memo(SvgGridView);
export default MemoSvgGridView;
