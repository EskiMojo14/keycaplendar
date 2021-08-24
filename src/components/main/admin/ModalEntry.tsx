import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import cloneDeep from "lodash.clonedeep";
import { is } from "typescript-is";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from "react-beautiful-dnd";
import firebase from "@s/firebase";
import { typedFirestore } from "@s/firebase/firestore";
import { KeysetId } from "@s/firebase/types";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbarQueue";
import { selectDevice } from "@s/common";
import {
  arrayMove,
  batchStorageDelete,
  formatFileName,
  getStorageFolders,
  hasKey,
  iconObject,
} from "@s/common/functions";
import { selectAllDesigners, selectAllProfiles, selectAllVendorRegions, selectAllVendors } from "@s/main";
import { getData } from "@s/main/functions";
import { SetType, VendorType } from "@s/main/types";
import { selectUser } from "@s/user";
import { Button } from "@rmwc/button";
import { Card, CardActions, CardActionButtons, CardActionButton } from "@rmwc/card";
import { Checkbox } from "@rmwc/checkbox";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ImageUpload } from "./ImageUpload";
import { DatePicker } from "@c/util/pickers/DatePicker";
import { Autocomplete } from "@c/util/Autocomplete";
import { BoolWrapper, ConditionalWrapper } from "@c/util/ConditionalWrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/FullScreenDialog";
import { withTooltip } from "@c/util/HOCs";
import "./ModalEntry.scss";

const getVendorStyle = (provided: DraggableProvided) => {
  const style = provided.draggableProps.style;
  if (style) {
    let transform = style.transform;
    if (style.transform) {
      const YVal = parseInt(style.transform.slice(style.transform.indexOf(",") + 2, style.transform.length - 3));
      const axisLockY = "translate(0px, " + YVal + "px)";
      transform = axisLockY;
    }
    return {
      ...style,
      transform: transform,
    };
  } else {
    return style;
  }
};

type ModalCreateProps = {
  close: () => void;
  open: boolean;
};

export const ModalCreate = (props: ModalCreateProps) => {
  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);
  const allProfiles = useAppSelector(selectAllProfiles);
  const allVendors = useAppSelector(selectAllVendors);
  const allVendorRegions = useAppSelector(selectAllVendorRegions);

  const [fields, setFields] = useState({
    profile: "",
    colorway: "",
    designer: [""],
    icDate: "",
    details: "",
    notes: "",
    gbMonth: true,
    gbLaunch: "",
    gbEnd: "",
    shipped: false,
  });

  const [vendors, setVendors] = useState<VendorType[]>([]);

  const [salesInfo, setSalesInfo] = useState({ img: "", thirdParty: false, salesImageLoaded: false });

  const [imageInfo, setImageInfo] = useState<{
    image: Blob | File | null;
    imageUploadProgress: number;
    imageURL: string;
  }>({
    image: null,
    imageUploadProgress: 0,
    imageURL: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (!user.isEditor && user.isDesigner) {
      setFields((fields) => {
        return { ...fields, designer: [user.nickname] };
      });
    }
  }, [props.open]);

  const closeModal = () => {
    props.close();
    setFields({
      profile: "",
      colorway: "",
      designer: [""],
      icDate: "",
      details: "",
      notes: "",
      gbMonth: true,
      gbLaunch: "",
      gbEnd: "",
      shipped: false,
    });
    setVendors([]);
    setSalesInfo({ img: "", thirdParty: false, salesImageLoaded: false });
    setImageInfo({
      image: null,
      imageUploadProgress: 0,
      imageURL: "",
    });
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

  const setImage = (image: Blob | File | null) => {
    setImageInfo((imageInfo) => {
      return { ...imageInfo, image: image };
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };

  const handleBlur = () => {
    setFocused("");
  };

  const toggleDate = () => {
    setFields((fields) => {
      return { ...fields, gbMonth: !fields.gbMonth };
    });
  };

  const selectValue = (prop: string, value: string) => {
    if (prop === "designer") {
      setFields((fields) => {
        return { ...fields, [prop]: [value] };
      });
      setFocused("");
    } else {
      setFields((fields) => {
        return { ...fields, [prop]: value };
      });
      setFocused("");
    }
  };

  const selectValueAppend = (prop: string, value: string) => {
    if (hasKey(fields, prop)) {
      const original = fields[prop];
      if (original) {
        if (is<string[]>(original)) {
          const array = [...original];
          array[array.length - 1] = value;
          setFields((fields) => {
            return { ...fields, [prop]: array };
          });
          setFocused("");
        } else if (is<string>(original)) {
          const array = original.split(", ");
          array[array.length - 1] = value;
          setFields((fields) => {
            return { ...fields, [prop]: array.join(", ") };
          });
          setFocused("");
        }
      }
    }
  };

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = value;
      setVendors(newVendors);
      setFocused("");
    }
  };

  const selectVendorAppend = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      const original = vendor[property];
      if (original) {
        const array = original.split(", ");
        array[array.length - 1] = value;
        vendor[property] = array.join(", ");
        setVendors(newVendors);
        setFocused("");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const checked = e.target.checked;
    if (name === "designer") {
      setFields((fields) => {
        return { ...fields, [name]: value.split(", ") };
      });
    } else if (name === "shipped") {
      setFields((fields) => {
        return { ...fields, [name]: checked };
      });
    } else if (name === "salesImg") {
      setSalesInfo((salesInfo) => {
        return { ...salesInfo, img: value };
      });
    } else if (name === "salesThirdParty") {
      setSalesInfo((salesInfo) => {
        return { ...salesInfo, thirdParty: checked };
      });
    } else {
      setFields((fields) => {
        return { ...fields, [name]: value };
      });
    }
  };

  const handleNamedChange = (name: keyof typeof fields, value: string) => {
    setFields((fields) => {
      return { ...fields, [name]: value };
    });
  };

  const handleChangeVendor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...vendors];
    const property = e.target.name.replace(/\d/g, "");
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = vendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = e.target.value;
      setVendors(newVendors);
    }
  };

  const handleChangeVendorEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...vendors];
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = newVendors[index];
    if (e.target.checked) {
      vendor.endDate = "";
    } else {
      delete vendor.endDate;
    }
    setVendors(newVendors);
  };

  const addVendor = () => {
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    setVendors((vendors) => [...vendors, emptyVendor]);
  };

  const removeVendor = (index: number) => {
    const newVendors = [...vendors];
    newVendors.splice(index, 1);
    setVendors(newVendors);
  };

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    const newVendors = [...vendors];
    arrayMove(newVendors, result.source.index, result.destination.index);
    setVendors(newVendors);
  };

  const uploadImage = () => {
    if (imageInfo.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(`${fields.profile} ${fields.colorway}`)}T${DateTime.utc().toFormat(
        "yyyyMMddHHmmss"
      )}`;
      const imageRef = keysetsRef.child(fileName + ".png");
      const uploadTask = imageRef.put(imageInfo.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          setImageInfo((imageInfo) => {
            return { ...imageInfo, imageUploadProgress: progress };
          });
        },
        (error) => {
          // Handle unsuccessful uploads
          queue.notify({ title: "Failed to upload image: " + error });
          setUploadingImage(false);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          queue.notify({ title: "Successfully uploaded image." });
          imageRef
            .getDownloadURL()
            .then((downloadURL) => {
              setImageInfo((imageInfo) => {
                return { ...imageInfo, imageURL: downloadURL };
              });
              setUploadingImage(false);
              createEntry(downloadURL);
            })
            .catch((error) => {
              queue.notify({ title: "Failed to get URL: " + error });
              setUploadingImage(false);
            });
        }
      );
    }
  };

  const formFilled =
    !!fields.profile &&
    !!fields.colorway &&
    !!fields.designer &&
    !!fields.icDate &&
    !!fields.details &&
    !!imageInfo.image;

  const createEntry = (url = imageInfo.imageURL) => {
    if (formFilled && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      typedFirestore
        .collection("keysets")
        .add({
          alias: nanoid(10),
          profile: fields.profile,
          colorway: fields.colorway,
          designer: fields.designer,
          icDate: fields.icDate,
          details: fields.details,
          notes: fields.notes,
          sales: { img: salesInfo.img, thirdParty: salesInfo.thirdParty },
          shipped: fields.shipped,
          image: url,
          gbMonth: fields.gbMonth,
          gbLaunch: fields.gbLaunch,
          gbEnd: fields.gbEnd,
          vendors: vendors,
          latestEditor: user.id,
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          queue.notify({ title: "Entry written successfully." });
          setUploadingDoc(false);
          getData();
          closeModal();
        })
        .catch((error) => {
          setUploadingDoc(false);
          console.error("Error adding document: ", error);
          queue.notify({ title: "Error adding document: " + error });
        });
    }
  };

  const setSalesImageLoaded = (val: boolean) => {
    setSalesInfo((salesInfo) => {
      return { ...salesInfo, salesImageLoaded: val };
    });
  };
  const useDrawer = device !== "mobile";
  const dateCard = fields.gbMonth ? (
    <Card outlined className="date-container">
      <Typography use="caption" tag="h3" className="date-title">
        Month
      </Typography>
      <div className="date-form">
        <DatePicker
          autoComplete="off"
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
              <path d="M4 5.01h16V8H4z" opacity=".3" />
            </svg>
          )}
          outlined
          label="GB month"
          value={fields.gbLaunch}
          name="gbLaunch"
          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM" }}
          onChange={(val) => handleNamedChange("gbLaunch", val)}
          month
          showNowButton
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton type="button" label="Date" onClick={toggleDate} />
        </CardActionButtons>
      </CardActions>
    </Card>
  ) : (
    <Card outlined className="date-container">
      <Typography use="caption" tag="h3" className="date-title">
        Date
      </Typography>
      <div className="date-form">
        <DatePicker
          autoComplete="off"
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
              <path d="M4 5.01h16V8H4z" opacity=".3" />
            </svg>
          )}
          outlined
          label="GB launch"
          value={fields.gbLaunch}
          name="gbLaunch"
          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD or Q1-4 YYYY" }}
          onChange={(val) => handleNamedChange("gbLaunch", val)}
          showNowButton
        />
        <DatePicker
          autoComplete="off"
          icon={{
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                <path d="M4 5.01h16V8H4z" opacity=".3" />
              </svg>
            ),
          }}
          outlined
          label="GB end"
          value={fields.gbEnd}
          name="gbEnd"
          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
          onChange={(val) => handleNamedChange("gbEnd", val)}
          showNowButton
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton type="button" label="Month" onClick={toggleDate} />
        </CardActionButtons>
      </CardActions>
    </Card>
  );
  return (
    <BoolWrapper
      condition={useDrawer}
      trueWrapper={(children) => (
        <Drawer modal open={props.open} onClose={closeModal} className="drawer-right entry-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={closeModal} className="entry-modal">
          {children}
        </FullScreenDialog>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => (
          <DrawerHeader>
            {children}
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? imageInfo.imageUploadProgress : undefined}
            />
          </DrawerHeader>
        )}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? imageInfo.imageUploadProgress : undefined}
            />
          </FullScreenDialogAppBar>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={closeModal} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          Create Entry
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
        >
          <Button
            type="button"
            outlined={useDrawer}
            label="Save"
            onClick={() => {
              if (formFilled && !uploadingImage && !uploadingDoc) {
                uploadImage();
              }
            }}
            disabled={!formFilled || uploadingImage || uploadingDoc}
          />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="banner">
          <div className="banner-text">Make sure to read the entry guide.</div>
          <div className="banner-button">
            <a href="/guides?guideId=JLB4xxfx52NJmmnbvbzO" target="_blank" rel="noopener noreferrer">
              <Button label="guide" />
            </a>
          </div>
        </div>
        <form className="form">
          <div className="form-double">
            <div className="select-container">
              <MenuSurfaceAnchor>
                <TextField
                  autoComplete="off"
                  outlined
                  required
                  label="Profile"
                  value={fields.profile}
                  name="profile"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <Autocomplete
                  open={focused === "profile"}
                  array={allProfiles}
                  query={fields.profile}
                  prop="profile"
                  select={selectValue}
                  minChars={1}
                />
              </MenuSurfaceAnchor>
            </div>
            <div className="field-container">
              <TextField
                autoComplete="off"
                className="field"
                outlined
                required
                label="Colorway"
                value={fields.colorway}
                name="colorway"
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <MenuSurfaceAnchor>
            <TextField
              autoComplete="off"
              outlined
              label="Designer"
              required
              pattern="(\w+)[^\s](,\s*.+)*"
              value={fields.designer.join(", ")}
              name="designer"
              helpText={{
                persistent: false,
                validationMsg: true,
                children:
                  fields.designer[0] && fields.designer[0].includes(" ")
                    ? "Separate multiple designers with a comma and a space."
                    : "",
              }}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={user.isEditor === false && user.isDesigner}
            />
            <Autocomplete
              open={focused === "designer"}
              array={allDesigners}
              query={fields.designer.join(", ")}
              prop="designer"
              select={selectValueAppend}
              minChars={2}
              listSplit
            />
          </MenuSurfaceAnchor>
          <DatePicker
            autoComplete="off"
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                <path d="M4 5.01h16V8H4z" opacity=".3" />
              </svg>
            )}
            outlined
            label="IC date"
            required
            value={fields.icDate}
            name="icDate"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
            onChange={(val) => handleNamedChange("icDate", val)}
            pickerProps={{ disableFuture: true }}
            showNowButton
          />
          <TextField
            autoComplete="off"
            icon="link"
            outlined
            label="Details"
            required
            pattern="https?:\/\/.+"
            value={fields.details}
            name="details"
            helpText={{ persistent: false, validationMsg: true, children: "Must be valid link" }}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <TextField
            textarea
            rows={2}
            autoComplete="off"
            outlined
            label="Notes"
            value={fields.notes}
            name="notes"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <ImageUpload image={imageInfo.image} setImage={setImage} desktop={device === "desktop"} />
          {dateCard}
          <Checkbox
            label="Shipped"
            id="create-shipped"
            name="shipped"
            checked={fields.shipped}
            onChange={handleChange}
          />
          <Typography use="caption" tag="h3" className="subheader">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-create">
              {(provided) => (
                <div className="vendors-container" ref={provided.innerRef} {...provided.droppableProps}>
                  {vendors.map((vendor, index) => {
                    const endDateField =
                      vendor.endDate || vendor.endDate === "" ? (
                        <TextField
                          autoComplete="off"
                          icon={{
                            icon: (
                              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                                <path d="M4 5.01h16V8H4z" opacity=".3" />
                              </svg>
                            ),
                          }}
                          outlined
                          label="End date"
                          required
                          pattern="^\d{4}-\d{1,2}-\d{1,2}$"
                          value={vendor.endDate}
                          name={"endDate" + index}
                          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
                          onChange={handleChangeVendor}
                        />
                      ) : null;
                    return (
                      <Draggable key={vendor.id} draggableId={vendor.id ? vendor.id : index.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            outlined
                            className={classNames("vendor-container", { dragged: snapshot.isDragging })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getVendorStyle(provided)}
                          >
                            <div className="title-container">
                              <Typography use="caption" className="vendor-title">
                                {"Vendor " + (index + 1)}
                              </Typography>
                              {withTooltip(
                                <IconButton
                                  type="button"
                                  icon={iconObject(
                                    <div>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                      >
                                        <path d="M0 0h24v24H0V0z" fill="none" />
                                        <path d="M8 9h8v10H8z" opacity=".3" />
                                        <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
                                      </svg>
                                    </div>
                                  )}
                                  onClick={() => {
                                    removeVendor(index);
                                  }}
                                />,
                                "Delete"
                              )}
                              {withTooltip(
                                <Icon icon="drag_handle" className="drag-handle" {...provided.dragHandleProps} />,
                                "Drag"
                              )}
                            </div>
                            <div className="vendor-form">
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={{
                                    icon: (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                      >
                                        <path d="M0 0h24v24H0V0z" fill="none" />
                                        <path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" />
                                        <path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" />
                                      </svg>
                                    ),
                                  }}
                                  required
                                  outlined
                                  label="Name"
                                  value={vendor.name}
                                  name={"name" + index}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  onBlur={handleBlur}
                                />
                                <Autocomplete
                                  open={focused === "name" + index}
                                  array={allVendors}
                                  query={vendor.name}
                                  prop={"name" + index}
                                  select={selectVendor}
                                  minChars={1}
                                />
                              </MenuSurfaceAnchor>
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={{
                                    icon: (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                      >
                                        <path d="M0 0h24v24H0V0z" fill="none" />
                                        <path
                                          d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z"
                                          opacity=".3"
                                        />
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" />
                                      </svg>
                                    ),
                                  }}
                                  required
                                  outlined
                                  label="Region"
                                  value={vendor.region}
                                  name={"region" + index}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  onBlur={handleBlur}
                                />
                                <Autocomplete
                                  open={focused === "region" + index}
                                  array={allVendorRegions}
                                  query={vendor.region}
                                  prop={"region" + index}
                                  select={selectVendorAppend}
                                  minChars={1}
                                  listSplit
                                />
                              </MenuSurfaceAnchor>
                              <TextField
                                autoComplete="off"
                                icon="link"
                                outlined
                                label="Store link"
                                pattern="https?:\/\/.+"
                                value={vendor.storeLink}
                                name={"storeLink" + index}
                                onChange={handleChangeVendor}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                helpText={{
                                  persistent: false,
                                  validationMsg: true,
                                  children: "Must be valid link",
                                }}
                              />
                              <Checkbox
                                className="end-date-field"
                                label="Different end date"
                                name={"endDate" + index}
                                id={"editEndDate" + index}
                                onChange={handleChangeVendorEndDate}
                                checked={!!vendor.endDate || vendor.endDate === ""}
                              />
                              {endDateField}
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="add-button">
            <Button type="button" outlined label="Add vendor" onClick={addVendor} />
          </div>
          <Card outlined className="sales-container">
            <Typography use="caption" tag="h3" className="sales-title">
              Sales
            </Typography>
            <div className={classNames("sales-image", { loaded: salesInfo.salesImageLoaded })}>
              <div className="sales-image-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M10.21 16.83l-1.96-2.36L5.5 18h11l-3.54-4.71z" />
                  <path
                    d="M16.5 18h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zM17 7h-3V6H4v14h14V10h-1V7z"
                    opacity=".3"
                  />
                  <path d="M20 4V1h-2v3h-3v2h3v2.99h2V6h3V4zm-2 16H4V6h10V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h-2v10z" />
                </svg>
              </div>
              <img
                src={salesInfo.img}
                alt=""
                onLoad={() => {
                  setSalesImageLoaded(true);
                }}
                onError={() => {
                  setSalesImageLoaded(false);
                }}
              />
            </div>
            <div className="sales-field">
              <TextField
                autoComplete="off"
                icon="link"
                outlined
                label="URL"
                pattern="https?:\/\/.+"
                value={salesInfo.img}
                name="salesImg"
                helpText={{ persistent: true, validationMsg: true, children: "Must be direct link to image" }}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <Checkbox
                className="sales-checkbox"
                label="Third party graph"
                name="salesThirdParty"
                id={"CreateSalesThirdParty"}
                onChange={handleChange}
                checked={salesInfo.thirdParty}
              />
            </div>
          </Card>
        </form>
      </BoolWrapper>
    </BoolWrapper>
  );
};

type ModalEditProps = ModalCreateProps & {
  set: SetType;
};

export const ModalEdit = (props: ModalEditProps) => {
  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);
  const allProfiles = useAppSelector(selectAllProfiles);
  const allVendors = useAppSelector(selectAllVendors);
  const allVendorRegions = useAppSelector(selectAllVendorRegions);

  const [id, setId] = useState("");

  const [fields, setFields] = useState({
    profile: "",
    colorway: "",
    designer: [""],
    icDate: "",
    details: "",
    notes: "",
    gbMonth: true,
    gbLaunch: "",
    gbEnd: "",
    shipped: false,
  });

  const [vendors, setVendors] = useState<VendorType[]>([]);

  const [salesInfo, setSalesInfo] = useState({ img: "", thirdParty: false, salesImageLoaded: false });

  const [imageInfo, setImageInfo] = useState<{
    image: Blob | File | null;
    imageUploadProgress: number;
    imageURL: string;
    newImage: boolean;
  }>({
    image: null,
    imageUploadProgress: 0,
    imageURL: "",
    newImage: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (props.open) {
      setValues();
    } else {
      setTimeout(closeModal, 300);
    }
  }, [props.open]);

  const setValues = () => {
    let gbLaunch = "";
    const set = cloneDeep(props.set);
    if (set.gbLaunch) {
      if (set.gbMonth) {
        const twoNumRegExp = /^\d{4}-\d{1,2}-\d{2}$/g;
        const oneNumRegExp = /^\d{4}-\d{1,2}-\d{1}$/g;
        if (twoNumRegExp.test(set.gbLaunch)) {
          gbLaunch = set.gbLaunch.slice(0, -3);
        } else if (oneNumRegExp.test(set.gbLaunch)) {
          gbLaunch = set.gbLaunch.slice(0, -2);
        } else {
          gbLaunch = set.gbLaunch;
        }
      } else {
        gbLaunch = set.gbLaunch;
      }
    }

    setId(set.id);
    setFields({
      profile: set.profile,
      colorway: set.colorway,
      designer: set.designer,
      icDate: set.icDate,
      details: set.details,
      notes: set.notes ? set.notes : "",
      gbMonth: is<boolean>(set.gbMonth) ? set.gbMonth : false,
      gbLaunch: gbLaunch,
      gbEnd: set.gbEnd,
      shipped: set.shipped ? set.shipped : false,
    });
    setImageInfo((imageInfo) => {
      return { ...imageInfo, imageURL: set.image };
    });
    setVendors(
      set.vendors
        ? set.vendors.map((vendor) => {
            if (!vendor.id) {
              vendor.id = nanoid();
            }
            return vendor;
          })
        : []
    );
    setSalesInfo((salesInfo) => {
      return set.sales ? { ...salesInfo, ...set.sales } : { img: "", thirdParty: false, salesImageLoaded: false };
    });
  };

  const closeModal = () => {
    props.close();
    setFields({
      profile: "",
      colorway: "",
      designer: [""],
      icDate: "",
      details: "",
      notes: "",
      gbMonth: true,
      gbLaunch: "",
      gbEnd: "",
      shipped: false,
    });
    setVendors([]);
    setSalesInfo({ img: "", thirdParty: false, salesImageLoaded: false });
    setImageInfo({
      image: null,
      imageUploadProgress: 0,
      imageURL: "",
      newImage: false,
    });
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

  const setImage = (image: File | Blob | null) => {
    setImageInfo((imageInfo) => {
      return { ...imageInfo, image: image, newImage: true };
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };

  const handleBlur = () => {
    setFocused("");
  };

  const toggleDate = () => {
    setFields((fields) => {
      return { ...fields, gbMonth: !fields.gbMonth };
    });
  };

  const selectValue = (prop: string, value: string) => {
    if (prop === "designer") {
      setFields((fields) => {
        return { ...fields, [prop]: [value] };
      });
      setFocused("");
    } else {
      setFields((fields) => {
        return { ...fields, [prop]: value };
      });
      setFocused("");
    }
  };

  const selectValueAppend = (prop: string, value: string) => {
    if (hasKey(fields, prop)) {
      const original = fields[prop];
      if (original) {
        if (is<string[]>(original)) {
          const array = [...original];
          array[array.length - 1] = value;
          setFields((fields) => {
            return { ...fields, [prop]: array };
          });
          setFocused("");
        } else if (is<string>(original)) {
          const array = original.split(", ");
          array[array.length - 1] = value;
          setFields((fields) => {
            return { ...fields, [prop]: array.join(", ") };
          });
          setFocused("");
        }
      }
    }
  };

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = value;
      setVendors(newVendors);
      setFocused("");
    }
  };

  const selectVendorAppend = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      const original = vendor[property];
      if (original) {
        const array = original.split(", ");
        array[array.length - 1] = value;
        vendor[property] = array.join(", ");
        setVendors(newVendors);
        setFocused("");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const checked = e.target.checked;
    if (name === "designer") {
      setFields((fields) => {
        return { ...fields, [name]: value.split(", ") };
      });
    } else if (name === "shipped") {
      setFields((fields) => {
        return { ...fields, [name]: checked };
      });
    } else if (name === "salesImg") {
      setSalesInfo((salesInfo) => {
        return { ...salesInfo, img: value };
      });
    } else if (name === "salesThirdParty") {
      setSalesInfo((salesInfo) => {
        return { ...salesInfo, thirdParty: checked };
      });
    } else {
      setFields((fields) => {
        return { ...fields, [name]: value };
      });
    }
  };

  const handleChangeVendor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...vendors];
    const property = e.target.name.replace(/\d/g, "");
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = vendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = e.target.value;
      setVendors(newVendors);
    }
  };

  const handleChangeVendorEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...vendors];
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = newVendors[index];
    if (e.target.checked) {
      vendor.endDate = "";
    } else {
      delete vendor.endDate;
    }
    setVendors(newVendors);
  };

  const addVendor = () => {
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    setVendors((vendors) => [...vendors, emptyVendor]);
  };

  const removeVendor = (index: number) => {
    const newVendors = [...vendors];
    newVendors.splice(index, 1);
    setVendors(newVendors);
  };

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    const newVendors = [...vendors];
    arrayMove(newVendors, result.source.index, result.destination.index);
    setVendors(newVendors);
  };

  const uploadImage = () => {
    if (imageInfo.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(`${fields.profile} ${fields.colorway}`)}T${DateTime.utc().toFormat(
        "yyyyMMddHHmmss"
      )}`;
      const imageRef = keysetsRef.child(fileName + ".png");
      const uploadTask = imageRef.put(imageInfo.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          setImageInfo((imageInfo) => {
            return { ...imageInfo, imageUploadProgress: progress };
          });
        },
        (error) => {
          // Handle unsuccessful uploads
          queue.notify({ title: "Failed to upload image: " + error });
          setUploadingImage(false);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          queue.notify({ title: "Successfully uploaded image." });
          imageRef
            .getDownloadURL()
            .then(async (downloadURL) => {
              setImageInfo((imageInfo) => {
                return { ...imageInfo, imageURL: downloadURL };
              });
              setUploadingImage(false);
              editEntry(downloadURL);
              const fileNameRegex = /keysets%2F(.*)\?/;
              const regexMatch = props.set.image.match(fileNameRegex);
              if (regexMatch) {
                const imageName = regexMatch[1];
                const folders = await getStorageFolders();
                const allImages = folders.map((folder) => `${folder}/${imageName}`);
                batchStorageDelete(allImages)
                  .then(() => {
                    queue.notify({ title: "Successfully deleted previous thumbnails." });
                  })
                  .catch((error) => {
                    queue.notify({ title: "Failed to delete previous thumbnails: " + error });
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              queue.notify({ title: "Failed to get URL: " + error });
              setUploadingImage(false);
            });
        }
      );
    }
  };

  const formFilled =
    !!fields.profile &&
    !!fields.colorway &&
    !!fields.designer &&
    !!fields.icDate &&
    !!fields.details &&
    ((imageInfo.newImage && imageInfo.image instanceof Blob && !!imageInfo.image) || !!imageInfo.imageURL);

  const editEntry = (imageUrl = imageInfo.imageURL) => {
    if (formFilled && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      typedFirestore
        .collection("keysets")
        .doc(id as KeysetId)
        .update({
          alias: props.set.alias ? props.set.alias : nanoid(10),
          profile: fields.profile,
          colorway: fields.colorway,
          designer: fields.designer,
          icDate: fields.icDate,
          details: fields.details,
          notes: fields.notes,
          sales: { img: salesInfo.img, thirdParty: salesInfo.thirdParty },
          shipped: fields.shipped,
          image: imageUrl,
          gbMonth: fields.gbMonth,
          gbLaunch: fields.gbLaunch,
          gbEnd: fields.gbEnd,
          vendors: vendors,
          latestEditor: user.id,
        })
        .then(() => {
          setUploadingDoc(false);
          queue.notify({ title: "Entry edited successfully." });
          closeModal();
          getData();
        })
        .catch((error) => {
          setUploadingDoc(false);
          queue.notify({ title: "Error editing document: " + error });
        });
    }
  };

  const setSalesImageLoaded = (val: boolean) => {
    setSalesInfo((salesInfo) => {
      return { ...salesInfo, salesImageLoaded: val };
    });
  };
  const useDrawer = device !== "mobile";
  const dateCard = fields.gbMonth ? (
    <Card outlined className="date-container">
      <Typography use="caption" tag="h3" className="date-title">
        Month
      </Typography>
      <div className="date-form">
        <TextField
          autoComplete="off"
          icon={{
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                <path d="M4 5.01h16V8H4z" opacity=".3" />
              </svg>
            ),
          }}
          outlined
          label="GB month"
          pattern="^\d{4}-\d{1,2}$"
          value={fields.gbLaunch}
          name="gbLaunch"
          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM" }}
          onChange={handleChange}
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton type="button" label="Date" onClick={toggleDate} />
        </CardActionButtons>
      </CardActions>
    </Card>
  ) : (
    <Card outlined className="date-container">
      <Typography use="caption" tag="h3" className="date-title">
        Date
      </Typography>
      <div className="date-form">
        <TextField
          autoComplete="off"
          icon={{
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                <path d="M4 5.01h16V8H4z" opacity=".3" />
              </svg>
            ),
          }}
          outlined
          label="GB launch"
          pattern="^\d{4}-\d{1,2}-\d{1,2}$|^Q\d{1} \d{4}$"
          value={fields.gbLaunch}
          name="gbLaunch"
          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD or Q1-4 YYYY" }}
          onChange={handleChange}
        />
        <TextField
          autoComplete="off"
          icon={{
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                <path d="M4 5.01h16V8H4z" opacity=".3" />
              </svg>
            ),
          }}
          outlined
          label="GB end"
          pattern="^\d{4}-\d{1,2}-\d{1,2}$"
          value={fields.gbEnd}
          name="gbEnd"
          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
          onChange={handleChange}
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton type="button" label="Month" onClick={toggleDate} />
        </CardActionButtons>
      </CardActions>
    </Card>
  );
  return (
    <BoolWrapper
      condition={useDrawer}
      trueWrapper={(children) => (
        <Drawer modal open={props.open} onClose={closeModal} className="drawer-right entry-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={closeModal} className="entry-modal">
          {children}
        </FullScreenDialog>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => (
          <DrawerHeader>
            {children}
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? imageInfo.imageUploadProgress : undefined}
            />
          </DrawerHeader>
        )}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? imageInfo.imageUploadProgress : undefined}
            />
          </FullScreenDialogAppBar>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={closeModal} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          Edit Entry
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
        >
          <Button
            type="button"
            outlined={useDrawer}
            label="Save"
            onClick={() => {
              if (formFilled && !uploadingImage && !uploadingDoc) {
                if (imageInfo.newImage) {
                  uploadImage();
                } else {
                  editEntry();
                }
              }
            }}
            disabled={!formFilled || uploadingImage || uploadingDoc}
          />
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="banner">
          <div className="banner-text">Make sure to read the entry guide.</div>
          <div className="banner-button">
            <a href="/guides?guideId=JLB4xxfx52NJmmnbvbzO" target="_blank" rel="noopener noreferrer">
              <Button label="guide" />
            </a>
          </div>
        </div>
        <form className="form">
          <div className="form-double">
            <div className="select-container">
              <MenuSurfaceAnchor>
                <TextField
                  autoComplete="off"
                  outlined
                  required
                  label="Profile"
                  value={fields.profile}
                  name="profile"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <Autocomplete
                  open={focused === "profile"}
                  array={allProfiles}
                  query={fields.profile}
                  prop="profile"
                  select={selectValue}
                  minChars={1}
                />
              </MenuSurfaceAnchor>
            </div>
            <div className="field-container">
              <TextField
                autoComplete="off"
                className="field"
                outlined
                required
                label="Colorway"
                value={fields.colorway}
                name="colorway"
                helpText={{ persistent: false, validationMsg: true, children: "Enter a name" }}
                onChange={handleChange}
              />
            </div>
          </div>
          <MenuSurfaceAnchor>
            <TextField
              autoComplete="off"
              outlined
              label="Designer"
              required
              pattern="(\w+)[^\s](,\s*.+)*"
              value={fields.designer.join(", ")}
              name="designer"
              helpText={{
                persistent: false,
                validationMsg: true,
                children:
                  fields.designer[0] && fields.designer[0].includes(" ")
                    ? "Separate multiple designers with a comma and a space."
                    : "",
              }}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={user.isEditor === false && user.isDesigner}
            />
            <Autocomplete
              open={focused === "designer"}
              array={allDesigners}
              query={fields.designer.join(", ")}
              prop="designer"
              select={selectValueAppend}
              minChars={2}
              listSplit
            />
          </MenuSurfaceAnchor>
          <TextField
            autoComplete="off"
            icon={{
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                  <path d="M4 5.01h16V8H4z" opacity=".3" />
                </svg>
              ),
            }}
            outlined
            label="IC date"
            required
            pattern="^\d{4}-\d{1,2}-\d{1,2}$"
            value={fields.icDate}
            name="icDate"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
            onChange={handleChange}
          />
          <TextField
            autoComplete="off"
            icon="link"
            outlined
            label="Details"
            required
            pattern="https?:\/\/.+"
            value={fields.details}
            name="details"
            helpText={{
              persistent: false,
              validationMsg: true,
              children: fields.details.length > 0 ? "Must be valid link" : "Enter a link",
            }}
            onChange={handleChange}
          />
          <TextField
            textarea
            rows={2}
            autoComplete="off"
            outlined
            label="Notes"
            value={fields.notes}
            name="notes"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <ImageUpload
            image={imageInfo.newImage ? imageInfo.image : imageInfo.imageURL.replace("keysets", "thumbs")}
            setImage={setImage}
            desktop={device === "desktop"}
          />
          {dateCard}
          <Checkbox label="Shipped" id="edit-shipped" name="shipped" checked={fields.shipped} onChange={handleChange} />
          <Typography use="caption" tag="h3" className="subheader">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-edit">
              {(provided) => (
                <div className="vendors-container" ref={provided.innerRef} {...provided.droppableProps}>
                  {vendors.map((vendor, index) => {
                    const endDateField =
                      vendor.endDate || vendor.endDate === "" ? (
                        <TextField
                          autoComplete="off"
                          icon={{
                            icon: (
                              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                                <path d="M4 5.01h16V8H4z" opacity=".3" />
                              </svg>
                            ),
                          }}
                          outlined
                          label="End date"
                          required
                          pattern="^\d{4}-\d{1,2}-\d{1,2}$"
                          value={vendor.endDate}
                          name={"endDate" + index}
                          helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
                          onChange={handleChangeVendor}
                        />
                      ) : null;
                    return (
                      <Draggable key={vendor.id} draggableId={vendor.id ? vendor.id : index.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            outlined
                            className={classNames("vendor-container", { dragged: snapshot.isDragging })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getVendorStyle(provided)}
                          >
                            <div className="title-container">
                              <Typography use="caption" className="vendor-title">
                                {"Vendor " + (index + 1)}
                              </Typography>
                              {withTooltip(
                                <IconButton
                                  type="button"
                                  icon={iconObject(
                                    <div>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                      >
                                        <path d="M0 0h24v24H0V0z" fill="none" />
                                        <path d="M8 9h8v10H8z" opacity=".3" />
                                        <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
                                      </svg>
                                    </div>
                                  )}
                                  onClick={() => {
                                    removeVendor(index);
                                  }}
                                />,
                                "Delete"
                              )}
                              {withTooltip(
                                <Icon icon="drag_handle" className="drag-handle" {...provided.dragHandleProps} />,
                                "Drag"
                              )}
                            </div>
                            <div className="vendor-form">
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={{
                                    icon: (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                      >
                                        <path d="M0 0h24v24H0V0z" fill="none" />
                                        <path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" />
                                        <path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" />
                                      </svg>
                                    ),
                                  }}
                                  required
                                  outlined
                                  label="Name"
                                  value={vendor.name}
                                  name={"name" + index}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  onBlur={handleBlur}
                                />
                                <Autocomplete
                                  open={focused === "name" + index}
                                  array={allVendors}
                                  query={vendor.name}
                                  prop={"name" + index}
                                  select={selectVendor}
                                  minChars={1}
                                />
                              </MenuSurfaceAnchor>
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={{
                                    icon: (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                      >
                                        <path d="M0 0h24v24H0V0z" fill="none" />
                                        <path
                                          d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z"
                                          opacity=".3"
                                        />
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" />
                                      </svg>
                                    ),
                                  }}
                                  required
                                  outlined
                                  label="Region"
                                  value={vendor.region}
                                  name={"region" + index}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  onBlur={handleBlur}
                                />
                                <Autocomplete
                                  open={focused === "region" + index}
                                  array={allVendorRegions}
                                  query={vendor.region}
                                  prop={"region" + index}
                                  select={selectVendorAppend}
                                  minChars={1}
                                />
                              </MenuSurfaceAnchor>
                              <TextField
                                autoComplete="off"
                                icon="link"
                                outlined
                                label="Store link"
                                pattern="https?:\/\/.+"
                                value={vendor.storeLink}
                                name={"storeLink" + index}
                                onChange={handleChangeVendor}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                helpText={{ persistent: false, validationMsg: true, children: "Must be valid link" }}
                              />
                              <Checkbox
                                className="end-date-field"
                                label="Different end date"
                                name={"endDate" + index}
                                id={"editEndDate" + index}
                                onChange={handleChangeVendorEndDate}
                                checked={!!vendor.endDate || vendor.endDate === ""}
                              />
                              {endDateField}
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="add-button">
            <Button type="button" outlined label="Add vendor" onClick={addVendor} />
          </div>
          <Card outlined className="sales-container">
            <Typography use="caption" tag="h3" className="sales-title">
              Sales
            </Typography>
            <div className={classNames("sales-image", { loaded: salesInfo.salesImageLoaded })}>
              <div className="sales-image-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M10.21 16.83l-1.96-2.36L5.5 18h11l-3.54-4.71z" />
                  <path
                    d="M16.5 18h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zM17 7h-3V6H4v14h14V10h-1V7z"
                    opacity=".3"
                  />
                  <path d="M20 4V1h-2v3h-3v2h3v2.99h2V6h3V4zm-2 16H4V6h10V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h-2v10z" />
                </svg>
              </div>
              <img
                src={salesInfo.img}
                alt=""
                onLoad={() => {
                  setSalesImageLoaded(true);
                }}
                onError={() => {
                  setSalesImageLoaded(false);
                }}
              />
            </div>
            <div className="sales-field">
              <TextField
                autoComplete="off"
                icon="link"
                outlined
                label="URL"
                pattern="https?:\/\/.+"
                value={salesInfo.img}
                name="salesImg"
                helpText={{ persistent: true, validationMsg: true, children: "Must be direct link to image" }}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <Checkbox
                className="sales-checkbox"
                label="Third party graph"
                name="salesThirdParty"
                id={"editSalesThirdParty"}
                onChange={handleChange}
                checked={salesInfo.thirdParty}
              />
            </div>
          </Card>
        </form>
      </BoolWrapper>
    </BoolWrapper>
  );
};

export default ModalCreate;
