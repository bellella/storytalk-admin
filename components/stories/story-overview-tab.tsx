"use client";

import { useState } from "react";
import type { StoryWithRelations, StoryType, TagBasic, StoryTagWithTag } from "@/types";
import { PublishStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Calendar, Clock, FileText, Plus, X, Tag } from "lucide-react";

interface StoryOverviewTabProps {
  story: StoryWithRelations;
  onUpdate: (field: string, value: string | number) => void;
  allTags: TagBasic[];
  storyTags: StoryTagWithTag[];
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
  onCreateTag: (slug: string) => void;
}

const categories = [
  "Fantasy",
  "Romance",
  "Mystery",
  "Sci-Fi",
  "Drama",
  "Adventure",
];

const levels = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "BASIC", label: "Basic" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "MASTER", label: "Master" },
];

const statusOptions = [
  { value: PublishStatus.DRAFT, label: "Draft" },
  { value: PublishStatus.PUBLISHED, label: "Published" },
  { value: PublishStatus.HIDDEN, label: "Hidden" },
  { value: PublishStatus.ARCHIVED, label: "Archived" },
  { value: PublishStatus.DELETED, label: "Deleted" },
];

const storyTypes: { value: StoryType; label: string }[] = [
  { value: "UNIT", label: "Unit (Learning-focused)" },
  { value: "NOVEL", label: "Novel (Story-driven)" },
  { value: "PLAY", label: "Play (Premium)" },
];

export function StoryOverviewTab({
  story,
  onUpdate,
  allTags,
  storyTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
}: StoryOverviewTabProps) {
  const [newTagSlug, setNewTagSlug] = useState("");

  const linkedTagIds = new Set(storyTags.map((st) => st.tagId));
  const availableTags = allTags.filter((t) => !linkedTagIds.has(t.id));

  const handleCreateTag = () => {
    const slug = newTagSlug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) return;
    onCreateTag(slug);
    setNewTagSlug("");
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="col-span-2 space-y-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={story.title}
                onChange={(e) => onUpdate("title", e.target.value)}
                className="mt-2 rounded-xl bg-secondary border-0"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <Select
                  value={story.type ?? "NOVEL"}
                  onValueChange={(value) => onUpdate("type", value)}
                >
                  <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {storyTypes.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="rounded-lg"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={story.category ?? ""}
                  onValueChange={(value) => onUpdate("category", value)}
                >
                  <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded-lg">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Level</Label>
                <Select
                  value={story.level}
                  onValueChange={(value) => onUpdate("level", value)}
                >
                  <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {levels.map((level) => (
                      <SelectItem
                        key={level.value}
                        value={level.value}
                        className="rounded-lg"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={story.description || ""}
                onChange={(e) => onUpdate("description", e.target.value)}
                className="mt-2 rounded-xl bg-secondary border-0 min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="icon" className="text-sm font-medium">
                Icon (emoji)
              </Label>
              <Input
                id="icon"
                value={story.icon}
                onChange={(e) => onUpdate("icon", e.target.value)}
                className="mt-2 rounded-xl bg-secondary border-0 w-24"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Media</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              value={story.coverImage || ""}
              onChange={(url) => onUpdate("coverImage", url)}
              label="Cover Image"
              aspectRatio="video"
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={story.status}
              onValueChange={(value) => onUpdate("status", value)}
            >
              <SelectTrigger className="rounded-xl bg-secondary border-0">
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
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current tags */}
            {storyTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {storyTags.map((st) => (
                  <span
                    key={st.tagId}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {st.tag.icon && <span>{st.tag.icon}</span>}
                    {st.tag.slug}
                    <button
                      onClick={() => onRemoveTag(st.tagId)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add existing tag */}
            {availableTags.length > 0 && (
              <Select onValueChange={(value) => onAddTag(parseInt(value))}>
                <SelectTrigger className="rounded-xl bg-secondary border-0">
                  <SelectValue placeholder="Add tag..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableTags.map((tag) => (
                    <SelectItem
                      key={tag.id}
                      value={String(tag.id)}
                      className="rounded-lg"
                    >
                      {tag.icon ? `${tag.icon} ` : ""}
                      {tag.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Create new tag */}
            <div className="flex gap-2">
              <Input
                value={newTagSlug}
                onChange={(e) => setNewTagSlug(e.target.value)}
                placeholder="New tag..."
                className="rounded-xl bg-secondary border-0 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl bg-transparent shrink-0"
                onClick={handleCreateTag}
                disabled={!newTagSlug.trim()}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="text-foreground">
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span className="text-foreground">
                {new Date(story.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Episodes:</span>
              <span className="text-foreground">
                {story.episodes?.length ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
