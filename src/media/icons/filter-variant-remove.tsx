import { memo } from "react";

const SvgFilterVariantRemove = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M21 8H3V6h18v2m-7.19 8H10v2h3.09c.12-.72.37-1.39.72-2M18 11H6v2h12v-2m3.12 4.46L19 17.59l-2.12-2.13-1.41 1.42L17.59 19l-2.12 2.12 1.41 1.42L19 20.41l2.12 2.13 1.42-1.42L20.41 19l2.13-2.12-1.42-1.42z" />
  </svg>
);

const MemoSvgFilterVariantRemove = memo(SvgFilterVariantRemove);
export default MemoSvgFilterVariantRemove;
