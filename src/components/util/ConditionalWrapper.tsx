import React from "react";

/**
 * Takes a condition, a wrapper function and children, and wraps children in wrapper if condition is true.
 */

export const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: {
  condition: boolean;
  wrapper: (children: JSX.Element) => JSX.Element;
  children: React.ReactNode;
}): JSX.Element => {
  return condition ? wrapper(<>{children}</>) : <>{children}</>;
};

/**
 * Takes a condition, two wrapper functions and children, and wraps children in corresponding wrapper for condition.
 */

export const BoolWrapper = ({
  condition,
  trueWrapper,
  falseWrapper,
  children,
}: {
  condition: boolean;
  trueWrapper: (children: JSX.Element) => JSX.Element;
  falseWrapper: (children: JSX.Element) => JSX.Element;
  children: React.ReactNode;
}): JSX.Element => {
  return condition ? trueWrapper(<>{children}</>) : falseWrapper(<>{children}</>);
};

export default ConditionalWrapper;
