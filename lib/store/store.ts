import { create } from "zustand";
import { PopupState } from "../types/store";


export const usePopupStore = create<PopupState>((set) => ({
    popupStack: [],
    
    // Open a new popup (replaces current one if any)
    openPopup: (type, props = {}) => 
      set({ popupStack: [{ type, props }] }),
    
    // Open a popup on top of the current one
    openNestedPopup: (type, props = {}) => 
      set((state) => ({ 
        popupStack: [...state.popupStack, { type, props }] 
      })),
    
    // Close the top-most popup
    closePopup: () => 
      set((state) => ({
        popupStack: state.popupStack.slice(0, -1)
      })),
    
    // Close all popups
    closeAllPopups: () => 
      set({ popupStack: [] })
  }));