import { useEffect, useState, ChangeEvent } from "react";
import classNames from "classnames";
import BEMHelper from "@s/common/bem-helper";
import { useAppSelector } from "~/app/hooks";
import { selectFilteredSets } from "@s/main";
import { alphabeticalSort, iconObject } from "@s/util/functions";
import { IconButton } from "@rmwc/icon-button";
import { TextField } from "@rmwc/textfield";
import { TopAppBar, TopAppBarRow, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { Autocomplete, AutocompleteMobile } from "@c/util/autocomplete";
import "./search-bar.scss";

const bemClasses = new BEMHelper("search-bar");

type SearchBarPersistentProps = {
  search: string;
  setSearch: (search: string) => void;
};

export const SearchBarPersistent = (props: SearchBarPersistentProps) => {
  const filteredSets = useAppSelector(selectFilteredSets);

  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  useEffect(() => {
    setExpanded(props.search.length !== 0);
    createSearchTerms();
  }, [props.search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExpanded(e.target.value.length !== 0);
    props.setSearch(e.target.value);
  };
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };
  const createSearchTerms = () => {
    const searchTerms: string[] = [];
    const addSearchTerm = (term: string) => {
      if (!searchTerms.includes(term)) {
        searchTerms.push(term);
      }
    };
    if (filteredSets && filteredSets.length > 0) {
      filteredSets.forEach((set) => {
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
    alphabeticalSort(searchTerms);
    setSearchTerms(searchTerms);
  };
  const autoCompleteSearch = (_prop: string, value: string) => {
    props.setSearch(value);
    setFocused(false);
  };
  const clearInput = () => {
    setExpanded(false);
    props.setSearch("");
  };
  return (
    <MenuSurfaceAnchor className={bemClasses("anchor")}>
      <div
        className={bemClasses({
          modifiers: {
            persistent: true,
            expanded: expanded,
          },
        })}
      >
        <TextField
          outlined
          className={bemClasses("field")}
          value={props.search}
          autoComplete="off"
          placeholder="Search"
          icon="search"
          trailingIcon={
            expanded ? (
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
                  </div>
                )}
                onClick={clearInput}
              />
            ) : null
          }
          name="search"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      <Autocomplete
        open={focused}
        prop="search"
        array={searchTerms}
        query={props.search}
        select={autoCompleteSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        minChars={2}
      />
    </MenuSurfaceAnchor>
  );
};

type SearchBarModalProps = {
  close: () => void;
  open: boolean;
  search: string;
  setSearch: (search: string) => void;
};

export const SearchBarModal = (props: SearchBarModalProps) => {
  const filteredSets = useAppSelector(selectFilteredSets);

  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  useEffect(() => {
    setOpen(props.open);
  }, []);
  useEffect(() => {
    if (props.open) {
      openBar();
    } else {
      closeBar();
    }
  }, [props.open]);
  useEffect(() => {
    if (!open && props.search.length > 0) {
      openBar();
    }
    createSearchTerms();
  }, [props.search]);

  const openBar = () => {
    setOpen(true);
    setAnimate(true);
    setTimeout(() => {
      setOpening(true);
      const bar = document.getElementById("search");
      if (bar) {
        bar.focus();
      }
    }, 1);
    setTimeout(() => {
      setAnimate(false);
      setOpening(false);
    }, 250);
  };
  const closeBar = () => {
    setClosing(true);
    setTimeout(() => {
      props.close();
      setOpen(false);
      setClosing(false);
      props.setSearch("");
    }, 200);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.setSearch(e.target.value);
  };
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };

  const createSearchTerms = () => {
    const searchTerms: string[] = [];
    const addSearchTerm = (term: string) => {
      if (!searchTerms.includes(term)) {
        searchTerms.push(term);
      }
    };
    if (filteredSets && filteredSets.length > 0) {
      filteredSets.forEach((set) => {
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
    alphabeticalSort(searchTerms);
    setSearchTerms(searchTerms);
  };
  const autoCompleteSearch = (_prop: string, value: string) => {
    props.setSearch(value);
    setFocused(false);
  };
  const clearInput = () => {
    props.setSearch("");
  };
  return (
    <div
      className={bemClasses({
        modifiers: {
          modal: true,
          open: open,
          opening: opening,
          closing: closing,
          animate: animate,
        },
      })}
    >
      <div className={bemClasses("field-container")}>
        <TextField
          id="search"
          outlined
          className={bemClasses("field")}
          value={props.search}
          autoComplete="off"
          placeholder="Search"
          icon={{
            icon: "arrow_back",
            tabIndex: 0,
            onClick: () => closeBar(),
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
                </div>
              )}
              onClick={clearInput}
            />
          }
          name="search"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      <AutocompleteMobile
        open={focused && open}
        prop="search"
        array={searchTerms}
        query={props.search}
        select={autoCompleteSearch}
        minChars={1}
      />
    </div>
  );
};

type SearchAppBarProps = {
  close: () => void;
  open: boolean;
  openBar: () => void;
  search: string;
  setSearch: (search: string) => void;
};

export const SearchAppBar = (props: SearchAppBarProps) => {
  const filteredSets = useAppSelector(selectFilteredSets);

  const [focused, setFocused] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  useEffect(() => {
    if (props.search.length > 0) {
      props.openBar();
      setTimeout(() => scrollTop(), 300);
    }
    createSearchTerms();
  }, [props.search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.setSearch(e.target.value);
  };
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };
  const createSearchTerms = () => {
    const searchTerms: string[] = [];
    const addSearchTerm = (term: string) => {
      if (!searchTerms.includes(term)) {
        searchTerms.push(term);
      }
    };
    if (filteredSets && filteredSets.length > 0) {
      filteredSets.forEach((set) => {
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
    alphabeticalSort(searchTerms);
    setSearchTerms(searchTerms);
  };
  const autoCompleteSearch = (_prop: string, value: string) => {
    props.setSearch(value);
    setFocused(false);
  };
  const clearInput = () => {
    props.setSearch("");
  };
  const scrollTop = () => {
    window.scrollTo(0, 0);
  };
  return (
    <>
      <TopAppBar fixed className={classNames("search-app-bar", { "search-app-bar--open": props.open })}>
        <TopAppBarRow>
          <div className={bemClasses({ modifiers: "modal open" })}>
            <div className={bemClasses("field-container")}>
              <TextField
                id="search"
                outlined
                className={bemClasses("field")}
                value={props.search}
                autoComplete="off"
                placeholder="Search"
                icon={{
                  icon: "arrow_back",
                  tabIndex: 0,
                  onClick: () => {
                    props.close();
                    clearInput();
                  },
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
                      </div>
                    )}
                    onClick={clearInput}
                  />
                }
                name="search"
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <AutocompleteMobile
              open={focused && props.open}
              prop="search"
              array={searchTerms}
              query={props.search}
              select={autoCompleteSearch}
              minChars={1}
            />
          </div>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export default SearchBarPersistent;
