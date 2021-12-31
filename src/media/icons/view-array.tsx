import { memo } from "react";

const SvgViewArray = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 7h6v10H9z" opacity={0.3} />
    <path d="M15 7v10H9V7h6zm6-2h-3v14h3V5zm-4 0H7v14h10V5zM6 5H3v14h3V5z" />
  </svg>
);

const MemoSvgViewArray = memo(SvgViewArray);
export default MemoSvgViewArray;
