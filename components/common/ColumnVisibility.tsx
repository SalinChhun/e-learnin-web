"use client";

import { CustomColumnDef } from "@/lib/types/table";
import { saveToLocalStorage } from "@/utils/localStorage";
import { useCallback, useEffect, useRef, useState } from "react";
import ModalPopup from "../shared/ModalPopUp";

// Define the ColumnVisibility type as a record of column keys to boolean visibility state
export type ColumnVisibility = Record<string, boolean>;

interface ColumnVisibilityProps {
  columns: CustomColumnDef<any>[];
  columnVisibility: ColumnVisibility;
  setColumnVisibility: (visibility: ColumnVisibility) => void;
  localStorageKey: string;
  className?: string;
}

const ColumnVisibilityComponent: React.FC<ColumnVisibilityProps> = ({
  columns,
  columnVisibility,
  setColumnVisibility,
  localStorageKey,
  className = "wl-btn-primary-outline wl-icon wl-icon-view-setting",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempVisibility, setTempVisibility] =
    useState<ColumnVisibility>(columnVisibility);

  // Track if all columns are visible, some are visible, or none are visible
  const [selectAllState, setSelectAllState] = useState<"all" | "some" | "none">(
    "all"
  );

  // Update tempVisibility when columnVisibility prop changes
  useEffect(() => {
    setTempVisibility(columnVisibility);
  }, [columnVisibility]);

  // Update selectAllState based on tempVisibility
  useEffect(() => {
    const visibleCount = Object.values(tempVisibility).filter(Boolean).length;
    const totalCount = Object.keys(tempVisibility).length;

    if (visibleCount === 0) {
      setSelectAllState("none");
    } else if (visibleCount === totalCount) {
      setSelectAllState("all");
    } else {
      setSelectAllState("some");
    }
  }, [tempVisibility]);

  const togglePopover = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleSave = useCallback(() => {
    setColumnVisibility(tempVisibility);
    saveToLocalStorage(localStorageKey, tempVisibility);
    setIsOpen(false);
  }, [tempVisibility, setColumnVisibility, localStorageKey]);

  const handleCancel = useCallback(() => {
    setTempVisibility(columnVisibility);
    setIsOpen(false);
  }, [columnVisibility]);

  const handleReset = useCallback(() => {
    // Reset to default - all columns visible
    const defaultVisibility = columns.reduce((acc, column) => {
      const columnId = String(column.id || column.accessorKey);
      acc[columnId] = true;
      return acc;
    }, {} as ColumnVisibility);

    setTempVisibility(defaultVisibility);
  }, [columns]);

  const toggleColumn = useCallback((columnId: string) => {
    setTempVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    const newValue = selectAllState !== "all";
    const newVisibility = Object.keys(tempVisibility).reduce(
      (acc, columnId) => {
        acc[columnId] = newValue;
        return acc;
      },
      {} as ColumnVisibility
    );

    setTempVisibility(newVisibility);
  }, [tempVisibility, selectAllState]);

  // Define modal buttons
  const modalButtons = [
    {
      label: "Cancel",
      className: "wl-btn-primary-text",
      onClick: handleCancel,
    },
    {
      label: "Reset",
      className: "wl-btn-primary-outline",
      onClick: handleReset,
    },
    {
      label: "Save",
      className: "wl-btn-primary",
      onClick: handleSave,
    },
  ];

  return (
    <>
      <button
        onClick={togglePopover}
        type="button"
        className={`${className}`}
        aria-label="View settings"
      />

      <ModalPopup
        isOpen={isOpen}
        onClose={handleCancel}
        title="View Settings"
        width="wl-width-360"
        centered={true}
        closeOnOutsideClick={true}
        buttons={modalButtons}
        buttonPosition="top" // We'll handle buttons manually
        id="ViewSettingModalId"
      >
        <div className="d-flex flex-column">
          {/* List with checkboxes */}
          <div className="wl-list d-flex flex-column">
            <ul className="wl-list-header">
              <li className="px-2">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="checkBoxSelectAll"
                    checked={selectAllState === "all"}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = selectAllState === "some";
                      }
                    }}
                    onChange={toggleSelectAll}
                  />
                  <label className="wl-button-md" htmlFor="checkBoxSelectAll">
                    Show All
                  </label>
                </div>
              </li>
            </ul>
            <ul className="wl-highlight">
              {columns.map((column) => {
                const columnId = String(column.id || column.accessorKey);
                return (
                  <li key={columnId}>
                    <div className="d-flex align-items-center">
                      <input
                        checked={!!tempVisibility[columnId]}
                        type="checkbox"
                        id={`checkbox_${columnId}`}
                        onChange={() => toggleColumn(columnId)}
                      />
                      <label htmlFor={`checkbox_${columnId}`}>
                        {column.header}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </ModalPopup>
    </>
  );
};

export default ColumnVisibilityComponent;
