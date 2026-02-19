"use client";

import { useRouter } from "next/navigation";
import type { CharacterWithImages } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Smile, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";

interface CharacterGridProps {
  characters: CharacterWithImages[];
  onDelete: (id: number) => void;
}

function getScopeColor(scope: "GLOBAL" | "STORY") {
  return scope === "GLOBAL"
    ? "bg-primary/10 text-primary"
    : "bg-success/10 text-success";
}

function getScopeLabel(scope: "GLOBAL" | "STORY") {
  return scope === "GLOBAL" ? "Global" : "Story";
}

export function CharacterGrid({ characters, onDelete }: CharacterGridProps) {
  const router = useRouter();

  if (characters.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-12 text-center">
          <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No characters found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {characters.map((character) => (
        <Card
          key={character.id}
          className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
          onClick={() => router.push(`/characters/${character.id}`)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 rounded-xl ring-2 ring-primary/10">
                  <AvatarImage src={character.avatarImage ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-lg font-medium">
                    {character.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {character.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getScopeColor(character.scope)
                      )}
                    >
                      {getScopeLabel(character.scope)}
                    </span>
                    <StatusBadge status={character.status} />
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    className="rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/characters/${character.id}`);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(character.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {character.description}
            </p>

            {character.personality && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {character.personality.split(",").map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground"
                  >
                    {trait.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
              <span className="flex items-center gap-1.5">
                <Smile className="w-4 h-4" />
                {character.images?.length ?? 0} expressions
              </span>
              <span>{character.storyLinks?.length ?? 0} stories</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
