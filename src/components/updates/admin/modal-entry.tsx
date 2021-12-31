import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@rmwc/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import {
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import {
  FullScreenDialog,
  FullScreenDialogAppBar,
  FullScreenDialogContent,
} from "@c/util/full-screen-dialog";
import { DatePicker, invalidDate } from "@c/util/pickers/date-picker";
import { CustomReactMarkdown, CustomReactMde } from "@c/util/react-markdown";
import { selectDevice } from "@s/common";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import type { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { ordinal } from "@s/util/functions";
import "./modal-entry.scss";

type ModalCreateProps = {
  getEntries: () => void;
  onClose: () => void;
  open: boolean;
};

export const ModalCreate = ({
  getEntries,
  onClose,
  open,
}: ModalCreateProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (open) {
      setName(user.nickname);
    } else {
      setDate("");
      setTitle("");
      setBody("");
    }
  }, [open]);
  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "date") {
      setDate(value);
    } else if (name === "title") {
      setTitle(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const handleNamedChange = (name: string) => (value: string) => {
    if (name === "date") {
      setDate(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const formattedDate = !invalidDate(date, false, true)
    ? DateTime.fromISO(date).toFormat(
        `d'${ordinal(DateTime.fromISO(date).day)}' MMMM yyyy`
      )
    : date;

  const valid =
    !!name && !!date && !invalidDate(date, false, true) && !!title && !!body;

  const saveEntry = () => {
    if (valid) {
      firestore
        .collection("updates")
        .add({
          name,
          date,
          title,
          body,
          pinned: false,
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          queue.notify({ title: "Entry written successfully." });
          onClose();
          getEntries();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          queue.notify({ title: "Error adding document: " + error });
        });
    }
  };

  const useDrawer = device !== "mobile";

  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="update-entry-modal"
          onClose={onClose}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right update-entry-modal"
          modal
          onClose={onClose}
          open={open}
        >
          {children}
        </Drawer>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
      >
        <BoolWrapper
          condition={useDrawer}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={onClose} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
        >
          Create update
        </BoolWrapper>
        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!valid}
            label="Save"
            onClick={saveEntry}
            outlined={useDrawer}
          />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        falseWrapper={(children) => (
          <FullScreenDialogContent>{children}</FullScreenDialogContent>
        )}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
      >
        <div className="form">
          <DatePicker
            label="Date"
            name="date"
            onChange={handleNamedChange("date")}
            outlined
            required
            showNowButton
            value={date}
          />
          <TextField
            autoComplete="off"
            label="Title"
            name="title"
            onChange={handleChange}
            outlined
            required
            value={title}
          />
          <div>
            <Typography className="subheader" tag="div" use="caption">
              Body*
            </Typography>
            <CustomReactMde
              onChange={handleNamedChange("body")}
              required
              value={body}
            />
          </div>
        </div>
        <div className="preview">
          <div className="subheader">
            <Typography use="caption">Live preview</Typography>
          </div>
          <Typography use="overline">{name}</Typography>
          <Typography use="headline5">{title}</Typography>
          <Typography use="caption">{formattedDate}</Typography>
          <CustomReactMarkdown>{body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};

type ModalEditProps = {
  entry: UpdateEntryType;
  getEntries: () => void;
  onClose: () => void;
  open: boolean;
};

export const ModalEdit = ({
  entry,
  getEntries,
  onClose,
  open,
}: ModalEditProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (open) {
      setName(user.nickname);
      setDate(entry.date);
      setTitle(entry.title);
      setBody(entry.body);
    } else {
      setDate("");
      setTitle("");
      setBody("");
    }
  }, [open, entry]);
  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "date") {
      setDate(value);
    } else if (name === "title") {
      setTitle(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const handleNamedChange = (name: string) => (value: string) => {
    if (name === "date") {
      setDate(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const formattedDate = !invalidDate(date, false, true)
    ? DateTime.fromISO(date).toFormat(
        `d'${ordinal(DateTime.fromISO(date).day)}' MMMM yyyy`
      )
    : date;

  const valid =
    !!name && !!date && !invalidDate(date, false, true) && !!title && !!body;

  const saveEntry = () => {
    if (valid) {
      firestore
        .collection("updates")
        .doc(entry.id as UpdateId)
        .set({
          name,
          date,
          title,
          body,
          pinned: entry.pinned,
        })
        .then(() => {
          queue.notify({ title: "Entry edited successfully." });
          onClose();
          getEntries();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          queue.notify({ title: "Error adding document: " + error });
        });
    }
  };

  const useDrawer = device !== "mobile";

  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="update-entry-modal"
          onClose={onClose}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right update-entry-modal"
          modal
          onClose={onClose}
          open={open}
        >
          {children}
        </Drawer>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
      >
        <BoolWrapper
          condition={useDrawer}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={onClose} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
        >
          Create update
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!valid}
            label="Save"
            onClick={saveEntry}
            outlined={useDrawer}
          />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        falseWrapper={(children) => (
          <FullScreenDialogContent>{children}</FullScreenDialogContent>
        )}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
      >
        <div className="form">
          <DatePicker
            label="Date"
            name="date"
            onChange={handleNamedChange("date")}
            outlined
            required
            showNowButton
            value={date}
          />
          <TextField
            autoComplete="off"
            label="Title"
            name="title"
            onChange={handleChange}
            outlined
            required
            value={title}
          />
          <div>
            <Typography className="subheader" tag="div" use="caption">
              Body*
            </Typography>
            <CustomReactMde
              onChange={handleNamedChange("body")}
              required
              value={body}
            />
          </div>
        </div>
        <div className="preview">
          <div className="subheader">
            <Typography use="caption">Live preview</Typography>
          </div>
          <Typography use="overline">{name}</Typography>
          <Typography use="headline5">{title}</Typography>
          <Typography use="caption">{formattedDate}</Typography>
          <CustomReactMarkdown>{body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};
