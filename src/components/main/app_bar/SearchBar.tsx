import React from "react";
import classNames from "classnames";
import BEMHelper from "../../../util/bemHelper";
import { iconObject } from "../../../util/functions";
import { SetType } from "../../../util/types";
import { IconButton } from "@rmwc/icon-button";
import { TextField } from "@rmwc/textfield";
import { TopAppBar, TopAppBarRow, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { Autocomplete, AutocompleteMobile } from "../../util/Autocomplete";
import "./SearchBar.scss";

const bemClasses = new BEMHelper("search-bar");

type SearchBarPersistentProps = {
  search: string;
  setSearch: (search: string) => void;
  sets: SetType[];
};

type SearchBarPersistentState = {
  expanded: boolean;
  focused: boolean;
  searchTerms: string[];
};

export class SearchBarPersistent extends React.Component<SearchBarPersistentProps, SearchBarPersistentState> {
  state: SearchBarPersistentState = { expanded: false, focused: false, searchTerms: [] };
  componentDidUpdate(prevProps: SearchBarPersistentProps) {
    if (this.props.search !== prevProps.search) {
      this.setState({
        expanded: this.props.search.length !== 0,
      });
      this.createSearchTerms();
    }
  }
  handleChange = (e: any) => {
    this.setState({
      expanded: e.target.value.length !== 0,
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
    const searchTerms: string[] = [];
    const addSearchTerm = (term: string) => {
      if (!searchTerms.includes(term)) {
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
        if (set.vendors) {
          set.vendors.forEach((vendor) => {
            addSearchTerm(vendor.name);
          });
        }
      });
    }
    searchTerms.sort(function (a, b) {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
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
  autoCompleteSearch = (_prop: string, value: string) => {
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
      <MenuSurfaceAnchor className={bemClasses("anchor")}>
        <div
          className={bemClasses({
            modifiers: {
              persistent: true,
              expanded: this.state.expanded,
            },
          })}
        >
          <TextField
            outlined
            className={bemClasses("field")}
            value={this.props.search}
            autoComplete="off"
            placeholder="Search"
            icon="search"
            trailingIcon={
              this.state.expanded ? (
                <IconButton
                  icon={iconObject(
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                        <path
                          d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm5 11.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                          opacity=".3"
                        />
                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                      </svg>
                    </div>,
                  )}
                  onClick={this.clearInput}
                />
              ) : null
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

type SearchBarModalProps = {
  close: () => void;
  open: boolean;
  search: string;
  setSearch: (search: string) => void;
  sets: SetType[];
};

type SearchBarModalState = {
  opening: boolean;
  closing: boolean;
  animate: boolean;
  open: boolean;
  focused: boolean;
  searchTerms: string[];
};

export class SearchBarModal extends React.Component<SearchBarModalProps, SearchBarModalState> {
  state: SearchBarModalState = {
    opening: false,
    closing: false,
    animate: false,
    open: false,
    focused: false,
    searchTerms: [],
  };
  componentDidMount() {
    this.setState({ open: this.props.open });
  }
  componentDidUpdate(prevProps: SearchBarModalProps) {
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
      const bar = document.getElementById("search");
      if (bar) {
        bar.focus();
      }
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
  handleChange = (e: any) => {
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
    const searchTerms: string[] = [];
    const addSearchTerm = (term: string) => {
      if (!searchTerms.includes(term)) {
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
        if (set.vendors) {
          set.vendors.forEach((vendor) => {
            addSearchTerm(vendor.name);
          });
        }
      });
    }
    searchTerms.sort(function (a, b) {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
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
  autoCompleteSearch = (_prop: string, value: string) => {
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
        className={bemClasses({
          modifiers: {
            modal: true,
            open: this.state.open,
            opening: this.state.opening,
            closing: this.state.closing,
            animate: this.state.animate,
          },
        })}
      >
        <div className={bemClasses("field-container")}>
          <TextField
            id="search"
            outlined
            className={bemClasses("field")}
            value={this.props.search}
            autoComplete="off"
            placeholder="Search"
            icon={{
              icon: "arrow_back",
              tabIndex: 0,
              onClick: () => this.closeBar(),
            }}
            trailingIcon={
              <IconButton
                icon={iconObject(
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                      <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                      <path
                        d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm5 11.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                        opacity=".3"
                      />
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                    </svg>
                  </div>,
                )}
                onClick={this.clearInput}
              />
            }
            name="search"
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
        </div>
        <AutocompleteMobile
          open={this.state.focused && this.state.open}
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

type SearchAppBarProps = {
  close: () => void;
  open: boolean;
  openBar: () => void;
  search: string;
  setSearch: (search: string) => void;
  sets: SetType[];
};

type SearchAppBarState = {
  focused: boolean;
  searchTerms: string[];
};

export class SearchAppBar extends React.Component<SearchAppBarProps, SearchAppBarState> {
  state: SearchAppBarState = {
    focused: false,
    searchTerms: [],
  };
  componentDidUpdate(prevProps: SearchAppBarProps) {
    if (this.props.search !== prevProps.search) {
      if (this.props.search.length > 0) {
        this.props.openBar();
        setTimeout(() => this.scrollTop(), 300);
      }
      this.createSearchTerms();
    }
  }
  handleChange = (e: any) => {
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
    const searchTerms: string[] = [];
    const addSearchTerm = (term: string) => {
      if (!searchTerms.includes(term)) {
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
        if (set.vendors) {
          set.vendors.forEach((vendor) => {
            addSearchTerm(vendor.name);
          });
        }
      });
    }
    searchTerms.sort(function (a, b) {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
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
  autoCompleteSearch = (_prop: string, value: string) => {
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
      <>
        <TopAppBar fixed className={classNames("search-app-bar", { "search-app-bar--open": this.props.open })}>
          <TopAppBarRow>
            <div className={bemClasses({ modifiers: "modal expanded" })}>
              <div className={bemClasses("field-container")}>
                <TextField
                  id="search"
                  outlined
                  className={bemClasses("field")}
                  value={this.props.search}
                  autoComplete="off"
                  placeholder="Search"
                  icon={{
                    icon: "arrow_back",
                    tabIndex: 0,
                    onClick: () => this.props.close(),
                  }}
                  trailingIcon={
                    <IconButton
                      icon={iconObject(
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                            <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                            <path
                              d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm5 11.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                              opacity=".3"
                            />
                            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                          </svg>
                        </div>,
                      )}
                      onClick={this.clearInput}
                    />
                  }
                  name="search"
                  onChange={this.handleChange}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                />
              </div>
              <AutocompleteMobile
                open={this.state.focused && this.props.open}
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
      </>
    );
  }
}

export default SearchBarPersistent;
