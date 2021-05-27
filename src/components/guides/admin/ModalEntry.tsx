import React, { useEffect, useState } from "react";
import firebase from "../../../firebase";
import { queue } from "../../../app/snackbarQueue";
import { useAppSelector } from "../../../app/hooks";
import { selectDevice } from "../../../app/slices/common/commonSlice";
import { arrayIncludes } from "../../../app/slices/common/functions";
import { GuideEntryType } from "../../../app/slices/guides/types";
import { selectUser } from "../../../app/slices/user/userSlice";
import { userRoles } from "../../../app/slices/users/constants";
import { UserRoles } from "../../../app/slices/users/types";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { Select } from "@rmwc/select";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper, BoolWrapper } from "../../util/ConditionalWrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "../../util/FullScreenDialog";
import { CustomReactMarkdown, CustomReactMde } from "../../util/ReactMarkdown";
import "./ModalEntry.scss";
import { formattedVisibility, visibilityIcons } from "../../../app/slices/guides/constants";

const db = firebase.firestore();

type ModalCreateProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
};

export const ModalCreate = (props: ModalCreateProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [visibility, setVisibility] = useState<UserRoles | "all">("all");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (!props.open) {
      setTags([]);
      setTitle("");
      setBody("");
    }
  }, [props.open]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const selectVisibility = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (arrayIncludes<UserRoles | "all">([...userRoles, "all"], value)) {
      setVisibility(value);
    }
  };

  const handleEditorChange = (name: string, value: string) => {
    if (name === "body") {
      setBody(value);
    }
  };

  const formFilled = !!tags && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      db.collection("guides")
        .add({
          name: user.nickname,
          visibility,
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
            <div className="half-field">
              <Select
                outlined
                enhanced
                label="Visibility"
                options={(["all", ...userRoles] as const).map((role) => {
                  return {
                    value: role,
                    label: formattedVisibility[role],
                    key: role,
                  };
                })}
                icon={visibilityIcons[visibility]}
                value={visibility}
                onChange={selectVisibility}
              />
            </div>
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
          <Typography use="overline">{user.nickname}</Typography>
          <Typography use="headline5">{title}</Typography>
          <div className="tag-container">
            <ChipSet>
              <Chip icon={visibilityIcons[visibility]} label={formattedVisibility[visibility]} disabled />
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

  const [visibility, setVisibility] = useState<UserRoles | "all">("all");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (props.open) {
      setVisibility(entry.visibility);
      setTags(entry.tags);
      setTitle(entry.title);
      setBody(entry.body);
    } else {
      setVisibility("all");
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

  const selectVisibility = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (arrayIncludes<UserRoles | "all">([...userRoles, "all"], value)) {
      setVisibility(value);
    }
  };

  const handleEditorChange = (name: string, value: string) => {
    if (name === "body") {
      setBody(value);
    }
  };

  const formFilled = !!tags && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      db.collection("guides")
        .doc(entry.id)
        .set({
          name: user.nickname,
          visibility,
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
            <div className="half-field">
              <Select
                outlined
                enhanced
                label="Visibility"
                options={(["all", ...userRoles] as const).map((role) => {
                  return {
                    value: role,
                    label: formattedVisibility[role],
                    key: role,
                  };
                })}
                icon={visibilityIcons[visibility]}
                value={visibility}
                onChange={selectVisibility}
              />
            </div>
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
          <Typography use="headline5">{title}</Typography>
          <div className="tag-container">
            <ChipSet>
              <Chip icon={visibilityIcons[visibility]} label={formattedVisibility[visibility]} disabled />
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