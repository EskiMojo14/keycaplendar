import { useEffect, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { Button } from "@rmwc/button";
import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActions,
} from "@rmwc/card";
import { Checkbox } from "@rmwc/checkbox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import {
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import type { DraggableProvided, DropResult } from "react-beautiful-dnd";
import { is } from "typescript-is";
import { useImmer } from "use-immer";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { Autocomplete } from "@c/util/autocomplete";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import {
  FullScreenDialog,
  FullScreenDialogAppBar,
  FullScreenDialogContent,
} from "@c/util/full-screen-dialog";
import { withTooltip } from "@c/util/hocs";
import { DatePicker, invalidDate } from "@c/util/pickers/date-picker";
import { selectDevice } from "@s/common";
import firebase from "@s/firebase";
import firestore from "@s/firebase/firestore";
import type { KeysetId } from "@s/firebase/types";
import {
  selectAllDesigners,
  selectAllProfiles,
  selectAllVendorRegions,
  selectAllVendors,
} from "@s/main";
import { getData } from "@s/main/functions";
import type { SetType, VendorType } from "@s/main/types";
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
import type { KeysMatching } from "@s/util/types";
import { AddPhotoAlternate, CalendarToday, Delete, Public, Store } from "@i";
import { ImageUpload } from "./image-upload";
import "./modal-entry.scss";

const getVendorStyle = ({ draggableProps: { style } }: DraggableProvided) => {
  if (style) {
    let { transform } = style;
    if (style.transform) {
      const YVal = parseInt(
        style.transform.slice(
          style.transform.indexOf(",") + 2,
          style.transform.length - 3
        )
      );
      const axisLockY = "translate(0px, " + YVal + "px)";
      transform = axisLockY;
    }
    return {
      ...style,
      transform,
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

export const validSalesInfo = (
  obj: Record<string, any>
): obj is Exclude<SetType["sales"], undefined> =>
  hasKey(obj, "salesImg") &&
  (!obj.salesImg || new RegExp(validLink).test(obj.salesImg)) &&
  hasKey(obj, "salesThirdParty");

type ModalCreateProps = {
  close: () => void;
  open: boolean;
};

export const ModalCreate = ({ close, open }: ModalCreateProps) => {
  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);
  const allProfiles = useAppSelector(selectAllProfiles);
  const allVendors = useAppSelector(selectAllVendors);
  const allVendorRegions = useAppSelector(selectAllVendorRegions);

  type State = {
    colorway: string;
    designer: string[];
    details: string;
    gbEnd: string;
    gbLaunch: string;
    gbMonth: boolean;
    icDate: string;
    image: Blob | File | null;
    imageUploadProgress: number;
    imageURL: string;
    notes: string;
    profile: string;
    salesImageLoaded: boolean;
    salesImg: string;
    salesThirdParty: boolean;
    shipped: boolean;
    vendors: VendorType[];
  };

  const initialState: State = {
    colorway: "",
    designer: [""],
    details: "",
    gbEnd: "",
    gbLaunch: "",
    gbMonth: true,
    icDate: "",
    image: null,
    imageUploadProgress: 0,
    imageURL: "",
    notes: "",
    profile: "",
    salesImageLoaded: false,
    salesImg: "",
    salesThirdParty: false,
    shipped: false,
    vendors: [],
  };

  const [state, updateState] = useImmer(initialState);

  const keyedUpdate =
    <T extends State, K extends keyof T>(key: K, payload: T[K]) =>
    (draft: T) => {
      draft[key] = payload;
    };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (!user.isEditor && user.isDesigner) {
      updateState(keyedUpdate("designer", [user.nickname]));
    }
  }, [open]);

  const closeModal = () => {
    close();
    updateState(initialState);
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

  const setImage = (image: Blob | File | null) =>
    updateState(keyedUpdate("image", image));

  const handleFocus = (e: FocusEvent<HTMLInputElement>) =>
    setFocused(e.target.name);

  const handleBlur = () => setFocused("");

  const toggleDate = () => updateState(keyedUpdate("gbMonth", !state.gbMonth));

  const selectValue = (prop: string, value: string) => {
    if (hasKey(state, prop)) {
      updateState(keyedUpdate(prop, value));
    }
    setFocused("");
  };

  const selectValueAppend = (prop: string, value: string) =>
    updateState((draft) => {
      if (hasKey(draft, prop)) {
        const { [prop]: original } = draft;
        if (original) {
          if (is<string[]>(original)) {
            original[original.length - 1] = value;
            setFocused("");
          } else if (is<string>(original)) {
            const array = original.split(", ");
            array[array.length - 1] = value;
            draft[prop as KeysMatching<State, string>] = array.join(", ");
            setFocused("");
          }
        }
      }
    });

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        vendor[property] = value;
        setFocused("");
      }
    });
  };

  const selectVendorAppend = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        const { [property]: original } = vendor;
        if (original) {
          const array = original.split(", ");
          array[array.length - 1] = value;
          vendor[property] = array.join(", ");
          setFocused("");
        }
      }
    });
  };

  const handleChange = ({
    target: { checked, name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "designer") {
      updateState(keyedUpdate(name, value.split(", ")));
    } else if (name === "shipped" || name === "salesThirdParty") {
      updateState(keyedUpdate(name, checked));
    } else if (hasKey(state, name)) {
      updateState(keyedUpdate(name, value));
    }
  };

  const handleNamedChange =
    <Key extends keyof State>(name: Key) =>
    (value: State[Key]) =>
      updateState(keyedUpdate(name, value));

  const handleChangeVendor = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    const property = name.replace(/\d/g, "");
    const index = parseInt(name.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        vendor[property] = value;
      }
    });
  };

  const handleNamedChangeVendor =
    (name: keyof VendorType, index: number) => (value: string) =>
      updateState((draft) => {
        const {
          vendors: { [index]: vendor },
        } = draft;
        if (hasKey(vendor, name)) {
          vendor[name] = value;
        }
      });

  const handleChangeVendorEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (e.target.checked) {
        vendor.endDate = "";
      } else {
        delete vendor.endDate;
      }
    });
  };

  const addVendor = () => {
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    updateState((draft) => {
      draft.vendors.push(emptyVendor);
    });
  };

  const removeVendor = (index: number) =>
    updateState((draft) => {
      draft.vendors.splice(index, 1);
    });

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    updateState((draft) => {
      arrayMove(
        draft.vendors,
        result.source.index,
        result.destination?.index || 0
      );
    });
  };

  const setSalesImageLoaded = (val: boolean) =>
    updateState(keyedUpdate("salesImageLoaded", val));

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
      firestore
        .collection("keysets")
        .add({
          alias: nanoid(10),
          colorway: state.colorway,
          designer: state.designer,
          details: state.details,
          gbEnd: state.gbEnd,
          gbLaunch: state.gbLaunch,
          gbMonth: state.gbMonth,
          icDate: state.icDate,
          image: url,
          latestEditor: user.id,
          notes: state.notes,
          profile: state.profile,
          sales: { img: state.salesImg, thirdParty: state.salesThirdParty },
          shipped: state.shipped,
          vendors: state.vendors,
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

  const uploadImage = () => {
    if (state.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(
        `${state.profile} ${state.colorway}`
      )}T${DateTime.utc().toFormat("yyyyMMddHHmmss")}`;
      const imageRef = keysetsRef.child(fileName + ".png");
      const uploadTask = imageRef.put(state.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          updateState(keyedUpdate("imageUploadProgress", progress));
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
              updateState(keyedUpdate("imageURL", downloadURL));
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

  const useDrawer = device !== "mobile";
  const dateCard = state.gbMonth ? (
    <Card className="date-container" outlined>
      <Typography className="date-title" tag="h3" use="caption">
        Month
      </Typography>
      <div className="date-form">
        <DatePicker
          allowQuarter
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          label="GB month"
          month
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          outlined
          showNowButton
          value={state.gbLaunch}
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton label="Date" onClick={toggleDate} type="button" />
        </CardActionButtons>
      </CardActions>
    </Card>
  ) : (
    <Card className="date-container" outlined>
      <Typography className="date-title" tag="h3" use="caption">
        Date
      </Typography>
      <div className="date-form">
        <DatePicker
          allowQuarter
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          label="GB launch"
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          outlined
          showNowButton
          value={state.gbLaunch}
        />
        <DatePicker
          autoComplete="off"
          fallbackValue={state.gbLaunch}
          icon={iconObject(<CalendarToday />)}
          label="GB end"
          name="gbEnd"
          onChange={handleNamedChange("gbEnd")}
          outlined
          showNowButton
          value={state.gbEnd}
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton label="Month" onClick={toggleDate} type="button" />
        </CardActionButtons>
      </CardActions>
    </Card>
  );
  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="entry-modal"
          onClose={closeModal}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right entry-modal"
          modal
          onClose={closeModal}
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
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? state.imageUploadProgress : undefined}
            />
          </FullScreenDialogAppBar>
        )}
        trueWrapper={(children) => (
          <DrawerHeader>
            {children}
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? state.imageUploadProgress : undefined}
            />
          </DrawerHeader>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={closeModal} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
        >
          Create Entry
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!valid || uploadingImage || uploadingDoc}
            label="Save"
            onClick={() => {
              if (valid && !uploadingImage && !uploadingDoc) {
                uploadImage();
              }
            }}
            outlined={useDrawer}
            type="button"
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
        <div className="banner">
          <div className="banner-text">Make sure to read the entry guide.</div>
          <div className="banner-button">
            <a
              href="/guides?guideId=JLB4xxfx52NJmmnbvbzO"
              rel="noopener noreferrer"
              target="_blank"
            >
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
                  label="Profile"
                  name="profile"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  outlined
                  required
                  value={state.profile}
                />
                <Autocomplete
                  array={allProfiles}
                  minChars={1}
                  open={focused === "profile"}
                  prop="profile"
                  query={state.profile}
                  select={selectValue}
                />
              </MenuSurfaceAnchor>
            </div>
            <div className="field-container">
              <TextField
                autoComplete="off"
                className="field"
                label="Colorway"
                name="colorway"
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                outlined
                required
                value={state.colorway}
              />
            </div>
          </div>
          <MenuSurfaceAnchor>
            <TextField
              autoComplete="off"
              disabled={user.isEditor === false && user.isDesigner}
              helpText={{
                children: (
                  <>
                    Separate multiple designers with{" "}
                    <code className="multiline">, </code>.
                  </>
                ),
                persistent: true,
              }}
              label="Designer"
              name="designer"
              onBlur={handleBlur}
              onChange={handleChange}
              onFocus={handleFocus}
              outlined
              required
              value={state.designer.join(", ")}
            />
            <Autocomplete
              array={allDesigners}
              listSplit
              minChars={2}
              open={focused === "designer"}
              prop="designer"
              query={state.designer.join(", ")}
              select={selectValueAppend}
            />
          </MenuSurfaceAnchor>
          <DatePicker
            autoComplete="off"
            icon={iconObject(<CalendarToday />)}
            label="IC date"
            name="icDate"
            onChange={handleNamedChange("icDate")}
            outlined
            pickerProps={{ disableFuture: true }}
            required
            showNowButton
            value={state.icDate}
          />
          <TextField
            autoComplete="off"
            helpText={{
              children: "Must be valid link",
              persistent: false,
              validationMsg: true,
            }}
            icon="link"
            label="Details"
            name="details"
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            outlined
            pattern={validLink}
            required
            value={state.details}
          />
          <TextField
            autoComplete="off"
            label="Notes"
            name="notes"
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            outlined
            rows={2}
            textarea
            value={state.notes}
          />
          <ImageUpload
            desktop={device === "desktop"}
            image={state.image}
            setImage={setImage}
          />
          {dateCard}
          <Checkbox
            checked={state.shipped}
            id="create-shipped"
            label="Shipped"
            name="shipped"
            onChange={handleChange}
          />
          <Typography className="subheader" tag="h3" use="caption">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-create">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  className="vendors-container"
                  {...provided.droppableProps}
                >
                  {state.vendors.map((vendor, index) => {
                    const endDateField =
                      typeof vendor.endDate === "string" ? (
                        <DatePicker
                          autoComplete="off"
                          icon={iconObject(<CalendarToday />)}
                          label="End date"
                          name={"endDate" + index}
                          onChange={handleNamedChangeVendor("endDate", index)}
                          outlined
                          required
                          showNowButton
                          value={vendor.endDate}
                        />
                      ) : null;
                    return (
                      <Draggable
                        key={vendor.id}
                        draggableId={vendor.id ? vendor.id : index.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            className={classNames("vendor-container", {
                              dragged: snapshot.isDragging,
                            })}
                            outlined
                            {...provided.draggableProps}
                            style={getVendorStyle(provided)}
                          >
                            <div className="title-container">
                              <Typography
                                className="vendor-title"
                                use="caption"
                              >
                                {"Vendor " + (index + 1)}
                              </Typography>
                              {withTooltip(
                                <IconButton
                                  icon={iconObject(<Delete />)}
                                  onClick={() => {
                                    removeVendor(index);
                                  }}
                                  type="button"
                                />,
                                "Delete"
                              )}
                              {withTooltip(
                                <Icon
                                  className="drag-handle"
                                  icon="drag_handle"
                                  {...provided.dragHandleProps}
                                />,
                                "Drag"
                              )}
                            </div>
                            <div className="vendor-form">
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={iconObject(<Store />)}
                                  label="Name"
                                  name={"name" + index}
                                  onBlur={handleBlur}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  outlined
                                  required
                                  value={vendor.name}
                                />
                                <Autocomplete
                                  array={allVendors}
                                  minChars={1}
                                  open={focused === "name" + index}
                                  prop={"name" + index}
                                  query={vendor.name}
                                  select={selectVendor}
                                />
                              </MenuSurfaceAnchor>
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={iconObject(<Public />)}
                                  label="Region"
                                  name={"region" + index}
                                  onBlur={handleBlur}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  outlined
                                  required
                                  value={vendor.region}
                                />
                                <Autocomplete
                                  array={allVendorRegions}
                                  listSplit
                                  minChars={1}
                                  open={focused === "region" + index}
                                  prop={"region" + index}
                                  query={vendor.region}
                                  select={selectVendorAppend}
                                />
                              </MenuSurfaceAnchor>
                              <TextField
                                autoComplete="off"
                                helpText={{
                                  children: "Must be valid link",
                                  persistent: false,
                                  validationMsg: true,
                                }}
                                icon="link"
                                label="Store link"
                                name={"storeLink" + index}
                                onBlur={handleBlur}
                                onChange={handleChangeVendor}
                                onFocus={handleFocus}
                                outlined
                                pattern={validLink}
                                value={vendor.storeLink}
                              />
                              <Checkbox
                                checked={
                                  !!vendor.endDate || vendor.endDate === ""
                                }
                                className="end-date-field"
                                id={"editEndDate" + index}
                                label="Different end date"
                                name={"endDate" + index}
                                onChange={handleChangeVendorEndDate}
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
            <Button
              label="Add vendor"
              onClick={addVendor}
              outlined
              type="button"
            />
          </div>
          <Card className="sales-container" outlined>
            <Typography className="sales-title" tag="h3" use="caption">
              Sales
            </Typography>
            <div
              className={classNames("sales-image", {
                loaded: state.salesImageLoaded,
              })}
            >
              <div className="sales-image-icon">
                <Icon icon={iconObject(<AddPhotoAlternate />)} />
              </div>
              <img
                alt=""
                onError={() => {
                  setSalesImageLoaded(false);
                }}
                onLoad={() => {
                  setSalesImageLoaded(true);
                }}
                src={state.salesImg}
              />
            </div>
            <div className="sales-field">
              <TextField
                autoComplete="off"
                helpText={{
                  children: "Must be direct link to image",
                  persistent: true,
                  validationMsg: true,
                }}
                icon="link"
                label="URL"
                name="salesImg"
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                outlined
                pattern={validLink}
                value={state.salesImg}
              />
              <Checkbox
                checked={state.salesThirdParty}
                className="sales-checkbox"
                id="CreateSalesThirdParty"
                label="Third party graph"
                name="salesThirdParty"
                onChange={handleChange}
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

export const ModalEdit = ({ close, open, set }: ModalEditProps) => {
  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);

  const allDesigners = useAppSelector(selectAllDesigners);
  const allProfiles = useAppSelector(selectAllProfiles);
  const allVendors = useAppSelector(selectAllVendors);
  const allVendorRegions = useAppSelector(selectAllVendorRegions);

  const [id, setId] = useState("");

  type State = {
    alias: string;
    colorway: string;
    designer: string[];
    details: string;
    gbEnd: string;
    gbLaunch: string;
    gbMonth: boolean;
    icDate: string;
    image: Blob | File | string | null;
    imageUploadProgress: number;
    imageURL: string;
    newImage: boolean;
    notes: string;
    profile: string;
    salesImageLoaded: boolean;
    salesImg: string;
    salesThirdParty: boolean;
    shipped: boolean;
    vendors: VendorType[];
  };

  const initialState: State = {
    alias: "",
    colorway: "",
    designer: [""],
    details: "",
    gbEnd: "",
    gbLaunch: "",
    gbMonth: true,
    icDate: "",
    image: null,
    imageUploadProgress: 0,
    imageURL: "",
    newImage: false,
    notes: "",
    profile: "",
    salesImageLoaded: false,
    salesImg: "",
    salesThirdParty: false,
    shipped: false,
    vendors: [],
  };

  const [state, updateState] = useImmer(initialState);

  const keyedUpdate =
    <T extends State, K extends keyof T>(key: K, payload: T[K]) =>
    (draft: T) => {
      draft[key] = payload;
    };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [focused, setFocused] = useState("");

  const setValues = () => {
    let gbLaunch = "";
    if (set.gbLaunch) {
      if (set.gbMonth) {
        const twoNumRegExp = /^\d{4}-\d{1,2}-\d{2}$/g;
        const oneNumRegExp = /^\d{4}-\d{1,2}-\d{1}$/g;
        if (twoNumRegExp.test(set.gbLaunch)) {
          gbLaunch = set.gbLaunch.slice(0, -3);
        } else if (oneNumRegExp.test(set.gbLaunch)) {
          gbLaunch = set.gbLaunch.slice(0, -2);
        } else {
          ({ gbLaunch } = set);
        }
      } else {
        ({ gbLaunch } = set);
      }
    }

    setId(set.id);
    updateState((draft) => ({
      ...draft,
      alias: set.alias || nanoid(10),
      colorway: set.colorway,
      designer: set.designer,
      details: set.details,
      gbEnd: set.gbEnd,
      gbLaunch,
      gbMonth: !!set.gbMonth ?? false,
      icDate: set.icDate,
      imageURL: set.image,
      notes: set.notes ?? "",
      profile: set.profile,
      salesImg: set.sales?.img ?? "",
      salesThirdParty: set.sales?.thirdParty ?? false,
      shipped: set.shipped ?? false,
      vendors:
        set.vendors?.map((vendor) => {
          if (!vendor.id) {
            vendor.id = nanoid();
          }
          return vendor;
        }) ?? [],
    }));
  };

  const closeModal = () => {
    close();
    updateState(initialState);
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

  useEffect(() => {
    if (open) {
      setValues();
    } else {
      setTimeout(closeModal, 300);
    }
  }, [open]);

  const setImage = (image: Blob | File | null) =>
    updateState((draft) => {
      draft.image = image;
      draft.newImage = true;
    });

  const handleFocus = (e: FocusEvent<HTMLInputElement>) =>
    setFocused(e.target.name);

  const handleBlur = () => setFocused("");

  const toggleDate = () => updateState(keyedUpdate("gbMonth", !state.gbMonth));

  const selectValue = (prop: string, value: string) => {
    if (hasKey(state, prop)) {
      updateState(keyedUpdate(prop, value));
    }
    setFocused("");
  };

  const selectValueAppend = (prop: string, value: string) =>
    updateState((draft) => {
      if (hasKey(draft, prop)) {
        const { [prop]: original } = draft;
        if (original) {
          if (is<string[]>(original)) {
            original[original.length - 1] = value;
            setFocused("");
          } else if (is<string>(original)) {
            const array = original.split(", ");
            array[array.length - 1] = value;
            draft[prop as KeysMatching<State, string>] = array.join(", ");
            setFocused("");
          }
        }
      }
    });

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        vendor[property] = value;
        setFocused("");
      }
    });
  };

  const selectVendorAppend = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        const { [property]: original } = vendor;
        if (original) {
          const array = original.split(", ");
          array[array.length - 1] = value;
          vendor[property] = array.join(", ");
          setFocused("");
        }
      }
    });
  };

  const handleChange = ({
    target: { checked, name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "designer") {
      updateState(keyedUpdate(name, value.split(", ")));
    } else if (name === "shipped" || name === "salesThirdParty") {
      updateState(keyedUpdate(name, checked));
    } else if (hasKey(state, name)) {
      updateState(keyedUpdate(name, value));
    }
  };

  const handleNamedChange =
    <Key extends keyof State>(name: Key) =>
    (value: State[Key]) =>
      updateState(keyedUpdate(name, value));

  const handleChangeVendor = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    const property = name.replace(/\d/g, "");
    const index = parseInt(name.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        vendor[property] = value;
      }
    });
  };

  const handleNamedChangeVendor =
    (name: keyof VendorType, index: number) => (value: string) =>
      updateState((draft) => {
        const {
          vendors: { [index]: vendor },
        } = draft;
        if (hasKey(vendor, name)) {
          vendor[name] = value;
        }
      });

  const handleChangeVendorEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    updateState((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (e.target.checked) {
        vendor.endDate = "";
      } else {
        delete vendor.endDate;
      }
    });
  };

  const addVendor = () => {
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    updateState((draft) => {
      draft.vendors.push(emptyVendor);
    });
  };

  const removeVendor = (index: number) =>
    updateState((draft) => {
      draft.vendors.splice(index, 1);
    });

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    updateState((draft) => {
      arrayMove(
        draft.vendors,
        result.source.index,
        result.destination?.index || 0
      );
    });
  };

  const setSalesImageLoaded = (val: boolean) =>
    updateState(keyedUpdate("salesImageLoaded", val));

  const valid =
    !!state.profile &&
    !!state.colorway &&
    !!state.designer &&
    !invalidDate(state.icDate, false, true, true) &&
    new RegExp(validLink).test(state.details) &&
    ((state.newImage && state.image instanceof Blob && !!state.image) ||
      !!state.imageURL) &&
    !invalidDate(state.gbLaunch, state.gbMonth, false, true) &&
    !invalidDate(state.gbEnd) &&
    arrayEveryType(state.vendors, validVendor) &&
    validSalesInfo(state);

  const editEntry = (imageUrl = state.imageURL) => {
    if (valid && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      firestore
        .collection("keysets")
        .doc(id as KeysetId)
        .update({
          alias: state.alias,
          colorway: state.colorway,
          designer: state.designer,
          details: state.details,
          gbEnd: state.gbEnd,
          gbLaunch: state.gbLaunch,
          gbMonth: state.gbMonth,
          icDate: state.icDate,
          image: imageUrl,
          latestEditor: user.id,
          notes: state.notes,
          profile: state.profile,
          sales: { img: state.salesImg, thirdParty: state.salesThirdParty },
          shipped: state.shipped,
          vendors: state.vendors,
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

  const uploadImage = () => {
    if (state.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(
        `${state.profile} ${state.colorway}`
      )}T${DateTime.utc().toFormat("yyyyMMddHHmmss")}`;
      const imageRef = keysetsRef.child(fileName + ".png");
      const uploadTask = imageRef.put(state.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          updateState(keyedUpdate("imageUploadProgress", progress));
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
              updateState(keyedUpdate("imageURL", downloadURL));
              editEntry(downloadURL);
              const fileNameRegex = /keysets%2F(.*)\?/;
              const regexMatch = set.image.match(fileNameRegex);
              if (regexMatch) {
                const [, imageName] = regexMatch;
                const folders = await getStorageFolders();
                const allImages = folders.map(
                  (folder) => `${folder}/${imageName}`
                );
                batchStorageDelete(allImages)
                  .then(() => {
                    queue.notify({
                      title: "Successfully deleted previous thumbnails.",
                    });
                  })
                  .catch((error) => {
                    queue.notify({
                      title: "Failed to delete previous thumbnails: " + error,
                    });
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

  const useDrawer = device !== "mobile";
  const dateCard = state.gbMonth ? (
    <Card className="date-container" outlined>
      <Typography className="date-title" tag="h3" use="caption">
        Month
      </Typography>
      <div className="date-form">
        <DatePicker
          allowQuarter
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          label="GB month"
          month
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          outlined
          showNowButton
          value={state.gbLaunch}
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton label="Date" onClick={toggleDate} type="button" />
        </CardActionButtons>
      </CardActions>
    </Card>
  ) : (
    <Card className="date-container" outlined>
      <Typography className="date-title" tag="h3" use="caption">
        Date
      </Typography>
      <div className="date-form">
        <DatePicker
          allowQuarter
          autoComplete="off"
          icon={iconObject(<CalendarToday />)}
          label="GB launch"
          name="gbLaunch"
          onChange={handleNamedChange("gbLaunch")}
          outlined
          showNowButton
          value={state.gbLaunch}
        />
        <DatePicker
          autoComplete="off"
          fallbackValue={state.gbLaunch}
          icon={iconObject(<CalendarToday />)}
          label="GB end"
          name="gbEnd"
          onChange={handleNamedChange("gbEnd")}
          outlined
          showNowButton
          value={state.gbEnd}
        />
      </div>
      <CardActions>
        <CardActionButtons>
          <CardActionButton label="Month" onClick={toggleDate} type="button" />
        </CardActionButtons>
      </CardActions>
    </Card>
  );
  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="entry-modal"
          onClose={closeModal}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right entry-modal"
          modal
          onClose={closeModal}
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
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? state.imageUploadProgress : undefined}
            />
          </FullScreenDialogAppBar>
        )}
        trueWrapper={(children) => (
          <DrawerHeader>
            {children}
            <LinearProgress
              closed={!(uploadingImage || uploadingDoc)}
              progress={uploadingImage ? state.imageUploadProgress : undefined}
            />
          </DrawerHeader>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={closeModal} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
        >
          Edit Entry
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!valid || uploadingImage || uploadingDoc}
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
            outlined={useDrawer}
            type="button"
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
        <div className="banner">
          <div className="banner-text">Make sure to read the entry guide.</div>
          <div className="banner-button">
            <a
              href="/guides?guideId=JLB4xxfx52NJmmnbvbzO"
              rel="noopener noreferrer"
              target="_blank"
            >
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
                  label="Profile"
                  name="profile"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  outlined
                  required
                  value={state.profile}
                />
                <Autocomplete
                  array={allProfiles}
                  minChars={1}
                  open={focused === "profile"}
                  prop="profile"
                  query={state.profile}
                  select={selectValue}
                />
              </MenuSurfaceAnchor>
            </div>
            <div className="field-container">
              <TextField
                autoComplete="off"
                className="field"
                helpText={{
                  children: "Enter a name",
                  persistent: false,
                  validationMsg: true,
                }}
                label="Colorway"
                name="colorway"
                onChange={handleChange}
                outlined
                required
                value={state.colorway}
              />
            </div>
          </div>
          <MenuSurfaceAnchor>
            <TextField
              autoComplete="off"
              disabled={user.isEditor === false && user.isDesigner}
              helpText={{
                children: (
                  <>
                    Separate multiple designers with{" "}
                    <code className="multiline">, </code>.
                  </>
                ),
                persistent: true,
              }}
              label="Designer"
              name="designer"
              onBlur={handleBlur}
              onChange={handleChange}
              onFocus={handleFocus}
              outlined
              required
              value={state.designer.join(", ")}
            />
            <Autocomplete
              array={allDesigners}
              listSplit
              minChars={2}
              open={focused === "designer"}
              prop="designer"
              query={state.designer.join(", ")}
              select={selectValueAppend}
            />
          </MenuSurfaceAnchor>
          <DatePicker
            autoComplete="off"
            icon={iconObject(<CalendarToday />)}
            label="IC date"
            name="icDate"
            onChange={handleNamedChange("icDate")}
            outlined
            required
            showNowButton
            value={state.icDate}
          />
          <TextField
            autoComplete="off"
            helpText={{
              children:
                state.details.length > 0
                  ? "Must be valid link"
                  : "Enter a link",
              persistent: false,
              validationMsg: true,
            }}
            icon="link"
            label="Details"
            name="details"
            onChange={handleChange}
            outlined
            pattern={validLink}
            required
            value={state.details}
          />
          <TextField
            autoComplete="off"
            label="Notes"
            name="notes"
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            outlined
            rows={2}
            textarea
            value={state.notes}
          />
          <ImageUpload
            desktop={device === "desktop"}
            image={
              state.newImage
                ? state.image
                : state.imageURL.replace("keysets", "thumbs")
            }
            setImage={setImage}
          />
          {dateCard}
          <Checkbox
            checked={state.shipped}
            id="edit-shipped"
            label="Shipped"
            name="shipped"
            onChange={handleChange}
          />
          <Typography className="subheader" tag="h3" use="caption">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-edit">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  className="vendors-container"
                  {...provided.droppableProps}
                >
                  {state.vendors.map((vendor, index) => {
                    const endDateField =
                      typeof vendor.endDate === "string" ? (
                        <DatePicker
                          autoComplete="off"
                          icon={iconObject(<CalendarToday />)}
                          label="End date"
                          name={"endDate" + index}
                          onChange={handleNamedChangeVendor("endDate", index)}
                          outlined
                          required
                          showNowButton
                          value={vendor.endDate || ""}
                        />
                      ) : null;
                    return (
                      <Draggable
                        key={vendor.id}
                        draggableId={vendor.id ? vendor.id : index.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            className={classNames("vendor-container", {
                              dragged: snapshot.isDragging,
                            })}
                            outlined
                            {...provided.draggableProps}
                            style={getVendorStyle(provided)}
                          >
                            <div className="title-container">
                              <Typography
                                className="vendor-title"
                                use="caption"
                              >
                                {"Vendor " + (index + 1)}
                              </Typography>
                              {withTooltip(
                                <IconButton
                                  icon={iconObject(<Delete />)}
                                  onClick={() => {
                                    removeVendor(index);
                                  }}
                                  type="button"
                                />,
                                "Delete"
                              )}
                              {withTooltip(
                                <Icon
                                  className="drag-handle"
                                  icon="drag_handle"
                                  {...provided.dragHandleProps}
                                />,
                                "Drag"
                              )}
                            </div>
                            <div className="vendor-form">
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={iconObject(<Store />)}
                                  label="Name"
                                  name={"name" + index}
                                  onBlur={handleBlur}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  outlined
                                  required
                                  value={vendor.name}
                                />
                                <Autocomplete
                                  array={allVendors}
                                  minChars={1}
                                  open={focused === "name" + index}
                                  prop={"name" + index}
                                  query={vendor.name}
                                  select={selectVendor}
                                />
                              </MenuSurfaceAnchor>
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={iconObject(<Public />)}
                                  label="Region"
                                  name={"region" + index}
                                  onBlur={handleBlur}
                                  onChange={handleChangeVendor}
                                  onFocus={handleFocus}
                                  outlined
                                  required
                                  value={vendor.region}
                                />
                                <Autocomplete
                                  array={allVendorRegions}
                                  minChars={1}
                                  open={focused === "region" + index}
                                  prop={"region" + index}
                                  query={vendor.region}
                                  select={selectVendorAppend}
                                />
                              </MenuSurfaceAnchor>
                              <TextField
                                autoComplete="off"
                                helpText={{
                                  children: "Must be valid link",
                                  persistent: false,
                                  validationMsg: true,
                                }}
                                icon="link"
                                label="Store link"
                                name={"storeLink" + index}
                                onBlur={handleBlur}
                                onChange={handleChangeVendor}
                                onFocus={handleFocus}
                                outlined
                                pattern={validLink}
                                value={vendor.storeLink}
                              />
                              <Checkbox
                                checked={
                                  !!vendor.endDate || vendor.endDate === ""
                                }
                                className="end-date-field"
                                id={"editEndDate" + index}
                                label="Different end date"
                                name={"endDate" + index}
                                onChange={handleChangeVendorEndDate}
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
            <Button
              label="Add vendor"
              onClick={addVendor}
              outlined
              type="button"
            />
          </div>
          <Card className="sales-container" outlined>
            <Typography className="sales-title" tag="h3" use="caption">
              Sales
            </Typography>
            <div
              className={classNames("sales-image", {
                loaded: state.salesImageLoaded,
              })}
            >
              <div className="sales-image-icon">
                <Icon icon={iconObject(<AddPhotoAlternate />)} />
              </div>
              <img
                alt=""
                onError={() => {
                  setSalesImageLoaded(false);
                }}
                onLoad={() => {
                  setSalesImageLoaded(true);
                }}
                src={state.salesImg}
              />
            </div>
            <div className="sales-field">
              <TextField
                autoComplete="off"
                helpText={{
                  children: "Must be direct link to image",
                  persistent: true,
                  validationMsg: true,
                }}
                icon="link"
                label="URL"
                name="salesImg"
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                outlined
                pattern={validLink}
                value={state.salesImg}
              />
              <Checkbox
                checked={state.salesThirdParty}
                className="sales-checkbox"
                id="editSalesThirdParty"
                label="Third party graph"
                name="salesThirdParty"
                onChange={handleChange}
              />
            </div>
          </Card>
        </form>
      </BoolWrapper>
    </BoolWrapper>
  );
};

export default ModalCreate;
