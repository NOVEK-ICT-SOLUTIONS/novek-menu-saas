import React from "react";
import { MdCloudUpload, MdDelete, MdImage } from "react-icons/md";
import { toast } from "sonner";
import { uploadService } from "@/lib/upload.service";
import { Button } from "./ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ImageUpload = React.memo(
  ({ value, onChange, disabled }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = React.useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
          return;
        }

        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
        }

        setIsUploading(true);

        const result = await uploadService.uploadImage(file);
        onChange(result.url);
        toast.success("Image uploaded successfully");

        setIsUploading(false);

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
      [onChange],
    );

    const handleRemove = React.useCallback(async () => {
      if (value) {
        await uploadService.deleteImage(value);
        onChange(undefined);
        toast.success("Image removed");
      }
    }, [value, onChange]);

    const handleClick = React.useCallback(() => {
      inputRef.current?.click();
    }, []);

    return (
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {value ? (
          <div className="relative group">
            <img src={value} alt="Uploaded" className="w-full h-40 object-cover rounded-lg border" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={disabled || isUploading}
              >
                <MdCloudUpload className="h-4 w-4 mr-1" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <MdDelete className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isUploading}
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </>
            ) : (
              <>
                <MdImage className="h-10 w-10 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400">Max {MAX_FILE_SIZE_MB}MB</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  },
  (prev, next) => prev.value === next.value && prev.disabled === next.disabled,
);

ImageUpload.displayName = "ImageUpload";
