"use client";

import { useState } from "react";
import type { StoryCharacterWithCharacter, CharacterBasic } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Trash2, UserCircle, Pencil, Check, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryCharactersTabProps {
  storyId: number;
  characters: StoryCharacterWithCharacter[];
  onAddCharacter: () => void;
  onRemoveCharacter: (id: number) => void;
  onPatchCharacter: (
    id: number,
    patch: { name?: string; listed?: boolean; order?: number }
  ) => void;
  onReorderCharacters: (reordered: StoryCharacterWithCharacter[]) => void;
  reordering?: boolean;
  isDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
  allCharacters: CharacterBasic[];
  onSelectCharacter: (characterId: number) => void;
  newCharacterName: string;
  onNewCharacterNameChange: (name: string) => void;
  onCreateStoryCharacter: () => void;
}

function SortableCharacterRow({
  sc,
  editingId,
  editingName,
  setEditingName,
  startEditing,
  cancelEditing,
  saveEditing,
  onRemoveCharacter,
  onPatchCharacter,
}: {
  sc: StoryCharacterWithCharacter;
  editingId: number | null;
  editingName: string;
  setEditingName: (v: string) => void;
  startEditing: (sc: StoryCharacterWithCharacter) => void;
  cancelEditing: () => void;
  saveEditing: () => void;
  onRemoveCharacter: (id: number) => void;
  onPatchCharacter: StoryCharactersTabProps["onPatchCharacter"];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sc.id });

  const displayName = sc.name || sc.character?.name || "Unknown";
  const avatarImage = sc.character?.avatarImage;
  const isLinked = !!sc.character;
  const isEditing = editingId === sc.id;
  const listed = sc.listed ?? true;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-stretch gap-2 p-4 hover:bg-secondary/40 transition-colors group",
        isDragging && "opacity-60 shadow-md z-10 bg-card"
      )}
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing flex items-center shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex flex-1 min-w-0 gap-3">
        <Avatar className="w-12 h-12 rounded-xl shrink-0">
          {avatarImage && <AvatarImage src={avatarImage} />}
          <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
            {displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8 text-sm rounded-lg bg-secondary border-0 max-w-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditing();
                      if (e.key === "Escape") cancelEditing();
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={saveEditing}>
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={cancelEditing}>
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-foreground truncate">{displayName}</p>
                  <button
                    type="button"
                    onClick={() => startEditing(sc)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {isLinked
                  ? sc.name !== sc.character?.name
                    ? `${sc.character?.name} → ${sc.name}`
                    : "Linked Character"
                  : "Story Character"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={() => onRemoveCharacter(sc.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <Label htmlFor={`listed-${sc.id}`} className="text-xs text-muted-foreground cursor-pointer">
              Listed
            </Label>
            <Switch
              id={`listed-${sc.id}`}
              checked={listed}
              onCheckedChange={(v) => onPatchCharacter(sc.id, { listed: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoryCharactersTab({
  storyId: _storyId,
  characters,
  onAddCharacter,
  onRemoveCharacter,
  onPatchCharacter,
  onReorderCharacters,
  reordering = false,
  isDialogOpen,
  onDialogChange,
  allCharacters,
  onSelectCharacter,
  newCharacterName,
  onNewCharacterNameChange,
  onCreateStoryCharacter,
}: StoryCharactersTabProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const availableCharacters = allCharacters.filter(
    (c) => !characters.some((sc) => sc.characterId === c.id)
  );

  const startEditing = (sc: StoryCharacterWithCharacter) => {
    setEditingId(sc.id);
    setEditingName(sc.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEditing = () => {
    if (editingId && editingName.trim()) {
      onPatchCharacter(editingId, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = characters.findIndex((c) => c.id === active.id);
    const newIndex = characters.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorderCharacters(arrayMove(characters, oldIndex, newIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">Drag the grip handle to reorder characters</p>
        <Button variant="outline" className="rounded-xl bg-transparent" onClick={onAddCharacter}>
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </div>

      <Card
        className={cn(
          "rounded-2xl border-border/50 shadow-sm overflow-hidden",
          reordering && "opacity-60 pointer-events-none"
        )}
      >
        {characters.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No characters linked yet</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={characters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-border/50">
                {characters.map((sc) => (
                  <SortableCharacterRow
                    key={sc.id}
                    sc={sc}
                    editingId={editingId}
                    editingName={editingName}
                    setEditingName={setEditingName}
                    startEditing={startEditing}
                    cancelEditing={cancelEditing}
                    saveEditing={saveEditing}
                    onRemoveCharacter={onRemoveCharacter}
                    onPatchCharacter={onPatchCharacter}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Character to Story</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 pb-4 border-b border-border">
            <Label className="text-sm font-medium">Create Story Character</Label>
            <p className="text-sm text-muted-foreground">
              Create a character that only exists in this story
            </p>
            <div className="flex gap-2">
              <Input
                value={newCharacterName}
                onChange={(e) => onNewCharacterNameChange(e.target.value)}
                placeholder="Character name"
                className="rounded-xl bg-secondary border-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onCreateStoryCharacter();
                  }
                }}
              />
              <Button type="button" onClick={onCreateStoryCharacter} className="rounded-xl" disabled={!newCharacterName.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Link Existing Character</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableCharacters.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground text-sm">No available characters to link</div>
              ) : (
                availableCharacters.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => onSelectCharacter(char.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <Avatar className="w-10 h-10 rounded-xl">
                      <AvatarImage src={char.avatarImage || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                        {char.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{char.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{char.description}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
