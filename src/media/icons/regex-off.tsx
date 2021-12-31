import { memo } from "react";

const SvgRegexOff = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M20.92 12h-3.51l2.48 2.5c-.19.25-.39.5-.65.74-.24.26-.49.46-.74.65L16 13.41v.06L12.54 10h.05l-2.48-2.5c.19-.25.39-.5.65-.74.24-.26.49-.46.74-.65L14 8.59V5.08c.33-.05.66-.08 1-.08s.67.03 1 .08v3.51l2.5-2.48c.5.39 1 .89 1.39 1.39L17.41 10h3.51c.05.33.08.66.08 1s-.03.67-.08 1zM16 16.01l-2-2-.3-.3-1.41-1.41-.3-.3-1.74-1.74-6.11-6.12-1.28 1.27 6.19 6.19c.01.13.01.27.03.4h.37l1.58 1.58-.91.92c.39.5.89 1 1.39 1.39l.92-.91L14 16.56v.36c.13.02.26.02.39.03l4.19 4.19 1.27-1.27L16 16.01zM7 17c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const MemoSvgRegexOff = memo(SvgRegexOff);
export default MemoSvgRegexOff;
