"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  FileText,
  Gift,
  MessageSquare,
  X,
  ChevronRight,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Settings2,
  Upload,
} from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Scene = {
  id: string;
  title: string;
  koreanTitle: string | null;
  bgImageUrl: string | null;
  order: number;
  dialogues?: Dialogue[];
};

type Dialogue = {
  id: string;
  order: number;
  type: "dialogue" | "narration" | "image";
  englishText: string;
  koreanText: string;
  charImageLabel: string | null;
  imageUrl: string | null;
  characterName?: string;
  character: {
    id: string;
    name: string;
  };
  expression?: {
    id: string;
    label: string;
  } | null;
};

type Episode = {
  id: string;
  title: string;
  order: number;
  description: string | null;
  isPublished: boolean;
  scenes: Scene[];
  rewards: any[];
};

type Character = {
  id: string;
  name: string;
  avatarImage: string;
};

type DialogueFormData = {
  characterId?: string;
  characterName?: string;
  type: "dialogue" | "narration" | "image";
  englishText: string;
  koreanText: string;
  charImageLabel: string;
  imageUrl: string;
};

type SceneFormData = {
  title: string;
  koreanTitle: string;
  bgImageUrl: string;
};

const tabs = [
  { id: "scenes", label: "Scenes", icon: FileText },
  { id: "rewards", label: "Rewards", icon: Gift },
];

const dialogueTypes = [
  { value: "dialogue", label: "Dialogue" },
  { value: "narration", label: "Narration" },
  { value: "image", label: "Image" },
];

function getStatus(isPublished: boolean): "draft" | "published" {
  return isPublished ? "published" : "draft";
}

export default function EpisodeDetailPage() {
  const params = useParams();
  const storyId = params.id as string;
  const episodeId = params.episodeId as string;

  const [activeTab, setActiveTab] = useState("scenes");
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);

  const dialogueForm = useForm<DialogueFormData>({
    defaultValues: {
      characterId: "",
      characterName: "",
      type: "dialogue",
      englishText: "",
      koreanText: "",
      charImageLabel: "neutral",
      imageUrl: "",
    },
  });

  const sceneForm = useForm<SceneFormData>({
    defaultValues: {
      title: "",
      koreanTitle: "",
      bgImageUrl: "",
    },
  });

  // Fetch episode and characters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [episodeRes, charactersRes] = await Promise.all([
          fetch(`/api/stories/${storyId}/episodes/${episodeId}`),
          fetch(`/api/stories/${storyId}/characters`),
        ]);
        if (!episodeRes.ok) throw new Error("Failed to fetch episode");
        const episodeData = await episodeRes.json();
        setEpisode(episodeData);
        if (episodeData.scenes?.length > 0) {
          setSelectedScene(episodeData.scenes[0]);
        }
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
  }, [storyId, episodeId]);

  // Fetch dialogues when scene changes
  useEffect(() => {
    if (!selectedScene) return;
    const fetchDialogues = async () => {
      try {
        const res = await fetch(
          `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`
        );
        if (!res.ok) throw new Error("Failed to fetch dialogues");
        const data = await res.json();
        console.log(data, "data");
        setDialogues(data);
        if (data.length > 0) {
          setSelectedDialogue(data[0]);
        } else {
          setSelectedDialogue(null);
        }
      } catch (e: any) {
        console.error(e);
      }
    };
    fetchDialogues();
  }, [selectedScene, storyId, episodeId]);

  // Update scene form when scene changes
  useEffect(() => {
    if (selectedScene) {
      sceneForm.reset({
        title: selectedScene.title,
        koreanTitle: selectedScene.koreanTitle || "",
        bgImageUrl: selectedScene.bgImageUrl || "",
      });
    }
  }, [selectedScene, sceneForm]);

  // Update form when dialogue changes
  useEffect(() => {
    if (selectedDialogue) {
      dialogueForm.reset({
        characterId: selectedDialogue.character?.id,
        characterName: selectedDialogue.characterName,
        type: selectedDialogue.type || "dialogue",
        englishText: selectedDialogue.englishText,
        koreanText: selectedDialogue.koreanText,
        charImageLabel: selectedDialogue.charImageLabel || "neutral",
        imageUrl: selectedDialogue.imageUrl || "",
      });
    }
  }, [selectedDialogue, dialogueForm]);

  const handleSaveEpisode = async () => {
    if (!episode) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/stories/${storyId}/episodes/${episodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: episode.title,
          description: episode.description,
          isPublished: episode.isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateScene = async () => {
    if (!episode) return;
    try {
      const nextOrder = episode.scenes.length + 1;
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Scene ${nextOrder}`,
            order: nextOrder,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create scene");
      const newScene = await res.json();
      setEpisode({ ...episode, scenes: [...episode.scenes, newScene] });
      setSelectedScene(newScene);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSaveScene = async (data: SceneFormData) => {
    if (!selectedScene || !episode) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            koreanTitle: data.koreanTitle || null,
            bgImageUrl: data.bgImageUrl || null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save scene");
      const updated = await res.json();
      setEpisode({
        ...episode,
        scenes: episode.scenes.map((s) =>
          s.id === updated.id ? { ...s, ...updated } : s
        ),
      });
      setSelectedScene({ ...selectedScene, ...updated });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDialogue = async (data: DialogueFormData) => {
    if (!selectedDialogue || !selectedScene) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues/${selectedDialogue.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId: data.characterId,
            characterName: data.characterName,
            type: data.type,
            englishText: data.englishText,
            koreanText: data.koreanText,
            charImageLabel: data.charImageLabel,
            imageUrl: data.type === "image" ? data.imageUrl : null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save dialogue");
      const updated = await res.json();
      setDialogues(
        dialogues.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDialogueInScene = async () => {
    if (!selectedScene) return;
    try {
      const nextOrder = (dialogues.length ?? 0) + 1;
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: nextOrder,
            englishText: "",
            koreanText: "",
            charImageLabel: "neutral",
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create dialogue");
      const newDialogue = await res.json();
      // Refetch dialogues to get character info
      const dialoguesRes = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`
      );
      if (dialoguesRes.ok) {
        const updatedDialogues = await dialoguesRes.json();
        setDialogues(updatedDialogues);
        setSelectedDialogue(
          updatedDialogues.find((d: Dialogue) => d.id === newDialogue.id) ||
            newDialogue
        );
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      setError("JSON을 입력해주세요");
      return;
    }

    try {
      setImporting(true);
      setError(null);

      // Parse JSON
      const importData = JSON.parse(importJson);

      // Validate structure
      if (!importData.characterMap || !importData.scenes) {
        throw new Error(
          "Invalid JSON structure. characterMap and scenes are required."
        );
      }

      // Call import API
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(importData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      const result = await res.json();

      // Reload episode data
      const episodeRes = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}`
      );
      if (episodeRes.ok) {
        const episodeData = await episodeRes.json();
        setEpisode(episodeData);
        if (episodeData.scenes?.length > 0) {
          const firstScene = episodeData.scenes[0];
          setSelectedScene(firstScene);
          // Reload dialogues for the first scene
          const dialoguesRes = await fetch(
            `/api/stories/${storyId}/episodes/${episodeId}/scenes/${firstScene.id}/dialogues`
          );
          if (dialoguesRes.ok) {
            const dialoguesData = await dialoguesRes.json();
            setDialogues(dialoguesData);
            if (dialoguesData.length > 0) {
              setSelectedDialogue(dialoguesData[0]);
            } else {
              setSelectedDialogue(null);
            }
          }
        } else {
          setSelectedScene(null);
          setDialogues([]);
          setSelectedDialogue(null);
        }
      }

      // Close dialog and clear input
      setIsImportDialogOpen(false);
      setImportJson("");
      setError(null);
    } catch (e: any) {
      setError(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading episode...
        </div>
      </AdminLayout>
    );
  }

  if (error || !episode) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-destructive">
          Failed to load episode: {error || "Not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/stories/${storyId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Story
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {episode.order}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Input
                  value={episode.title}
                  onChange={(e) =>
                    setEpisode({ ...episode, title: e.target.value })
                  }
                  className="text-2xl font-semibold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <StatusBadge status={getStatus(episode.isPublished)} />
              </div>
              <p className="text-muted-foreground mt-1">
                Episode {episode.order} · {episode.scenes.length} scenes ·{" "}
                {dialogues.length} dialogs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={isImportDialogOpen}
              onOpenChange={setIsImportDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setImportJson("");
                    setError(null);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Import Episode Data</DialogTitle>
                  <DialogDescription>
                    JSON 형식의 episode 데이터를 붙여넣어주세요. 기존 scenes와
                    dialogues는 모두 삭제되고 새로 생성됩니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-auto">
                  <div className="space-y-2">
                    <Label>JSON Data</Label>
                    <Textarea
                      value={importJson}
                      onChange={(e) => {
                        setImportJson(e.target.value);
                        setError(null);
                      }}
                      placeholder='{"characterMap": {...}, "scenes": [...]}'
                      className="font-mono text-sm min-h-[400px]"
                    />
                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsImportDialogOpen(false)}
                    disabled={importing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing || !importJson.trim()}
                    className="rounded-xl"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className="rounded-xl shadow-lg shadow-primary/25"
              onClick={handleSaveEpisode}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Episode
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={() => setError(null)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

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

      {/* Scenes Tab - Three Panel Layout */}
      {activeTab === "scenes" && (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Left Panel - Scenes List & Settings */}
          <div className="col-span-3 flex flex-col gap-4 h-full">
            {/* Scenes List */}
            <Card className="rounded-2xl border-border/50 shadow-sm flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Scenes
                  </CardTitle>
                  <Button
                    size="sm"
                    className="rounded-xl h-8"
                    onClick={handleCreateScene}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-2 p-3 pt-0">
                {episode.scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedScene?.id === scene.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <GripVertical
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        selectedScene?.id === scene.id
                          ? "text-primary-foreground/50"
                          : "text-muted-foreground/50"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {scene.title}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          selectedScene?.id === scene.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {scene.order}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4",
                        selectedScene?.id === scene.id
                          ? "text-primary-foreground/50"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
                {episode.scenes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No scenes yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scene Settings */}
            {selectedScene && (
              <Card className="rounded-2xl border-border/50 shadow-sm flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <CardTitle className="text-base font-medium">
                      Scene Settings
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-3 pt-0">
                  <form onSubmit={sceneForm.handleSubmit(handleSaveScene)}>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium">Title</Label>
                        <Input
                          {...sceneForm.register("title")}
                          className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm"
                          placeholder="Scene title"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">
                          Korean Title
                        </Label>
                        <Input
                          {...sceneForm.register("koreanTitle")}
                          className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm"
                          placeholder="한글 제목"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">
                          Background Image
                        </Label>
                        <ImageUploader
                          value={sceneForm.watch("bgImageUrl")}
                          onChange={(url) =>
                            sceneForm.setValue("bgImageUrl", url)
                          }
                          aspectRatio="video"
                          maxSizeMB={10}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full rounded-xl h-8"
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3 mr-1" />
                        )}
                        Save Scene
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Panel - Dialog Timeline */}
          <div className="col-span-5">
            <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Dialog Timeline
                  </CardTitle>
                  <Button
                    size="sm"
                    className="rounded-xl h-8"
                    onClick={handleCreateDialogueInScene}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Dialog
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-3 p-3 pt-0">
                {dialogues.map((dialogue) => (
                  <button
                    key={dialogue.id}
                    onClick={() => setSelectedDialogue(dialogue)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedDialogue?.id === dialogue.id
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "hover:bg-secondary"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-1 flex-shrink-0" />
                    {dialogue.type === "image" ? (
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ) : dialogue.type === "narration" ? (
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm">
                          {dialogue.characterName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {dialogue.type === "image"
                            ? "Image"
                            : dialogue.type === "narration"
                            ? "Narration"
                            : dialogue.characterName}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            dialogue.type === "dialogue"
                              ? "bg-primary/10 text-primary"
                              : dialogue.type === "narration"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-violet-500/10 text-violet-600"
                          )}
                        >
                          {dialogue.type}
                        </span>
                        {dialogue.type === "dialogue" &&
                          dialogue.charImageLabel && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                              {dialogue.charImageLabel}
                            </span>
                          )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dialogue.type === "image"
                          ? dialogue.imageUrl
                            ? "Image attached"
                            : "No image"
                          : dialogue.englishText || "(empty)"}
                      </p>
                    </div>
                  </button>
                ))}
                {dialogues.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No dialogues in this scene
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Dialog Editor */}
          <div className="col-span-4">
            <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Dialog Editor
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8"
                    onClick={() => setSelectedDialogue(null)}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-4 p-4 pt-0">
                {selectedDialogue ? (
                  <form
                    onSubmit={dialogueForm.handleSubmit(handleSaveDialogue)}
                  >
                    <div className="space-y-4">
                      {/* Type Selection */}
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <Select
                          value={dialogueForm.watch("type")}
                          onValueChange={(
                            val: "dialogue" | "narration" | "image"
                          ) => dialogueForm.setValue("type", val)}
                        >
                          <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {dialogueTypes.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="rounded-lg"
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Character - only for dialogue type */}
                      {dialogueForm.watch("type") === "dialogue" && (
                        <div>
                          <Label className="text-sm font-medium">
                            Character
                          </Label>
                          <Select
                            value={dialogueForm.watch("characterName") || ""}
                            onValueChange={(val) => {
                              // Find character by name and set both characterId and characterName
                              const selectedChar = characters.find(
                                (char) => char.name === val
                              );
                              dialogueForm.setValue("characterName", val);
                              dialogueForm.setValue(
                                "characterId",
                                selectedChar?.id || ""
                              );
                            }}
                          >
                            <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                              <SelectValue placeholder="Select character" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {characters.map((char) => (
                                <SelectItem
                                  key={char.id}
                                  value={char.name}
                                  className="rounded-lg"
                                >
                                  {char.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Image URL - only for image type */}
                      {dialogueForm.watch("type") === "image" && (
                        <div>
                          <Label className="text-sm font-medium">Image</Label>
                          <div className="mt-2">
                            <ImageUploader
                              value={dialogueForm.watch("imageUrl")}
                              onChange={(url) =>
                                dialogueForm.setValue("imageUrl", url)
                              }
                              aspectRatio="video"
                              maxSizeMB={10}
                            />
                          </div>
                        </div>
                      )}

                      {/* Text fields - for dialogue and narration */}
                      {dialogueForm.watch("type") !== "image" && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">
                              English Text
                            </Label>
                            <Textarea
                              {...dialogueForm.register("englishText")}
                              className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              Korean Translation
                            </Label>
                            <Textarea
                              {...dialogueForm.register("koreanText")}
                              className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                            />
                          </div>
                        </>
                      )}

                      {/* Image Label - only for dialogue type */}
                      {dialogueForm.watch("type") === "dialogue" && (
                        <div>
                          <Label className="text-sm font-medium">
                            Character Image Label
                          </Label>
                          <Input
                            {...dialogueForm.register("charImageLabel")}
                            className="mt-2 rounded-xl bg-secondary border-0"
                            placeholder="Enter character image label"
                          />
                        </div>
                      )}

                      {/* Voice Audio - for dialogue and narration */}
                      {dialogueForm.watch("type") !== "image" && (
                        <div>
                          <Label className="text-sm font-medium">
                            Voice Audio (Optional)
                          </Label>
                          <div className="mt-2 h-20 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                            <div className="text-center">
                              <MessageSquare className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                              <span className="text-xs text-muted-foreground">
                                Upload audio
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full rounded-xl"
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a dialogue to edit
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="max-w-2xl">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Episode Rewards
                </CardTitle>
                <Button size="sm" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {episode.rewards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No rewards configured
                </div>
              )}
              {episode.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{reward.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {JSON.stringify(reward.payload)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
