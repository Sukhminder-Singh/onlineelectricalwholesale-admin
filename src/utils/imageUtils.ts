/**
 * Utility functions for handling image URLs and operations
 */

/**
 * Creates a proper image URL from a filename
 * @param filename - The filename of the image (e.g., "image.jpg")
 * @returns Full URL to the image or null if filename is invalid
 */
export const createImageUrl = (filename?: string): string | null => {
    if (!filename || filename.trim() === '') {
        return null;
    }
    
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
    return `${baseUrl}/uploads/${filename.trim()}`;
};

/**
 * Validates if an image URL is valid (not empty or null)
 * @param url - The URL to validate
 * @returns true if URL is valid, false otherwise
 */
export const isValidImageUrl = (url?: string | null): boolean => {
    return !!(url && url.trim() !== '');
};

/**
 * Gets a fallback image URL for when no image is available
 * @returns A placeholder image URL or null
 */
export const getFallbackImageUrl = (): string | null => {
    // You can replace this with an actual placeholder image URL if needed
    return null;
};

/**
 * Handles image loading errors by providing fallback
 * @param event - The error event from img element
 * @param fallbackUrl - Optional fallback URL
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) => {
    const img = event.currentTarget;
    if (fallbackUrl && img.src !== fallbackUrl) {
        img.src = fallbackUrl;
    } else {
        // Hide image if no fallback available
        img.style.display = 'none';
    }
};