import type { HTMLProps } from "react";
import { TopAppBarSection } from "@rmwc/top-app-bar";
import type { TopAppBarSectionProps } from "@rmwc/top-app-bar";
import type * as RMWC from "@rmwc/types";

export const AppBarIndent = <Tag extends React.ElementType<any> = "div">(
  props: RMWC.ComponentProps<TopAppBarSectionProps, HTMLProps<HTMLElement>, Tag>
) => (
  <TopAppBarSection className="indent" alignEnd {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="128"
      height="56"
      viewBox="0 0 128 56"
    >
      <path
        d="M107.3,0a8.042,8.042,0,0,0-7.9,6.6A36.067,36.067,0,0,1,64,36,36.067,36.067,0,0,1,28.6,6.6,8.042,8.042,0,0,0,20.7,0H0V56H128V0Z"
        fill="inherit"
      />
    </svg>
    <div className="fill"></div>
  </TopAppBarSection>
);

AppBarIndent.displayName = "AppBarIndent";

export default AppBarIndent;
