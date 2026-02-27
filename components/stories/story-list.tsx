"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  GripVertical,
} from "lucide-react";
import type { StoryWithRelations } from "@/types";

interface StoryListProps {
  stories: StoryWithRelations[];
}

function getDifficultyLabel(level: number) {
  if (level <= 1) return "Beginner";
  if (level === 2) return "Intermediate";
  return "Advanced";
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-success/10 text-success";
    case "intermediate":
      return "bg-primary/10 text-primary";
    case "advanced":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function StoryList({ stories }: StoryListProps) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 p-4"></th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Story
              </th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Difficulty
              </th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Episodes
              </th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Edited
              </th>
              <th className="w-10 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => {
              const difficultyLabel = story.level;

              return (
                <tr
                  key={story.id}
                  className="border-b border-border/50 hover:bg-secondary/50 transition-colors group"
                >
                  <td className="p-4">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/stories/${story.id}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors">
                        {story.title}
                      </span>
                    </Link>
                  </td>

                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {story.category ?? "-"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        difficultyLabel
                      )}`}
                    >
                      {difficultyLabel}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {story._count?.episodes ?? 0}
                    </span>
                  </td>

                  <td className="p-4">
                    <StatusBadge status={story.status} />
                  </td>

                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(story.updatedAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl h-8 w-8"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="rounded-lg">
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg">
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-destructive">
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stories.length === 0 && (
        <div className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No stories found</p>
        </div>
      )}
    </Card>
  );
}
