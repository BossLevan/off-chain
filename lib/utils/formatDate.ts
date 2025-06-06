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

  export function getTimeAgo(input: any): string {
    let date: Date;
  
    // Handle Firestore Timestamp
    if (input?.toDate) {
      date = input.toDate();
    } else {
      date = new Date(input);
    }
  
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  
    return date.toLocaleDateString(); // fallback for older dates
  }
  
  