import { memo } from "react";

const SvgRegex = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M16 16.92c-.33.05-.66.08-1 .08-.34 0-.67-.03-1-.08v-3.51l-2.5 2.48c-.5-.39-1-.89-1.39-1.39l2.48-2.5H9.08c-.05-.33-.08-.66-.08-1 0-.34.03-.67.08-1h3.51l-2.48-2.5c.19-.25.39-.5.65-.74.24-.26.49-.46.74-.65L14 8.59V5.08c.33-.05.66-.08 1-.08.34 0 .67.03 1 .08v3.51l2.5-2.48c.5.39 1 .89 1.39 1.39L17.41 10h3.51c.05.33.08.66.08 1 0 .34-.03.67-.08 1h-3.51l2.48 2.5c-.19.25-.39.5-.65.74-.24.26-.49.46-.74.65L16 13.41v3.51M5 19a2 2 0 012-2 2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2z" />
  </svg>
);

const MemoSvgRegex = memo(SvgRegex);
export default MemoSvgRegex;
