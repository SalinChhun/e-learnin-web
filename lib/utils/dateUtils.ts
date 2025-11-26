/**
 * Format relative time from a date string (1m, 1h, 3 Days ago)
 * @param dateString - ISO date string (e.g., "2025-11-26T03:05:59.975893Z")
 * @returns Formatted relative time string (e.g., "30m", "2h", "3 Days")
 */
export const formatRelativeTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A'
    
    try {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMs = now.getTime() - date.getTime()
        
        // Handle future dates
        if (diffInMs < 0) {
            return 'Just now'
        }
        
        // Convert to different time units
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
        
        // If less than 1 hour, show in minutes
        if (diffInMinutes < 60) {
            return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m`
        }
        
        // If less than 24 hours, show in hours
        if (diffInHours < 24) {
            return `${diffInHours}h`
        }
        
        // If 24 hours or more, show in days
        return `${diffInDays} ${diffInDays === 1 ? 'Day' : 'Days'}`
    } catch {
        return 'N/A'
    }
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Nov 26, 2025")
 */
export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch {
        return 'N/A'
    }
}

