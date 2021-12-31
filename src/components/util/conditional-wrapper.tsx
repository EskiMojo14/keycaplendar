import type { ReactNode } from "react";

/**
 * Takes a condition, a wrapper function and children, and wraps children in wrapper if condition is true.
 */

export const ConditionalWrapper = ({
  children,
  condition,
  wrapper,
}: {
  condition: boolean;
  wrapper: (children: ReactNode) => JSX.Element;
  children: ReactNode;
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
  condition: boolean;
  trueWrapper: (children: ReactNode) => JSX.Element;
  falseWrapper: (children: ReactNode) => JSX.Element;
  children: ReactNode;
}) => (condition ? trueWrapper(children) : falseWrapper(children));

export default ConditionalWrapper;
