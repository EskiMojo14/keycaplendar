import React from "react";
import { TextField } from "@rmwc/textfield";
import { TopAppBar, TopAppBarRow, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { Ripple } from "@rmwc/ripple";
import { Autocomplete, AutocompleteMobile } from "../Autocomplete";
import "./SearchBar.scss";

const bodyScroll = require("body-scroll-toggle");

export class SearchBarPersistent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false, focused: false, searchTerms: [] };
  }
  componentDidUpdate(prevProps) {
    if (this.props.search !== prevProps.search) {
      this.setState({
        expanded: this.props.search.length !== 0 ? true : false,
      });
      this.createSearchTerms();
    }
  }
  handleChange = (e) => {
    this.setState({
      expanded: e.target.value.length !== 0 ? true : false,
    });
    this.props.setSearch(e.target.value);
  };
  handleFocus = () => {
    this.setState({
      focused: true,
    });
  };
  handleBlur = () => {
    this.setState({
      focused: false,
    });
  };
  createSearchTerms = () => {
    let searchTerms = [];
    const addSearchTerm = (term) => {
      if (searchTerms.indexOf(term) === -1) {
        searchTerms.push(term);
      }
    };
    if (this.props.sets && this.props.sets.length > 0) {
      this.props.sets.forEach((set) => {
        addSearchTerm(set.profile);
        addSearchTerm(set.colorway);
        set.designer.forEach((designer) => {
          addSearchTerm(designer);
        });
        set.vendors.forEach((vendor) => {
          addSearchTerm(vendor.name);
        });
      });
    }
    searchTerms.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
    this.setState({ searchTerms: searchTerms });
  };
  autoCompleteSearch = (prop, value) => {
    this.props.setSearch(value);
    this.setState({
      focused: false,
    });
  };
  clearInput = () => {
    this.setState({
      expanded: false,
    });
    this.props.setSearch("");
  };
  render() {
    return (
      <MenuSurfaceAnchor style={{ marginRight: "8px" }}>
        <div className={"search-bar search-bar--persistent" + (this.state.expanded ? " search-bar--expanded" : "")}>
          <TextField
            outlined
            className="search-bar-field"
            value={this.props.search}
            autoComplete="off"
            placeholder="Search"
            icon="search"
            trailingIcon={
              this.state.expanded
                ? {
                    icon: (
                      <Ripple unbounded>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                          <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                          <path
                            d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm5 11.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                            opacity=".3"
                          />
                          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                        </svg>
                      </Ripple>
                    ),
                    tabIndex: 2,
                    onClick: () => this.clearInput(),
                  }
                : ""
            }
            name="search"
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
        </div>
        <Autocomplete
          open={this.state.focused}
          prop="search"
          array={this.state.searchTerms}
          query={this.props.search}
          select={this.autoCompleteSearch}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          minChars={2}
        />
      </MenuSurfaceAnchor>
    );
  }
}

export class SearchBarModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opening: false,
      closing: false,
      animate: false,
      open: false,
      focused: false,
      searchTerms: [],
    };
  }
  componentDidMount() {
    this.setState({ open: this.props.open });
  }
  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      if (this.props.open) {
        this.openBar();
      } else {
        this.closeBar();
      }
    }
    if (this.props.search !== prevProps.search) {
      if (!this.state.open && this.props.search.length > 0) {
        this.openBar();
      }
      this.createSearchTerms();
    }
  }
  openBar() {
    this.setState({ open: true, animate: true });
    setTimeout(() => {
      this.setState({ opening: true });
      document.getElementById("search").focus();
    }, 1);
    setTimeout(() => {
      this.setState({ animate: false, opening: false });
    }, 250);
  }
  closeBar() {
    this.setState({
      closing: true,
    });
    setTimeout(() => {
      this.props.close();
      this.setState({ open: false, closing: false });
      this.props.setSearch("");
    }, 200);
  }
  handleChange = (e) => {
    this.setState({
      expanded: e.target.value.length !== 0 ? true : false,
    });
    this.props.setSearch(e.target.value);
  };
  handleFocus = () => {
    this.setState({
      focused: true,
    });
    bodyScroll.disable();
  };
  handleBlur = () => {
    this.setState({
      focused: false,
    });
    bodyScroll.enable();
  };
  createSearchTerms = () => {
    let searchTerms = [];
    const addSearchTerm = (term) => {
      if (searchTerms.indexOf(term) === -1) {
        searchTerms.push(term);
      }
    };
    if (this.props.sets && this.props.sets.length > 0) {
      this.props.sets.forEach((set) => {
        addSearchTerm(set.profile);
        addSearchTerm(set.colorway);
        set.designer.forEach((designer) => {
          addSearchTerm(designer);
        });
        set.vendors.forEach((vendor) => {
          addSearchTerm(vendor.name);
        });
      });
    }
    searchTerms.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
    this.setState({ searchTerms: searchTerms });
  };
  autoCompleteSearch = (prop, value) => {
    this.props.setSearch(value);
    this.setState({
      focused: false,
    });
  };
  clearInput = () => {
    this.props.setSearch("");
  };
  render() {
    return (
      <div
        className={
          "search-bar search-bar--modal" +
          (this.state.open ? " search-bar--expanded" : "") +
          (this.state.opening ? " search-bar--opening" : "") +
          (this.state.closing ? " search-bar--closing" : "") +
          (this.state.animate ? " search-bar--animate" : "")
        }
      >
        <div className="search-bar-field-container">
          <TextField
            id="search"
            outlined
            className="search-bar-field"
            value={this.props.search}
            autoComplete="off"
            placeholder="Search"
            icon={{
              icon: "arrow_back",
              tabIndex: 0,
              onClick: () => this.closeBar(),
            }}
            trailingIcon={{
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                  <path
                    d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm5 11.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                    opacity=".3"
                  />
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                </svg>
              ),
              tabIndex: 0,
              onClick: () => this.clearInput(),
            }}
            name="search"
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
        </div>
        <AutocompleteMobile
          open={this.state.focused}
          prop="search"
          array={this.state.searchTerms}
          query={this.props.search}
          select={this.autoCompleteSearch}
          minChars={1}
        />
      </div>
    );
  }
}

export class SearchAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      searchTerms: [],
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.search !== prevProps.search) {
      if (this.props.search.length > 0) {
        this.props.openBar();
        setTimeout(() => this.scrollTop(), 300);
      }
      this.createSearchTerms();
    }
  }
  handleChange = (e) => {
    this.setState({
      expanded: e.target.value.length !== 0 ? true : false,
    });
    this.props.setSearch(e.target.value);
  };
  handleFocus = () => {
    this.setState({
      focused: true,
    });
    bodyScroll.disable();
  };
  handleBlur = () => {
    this.setState({
      focused: false,
    });
    bodyScroll.enable();
  };
  createSearchTerms = () => {
    let searchTerms = [];
    const addSearchTerm = (term) => {
      if (searchTerms.indexOf(term) === -1) {
        searchTerms.push(term);
      }
    };
    if (this.props.sets && this.props.sets.length > 0) {
      this.props.sets.forEach((set) => {
        addSearchTerm(set.profile);
        addSearchTerm(set.colorway);
        set.designer.forEach((designer) => {
          addSearchTerm(designer);
        });
        set.vendors.forEach((vendor) => {
          addSearchTerm(vendor.name);
        });
      });
    }
    searchTerms.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
    this.setState({ searchTerms: searchTerms });
  };
  autoCompleteSearch = (prop, value) => {
    this.props.setSearch(value);
    this.setState({
      focused: false,
    });
  };
  clearInput = () => {
    this.props.setSearch("");
  };
  scrollTop() {
    window.scrollTo(0, 0);
  }
  render() {
    return (
      <div>
        <TopAppBar fixed className={"search-app-bar" + (this.props.open ? " search-app-bar--open" : "")}>
          <TopAppBarRow>
            <div className="search-bar search-bar--modal search-bar--expanded">
              <div className="search-bar-field-container">
                <TextField
                  id="search"
                  outlined
                  className="search-bar-field"
                  value={this.props.search}
                  autoComplete="off"
                  placeholder="Search"
                  icon={{
                    icon: "arrow_back",
                    tabIndex: 0,
                    onClick: () => this.props.close(),
                  }}
                  trailingIcon={{
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="black"
                        width="24px"
                        height="24px"
                      >
                        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                        <path
                          d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm5 11.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                          opacity=".3"
                        />
                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                      </svg>
                    ),
                    tabIndex: 0,
                    onClick: () => this.clearInput(),
                  }}
                  name="search"
                  onChange={this.handleChange}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                />
              </div>
              <AutocompleteMobile
                open={this.state.focused}
                prop="search"
                array={this.state.searchTerms}
                query={this.props.search}
                select={this.autoCompleteSearch}
                minChars={1}
              />
            </div>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust />
      </div>
    );
  }
}

export default SearchBarPersistent;
