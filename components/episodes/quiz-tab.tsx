"use client";

import { useEffect, useState, useCallback } from "react";
import type { QuizBasic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Settings2,
  Save,
  X,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuizType = "SENTENCE_BUILD" | "SENTENCE_CLOZE_BUILD" | "SPEAK_REPEAT";

const quizTypeLabels: Record<QuizType, string> = {
  SENTENCE_BUILD: "문장 조립",
  SENTENCE_CLOZE_BUILD: "빈칸 채우기",
  SPEAK_REPEAT: "따라하기",
};

type LevelValue = "BEGINNER" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "MASTER";

const LEVEL_LABELS: Record<LevelValue, string> = {
  BEGINNER: "Beginner",
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  MASTER: "Master",
};

const ALL_LEVELS: LevelValue[] = [
  "BEGINNER",
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
  "MASTER",
];

interface QuizFormState {
  type: QuizType;
  level: LevelValue;
  questionEnglish: string;
  questionKorean: string;
  description: string;
  dataJson: string;
}

const initialQuizForm = (storyLevel: LevelValue): QuizFormState => ({
  type: "SENTENCE_BUILD",
  level: storyLevel,
  questionEnglish: "",
  questionKorean: "",
  description: "",
  dataJson: "",
});

interface QuizTabProps {
  episodeId: number;
}

export function QuizTab({ episodeId }: QuizTabProps) {
  const [quizzes, setQuizzes] = useState<QuizBasic[]>([]);
  const [storyLevel, setStoryLevel] = useState<LevelValue>("BEGINNER");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizBasic | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quizForm, setQuizForm] = useState<QuizFormState>(() =>
    initialQuizForm("BEGINNER")
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/episodes/${episodeId}/quizzes`);
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes ?? data);
        if (data.storyLevel) setStoryLevel(data.storyLevel);
      }
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const resetForm = () => {
    setQuizForm(initialQuizForm(storyLevel));
    setSelectedQuiz(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (quiz: QuizBasic) => {
    setSelectedQuiz(quiz);
    setQuizForm({
      type: quiz.type,
      level: quiz.level ?? storyLevel,
      questionEnglish: quiz.questionEnglish,
      questionKorean: quiz.questionKorean || "",
      description: quiz.description || "",
      dataJson: quiz.data ? JSON.stringify(quiz.data, null, 2) : "",
    });
    setIsDialogOpen(true);
  };

  const buildPayload = () => {
    return {
      type: quizForm.type,
      level: quizForm.level,
      questionEnglish: quizForm.questionEnglish,
      questionKorean: quizForm.questionKorean || null,
      description: quizForm.description || null,
      data: quizForm.dataJson ? JSON.parse(quizForm.dataJson) : null,
    };
  };

  const handleCreate = async () => {
    try {
      setError(null);
      setSaving(true);
      const payload = buildPayload();
      const res = await fetch(`/api/episodes/${episodeId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      const newQuiz = await res.json();
      setQuizzes((prev) => [...prev, newQuiz]);
      setIsDialogOpen(false);
      resetForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedQuiz) return;
    try {
      setError(null);
      setSaving(true);
      const payload = buildPayload();
      const res = await fetch(
        `/api/episodes/${episodeId}/quizzes/${selectedQuiz.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update quiz");
      const updatedQuiz = await res.json();
      setQuizzes(
        quizzes.map((q) => (q.id === updatedQuiz.id ? updatedQuiz : q))
      );
      setIsDialogOpen(false);
      resetForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (quizId: number) => {
    try {
      setError(null);
      const res = await fetch(`/api/episodes/${episodeId}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete quiz");
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete quiz");
    }
  };

  const isFormValid = quizForm.questionEnglish.trim().length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading quizzes...
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

      {/* Quiz List */}
      <div className="col-span-8">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Quizzes ({quizzes.length})
              </CardTitle>
              <Button
                size="sm"
                className="rounded-xl"
                onClick={openCreateDialog}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        quiz.isActive
                          ? "bg-green-500/10 text-green-600"
                          : "bg-gray-500/10 text-gray-600"
                      )}
                    >
                      {quiz.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {quizTypeLabels[quiz.type]}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        quiz.level === storyLevel
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      )}
                      title={
                        quiz.level === storyLevel ? "Story level" : undefined
                      }
                    >
                      {LEVEL_LABELS[quiz.level]}
                      {quiz.level === storyLevel ? " (Story)" : ""}
                    </span>
                  </div>
                  <p className="font-medium text-foreground line-clamp-2">
                    {quiz.questionEnglish}
                  </p>
                  {quiz.questionKorean && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {quiz.questionKorean}
                    </p>
                  )}
                  {quiz.data && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 rounded-lg bg-violet-500/10 text-violet-600">
                        JSON data 설정됨
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => openEditDialog(quiz)}
                  >
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No quizzes configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quiz Types Info */}
      <div className="col-span-4">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-medium">
                Quiz Types
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm font-medium">문장 조립 (Sentence Build)</p>
              <p className="text-xs text-muted-foreground mt-1">
                단어 카드를 조합하여 문장 완성. tokens, distractors,
                answerTokenIds 등을 data JSON에 설정합니다.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm font-medium">빈칸 채우기 (Cloze Build)</p>
              <p className="text-xs text-muted-foreground mt-1">
                문장 중간 빈칸에 알맞은 단어 선택. parts, choices, answerBySlot
                등을 data JSON에 설정합니다.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm font-medium">따라하기 (Speak Repeat)</p>
              <p className="text-xs text-muted-foreground mt-1">
                음성을 듣고 따라 말하기. audioUrl, promptKorean 등을 data JSON에
                설정합니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                각 유형 모두{" "}
                <span className="font-medium text-foreground">data (JSON)</span>{" "}
                필드를 통해 퀴즈 구조를 정의합니다. questionEnglish는 문제 문장,
                questionKorean은 한국어 힌트입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz ? "Edit Quiz" : "Create Quiz"}
            </DialogTitle>
            <DialogDescription>
              퀴즈 문제와 데이터를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 py-4">
            {/* Quiz Type */}
            <div>
              <Label className="text-sm font-medium">Quiz Type</Label>
              <Select
                value={quizForm.type}
                onValueChange={(val: QuizType) =>
                  setQuizForm({ ...quizForm, type: val })
                }
              >
                <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="SENTENCE_BUILD" className="rounded-lg">
                    문장 조립 (Sentence Build)
                  </SelectItem>
                  <SelectItem
                    value="SENTENCE_CLOZE_BUILD"
                    className="rounded-lg"
                  >
                    빈칸 채우기 (Sentence Cloze Build)
                  </SelectItem>
                  <SelectItem value="SPEAK_REPEAT" className="rounded-lg">
                    따라하기 (Speak Repeat)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level - 5단계 모두 표시, 값 없으면 Story level 따름 */}
            <div>
              <Label className="text-sm font-medium">Level</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                값 없으면 Story level을 따릅니다.
              </p>
              <Select
                value={quizForm.level}
                onValueChange={(val: LevelValue) =>
                  setQuizForm({ ...quizForm, level: val })
                }
              >
                <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ALL_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl} className="rounded-lg">
                      {LEVEL_LABELS[lvl]}
                      {lvl === storyLevel ? " (Story level)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question English */}
            <div>
              <Label className="text-sm font-medium">Question (English)</Label>
              <Textarea
                value={quizForm.questionEnglish}
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    questionEnglish: e.target.value,
                  })
                }
                className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                placeholder="Enter the question in English"
              />
            </div>

            {/* Question Korean */}
            <div>
              <Label className="text-sm font-medium">
                Question (Korean) - Optional
              </Label>
              <Textarea
                value={quizForm.questionKorean}
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    questionKorean: e.target.value,
                  })
                }
                className="mt-2 rounded-xl bg-secondary border-0 min-h-[60px]"
                placeholder="한국어 질문 (선택사항)"
              />
            </div>

            {/* Data JSON */}
            <div>
              <Label className="text-sm font-medium">Quiz Data (JSON)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                {quizForm.type === "SENTENCE_BUILD"
                  ? "tokens, distractors, answerTokenIds 등을 포함한 JSON"
                  : quizForm.type === "SENTENCE_CLOZE_BUILD"
                    ? "parts, choices, answerBySlot 등을 포함한 JSON"
                    : "audioUrl, promptKorean 등 따라하기용 JSON"}
              </p>
              <Textarea
                value={quizForm.dataJson}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, dataJson: e.target.value })
                }
                className="mt-2 rounded-xl bg-secondary border-0 min-h-[200px] font-mono text-sm"
                placeholder={
                  quizForm.type === "SENTENCE_BUILD"
                    ? '{\n  "promptKorean": "...",\n  "tokens": [...],\n  "distractors": [...],\n  "answerTokenIds": [...]\n}'
                    : quizForm.type === "SENTENCE_CLOZE_BUILD"
                      ? '{\n  "promptKorean": "...",\n  "parts": [...],\n  "choices": [...],\n  "answerBySlot": {...}\n}'
                      : '{\n  "audioUrl": "...",\n  "promptKorean": "따라 말해 보세요"\n}'
                }
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium">
                Explanation - Optional
              </Label>
              <Textarea
                value={quizForm.description}
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    description: e.target.value,
                  })
                }
                className="mt-2 rounded-xl bg-secondary border-0 min-h-[60px]"
                placeholder="정답 해설 (선택사항)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={selectedQuiz ? handleUpdate : handleCreate}
              className="rounded-xl"
              disabled={!isFormValid || saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {selectedQuiz ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
