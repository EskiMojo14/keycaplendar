import { memo } from "react";

const SvgCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em" {...props}>
    <path fill="none" d="M0 0h24v24H0z" />
    <circle cx={12} cy={12} opacity={0.3} r={8} />
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
  </svg>
);

const MemoSvgCircle = memo(SvgCircle);
export default MemoSvgCircle;
