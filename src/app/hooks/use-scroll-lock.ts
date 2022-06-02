import { useEffect } from "react";
import { nanoid } from "nanoid";
import { closeModal, openModal } from "@s/util/functions";

export const useScrollLock = (active: boolean, namespace = nanoid(10)) => {
  useEffect(() => {
    if (active) {
      openModal(namespace);
    } else {
      closeModal(namespace);
    }
  }, [active]);
  return namespace;
};

export default useScrollLock;
