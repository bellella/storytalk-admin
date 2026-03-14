"use client";

import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Plus, Loader2, Trash2, Search } from "lucide-react";
import { useImages, useCreateImage, useDeleteImage, type ImageBasic } from "@/hooks/use-images";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "background", label: "background" },
  { value: "character", label: "character" },
  { value: "cover", label: "cover" },
  { value: "icon", label: "icon" },
];

export default function ImagesPage() {
  const { data: images = [], isLoading, error } = useImages();
  const createImage = useCreateImage();
  const deleteImage = useDeleteImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ url: "", name: "", type: "" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = useMemo(() => {
    return images.filter((img) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (img.name?.toLowerCase().includes(q) ?? false) ||
        img.url.toLowerCase().includes(q);
      const matchType = !typeFilter || img.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [images, search, typeFilter]);

  async function handleCreate() {
    if (!form.url.trim()) {
      toast.error("URL을 입력해주세요");
      return;
    }
    try {
      await createImage.mutateAsync({
        url: form.url.trim(),
        name: form.name.trim() || undefined,
        type: form.type.trim() || undefined,
      });
      toast.success("이미지가 등록되었습니다.");
      setDialogOpen(false);
      setForm({ url: "", name: "", type: "" });
    } catch {
      toast.error("등록에 실패했습니다.");
    }
  }

  async function handleDelete(img: ImageBasic) {
    if (!confirm(`"${img.name || img.url}" 이미지를 삭제하시겠습니까?`)) return;
    try {
      await deleteImage.mutateAsync(img.id);
      toast.success("삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="이미지 관리"
        description="이미지 라이브러리에서 ImageUploader 검색으로 사용할 수 있습니다."
      >
        <Button
          className="rounded-xl"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          이미지 등록
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="이름/URL 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-secondary border border-border text-sm"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} / {images.length}
        </span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-24 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          로드 실패: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              이미지가 없습니다. 새로 등록하거나 업로드 후 Image 테이블에 추가하세요.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map((img) => (
                <div
                  key={img.id}
                  className="bg-card border border-border rounded-xl overflow-hidden group"
                >
                  <div className="aspect-square bg-secondary relative">
                    <img
                      src={img.url}
                      alt={img.name || "Image"}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M9 9h6M9 13h6'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(img)}
                        className="p-1.5 bg-red-500/90 hover:bg-red-600 rounded-lg text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2 truncate">
                    <p className="text-xs font-medium truncate">{img.name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {img.type || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>이미지 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>URL *</Label>
              <ImageUploader
                value={form.url}
                onChange={(url) => setForm((f) => ({ ...f, url }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>이름 (검색용)</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예: 케릭터 아바타"
              />
            </div>
            <div className="space-y-1.5">
              <Label>타입</Label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm"
              >
                {TYPE_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createImage.isPending || !form.url.trim()}
            >
              {createImage.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
