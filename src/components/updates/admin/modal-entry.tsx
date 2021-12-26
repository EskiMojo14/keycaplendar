import { useEffect, useState, ChangeEvent } from "react";
import { DateTime } from "luxon";
import { typedFirestore } from "@s/firebase/firestore";
import { queue } from "~/app/snackbar-queue";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { UpdateId } from "@s/firebase/types";
import { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { ordinal } from "@s/util/functions";
import { Button } from "@rmwc/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { DatePicker, invalidDate } from "@c/util/pickers/date-picker";
import { ConditionalWrapper, BoolWrapper } from "@c/util/conditional-wrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/full-screen-dialog";
import { CustomReactMarkdown, CustomReactMde } from "@c/util/react-markdown";
import "./modal-entry.scss";

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
  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
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
    ? DateTime.fromISO(date).toFormat(`d'${ordinal(DateTime.fromISO(date).day)}' MMMM yyyy`)
    : date;

  const valid = !!name && !!date && !invalidDate(date, false, true) && !!title && !!body;

  const saveEntry = () => {
    if (valid) {
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
          <Button label="Save" outlined={useDrawer} onClick={saveEntry} disabled={!valid} />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="form">
          <DatePicker
            outlined
            label="Date"
            name="date"
            value={date}
            onChange={handleNamedChange("date")}
            required
            showNowButton
          />
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
            <CustomReactMde value={body} onChange={handleNamedChange("body")} required />
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
  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
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
    ? DateTime.fromISO(date).toFormat(`d'${ordinal(DateTime.fromISO(date).day)}' MMMM yyyy`)
    : date;

  const valid = !!name && !!date && !invalidDate(date, false, true) && !!title && !!body;

  const saveEntry = () => {
    if (valid) {
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
          <Button label="Save" outlined={useDrawer} onClick={saveEntry} disabled={!valid} />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="form">
          <DatePicker
            outlined
            label="Date"
            name="date"
            value={date}
            onChange={handleNamedChange("date")}
            required
            showNowButton
          />
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
            <CustomReactMde value={body} onChange={handleNamedChange("body")} required />
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
