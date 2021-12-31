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
  };

  const initialState: State = {
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
    target: { name, value, checked },
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

  const setSalesImageLoaded = (val: boolean) =>
    updateState(keyedUpdate("salesImageLoaded", val));

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
        <Drawer
          modal
          open={open}
          onClose={closeModal}
          className="drawer-right entry-modal"
        >
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog
          open={open}
          onClose={closeModal}
          className="entry-modal"
        >
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
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
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
        falseWrapper={(children) => (
          <FullScreenDialogContent>{children}</FullScreenDialogContent>
        )}
      >
        <div className="banner">
          <div className="banner-text">Make sure to read the entry guide.</div>
          <div className="banner-button">
            <a
              href="/guides?guideId=JLB4xxfx52NJmmnbvbzO"
              target="_blank"
              rel="noopener noreferrer"
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
                    Separate multiple designers with{" "}
                    <code className="multiline">, </code>.
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
            helpText={{
              persistent: false,
              validationMsg: true,
              children: "Must be valid link",
            }}
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
          <ImageUpload
            image={state.image}
            setImage={setImage}
            desktop={device === "desktop"}
          />
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
                <div
                  className="vendors-container"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
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
                      <Draggable
                        key={vendor.id}
                        draggableId={vendor.id ? vendor.id : index.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            outlined
                            className={classNames("vendor-container", {
                              dragged: snapshot.isDragging,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getVendorStyle(provided)}
                          >
                            <div className="title-container">
                              <Typography
                                use="caption"
                                className="vendor-title"
                              >
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
                                <Icon
                                  icon="drag_handle"
                                  className="drag-handle"
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
                                checked={
                                  !!vendor.endDate || vendor.endDate === ""
                                }
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
              type="button"
              outlined
              label="Add vendor"
              onClick={addVendor}
            />
          </div>
          <Card outlined className="sales-container">
            <Typography use="caption" tag="h3" className="sales-title">
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
                helpText={{
                  persistent: true,
                  validationMsg: true,
                  children: "Must be direct link to image",
                }}
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
  };

  const initialState: State = {
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
    if (open) {
      setValues();
    } else {
      setTimeout(closeModal, 300);
    }
  }, [open]);

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
      profile: set.profile,
      colorway: set.colorway,
      designer: set.designer,
      icDate: set.icDate,
      details: set.details,
      notes: set.notes ?? "",
      gbMonth: !!set.gbMonth ?? false,
      gbLaunch,
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
    }));
  };

  const closeModal = () => {
    close();
    updateState(initialState);
    setUploadingImage(false);
    setUploadingDoc(false);
    setFocused("");
  };

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
    target: { name, value, checked },
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
    updateState(keyedUpdate("salesImageLoaded", val));
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
        <Drawer
          modal
          open={open}
          onClose={closeModal}
          className="drawer-right entry-modal"
        >
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog
          open={open}
          onClose={closeModal}
          className="entry-modal"
        >
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
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
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
        falseWrapper={(children) => (
          <FullScreenDialogContent>{children}</FullScreenDialogContent>
        )}
      >
        <div className="banner">
          <div className="banner-text">Make sure to read the entry guide.</div>
          <div className="banner-button">
            <a
              href="/guides?guideId=JLB4xxfx52NJmmnbvbzO"
              target="_blank"
              rel="noopener noreferrer"
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
                helpText={{
                  persistent: false,
                  validationMsg: true,
                  children: "Enter a name",
                }}
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
                    Separate multiple designers with{" "}
                    <code className="multiline">, </code>.
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
              children:
                state.details.length > 0
                  ? "Must be valid link"
                  : "Enter a link",
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
            image={
              state.newImage
                ? state.image
                : state.imageURL.replace("keysets", "thumbs")
            }
            setImage={setImage}
            desktop={device === "desktop"}
          />
          {dateCard}
          <Checkbox
            label="Shipped"
            id="edit-shipped"
            name="shipped"
            checked={state.shipped}
            onChange={handleChange}
          />
          <Typography use="caption" tag="h3" className="subheader">
            Vendors
          </Typography>
          <DragDropContext onDragEnd={handleDragVendor}>
            <Droppable droppableId="vendors-edit">
              {(provided) => (
                <div
                  className="vendors-container"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
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
                      <Draggable
                        key={vendor.id}
                        draggableId={vendor.id ? vendor.id : index.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            outlined
                            className={classNames("vendor-container", {
                              dragged: snapshot.isDragging,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getVendorStyle(provided)}
                          >
                            <div className="title-container">
                              <Typography
                                use="caption"
                                className="vendor-title"
                              >
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
                                <Icon
                                  icon="drag_handle"
                                  className="drag-handle"
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
                                checked={
                                  !!vendor.endDate || vendor.endDate === ""
                                }
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
              type="button"
              outlined
              label="Add vendor"
              onClick={addVendor}
            />
          </div>
          <Card outlined className="sales-container">
            <Typography use="caption" tag="h3" className="sales-title">
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
                helpText={{
                  persistent: true,
                  validationMsg: true,
                  children: "Must be direct link to image",
                }}
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
