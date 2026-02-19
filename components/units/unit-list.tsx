"use client";

import type { UnitWithStory } from "@/types";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react";

interface UnitListProps {
  units: UnitWithStory[];
  onEdit: (unit: UnitWithStory) => void;
  onDelete: (id: number) => void;
}

export function UnitList({ units, onEdit, onDelete }: UnitListProps) {
  if (units.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <div className="p-12 text-center">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No units found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Order
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Story
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Color
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Status
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Created
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {units.map((unit) => (
            <tr
              key={unit.id}
              className="hover:bg-secondary/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {unit.order}
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-foreground">
                    {unit.story?.title || "No story linked"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: {unit.storyId}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: `rgba(${unit.color}, 1)` }}
                ></div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={unit.status} />
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {new Date(unit.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
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
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() => onEdit(unit)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg text-destructive"
                      onClick={() => onDelete(unit.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
