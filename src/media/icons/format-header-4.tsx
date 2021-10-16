import { memo } from "react";

const SvgFormatHeader4 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m15 14v-5h-5v-2l5-7h2v7h1v2h-1v5h-2m0-7V7.42L15.45 11H18z" />
  </svg>
);

const MemoSvgFormatHeader4 = memo(SvgFormatHeader4);
export default MemoSvgFormatHeader4;
