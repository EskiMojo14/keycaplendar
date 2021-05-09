import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import firebase from "../../../firebase";
import { UserContext } from "../../../util/contexts";
import { iconObject } from "../../../util/functions";
import { QueueType } from "../../../util/types";
import { Button } from "@rmwc/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { TextField } from "@rmwc/textfield";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "../../util/ReactMarkdown";
import "./DrawerEntry.scss";

const db = firebase.firestore();

const isoDate = /(\d{4})-(\d{2})-(\d{2})/;

type DrawerCreateProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
  snackbarQueue: QueueType;
};

export const DrawerCreate = (props: DrawerCreateProps) => {
  const { user } = useContext(UserContext);
  const [name, setName] = useState("");
  useEffect(() => {
    if (props.open) {
      setName(user.nickname);
    } else {
      setDate("");
      setTitle("");
      setBody("");
    }
  }, [props.open]);

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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
  const dateToday = () => {
    const today = moment().format("YYYY-MM-DD");
    setDate(today);
  };

  const formattedDate = isoDate.test(date) ? moment.utc(date).format("Do MMMM YYYY") : date;

  const formFilled = !!name && !!date && isoDate.test(date) && !!title && !!body;

  const saveEntry = () => {
    if (formFilled) {
      db.collection("updates")
        .add({
          name,
          date,
          title,
          body,
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          props.snackbarQueue.notify({ title: "Entry written successfully." });
          props.onClose();
          props.getEntries();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          props.snackbarQueue.notify({ title: "Error adding document: " + error });
        });
    }
  };

  return (
    <Drawer modal open={props.open} onClose={props.onClose} className="drawer-right update-entry-drawer">
      <DrawerHeader>
        <DrawerTitle>Create update</DrawerTitle>
        <Button label="Save" outlined onClick={saveEntry} disabled={!formFilled} />
      </DrawerHeader>
      <DrawerContent>
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
                trailingIcon={
                  <Tooltip enterDelay={500} content="Today" align="bottom">
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
                    />
                  </Tooltip>
                }
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
          <TextField
            outlined
            autoComplete="off"
            label="Body"
            name="body"
            value={body}
            onChange={handleChange}
            textarea
            required
          />
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
      </DrawerContent>
    </Drawer>
  );
};
