"use client"

import { createRoot } from "react-dom/client"
import Toast from "@/components/common/Toast"
import React from "react";

type ToastType = "success" | "error" | "warning" | "info"

interface ToastService {
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
}

// Lazy initialize the toast container only when needed
let toastContainer: HTMLDivElement | null = null

// Function to get or create the toast container
const getToastContainer = (): HTMLDivElement => {
    if (toastContainer) return toastContainer

    // Check if container already exists in DOM
    const existingContainer = document.getElementById("toast-container") as HTMLDivElement
    if (existingContainer) {
        toastContainer = existingContainer
        return existingContainer
    }

    // Create a new container if none exists
    toastContainer = document.createElement("div")
    toastContainer.setAttribute("id", "toast-container")
    toastContainer.style.position = "fixed"
    toastContainer.style.top = "1rem"
    toastContainer.style.right = "1rem"
    toastContainer.style.zIndex = "99999999"
    document.body.appendChild(toastContainer)
    return toastContainer
}

// Function to show toast
const showToast = (message: string, type: ToastType, duration = 3000) => {
    // Ensure we're in a browser environment
    if (typeof window === "undefined") return

    // Get or create the toast container
    const container = getToastContainer()

    // Create a wrapper div for each toast instance
    const toastWrapper = document.createElement("div")
    container.appendChild(toastWrapper)

    // Create root for this specific toast
    const root = createRoot(toastWrapper)

    // Function to handle toast cleanup
    const removeToast = () => {
        root.unmount()
        if (container.contains(toastWrapper)) {
            container.removeChild(toastWrapper)
        }
    }

    // Render the toast
    root.render(React.createElement(Toast, {
        message,
        type,
        duration,
        isVisible: true,
        onClose: removeToast
    }));


    // Auto-close after duration
    if (duration > 0) {
        setTimeout(removeToast, duration)
    }
}

// Create toast object with specific methods
const toast: ToastService = {
    success: (message: string, duration?: number) => showToast(message, "success", duration),
    error: (message: string, duration?: number) => showToast(message, "error", duration),
    warning: (message: string, duration?: number) => showToast(message, "warning", duration),
    info: (message: string, duration?: number) => showToast(message, "info", duration),
}

export default toast

