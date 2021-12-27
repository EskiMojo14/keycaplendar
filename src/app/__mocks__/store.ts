const storeFile = jest.requireActual("../store.ts");

export const { createStore } = storeFile;

export const store = { ...storeFile.store, dispatch: jest.fn() };

export default store;
