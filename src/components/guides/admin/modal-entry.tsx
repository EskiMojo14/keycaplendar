import { useEffect } from "react";
import type { ChangeEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
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
import { useImmer } from "use-immer";
import { z } from "zod";
import { useAppSelector } from "~/app/hooks";
import { notify } from "~/app/snackbar-queue";
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
import { selectEntryById } from "@s/guides";
import {
  formattedVisibility,
  visibilityIcons,
  visibilityVals,
} from "@s/guides/constants";
import { partialGuide } from "@s/guides/constructors";
import { GuideEntrySchema } from "@s/guides/schemas";
import type { GuideEntryType } from "@s/guides/types";
import { selectUser } from "@s/user";
import { arrayIncludes, hasKey } from "@s/util/functions";
import type { KeysMatching } from "@s/util/types";
import "./modal-entry.scss";

type ModalEntryProps = {
  name: string;
  onClose: () => void;
  onSubmit: (entry: GuideEntryType) => void;
  open: boolean;
  entry?: GuideEntryType;
};

export const ModalEntry = ({
  entry: propsEntry,
  name,
  onClose,
  onSubmit,
  open,
}: ModalEntryProps) => {
  const device = useAppSelector(selectDevice);

  const [entry, updateEntry] = useImmer(partialGuide({ name }));

  const keyedUpdate =
    <K extends keyof GuideEntryType>(key: K, payload: GuideEntryType[K]) =>
    (draft: GuideEntryType) => {
      draft[key] = payload;
    };

  useEffect(() => {
    if (!open) {
      updateEntry(partialGuide({ name }));
    }
  }, [open]);

  useEffect(() => {
    if (propsEntry) {
      updateEntry(propsEntry);
    }
  }, [propsEntry]);

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "tags") {
      updateEntry(keyedUpdate("tags", value.split(", ")));
    } else if (hasKey(entry, name)) {
      updateEntry(keyedUpdate(name, value));
    }
  };

  const selectVisibility = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    if (arrayIncludes(visibilityVals, value)) {
      updateEntry(keyedUpdate("visibility", value));
    }
  };

  const handleEditorChange = (
    name: KeysMatching<GuideEntryType, string>,
    value: string
  ) => updateEntry(keyedUpdate(name, value));

  const { success: valid } = GuideEntrySchema.merge(
    z.object({ id: z.string().min(propsEntry ? 1 : 0) })
  ).safeParse(entry);

  const useDrawer = device !== "mobile";

  const submit = () => onSubmit(entry);

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
          {propsEntry ? "Edit" : "Create"} guide
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
            onClick={submit}
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
                icon={visibilityIcons[entry.visibility]}
                label="Visibility"
                onChange={selectVisibility}
                options={visibilityVals.map((role) => ({
                  key: role,
                  label: formattedVisibility[role],
                  value: role,
                }))}
                outlined
                value={entry.visibility}
              />
            </div>
            <div className="half-field">
              <TextField
                label="Tags"
                name="tags"
                onChange={handleChange}
                outlined
                required
                value={entry.tags.join(", ")}
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
            value={entry.title}
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
            value={entry.description}
          />
          <div>
            <Typography className="subheader" tag="div" use="caption">
              Body*
            </Typography>
            <CustomReactMde
              onChange={(string) => handleEditorChange("body", string)}
              required
              value={entry.body}
            />
          </div>
        </div>
        <div className="preview">
          <div className="subheader">
            <Typography use="caption">Live preview</Typography>
          </div>
          <div className="title">
            <Typography use="overline">{entry.name}</Typography>
            <Typography use="headline5">{entry.title}</Typography>
            <Typography use="caption">{entry.description}</Typography>
            <div className="tag-container">
              <ChipSet>
                <Chip
                  disabled
                  icon={visibilityIcons[entry.visibility]}
                  label={formattedVisibility[entry.visibility]}
                />
                {entry.tags.map((tag) => (
                  <Chip key={tag} disabled label={tag} />
                ))}
              </ChipSet>
            </div>
          </div>
          <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};

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
  const { nickname: name } = useAppSelector(selectUser);

  const saveEntry = async (entry: GuideEntryType) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = entry;
    const result = GuideEntrySchema.omit({ id: true }).safeParse(data);
    if (result.success) {
      try {
        const docRef = await firestore.collection("guides").add(result.data);
        console.log("Document written with ID: ", docRef.id);
        notify({ title: "Entry written successfully." });
        onClose();
        getEntries();
      } catch (error) {
        console.error("Error adding document: ", error);
        notify({ title: `Error adding document: ${error}` });
      }
    }
  };

  return <ModalEntry onSubmit={saveEntry} {...{ name, onClose, open }} />;
};

type ModalEditProps = {
  entryId: EntityId;
  getEntries: () => void;
  onClose: () => void;
  open: boolean;
};

export const ModalEdit = ({
  entryId,
  getEntries,
  onClose,
  open,
}: ModalEditProps) => {
  const { nickname: name } = useAppSelector(selectUser);

  const entry = useAppSelector((state) => selectEntryById(state, entryId));

  const saveEntry = async (entry: GuideEntryType) => {
    const result = GuideEntrySchema.safeParse(entry);
    if (result.success) {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: { id, ...data },
      } = result;
      try {
        await firestore
          .collection("guides")
          .doc(entryId as GuideId)
          .set({ ...data, name });
        notify({ title: "Entry edited successfully." });
        onClose();
        getEntries();
      } catch (error) {
        console.error("Error adding document: ", error);
        notify({ title: `Error adding document: ${error}` });
      }
    }
  };

  return (
    <ModalEntry onSubmit={saveEntry} {...{ entry, name, onClose, open }} />
  );
};
