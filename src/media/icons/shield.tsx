import { memo } from "react";

const SvgShield = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={24} width={24} {...props}>
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M6 6.39v4.7c0 4 2.55 7.7 6 8.83 3.45-1.13 6-4.82 6-8.83v-4.7l-6-2.25-6 2.25z" opacity={0.3} />
    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z" />
  </svg>
);

const MemoSvgShield = memo(SvgShield);
export default MemoSvgShield;
