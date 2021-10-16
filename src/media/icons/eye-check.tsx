import { memo } from "react";

const SvgEyeCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      d="M13.717 16.156a4.512 4.512 0 112.439-2.44 5.995 5.995 0 014.017-.6A9.949 9.949 0 0020.82 12a9.822 9.822 0 00-17.64 0A9.77 9.77 0 0012 17.5a9.959 9.959 0 001.219-.085 5.964 5.964 0 01.498-1.26z"
      opacity={0.3}
      style={{
        isolation: "isolate",
      }}
    />
    <path d="M12 7.5a4.5 4.5 0 101.717 8.656 6.025 6.025 0 012.439-2.44A4.492 4.492 0 0012 7.5zm0 7a2.5 2.5 0 112.5-2.5 2.5 2.5 0 01-2.5 2.5zm1.023 4.953A11.93 11.93 0 0112 19.5 11.827 11.827 0 011 12a11.817 11.817 0 0122 0 11.811 11.811 0 01-.932 1.85 5.952 5.952 0 00-1.895-.734A9.949 9.949 0 0020.82 12a9.822 9.822 0 00-17.64 0A9.77 9.77 0 0012 17.5a9.959 9.959 0 001.219-.085A5.991 5.991 0 0013 19c0 .153.012.303.023.453zM23.5 17l-5 5-3.5-3.5 1.5-1.5 2 2 3.5-3.5 1.5 1.5" />
  </svg>
);

const MemoSvgEyeCheck = memo(SvgEyeCheck);
export default MemoSvgEyeCheck;
