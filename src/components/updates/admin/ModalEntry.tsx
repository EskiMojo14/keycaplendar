import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { typedFirestore } from "@s/firebase/firestore";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { iconObject, ordinal } from "@s/common/functions";
import { UpdateId } from "@s/firebase/types";
import { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { queue } from "~/app/snackbarQueue";
import { Button } from "@rmwc/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper, BoolWrapper } from "@c/util/ConditionalWrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/FullScreenDialog";
import { CustomReactMarkdown, CustomReactMde } from "@c/util/ReactMarkdown";
import { withTooltip } from "@c/util/HOCs";
import "./ModalEntry.scss";

const isoDate = /(\d{4})-(\d{2})-(\d{2})/;

type ModalCreateProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
};

export const ModalCreate = (props: ModalCreateProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (props.open) {
      setName(user.nickname);
    } else {
      setDate("");
      setTitle("");
      setBody("");
    }
  }, [props.open]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const name = e.target.name;
    const value = e.target.value;
    if (name === "date") {
      setDate(value);
    } else if (name === "title") {
      setTitle(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const handleEditorChange = (name: string, value: string) => {
    if (name === "body") {
      setBody(value);
    }
  };

  const dateToday = () => {
    const today = DateTime.now().toFormat("yyyy-MM-dd");
    setDate(today);
  };

  const formattedDate = isoDate.test(date)
    ? DateTime.fromISO(date).toFormat(`d'${ordinal(DateTime.fromISO(date).day)}' MMMM yyyy`)
    : date;

  const formFilled = !!name && !!date && isoDate.test(date) && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      typedFirestore
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
          props.onClose();
          props.getEntries();
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
      trueWrapper={(children) => (
        <Drawer modal open={props.open} onClose={props.onClose} className="drawer-right update-entry-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={props.onClose} className="update-entry-modal">
          {children}
        </FullScreenDialog>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={props.onClose} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          Create update
        </BoolWrapper>
        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
        >
          <Button label="Save" outlined={useDrawer} onClick={saveEntry} disabled={!formFilled} />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="form">
          <div className="double-field">
            <TextField outlined disabled label="Name" value={name} className="half-field" readOnly required />
            <div className="half-field">
              <TextField
                outlined
                label="Date"
                name="date"
                value={date}
                onChange={handleChange}
                required
                helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
                trailingIcon={withTooltip(
                  <IconButton
                    icon={iconObject(
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zm-7 4H7v5h5v-5z" />
                          <path d="M5 5h14v2H5z" opacity=".3" />
                        </svg>
                      </div>
                    )}
                    onClick={dateToday}
                  />,
                  "Today"
                )}
              />
            </div>
          </div>
          <TextField
            outlined
            autoComplete="off"
            label="Title"
            value={title}
            name="title"
            onChange={handleChange}
            required
          />
          <div>
            <Typography use="caption" tag="div" className="subheader">
              Body*
            </Typography>
            <CustomReactMde value={body} onChange={(string) => handleEditorChange("body", string)} required />
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
  open: boolean;
  onClose: () => void;
  entry: UpdateEntryType;
  getEntries: () => void;
};

export const ModalEdit = (props: ModalEditProps) => {
  const { entry } = props;
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (props.open) {
      setName(user.nickname);
      setDate(entry.date);
      setTitle(entry.title);
      setBody(entry.body);
    } else {
      setDate("");
      setTitle("");
      setBody("");
    }
  }, [props.open, entry]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const name = e.target.name;
    const value = e.target.value;
    if (name === "date") {
      setDate(value);
    } else if (name === "title") {
      setTitle(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const handleEditorChange = (name: string, value: string) => {
    if (name === "body") {
      setBody(value);
    }
  };

  const dateToday = () => {
    const today = DateTime.now().toFormat("yyyy-MM-dd");
    setDate(today);
  };

  const formattedDate = isoDate.test(date)
    ? DateTime.fromISO(date).toFormat(`d'${ordinal(DateTime.fromISO(date).day)}' MMMM yyyy`)
    : date;

  const formFilled = !!name && !!date && isoDate.test(date) && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      typedFirestore
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
          props.onClose();
          props.getEntries();
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
      trueWrapper={(children) => (
        <Drawer modal open={props.open} onClose={props.onClose} className="drawer-right update-entry-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={props.onClose} className="update-entry-modal">
          {children}
        </FullScreenDialog>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={props.onClose} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          Create update
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
        >
          <Button label="Save" outlined={useDrawer} onClick={saveEntry} disabled={!formFilled} />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="form">
          <div className="double-field">
            <TextField outlined disabled label="Name" value={name} className="half-field" readOnly required />
            <div className="half-field">
              <TextField
                outlined
                label="Date"
                name="date"
                value={date}
                onChange={handleChange}
                required
                helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
                trailingIcon={withTooltip(
                  <IconButton
                    icon={iconObject(
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zm-7 4H7v5h5v-5z" />
                          <path d="M5 5h14v2H5z" opacity=".3" />
                        </svg>
                      </div>
                    )}
                    onClick={dateToday}
                  />,
                  "Today"
                )}
              />
            </div>
          </div>
          <TextField
            outlined
            autoComplete="off"
            label="Title"
            value={title}
            name="title"
            onChange={handleChange}
            required
          />
          <div>
            <Typography use="caption" tag="div" className="subheader">
              Body*
            </Typography>
            <CustomReactMde value={body} onChange={(string) => handleEditorChange("body", string)} required />
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
