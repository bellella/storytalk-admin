"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useStories } from "@/hooks/use-stories";
import { StoryFilters } from "@/components/stories/story-filters";
import { StoryList } from "@/components/stories/story-list";

export default function StoriesPage() {
  const { data: stories = [], isLoading, error } = useStories();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch = story.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || story.category === categoryFilter;

      const matchesDifficulty =
        difficultyFilter === "All" ||
        story.level === difficultyFilter.toUpperCase();

      const matchesStatus =
        statusFilter === "All" || story.status === statusFilter.toUpperCase();

      return (
        matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
      );
    });
  }, [stories, searchQuery, categoryFilter, difficultyFilter, statusFilter]);

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

      <StoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading stories...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          Failed to load stories: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && <StoryList stories={filteredStories} />}
    </AdminLayout>
  );
}
