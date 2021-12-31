import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { IconButton } from "@rmwc/icon-button";
import { MenuSurfaceAnchor } from "@rmwc/menu";
import { TextField } from "@rmwc/textfield";
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
} from "@rmwc/top-app-bar";
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

export const SearchBarPersistent = ({
  search,
  setSearch,
}: SearchBarPersistentProps) => {
  const filteredSets = useAppSelector(selectFilteredSets);

  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const createSearchTerms = () => {
    const searchTerms: Set<string> = new Set();
    if (filteredSets && filteredSets.length > 0) {
      filteredSets.forEach((set) => {
        searchTerms.add(set.profile);
        searchTerms.add(set.colorway);
        set.designer.forEach((designer) => {
          searchTerms.add(designer);
        });
        if (set.vendors) {
          set.vendors.forEach((vendor) => {
            searchTerms.add(vendor.name);
          });
        }
      });
    }
    setSearchTerms(alphabeticalSort([...searchTerms]));
  };

  useEffect(() => {
    setExpanded(search.length !== 0);
    createSearchTerms();
  }, [search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExpanded(e.target.value.length !== 0);
    setSearch(e.target.value);
  };
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };
  const autoCompleteSearch = (_prop: string, value: string) => {
    setSearch(value);
    setFocused(false);
  };
  const clearInput = () => {
    setExpanded(false);
    setSearch("");
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
          autoComplete="off"
          className={bemClasses("field")}
          icon="search"
          name="search"
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          outlined
          placeholder="Search"
          trailingIcon={
            expanded ? <IconButton icon="clear" onClick={clearInput} /> : null
          }
          value={search}
        />
      </div>
      <Autocomplete
        array={searchTerms}
        minChars={2}
        onBlur={handleBlur}
        onFocus={handleFocus}
        open={focused}
        prop="search"
        query={search}
        select={autoCompleteSearch}
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

export const SearchBarModal = ({
  close,
  open: propsOpen,
  search,
  setSearch,
}: SearchBarModalProps) => {
  const filteredSets = useAppSelector(selectFilteredSets);

  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

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
      close();
      setOpen(false);
      setClosing(false);
      setSearch("");
    }, 200);
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

  useEffect(() => {
    setOpen(propsOpen);
  }, []);
  useEffect(() => {
    if (propsOpen) {
      openBar();
    } else {
      closeBar();
    }
  }, [propsOpen]);
  useEffect(() => {
    if (!open && search.length > 0) {
      openBar();
    }
    createSearchTerms();
  }, [search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };

  const autoCompleteSearch = (_prop: string, value: string) => {
    setSearch(value);
    setFocused(false);
  };
  const clearInput = () => {
    setSearch("");
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
          autoComplete="off"
          className={bemClasses("field")}
          icon={{
            icon: "arrow_back",
            tabIndex: 0,
            onClick: () => closeBar(),
          }}
          id="search"
          name="search"
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          outlined
          placeholder="Search"
          trailingIcon={<IconButton icon="clear" onClick={clearInput} />}
          value={search}
        />
      </div>
      <AutocompleteMobile
        array={searchTerms}
        minChars={1}
        open={focused && open}
        prop="search"
        query={search}
        select={autoCompleteSearch}
      />
    </div>
  );
};

const scrollTop = () => {
  window.scrollTo(0, 0);
};

type SearchAppBarProps = {
  close: () => void;
  open: boolean;
  openBar: () => void;
  search: string;
  setSearch: (search: string) => void;
};

export const SearchAppBar = ({
  close,
  open,
  openBar,
  search,
  setSearch,
}: SearchAppBarProps) => {
  const filteredSets = useAppSelector(selectFilteredSets);

  const [focused, setFocused] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const createSearchTerms = () => {
    const searchTerms: Set<string> = new Set();
    if (filteredSets && filteredSets.length > 0) {
      filteredSets.forEach((set) => {
        searchTerms.add(set.profile);
        searchTerms.add(set.colorway);
        set.designer.forEach((designer) => {
          searchTerms.add(designer);
        });
        if (set.vendors) {
          set.vendors.forEach((vendor) => {
            searchTerms.add(vendor.name);
          });
        }
      });
    }
    setSearchTerms(alphabeticalSort([...searchTerms]));
  };

  useEffect(() => {
    if (search.length > 0) {
      openBar();
      setTimeout(() => scrollTop(), 300);
    }
    createSearchTerms();
  }, [search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };

  const autoCompleteSearch = (_prop: string, value: string) => {
    setSearch(value);
    setFocused(false);
  };
  const clearInput = () => {
    setSearch("");
  };
  return (
    <>
      <TopAppBar
        className={classNames("search-app-bar", {
          "search-app-bar--open": open,
        })}
        fixed
      >
        <TopAppBarRow>
          <div className={bemClasses({ modifiers: "modal open" })}>
            <div className={bemClasses("field-container")}>
              <TextField
                autoComplete="off"
                className={bemClasses("field")}
                icon={{
                  icon: "arrow_back",
                  tabIndex: 0,
                  onClick: () => {
                    close();
                    clearInput();
                  },
                }}
                id="search"
                name="search"
                onBlur={handleBlur}
                onChange={handleChange}
                onFocus={handleFocus}
                outlined
                placeholder="Search"
                trailingIcon={<IconButton icon="clear" onClick={clearInput} />}
                value={search}
              />
            </div>
            <AutocompleteMobile
              array={searchTerms}
              minChars={1}
              open={focused && open}
              prop="search"
              query={search}
              select={autoCompleteSearch}
            />
          </div>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export default SearchBarPersistent;
