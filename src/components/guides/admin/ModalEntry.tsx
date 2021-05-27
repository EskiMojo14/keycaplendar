import React, { useEffect, useState } from "react";
import firebase from "../../../firebase";
import { useAppSelector } from "../../../app/hooks";
import { selectDevice } from "../../../app/slices/common/commonSlice";
import { GuideEntryType } from "../../../app/slices/guides/types";
import { selectUser } from "../../../app/slices/user/userSlice";
import { queue } from "../../../app/snackbarQueue";
import { Button } from "@rmwc/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper, BoolWrapper } from "../../util/ConditionalWrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "../../util/FullScreenDialog";
import { CustomReactMarkdown, CustomReactMde } from "../../util/ReactMarkdown";
import "./ModalEntry.scss";
import { Chip, ChipSet } from "@rmwc/chip";

const db = firebase.firestore();

type ModalCreateProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
};

export const ModalCreate = (props: ModalCreateProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (props.open) {
      setName(user.nickname);
    } else {
      setTags([]);
      setTitle("");
      setBody("");
    }
  }, [props.open]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const name = e.target.name;
    const value = e.target.value;
    if (name === "tags") {
      setTags(value.split(", "));
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

  const formFilled = !!name && !!tags && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      db.collection("guides")
        .add({
          name,
          tags,
          title,
          body,
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
        <Drawer modal open={props.open} onClose={props.onClose} className="drawer-right guide-entry-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={props.onClose} className="guide-entry-modal">
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
          Create guide
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
              <TextField outlined label="Tags" name="tags" value={tags.join(", ")} onChange={handleChange} required />
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
          <div className="tag-container">
            <ChipSet>
              {tags.map((tag) => (
                <Chip label={tag} key={tag} disabled />
              ))}
            </ChipSet>
          </div>
          <CustomReactMarkdown>{body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};

type ModalEditProps = {
  open: boolean;
  onClose: () => void;
  entry: GuideEntryType;
  getEntries: () => void;
};

export const ModalEdit = (props: ModalEditProps) => {
  const { entry } = props;
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (props.open) {
      setName(user.nickname);
      setTags(entry.tags);
      setTitle(entry.title);
      setBody(entry.body);
    } else {
      setTags([]);
      setTitle("");
      setBody("");
    }
  }, [props.open, entry]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const name = e.target.name;
    const value = e.target.value;
    if (name === "tags") {
      setTags(value.split(", "));
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

  const formFilled = !!name && !!tags && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      db.collection("updates")
        .doc(entry.id)
        .set({
          name,
          tags,
          title,
          body,
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
          Create guide
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
              <TextField outlined label="Tags" name="tags" value={tags.join(", ")} onChange={handleChange} required />
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
          <div className="tag-container">
            <ChipSet>
              {tags.map((tag) => (
                <Chip label={tag} key={tag} disabled />
              ))}
            </ChipSet>
          </div>
          <CustomReactMarkdown>{body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};
