"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface StoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const categories = ["All", "Fantasy", "Romance", "Mystery", "Sci-Fi", "Drama"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const statuses = ["All", "Draft", "Published", "Hidden", "Archived"];

export function StoryFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  difficultyFilter,
  onDifficultyChange,
  statusFilter,
  onStatusChange,
}: StoryFiltersProps) {
  return (
    <Card className="mb-6 rounded-2xl border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-secondary border-0 rounded-xl"
            />
          </div>

          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[140px] rounded-xl bg-secondary border-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="rounded-lg">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-[140px] rounded-xl bg-secondary border-0">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {difficulties.map((diff) => (
                <SelectItem key={diff} value={diff} className="rounded-lg">
                  {diff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[130px] rounded-xl bg-secondary border-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {statuses.map((status) => (
                <SelectItem key={status} value={status} className="rounded-lg">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
