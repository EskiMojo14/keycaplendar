import { memo } from "react";

const SvgSortAlphabeticalVariant = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M9.25 5l3.25-3.25L15.75 5h-6.5m6.5 14l-3.25 3.25L9.25 19h6.5m-6.86-4.7H6L5.28 17H2.91L6 7h3l3.13 10H9.67l-.78-2.7m-2.56-1.62h2.23l-.63-2.12-.26-.97-.25-.96h-.03l-.22.97-.24.98-.6 2.1M13.05 17v-1.26l4.75-6.77v-.06h-4.3V7h7.23v1.34L16.09 15v.08h4.71V17h-7.75z" />
  </svg>
);

const MemoSvgSortAlphabeticalVariant = memo(SvgSortAlphabeticalVariant);
export default MemoSvgSortAlphabeticalVariant;
