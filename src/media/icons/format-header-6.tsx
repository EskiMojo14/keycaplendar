import { memo } from "react";

const SvgFormatHeader6 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m12 0h4a2 2 0 012 2v1h-2V6h-4v4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2m0 8v4h4v-4h-4z" />
  </svg>
);

const MemoSvgFormatHeader6 = memo(SvgFormatHeader6);
export default MemoSvgFormatHeader6;
