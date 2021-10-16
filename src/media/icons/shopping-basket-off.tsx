import { memo } from "react";

const SvgShoppingBasketOff = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path
      opacity={0.3}
      d="M20.7 11l-1.4 5.1-5.1-5.1h6.5zM12 17c-1.1 0-2-.9-2-2 0-.8.5-1.6 1.3-1.8L9.1 11H3.3l2.2 8h11.6l-3.3-3.3c-.2.8-1 1.3-1.8 1.3z"
    />
    <path d="M2.4 1.7L1.1 3l5.8 5.8-.1.2H2c-.5 0-1 .4-1 1v.3l2.5 9.3c.2.8 1 1.5 1.9 1.5h13c.2 0 .4 0 .5-.1l1.8 1.8 1.3-1.3L2.4 1.7M5.5 19l-2.2-8h5.8l2.2 2.1c-.8.3-1.3 1-1.3 1.9 0 1.1.9 2 2 2 .8 0 1.6-.5 1.9-1.3l3.3 3.3H5.5M23 10v.3l-2 7.5-1.6-1.6 1.4-5.1h-6.5l-2-2h2.6L12 4.8l-1.6 2.4L9 5.8l2.2-3.3c.2-.3.5-.5.8-.5s.6.2.8.4L17.2 9H22c.5 0 1 .4 1 1z" />
  </svg>
);

const MemoSvgShoppingBasketOff = memo(SvgShoppingBasketOff);
export default MemoSvgShoppingBasketOff;
