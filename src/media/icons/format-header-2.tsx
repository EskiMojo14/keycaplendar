import { memo } from "react";

const SvgFormatHeader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m18 14h-6a2 2 0 01-2-2c0-.53.2-1 .54-1.36l4.87-5.23c.37-.36.59-.86.59-1.41a2 2 0 00-2-2 2 2 0 00-2 2h-2a4 4 0 014-4 4 4 0 014 4c0 1.1-.45 2.1-1.17 2.83L15 16h6v2z" />
  </svg>
);

const MemoSvgFormatHeader2 = memo(SvgFormatHeader2);
export default MemoSvgFormatHeader2;
