export const ConditionalWrapper = ({ condition, wrapper, children }) => {
  return condition ? wrapper(children) : children;
};

export const BoolWrapper = ({ condition, trueWrapper, falseWrapper, children }) => {
  return condition ? trueWrapper(children) : falseWrapper(children);
};

export default ConditionalWrapper;
