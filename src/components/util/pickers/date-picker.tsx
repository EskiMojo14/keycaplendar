import { useEffect, useState } from "react";
import type { HTMLProps } from "react";
import { KeyboardDatePicker } from "@material-ui/pickers";
import type { KeyboardDatePickerProps } from "@material-ui/pickers";
import { Button } from "@rmwc/button";
import { Dialog, DialogActions, DialogButton } from "@rmwc/dialog";
import type { DialogProps } from "@rmwc/dialog";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurface, MenuSurfaceAnchor } from "@rmwc/menu";
import type { MenuHTMLProps, MenuSurfaceProps } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import type {
  TextFieldHelperTextProps,
  TextFieldHTMLProps,
  TextFieldProps,
} from "@rmwc/textfield";
import { DateTime } from "luxon";
import { useRifm } from "rifm";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import useDevice from "@h/use-device";
import useOrientation from "@h/use-orientation";
import BEMHelper from "@s/common/bem-helper";
import { capitalise, iconObject, invalidDate } from "@s/util/functions";
import type { Common, Overwrite } from "@s/util/types";
import { Event } from "@i";
import "./pickers.scss";

const parseDigits = (string: string) => (string.match(/\d+/g) || []).join("");

const formatDate = (
  string: string,
  month?: boolean,
  allowQuarter?: boolean
) => {
  const digits = parseDigits(string);
  const chars = digits.split("");
  if (allowQuarter && string.charAt(0) === "Q") {
    return `Q${chars
      .reduce((r, v, index) => (index === 0 ? `${r}${v} ` : r + v), "")
      .substr(0, 6)}`;
  } else {
    return chars
      .reduce(
        (r, v, index) =>
          index === 4 || (index === 6 && !month) ? `${r}-${v}` : r + v,
        ""
      )
      .substr(0, month ? 7 : 10);
  }
};

const formatDateWithAppend =
  (month?: boolean, allowQuarter?: boolean) => (string: string) => {
    const res = formatDate(string, month, allowQuarter);
    if (
      (res.length === 4 || (res.length === 7 && !month)) &&
      (!allowQuarter || string.charAt(0) !== "Q")
    ) {
      return `${res}-`;
    } else if (allowQuarter && string.charAt(0) !== "Q" && res.length === 1) {
      return `${res} `;
    }
    return res;
  };

export type DatePickerProps = Overwrite<
  Omit<TextFieldHTMLProps & TextFieldProps, "helpText" | "onBlur" | "onFocus">,
  {
    onChange: (val: string) => void;
    value: string;
    allowQuarter?: boolean;
    fallbackValue?: string;
    helpTextProps?: Partial<TextFieldHelperTextProps>;
    modalProps?: Omit<
      Common<
        MenuHTMLProps & MenuSurfaceProps,
        DialogProps & HTMLProps<HTMLElement>
      >,
      "anchorCorner" | "open" | "renderToPortal"
    >;
    month?: boolean;
    pickerProps?: Omit<
      KeyboardDatePickerProps,
      "onChange" | "orientation" | "value" | "variant" | "views"
    >;
    saveOnClose?: boolean;
    showNowButton?: boolean;
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
  required,
  helpTextProps = {},
  ...props
}: DatePickerProps) => {
  const device = useDevice();
  const useInline = device === "desktop";
  const orientation = useOrientation();
  const landscape = orientation.type.startsWith("landscape");

  const [touched, setTouched] = useState(false);
  const invalid = touched
    ? invalidDate(value, {
        allowQuarter,
        disableFuture: pickerProps?.disableFuture,
        month,
        required,
      })
    : false;

  const validFallback = invalidDate(fallbackValue || "") ? "" : fallbackValue;

  const views: KeyboardDatePickerProps["views"] = month
    ? ["year", "month"]
    : undefined;
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
    accept: allowQuarter ? /\d|\s|Q/g : /\d/g,
    format: formatDateWithAppend(month, allowQuarter),
    onChange,
    value,
  });

  const [open, setOpen] = useState(false);

  const [dialogVal, setDialogVal] = useState(value);
  useEffect(() => {
    if (dialogVal !== value) {
      setDialogVal(value || validFallback || DateTime.now().toISODate());
    }
  }, [value, fallbackValue]);

  const confirmVal = useInline && !saveOnClose ? onChange : setDialogVal;

  const handleDatePickerChange: KeyboardDatePickerProps["onChange"] = (
    date,
    value
  ) => {
    const finalValue =
      (month ? date?.toFormat("yyyy-MM") : date?.toISODate()) || value || "";
    confirmVal(finalValue);
  };
  const setNow = () => {
    confirmVal(DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd"));
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const confirmDialog = () => {
    onChange(
      dialogVal ||
        validFallback ||
        DateTime.now().toFormat(month ? "yyyy-MM" : "yyyy-MM-dd")
    );
    closeDialog();
  };

  const modal = useInline ? (
    <MenuSurface
      {...modalProps}
      anchorCorner="bottomLeft"
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      onClose={saveOnClose ? confirmDialog : undefined}
      open={open && (!allowQuarter || value.charAt(0) !== "Q")}
    >
      <KeyboardDatePicker
        maxDate={maxDate}
        minDate={minDate}
        onChange={handleDatePickerChange}
        openTo={openTo}
        orientation="portrait"
        value={
          saveOnClose
            ? dialogVal
            : value || validFallback || DateTime.now().toISODate()
        }
        variant="static"
        views={views}
        {...pickerProps}
      />
      {showNowButton && (
        <div className={bemClasses("buttons")}>
          <Button
            label={month ? "This month" : "Today"}
            onClick={setNow}
            type="button"
          />
        </div>
      )}
    </MenuSurface>
  ) : (
    <Dialog
      {...modalProps}
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      onClose={closeDialog}
      open={open}
      renderToPortal
    >
      <KeyboardDatePicker
        maxDate={maxDate}
        minDate={minDate}
        onChange={handleDatePickerChange}
        openTo={openTo}
        orientation={landscape ? "landscape" : "portrait"}
        value={dialogVal || validFallback || DateTime.now().toISODate()}
        variant="static"
        views={views}
        {...pickerProps}
      />
      <ConditionalWrapper
        condition={landscape}
        wrapper={(children) => (
          <div className={bemClasses("bottom-bar")}>{children}</div>
        )}
      >
        <DialogActions>
          {showNowButton && (
            <Button
              className={bemClasses("show-now-button")}
              label={month ? "This month" : "Today"}
              onClick={setNow}
              type="button"
            />
          )}
          <DialogButton isDefaultAction label="Cancel" onClick={closeDialog} />
          <DialogButton label="Confirm" onClick={confirmDialog} />
        </DialogActions>
      </ConditionalWrapper>
    </Dialog>
  );

  return (
    <ConditionalWrapper
      condition={useInline}
      wrapper={(children) => (
        <MenuSurfaceAnchor className={bemClasses("anchor")}>
          {children}
        </MenuSurfaceAnchor>
      )}
    >
      <TextField
        {...props}
        className={bemClasses("field")}
        helpText={{
          children: invalid
            ? capitalise(invalid)
            : `Format: ${month ? "YYYY-MM" : "YYYY-MM-DD"}${
                allowQuarter ? " or Q1-4 YYYY" : ""
              }`,
          persistent: true,
          validationMsg: true,
          ...helpTextProps,
        }}
        inputMode="numeric"
        invalid={!!invalid}
        onBlur={() => {
          if (!touched) {
            setTouched(true);
          }
          if (useInline) {
            setOpen(false);
          }
        }}
        onChange={rifm.onChange}
        onFocus={() => {
          if (touched) {
            setTouched(false);
          }
          if (useInline) {
            setOpen(true);
          }
        }}
        pattern={`^\\d{4}-\\d{1,2}${!month ? "-\\d{1,2}" : ""}$${
          allowQuarter ? "|^Q[1-4]{1} \\d{4}$" : ""
        }`}
        required={required}
        trailingIcon={
          useInline
            ? undefined
            : withTooltip(
                <IconButton
                  icon={iconObject(<Event />)}
                  onClick={() => setOpen(true)}
                />,
                "Date picker"
              )
        }
        value={rifm.value}
      />
      {modal}
    </ConditionalWrapper>
  );
};
