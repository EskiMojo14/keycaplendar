import firebase from "../firebase/firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { hasKey } from "../common/functions";
import { UserType } from "./types";
import {
  setAllUsers,
  setIndices,
  setLoading,
  setNextPageToken,
  setPaginatedUsers,
  setSortedUsers,
  setPage as setPageFn,
  setReverseSort as setReverseUserSort,
  setRowsPerPage as setRowsPerPageFn,
  setSort as setUserSort,
  setView,
} from "./usersSlice";

const { dispatch } = store;

const length = 1000;

export const getUsers = (append = false) => {
  const {
    users: { nextPageToken, allUsers },
  } = store.getState();
  dispatch(setLoading(true));
  const listUsersFn = firebase.functions().httpsCallable("listUsers");
  listUsersFn({ length: length, nextPageToken: nextPageToken })
    .then((result) => {
      if (result) {
        if (result.data.error) {
          queue.notify({ title: result.data.error });
          dispatch(setLoading(false));
        } else {
          dispatch(setLoading(false));
          const newUsers = append ? [...allUsers, ...result.data.users] : [...result.data.users];
          sortUsers(newUsers);
          dispatch(setAllUsers(newUsers));
          dispatch(setNextPageToken(result.data.nextPageToken ? result.data.nextPageToken : ""));
        }
      }
    })
    .catch((error) => {
      queue.notify({ title: "Error listing users: " + error });
      dispatch(setLoading(false));
    });
};

export const sortUsers = (usersParam?: UserType[], sortParam?: keyof UserType, reverseSortParam?: boolean) => {
  const {
    users: { allUsers, sort: userSort, reverseSort: reverseUserSort },
  } = store.getState();
  const useUsers = usersParam || allUsers;
  const sort = sortParam || userSort;
  const reverseSort = reverseSortParam || reverseUserSort;
  const sortedUsers = [...useUsers];
  sortedUsers.sort((a, b) => {
    if (hasKey(a, sort) && hasKey(b, sort)) {
      const aVal = a[sort];
      const bVal = b[sort];
      if (typeof aVal === "string" && typeof bVal === "string") {
        if ((aVal === "" || bVal === "") && !(aVal === "" && bVal === "")) {
          return aVal === "" ? 1 : -1;
        }
        const x = aVal.toLowerCase();
        const y = bVal.toLowerCase();
        if (x < y) {
          return reverseSort ? 1 : -1;
        }
        if (x > y) {
          return reverseSort ? -1 : 1;
        }
        if (a.nickname.toLowerCase() > b.nickname.toLowerCase()) {
          return 1;
        }
        if (a.nickname.toLowerCase() < b.nickname.toLowerCase()) {
          return -1;
        }
        if (a.email.toLowerCase() > b.email.toLowerCase()) {
          return 1;
        }
        if (a.email.toLowerCase() < b.email.toLowerCase()) {
          return -1;
        }
        return 0;
      } else {
        if (aVal === null || bVal === null) {
          return aVal === null ? 1 : -1;
        }
        if (aVal < bVal) {
          return reverseSort ? -1 : 1;
        }
        if (aVal > bVal) {
          return reverseSort ? 1 : -1;
        }
        if (a.nickname.toLowerCase() > b.nickname.toLowerCase()) {
          return 1;
        }
        if (a.nickname.toLowerCase() < b.nickname.toLowerCase()) {
          return -1;
        }
        if (a.email.toLowerCase() > b.email.toLowerCase()) {
          return 1;
        }
        if (a.email.toLowerCase() < b.email.toLowerCase()) {
          return -1;
        }
        return 0;
      }
    } else {
      return 0;
    }
  });
  dispatch(setSortedUsers(sortedUsers));
  paginateUsers(sortedUsers);
  dispatch(setLoading(false));
};

export const paginateUsers = (usersParam?: UserType[], pageParam?: number, rowsPerPageParam?: number) => {
  const {
    users: { sortedUsers, page, rowsPerPage },
  } = store.getState();
  const users = usersParam || sortedUsers;
  const pageNum = pageParam || page;
  const rowsPerPageNum = rowsPerPageParam || rowsPerPage;
  const paginatedUsers = users.slice((pageNum - 1) * rowsPerPageNum, pageNum * rowsPerPageNum);
  const firstIndex = users.indexOf(paginatedUsers[0]);
  const lastIndex = users.indexOf(paginatedUsers[paginatedUsers.length - 1]);
  dispatch(setPaginatedUsers(paginatedUsers));
  dispatch(setIndices({ first: firstIndex, last: lastIndex }));
};

export const setRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
  const {
    users: { sortedUsers },
  } = store.getState();
  const val = parseInt(e.target.value);
  dispatch(setRowsPerPageFn(val));
  dispatch(setPageFn(1));
  paginateUsers(sortedUsers, 1, val);
};

export const setPage = (num: number) => {
  const {
    users: { sortedUsers },
  } = store.getState();
  dispatch(setPageFn(num));
  paginateUsers(sortedUsers, num);
};

export const setViewIndex = (index: number) => {
  const views = ["card", "table"] as const;
  dispatch(setView(views[index]));
};

export const setSort = (sort: keyof UserType) => {
  const {
    users: { allUsers, sort: userSort, reverseSort: reverseUserSort },
  } = store.getState();
  let reverseSort;
  if (sort === userSort) {
    reverseSort = !reverseUserSort;
  } else {
    reverseSort = false;
  }
  dispatch(setPageFn(1));
  dispatch(setUserSort(sort));
  dispatch(setReverseUserSort(reverseSort));
  sortUsers(allUsers, sort, reverseSort);
};

export const setSortIndex = (index: number) => {
  const {
    users: { allUsers },
  } = store.getState();
  const props = [
    "displayName",
    "email",
    "dateCreated",
    "lastSignIn",
    "lastActive",
    "nickname",
    "designer",
    "editor",
    "admin",
  ] as const;
  dispatch(setPageFn(1));
  dispatch(setUserSort(props[index]));
  dispatch(setReverseUserSort(false));
  sortUsers(allUsers, props[index], false);
};
