import { useState, useEffect, HTMLProps } from "react";
import { KeyboardDatePicker, KeyboardDatePickerProps } from "@material-ui/pickers";
import { Button } from "@rmwc/button";
import { Dialog, DialogActions, DialogButton, DialogProps } from "@rmwc/dialog";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurface, MenuSurfaceAnchor, MenuSurfaceProps, MenuHTMLProps } from "@rmwc/menu";
import { TextField, TextFieldHelperTextProps, TextFieldHTMLProps, TextFieldProps } from "@rmwc/textfield";
import { DateTime } from "luxon";
import { useRifm } from "rifm";
import { useAppSelector } from "~/app/hooks";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectOrientation } from "@s/common";
import BEMHelper from "@s/common/bem-helper";
import { capitalise, iconObject } from "@s/util/functions";
import { Common, Overwrite } from "@s/util/types";
import { Event } from "@i";
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
  const { invalidExplanation: luxonExplanation } = DateTime.fromISO(date);
  if (allowQuarter && /^Q[1-4]{1} \d{4}$/.test(date)) {
    // allow Q1-4 YYYY if quarters are allowed.
    return false;
  } else if (required && !date) {
    return "Field is required.";
  } else if (disableFuture && date && date > DateTime.now().toISODate()) {
    return "Date is in the future";
  } else if (luxonExplanation && date) {
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
    fallbackValue?: string;
    onChange: (val: string) => void;
    helpTextProps?: TextFieldHelperTextProps;
    modalProps?: Omit<
      Common<MenuSurfaceProps & MenuHTMLProps, DialogProps & HTMLProps<HTMLElement>>,
      "open" | "anchorCorner" | "renderToPortal"
    >;
    pickerProps?: Omit<KeyboardDatePickerProps, "value" | "onChange" | "orientation" | "variant" | "views">;
    month?: boolean;
    allowQuarter?: boolean;
    showNowButton?: boolean;
    saveOnClose?: boolean;
  }
>;

const bemClasses = new BEMHelper("picker");

export const DatePicker = ({
  pickerProps,
  modalProps,
  value,
  fallbackValue,
  onChange,
  month,
  allowQuarter,
  showNowButton,
  saveOnClose,
  ...props
}: DatePickerProps) => {
  const device = useAppSelector(selectDevice);
  const useInline = device === "desktop";
  const orientation = useAppSelector(selectOrientation);
  const landscape = orientation === "landscape";

  const [touched, setTouched] = useState(false);
  const invalid = touched ? invalidDate(value, month, props.required, allowQuarter, pickerProps?.disableFuture) : false;

  const validFallback = invalidDate(fallbackValue || "") ? "" : fallbackValue;

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
    value,
    onChange,
    accept: allowQuarter ? /\d|\s|Q/g : /\d/g,
    format: formatDateWithAppend(month, allowQuarter),
  });

  const [open, setOpen] = useState(false);

  const [dialogVal, setDialogVal] = useState(value);
  useEffect(() => {
    if (dialogVal !== value) {
      setDialogVal(value || validFallback || DateTime.now().toISODate());
    }
  }, [value, fallbackValue]);

  const confirmVal = useInline && !saveOnClose ? onChange : setDialogVal;

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
    onChange(dialogVal || validFallback || DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd"));
    closeDialog();
  };

  const modal = useInline ? (
    <MenuSurface
      {...modalProps}
      open={open && (!allowQuarter || value.charAt(0) !== "Q")}
      onClose={saveOnClose ? confirmDialog : undefined}
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      anchorCorner="bottomLeft"
    >
      <KeyboardDatePicker
        value={saveOnClose ? dialogVal : value || validFallback || DateTime.now().toISODate()}
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
        value={dialogVal || validFallback || DateTime.now().toISODate()}
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
      wrapper={(children) => <MenuSurfaceAnchor className={bemClasses("anchor")}>{children}</MenuSurfaceAnchor>}
    >
      <TextField
        {...props}
        value={rifm.value}
        onChange={rifm.onChange}
        className={bemClasses("field")}
        inputMode="numeric"
        pattern={`^\\d{4}-\\d{1,2}${!month ? "-\\d{1,2}" : ""}$${allowQuarter ? "|^Q[1-4]{1} \\d{4}$" : ""}`}
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
            : withTooltip(<IconButton icon={iconObject(<Event />)} onClick={() => setOpen(true)} />, "Date picker")
        }
      />
      {modal}
    </ConditionalWrapper>
  );
};
