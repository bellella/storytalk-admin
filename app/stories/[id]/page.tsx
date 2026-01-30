"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Save,
  Send,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Plus,
  GripVertical,
  Clock,
  Calendar,
  FileText,
  UserCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Episode = {
  id: string;
  title: string;
  order: number;
  isPublished: boolean;
  _count?: {
    scenes: number;
  };
};

type Story = {
  id: string;
  title: string;
  category: string;
  icon: string;
  difficulty: number;
  description: string | null;
  coverImage: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  episodes: Episode[];
};

type StoryCharacter = {
  id: string;
  name: string | null;
  role: string | null;
  character: {
    id: string;
    name: string;
    avatarImage: string;
  } | null;
};

type Character = {
  id: string;
  name: string;
  avatarImage: string;
  description: string;
};

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "episodes", label: "Episodes", icon: FileText },
  { id: "characters", label: "Characters", icon: UserCircle },
];

const categories = [
  "Fantasy",
  "Romance",
  "Mystery",
  "Sci-Fi",
  "Drama",
  "Adventure",
];
const difficulties = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
];

function getDifficultyLabel(level: number) {
  if (level <= 1) return "Beginner";
  if (level === 2) return "Intermediate";
  return "Advanced";
}

function getStatus(isPublished: boolean): "draft" | "published" {
  return isPublished ? "published" : "draft";
}

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [story, setStory] = useState<Story | null>(null);
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch story and characters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storyRes, charactersRes] = await Promise.all([
          fetch(`/api/stories/${storyId}`),
          fetch(`/api/stories/${storyId}/characters`),
        ]);
        if (!storyRes.ok) throw new Error("Failed to fetch story");
        const storyData = await storyRes.json();
        setStory(storyData);
        if (charactersRes.ok) {
          const charactersData = await charactersRes.json();
          setCharacters(charactersData);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [storyId]);

  // Fetch all available characters when dialog opens
  useEffect(() => {
    if (!isCharacterDialogOpen) return;
    const fetchAllCharacters = async () => {
      const res = await fetch("/api/characters");
      if (res.ok) {
        const data = await res.json();
        setAllCharacters(data);
      }
    };
    fetchAllCharacters();
  }, [isCharacterDialogOpen]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    if (!story) return;
    setStory({ ...story, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!story) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          category: story.category,
          icon: story.icon,
          difficulty: story.difficulty,
          description: story.description,
          coverImage: story.coverImage,
          isPublished: story.isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setHasUnsavedChanges(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!story) return;
    try {
      setSaving(true);
      await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: true }),
      });
      setStory({ ...story, isPublished: true });
      setHasUnsavedChanges(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEpisode = async () => {
    if (!story) return;
    try {
      const nextOrder = story.episodes.length + 1;
      const res = await fetch(`/api/stories/${storyId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Episode ${nextOrder}`,
          order: nextOrder,
        }),
      });
      if (!res.ok) throw new Error("Failed to create episode");
      const newEpisode = await res.json();
      setStory({ ...story, episodes: [...story.episodes, newEpisode] });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAddCharacter = () => {
    setIsCharacterDialogOpen(true);
  };

  const handleSelectCharacter = async (characterId: string) => {
    try {
      const res = await fetch(`/api/stories/${storyId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
      });
      if (!res.ok) throw new Error("Failed to add character");
      const newStoryCharacter = await res.json();
      setCharacters([...characters, newStoryCharacter]);
      setIsCharacterDialogOpen(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRemoveCharacter = async (storyCharacterId: string) => {
    if (!confirm("Remove this character from the story?")) return;
    try {
      await fetch(`/api/stories/${storyId}/characters?id=${storyCharacterId}`, {
        method: "DELETE",
      });
      setCharacters(characters.filter((c) => c.id !== storyCharacterId));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreateStoryCharacter = async () => {
    if (!newCharacterName.trim()) return;
    try {
      const res = await fetch(`/api/stories/${storyId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCharacterName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create character");
      const newStoryCharacter = await res.json();
      setCharacters([...characters, newStoryCharacter]);
      setNewCharacterName("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Filter out already added characters
  const availableCharacters = allCharacters.filter(
    (c) => !characters.some((sc) => sc.character?.id === c.id)
  );
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading story...
        </div>
      </AdminLayout>
    );
  }

  if (error || !story) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-destructive">
          Failed to load story: {error || "Not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stories
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              {story.icon || "📖"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {story.title}
                </h1>
                <StatusBadge status={getStatus(story.isPublished)} />
              </div>
              <p className="text-muted-foreground mt-1">
                {story.category} · {getDifficultyLabel(story.difficulty)} ·{" "}
                {story.episodes.length} episodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-warning">Unsaved changes</span>
            )}
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
            {!story.isPublished && (
              <Button
                className="rounded-xl shadow-lg shadow-primary/25"
                onClick={handlePublish}
                disabled={saving}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-secondary/50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">
                  Story Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={story.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-2 rounded-xl bg-secondary border-0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select
                      value={story.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="rounded-lg"
                          >
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <Select
                      value={String(story.difficulty)}
                      onValueChange={(value) =>
                        handleInputChange("difficulty", Number(value))
                      }
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {difficulties.map((diff) => (
                          <SelectItem
                            key={diff.value}
                            value={String(diff.value)}
                            className="rounded-lg"
                          >
                            {diff.label}
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
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
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
                    onChange={(e) => handleInputChange("icon", e.target.value)}
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
                <div>
                  <Label className="text-sm font-medium">Cover Image URL</Label>
                  <Input
                    value={story.coverImage || ""}
                    onChange={(e) =>
                      handleInputChange("coverImage", e.target.value)
                    }
                    placeholder="https://..."
                    className="mt-2 rounded-xl bg-secondary border-0"
                  />
                </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Published
                  </span>
                  <Switch
                    checked={story.isPublished}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPublished", checked)
                    }
                  />
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
                    {story.episodes.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "episodes" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">Drag to reorder episodes</p>
            <Button
              className="rounded-xl shadow-lg shadow-primary/25"
              onClick={handleCreateEpisode}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Episode
            </Button>
          </div>
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/50">
              {story.episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      {episode._count?.scenes ?? 0} scenes
                    </p>
                  </div>
                  <StatusBadge status={getStatus(episode.isPublished)} />
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
                      <DropdownMenuItem className="rounded-lg text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
            {story.episodes.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No episodes yet</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "characters" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              Characters appearing in this story
            </p>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={handleAddCharacter}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {characters.length === 0 && (
              <div className="col-span-3 p-12 text-center">
                <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No characters linked yet
                </p>
              </div>
            )}
            {characters.map((sc) => {
              const displayName = sc.character?.name || sc.name || "Unknown";
              const avatarImage = sc.character?.avatarImage;
              const isLinked = !!sc.character;

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
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sc.role || (isLinked ? "Linked Character" : "Story Character")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveCharacter(sc.id)}
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
          <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Character to Story</DialogTitle>
              </DialogHeader>

              {/* Create Story-specific Character */}
              <div className="space-y-2 pb-4 border-b border-border">
                <Label className="text-sm font-medium">Create Story Character</Label>
                <p className="text-sm text-muted-foreground">
                  Create a character that only exists in this story
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    placeholder="Character name"
                    className="rounded-xl bg-secondary border-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateStoryCharacter();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleCreateStoryCharacter}
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
                <Label className="text-sm font-medium">Link Existing Character</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {availableCharacters.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      No available characters to link
                    </div>
                  ) : (
                    availableCharacters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => handleSelectCharacter(char.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                      >
                        <Avatar className="w-10 h-10 rounded-xl">
                          <AvatarImage src={char.avatarImage} />
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
      )}
    </AdminLayout>
  );
}
