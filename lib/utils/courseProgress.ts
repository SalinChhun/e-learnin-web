/**
 * Calculate display progress percentage based on course/learner status
 * @param status - The status string (e.g., "Pending Request", "In Progress", "Completed")
 * @param progressPercentage - The actual progress percentage from the API (optional)
 * @returns The display progress percentage
 */
export function getDisplayProgress(status: string, progressPercentage?: number): number {
    const statusLower = status.toLowerCase()
    
    if (statusLower === 'pending request') {
        return 0
    } else if (statusLower === 'in progress') {
        return 45
    } else if (statusLower === 'completed') {
        return 100
    }
    
    // For other statuses, return the actual progress percentage or 0
    return progressPercentage || 0
}

