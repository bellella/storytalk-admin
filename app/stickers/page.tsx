"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  useStickers,
  useCreateSticker,
  useUpdateSticker,
  useDeleteSticker,
  type StickerBasic,
  type CreateStickerInput,
} from "@/hooks/use-stickers";

const EMPTY_FORM: CreateStickerInput = {
  code: "",
  name: "",
  imageUrl: "",
  isActive: true,
};

function StickerFormDialog({
  open,
  initial,
  onClose,
  onSave,
  isSaving,
}: {
  open: boolean;
  initial: CreateStickerInput & { id?: number };
  onClose: () => void;
  onSave: (data: CreateStickerInput & { id?: number }) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const key = JSON.stringify(initial);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial.id ? "Edit Sticker" : "New Sticker"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2" key={key}>
          <div className="space-y-1.5">
            <Label>Code (unique)</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. heart_eyes"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 하트 눈 스티커"
            />
          </div>

          <ImageUploader
            label="Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            aspectRatio="square"
          />

          <div className="flex items-center gap-2">
            <Switch
              checked={form.isActive ?? true}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
            <Label>Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.code || !form.name || !form.imageUrl}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StickerCard({
  sticker,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  sticker: StickerBasic;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group">
      {/* Image */}
      <div className="aspect-square bg-secondary relative">
        <img
          src={sticker.imageUrl}
          alt={sticker.name}
          className="w-full h-full object-contain p-2"
        />
        {!sticker.isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-xs text-white font-medium bg-black/60 px-2 py-0.5 rounded-full">
              Inactive
            </span>
          </div>
        )}
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-black/50 hover:bg-red-600/80 rounded-lg text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">{sticker.name}</p>
        <p className="text-xs text-muted-foreground font-mono truncate">{sticker.code}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <Switch
            checked={sticker.isActive}
            onCheckedChange={onToggleActive}
            className="scale-75 origin-left"
          />
          <span className="text-xs text-muted-foreground">
            {sticker.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StickersPage() {
  const { data: stickers = [], isLoading, error } = useStickers();
  const createSticker = useCreateSticker();
  const updateSticker = useUpdateSticker();
  const deleteSticker = useDeleteSticker();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(CreateStickerInput & { id?: number }) | null>(
    null
  );
  const [search, setSearch] = useState("");

  const filtered = stickers.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setEditTarget({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(s: StickerBasic) {
    setEditTarget({
      id: s.id,
      code: s.code,
      name: s.name,
      imageUrl: s.imageUrl,
      isActive: s.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave(data: CreateStickerInput & { id?: number }) {
    if (data.id) {
      await updateSticker.mutateAsync({ id: data.id, ...data });
    } else {
      await createSticker.mutateAsync(data);
    }
    setDialogOpen(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this sticker?")) return;
    await deleteSticker.mutateAsync(id);
  }

  async function handleToggleActive(id: number, active: boolean) {
    await updateSticker.mutateAsync({ id, isActive: active });
  }

  const isSaving = createSticker.isPending || updateSticker.isPending;

  return (
    <AdminLayout>
      <PageHeader title="Stickers" description="Manage chat stickers">
        <Button className="rounded-xl shadow-lg shadow-primary/25" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Sticker
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Input
          placeholder="Search code, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} / {stickers.length}
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          Failed to load: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No stickers found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filtered.map((s) => (
                <StickerCard
                  key={s.id}
                  sticker={s}
                  onEdit={() => openEdit(s)}
                  onDelete={() => handleDelete(s.id)}
                  onToggleActive={(active) => handleToggleActive(s.id, active)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editTarget && (
        <StickerFormDialog
          open={dialogOpen}
          initial={editTarget}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </AdminLayout>
  );
}
