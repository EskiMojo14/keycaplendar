import React, { useState } from "react";
import { DateTime } from "luxon";
import { useRifm } from "rifm";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import BEMHelper from "@s/common/bemHelper";
import { iconObject } from "@s/common/functions";
import { Overwrite } from "@s/common/types";
import { Dialog } from "@rmwc/dialog";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurface, MenuSurfaceAnchor, MenuSurfaceProps, MenuHTMLProps } from "@rmwc/menu";
import { TextField, TextFieldHTMLProps, TextFieldProps } from "@rmwc/textfield";
import { KeyboardDatePicker, KeyboardDatePickerProps } from "@material-ui/pickers";
import { withTooltip } from "@c/util/HOCs";
import "./DatePicker.scss";
import { Button } from "@rmwc/button";

const parseDigits = (string: string) => (string.match(/\d+/g) || []).join("");

const formatDate = (string: string, month?: boolean) => {
  const digits = parseDigits(string);
  const chars = digits.split("");
  return chars
    .reduce((r, v, index) => (index === 4 || (index === 6 && !month) ? `${r}-${v}` : `${r}${v}`), "")
    .substr(0, !month ? 10 : 7);
};

const formatDateWithAppend = (string: string, month?: boolean) => {
  const res = formatDate(string);

  if (string.endsWith("-")) {
    if (res.length === 4 || (res.length === 7 && !month)) {
      return `${res}-`;
    }
  }
  return res;
};

export type DatePickerProps = Overwrite<
  Omit<TextFieldProps & TextFieldHTMLProps, "onFocus" | "onBlur" | "pattern">,
  {
    value: string;
    onChange: (val: string) => void;
    wrapperProps?: Omit<MenuSurfaceProps & MenuHTMLProps, "open" | "anchorCorner">;
    pickerProps?: Omit<KeyboardDatePickerProps, "value" | "onChange" | "orientation" | "variant" | "views">;
    month?: boolean;
    showNowButton?: boolean;
  }
>;

const bemClasses = new BEMHelper("date-picker");

export const DatePicker = ({
  pickerProps,
  wrapperProps,
  onChange,
  month,
  showNowButton,
  ...props
}: DatePickerProps) => {
  const device = useAppSelector(selectDevice);
  const useInline = device === "desktop";

  const datePattern = month ? "^\\d{4}-\\d{1,2}$" : "^\\d{4}-\\d{1,2}-\\d{1,2}$";
  const views: KeyboardDatePickerProps["views"] = month ? ["year", "month"] : undefined;
  const openTo: KeyboardDatePickerProps["openTo"] = month ? "month" : "date";

  const minDate = pickerProps?.minDate || "2000-01-01";
  const maxDate = pickerProps?.disableFuture
    ? DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd")
    : pickerProps?.maxDate
    ? pickerProps.maxDate
    : DateTime.now()
        .plus({ years: 2 })
        .toFormat(month ? "yyyy-MM" : "yyyy-MM-dd");

  const rifm = useRifm({ value: props.value, onChange: onChange, format: formatDateWithAppend });

  const handleDatePickerChange: KeyboardDatePickerProps["onChange"] = (date, value) => {
    const finalValue = (month ? date?.toFormat("yyyy-MM") : date?.toISODate()) || value || "";
    onChange(finalValue);
  };
  const setNow = () => {
    onChange(DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd"));
  };

  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  return useInline ? (
    <MenuSurfaceAnchor className={bemClasses()}>
      <TextField
        className={bemClasses("field")}
        pattern={datePattern}
        {...props}
        value={rifm.value}
        onChange={rifm.onChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      <MenuSurface
        {...wrapperProps}
        open={open}
        className={bemClasses("wrapper", { open }, [wrapperProps?.className || ""])}
        anchorCorner="bottomLeft"
      >
        <KeyboardDatePicker
          value={props.value || DateTime.now().toISODate()}
          onChange={handleDatePickerChange}
          variant="static"
          orientation="portrait"
          views={views}
          openTo={openTo}
          minDate={minDate}
          maxDate={maxDate}
          {...pickerProps}
        />
        {showNowButton ? (
          <div className={bemClasses("buttons")}>
            <Button label={month ? "This month" : "Today"} type="button" onClick={setNow} />
          </div>
        ) : null}
      </MenuSurface>
    </MenuSurfaceAnchor>
  ) : (
    <>
      <TextField
        {...props}
        value={rifm.value}
        onChange={rifm.onChange}
        className={bemClasses("field", "", props.className)}
        pattern={datePattern}
        trailingIcon={withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M5 8h14V6H5z" opacity=".3" />
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" />
                </svg>
              </div>
            )}
            onClick={() => setOpen(true)}
          />,
          "Date picker"
        )}
      />
      <Dialog
        open={open}
        onClose={closeDialog}
        className={bemClasses("wrapper", { open }, [wrapperProps?.className || ""])}
        renderToPortal
      >
        <KeyboardDatePicker
          value={props.value || DateTime.now().toISODate()}
          onChange={handleDatePickerChange}
          variant="static"
          orientation={device === "tablet" ? "landscape" : "portrait"}
          views={views}
          openTo={openTo}
          minDate={minDate}
          maxDate={maxDate}
          {...pickerProps}
        />
      </Dialog>
    </>
  );
};
