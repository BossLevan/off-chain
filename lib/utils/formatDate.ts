export function formatDateFromTimestamp(timestamp: string): string {
    const parsedTimestamp = parseInt(timestamp, 10) * 1000; // Convert to milliseconds
    const date = new Date(parsedTimestamp);
  
    // Format: e.g., "May 12, 2025"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  