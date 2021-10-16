import { memo } from "react";

const SvgFormatHeader5 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m12 0h5v2h-5v4h2a4 4 0 014 4 4 4 0 01-4 4h-2a2 2 0 01-2-2v-1h2v1h2a2 2 0 002-2 2 2 0 00-2-2h-2a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </svg>
);

const MemoSvgFormatHeader5 = memo(SvgFormatHeader5);
export default MemoSvgFormatHeader5;
