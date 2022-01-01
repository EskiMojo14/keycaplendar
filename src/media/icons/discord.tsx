import { memo } from "react";

const SvgDiscord = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M22 24l-5.25-5 .63 2H4.5A2.5 2.5 0 012 18.5v-15A2.5 2.5 0 014.5 1h15A2.5 2.5 0 0122 3.5V24M12 6.8c-2.68 0-4.56 1.15-4.56 1.15 1.03-.92 2.83-1.45 2.83-1.45l-.17-.17c-1.69.03-3.22 1.2-3.22 1.2-1.72 3.59-1.61 6.69-1.61 6.69 1.4 1.81 3.48 1.68 3.48 1.68l.71-.9c-1.25-.27-2.04-1.38-2.04-1.38S9.3 14.9 12 14.9s4.58-1.28 4.58-1.28-.79 1.11-2.04 1.38l.71.9s2.08.13 3.48-1.68c0 0 .11-3.1-1.61-6.69 0 0-1.53-1.17-3.22-1.2l-.17.17s1.8.53 2.83 1.45c0 0-1.88-1.15-4.56-1.15m-2.07 3.79c.65 0 1.18.57 1.17 1.27 0 .69-.52 1.27-1.17 1.27-.64 0-1.16-.58-1.16-1.27 0-.7.51-1.27 1.16-1.27m4.17 0c.65 0 1.17.57 1.17 1.27 0 .69-.52 1.27-1.17 1.27-.64 0-1.16-.58-1.16-1.27 0-.7.51-1.27 1.16-1.27z" />
  </svg>
);

const MemoSvgDiscord = memo(SvgDiscord);
export default MemoSvgDiscord;
