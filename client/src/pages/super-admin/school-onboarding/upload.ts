import { uploadApi } from "@/lib/api";

export async function presignedOrLocalUpload(params: {
  key: string;
  file: File;
  contentType?: string;
}): Promise<string> {
  const { key, file, contentType = file.type || "application/octet-stream" } = params;

  const localUploadViaApi = async (): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("key", key);
    const { publicUrl } = await uploadApi.local(fd);
    return publicUrl;
  };

  // In development, always store locally (skip cloud presign)
  if (import.meta && (import.meta as any).env && (import.meta as any).env.DEV) {
    return await localUploadViaApi();
  }

  // In production, try presigned first then fallback to local
  try {
    const presign = await uploadApi.presign({ key, contentType });
    const res = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!res.ok) throw new Error(String(res.status));
    return presign.publicUrl;
  } catch {
    return await localUploadViaApi();
  }
}
