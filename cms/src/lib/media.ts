/**
 * Shared media-library helpers.
 *
 * The CMS keeps user-uploaded images as base64 data URLs in localStorage so
 * (a) they survive reloads, (b) MediaView and any image picker can read from
 * the same source, and (c) data URLs can be dropped straight into a
 * section's `data` field — the inspector's ImageSlot and the live preview
 * both render data URLs without any extra plumbing.
 */

export type UploadedItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: number;
};

export type BundledAsset = { name: string; size: string };

// Static images shipped in `spay-website/public/`. Always servable at the
// root path of the live-preview iframe.
export const BUNDLED_ASSETS: BundledAsset[] = [
  { name: "heroImageSpay.png", size: "340 KB" },
  { name: "spayFront.png", size: "82 KB" },
  { name: "spayBack.png", size: "1.2 MB" },
  { name: "paymentMobile.png", size: "680 KB" },
  { name: "paymentMobileTrade.png", size: "520 KB" },
  { name: "crypto.jpeg", size: "910 KB" },
  { name: "notifications.jpeg", size: "840 KB" },
  { name: "transactions.jpeg", size: "12 KB" },
  { name: "Spay.png", size: "220 KB" },
  { name: "spaycard.svg", size: "1.4 MB" },
  { name: "mastercard.svg", size: "480 KB" },
  { name: "cryptoCard.svg", size: "120 KB" },
  { name: "tabletMobile.png", size: "4 KB" },
  { name: "graph.svg", size: "180 KB" },
  { name: "heroSectionPhone.png", size: "22 KB" },
  { name: "martha.png", size: "2.1 MB" },
];

export const MEDIA_STORAGE_KEY = "spay.media.uploads.v1";
// Cap per-file size to keep us well under the typical 5–10 MB localStorage
// quota and under the backend body limit (10 MB) once base64 inflation is
// factored in.
export const MAX_FILE_BYTES = 6 * 1024 * 1024;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function loadUploaded(): UploadedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UploadedItem[]) : [];
  } catch {
    return [];
  }
}

export function saveUploaded(items: UploadedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded — best-effort, swallow so the inspector still works.
  }
}

export function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate a File against the image MIME and size cap. Returns null on
 * success, or a human-readable error message on failure.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "File must be an image";
  if (file.size > MAX_FILE_BYTES) {
    return `Image is too large (max ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB)`;
  }
  return null;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Persist a single file as an UploadedItem and return it. Throws if the file
 * fails validation or can't be read.
 */
export async function ingestFile(file: File): Promise<UploadedItem> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);
  const dataUrl = await readAsDataURL(file);
  const item: UploadedItem = {
    id: newId(),
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl,
    uploadedAt: Date.now(),
  };
  const next = [item, ...loadUploaded()];
  saveUploaded(next);
  return item;
}
