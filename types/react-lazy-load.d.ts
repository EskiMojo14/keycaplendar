declare module "react-lazy-load" {
  import { ComponentType, PropsWithChildren } from "react";

  interface LazyLoadProps {
    className?: string;
    /** Allows you to set the element's height even when it has no content. */
    height?: number | string;
    /** Allows you to set the element's width even when it has no content. */
    width?: number | string;
    /** By default the throttling function is actually a debounce function so that the checking function is only triggered after a user stops scrolling.
     * To use traditional throttling where it will only check the loadable content every `throttle` milliseconds, set `debounce` to `false`. */
    debounce?: boolean;
    /** Wrapper element to use. `div` by default. */
    elementType?: string;
    /** Allows you to specify how far below, above, to the left, and to the right of the viewport you want to begin displaying your content.
     * If you specify `0`, your content will be displayed as soon as it is visible in the viewport, if you want to load *1000px* below or above the viewport, use `1000`.
     */
    offset?: number;
    /** Allows you to specify how far below the viewport you want to *begin* displaying your content. */
    offsetBottom?: number;
    /** Allows you to specify how far to the left and right of the viewport you want to *begin* displaying your content. */
    offsetHorizontal?: number;
    /** Allows you to specify how far to left of the viewport you want to *begin* displaying your content. */
    offsetLeft?: number;
    /** Allows you to specify how far to the right of the viewport you want to *begin* displaying your content. */
    offsetRight?: number;
    /** Allows you to specify how far above the viewport you want to *begin* displaying your content. */
    offsetTop?: number;
    /** Allows you to specify how far above and below the viewport you want to *begin* displaying your content. */
    offsetVertical?: number;
    /** Allows you to specify how far below, above, to the left, and to the right of the viewport you want to begin displaying your content.
     * If you specify `0`, your content will be displayed as soon as it is visible in the viewport, if you want to load *1000px* below or above the viewport, use `1000`.
     */
    threshold?: number;
    /** The throttle is managed by an internal function that prevents performance issues from continuous firing of `scroll` events.
     * Using a throttle will set a small timeout when the user scrolls and will keep throttling until the user stops.
     * The default is `250` milliseconds.
     */
    throttle?: number;
    /** A callback function to execute when the content appears on the screen. */
    onContentVisible?: () => void;
  }

  export const LazyLoad: ComponentType<PropsWithChildren<LazyLoadProps>>;

  export default LazyLoad;
}
