import { memo } from "react";

const SvgFormatHeader3 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m12 0h4a2 2 0 012 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1h2v1h4v-4h-4v-2h4V6h-4v1h-2V6a2 2 0 012-2z" />
  </svg>
);

const MemoSvgFormatHeader3 = memo(SvgFormatHeader3);
export default MemoSvgFormatHeader3;
