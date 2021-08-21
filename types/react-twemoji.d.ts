declare module "react-twemoji" {
  import { ComponentType, PropsWithChildren } from "react";
  import { ParseObject } from "twemoji";

  type TwemojiProps = {
    noWrapper?: boolean;
    options?: Partial<ParseObject>;
    tag?: string;
  };

  export const Twemoji: ComponentType<PropsWithChildren<TwemojiProps>>;

  export default Twemoji;
}
