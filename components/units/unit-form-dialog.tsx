"use client";

import { useState, useEffect } from "react";
import type { UnitWithStory, StoryWithRelations } from "@/types";
import { PublishStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";

interface UnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitWithStory | null;
  stories: StoryWithRelations[];
  onSave: (data: {
    storyId: number;
    order?: number;
    color?: string;
    status?: PublishStatus;
  }) => void;
  saving: boolean;
}

const statusOptions = [
  { value: PublishStatus.DRAFT, label: "Draft" },
  { value: PublishStatus.PUBLISHED, label: "Published" },
  { value: PublishStatus.HIDDEN, label: "Hidden" },
  { value: PublishStatus.ARCHIVED, label: "Archived" },
];

export function UnitFormDialog({
  open,
  onOpenChange,
  unit,
  stories,
  onSave,
  saving,
}: UnitFormDialogProps) {
  const isEditing = !!unit;
  const [storyId, setStoryId] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [status, setStatus] = useState<PublishStatus>(PublishStatus.DRAFT);
  const [color, setColor] = useState<string>("255, 255, 255");

  useEffect(() => {
    if (unit) {
      setStoryId(String(unit.storyId));
      setOrder(String(unit.order));
      setStatus(unit.status);
    } else {
      setStoryId("");
      setOrder("");
      setStatus("DRAFT");
    }
  }, [unit, open]);

  const handleSubmit = () => {
    if (!storyId) return;
    onSave({
      storyId: Number(storyId),
      order: order ? Number(order) : undefined,
      color: color ? color : undefined,
      status: status as PublishStatus,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit" : "Create Unit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium">Story</Label>
            <Select value={storyId} onValueChange={setStoryId}>
              <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                <SelectValue placeholder="Select a story" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {stories.map((story) => (
                  <SelectItem
                    key={story.id}
                    value={String(story.id)}
                    className="rounded-lg"
                  >
                    {story.icon} {story.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Order</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="mt-2 rounded-xl bg-secondary border-0"
              placeholder="Auto-assigned if empty"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="mt-2 rounded-xl bg-secondary border-0"
                placeholder="255, 255, 255"
              />
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: `rgba(${color}, 1)` }}
              ></div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as PublishStatus)}
            >
              <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {statusOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !storyId}
            className="rounded-xl"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
