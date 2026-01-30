"use client";

import { useState, useEffect, useRef, DragEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Link,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  maxSizeMB?: number;
};

export function ImageUploader({
  value,
  onChange,
  label,
  placeholder = "https://example.com/image.jpg",
  className,
  aspectRatio = "auto",
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput with value prop
  useEffect(() => {
    if (value) {
      setUrlInput(value);
      setUrlValid(true);
    } else {
      setUrlInput("");
      setUrlValid(null);
    }
  }, [value]);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
    setError(null);

    if (newUrl.trim()) {
      const isValid = validateUrl(newUrl.trim());
      setUrlValid(isValid);
      if (!isValid) {
        setError(
          "올바른 URL 형식이 아닙니다 (http:// 또는 https://로 시작해야 합니다)"
        );
      }
    } else {
      setUrlValid(null);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다");
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "업로드에 실패했습니다");
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error("서버에서 URL을 반환하지 않았습니다");
      }

      onChange(data.url);
      setError(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "업로드 중 오류가 발생했습니다");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === "upload" && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (mode !== "upload" || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleUrlSubmit = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setError("URL을 입력해주세요");
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setError("올바른 URL 형식이 아닙니다");
      return;
    }

    onChange(trimmedUrl);
    setError(null);
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    setError(null);
    setUrlValid(null);
  };

  const handleImageError = () => {
    setError("이미지를 불러올 수 없습니다");
  };

  const handleBoxClick = () => {
    if (mode === "upload" && !uploading && !value) {
      fileInputRef.current?.click();
    }
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : "h-40";

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium mb-2 block">{label}</Label>
      )}

      <div className="space-y-2">
        {/* Mode Toggle - Always at top */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => {
              setMode("upload");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              mode === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            업로드
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("url");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              mode === "url"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link className="w-3.5 h-3.5" />
            URL
          </button>
        </div>

        {/* URL Input - Shows when URL tab active */}
        {mode === "url" && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={urlInput}
                onChange={handleUrlChange}
                placeholder={placeholder}
                className={cn(
                  "rounded-xl bg-secondary border-0 flex-1 pr-8",
                  urlValid === false && "border-destructive",
                  urlValid === true && "border-green-500/50"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
              {urlInput && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {urlValid === true && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {urlValid === false && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={handleUrlSubmit}
              className="rounded-xl"
              disabled={!urlInput.trim() || urlValid === false}
            >
              적용
            </Button>
          </div>
        )}

        {/* Single Box - Preview or Upload Area */}
        <div
          className={cn(
            "relative rounded-xl overflow-hidden border-2 border-dashed transition-colors",
            aspectClass,
            value
              ? "border-border bg-secondary"
              : isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary hover:bg-secondary/80 hover:border-primary/50",
            mode === "upload" && !value && !uploading && "cursor-pointer"
          )}
          onClick={handleBoxClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image Preview */}
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                type="button"
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Overlay for drag-drop replacement in upload mode */}
              {mode === "upload" && isDragging && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <span className="text-sm text-primary font-medium">
                      이미지 교체
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : uploading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  업로드 중...
                </span>
              </div>
            </div>
          ) : mode === "upload" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <Upload
                  className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm block",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isDragging
                    ? "여기에 놓으세요"
                    : "클릭 또는 드래그하여 업로드"}
                </span>
                <span className="text-xs text-muted-foreground/70 mt-1 block">
                  최대 {maxSizeMB}MB
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <Link className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-sm text-muted-foreground block">
                  상단에 URL을 입력하세요
                </span>
              </div>
            </div>
          )}

          {/* Uploading overlay when image exists */}
          {value && uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
