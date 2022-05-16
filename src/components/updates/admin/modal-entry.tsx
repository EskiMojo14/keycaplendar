import { useEffect } from "react";
import type { ChangeEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Button } from "@rmwc/button";
import { Checkbox } from "@rmwc/checkbox";
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
import { useImmer } from "use-immer";
import { z } from "zod";
import { notify } from "~/app/snackbar-queue";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import {
  FullScreenDialog,
  FullScreenDialogAppBar,
  FullScreenDialogContent,
} from "@c/util/full-screen-dialog";
import { DatePicker } from "@c/util/pickers/date-picker";
import { CustomReactMarkdown, CustomReactMde } from "@c/util/react-markdown";
import { useAppSelector } from "@h";
import useDevice from "@h/use-device";
import {
  selectEntryById,
  useCreateEntryMutation,
  useGetUpdatesQuery,
  useUpdateEntryMutation,
} from "@s/updates";
import { partialUpdate } from "@s/updates/constructors";
import { UpdateEntrySchema } from "@s/updates/schemas";
import type { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { arrayIncludes, invalidDate, ordinal } from "@s/util/functions";
import type { KeysMatching } from "@s/util/types";
import "./modal-entry.scss";

type ModalEntryProps = {
  name: string;
  onClose: () => void;
  onSubmit: (entry: UpdateEntryType) => void;
  open: boolean;
  entry?: UpdateEntryType;
};

export const ModalEntry = ({
  entry: propsEntry,
  name,
  onClose,
  onSubmit,
  open,
}: ModalEntryProps) => {
  const device = useDevice();

  const [entry, updateEntry] = useImmer(partialUpdate({ name }));

  const keyedUpdate =
    <K extends keyof UpdateEntryType>(key: K, payload: UpdateEntryType[K]) =>
    (draft: UpdateEntryType) => {
      draft[key] = payload;
    };

  useEffect(() => {
    if (!open) {
      updateEntry(partialUpdate({ name }));
    }
  }, [open]);

  useEffect(() => {
    if (propsEntry) {
      updateEntry(propsEntry);
    }
  }, [propsEntry]);

  const handleChange = ({
    target: { checked, name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (
      arrayIncludes<KeysMatching<UpdateEntryType, string>>(
        ["body", "date", "title"],
        name
      )
    ) {
      updateEntry(keyedUpdate(name, value));
    } else if (
      arrayIncludes<KeysMatching<UpdateEntryType, boolean>>(["pinned"], name)
    ) {
      updateEntry(keyedUpdate(name, checked));
    }
  };

  const handleNamedChange = (name: keyof UpdateEntryType) => (value: string) =>
    updateEntry(keyedUpdate(name, value));

  const formattedDate = !invalidDate(entry.date, { required: true })
    ? DateTime.fromISO(entry.date).toFormat(
        `d'${ordinal(DateTime.fromISO(entry.date).day)}' MMMM yyyy`
      )
    : entry.date;

  const parse = UpdateEntrySchema.merge(
    z.object({ id: z.string().min(propsEntry ? 1 : 0) })
  ).safeParse(entry);

  const useDrawer = device !== "mobile";

  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog className="update-entry-modal" {...{ onClose, open }}>
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right update-entry-modal"
          modal
          {...{ onClose, open }}
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
          {propsEntry ? "Edit" : "Create"} update
        </BoolWrapper>
        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!parse.success}
            label="Save"
            onClick={() => {
              if (parse.success) {
                onSubmit(parse.data);
              }
            }}
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
            value={entry.date}
          />
          <TextField
            autoComplete="off"
            label="Title"
            name="title"
            onChange={handleChange}
            outlined
            required
            value={entry.title}
          />
          <div>
            <Typography className="subheader" tag="div" use="caption">
              Body*
            </Typography>
            <CustomReactMde
              onChange={handleNamedChange("body")}
              required
              value={entry.body}
            />
          </div>
          <Checkbox
            checked={entry.pinned}
            label="Pinned"
            name="pinned"
            onChange={handleChange}
          />
        </div>
        <div className="preview">
          <div className="subheader">
            <Typography use="caption">Live preview</Typography>
          </div>
          <Typography use="overline">{entry.name}</Typography>
          <Typography use="headline5">{entry.title}</Typography>
          <Typography use="caption">{formattedDate}</Typography>
          <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};

type ModalCreateProps = Omit<ModalEntryProps, "name" | "onSubmit">;

export const ModalCreate = ({ onClose, open }: ModalCreateProps) => {
  const { nickname: name } = useAppSelector(selectUser);
  const [createEntry] = useCreateEntryMutation({
    selectFromResult: () => ({}),
  });
  const saveEntry = async (entry: UpdateEntryType) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = entry;
    const result = UpdateEntrySchema.omit({ id: true }).safeParse(data);
    if (result.success) {
      try {
        const docId = await createEntry(data).unwrap();
        console.log("Document written with ID: ", docId);
        notify({ title: "Entry written successfully." });
        onClose();
      } catch (error) {
        console.error("Error adding document: ", error);
        notify({ title: `Error adding document: ${error}` });
      }
    }
  };
  return <ModalEntry onSubmit={saveEntry} {...{ name, onClose, open }} />;
};

type ModalEditProps = Omit<ModalEntryProps, "name" | "onSubmit"> & {
  entryId: EntityId;
};

export const ModalEdit = ({ entryId, onClose, open }: ModalEditProps) => {
  const { nickname: name } = useAppSelector(selectUser);
  const { entry } = useGetUpdatesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      entry: data && selectEntryById(data, entryId),
    }),
  });
  const [updateEntry] = useUpdateEntryMutation({
    selectFromResult: () => ({}),
  });
  const saveEntry = async (entry: UpdateEntryType) => {
    const result = UpdateEntrySchema.safeParse(entry);
    if (result.success) {
      try {
        await updateEntry(result.data).unwrap();
        notify({ title: "Entry edited successfully." });
        onClose();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };
  return (
    <ModalEntry onSubmit={saveEntry} {...{ entry, name, onClose, open }} />
  );
};
