import type { ReactNode } from "react";

/**
 * Takes a condition, a wrapper function and children, and wraps children in wrapper if condition is true.
 */

export const ConditionalWrapper = ({
  children,
  condition,
  wrapper,
}: {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => JSX.Element;
}) => (condition ? wrapper(children) : <>{children}</>);

/**
 * Takes a condition, two wrapper functions and children, and wraps children in corresponding wrapper for condition.
 */

export const BoolWrapper = ({
  children,
  condition,
  falseWrapper,
  trueWrapper,
}: {
  children: ReactNode;
  condition: boolean;
  falseWrapper: (children: ReactNode) => JSX.Element;
  trueWrapper: (children: ReactNode) => JSX.Element;
}) => (condition ? trueWrapper(children) : falseWrapper(children));

export default ConditionalWrapper;
