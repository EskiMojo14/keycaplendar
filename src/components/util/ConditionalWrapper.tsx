import React from "react";

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
