import { memo } from "react";

const SvgPublicAdd = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path
      opacity={0.3}
      d="M11 18v1.9C7.1 19.4 4 16 4 12c0-.6.1-1.2.2-1.8L9 15v1c0 1.1.9 2 2 2zm4-5v3c.9-1.2 2.3-2 4-2 .2 0 .5 0 .7.1.2-.7.3-1.4.3-2.1 0-3.3-2.1-6.2-5-7.4V5c0 1.1-.9 2-2 2h-2v2c0 .5-.5 1-1 1H8v2h6c.5 0 1 .5 1 1z"
    />
    <path d="M14 19c0-1.1.4-2.2 1-3v-3c0-.5-.5-1-1-1H8v-2h2c.5 0 1-.5 1-1V7h2c1.1 0 2-.9 2-2v-.4c2.9 1.2 5 4.1 5 7.4 0 .7-.1 1.4-.3 2.1.7.1 1.3.3 1.9.7.3-.9.4-1.8.4-2.8 0-5.5-4.5-10-10-10S2 6.5 2 12s4.5 10 10 10c1 0 1.9-.1 2.8-.4-.5-.8-.8-1.6-.8-2.6zm-3 .9C7.1 19.4 4 16 4 12c0-.6.1-1.2.2-1.8L9 15v1c0 1.1.9 2 2 2v1.9zm11 .1h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2z" />
  </svg>
);

const MemoSvgPublicAdd = memo(SvgPublicAdd);
export default MemoSvgPublicAdd;
