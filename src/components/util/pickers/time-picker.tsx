import { useState, useEffect, HTMLProps } from "react";
import { DateTime } from "luxon";
import { useRifm } from "rifm";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectOrientation } from "@s/common";
import BEMHelper from "@s/common/bem-helper";
import { capitalise, iconObject } from "@s/util/functions";
import { Common, Overwrite } from "@s/util/types";
import { Dialog, DialogActions, DialogButton, DialogProps } from "@rmwc/dialog";
import { Button } from "@rmwc/button";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurface, MenuSurfaceAnchor, MenuSurfaceProps, MenuHTMLProps } from "@rmwc/menu";
import { TextField, TextFieldHelperTextProps, TextFieldHTMLProps, TextFieldProps } from "@rmwc/textfield";
import { KeyboardTimePicker, KeyboardTimePickerProps } from "@material-ui/pickers";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import "./pickers.scss";

const parseDigits = (string: string) => (string.match(/\d+/g) || []).join("");

const formatTime = (string: string) => {
  const digits = parseDigits(string);
  const chars = digits.split("");
  return chars
    .concat(...Array(4 - chars.length < 0 ? 0 : 4 - chars.length).fill("0"))
    .reduce((r, v, index) => (index === 2 ? `${r}:${v}` : r + v), "")
    .substr(0, 5);
};

/** Returns an error message if invalid, otherwise returns false. */

export const invalidTime = (date: string, required?: boolean): string | false => {
  if (required && !date) {
    return "Field is required";
  } else if (date && date.length !== 5) {
    return "Format: HH:YY (24hr)";
  } else if (date.length === 5) {
    const [hours, minutes] = date.split(":");
    const valid =
      hours &&
      minutes &&
      parseInt(hours) >= 0 &&
      parseInt(hours) <= 23 &&
      parseInt(minutes) >= 0 &&
      parseInt(minutes) <= 59;
    return valid ? false : "Format: HH:YY (24hr)";
  }
  return false;
};

export type TimePickerProps = Overwrite<
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
    pickerProps?: Omit<KeyboardTimePickerProps, "value" | "onChange" | "orientation" | "variant">;
    showNowButton?: boolean;
    saveOnClose?: boolean;
  }
>;

const bemClasses = new BEMHelper("picker");

export const TimePicker = ({
  pickerProps,
  modalProps,
  value,
  fallbackValue,
  onChange,
  showNowButton,
  saveOnClose,
  ...props
}: TimePickerProps) => {
  const device = useAppSelector(selectDevice);
  const useInline = device === "desktop";
  const orientation = useAppSelector(selectOrientation);
  const landscape = orientation === "landscape";

  const [touched, setTouched] = useState(false);
  const invalid = touched ? invalidTime(value, props.required) : false;

  const validFallback = invalidTime(fallbackValue || "") ? "" : fallbackValue;

  const rifm = useRifm({
    value: value,
    onChange: onChange,
    accept: /\d:/g,
    format: formatTime,
  });

  const [open, setOpen] = useState(false);

  const [dialogVal, setDialogVal] = useState(value);
  useEffect(() => {
    if (dialogVal !== value) {
      setDialogVal(value || validFallback || DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE));
    }
  }, [value, fallbackValue]);

  const confirmVal = useInline && !saveOnClose ? onChange : setDialogVal;

  const handleTimePickerChange: KeyboardTimePickerProps["onChange"] = (date, value) => {
    const finalValue = date?.toLocaleString(DateTime.TIME_24_SIMPLE) || value || "";
    confirmVal(finalValue);
  };
  const setNow = () => {
    confirmVal(DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE));
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const confirmDialog = () => {
    onChange(dialogVal || validFallback || DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE));
    closeDialog();
  };

  const modal = useInline ? (
    <MenuSurface
      {...modalProps}
      open={open}
      onClose={saveOnClose ? confirmDialog : undefined}
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      anchorCorner="bottomLeft"
    >
      <KeyboardTimePicker
        value={`2020-12-20T${saveOnClose ? dialogVal : value || validFallback || DateTime.now().toISODate()}`}
        onChange={handleTimePickerChange}
        variant="static"
        orientation="portrait"
        ampm={false}
        openTo="hours"
        {...pickerProps}
      />
      {showNowButton ? (
        <div className={bemClasses("buttons")}>
          <Button label="Now" type="button" onClick={setNow} />
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
      <KeyboardTimePicker
        value={`2020-12-20T${dialogVal || validFallback || DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)}`}
        onChange={handleTimePickerChange}
        variant="static"
        orientation={orientation}
        ampm={false}
        openTo="hours"
        {...pickerProps}
      />
      <ConditionalWrapper
        condition={landscape}
        wrapper={(children) => <div className={bemClasses("bottom-bar")}>{children}</div>}
      >
        <DialogActions>
          {showNowButton ? (
            <Button className={bemClasses("show-now-button")} label="Now" type="button" onClick={setNow} />
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
        className={bemClasses("field", { inline: useInline })}
        inputMode="numeric"
        pattern="^\d{2}:\d{2}"
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
          if (useInline && !saveOnClose) {
            setOpen(false);
          }
        }}
        invalid={!!invalid}
        helpText={{
          persistent: true,
          validationMsg: true,
          children: invalid ? capitalise(invalid) : "Format: HH:YY (24hr)",
          ...(props.helpTextProps || {}),
        }}
        trailingIcon={
          useInline
            ? undefined
            : withTooltip(
                <IconButton
                  icon={iconObject(
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path
                          d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.25 12.15L11 13V7h1.5v5.25l4.5 2.67-.75 1.23z"
                          opacity=".3"
                        />
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                    </div>
                  )}
                  onClick={() => setOpen(true)}
                />,
                "Time picker"
              )
        }
      />
      {modal}
    </ConditionalWrapper>
  );
};
