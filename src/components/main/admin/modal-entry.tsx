import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
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
import produce from "immer";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import type { DraggableProvided, DropResult } from "react-beautiful-dnd";
import { is } from "typescript-is";
import { useImmer } from "use-immer";
import { z } from "zod";
import { notify } from "~/app/snackbar-queue";
import { Autocomplete } from "@c/util/autocomplete";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import {
  FullScreenDialog,
  FullScreenDialogAppBar,
  FullScreenDialogContent,
} from "@c/util/full-screen-dialog";
import { withTooltip } from "@c/util/hocs";
import { DatePicker } from "@c/util/pickers/date-picker";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import firebase from "@s/firebase";
import firestore from "@s/firebase/firestore";
import type { KeysetId } from "@s/firebase/types";
import {
  selectAllDesigners,
  selectAllProfiles,
  selectAllVendorRegions,
  selectAllVendors,
  selectSetById,
  setSet,
} from "@s/main";
import { partialSet } from "@s/main/constructors";
import { addLastDate } from "@s/main/functions";
import { gbMonthCheck, SetSchema } from "@s/main/schemas";
import type { SetType, VendorType } from "@s/main/types";
import { selectUser } from "@s/user";
import type { CurrentUserType } from "@s/user/types";
import {
  arrayMove,
  batchStorageDelete,
  formatFileName,
  getStorageFolders,
  hasKey,
  iconObject,
} from "@s/util/functions";
import type { KeysMatching, Overwrite } from "@s/util/types";
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
      const axisLockY = `translate(0px, ${YVal}px)`;
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

type KeysetState = Overwrite<SetType, { image: Blob | File | string }>;

type ModalEntryProps = {
  onClose: () => void;
  onSubmit: (keyset: KeysetState) => void;
  open: boolean;
  user: CurrentUserType;
  keyset?: SetType;
  loading?: boolean | number;
};

export const ModalEntry = ({
  keyset: propsKeyset,
  loading,
  onClose,
  onSubmit,
  open,
  user,
}: ModalEntryProps) => {
  const device = useDevice();

  const allDesigners = useAppSelector(selectAllDesigners);
  const allProfiles = useAppSelector(selectAllProfiles);
  const allVendors = useAppSelector(selectAllVendors);
  const allVendorRegions = useAppSelector(selectAllVendorRegions);

  const [keyset, updateKeyset] = useImmer<KeysetState>(
    partialSet({ alias: nanoid(10) })
  );

  const keyedKeysetUpdate =
    <K extends keyof KeysetState>(key: K, payload: KeysetState[K]) =>
    (draft: KeysetState) => {
      draft[key] = payload;
    };

  const [salesImageLoaded, setSalesImageLoaded] = useState(false);

  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (!user.isEditor && user.isDesigner) {
      updateKeyset(keyedKeysetUpdate("designer", [user.nickname]));
    }
    if (!open) {
      updateKeyset(partialSet({ alias: nanoid(10) }));
      setSalesImageLoaded(false);
      setFocused("");
    }
  }, [open]);

  useEffect(() => {
    if (propsKeyset) {
      updateKeyset(
        produce(propsKeyset, (draft) => {
          draft.alias ??= nanoid(10);
          draft.gbMonth ??= false;
          draft.notes ??= "";
          draft.sales ??= {
            img: "",
            thirdParty: false,
          };
          draft.sales.img ??= "";
          draft.sales.thirdParty ??= false;
          draft.vendors ??= [];
          draft.vendors.forEach((vendor) => {
            vendor.id ??= nanoid();
          });
          if (draft.gbMonth && draft.gbLaunch.length === 10) {
            draft.gbLaunch = draft.gbLaunch.slice(0, 7);
          }
        })
      );
    }
  }, [propsKeyset, open]);

  const setImage = (image: Blob | File) =>
    updateKeyset(keyedKeysetUpdate("image", image));

  const handleFocus = (e: FocusEvent<HTMLInputElement>) =>
    setFocused(e.target.name);

  const handleBlur = () => setFocused("");

  const toggleDate = () =>
    updateKeyset((keyset) => {
      keyset.gbMonth = !keyset.gbMonth;
    });

  const selectValue = (prop: string, value: string) => {
    if (hasKey(keyset, prop)) {
      updateKeyset(keyedKeysetUpdate(prop, value));
    }
    setFocused("");
  };

  const selectValueAppend = (prop: string, value: string) =>
    updateKeyset((draft) => {
      if (hasKey(draft, prop)) {
        const { [prop]: original } = draft;
        if (original) {
          if (is<string[]>(original)) {
            original[original.length - 1] = value;
            setFocused("");
          } else if (is<string>(original)) {
            const array = original.split(", ");
            array[array.length - 1] = value;
            draft[prop as KeysMatching<KeysetState, string>] = array.join(", ");
            setFocused("");
          }
        }
      }
    });

  const selectVendor = (prop: string, value: string) => {
    const property = prop.replace(/\d/g, "");
    const index = parseInt(prop.replace(/\D/g, ""));
    updateKeyset((draft) => {
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
    updateKeyset((draft) => {
      const {
        vendors: { [index]: vendor },
      } = draft;
      if (hasKey(vendor, property)) {
        const { [property]: original } = vendor;
        if (typeof original !== "undefined") {
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
      updateKeyset(keyedKeysetUpdate(name, value.split(", ")));
    } else if (name === "shipped") {
      updateKeyset(keyedKeysetUpdate(name, checked));
    } else if (hasKey(keyset, name)) {
      updateKeyset(keyedKeysetUpdate(name, value));
    }
  };

  const handleSalesImage = ({
    target: { checked, name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (hasKey(keyset.sales, name)) {
      if (name === "thirdParty") {
        updateKeyset((keyset) => {
          keyset.sales[name] = checked;
        });
      } else {
        updateKeyset((keyset) => {
          keyset.sales[name] = value;
        });
      }
    }
  };

  const handleNamedChange =
    <Key extends keyof KeysetState>(name: Key) =>
    (value: KeysetState[Key]) =>
      updateKeyset(keyedKeysetUpdate(name, value));

  const handleChangeVendor = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    const property = name.replace(/\d/g, "");
    const index = parseInt(name.replace(/\D/g, ""));
    updateKeyset((draft) => {
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
      updateKeyset((draft) => {
        const {
          vendors: { [index]: vendor },
        } = draft;
        if (hasKey(vendor, name)) {
          vendor[name] = value;
        }
      });

  const handleChangeVendorEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.name.replace(/\D/g, ""));
    updateKeyset((draft) => {
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
    updateKeyset((draft) => {
      draft.vendors.push(emptyVendor);
    });
  };

  const removeVendor = (index: number) =>
    updateKeyset((draft) => {
      draft.vendors.splice(index, 1);
    });

  const handleDragVendor = (result: DropResult) => {
    if (!result.destination) return;
    updateKeyset((draft) => {
      arrayMove(
        draft.vendors,
        result.source.index,
        result.destination?.index || 0
      );
    });
  };

  const result = useMemo(
    () =>
      gbMonthCheck(
        SetSchema.extend({
          id: z.string().min(propsKeyset ? 1 : 0),
          image: z.union([z.string().url(), z.instanceof(Blob)]),
        })
      ).safeParse(keyset),
    [keyset]
  );

  const useDrawer = device !== "mobile";
  const dateCard = keyset.gbMonth ? (
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
          value={keyset.gbLaunch}
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
          value={keyset.gbLaunch}
        />
        <DatePicker
          autoComplete="off"
          fallbackValue={keyset.gbLaunch}
          icon={iconObject(<CalendarToday />)}
          label="GB end"
          name="gbEnd"
          onChange={handleNamedChange("gbEnd")}
          outlined
          showNowButton
          value={keyset.gbEnd}
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
        <FullScreenDialog className="entry-modal" {...{ onClose, open }}>
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right entry-modal"
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
            <LinearProgress
              closed={!loading}
              progress={typeof loading === "number" ? loading : undefined}
            />
          </FullScreenDialogAppBar>
        )}
        trueWrapper={(children) => (
          <DrawerHeader>
            {children}
            <LinearProgress
              closed={!loading}
              progress={typeof loading === "number" ? loading : undefined}
            />
          </DrawerHeader>
        )}
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
          {propsKeyset ? "Edit" : "Create"} Entry
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          <Button
            disabled={!result?.success || !!loading}
            label="Save"
            onClick={() => onSubmit(keyset)}
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
              href="/guides/JLB4xxfx52NJmmnbvbzO"
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
                  value={keyset.profile}
                />
                <Autocomplete
                  array={allProfiles}
                  minChars={1}
                  open={focused === "profile"}
                  prop="profile"
                  query={keyset.profile}
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
                value={keyset.colorway}
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
              value={keyset.designer.join(", ")}
            />
            <Autocomplete
              array={allDesigners}
              listSplit
              minChars={2}
              open={focused === "designer"}
              prop="designer"
              query={keyset.designer.join(", ")}
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
            value={keyset.icDate}
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
            value={keyset.details}
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
            value={keyset.notes}
          />
          <ImageUpload
            desktop={device === "desktop"}
            image={keyset.image}
            setImage={setImage}
          />
          {dateCard}
          <Checkbox
            checked={keyset.shipped}
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
                  {keyset.vendors.map((vendor, index) => {
                    const endDateField = typeof vendor.endDate === "string" && (
                      <DatePicker
                        autoComplete="off"
                        icon={iconObject(<CalendarToday />)}
                        label="End date"
                        name={`endDate${index}`}
                        onChange={handleNamedChangeVendor("endDate", index)}
                        outlined
                        required
                        showNowButton
                        value={vendor.endDate}
                      />
                    );
                    return (
                      <Draggable
                        key={vendor.id}
                        draggableId={vendor.id ?? index.toString()}
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
                                {`Vendor ${index + 1}`}
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
                                  name={`name${index}`}
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
                                  open={focused === `name${index}`}
                                  prop={`name${index}`}
                                  query={vendor.name}
                                  select={selectVendor}
                                />
                              </MenuSurfaceAnchor>
                              <MenuSurfaceAnchor>
                                <TextField
                                  autoComplete="off"
                                  icon={iconObject(<Public />)}
                                  label="Region"
                                  name={`region${index}`}
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
                                  open={focused === `region${index}`}
                                  prop={`region${index}`}
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
                                name={`storeLink${index}`}
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
                                id={`editEndDate${index}`}
                                label="Different end date"
                                name={`endDate${index}`}
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
                loaded: salesImageLoaded,
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
                src={keyset.sales.img}
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
                name="img"
                onBlur={handleBlur}
                onChange={handleSalesImage}
                onFocus={handleFocus}
                outlined
                pattern={validLink}
                value={keyset.sales.img}
              />
              <Checkbox
                checked={keyset.sales.thirdParty}
                className="sales-checkbox"
                label="Third party graph"
                name="thirdParty"
                onChange={handleSalesImage}
              />
            </div>
          </Card>
        </form>
      </BoolWrapper>
    </BoolWrapper>
  );
};

type ModalCreateProps = {
  onClose: () => void;
  open: boolean;
};

export const ModalCreate = ({ onClose, open }: ModalCreateProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const createEntry = async (entry: SetType) => {
    const result = SetSchema.omit({ id: true }).safeParse(entry);
    if (result.success && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      const set = {
        ...result.data,
        alias: nanoid(10),
        latestEditor: user.id,
      };
      try {
        const docRef = await firestore.collection("keysets").add(set);
        console.log("Document written with ID: ", docRef.id);
        notify({ title: "Entry written successfully." });
        dispatch(
          setSet({
            ...set,
            gbLaunch:
              set.gbMonth && !set.gbLaunch.includes("Q")
                ? addLastDate(set.gbLaunch)
                : set.gbLaunch,
            id: docRef.id,
          })
        );
        onClose();
      } catch (error) {
        console.error(error);
        notify({ title: `Error adding document: ${error}` });
      } finally {
        setUploadingDoc(false);
      }
    } else {
      console.log(result);
    }
  };

  const uploadImage = (entry: KeysetState) => {
    if (entry.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(
        `${entry.profile} ${entry.colorway}`
      )}T${DateTime.utc().toFormat("yyyyMMddHHmmss")}`;
      const imageRef = keysetsRef.child(`${fileName}.png`);
      const uploadTask = imageRef.put(entry.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          setImageUploadProgress(
            snapshot.bytesTransferred / snapshot.totalBytes
          );
        },
        (error) => {
          // Handle unsuccessful uploads
          notify({ title: `Failed to upload image: ${error}` });
          setUploadingImage(false);
          setImageUploadProgress(0);
        },
        async () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          notify({ title: "Successfully uploaded image." });
          try {
            const downloadURL = await imageRef.getDownloadURL();
            setUploadingImage(false);
            setImageUploadProgress(0);
            createEntry({ ...entry, image: downloadURL });
          } catch (error) {
            setUploadingImage(false);
            setImageUploadProgress(0);
            notify({ title: `Failed to get URL: ${error}` });
            console.error(error);
          }
        }
      );
    }
  };

  const onSubmit = (entry: KeysetState) => {
    if (entry.image instanceof Blob) {
      uploadImage(entry);
    } else {
      createEntry(entry as SetType);
    }
  };

  return (
    <ModalEntry
      loading={imageUploadProgress || uploadingImage || uploadingDoc}
      {...{ onClose, onSubmit, open, user }}
    />
  );
};

type ModalEditProps = ModalCreateProps & {
  set: EntityId;
};

export const ModalEdit = ({ onClose, open, set: setId }: ModalEditProps) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const set = useAppSelector((state) => selectSetById(state, setId));

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const editEntry = async (entry: SetType) => {
    const result = SetSchema.safeParse(entry);
    if (result.success && !uploadingImage && !uploadingDoc) {
      setUploadingDoc(true);
      const {
        data: { id, ...data },
      } = result;
      try {
        await firestore
          .collection("keysets")
          .doc(id as KeysetId)
          .update({ ...data, latestEditor: user.id });
        notify({ title: "Entry edited successfully." });
        onClose();
        dispatch(setSet(result.data));
      } catch (error) {
        notify({ title: `Error editing document: ${error}` });
        console.error(error);
      } finally {
        setUploadingDoc(false);
      }
    }
  };

  const uploadImage = (entry: KeysetState) => {
    if (entry.image instanceof Blob) {
      setUploadingImage(true);
      const storageRef = firebase.storage().ref();
      const keysetsRef = storageRef.child("keysets");
      const fileName = `${formatFileName(
        `${entry.profile} ${entry.colorway}`
      )}T${DateTime.utc().toFormat("yyyyMMddHHmmss")}`;
      const imageRef = keysetsRef.child(`${fileName}.png`);
      const uploadTask = imageRef.put(entry.image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          setImageUploadProgress(
            snapshot.bytesTransferred / snapshot.totalBytes
          );
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error(error);
          notify({ title: `Failed to upload image: ${error}` });
          setUploadingImage(false);
          setImageUploadProgress(0);
        },
        async () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          notify({ title: "Successfully uploaded image." });
          try {
            const downloadURL = await imageRef.getDownloadURL();
            setUploadingImage(false);
            setImageUploadProgress(0);
            editEntry({ ...entry, image: downloadURL });
            const fileNameRegex = /keysets%2F(.*)\?/;
            const regexMatch = set?.image.match(fileNameRegex);
            if (regexMatch) {
              const [, imageName] = regexMatch;
              const folders = await getStorageFolders();
              const allImages = folders.map(
                (folder) => `${folder}/${imageName}`
              );
              try {
                await batchStorageDelete(allImages);
                notify({
                  title: "Successfully deleted previous thumbnails.",
                });
              } catch (error) {
                notify({
                  title: `Failed to delete previous thumbnails: ${error}`,
                });
                console.error(error);
              }
            }
          } catch (error) {
            setUploadingImage(false);
            setImageUploadProgress(0);
            notify({ title: `Failed to get URL: ${error}` });
            console.error(error);
          }
        }
      );
    }
  };

  const onSubmit = (entry: KeysetState) => {
    if (entry.image instanceof Blob) {
      uploadImage(entry);
    } else {
      editEntry(entry as SetType);
    }
  };

  return (
    <ModalEntry
      keyset={set}
      loading={imageUploadProgress || uploadingImage || uploadingDoc}
      {...{ onClose, onSubmit, open, user }}
    />
  );
};

export default ModalEntry;
