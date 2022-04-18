import { useCallback, useEffect, useState } from "react";
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
import debounce from "lodash.debounce";
import { Autocomplete, AutocompleteMobile } from "@c/util/autocomplete";
import { useAppDispatch, useAppSelector } from "@h";
import BEMHelper from "@s/common/bem-helper";
import { selectSearch, selectSearchTerms } from "@s/main";
import { setSearch as setSearchInState } from "@s/main/thunks";

import "./search-bar.scss";

const bemClasses = new BEMHelper("search-bar");

export const SearchBarPersistent = () => {
  const dispatch = useAppDispatch();
  const debouncedSetSearchInState = useCallback(
    debounce((query) => dispatch(setSearchInState(query)), 350, {
      trailing: true,
    }),
    []
  );

  const searchFromState = useAppSelector(selectSearch);
  const searchTerms = useAppSelector(selectSearchTerms);

  const [search, setSearch] = useState(searchFromState);
  useEffect(() => {
    if (search !== searchFromState) {
      setSearch(searchFromState);
    }
  }, [searchFromState]);

  const [focused, setFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    document.documentElement.scrollTop = 0;
    setSearch(e.target.value);
    debouncedSetSearchInState(e.target.value);
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
    document.documentElement.scrollTop = 0;
    setSearch("");
    debouncedSetSearchInState("");
  };
  return (
    <MenuSurfaceAnchor className={bemClasses("anchor")}>
      <div
        className={bemClasses({
          modifiers: {
            expanded: search.length !== 0,
            persistent: true,
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
            search.length !== 0 && (
              <IconButton icon="clear" onClick={clearInput} />
            )
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
};

export const SearchBarModal = ({
  close,
  open: propsOpen,
}: SearchBarModalProps) => {
  const dispatch = useAppDispatch();
  const debouncedSetSearchInState = useCallback(
    debounce((query) => dispatch(setSearchInState(query)), 350, {
      trailing: true,
    }),
    []
  );

  const searchFromState = useAppSelector(selectSearch);
  const searchTerms = useAppSelector(selectSearchTerms);

  const [search, setSearch] = useState(searchFromState);
  useEffect(() => {
    if (search !== searchFromState) {
      setSearch(searchFromState);
    }
  }, [searchFromState]);

  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

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
      debouncedSetSearchInState("");
    }, 200);
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
  }, [search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSetSearchInState(e.target.value);
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
    debouncedSetSearchInState("");
  };
  return (
    <div
      className={bemClasses({
        modifiers: {
          animate,
          closing,
          modal: true,
          open,
          opening,
        },
      })}
    >
      <div className={bemClasses("field-container")}>
        <TextField
          autoComplete="off"
          className={bemClasses("field")}
          icon={{
            icon: "arrow_back",
            onClick: () => closeBar(),
            tabIndex: 0,
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
};

export const SearchAppBar = ({ close, open, openBar }: SearchAppBarProps) => {
  const dispatch = useAppDispatch();
  const debouncedSetSearchInState = useCallback(
    debounce((query) => dispatch(setSearchInState(query)), 350, {
      trailing: true,
    }),
    []
  );

  const searchFromState = useAppSelector(selectSearch);
  const searchTerms = useAppSelector(selectSearchTerms);

  const [search, setSearch] = useState(searchFromState);
  useEffect(() => {
    if (search !== searchFromState) {
      setSearch(searchFromState);
    }
  }, [searchFromState]);

  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (search.length > 0) {
      openBar();
      setTimeout(() => scrollTop(), 300);
    }
  }, [search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSetSearchInState(e.target.value);
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
    debouncedSetSearchInState("");
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
                  onClick: () => {
                    close();
                    clearInput();
                  },
                  tabIndex: 0,
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
