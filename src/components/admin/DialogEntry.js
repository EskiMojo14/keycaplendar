import React from "react";
import PropTypes from "prop-types";
import firebase from "../firebase";
import { userTypes, setTypes, queueTypes } from "../util/propTypeTemplates";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nanoid } from "nanoid";
import { Button } from "@rmwc/button";
import { Card, CardActions, CardActionButtons, CardActionButton } from "@rmwc/card";
import { Checkbox } from "@rmwc/checkbox";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { Tooltip } from "@rmwc/tooltip";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ImageUpload } from "./ImageUpload";
import { Autocomplete } from "../util/Autocomplete";
import "./DialogEntry.scss";

const getVendorStyle = (provided, snapshot) => {
  const style = provided.draggableProps.style;
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
};

export class DialogCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opening: false,
      closing: false,
      animate: false,
      open: false,
      profile: "",
      colorway: "",
      designer: [],
      icDate: "",
      details: "",
      sales: "",
      image: null,
      gbMonth: true,
      gbLaunch: "",
      gbEnd: "",
      shipped: false,
      vendors: [],
      loading: false,
      imageUploadProgress: 0,
      imageURL: "",
      salesImageLoaded: false,
      focused: "",
    };
  }
  componentDidMount() {
    this.setState({ open: this.props.open });
  }
  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      if (this.props.open) {
        this.openDialog();
      } else {
        this.closeDialog();
      }
    }
    if (this.props.open !== prevProps.open) {
      if (this.props.user.isEditor === false && this.props.user.isDesigner) {
        this.setState({
          designer: [this.props.user.nickname],
        });
      }
    }
  }
  openDialog = () => {
    this.setState({ open: true, animate: true });
    setTimeout(() => {
      this.setState({ opening: true });
    }, 1);
    setTimeout(() => {
      this.setState({ animate: false, opening: false });
    }, 450);
  };
  closeDialog = () => {
    this.setState({
      closing: true,
      profile: "",
      colorway: "",
      designer: [],
      icDate: "",
      details: "",
      sales: "",
      image: null,
      gbMonth: true,
      gbLaunch: "",
      gbEnd: "",
      shipped: false,
      vendors: [],
      loading: false,
      imageUploadProgress: 0,
      imageURL: "",
      focused: "",
    });
    setTimeout(() => {
      this.props.close();
      this.setState({ open: false, closing: false });
    }, 400);
  };

  handleFocus = (e) => {
    this.setState({
      focused: e.target.name,
    });
  };

  handleBlur = () => {
    this.setState({
      focused: "",
    });
  };

  selectValue = (prop, value) => {
    if (prop === "designer") {
      this.setState({
        [prop]: [value],
        focused: "",
      });
    } else {
      this.setState({
        [prop]: value,
        focused: "",
      });
    }
  };

  selectVendor = (prop, value) => {
    const property = prop.slice(0, -1);
    const index = prop.slice(prop.length - 1);
    let vendorsCopy = this.state.vendors;
    vendorsCopy[index][property] = value;
    this.setState({
      vendors: vendorsCopy,
      focused: "",
    });
  };

  toggleDate = () => {
    this.setState({
      gbMonth: !this.state.gbMonth,
    });
  };

  setImage = (image) => {
    //resize image to 480px height
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (event) => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const elem = document.createElement("canvas");
        const width = img.width * (480 / img.height);
        const height = 480;
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext("2d");
        // img.width and img.height will contain the original dimensions
        ctx.drawImage(img, 0, 0, width, height);
        ctx.canvas.toBlob((blob) => {
          this.setState({
            image: blob,
          });
        }, "image/png");
        reader.onerror = (error) => this.props.snackbarQueue.notify({ title: "Failed to set image:" + error });
      };
    };
  };

  handleChange = (e) => {
    if (e.target.name === "designer") {
      this.setState({
        [e.target.name]: e.target.value.split(", "),
      });
    } else if (e.target.name === "shipped") {
      this.setState({
        [e.target.name]: e.target.checked,
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  handleChangeVendor = (e) => {
    let vendors = this.state.vendors;
    const field = e.target.name.replace(/\d/g, "");
    const index = e.target.name.replace(/\D/g, "");
    vendors[index][field] = e.target.value;
    this.setState({
      vendors: vendors,
    });
  };

  addVendor = () => {
    let vendors = this.state.vendors;
    const emptyVendor = {
      id: nanoid(),
      name: "",
      region: "",
      storeLink: "",
    };
    vendors.push(emptyVendor);
    this.setState({
      vendors: vendors,
    });
  };

  removeVendor = (index) => {
    let vendors = this.state.vendors;
    vendors.splice(index, 1);
    this.setState({
      vendors: vendors,
    });
  };

  moveVendor = (index) => {
    function array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    }
    let vendors = this.state.vendors;
    array_move(vendors, index, index - 1);
    this.setState({
      vendors: vendors,
    });
  };

  handleDragVendor = (result) => {
    if (!result.destination) return;
    function array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    }
    let vendors = this.state.vendors;
    array_move(vendors, result.source.index, result.destination.index);
    this.setState({
      vendors: vendors,
    });
  };

  uploadImage = () => {
    this.setState({ loading: true });
    const storageRef = firebase.storage().ref();
    const keysetsRef = storageRef.child("keysets");
    const fileName =
      this.state.profile.toLowerCase() +
      this.state.colorway
        .normalize("NFD")
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/\W+(.)/g, function (match, chr) {
          return chr.toUpperCase();
        });
    const imageRef = keysetsRef.child(fileName + ".png");
    const uploadTask = imageRef.put(this.state.image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({ imageUploadProgress: progress });
      },
      (error) => {
        // Handle unsuccessful uploads
        this.props.snackbarQueue.notify({ title: "Failed to upload image: " + error });
        this.setState({ loading: false });
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        this.props.snackbarQueue.notify({ title: "Successfully uploaded image." });
        imageRef
          .getDownloadURL()
          .then((downloadURL) => {
            this.setState({
              imageURL: downloadURL,
              loading: false,
            });
            this.createEntry();
          })
          .catch((error) => {
            this.props.snackbarQueue.notify({ title: "Failed to get URL: " + error });
            this.setState({
              loading: false,
            });
          });
      }
    );
  };

  createEntry = () => {
    const db = firebase.firestore();
    db.collection("keysets")
      .add({
        profile: this.state.profile,
        colorway: this.state.colorway,
        designer: this.state.designer,
        icDate: this.state.icDate,
        details: this.state.details,
        sales: this.state.sales,
        image: this.state.imageURL,
        gbMonth: this.state.gbMonth,
        gbLaunch: this.state.gbLaunch,
        gbEnd: this.state.gbEnd,
        shipped: this.state.shipped,
        vendors: this.state.vendors,
        latestEditor: this.props.user.id,
      })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        this.props.snackbarQueue.notify({ title: "Entry written successfully." });
        this.closeDialog();
        this.props.getData();
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        this.props.snackbarQueue.notify({ title: "Error adding entry: ", error });
      });
  };

  setSalesImageLoaded = (val) => {
    this.setState({ salesImageLoaded: !!val });
  };

  render() {
    const formFilled =
      this.state.profile !== "" &&
      this.state.colorway !== "" &&
      this.state.designer !== [] &&
      this.state.icDate !== "" &&
      this.state.details !== "" &&
      this.state.image;
    const dateCard = this.state.gbMonth ? (
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
            value={this.state.gbLaunch}
            name="gbLaunch"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM" }}
            onChange={this.handleChange}
          />
        </div>
        <CardActions>
          <CardActionButtons>
            <CardActionButton
              label="Date"
              onClick={(e) => {
                e.preventDefault();
                this.toggleDate();
              }}
            />
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
            value={this.state.gbLaunch}
            name="gbLaunch"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD or Q1-4 YYYY" }}
            onChange={this.handleChange}
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
            value={this.state.gbEnd}
            name="gbEnd"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
            onChange={this.handleChange}
          />
        </div>
        <CardActions>
          <CardActionButtons>
            <CardActionButton
              label="Month"
              onClick={(e) => {
                e.preventDefault();
                this.toggleDate();
              }}
            />
          </CardActionButtons>
        </CardActions>
      </Card>
    );
    return (
      <div className="full-screen-dialog-container">
        <div
          className={
            "full-screen-dialog create-dialog " +
            (this.state.open ? "full-screen-dialog--open " : "") +
            (this.state.opening ? "full-screen-dialog--opening " : "") +
            (this.state.closing ? "full-screen-dialog--closing " : "") +
            (this.state.animate ? "full-screen-dialog--animate" : "")
          }
        >
          <TopAppBar>
            <TopAppBarRow>
              <TopAppBarSection alignStart>
                <TopAppBarNavigationIcon icon="close" onClick={this.closeDialog} />
                <TopAppBarTitle>Create Entry</TopAppBarTitle>
              </TopAppBarSection>
              <TopAppBarSection alignEnd>
                <Button
                  label="Save"
                  onClick={(e) => {
                    if (formFilled) {
                      e.preventDefault();
                      this.uploadImage();
                    }
                  }}
                  disabled={!formFilled}
                />
              </TopAppBarSection>
            </TopAppBarRow>
            <LinearProgress closed={!this.state.loading} progress={this.state.imageUploadProgress} />
          </TopAppBar>
          <div className="full-screen-dialog-content">
            <div className="banner">
              <div className="banner-text">Make sure to read the entry guide.</div>
              <div className="banner-button">
                <a href="/guide/entries" target="_blank" rel="noopener noreferrer">
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
                      value={this.state.profile}
                      name="profile"
                      onChange={this.handleChange}
                      onFocus={this.handleFocus}
                      onBlur={this.handleBlur}
                    />
                    <Autocomplete
                      open={this.state.focused === "profile"}
                      array={this.props.profiles}
                      query={this.state.profile}
                      prop="profile"
                      select={this.selectValue}
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
                    value={this.state.colorway}
                    name="colorway"
                    helpText={{ persistent: false, validationMsg: true, children: "Enter a name" }}
                    onChange={this.handleChange}
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
                  value={this.state.designer.join(", ")}
                  name="designer"
                  helpText={{
                    persistent: false,
                    validationMsg: true,
                    children:
                      this.state.designer[0] && this.state.designer[0].includes(" ")
                        ? "Separate multiple designers with a comma and a space."
                        : "",
                  }}
                  onChange={this.handleChange}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                  disabled={this.props.user.isEditor === false && this.props.user.isDesigner}
                />
                <Autocomplete
                  open={this.state.focused === "designer"}
                  array={this.props.allDesigners}
                  query={this.state.designer.join(", ")}
                  prop="designer"
                  select={this.selectValue}
                  minChars={2}
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
                value={this.state.icDate}
                name="icDate"
                helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
                onChange={this.handleChange}
              />
              <TextField
                autoComplete="off"
                icon="link"
                outlined
                label="Details"
                required
                pattern="https?:\/\/.+"
                value={this.state.details}
                name="details"
                helpText={{
                  persistent: false,
                  validationMsg: true,
                  children: this.state.details.length > 0 ? "Must be valid link" : "Enter a link",
                }}
                onChange={this.handleChange}
              />
              <ImageUpload image={this.state.image} setImage={this.setImage} snackbarQueue={this.props.snackbarQueue} />
              {dateCard}
              <Checkbox label="Shipped" name="shipped" checked={this.state.shipped} onChange={this.handleChange} />
              <Typography use="caption" tag="h3" className="subheader">
                Vendors
              </Typography>
              <DragDropContext onDragEnd={this.handleDragVendor}>
                <Droppable droppableId="vendors-create">
                  {(provided) => (
                    <div className="vendors-container" ref={provided.innerRef} {...provided.droppableProps}>
                      {this.state.vendors.map((vendor, index) => {
                        return (
                          <Draggable key={vendor.id} draggableId={vendor.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                outlined
                                className={"vendor-container" + (snapshot.isDragging ? " dragged" : "")}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={getVendorStyle(provided, snapshot)}
                              >
                                <div className="title-container">
                                  <Typography use="caption" className="vendor-title">
                                    {"Vendor " + (index + 1)}
                                  </Typography>
                                  <Tooltip enterDelay={500} content="Delete" align="bottom">
                                    <IconButton
                                      icon={{
                                        strategy: "component",
                                        icon: (
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
                                        ),
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        this.removeVendor(index);
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip enterDelay={500} content="Drag" align="bottom">
                                    <Icon icon="drag_handle" className="drag-handle" {...provided.dragHandleProps} />
                                  </Tooltip>
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
                                      onChange={this.handleChangeVendor}
                                      onFocus={this.handleFocus}
                                      onBlur={this.handleBlur}
                                    />
                                    <Autocomplete
                                      open={this.state.focused === "name" + index}
                                      array={this.props.allVendors}
                                      query={this.state.vendors[index].name}
                                      prop={"name" + index}
                                      select={this.selectVendor}
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
                                      onChange={this.handleChangeVendor}
                                      onFocus={this.handleFocus}
                                      onBlur={this.handleBlur}
                                    />
                                    <Autocomplete
                                      open={this.state.focused === "region" + index}
                                      array={this.props.allRegions}
                                      query={this.state.vendors[index].region}
                                      prop={"region" + index}
                                      select={this.selectVendor}
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
                                    onChange={this.handleChangeVendor}
                                    onFocus={this.handleFocus}
                                    onBlur={this.handleBlur}
                                    helpText={{
                                      persistent: false,
                                      validationMsg: true,
                                      children: "Must be valid link",
                                    }}
                                  />
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
                  outlined
                  label="Add vendor"
                  onClick={(e) => {
                    e.preventDefault();
                    this.addVendor();
                  }}
                />
              </div>
              <Card outlined className="sales-container">
                <Typography use="caption" tag="h3" className="sales-title">
                  Sales
                </Typography>
                <div className={"sales-image" + (this.state.salesImageLoaded ? " loaded" : "")}>
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
                    src={this.state.sales}
                    alt=""
                    onLoad={() => {
                      this.setSalesImageLoaded(true);
                    }}
                    onError={() => {
                      this.setSalesImageLoaded(false);
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
                    value={this.state.sales}
                    name="sales"
                    helpText={{ persistent: true, validationMsg: true, children: "Must be direct link to image" }}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                  />
                </div>
              </Card>
            </form>
          </div>
        </div>
        <div className="full-screen-dialog-scrim"></div>
      </div>
    );
  }
}

export class DialogEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opening: false,
      closing: false,
      animate: false,
      open: false,
      id: "",
      profile: "",
      colorway: "",
      designer: [],
      icDate: "",
      details: "",
      sales: "",
      image: "",
      gbMonth: false,
      gbLaunch: "",
      gbEnd: "",
      shipped: false,
      vendors: [],
      loading: false,
      imageUploadProgress: 0,
      imageURL: "",
      newImage: false,
      salesImageLoaded: false,
      focused: "",
    };
  }
  componentDidMount() {
    this.setState({ open: this.props.open });
  }
  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      if (this.props.open) {
        this.setValues();
        this.openDialog();
      } else {
        this.closeDialog();
      }
    }
  }
  openDialog = () => {
    this.setState({ open: true, animate: true });
    setTimeout(() => {
      this.setState({ opening: true });
    }, 1);
    setTimeout(() => {
      this.setState({ animate: false, opening: false });
    }, 450);
  };
  closeDialog = () => {
    this.setState({
      closing: true,
      id: "",
      profile: "",
      colorway: "",
      designer: [],
      icDate: "",
      details: "",
      sales: "",
      image: "",
      gbMonth: false,
      gbLaunch: "",
      gbEnd: "",
      shipped: false,
      vendors: [],
      loading: false,
      imageUploadProgress: 0,
      imageURL: "",
      newImage: false,
      focused: "",
    });
    setTimeout(() => {
      this.props.close();
      this.setState({ open: false, closing: false });
    }, 400);
  };

  handleFocus = (e) => {
    this.setState({
      focused: e.target.name,
    });
  };

  handleBlur = () => {
    this.setState({
      focused: "",
    });
  };

  selectValue = (prop, value) => {
    if (prop === "designer") {
      this.setState({
        [prop]: [value],
        focused: "",
      });
    } else {
      this.setState({
        [prop]: value,
        focused: "",
      });
    }
  };

  selectVendor = (prop, value) => {
    const property = prop.slice(0, -1);
    const index = prop.slice(prop.length - 1);
    let vendorsCopy = this.state.vendors;
    vendorsCopy[index][property] = value;
    this.setState({
      vendors: vendorsCopy,
      focused: "",
    });
  };

  setValues = () => {
    let gbLaunch = "";
    if (this.props.set.gbMonth) {
      const twoNumRegExp = /^\d{4}-\d{1,2}-\d{2}$/g;
      const oneNumRegExp = /^\d{4}-\d{1,2}-\d{1}$/g;
      if (twoNumRegExp.test(this.props.set.gbLaunch)) {
        gbLaunch = this.props.set.gbLaunch.slice(0, -3);
      } else if (oneNumRegExp.test(this.props.set.gbLaunch)) {
        gbLaunch = this.props.set.gbLaunch.slice(0, -2);
      } else {
        gbLaunch = this.props.set.gbLaunch;
      }
    } else {
      gbLaunch = this.props.set.gbLaunch;
    }
    this.setState({
      ...this.props.set,
      sales: this.props.set.sales ? this.props.set.sales : "",
      gbLaunch: gbLaunch,
      shipped: this.props.set.shipped ? this.props.set.shipped : false,
      vendors: this.props.set.vendors.map((vendor) => {
        if (!vendor.id) {
          vendor.id = nanoid();
        }
        return vendor;
      }),
    });
  };

  setImage = (image) => {
    //resize image to 480px height
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (event) => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const elem = document.createElement("canvas");
        const width = img.width * (480 / img.height);
        const height = 480;
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext("2d");
        // img.width and img.height will contain the original dimensions
        ctx.drawImage(img, 0, 0, width, height);
        ctx.canvas.toBlob((blob) => {
          this.setState({
            image: blob,
            newImage: true,
          });
        }, "image/png");
        reader.onerror = (error) => this.props.snackbarQueue.notify({ title: "Failed to set image: " + error });
      };
    };
  };

  handleChange = (e) => {
    if (e.target.name === "designer") {
      this.setState({
        [e.target.name]: e.target.value.split(", "),
      });
    } else if (e.target.name === "shipped") {
      this.setState({
        [e.target.name]: e.target.checked,
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  handleChangeVendor = (e) => {
    let vendors = this.state.vendors;
    const field = e.target.name.replace(/\d/g, "");
    const index = e.target.name.replace(/\D/g, "");
    vendors[index][field] = e.target.value;
    this.setState({
      vendors: vendors,
    });
  };

  toggleDate = () => {
    this.setState({
      gbMonth: !this.state.gbMonth,
    });
  };

  addVendor = () => {
    let vendors = this.state.vendors;
    const emptyVendor = {
      name: "",
      region: "",
      storeLink: "",
    };
    vendors.push(emptyVendor);
    this.setState({
      vendors: vendors,
    });
  };

  removeVendor = (index) => {
    let vendors = this.state.vendors;
    vendors.splice(index, 1);
    this.setState({
      vendors: vendors,
    });
  };

  moveVendor = (index) => {
    function array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    }
    let vendors = this.state.vendors;
    array_move(vendors, index, index - 1);
    this.setState({
      vendors: vendors,
    });
  };

  handleDragVendor = (result) => {
    if (!result.destination) return;
    function array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    }
    let vendors = this.state.vendors;
    array_move(vendors, result.source.index, result.destination.index);
    this.setState({
      vendors: vendors,
    });
  };

  uploadImage = () => {
    this.setState({ loading: true });
    const storageRef = firebase.storage().ref();
    const keysetsRef = storageRef.child("keysets");
    const fileName =
      this.state.profile.toLowerCase() +
      this.state.colorway
        .normalize("NFD")
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/\W+(.)/g, function (match, chr) {
          return chr.toUpperCase();
        });
    const imageRef = keysetsRef.child(fileName + ".png");
    const uploadTask = imageRef.put(this.state.image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({ imageUploadProgress: progress });
      },
      (error) => {
        // Handle unsuccessful uploads
        this.props.snackbarQueue.notify({ title: "Failed to upload image: " + error });
        this.setState({ loading: false });
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        this.props.snackbarQueue.notify({ title: "Successfully uploaded image." });
        imageRef
          .getDownloadURL()
          .then((downloadURL) => {
            this.setState({
              imageURL: downloadURL,
              loading: false,
            });
            this.editEntry();
          })
          .catch((error) => {
            this.props.snackbarQueue.notify({ title: "Failed to get URL: " + error });
            this.setState({
              loading: false,
            });
          });
      }
    );
  };

  editEntry = () => {
    const db = firebase.firestore();
    db.collection("keysets")
      .doc(this.state.id)
      .update({
        profile: this.state.profile,
        colorway: this.state.colorway,
        designer: this.state.designer,
        icDate: this.state.icDate,
        details: this.state.details,
        sales: this.state.sales,
        image: this.state.newImage ? this.state.imageURL : this.state.image,
        gbMonth: this.state.gbMonth,
        gbLaunch: this.state.gbLaunch,
        gbEnd: this.state.gbEnd,
        shipped: this.state.shipped,
        vendors: this.state.vendors,
        latestEditor: this.props.user.id,
      })
      .then((docRef) => {
        this.props.snackbarQueue.notify({ title: "Entry edited successfully." });
        this.closeDialog();
        this.props.getData();
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error editing document: " + error });
      });
  };

  setSalesImageLoaded = (val) => {
    this.setState({ salesImageLoaded: !!val });
  };

  render() {
    const formFilled =
      this.state.profile !== "" &&
      this.state.colorway !== "" &&
      this.state.designer !== [] &&
      this.state.icDate !== "" &&
      this.state.details !== "" &&
      this.state.image;
    const dateCard = this.state.gbMonth ? (
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
            value={this.state.gbLaunch}
            name="gbLaunch"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM" }}
            onChange={this.handleChange}
          />
        </div>
        <CardActions>
          <CardActionButtons>
            <CardActionButton
              label="Date"
              onClick={(e) => {
                e.preventDefault();
                this.toggleDate();
              }}
            />
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
            value={this.state.gbLaunch}
            name="gbLaunch"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD or Q1-4 YYYY" }}
            onChange={this.handleChange}
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
            value={this.state.gbEnd}
            name="gbEnd"
            helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
            onChange={this.handleChange}
          />
        </div>
        <CardActions>
          <CardActionButtons>
            <CardActionButton
              label="Month"
              onClick={(e) => {
                e.preventDefault();
                this.toggleDate();
              }}
            />
          </CardActionButtons>
        </CardActions>
      </Card>
    );
    return (
      <div className="full-screen-dialog-container">
        <div
          className={
            "full-screen-dialog edit-dialog " +
            (this.state.open ? "full-screen-dialog--open " : "") +
            (this.state.opening ? "full-screen-dialog--opening " : "") +
            (this.state.closing ? "full-screen-dialog--closing " : "") +
            (this.state.animate ? "full-screen-dialog--animate" : "")
          }
        >
          <TopAppBar>
            <TopAppBarRow>
              <TopAppBarSection alignStart>
                <TopAppBarNavigationIcon icon="close" onClick={this.closeDialog} />
                <TopAppBarTitle>Edit Entry</TopAppBarTitle>
              </TopAppBarSection>
              <TopAppBarSection alignEnd>
                <Button
                  label="Save"
                  onClick={(e) => {
                    e.preventDefault();
                    if (formFilled) {
                      if (this.state.newImage) {
                        this.uploadImage();
                      } else {
                        this.editEntry();
                      }
                    }
                  }}
                  disabled={!formFilled}
                />
              </TopAppBarSection>
            </TopAppBarRow>

            <LinearProgress closed={!this.state.loading} progress={this.state.imageUploadProgress} />
          </TopAppBar>
          <div className="full-screen-dialog-content">
            <div className="banner">
              <div className="banner-text">Make sure to read the entry guide.</div>
              <div className="banner-button">
                <a href="/guide/entries" target="_blank" rel="noopener noreferrer">
                  <Button label="guide" />
                </a>
              </div>
            </div>
            <div className="form-container">
              <form className="form">
                <div className="form-double">
                  <div className="select-container">
                    <MenuSurfaceAnchor>
                      <TextField
                        autoComplete="off"
                        outlined
                        required
                        label="Profile"
                        value={this.state.profile}
                        name="profile"
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                      />
                      <Autocomplete
                        open={this.state.focused === "profile"}
                        array={this.props.profiles}
                        query={this.state.profile}
                        prop="profile"
                        select={this.selectValue}
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
                      value={this.state.colorway}
                      name="colorway"
                      helpText={{ persistent: false, validationMsg: true, children: "Enter a name" }}
                      onChange={this.handleChange}
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
                    value={this.state.designer.join(", ")}
                    name="designer"
                    helpText={{
                      persistent: false,
                      validationMsg: true,
                      children:
                        this.state.designer[0] && this.state.designer[0].includes(" ")
                          ? "Separate multiple designers with a comma and a space."
                          : "",
                    }}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    disabled={this.props.user.isEditor === false && this.props.user.isDesigner}
                  />
                  <Autocomplete
                    open={this.state.focused === "designer"}
                    array={this.props.allDesigners}
                    query={this.state.designer.join(", ")}
                    prop="designer"
                    select={this.selectValue}
                    minChars={2}
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
                  value={this.state.icDate}
                  name="icDate"
                  helpText={{ persistent: true, validationMsg: true, children: "Format: YYYY-MM-DD" }}
                  onChange={this.handleChange}
                />
                <TextField
                  autoComplete="off"
                  icon="link"
                  outlined
                  label="Details"
                  required
                  pattern="https?:\/\/.+"
                  value={this.state.details}
                  name="details"
                  helpText={{
                    persistent: false,
                    validationMsg: true,
                    children: this.state.details.length > 0 ? "Must be valid link" : "Enter a link",
                  }}
                  onChange={this.handleChange}
                />
                <ImageUpload
                  image={this.state.image}
                  setImage={this.setImage}
                  snackbarQueue={this.props.snackbarQueue}
                />
                {dateCard}
                <Checkbox label="Shipped" name="shipped" checked={this.state.shipped} onChange={this.handleChange} />
                <Typography use="caption" tag="h3" className="subheader">
                  Vendors
                </Typography>
                <DragDropContext onDragEnd={this.handleDragVendor}>
                  <Droppable droppableId="vendors-edit">
                    {(provided) => (
                      <div className="vendors-container" ref={provided.innerRef} {...provided.droppableProps}>
                        {this.state.vendors.map((vendor, index) => {
                          return (
                            <Draggable key={vendor.id} draggableId={vendor.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  outlined
                                  className={"vendor-container" + (snapshot.isDragging ? " dragged" : "")}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={getVendorStyle(provided, snapshot)}
                                >
                                  <div className="title-container">
                                    <Typography use="caption" className="vendor-title">
                                      {"Vendor " + (index + 1)}
                                    </Typography>
                                    <Tooltip enterDelay={500} content="Delete" align="bottom">
                                      <IconButton
                                        icon={{
                                          strategy: "component",
                                          icon: (
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
                                          ),
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          this.removeVendor(index);
                                        }}
                                      />
                                    </Tooltip>
                                    <Tooltip enterDelay={500} content="Drag" align="bottom">
                                      <Icon icon="drag_handle" className="drag-handle" {...provided.dragHandleProps} />
                                    </Tooltip>
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
                                        onChange={this.handleChangeVendor}
                                        onFocus={this.handleFocus}
                                        onBlur={this.handleBlur}
                                      />
                                      <Autocomplete
                                        open={this.state.focused === "name" + index}
                                        array={this.props.allVendors}
                                        query={this.state.vendors[index].name}
                                        prop={"name" + index}
                                        select={this.selectVendor}
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
                                        onChange={this.handleChangeVendor}
                                        onFocus={this.handleFocus}
                                        onBlur={this.handleBlur}
                                      />
                                      <Autocomplete
                                        open={this.state.focused === "region" + index}
                                        array={this.props.allRegions}
                                        query={this.state.vendors[index].region}
                                        prop={"region" + index}
                                        select={this.selectVendor}
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
                                      onChange={this.handleChangeVendor}
                                      onFocus={this.handleFocus}
                                      onBlur={this.handleBlur}
                                      helpText={{
                                        persistent: false,
                                        validationMsg: true,
                                        children: "Must be valid link",
                                      }}
                                    />
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
                    outlined
                    label="Add vendor"
                    onClick={(e) => {
                      e.preventDefault();
                      this.addVendor();
                    }}
                  />
                </div>
                <Card outlined className="sales-container">
                  <Typography use="caption" tag="h3" className="sales-title">
                    Sales
                  </Typography>
                  <div className={"sales-image" + (this.state.salesImageLoaded ? " loaded" : "")}>
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
                      src={this.state.sales}
                      alt=""
                      onLoad={() => {
                        this.setSalesImageLoaded(true);
                      }}
                      onError={() => {
                        this.setSalesImageLoaded(false);
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
                      value={this.state.sales}
                      name="sales"
                      helpText={{ persistent: true, validationMsg: true, children: "Must be direct link to image" }}
                      onChange={this.handleChange}
                      onFocus={this.handleFocus}
                      onBlur={this.handleBlur}
                    />
                  </div>
                </Card>
              </form>
            </div>
          </div>
        </div>
        <div className="full-screen-dialog-scrim"></div>
      </div>
    );
  }
}

export default DialogCreate;

DialogCreate.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allRegions: PropTypes.arrayOf(PropTypes.string),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  close: PropTypes.func,
  getData: PropTypes.func,
  open: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  snackbarQueue: PropTypes.shape(queueTypes),
  user: PropTypes.shape(userTypes),
};

DialogEdit.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allRegions: PropTypes.arrayOf(PropTypes.string),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  close: PropTypes.func,
  getData: PropTypes.func,
  open: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  set: PropTypes.shape(setTypes()),
  snackbarQueue: PropTypes.shape(queueTypes),
  user: PropTypes.shape(userTypes),
};
