"use client";

import { useState } from "react";
import type { StoryCharacterWithCharacter, CharacterBasic } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, UserCircle, Pencil, Check, X } from "lucide-react";

interface StoryCharactersTabProps {
  storyId: number;
  characters: StoryCharacterWithCharacter[];
  onAddCharacter: () => void;
  onRemoveCharacter: (id: number) => void;
  onUpdateCharacterName: (id: number, name: string) => void;
  isDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
  allCharacters: CharacterBasic[];
  onSelectCharacter: (characterId: number) => void;
  newCharacterName: string;
  onNewCharacterNameChange: (name: string) => void;
  onCreateStoryCharacter: () => void;
}

export function StoryCharactersTab({
  storyId,
  characters,
  onAddCharacter,
  onRemoveCharacter,
  onUpdateCharacterName,
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
      onUpdateCharacterName(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">
          Characters appearing in this story
        </p>
        <Button
          variant="outline"
          className="rounded-xl bg-transparent"
          onClick={onAddCharacter}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {characters.length === 0 && (
          <div className="col-span-3 p-12 text-center">
            <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No characters linked yet</p>
          </div>
        )}
        {characters.map((sc) => {
          const displayName = sc.name || sc.character?.name || "Unknown";
          const avatarImage = sc.character?.avatarImage;
          const isLinked = !!sc.character;
          const isEditing = editingId === sc.id;

          return (
            <Card
              key={sc.id}
              className="rounded-2xl border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-xl">
                    {avatarImage && <AvatarImage src={avatarImage} />}
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                      {displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-7 text-sm rounded-lg bg-secondary border-0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditing();
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={saveEditing}
                        >
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={cancelEditing}
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground truncate">
                          {displayName}
                        </p>
                        <button
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Character Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Character to Story</DialogTitle>
          </DialogHeader>

          {/* Create Story-specific Character */}
          <div className="space-y-2 pb-4 border-b border-border">
            <Label className="text-sm font-medium">
              Create Story Character
            </Label>
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
              <Button
                type="button"
                onClick={onCreateStoryCharacter}
                className="rounded-xl"
                disabled={!newCharacterName.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Link Existing Character */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Link Existing Character
            </Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableCharacters.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  No available characters to link
                </div>
              ) : (
                availableCharacters.map((char) => (
                  <button
                    key={char.id}
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
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {char.description}
                      </p>
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
