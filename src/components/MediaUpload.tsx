import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Image as ImageIcon, File } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  onMediaSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
}

const MediaUpload = ({ onMediaSelect, onClear, selectedFile }: MediaUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported. Please upload an image, PDF, or video.");
      return;
    }

    onMediaSelect(file);
  };

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,video/mp4"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border">
          {isImage ? (
            <ImageIcon className="w-4 h-4 text-primary" />
          ) : (
            <File className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm text-foreground truncate max-w-[120px]">
            {selectedFile.name}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClear}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="text-muted-foreground hover:text-primary"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default MediaUpload;