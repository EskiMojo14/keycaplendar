import { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";

export const useDebouncedValue = <T>(value: T, wait?: number) => {
  const [_value, _setValue] = useState(value);
  const setValue = useCallback(debounce(_setValue, wait), [_setValue]);
  useEffect(() => {
    setValue(value);
  }, [value]);
  return _value;
};

export default useDebouncedValue;
