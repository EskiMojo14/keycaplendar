import { memo } from "react";

const SvgFavorites = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={24} width={24} {...props}>
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M12 21.1C5.4 15.2 1.5 11.7 1.5 7v-.6c-.6.9-1 2-1 3.2 0 3.8 3.4 6.9 10 12.8l1.5-1.3z" />
    <path
      d="M18 3.6c-1.5 0-3 1-3.6 2.4h-1.9c-.5-1.4-2-2.4-3.5-2.4-2 0-3.5 1.5-3.5 3.5 0 2.9 3.1 5.7 7.9 10l.1.1.1-.1c4.8-4.3 7.9-7.2 7.9-10 0-2-1.5-3.5-3.5-3.5z"
      opacity={0.3}
    />
    <path d="M18 1.6c-1.7 0-3.4.8-4.5 2.1-1.1-1.3-2.8-2.1-4.5-2.1-3.1 0-5.5 2.4-5.5 5.5 0 3.8 3.4 6.9 8.6 11.5l1.4 1.3 1.4-1.3c5.2-4.7 8.6-7.8 8.6-11.5 0-3.1-2.4-5.5-5.5-5.5zm-4.4 15.6l-.1.1-.1-.1c-4.8-4.3-7.9-7.2-7.9-10 0-2 1.5-3.5 3.5-3.5 1.5 0 3 1 3.6 2.4h1.9c.5-1.4 2-2.4 3.6-2.4 2 0 3.5 1.5 3.5 3.5-.1 2.8-3.2 5.7-8 10z" />
  </svg>
);

const MemoSvgFavorites = memo(SvgFavorites);
export default MemoSvgFavorites;
