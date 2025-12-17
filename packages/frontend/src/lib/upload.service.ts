import { apiClient } from "./api-client";

export interface UploadResponse {
  url: string;
  filename: string;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data;
  },

  deleteImage: async (url: string): Promise<void> => {
    await apiClient.delete("/upload/image", { data: { url } });
  },
};
