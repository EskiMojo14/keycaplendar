import { memo } from "react";

const SvgForum = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M15 11V4H4v8.17L5.17 11H6z" opacity={0.3} />
    <path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" />
  </svg>
);

const MemoSvgForum = memo(SvgForum);
export default MemoSvgForum;
