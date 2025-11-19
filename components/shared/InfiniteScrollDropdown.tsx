"use client";

import { InfiniteScrollItem, InfiniteScrollProps } from "@/lib/types/common";
import React, { useState, useRef, useEffect } from "react";

const WLInfiniteScrollDropdown: React.FC<InfiniteScrollProps & { onOpen?: () => void }> = ({
  items,
  selectedItems = [],
  onSelect,
  onRemove,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  title,
  isLoading = false,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  searchValue,
  onSearchChange,
  error,
  multiple = false,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasNextPage &&
      !isFetchingNextPage &&
      fetchNextPage
    ) {
      fetchNextPage();
    }
  };

  const handleItemSelect = (item: InfiniteScrollItem) => {
    onSelect(item);
    if (!multiple) {
      setIsOpen(false);
    }
    if (multiple) {
      onSearchChange("");
    }
  };

  const handleItemRemove = (item: InfiniteScrollItem) => {
    if (onRemove) {
      onRemove(item);
    }
    onSearchChange("");
  };

  const isItemSelected = (item: InfiniteScrollItem) => {
    return selectedItems.some((selected: any) => selected.id === item.id);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItems.length > 0 && onRemove) {
      onRemove(selectedItems[0]);
    }
    onSearchChange("");
  };

  const handleContainerClick = () => {
    const willOpen = !isOpen;
    setIsOpen(true);
    if (willOpen) onOpen?.();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderSingleSelection = () => (
    <div className="dropdown">
      <input
        ref={inputRef}
        type="text"
        className="w-100 border-0"
        placeholder={searchPlaceholder}
        value={selectedItems.length > 0 ? selectedItems[0].title : searchValue}
        onChange={(e) => {
          if (selectedItems.length > 0 && onRemove) {
            onRemove(selectedItems[0]);
          }
          onSearchChange(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onClick={(e) => {
          e.stopPropagation();
          const willOpen = !isOpen;
          setIsOpen(!isOpen);
          if (willOpen) onOpen?.();
        }}
        style={{ outline: "none", background: "transparent" }}
      />
      {(selectedItems.length > 0 || searchValue) && (
        <span
          className="wl-clear-btn"
          onClick={handleClearSelection}
          style={{ cursor: "pointer" }}
        />
      )}

      <div
        className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${
          isOpen ? "show" : ""
        }`}
      >
        <div className="w-100 d-flex flex-column">
          <div className="border-bottom wl-px-12 wl-py-10">{title}</div>
          <div
            className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1"
            onScroll={handleScroll}
            ref={listRef}
          >
            {error && (
              <div className="text-danger p-2 text-center small">
                Error loading data
              </div>
            )}

            {isLoading && items.length === 0 ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {items.map((item: any) => (
                  <div
                    key={item.value._uniqueKey || item.id}
                    className={`wl-dropdown-item d-flex justify-content-between align-items-center ${
                      isItemSelected(item) ? "active" : ""
                    }`}
                    onClick={() => handleItemSelect(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex flex-column wl-gap-2">
                      <label style={{ cursor: "pointer", margin: 0 }}>
                        {item.title}
                      </label>
                      {item.subtitle && (
                        <label
                          className="wl-caption opacity-75"
                          style={{ cursor: "pointer", margin: 0 }}
                        >
                          {item.subtitle}
                        </label>
                      )}
                    </div>
                    {isItemSelected(item) && <span className="wl-check-icon" />}
                  </div>
                ))}

                {isFetchingNextPage && (
                  <div className="text-center p-2">
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading more...</span>
                    </div>
                  </div>
                )}

                {!hasNextPage && items.length > 0 && (
                  <div className="text-center text-muted p-2 small">
                    No more items
                  </div>
                )}

                {!isLoading && items.length === 0 && (
                  <div className="text-center text-muted p-3">
                    No items found
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMultipleSelection = () => (
    <div className="dropdown">
      <div
        className="w-100 wl-pr-30 wl-pl-12"
        onClick={handleContainerClick}
        style={{ cursor: "text" }}
      >
        <div
          className="d-flex flex-wrap align-items-center wl-gap-4"
          style={{ minHeight: "38px" }}
        >
          {selectedItems.map((item) => (
            <div key={item.value._uniqueKey || item.id} className="wl-tag-sm">
              {item.title}
              <span
                className="wl-tag-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemRemove(item);
                }}
              />
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="wl-flex-grow-1 border-0"
            placeholder={
              selectedItems.length === 0 ? placeholder : searchPlaceholder
            }
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            style={{
              outline: "none",
              background: "transparent",
              minWidth: "120px",
            }}
          />
        </div>
      </div>
      <div
        className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${
          isOpen ? "show" : ""
        }`}
      >
        <div className="w-100 d-flex flex-column">
          <div className="border-bottom wl-px-12 wl-py-10">{title}</div>
          <div
            className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1"
            onScroll={handleScroll}
            ref={listRef}
          >
            {error && (
              <div className="text-danger p-2 text-center small">
                Error loading data
              </div>
            )}
            {items.map((item: any) => (
              <div
                key={item.value._uniqueKey || item.id}
                className={`wl-dropdown-item d-flex justify-content-between align-items-center ${
                  isItemSelected(item) ? "active" : ""
                }`}
                onClick={() => handleItemSelect(item)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex flex-column wl-gap-2">
                  <label style={{ cursor: "pointer", margin: 0 }}>
                    {item.title}
                  </label>
                  {item.subtitle && (
                    <label
                      className="wl-caption opacity-75"
                      style={{ cursor: "pointer", margin: 0 }}
                    >
                      {item.subtitle}
                    </label>
                  )}
                </div>
                {isItemSelected(item) && <span className="wl-check-icon" />}
              </div>
            ))}
            {isFetchingNextPage && (
              <div className="text-center p-2">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading more...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render for single selection (like Partner)
  return (
    <div className="wl-input-container" ref={dropdownRef}>
      <span className="wl-input-title wl-text-primary">
        {title}
        <span className="wl-input-required">*</span>
      </span>
  {multiple ? renderMultipleSelection() : renderSingleSelection()}
    </div>
  );
};

export default WLInfiniteScrollDropdown;
