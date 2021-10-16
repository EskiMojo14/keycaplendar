import { memo } from "react";

const SvgKofi = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path opacity={0.3} d="M8 17h6c1.1 0 2-.9 2-2V7H6v8c0 1.1.9 2 2 2z" />
    <path d="M4 15c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4v-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H4v10zm14-8h2v3h-2V7zM6 7h10v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V7z" />
    <path d="M6.9 10.6c0 .6.2 1.1.6 1.4l3.5 3.5 3.5-3.5c.4-.4.6-.9.6-1.4 0-1.1-.9-2.1-2.1-2.1-.6 0-1.1.2-1.4.6l-.6.6-.6-.6c-.4-.4-.9-.6-1.5-.6-1.1 0-2 .9-2 2.1z" />
  </svg>
);

const MemoSvgKofi = memo(SvgKofi);
export default MemoSvgKofi;
