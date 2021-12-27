import { useEffect, useState, ChangeEvent } from "react";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import { TopAppBar, TopAppBarRow, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { Autocomplete, AutocompleteMobile } from "@c/util/autocomplete";
import BEMHelper from "@s/common/bem-helper";
import { selectFilteredSets } from "@s/main";
import { alphabeticalSort } from "@s/util/functions";
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
            expanded,
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
          trailingIcon={expanded ? <IconButton icon="clear" onClick={clearInput} /> : null}
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
          open,
          opening,
          closing,
          animate,
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
          trailingIcon={<IconButton icon="clear" onClick={clearInput} />}
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
                trailingIcon={<IconButton icon="clear" onClick={clearInput} />}
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
