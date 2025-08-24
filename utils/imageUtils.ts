export interface CourseImageObject {
  type: string;
  data: number[];
}

// Unified function to process various image data formats to a usable image source string
export function processImageSrc(
  imageData: CourseImageObject | string | null | undefined,
  defaultPath: string = "/no-image.png",
  mimeType: string = "image/jpeg"
): string {
  if (!imageData) return defaultPath;

  if (typeof imageData === "string") {
    if (
      imageData.startsWith("data:") ||
      imageData.startsWith("http") ||
      imageData.startsWith("/")
    ) {
      return imageData; // Already a data URI, absolute URL, or root-relative path
    }
    // If it's a non-empty relative path that doesn't start with '/', it might be problematic.
    // For now, assume if it's a string, it's intended as a path.
    // Consider prefixing with '/' if it's supposed to be root-relative but isn't.
    return imageData.trim() !== "" ? imageData : defaultPath;
  }

  if (
    typeof imageData === "object" &&
    imageData.data &&
    Array.isArray(imageData.data)
  ) {
    try {
      let binary = "";
      const bytes = new Uint8Array(imageData.data);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64String = window.btoa(binary);
      const resolvedMimeType =
        typeof imageData.type === "string" && imageData.type.startsWith("image/")
          ? imageData.type
          : mimeType;
      return `data:${resolvedMimeType};base64,${base64String}`;
    } catch (e) {
      console.error("Error converting image buffer to base64:", e);
      return defaultPath;
    }
  }
  return defaultPath; // Fallback for unrecognized formats
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
