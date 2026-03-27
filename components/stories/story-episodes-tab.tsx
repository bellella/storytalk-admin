"use client";

import type { EpisodeBasic } from "@/types";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryEpisodesTabProps {
  storyId: number;
  episodes: EpisodeBasic[];
  onCreateEpisode: () => void;
  onReorderEpisodes: (reorderedEpisodes: EpisodeBasic[]) => void;
  reordering?: boolean;
  onDeleteEpisode?: (episodeId: number) => void;
  deletingEpisodeId?: number | null;
}

function SortableEpisodeItem({
  episode,
  storyId,
  onDeleteEpisode,
  deleteDisabled,
}: {
  episode: EpisodeBasic;
  storyId: number;
  onDeleteEpisode?: (episodeId: number) => void;
  deleteDisabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: episode.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group",
          isDragging && "opacity-50 shadow-lg"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {episode.order}
        </div>
        <div className="flex-1">
          <Link
            href={`/stories/${storyId}/episodes/${episode.id}`}
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            {episode.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            {(episode as EpisodeBasic & { _count?: { scenes: number } })._count?.scenes ?? 0} scenes
          </p>
        </div>
        <StatusBadge status={episode.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-9 w-9"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="rounded-lg" asChild>
              <Link
                href={`/stories/${storyId}/episodes/${episode.id}`}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg text-destructive focus:text-destructive"
              disabled={deleteDisabled || !onDeleteEpisode}
              onSelect={() => {
                if (!onDeleteEpisode) return;
                if (
                  confirm(
                    `Delete "${episode.title}"? This cannot be undone.`
                  )
                ) {
                  onDeleteEpisode(episode.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function StoryEpisodesTab({
  storyId,
  episodes,
  onCreateEpisode,
  onReorderEpisodes,
  reordering = false,
  onDeleteEpisode,
  deletingEpisodeId = null,
}: StoryEpisodesTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = episodes.findIndex((e) => e.id === active.id);
    const newIndex = episodes.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(episodes, oldIndex, newIndex);
    onReorderEpisodes(reordered);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">Drag to reorder episodes</p>
        <Button
          className="rounded-xl shadow-lg shadow-primary/25"
          onClick={onCreateEpisode}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Episode
        </Button>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={episodes.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-border/50">
              {episodes.map((episode) => (
                <SortableEpisodeItem
                  key={episode.id}
                  episode={episode}
                  storyId={storyId}
                  onDeleteEpisode={onDeleteEpisode}
                  deleteDisabled={deletingEpisodeId === episode.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {episodes.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No episodes yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
