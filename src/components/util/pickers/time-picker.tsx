import { useEffect, useState } from "react";
import type { HTMLProps } from "react";
import { KeyboardTimePicker } from "@material-ui/pickers";
import type { KeyboardTimePickerProps } from "@material-ui/pickers";
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
import { useAppSelector } from "~/app/hooks";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectOrientation } from "@s/common";
import BEMHelper from "@s/common/bem-helper";
import { capitalise, iconObject, invalidTime } from "@s/util/functions";
import type { Common, Overwrite } from "@s/util/types";
import { Event } from "@i";
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

export type TimePickerProps = Overwrite<
  Omit<TextFieldHTMLProps & TextFieldProps, "helpText" | "onBlur" | "onFocus">,
  {
    onChange: (val: string) => void;
    value: string;
    fallbackValue?: string;
    helpTextProps?: Partial<TextFieldHelperTextProps>;
    modalProps?: Omit<
      Common<
        MenuHTMLProps & MenuSurfaceProps,
        DialogProps & HTMLProps<HTMLElement>
      >,
      "anchorCorner" | "open" | "renderToPortal"
    >;
    pickerProps?: Omit<
      KeyboardTimePickerProps,
      "onChange" | "orientation" | "value" | "variant"
    >;
    saveOnClose?: boolean;
    showNowButton?: boolean;
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
  required,
  helpTextProps = {},
  ...props
}: TimePickerProps) => {
  const device = useAppSelector(selectDevice);
  const useInline = device === "desktop";
  const orientation = useAppSelector(selectOrientation);
  const landscape = orientation === "landscape";

  const [touched, setTouched] = useState(false);
  const invalid = touched ? invalidTime(value, { required }) : false;

  const validFallback = invalidTime(fallbackValue || "") ? "" : fallbackValue;

  const rifm = useRifm({
    accept: /\d:/g,
    format: formatTime,
    onChange,
    value,
  });

  const [open, setOpen] = useState(false);

  const [dialogVal, setDialogVal] = useState(value);
  useEffect(() => {
    if (dialogVal !== value) {
      setDialogVal(
        value ||
          validFallback ||
          DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)
      );
    }
  }, [value, fallbackValue]);

  const confirmVal = useInline && !saveOnClose ? onChange : setDialogVal;

  const handleTimePickerChange: KeyboardTimePickerProps["onChange"] = (
    date,
    value
  ) => {
    const finalValue =
      date?.toLocaleString(DateTime.TIME_24_SIMPLE) || value || "";
    confirmVal(finalValue);
  };
  const setNow = () => {
    confirmVal(DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE));
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const confirmDialog = () => {
    onChange(
      dialogVal ||
        validFallback ||
        DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)
    );
    closeDialog();
  };

  const modal = useInline ? (
    <MenuSurface
      {...modalProps}
      anchorCorner="bottomLeft"
      className={bemClasses("modal", { open }, [modalProps?.className || ""])}
      onClose={saveOnClose ? confirmDialog : undefined}
      open={open}
    >
      <KeyboardTimePicker
        ampm={false}
        onChange={handleTimePickerChange}
        openTo="hours"
        orientation="portrait"
        value={`2020-12-20T${
          saveOnClose
            ? dialogVal
            : value || validFallback || DateTime.now().toISODate()
        }`}
        variant="static"
        {...pickerProps}
      />
      {showNowButton && (
        <div className={bemClasses("buttons")}>
          <Button label="Now" onClick={setNow} type="button" />
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
      <KeyboardTimePicker
        ampm={false}
        onChange={handleTimePickerChange}
        openTo="hours"
        orientation={orientation}
        value={`2020-12-20T${
          dialogVal ||
          validFallback ||
          DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)
        }`}
        variant="static"
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
              label="Now"
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
        className={bemClasses("field", { inline: useInline })}
        helpText={{
          children: invalid ? capitalise(invalid) : "Format: HH:YY (24hr)",
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
          if (useInline && !saveOnClose) {
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
        pattern="^\d{2}:\d{2}"
        required={required}
        trailingIcon={
          useInline
            ? undefined
            : withTooltip(
                <IconButton
                  icon={iconObject(<Event />)}
                  onClick={() => setOpen(true)}
                />,
                "Time picker"
              )
        }
        value={rifm.value}
      />
      {modal}
    </ConditionalWrapper>
  );
};
