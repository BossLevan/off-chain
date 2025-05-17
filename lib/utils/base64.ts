/**
 * Convert a File/Blob from an <input type="file"> to Base-64 data-URL.
 */
export function fileToBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Could not read file"));
      };
      reader.onerror = () => reject(reader.error);
  
      reader.readAsDataURL(file);                 // e.g. "data:image/png;base64,AAAFB...="
    });
  }
  
  /* Usage (browser / React) -------------------------------------
  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const base64 = await fileToBase64(file);
      await client.uploadImage(base64); // call the SDK wrapper
    }}
  /> */

  export async function streamToBase64(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const chunks = [];
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  
    const blob = new Blob(chunks, { type: "image/png" });
    const buffer = Buffer.from(await blob.arrayBuffer());
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
  