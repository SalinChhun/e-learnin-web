import { PopupTypeEnum } from "../enums/enums";

export type PopupProps = {
    [key: string]: any;
};

export interface PopupState {
    // Instead of a single currentPopup, use an array to track the stack of popups
    popupStack: Array<{
      type: PopupTypeEnum;
      props: any;
    }>;
    // Methods to manipulate the popup stack
    openPopup: (type: PopupTypeEnum, props?: any) => void;
    openNestedPopup: (type: PopupTypeEnum, props?: any) => void;
    closePopup: () => void;
    closeAllPopups: () => void;
  }
