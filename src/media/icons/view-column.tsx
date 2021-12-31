import { memo } from "react";

const SvgViewColumn = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path
      d="M8.33 17H5V7h3.33v10zm5.34 0h-3.33V7h3.33v10zM19 17h-3.33V7H19v10z"
      opacity={0.3}
    />
    <path d="M3 5v14h18V5H3zm5.33 12H5V7h3.33v10zm5.34 0h-3.33V7h3.33v10zM19 17h-3.33V7H19v10z" />
  </svg>
);

const MemoSvgViewColumn = memo(SvgViewColumn);
export default MemoSvgViewColumn;
