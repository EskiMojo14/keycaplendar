import { useEffect, useState, FocusEvent, ChangeEvent, useReducer } from "react";
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
import { queue } from "~/app/snackbar-queue";
import { selectDevice } from "@s/common";
import { selectAllDesigners, selectAllProfiles, selectAllVendorRegions, selectAllVendors } from "@s/main";
import { getData } from "@s/main/functions";
import { SetType, VendorType } from "@s/main/types";
import { selectUser } from "@s/user";
import {
  arrayEveryType,
  arrayMove,
  batchStorageDelete,
  formatFileName,
  getStorageFolders,
  hasKey,
  iconObject,
} from "@s/util/functions";
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
import { ImageUpload } from "./image-upload";
import { DatePicker, invalidDate } from "@c/util/pickers/date-picker";
import { Autocomplete } from "@c/util/autocomplete";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/full-screen-dialog";
import { withTooltip } from "@c/util/hocs";
import { AddPhotoAlternate, CalendarToday, Delete, Public, Store } from "@i";
import "./modal-entry.scss";

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

const validLink = "https?:\\/\\/.+";

export const validVendor = (obj: Record<string, any>): obj is VendorType =>
  obj.name &&
  obj.region &&
  hasKey(obj, "storeLink") &&
  (!obj.storeLink || new RegExp(validLink).test(obj.storeLink)) &&
  (!obj.endDate || !invalidDate(obj.endDate, false));

export const validSalesInfo = (obj: Record<string, any>): obj is Exclude<SetType["sales"], undefined> =>
  hasKey(obj, "salesImg") &&
  (!obj.salesImg || new RegExp(validLink).test(obj.salesImg)) &&
  hasKey(obj, "salesThirdParty");

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

  const initialState: {
    profile: string;
    colorway: string;
    designer: string[];
    icDate: string;
    details: string;
    notes: string;
    gbMonth: boolean;
    gbLaunch: string;
    gbEnd: string;
    shipped: boolean;
    vendors: VendorType[];
    salesImg: string;
    salesThirdParty: boolean;
    salesImageLoaded: boolean;
    image: Blob | File | null;
    imageUploadProgress: number;
    imageURL: string;
  } = {
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
    vendors: [],
    salesImg: "",
    salesThirdParty: false,
    salesImageLoaded: false,
    image: null,
    imageUploadProgress: 0,
    imageURL: "",
  };

  const [state, dispatch] = useReducer(
    <T extends typeof initialState, K extends keyof T>(
      state: T,
      action: { type: "key"; key: K; payload: T[K] } | { type: "reset" }
    ) => {
      switch (action.type) {
        case "key":
          return {
            ...state,
            [action.key]: action.payload,
          };
        case "reset":
          return initialState;
        default:
          return state;
      }
    },
    initialState
  );

  const dispatchKey = <T extends typeof initialState, K extends keyof T>(
    key: K,
    payload: T[K]
  ): { type: "key"; key: K; payload: T[K] } => ({
    type: "key",
    key,
    payload,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (!user.isEditor && user.isDesigner) {
      dispatch(dispatchKey("designer", [user.nickname]));
    }
  }, [props.open]);

  const closeModal = () => {
    props.close();
    dispatch({ type: "reset" });
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

  const setImage = (image: Blob | File | null) => {
    dispatch(dispatchKey("image", image));
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };

  const handleBlur = () => {
    setFocused("");
  };

  const toggleDate = () => {
    dispatch(dispatchKey("gbMonth", !state.gbMonth));
  };

  const selectValue = (prop: string, value: string) => {
    if (prop === "designer") {
      dispatch(dispatchKey(prop, [value]));
    } else if (hasKey(state, prop)) {
      dispatch(dispatchKey(prop, value));
    }
    setFocused("");
  };

  const selectValueAppend = (prop: string, value: string) => {
    if (hasKey(state, prop)) {
      const original = state[prop];
      if (original) {
        if (is<string[]>(original)) {
          const array = [...original];
          array[array.length - 1] = value;
          dispatch(dispatchKey(prop, array));
          setFocused("");
        } else if (is<string>(original)) {
          const array = original.split(", ");
          array[array.length - 1] = value;
          dispatch(dispatchKey(prop, array.join(", ")));
          setFocused("");
        }
      }
    }
  };

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...state.vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = value;
      dispatch(dispatchKey("vendors", newVendors));
      setFocused("");
    }
  };

  const selectVendorAppend = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...state.vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      const original = vendor[property];
      if (original) {
        const array = original.split(", ");
        array[array.length - 1] = value;
        vendor[property] = array.join(", ");
        dispatch(dispatchKey("vendors", newVendors));
        setFocused("");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const checked = e.target.checked;
    if (name === "designer") {
      dispatch(dispatchKey(name, value.split(", ")));
    } else if (name === "shipped" || name === "salesThirdParty") {
      dispatch(dispatchKey(name, checked));
    } else if (hasKey(state, name)) {
      dispatch(dispatchKey(name, value));
    }
  };

  const handleNamedChange = (name: keyof typeof state) => (value: string) => {
    dispatch(dispatchKey(name, value));
  };

  const handleChangeVendor = (e: ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...state.vendors];
    const property = e.target.name.replace(/\d/g, "");
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = e.target.value;
      dispatch(dispatchKey("vendors", newVendors));
    }
  };

  const handleNamedChangeVendor = (name: keyof VendorType, index: number) => (value: string) => {
    const newVendors = [...state.vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, name)) {
      vendor[name] = value;
      dispatch(dispatchKey("vendors", newVendors));
    }
  };

  const handleChangeVendorEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...state.vendors];
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = newVendors[index];
    if (e.target.checked) {
      vendor.endDate = "";
    } else {
      delete vendor.endDate;
    }
    dispatch(dispatchKey("vendors", newVendors));
  };

  const addVendor = () => {
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    dispatch(dispatchKey("vendors", [...state.vendors, emptyVendor]));
  };

  const removeVendor = (index: number) => {
    const newVendors = [...state.vendors];
    newVendors.splice(index, 1);
    dispatch(dispatchKey("vendors", newVendors));
  };

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    const newVendors = [...state.vendors];
    arrayMove(newVendors, result.source.index, result.destination.index);
    dispatch(dispatchKey("vendors", newVendors));
  };

  const uploadImage = () => {
    if (state.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(`${state.profile} ${state.colorway}`)}T${DateTime.utc().toFormat(
        "yyyyMMddHHmmss"
      )}`;
      const imageRef = keysetsRef.child(fileName + ".png");
      const uploadTask = imageRef.put(state.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          dispatch(dispatchKey("imageUploadProgress", progress));
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
              dispatch(dispatchKey("imageURL", downloadURL));
              createEntry(downloadURL);
            })
            .catch((error) => {
              queue.notify({ title: "Failed to get URL: " + error });
              console.error(error);
            })
            .finally(() => {
              setUploadingImage(false);
            });
        }
      );
    }
  };

  const valid =
    !!state.profile &&
    !!state.colorway &&
    !!state.designer &&
    !invalidDate(state.icDate, false, true, true) &&
    new RegExp(validLink).test(state.details) &&
    !!state.image &&
    !invalidDate(state.gbLaunch, state.gbMonth, false, true) &&
    !invalidDate(state.gbEnd) &&
    arrayEveryType(state.vendors, validVendor) &&
    validSalesInfo(state);

  const createEntry = (url = state.imageURL) => {
    if (valid && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      typedFirestore
        .collection("keysets")
        .add({
          alias: nanoid(10),
          profile: state.profile,
          colorway: state.colorway,
          designer: state.designer,
          icDate: state.icDate,
          details: state.details,
          notes: state.notes,
          sales: { img: state.salesImg, thirdParty: state.salesThirdParty },
          shipped: state.shipped,
          image: url,
          gbMonth: state.gbMonth,
          gbLaunch: state.gbLaunch,
          gbEnd: state.gbEnd,
          vendors: state.vendors,
          latestEditor: user.id,
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          queue.notify({ title: "Entry written successfully." });
          getData();
          closeModal();
        })
        .catch((error) => {
          console.error(error);
          queue.notify({ title: "Error adding document: " + error });
        })
        .finally(() => {
          setUploadingDoc(false);
        });
    }
  };

  const setSalesImageLoaded = (val: boolean) => {
    dispatch(dispatchKey("salesImageLoaded", val));
  };
  const useDrawer = device !== "mobile";
  const dateCard = state.gbMonth ? (
    <Card outlined className="date-container">
      <Typography use="caption" tag="h3" className="date-title">
        Month
      </Typography>
      <div className="date-form">
        <DatePicker
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          outlined
          label="GB month"
          value={state.gbLaunch}
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          month
          showNowButton
          allowQuarter
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
          icon={iconObject(<CalendarToday />)}
          outlined
          label="GB launch"
          value={state.gbLaunch}
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          showNowButton
          allowQuarter
        />
        <DatePicker
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          outlined
          label="GB end"
          value={state.gbEnd}
          fallbackValue={state.gbLaunch}
          name="gbEnd"
          onChange={handleNamedChange("gbEnd")}
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
              progress={uploadingImage ? state.imageUploadProgress : undefined}
            />
          </DrawerHeader>
        )}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? state.imageUploadProgress : undefined}
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
              if (valid && !uploadingImage && !uploadingDoc) {
                uploadImage();
              }
            }}
            disabled={!valid || uploadingImage || uploadingDoc}
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
                  value={state.profile}
                  name="profile"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <Autocomplete
                  open={focused === "profile"}
                  array={allProfiles}
                  query={state.profile}
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
                value={state.colorway}
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
              value={state.designer.join(", ")}
              name="designer"
              helpText={{
                persistent: true,
                children: (
                  <>
                    Separate multiple designers with <code className="multiline">, </code>.
                  </>
                ),
              }}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={user.isEditor === false && user.isDesigner}
            />
            <Autocomplete
              open={focused === "designer"}
              array={allDesigners}
              query={state.designer.join(", ")}
              prop="designer"
              select={selectValueAppend}
              minChars={2}
              listSplit
            />
          </MenuSurfaceAnchor>
          <DatePicker
            autoComplete="off"
            icon={iconObject(<CalendarToday />)}
            outlined
            label="IC date"
            required
            value={state.icDate}
            name="icDate"
            onChange={handleNamedChange("icDate")}
            pickerProps={{ disableFuture: true }}
            showNowButton
          />
          <TextField
            autoComplete="off"
            icon="link"
            outlined
            label="Details"
            required
            pattern={validLink}
            value={state.details}
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
            value={state.notes}
            name="notes"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <ImageUpload image={state.image} setImage={setImage} desktop={device === "desktop"} />
          {dateCard}
          <Checkbox
            label="Shipped"
            id="create-shipped"
            name="shipped"
            checked={state.shipped}
            onChange={handleChange}
          />
          <Typography use="caption" tag="h3" className="subheader">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-create">
              {(provided) => (
                <div className="vendors-container" ref={provided.innerRef} {...provided.droppableProps}>
                  {state.vendors.map((vendor, index) => {
                    const endDateField =
                      typeof vendor.endDate === "string" ? (
                        <DatePicker
                          autoComplete="off"
                          icon={iconObject(<CalendarToday />)}
                          outlined
                          label="End date"
                          required
                          value={vendor.endDate}
                          name={"endDate" + index}
                          onChange={handleNamedChangeVendor("endDate", index)}
                          showNowButton
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
                                  icon={iconObject(<Delete />)}
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
                                  icon={iconObject(<Store />)}
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
                                  icon={iconObject(<Public />)}
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
                                pattern={validLink}
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
            <div className={classNames("sales-image", { loaded: state.salesImageLoaded })}>
              <div className="sales-image-icon">
                <Icon icon={iconObject(<AddPhotoAlternate />)} />
              </div>
              <img
                src={state.salesImg}
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
                pattern={validLink}
                value={state.salesImg}
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
                checked={state.salesThirdParty}
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

  const initialState: {
    alias: string;
    profile: string;
    colorway: string;
    designer: string[];
    icDate: string;
    details: string;
    notes: string;
    gbMonth: boolean;
    gbLaunch: string;
    gbEnd: string;
    shipped: boolean;
    vendors: VendorType[];
    salesImg: string;
    salesThirdParty: boolean;
    salesImageLoaded: boolean;
    image: Blob | File | string | null;
    imageUploadProgress: number;
    imageURL: string;
    newImage: boolean;
  } = {
    alias: "",
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
    vendors: [],
    salesImg: "",
    salesThirdParty: false,
    salesImageLoaded: false,
    image: null,
    imageUploadProgress: 0,
    imageURL: "",
    newImage: false,
  };

  const [state, dispatch] = useReducer(
    <T extends typeof initialState, K extends keyof T>(
      state: T,
      action: { type: "key"; key: K; payload: T[K] } | { type: "reset" } | { type: "merge"; payload: Partial<T> }
    ) => {
      switch (action.type) {
        case "key":
          return {
            ...state,
            [action.key]: action.payload,
          };
        case "merge":
          return {
            ...state,
            ...action.payload,
          };
        case "reset":
          return initialState;
        default:
          return state;
      }
    },
    initialState
  );

  const dispatchKey = <T extends typeof initialState, K extends keyof T>(
    key: K,
    payload: T[K]
  ): { type: "key"; key: K; payload: T[K] } => ({
    type: "key",
    key,
    payload,
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
    dispatch({
      type: "merge",
      payload: {
        alias: set.alias || nanoid(10),
        profile: set.profile,
        colorway: set.colorway,
        designer: set.designer,
        icDate: set.icDate,
        details: set.details,
        notes: set.notes ?? "",
        gbMonth: !!set.gbMonth ?? false,
        gbLaunch: gbLaunch,
        gbEnd: set.gbEnd,
        shipped: set.shipped ?? false,
        imageURL: set.image,
        vendors:
          set.vendors?.map((vendor) => {
            if (!vendor.id) {
              vendor.id = nanoid();
            }
            return vendor;
          }) ?? [],
        salesImg: set.sales?.img ?? "",
        salesThirdParty: set.sales?.thirdParty ?? false,
      },
    });
  };

  const closeModal = () => {
    props.close();
    dispatch({ type: "reset" });
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

  const setImage = (image: File | Blob | null) => {
    dispatch(dispatchKey("image", image));
    dispatch(dispatchKey("newImage", true));
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(e.target.name);
  };

  const handleBlur = () => {
    setFocused("");
  };

  const toggleDate = () => {
    dispatch(dispatchKey("gbMonth", !state.gbMonth));
  };

  const selectValue = (prop: string, value: string) => {
    if (hasKey(state, prop)) {
      if (prop === "designer") {
        dispatch(dispatchKey(prop, [value]));
        setFocused("");
      } else {
        dispatch(dispatchKey(prop, value));
        setFocused("");
      }
    }
  };

  const selectValueAppend = (prop: string, value: string) => {
    if (hasKey(state, prop)) {
      const original = state[prop];
      if (original) {
        if (is<string[]>(original)) {
          const array = [...original];
          array[array.length - 1] = value;
          dispatch(dispatchKey(prop, array));
          setFocused("");
        } else if (is<string>(original)) {
          const array = original.split(", ");
          array[array.length - 1] = value;
          dispatch(dispatchKey(prop, array.join(", ")));
          setFocused("");
        }
      }
    }
  };

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...state.vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = value;
      dispatch(dispatchKey("vendors", newVendors));
      setFocused("");
    }
  };

  const selectVendorAppend = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    const newVendors = [...state.vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      const original = vendor[property];
      if (original) {
        const array = original.split(", ");
        array[array.length - 1] = value;
        vendor[property] = array.join(", ");
        dispatch(dispatchKey("vendors", newVendors));
        setFocused("");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const checked = e.target.checked;
    if (name === "designer") {
      dispatch(dispatchKey(name, value.split(", ")));
    } else if (name === "shipped" || name === "salesThirdParty") {
      dispatch(dispatchKey(name, checked));
    } else if (hasKey(state, name)) {
      dispatch(dispatchKey(name, value));
    }
  };

  const handleNamedChange = (name: keyof typeof state) => (value: string) => {
    dispatch(dispatchKey(name, value));
  };

  const handleChangeVendor = (e: ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...state.vendors];
    const property = e.target.name.replace(/\d/g, "");
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = newVendors[index];
    if (hasKey(vendor, property)) {
      vendor[property] = e.target.value;
      dispatch(dispatchKey("vendors", newVendors));
    }
  };

  const handleNamedChangeVendor = (name: keyof VendorType, index: number) => (value: string) => {
    const newVendors = [...state.vendors];
    const vendor = newVendors[index];
    if (hasKey(vendor, name)) {
      vendor[name] = value;
      dispatch(dispatchKey("vendors", newVendors));
    }
  };

  const handleChangeVendorEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    const newVendors = [...state.vendors];
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    const vendor = newVendors[index];
    if (e.target.checked) {
      vendor.endDate = "";
    } else {
      delete vendor.endDate;
    }
    dispatch(dispatchKey("vendors", newVendors));
  };

  const addVendor = () => {
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    dispatch(dispatchKey("vendors", [...state.vendors, emptyVendor]));
  };

  const removeVendor = (index: number) => {
    const newVendors = [...state.vendors];
    newVendors.splice(index, 1);
    dispatch(dispatchKey("vendors", newVendors));
  };

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    const newVendors = [...state.vendors];
    arrayMove(newVendors, result.source.index, result.destination.index);
    dispatch(dispatchKey("vendors", newVendors));
  };

  const uploadImage = () => {
    if (state.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(`${state.profile} ${state.colorway}`)}T${DateTime.utc().toFormat(
        "yyyyMMddHHmmss"
      )}`;
      const imageRef = keysetsRef.child(fileName + ".png");
      const uploadTask = imageRef.put(state.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          dispatch(dispatchKey("imageUploadProgress", progress));
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error(error);
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
              dispatch(dispatchKey("imageURL", downloadURL));
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
                    console.error(error);
                  });
              }
            })
            .catch((error) => {
              queue.notify({ title: "Failed to get URL: " + error });
              console.error(error);
            })
            .finally(() => {
              setUploadingImage(false);
            });
        }
      );
    }
  };

  const valid =
    !!state.profile &&
    !!state.colorway &&
    !!state.designer &&
    !invalidDate(state.icDate, false, true, true) &&
    new RegExp(validLink).test(state.details) &&
    ((state.newImage && state.image instanceof Blob && !!state.image) || !!state.imageURL) &&
    !invalidDate(state.gbLaunch, state.gbMonth, false, true) &&
    !invalidDate(state.gbEnd) &&
    arrayEveryType(state.vendors, validVendor) &&
    validSalesInfo(state);

  const editEntry = (imageUrl = state.imageURL) => {
    if (valid && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      typedFirestore
        .collection("keysets")
        .doc(id as KeysetId)
        .update({
          alias: state.alias,
          profile: state.profile,
          colorway: state.colorway,
          designer: state.designer,
          icDate: state.icDate,
          details: state.details,
          notes: state.notes,
          sales: { img: state.salesImg, thirdParty: state.salesThirdParty },
          shipped: state.shipped,
          image: imageUrl,
          gbMonth: state.gbMonth,
          gbLaunch: state.gbLaunch,
          gbEnd: state.gbEnd,
          vendors: state.vendors,
          latestEditor: user.id,
        })
        .then(() => {
          queue.notify({ title: "Entry edited successfully." });
          closeModal();
          getData();
        })
        .catch((error) => {
          queue.notify({ title: "Error editing document: " + error });
          console.error(error);
        })
        .finally(() => {
          setUploadingDoc(false);
        });
    }
  };

  const setSalesImageLoaded = (val: boolean) => {
    dispatch(dispatchKey("salesImageLoaded", val));
  };
  const useDrawer = device !== "mobile";
  const dateCard = state.gbMonth ? (
    <Card outlined className="date-container">
      <Typography use="caption" tag="h3" className="date-title">
        Month
      </Typography>
      <div className="date-form">
        <DatePicker
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          outlined
          label="GB month"
          value={state.gbLaunch}
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          month
          allowQuarter
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
          icon={iconObject(<CalendarToday />)}
          outlined
          label="GB launch"
          value={state.gbLaunch}
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          showNowButton
          allowQuarter
        />
        <DatePicker
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          outlined
          label="GB end"
          value={state.gbEnd}
          fallbackValue={state.gbLaunch}
          name="gbEnd"
          onChange={handleNamedChange("gbEnd")}
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
              progress={uploadingImage ? state.imageUploadProgress : undefined}
            />
          </DrawerHeader>
        )}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? state.imageUploadProgress : undefined}
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
              if (valid && !uploadingImage && !uploadingDoc) {
                if (state.newImage) {
                  uploadImage();
                } else {
                  editEntry();
                }
              }
            }}
            disabled={!valid || uploadingImage || uploadingDoc}
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
                  value={state.profile}
                  name="profile"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <Autocomplete
                  open={focused === "profile"}
                  array={allProfiles}
                  query={state.profile}
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
                value={state.colorway}
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
              value={state.designer.join(", ")}
              name="designer"
              helpText={{
                persistent: true,
                children: (
                  <>
                    Separate multiple designers with <code className="multiline">, </code>.
                  </>
                ),
              }}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={user.isEditor === false && user.isDesigner}
            />
            <Autocomplete
              open={focused === "designer"}
              array={allDesigners}
              query={state.designer.join(", ")}
              prop="designer"
              select={selectValueAppend}
              minChars={2}
              listSplit
            />
          </MenuSurfaceAnchor>
          <DatePicker
            autoComplete="off"
            icon={iconObject(<CalendarToday />)}
            outlined
            label="IC date"
            required
            value={state.icDate}
            name="icDate"
            onChange={handleNamedChange("icDate")}
            showNowButton
          />
          <TextField
            autoComplete="off"
            icon="link"
            outlined
            label="Details"
            required
            pattern={validLink}
            value={state.details}
            name="details"
            helpText={{
              persistent: false,
              validationMsg: true,
              children: state.details.length > 0 ? "Must be valid link" : "Enter a link",
            }}
            onChange={handleChange}
          />
          <TextField
            textarea
            rows={2}
            autoComplete="off"
            outlined
            label="Notes"
            value={state.notes}
            name="notes"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <ImageUpload
            image={state.newImage ? state.image : state.imageURL.replace("keysets", "thumbs")}
            setImage={setImage}
            desktop={device === "desktop"}
          />
          {dateCard}
          <Checkbox label="Shipped" id="edit-shipped" name="shipped" checked={state.shipped} onChange={handleChange} />
          <Typography use="caption" tag="h3" className="subheader">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-edit">
              {(provided) => (
                <div className="vendors-container" ref={provided.innerRef} {...provided.droppableProps}>
                  {state.vendors.map((vendor, index) => {
                    const endDateField =
                      typeof vendor.endDate === "string" ? (
                        <DatePicker
                          autoComplete="off"
                          icon={iconObject(<CalendarToday />)}
                          outlined
                          label="End date"
                          required
                          value={vendor.endDate || ""}
                          name={"endDate" + index}
                          onChange={handleNamedChangeVendor("endDate", index)}
                          showNowButton
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
                                  icon={iconObject(<Delete />)}
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
                                  icon={iconObject(<Store />)}
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
                                  icon={iconObject(<Public />)}
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
                                pattern={validLink}
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
            <div className={classNames("sales-image", { loaded: state.salesImageLoaded })}>
              <div className="sales-image-icon">
                <Icon icon={iconObject(<AddPhotoAlternate />)} />
              </div>
              <img
                src={state.salesImg}
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
                pattern={validLink}
                value={state.salesImg}
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
                id="editSalesThirdParty"
                onChange={handleChange}
                checked={state.salesThirdParty}
              />
            </div>
          </Card>
        </form>
      </BoolWrapper>
    </BoolWrapper>
  );
};

export default ModalCreate;
