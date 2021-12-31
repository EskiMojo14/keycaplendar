import { memo } from "react";

const SvgEdit = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity={0.3} />
    <path d="M20.71 7.04a.996.996 0 000-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
  </svg>
);

const MemoSvgEdit = memo(SvgEdit);
export default MemoSvgEdit;
