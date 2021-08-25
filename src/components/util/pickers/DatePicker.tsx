import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { useRifm } from "rifm";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectOrientation } from "@s/common";
import BEMHelper from "@s/common/bemHelper";
import { Common, Overwrite } from "@s/common/types";
import { capitalise, iconObject } from "@s/util/functions";
import { Dialog, DialogActions, DialogButton, DialogProps } from "@rmwc/dialog";
import { Button } from "@rmwc/button";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurface, MenuSurfaceAnchor, MenuSurfaceProps, MenuHTMLProps } from "@rmwc/menu";
import { TextField, TextFieldHelperTextProps, TextFieldHTMLProps, TextFieldProps } from "@rmwc/textfield";
import { KeyboardDatePicker, KeyboardDatePickerProps } from "@material-ui/pickers";
import { ConditionalWrapper } from "@c/util/ConditionalWrapper";
import { withTooltip } from "@c/util/HOCs";
import "./pickers.scss";

const parseDigits = (string: string) => (string.match(/\d+/g) || []).join("");

const formatDate = (string: string, month?: boolean, allowQuarter?: boolean) => {
  const digits = parseDigits(string);
  const chars = digits.split("");
  if (allowQuarter && string.charAt(0) === "Q") {
    return "Q" + chars.reduce((r, v, index) => (index === 0 ? `${r}${v} ` : r + v), "").substr(0, 6);
  } else {
    return chars
      .reduce((r, v, index) => (index === 4 || (index === 6 && !month) ? `${r}-${v}` : r + v), "")
      .substr(0, month ? 7 : 10);
  }
};

const formatDateWithAppend = (month?: boolean, allowQuarter?: boolean) => (string: string) => {
  const res = formatDate(string, month, allowQuarter);
  if ((res.length === 4 || (res.length === 7 && !month)) && (!allowQuarter || string.charAt(0) !== "Q")) {
    return res + "-";
  } else if (allowQuarter && string.charAt(0) !== "Q" && res.length === 1) {
    return res + " ";
  }
  return res;
};

/** Returns an error message if invalid, otherwise returns false. */

export const invalidDate = (
  date: string,
  month = false,
  required = false,
  allowQuarter = false,
  disableFuture = false
): string | false => {
  const luxonExplanation = DateTime.fromISO(date).invalidExplanation;
  if (allowQuarter && /^Q[1-4]{1} \d{4}$/.test(date)) {
    // allow Q1-4 YYYY if quarters are allowed.
    return false;
  } else if (!date && required) {
    return "Field is required.";
  } else if (disableFuture && date && date > DateTime.now().toISODate()) {
    return "Date is in the future";
  } else if (date && luxonExplanation) {
    return `${luxonExplanation}${allowQuarter ? " (and date isn't Q1-4 YYYY)" : ""}`;
  } else if (required && !(date.length === (month ? 7 : 10))) {
    // valid ISO but not the format we want
    return `Format: ${month ? "YYYY-MM" : "YYYY-MM-DD"}${allowQuarter ? " or Q1-4 YYYY" : ""}`;
  }
  return false;
};

export type DatePickerProps = Overwrite<
  Omit<TextFieldProps & TextFieldHTMLProps, "onFocus" | "onBlur" | "helpText">,
  {
    value: string;
    onChange: (val: string) => void;
    helpTextProps?: TextFieldHelperTextProps;
    modalProps?: Omit<
      Common<MenuSurfaceProps & MenuHTMLProps, DialogProps & React.HTMLProps<HTMLElement>>,
      "open" | "anchorCorner" | "renderToPortal"
    >;
    pickerProps?: Omit<KeyboardDatePickerProps, "value" | "onChange" | "orientation" | "variant" | "views">;
    month?: boolean;
    allowQuarter?: boolean;
    showNowButton?: boolean;
  }
>;

const bemClasses = new BEMHelper("picker");

export const DatePicker = ({
  pickerProps,
  modalProps,
  value,
  onChange,
  month,
  allowQuarter,
  showNowButton,
  ...props
}: DatePickerProps) => {
  const device = useAppSelector(selectDevice);
  const useInline = device === "desktop";
  const orientation = useAppSelector(selectOrientation);
  const landscape = orientation === "landscape";

  const [touched, setTouched] = useState(false);
  const invalid = touched ? invalidDate(value, month, props.required, allowQuarter, pickerProps?.disableFuture) : false;

  console.log(invalid);

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

  const rifm = useRifm({
    value: value,
    onChange: onChange,
    accept: allowQuarter ? /\d|\s|Q/g : /\d/g,
    format: formatDateWithAppend(month, allowQuarter),
  });

  const [open, setOpen] = useState(false);

  const [dialogVal, setDialogVal] = useState(value);
  useEffect(() => {
    if (dialogVal !== value) {
      setDialogVal(value);
    }
  }, [value]);

  const confirmVal = useInline ? onChange : setDialogVal;

  const handleDatePickerChange: KeyboardDatePickerProps["onChange"] = (date, value) => {
    const finalValue = (month ? date?.toFormat("yyyy-MM") : date?.toISODate()) || value || "";
    confirmVal(finalValue);
  };
  const setNow = () => {
    confirmVal(DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd"));
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const confirmDialog = () => {
    onChange(dialogVal || DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd"));
    closeDialog();
  };

  const modal = useInline ? (
    <MenuSurface
      {...modalProps}
      open={open && (!allowQuarter || value.charAt(0) !== "Q")}
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      anchorCorner="bottomLeft"
    >
      <KeyboardDatePicker
        value={value || DateTime.now().toISODate()}
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
  ) : (
    <Dialog
      {...modalProps}
      open={open}
      onClose={closeDialog}
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      renderToPortal
    >
      <KeyboardDatePicker
        value={dialogVal || DateTime.now().toISODate()}
        onChange={handleDatePickerChange}
        variant="static"
        orientation={orientation}
        views={views}
        openTo={openTo}
        minDate={minDate}
        maxDate={maxDate}
        {...pickerProps}
      />
      <ConditionalWrapper
        condition={landscape}
        wrapper={(children) => <div className={bemClasses("bottom-bar")}>{children}</div>}
      >
        <DialogActions>
          {showNowButton ? (
            <Button
              className={bemClasses("show-now-button")}
              label={month ? "This month" : "Today"}
              type="button"
              onClick={setNow}
            />
          ) : null}
          <DialogButton label="Cancel" isDefaultAction onClick={closeDialog} />
          <DialogButton label="Confirm" onClick={confirmDialog} />
        </DialogActions>
      </ConditionalWrapper>
    </Dialog>
  );

  return (
    <ConditionalWrapper
      condition={useInline}
      wrapper={(children) => <MenuSurfaceAnchor className={bemClasses()}>{children}</MenuSurfaceAnchor>}
    >
      <TextField
        {...props}
        value={rifm.value}
        onChange={rifm.onChange}
        className={bemClasses("field")}
        inputMode="numeric"
        pattern={`^\\d{4}-\\d{1,2}-\\d{1,2}$${allowQuarter ? "|^Q[1-4]{1} \\d{4}$" : ""}`}
        onFocus={() => {
          if (touched) {
            setTouched(false);
          }
          if (useInline) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          if (!touched) {
            setTouched(true);
          }
          if (useInline) {
            setOpen(false);
          }
        }}
        invalid={!!invalid}
        helpText={{
          persistent: true,
          validationMsg: true,
          children: invalid
            ? capitalise(invalid)
            : `Format: ${month ? "YYYY-MM" : "YYYY-MM-DD"}${allowQuarter ? " or Q1-4 YYYY" : ""}`,
          ...(props.helpTextProps || {}),
        }}
        trailingIcon={
          useInline
            ? undefined
            : withTooltip(
                <IconButton
                  icon={iconObject(
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 0 24 24"
                        width="24px"
                        fill="#000000"
                      >
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M5 8h14V6H5z" opacity=".3" />
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" />
                      </svg>
                    </div>
                  )}
                  onClick={() => setOpen(true)}
                />,
                "Date picker"
              )
        }
      />
      {modal}
    </ConditionalWrapper>
  );
};
