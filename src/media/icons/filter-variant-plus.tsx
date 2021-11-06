import { memo } from "react";

const SvgFilterVariantPlus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path d="M21 8H3V6h18v2m-7.19 8H10v2h3.09c.12-.72.37-1.39.72-2M18 11H6v2h12v-2m0 4v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z" />
  </svg>
);

const MemoSvgFilterVariantPlus = memo(SvgFilterVariantPlus);
export default MemoSvgFilterVariantPlus;