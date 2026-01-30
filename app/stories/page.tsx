"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  BookOpen,
  GripVertical,
  Loader2,
} from "lucide-react";

////////////////////
// Types
////////////////////

type StoryStatus = "draft" | "published";

type Story = {
  id: string;
  title: string;
  category: string | null;
  difficulty: number;
  isPublished: boolean;
  updatedAt: string;
  _count?: {
    episodes: number;
  };
};

function getStatus(isPublished: boolean): StoryStatus {
  return isPublished ? "published" : "draft";
}

////////////////////
// UI helpers
////////////////////

const categories = ["All", "Fantasy", "Romance", "Mystery", "Sci-Fi", "Drama"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const statuses = ["All", "Draft", "Published"];

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

////////////////////
// Page
////////////////////

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  ////////////////////
  // Fetch stories
  ////////////////////

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stories", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch stories");
        const data = await res.json();
        setStories(data);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  ////////////////////
  // Filtering
  ////////////////////

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch = story.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || story.category === categoryFilter;

      const difficultyLabel = getDifficultyLabel(story.difficulty);
      const matchesDifficulty =
        difficultyFilter === "All" || difficultyLabel === difficultyFilter;

      const status = getStatus(story.isPublished);
      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      return (
        matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
      );
    });
  }, [stories, searchQuery, categoryFilter, difficultyFilter, statusFilter]);

  ////////////////////
  // Render
  ////////////////////

  return (
    <AdminLayout>
      <PageHeader
        title="Stories"
        description="Manage your story content library"
      >
        <Link href="/stories/create">
          <Button className="rounded-xl shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" />
            Create Story
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0 rounded-xl"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] rounded-xl bg-secondary border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {statuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="rounded-lg"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading stories...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="py-12 text-center text-destructive">
          Failed to load stories: {error}
        </div>
      )}

      {/* Stories Table */}
      {!loading && !error && (
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
                {filteredStories.map((story) => {
                  const difficultyLabel = getDifficultyLabel(story.difficulty);

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
                        <StatusBadge status={getStatus(story.isPublished)} />
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
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl"
                          >
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

          {filteredStories.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No stories found</p>
            </div>
          )}
        </Card>
      )}
    </AdminLayout>
  );
}
