declare module "react-twemoji" {
  import { ComponentType, PropsWithChildren } from "react";
  import { ParseObject } from "twemoji";

  type TwemojiProps = {
    /** twemoji.parse options. */
    options?: Partial<ParseObject>;
    /** When `true`, `Twemoji` will not render a wrapping element (with `tag`) to contain children.
     *
     * Note that since `twemoji.parse` needs an DOM element reference,
     * any direct pure text child of `Twemoji` is not parsed when `noWrapper` is `true`.
     *
     * e.g. `foo` in `<Twemoji noWrapper={true}>foo<p>bar</p></Twmoji>` is not parsed.
     */
    noWrapper?: boolean;
    /** The tag of the wrapping element. `div` by default.
     *
     * This option is ignored when `noWrapper` is `true`.
     * */
    tag?: string;
  };

  export const Twemoji: ComponentType<PropsWithChildren<TwemojiProps>>;

  export default Twemoji;
}
