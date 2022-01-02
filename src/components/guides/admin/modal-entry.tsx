import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { Select } from "@rmwc/select";
import { TextField } from "@rmwc/textfield";
import {
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import {
  FullScreenDialog,
  FullScreenDialogAppBar,
  FullScreenDialogContent,
} from "@c/util/full-screen-dialog";
import { CustomReactMarkdown, CustomReactMde } from "@c/util/react-markdown";
import { selectDevice } from "@s/common";
import firestore from "@s/firebase/firestore";
import type { GuideId } from "@s/firebase/types";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import type { GuideEntryType } from "@s/guides/types";
import { selectUser } from "@s/user";
import { userRoles } from "@s/users/constants";
import type { UserRoles } from "@s/users/types";
import { arrayIncludes } from "@s/util/functions";
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

  const [visibility, setVisibility] = useState<UserRoles | "all">("all");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (!open) {
      setTags([]);
      setTitle("");
      setDescription("");
      setBody("");
    }
  }, [open]);
  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "tags") {
      setTags(value.split(", "));
    } else if (name === "title") {
      setTitle(value);
    } else if (name === "description") {
      setDescription(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const selectVisibility = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
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
      firestore
        .collection("guides")
        .add({
          body,
          description,
          name: user.nickname,
          tags,
          title,
          visibility,
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          queue.notify({ title: "Entry written successfully." });
          onClose();
          getEntries();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          queue.notify({ title: `Error adding document: ${error}` });
        });
    }
  };

  const useDrawer = device !== "mobile";

  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="guide-entry-modal"
          onClose={onClose}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right guide-entry-modal"
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
          Create guide
        </BoolWrapper>
        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!formFilled}
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
          <div className="double-field">
            <div className="half-field">
              <Select
                enhanced
                icon={visibilityIcons[visibility]}
                label="Visibility"
                onChange={selectVisibility}
                options={(["all", ...userRoles] as const).map((role) => ({
                  key: role,
                  label: formattedVisibility[role],
                  value: role,
                }))}
                outlined
                value={visibility}
              />
            </div>
            <div className="half-field">
              <TextField
                label="Tags"
                name="tags"
                onChange={handleChange}
                outlined
                required
                value={tags.join(", ")}
              />
            </div>
          </div>
          <TextField
            autoComplete="off"
            label="Title"
            name="title"
            onChange={handleChange}
            outlined
            required
            value={title}
          />
          <TextField
            autoComplete="off"
            label="Description"
            name="description"
            onChange={handleChange}
            outlined
            required
            rows={2}
            textarea
            value={description}
          />
          <div>
            <Typography className="subheader" tag="div" use="caption">
              Body*
            </Typography>
            <CustomReactMde
              onChange={(string) => handleEditorChange("body", string)}
              required
              value={body}
            />
          </div>
        </div>
        <div className="preview">
          <div className="subheader">
            <Typography use="caption">Live preview</Typography>
          </div>
          <div className="title">
            <Typography use="overline">{user.nickname}</Typography>
            <Typography use="headline5">{title}</Typography>
            <Typography use="caption">{description}</Typography>
            <div className="tag-container">
              <ChipSet>
                <Chip
                  disabled
                  icon={visibilityIcons[visibility]}
                  label={formattedVisibility[visibility]}
                />
                {tags.map((tag) => (
                  <Chip key={tag} disabled label={tag} />
                ))}
              </ChipSet>
            </div>
          </div>
          <CustomReactMarkdown>{body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};

type ModalEditProps = {
  entry: GuideEntryType;
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

  const [visibility, setVisibility] = useState<UserRoles | "all">("all");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (open) {
      setVisibility(entry.visibility);
      setTags(entry.tags);
      setTitle(entry.title);
      setDescription(entry.description);
      setBody(entry.body);
    } else {
      setVisibility("all");
      setTags([]);
      setTitle("");
      setDescription("");
      setBody("");
    }
  }, [open, entry]);

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "tags") {
      setTags(value.split(", "));
    } else if (name === "title") {
      setTitle(value);
    } else if (name === "description") {
      setDescription(value);
    } else if (name === "body") {
      setBody(value);
    }
  };

  const selectVisibility = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
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
      firestore
        .collection("guides")
        .doc(entry.id as GuideId)
        .set({
          body,
          description,
          name: user.nickname,
          tags,
          title,
          visibility,
        })
        .then(() => {
          queue.notify({ title: "Entry edited successfully." });
          onClose();
          getEntries();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          queue.notify({ title: `Error adding document: ${error}` });
        });
    }
  };

  const useDrawer = device !== "mobile";

  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="guide-entry-modal"
          onClose={onClose}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right guide-entry-modal"
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
          Create guide
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!formFilled}
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
          <div className="double-field">
            <div className="half-field">
              <Select
                enhanced
                icon={visibilityIcons[visibility]}
                label="Visibility"
                onChange={selectVisibility}
                options={(["all", ...userRoles] as const).map((role) => ({
                  key: role,
                  label: formattedVisibility[role],
                  value: role,
                }))}
                outlined
                value={visibility}
              />
            </div>
            <div className="half-field">
              <TextField
                label="Tags"
                name="tags"
                onChange={handleChange}
                outlined
                required
                value={tags.join(", ")}
              />
            </div>
          </div>
          <TextField
            autoComplete="off"
            label="Title"
            name="title"
            onChange={handleChange}
            outlined
            required
            value={title}
          />
          <TextField
            autoComplete="off"
            label="Description"
            name="description"
            onChange={handleChange}
            outlined
            required
            rows={2}
            textarea
            value={description}
          />
          <div>
            <Typography className="subheader" tag="div" use="caption">
              Body*
            </Typography>
            <CustomReactMde
              onChange={(string) => handleEditorChange("body", string)}
              required
              value={body}
            />
          </div>
        </div>
        <div className="preview">
          <div className="subheader">
            <Typography use="caption">Live preview</Typography>
          </div>
          <div className="title">
            <Typography use="overline">{user.nickname}</Typography>
            <Typography use="headline5">{title}</Typography>
            <Typography use="caption">{description}</Typography>
            <div className="tag-container">
              <ChipSet>
                <Chip
                  disabled
                  icon={visibilityIcons[visibility]}
                  label={formattedVisibility[visibility]}
                />
                {tags.map((tag) => (
                  <Chip key={tag} disabled label={tag} />
                ))}
              </ChipSet>
            </div>
          </div>
          <CustomReactMarkdown>{body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};
