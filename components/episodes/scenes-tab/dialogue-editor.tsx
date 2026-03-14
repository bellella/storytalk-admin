"use client";

import type { DialogueBasic, StoryCharacterWithCharacter, SceneBasic } from "@/types";
import { DialogueType, DialogueSpeakerRole, DialogueFlowType } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Loader2, MessageSquare, Trash2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { ImageUploader } from "@/components/ui/image-uploader";

const DATA_DIALOGUE_TYPES = [
  DialogueType.CHOICE_SLOT,
  DialogueType.AI_INPUT_SLOT,
  DialogueType.AI_SLOT,
] as const;

type DialogueFormData = {
  characterId?: number;
  characterName?: string;
  type: (typeof DialogueType)[keyof typeof DialogueType];
  flowType: (typeof DialogueFlowType)[keyof typeof DialogueFlowType];
  speakerRole: (typeof DialogueSpeakerRole)[keyof typeof DialogueSpeakerRole];
  englishText: string;
  koreanText: string;
  charImageLabel: string;
  imageUrl: string;
  data: string;
};

const dialogueTypes: {
  value: (typeof DialogueType)[keyof typeof DialogueType];
  label: string;
}[] = [
  { value: DialogueType.DIALOGUE, label: "Dialogue" },
  { value: DialogueType.NARRATION, label: "Narration" },
  { value: DialogueType.IMAGE, label: "Image" },
  { value: DialogueType.HEADING, label: "Heading" },
  { value: DialogueType.CHOICE_SLOT, label: "Choice Slot" },
  { value: DialogueType.AI_INPUT_SLOT, label: "AI Input Slot" },
  { value: DialogueType.AI_SLOT, label: "AI Slot" },
  { value: DialogueType.SPEAKING_MISSION, label: "Speaking Mission" },
];

// ── Structured Data Editors ──────────────────────────────────────────────────

function safeParseJson(value: string): Record<string, unknown> {
  try {
    return (JSON.parse(value) as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}


type ChoiceOption = {
  key: string;
  englishText: string;
  koreanText: string;
  followUpDialogueIds: number[];
  scoreDelta: { sceneId: number; delta: number }[];
};

const DEFAULT_CHOICE_OPTION: ChoiceOption = {
  key: "",
  englishText: "",
  koreanText: "",
  followUpDialogueIds: [],
  scoreDelta: [],
};

function ChoiceSlotEditor({
  value,
  onChange,
  createBranchDialogue,
  scenes = [],
}: {
  value: string;
  onChange: (v: string) => void;
  createBranchDialogue?: (englishText: string, koreanText: string) => Promise<{ id: number } | null>;
  scenes?: SceneBasic[];
}) {
  const [creating, setCreating] = useState<number | null>(null);

  const parsed = safeParseJson(value);
  const options: ChoiceOption[] = Array.isArray(parsed.options)
    ? (parsed.options as ChoiceOption[])
    : [];

  const emit = (newOptions: ChoiceOption[]) =>
    onChange(JSON.stringify({ options: newOptions }));

  const updateOption = (i: number, patch: Partial<ChoiceOption>) => {
    const next = [...options];
    next[i] = { ...next[i], ...patch };
    emit(next);
  };

  const handleCreateBranchDialogue = async (i: number) => {
    if (!createBranchDialogue) return;
    setCreating(i);
    try {
      const newDialogue = await createBranchDialogue(options[i].englishText, options[i].koreanText);
      if (newDialogue) {
        const next = [...options];
        next[i] = {
          ...next[i],
          followUpDialogueIds: [...next[i].followUpDialogueIds, newDialogue.id],
        };
        emit(next);
      }
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Options</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-xs rounded-lg px-2"
          onClick={() => emit([...options, { ...DEFAULT_CHOICE_OPTION }])}
        >
          <Plus className="w-3 h-3 mr-1" /> Add Option
        </Button>
      </div>

      {options.length === 0 && (
        <p className="text-xs text-muted-foreground">No options added</p>
      )}

      {options.map((opt, i) => (
        <div key={i} className="space-y-2 p-2.5 rounded-xl bg-background border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Option {i + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg text-destructive hover:bg-destructive/10"
              onClick={() => emit(options.filter((_, j) => j !== i))}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Key (unique)</Label>
            <Input
              value={opt.key}
              placeholder="unique_option_key"
              onChange={(e) => updateOption(i, { key: e.target.value })}
              className="mt-1 rounded-lg bg-secondary border-0 h-8 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">English</Label>
              <Input
                value={opt.englishText}
                placeholder="English text"
                onChange={(e) => updateOption(i, { englishText: e.target.value })}
                className="mt-1 rounded-lg bg-secondary border-0 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Korean</Label>
              <Input
                value={opt.koreanText}
                placeholder="한국어 텍스트"
                onChange={(e) => updateOption(i, { koreanText: e.target.value })}
                className="mt-1 rounded-lg bg-secondary border-0 h-8 text-sm"
              />
            </div>
          </div>

          {/* followUpDialogueIds */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">Follow-up Dialogue IDs</Label>
              <div className="flex items-center gap-1">
                {createBranchDialogue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 text-xs rounded px-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                    disabled={creating === i}
                    onClick={() => handleCreateBranchDialogue(i)}
                  >
                    {creating === i ? (
                      <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    Branch 생성
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs rounded px-1.5"
                  onClick={() =>
                    updateOption(i, { followUpDialogueIds: [...opt.followUpDialogueIds, 0] })
                  }
                >
                  <Plus className="w-2.5 h-2.5 mr-0.5" /> Add
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {opt.followUpDialogueIds.map((did, di) => (
                <div key={di} className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={did || ""}
                    placeholder="Dialogue ID"
                    onChange={(e) => {
                      const next = [...opt.followUpDialogueIds];
                      next[di] = parseInt(e.target.value) || 0;
                      updateOption(i, { followUpDialogueIds: next });
                    }}
                    className="rounded-lg bg-secondary border-0 h-7 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() =>
                      updateOption(i, {
                        followUpDialogueIds: opt.followUpDialogueIds.filter((_, j) => j !== di),
                      })
                    }
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {opt.followUpDialogueIds.length === 0 && (
                <p className="text-xs text-muted-foreground/60">없음</p>
              )}
            </div>
          </div>

          {/* scoreDelta */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">Score Delta</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 text-xs rounded px-1.5"
                onClick={() =>
                  updateOption(i, {
                    scoreDelta: [...opt.scoreDelta, { sceneId: 0, delta: 0 }],
                  })
                }
              >
                <Plus className="w-2.5 h-2.5 mr-0.5" /> Add
              </Button>
            </div>
            <div className="space-y-1">
              {opt.scoreDelta.map((sd, si) => (
                <div key={si} className="flex items-center gap-1.5">
                  <Select
                    value={String(sd.sceneId || "")}
                    onValueChange={(v) => {
                      const next = [...opt.scoreDelta];
                      next[si] = { ...next[si], sceneId: parseInt(v) || 0 };
                      updateOption(i, { scoreDelta: next });
                    }}
                  >
                    <SelectTrigger className="rounded-lg bg-secondary border-0 h-7 text-xs flex-1">
                      <SelectValue placeholder="Scene" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {scenes.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)} className="rounded-lg text-xs">
                          #{s.id} {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">Δ</span>
                  <Input
                    type="number"
                    value={sd.delta}
                    placeholder="delta"
                    onChange={(e) => {
                      const next = [...opt.scoreDelta];
                      next[si] = { ...next[si], delta: parseInt(e.target.value) || 0 };
                      updateOption(i, { scoreDelta: next });
                    }}
                    className="rounded-lg bg-secondary border-0 h-7 text-xs w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() =>
                      updateOption(i, {
                        scoreDelta: opt.scoreDelta.filter((_, j) => j !== si),
                      })
                    }
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {opt.scoreDelta.length === 0 && (
                <p className="text-xs text-muted-foreground/60">없음</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shared AI fields used by both AI_INPUT_SLOT and AI_SLOT ──────────────────

function AiSharedFields({
  parsed,
  emit,
  characters = [],
}: {
  parsed: Record<string, unknown>;
  emit: (patch: object) => void;
  characters?: StoryCharacterWithCharacter[];
}) {
  const situation = typeof parsed.situation === "string" ? parsed.situation : "";
  const constraints: string[] = Array.isArray(parsed.constraints)
    ? (parsed.constraints as string[])
    : [];
  const partnerCharacterIds: number[] = Array.isArray(parsed.partnerCharacterIds)
    ? (parsed.partnerCharacterIds as number[])
    : [];
  const includeDialogues = parsed.includeDialogues === true;
  const dataTablePrompt = typeof parsed.dataTablePrompt === "string" ? parsed.dataTablePrompt : "";

  return (
    <>
      {/* Situation */}
      <div>
        <Label className="text-xs text-muted-foreground">Situation</Label>
        <Textarea
          value={situation}
          placeholder="씬의 상황 설명..."
          onChange={(e) => emit({ situation: e.target.value })}
          className="mt-1 rounded-xl bg-secondary border-0 min-h-[60px] text-xs"
        />
      </div>

      {/* Constraints */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-muted-foreground">Constraints</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 text-xs rounded-lg px-2"
            onClick={() => emit({ constraints: [...constraints, ""] })}
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {constraints.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Input
                value={c}
                placeholder={`제약조건 ${i + 1}`}
                onChange={(e) => {
                  const next = [...constraints];
                  next[i] = e.target.value;
                  emit({ constraints: next });
                }}
                className="rounded-xl bg-secondary border-0 h-7 text-xs flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => emit({ constraints: constraints.filter((_, j) => j !== i) })}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {constraints.length === 0 && (
            <p className="text-xs text-muted-foreground/60">없음</p>
          )}
        </div>
      </div>

      {/* Partner Character IDs */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-muted-foreground">Partner Characters</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 text-xs rounded-lg px-2"
            onClick={() => emit({ partnerCharacterIds: [...partnerCharacterIds, 0] })}
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {partnerCharacterIds.map((id, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Select
                value={String(id || "")}
                onValueChange={(v) => {
                  const next = [...partnerCharacterIds];
                  next[i] = parseInt(v) || 0;
                  emit({ partnerCharacterIds: next });
                }}
              >
                <SelectTrigger className="rounded-xl bg-secondary border-0 h-7 text-xs flex-1">
                  <SelectValue placeholder="Character" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {characters.map((sc) => (
                    <SelectItem key={sc.character.id} value={String(sc.character.id)} className="rounded-lg text-xs">
                      {sc.character.name} (ID: {sc.character.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => emit({ partnerCharacterIds: partnerCharacterIds.filter((_, j) => j !== i) })}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {partnerCharacterIds.length === 0 && (
            <p className="text-xs text-muted-foreground/60">없음</p>
          )}
        </div>
      </div>

      {/* Include Dialogues */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50">
        <Label className="text-xs text-muted-foreground cursor-pointer">Include Dialogues</Label>
        <button
          type="button"
          role="switch"
          aria-checked={includeDialogues}
          onClick={() => emit({ includeDialogues: !includeDialogues })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            includeDialogues ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              includeDialogues ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Data Table Prompt */}
      <div>
        <Label className="text-xs text-muted-foreground">Data Table Prompt</Label>
        <Textarea
          value={dataTablePrompt}
          placeholder="데이터 테이블 프롬프트..."
          onChange={(e) => emit({ dataTablePrompt: e.target.value })}
          className="mt-1 rounded-xl bg-secondary border-0 min-h-[60px] text-xs"
        />
      </div>
    </>
  );
}

function AiInputSlotEditor({
  value,
  onChange,
  characters = [],
}: {
  value: string;
  onChange: (v: string) => void;
  characters?: StoryCharacterWithCharacter[];
}) {
  const parsed = safeParseJson(value);
  const placeholder = typeof parsed.placeholder === "string" ? parsed.placeholder : "";
  const maxLength = typeof parsed.maxLength === "number" ? parsed.maxLength : 200;

  const emit = (patch: object) => onChange(JSON.stringify({ ...parsed, ...patch }));

  return (
    <div className="space-y-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Placeholder</Label>
          <Input
            value={placeholder}
            placeholder="텍스트를 입력하세요..."
            onChange={(e) => emit({ placeholder: e.target.value })}
            className="mt-1 rounded-xl bg-secondary border-0 h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Max Length</Label>
          <Input
            type="number"
            value={maxLength}
            onChange={(e) => emit({ maxLength: parseInt(e.target.value) || 200 })}
            className="mt-1 rounded-xl bg-secondary border-0 h-8 text-xs"
          />
        </div>
      </div>
      <AiSharedFields parsed={parsed} emit={emit} characters={characters} />
    </div>
  );
}

function AiSlotEditor({
  value,
  onChange,
  characters = [],
}: {
  value: string;
  onChange: (v: string) => void;
  characters?: StoryCharacterWithCharacter[];
}) {
  const parsed = safeParseJson(value);
  const prompt = typeof parsed.prompt === "string" ? parsed.prompt : "";

  const emit = (patch: object) => onChange(JSON.stringify({ ...parsed, ...patch }));

  return (
    <div className="space-y-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
      <div>
        <Label className="text-xs text-muted-foreground">AI Prompt</Label>
        <Textarea
          value={prompt}
          placeholder="AI 프롬프트를 입력하세요..."
          onChange={(e) => emit({ prompt: e.target.value })}
          className="mt-1 rounded-xl bg-secondary border-0 min-h-[80px] text-xs"
        />
      </div>
      <AiSharedFields parsed={parsed} emit={emit} characters={characters} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface DialogueEditorProps {
  dialogue: DialogueBasic | null;
  characters: StoryCharacterWithCharacter[];
  scenes?: SceneBasic[];
  saving: boolean;
  storyId: number;
  episodeId: number;
  sceneId?: number | null;
  onSave: (data: DialogueFormData) => void;
  onDelete?: (dialogue: DialogueBasic) => void;
  onClose: () => void;
  onDialogueCreated?: (dialogue: DialogueBasic) => void;
}

const TYPE_DEFAULT_DATA: Partial<Record<string, object>> = {
  [DialogueType.CHOICE_SLOT]: { options: [] },
  [DialogueType.AI_INPUT_SLOT]: { placeholder: "", maxLength: 200 },
  [DialogueType.AI_SLOT]: { prompt: "" },
};

export function DialogueEditor({
  dialogue,
  characters,
  scenes = [],
  saving,
  storyId,
  episodeId,
  sceneId,
  onSave,
  onDelete,
  onClose,
  onDialogueCreated,
}: DialogueEditorProps) {
  const form = useForm<DialogueFormData>({
    defaultValues: {
      characterId: undefined,
      characterName: "",
      type: DialogueType.DIALOGUE,
      flowType: DialogueFlowType.NORMAL,
      speakerRole: DialogueSpeakerRole.SYSTEM,
      englishText: "",
      koreanText: "",
      charImageLabel: "default",
      imageUrl: "",
      data: "{}",
    },
  });

  // Reset form when dialogue changes
  useEffect(() => {
    if (dialogue) {
      form.reset({
        characterId: dialogue.character?.id ?? dialogue.characterId ?? undefined,
        characterName: dialogue.characterName || "",
        type: dialogue.type ?? DialogueType.DIALOGUE,
        flowType: (dialogue.flowType as (typeof DialogueFlowType)[keyof typeof DialogueFlowType]) ?? DialogueFlowType.NORMAL,
        speakerRole:
          (dialogue.speakerRole as "SYSTEM" | "USER") ?? DialogueSpeakerRole.SYSTEM,
        englishText: dialogue.englishText,
        koreanText: dialogue.koreanText,
        charImageLabel: dialogue.charImageLabel || "default",
        imageUrl: dialogue.imageUrl || "",
        data: dialogue.data ? JSON.stringify(dialogue.data) : "{}",
      });
    }
  }, [dialogue, form]);

  // Initialize default data when type changes to a structured type
  const currentType = form.watch("type");
  useEffect(() => {
    const defaults = TYPE_DEFAULT_DATA[currentType];
    if (!defaults) return;
    const current = safeParseJson(form.getValues("data"));
    // Only set defaults if the current data doesn't match the expected shape
    const keys = Object.keys(defaults);
    const hasValidData = keys.some((k) => k in current);
    if (!hasValidData) {
      form.setValue("data", JSON.stringify(defaults));
    }
  }, [currentType, form]);

  const currentTypeValue = form.watch("type");

  const createBranchDialogue = async (englishText: string, koreanText: string) => {
    if (!sceneId) return null;
    try {
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: DialogueType.DIALOGUE,
            flowType: "BRANCH",
            speakerRole: "USER",
            englishText,
            koreanText,
            charImageLabel: "default",
          }),
        }
      );
      if (!res.ok) return null;
      const created = await res.json() as DialogueBasic;
      onDialogueCreated?.(created);
      return created;
    } catch {
      return null;
    }
  };

  return (
    <div className="col-span-4 min-w-0">
      <Card className="rounded-2xl border-border/50 shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Dialog Editor</CardTitle>
            <div className="flex items-center gap-1">
              {dialogue && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Delete this dialogue?")) onDelete(dialogue);
                  }}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-8 w-8"
                onClick={onClose}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 pt-0">
          {dialogue ? (
            <form onSubmit={form.handleSubmit((data) => onSave(data))}>
              <div className="space-y-4">
                {/* Type + Flow Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(val: DialogueFormData["type"]) =>
                        form.setValue("type", val)
                      }
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {dialogueTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="rounded-lg">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Flow Type</Label>
                    <Select
                      value={form.watch("flowType")}
                      onValueChange={(val: DialogueFormData["flowType"]) =>
                        form.setValue("flowType", val)
                      }
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value={DialogueFlowType.NORMAL} className="rounded-lg">NORMAL</SelectItem>
                        <SelectItem value={DialogueFlowType.BRANCH} className="rounded-lg">
                          <span className="flex items-center gap-1.5">
                            BRANCH
                            <span className="text-[10px] text-rose-500">(선택 종속)</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Speaker Role */}
                <div>
                  <Label className="text-sm font-medium">Speaker Role</Label>
                  <Select
                    value={form.watch("speakerRole") ?? DialogueSpeakerRole.SYSTEM}
                    onValueChange={(val: DialogueFormData["speakerRole"]) => {
                      form.setValue("speakerRole", val);
                      if (val === DialogueSpeakerRole.USER) {
                        form.setValue("characterId", undefined);
                        form.setValue("characterName", "");
                      }
                    }}
                  >
                    <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={DialogueSpeakerRole.SYSTEM} className="rounded-lg">
                        SYSTEM
                      </SelectItem>
                      <SelectItem value={DialogueSpeakerRole.USER} className="rounded-lg">
                        USER
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Character - for dialogue, ai_input_slot, ai_slot (hide when USER) */}
                {(currentTypeValue === DialogueType.DIALOGUE ||
                  currentTypeValue === DialogueType.AI_INPUT_SLOT ||
                  currentTypeValue === DialogueType.AI_SLOT) &&
                  (form.watch("speakerRole") ?? DialogueSpeakerRole.SYSTEM) !==
                    DialogueSpeakerRole.USER && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Character</Label>
                    <Select
                      value={form.watch("characterId")?.toString() || ""}
                      onValueChange={(val) => {
                        const id = parseInt(val);
                        const sc = characters.find((c) => c.character.id === id);
                        form.setValue("characterId", id);
                        form.setValue(
                          "characterName",
                          sc?.name ?? sc?.character.name ?? ""
                        );
                      }}
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue placeholder="Select character" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {characters.map((sc) => (
                          <SelectItem
                            key={sc.character.id}
                            value={sc.character.id.toString()}
                            className="rounded-lg"
                          >
                            {sc.character.name} (ID: {sc.character.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Character Name (display)
                      </Label>
                      <Input
                        {...form.register("characterName")}
                        className="mt-1 rounded-xl bg-secondary border-0"
                        placeholder="Auto-filled when character selected"
                      />
                    </div>
                  </div>
                )}

                {/* Structured Data Editors */}
                {DATA_DIALOGUE_TYPES.includes(
                  currentTypeValue as (typeof DATA_DIALOGUE_TYPES)[number]
                ) && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {currentTypeValue === DialogueType.CHOICE_SLOT
                        ? "Choice Slot 옵션"
                        : currentTypeValue === DialogueType.AI_INPUT_SLOT
                          ? "Input 설정"
                          : "AI Slot 설정"}
                    </Label>
                    <Controller
                      name="data"
                      control={form.control}
                      render={({ field }) => {
                        if (currentTypeValue === DialogueType.CHOICE_SLOT) {
                          return (
                            <ChoiceSlotEditor
                              value={field.value}
                              onChange={field.onChange}
                              createBranchDialogue={sceneId ? createBranchDialogue : undefined}
                              scenes={scenes}
                            />
                          );
                        }
                        if (currentTypeValue === DialogueType.AI_INPUT_SLOT) {
                          return (
                            <AiInputSlotEditor
                              value={field.value}
                              onChange={field.onChange}
                              characters={characters}
                            />
                          );
                        }
                        if (currentTypeValue === DialogueType.AI_SLOT) {
                          return (
                            <AiSlotEditor value={field.value} onChange={field.onChange} characters={characters} />
                          );
                        }
                        return <></>;
                      }}
                    />
                  </div>
                )}

                {/* Image - only for IMAGE type */}
                {currentTypeValue === DialogueType.IMAGE && (
                  <div>
                    <Label className="text-sm font-medium">Image</Label>
                    <div className="mt-2">
                      <ImageUploader
                        value={form.watch("imageUrl")}
                        onChange={(url) => form.setValue("imageUrl", url)}
                        aspectRatio="video"
                        maxSizeMB={10}
                      />
                    </div>
                  </div>
                )}

                {/* Text fields */}
                <div>
                  <Label className="text-sm font-medium">English Text</Label>
                  <Controller
                    name="englishText"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Korean Translation</Label>
                  <Controller
                    name="koreanText"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                      />
                    )}
                  />
                </div>

                {/* Character Image Label */}
                {(currentTypeValue === DialogueType.DIALOGUE ||
                  currentTypeValue === DialogueType.AI_INPUT_SLOT ||
                  currentTypeValue === DialogueType.AI_SLOT) && (
                  <div>
                    <Label className="text-sm font-medium">Character Image Label</Label>
                    <Input
                      {...form.register("charImageLabel")}
                      className="mt-2 rounded-xl bg-secondary border-0"
                      placeholder="default"
                    />
                  </div>
                )}

                {/* Voice Audio - hidden for text-only types */}
                {currentTypeValue !== DialogueType.IMAGE &&
                  currentTypeValue !== DialogueType.HEADING &&
                  currentTypeValue !== DialogueType.CHOICE_SLOT && (
                    <div>
                      <Label className="text-sm font-medium">Voice Audio (Optional)</Label>
                      <div className="mt-2 h-20 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                        <div className="text-center">
                          <MessageSquare className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground">Upload audio</span>
                        </div>
                      </div>
                    </div>
                  )}

                <Button type="submit" className="w-full rounded-xl" disabled={saving}>
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
  );
}
