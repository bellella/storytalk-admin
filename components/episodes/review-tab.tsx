"use client";

import { useEffect, useState, useCallback } from "react";
import type { ReviewItemBasic, SceneBasic, DialogueBasic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  Loader2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewTabProps {
  episodeId: number;
  storyId: number;
  scenes: SceneBasic[];
}

export function ReviewTab({ episodeId, storyId, scenes }: ReviewTabProps) {
  const [reviewItems, setReviewItems] = useState<ReviewItemBasic[]>([]);
  const [allDialogues, setAllDialogues] = useState<DialogueBasic[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewRes, dialoguesRes] = await Promise.all([
        fetch(`/api/episodes/${episodeId}/review-items`),
        Promise.all(
          (scenes || []).map((scene) =>
            fetch(
              `/api/stories/${storyId}/episodes/${episodeId}/scenes/${scene.id}/dialogues`
            ).then((res) => res.json())
          )
        ),
      ]);
      if (reviewRes.ok) {
        setReviewItems(await reviewRes.json());
      }
      setAllDialogues(dialoguesRes.flat());
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [episodeId, storyId, scenes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddReviewItem = async (dialogueId: number) => {
    try {
      setError(null);
      const res = await fetch(`/api/episodes/${episodeId}/review-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dialogueId }),
      });
      if (!res.ok) throw new Error("Failed to add review item");
      // Refetch to get dialogue details
      const refreshRes = await fetch(
        `/api/episodes/${episodeId}/review-items`
      );
      if (refreshRes.ok) {
        setReviewItems(await refreshRes.json());
      }
      setIsAddDialogOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add review item");
    }
  };

  const handleDeleteReviewItem = async (reviewItemId: number) => {
    try {
      setError(null);
      const res = await fetch(
        `/api/episodes/${episodeId}/review-items/${reviewItemId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete review item");
      setReviewItems(reviewItems.filter((item) => item.id !== reviewItemId));
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to delete review item"
      );
    }
  };

  const handleUpdateDescription = async (reviewItemId: number) => {
    try {
      setError(null);
      const res = await fetch(
        `/api/episodes/${episodeId}/review-items/${reviewItemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: editingDescription }),
        }
      );
      if (!res.ok) throw new Error("Failed to update review item");
      setReviewItems(
        reviewItems.map((item) =>
          item.id === reviewItemId
            ? { ...item, description: editingDescription }
            : item
        )
      );
      setEditingItemId(null);
      setEditingDescription("");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to update review item"
      );
    }
  };

  const startEditing = (item: ReviewItemBasic) => {
    setEditingItemId(item.id);
    setEditingDescription(item.description || "");
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingDescription("");
  };

  const availableDialogues = allDialogues.filter(
    (d) => !reviewItems.some((r) => r.dialogueId === d.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading review items...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Error */}
      {error && (
        <div className="col-span-12 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            <span className="text-sm">{error}</span>
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

      {/* Review Items List */}
      <div className="col-span-8">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Review Items ({reviewItems.length})
              </CardTitle>
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Review Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add Review Item</DialogTitle>
                    <DialogDescription>
                      복습할 대사를 선택하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto space-y-2 py-4">
                    {availableDialogues.map((dialogue) => (
                      <button
                        key={dialogue.id}
                        onClick={() => handleAddReviewItem(dialogue.id)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl text-left hover:bg-secondary transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {dialogue.englishText}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {dialogue.koreanText}
                          </p>
                          {dialogue.characterName && (
                            <p className="text-xs text-primary mt-0.5">
                              {dialogue.characterName}
                            </p>
                          )}
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      </button>
                    ))}
                    {availableDialogues.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        추가할 대사가 없습니다.
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground line-clamp-2">
                    {item.dialogue?.englishText}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {item.dialogue?.koreanText}
                  </p>
                  {editingItemId === item.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        value={editingDescription}
                        onChange={(e) =>
                          setEditingDescription(e.target.value)
                        }
                        className="text-xs rounded-lg bg-background h-8"
                        placeholder="설명을 입력하세요"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-8 rounded-lg"
                        onClick={() => handleUpdateDescription(item.id)}
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg"
                        onClick={cancelEditing}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      {item.description ? (
                        <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          설명 없음
                        </p>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-lg"
                        onClick={() => startEditing(item)}
                      >
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                  {item.dialogue?.scene && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Scene: {item.dialogue.scene.title}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl flex-shrink-0"
                  onClick={() => handleDeleteReviewItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            {reviewItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No review items configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Info */}
      <div className="col-span-4">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-medium">
                Review Info
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                Review Items은 에피소드 완료 후 사용자가 복습할
                대사들입니다. 중요한 표현이나 문장을 선택해주세요.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-medium">{reviewItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Available Dialogues
                </span>
                <span className="font-medium">{allDialogues.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
