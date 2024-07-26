import {create} from "zustand";


export enum ModalType {
  LOADING,
  SUCCESS,
  ERROR,
}



interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  open: (type : ModalType) => void;
  close: () => void;
}

export const useModal = create<ModalStore>(
  (set) => ({
    type: null,
    isOpen: false,
    data: {},
    open(type: ModalType) {
      set({
        isOpen: true, type
      });
    },
    close() {
      set({
        isOpen: false, type: null
      });
    },
  })
);