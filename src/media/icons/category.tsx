import { memo } from "react";

const SvgCategory = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <circle cx={17.5} cy={17.5} opacity={0.3} r={2.5} />
    <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity={0.3} />
    <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7a2.5 2.5 0 010-5 2.5 2.5 0 010 5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
  </svg>
);

const MemoSvgCategory = memo(SvgCategory);
export default MemoSvgCategory;
