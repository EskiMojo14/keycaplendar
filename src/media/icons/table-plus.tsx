import { memo } from "react";

const SvgTablePlus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      d="M18 11h-6V7h6zM4 17h6v-4H4zm11.69-4H12v4h1.09a6 6 0 012.6-4zM4 11h6V7H4z"
      opacity={0.3}
      style={{
        isolation: "isolate",
      }}
    />
    <path d="M18 14h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3M4 3h14a2 2 0 012 2v7.08a6 6 0 00-4.32.92H12v4h1.08a6.1 6.1 0 000 2H4a2 2 0 01-2-2V5a2 2 0 012-2m0 4v4h6V7H4m8 0v4h6V7h-6m-8 6v4h6v-4z" />
  </svg>
);

const MemoSvgTablePlus = memo(SvgTablePlus);
export default MemoSvgTablePlus;
