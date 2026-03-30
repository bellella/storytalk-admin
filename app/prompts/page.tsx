"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  type PromptTemplateBasic,
  type CreatePromptInput,
  type PromptVariable,
} from "@/hooks/use-prompts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PromptType } from "@/src/generated/prisma/enums";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type AiSlotDialogue = {
  id: number;
  type: "AI_INPUT_SLOT" | "AI_SLOT";
  order: number;
  englishText: string;
  koreanText: string;
  data: Record<string, unknown> | null;
  scene: {
    id: number;
    title: string;
    order: number;
    episode: {
      id: number;
      title: string;
      order: number;
      storyId: number | null;
      story: { id: number; title: string } | null;
    };
  };
};

// ─────────────────────────────────────────────
// Prompt Templates constants
// ─────────────────────────────────────────────

const VARIABLE_TYPES = ["string", "number", "boolean"] as const;

const PROMPT_TYPES: PromptType[] = [
  "EVALUATION",
  "QUIZ",
  "AI_SLOT",
  "AI_INPUT_SLOT",
  "CHAT",
  "OTHER",
];

const TYPE_COLORS: Record<PromptType, string> = {
  EVALUATION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  QUIZ: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  AI_SLOT: "bg-green-500/10 text-green-400 border-green-500/20",
  AI_INPUT_SLOT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CHAT: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  OTHER: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const EMPTY_FORM: CreatePromptInput = {
  key: "",
  name: "",
  type: "OTHER",
  description: "",
  content: "",
  variables: [],
  version: 1,
  isActive: true,
};

type PromptFormValues = CreatePromptInput & { id?: number };

// ─────────────────────────────────────────────
// Prompt Form Dialog
// ─────────────────────────────────────────────

function PromptFormDialog({
  open,
  initial,
  onClose,
  onSave,
  isSaving,
}: {
  open: boolean;
  initial: CreatePromptInput & { id?: number };
  onClose: () => void;
  onSave: (data: CreatePromptInput & { id?: number }) => void;
  isSaving: boolean;
}) {
  const form = useForm<PromptFormValues>({ defaultValues: initial });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variables" });

  useEffect(() => {
    if (open) form.reset({ ...initial, variables: initial.variables ?? [] });
  }, [open, initial.id, initial.key]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <DialogTitle>{initial.id ? "Edit Prompt" : "New Prompt"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSave)}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto px-6">
            <div className="space-y-4 py-2 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Key (unique)</Label>
                  <Input {...form.register("key", { required: true })} placeholder="e.g. eval_roleplay_v1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input {...form.register("name", { required: true })} placeholder="Human-readable name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROMPT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Version</Label>
                  <Input type="number" min={1} {...form.register("version", { valueAsNumber: true, min: 1 })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input {...form.register("description")} placeholder="Optional description" />
              </div>

              <div className="space-y-1.5">
                <Label>Content</Label>
                <Textarea
                  {...form.register("content", { required: true })}
                  placeholder="Prompt content..."
                  className="font-mono text-xs min-h-[240px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Variables</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", required: true, type: "string" })}>
                    <Plus className="w-3.5 h-3.5 mr-1" />Add
                  </Button>
                </div>
                <div className="space-y-2 rounded-lg border border-border/50 p-3 bg-secondary/30">
                  {fields.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No variables.</p>
                  ) : (
                    fields.map((field, i) => (
                      <div key={field.id} className="flex items-center gap-2 flex-wrap">
                        <Input {...form.register(`variables.${i}.key`, { required: true })} placeholder="key" className="flex-1 min-w-[100px] h-8 text-sm" />
                        <Controller
                          name={`variables.${i}.type`}
                          control={form.control}
                          render={({ field: f }) => (
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {VARIABLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <label className="flex items-center gap-1.5 text-xs">
                          <input type="checkbox" {...form.register(`variables.${i}.required`)} className="rounded" />
                          required
                        </label>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(i)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />}
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving || !form.watch("key") || !form.watch("name") || !form.watch("content")}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Prompt Row
// ─────────────────────────────────────────────

function PromptRow({
  prompt,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  prompt: PromptTemplateBasic;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[prompt.type]}`}>
          {prompt.type}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground font-medium">{prompt.key}</span>
            <span className="text-muted-foreground text-xs">v{prompt.version}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{prompt.name}</p>
        </div>
        {prompt.description && (
          <p className="text-xs text-muted-foreground hidden md:block max-w-xs truncate">{prompt.description}</p>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Switch checked={prompt.isActive} onCheckedChange={onToggleActive} className="scale-90" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-4">
          {prompt.variables && prompt.variables.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Variables</span>
              <div className="flex flex-wrap gap-2 mb-3">
                {prompt.variables.map((v, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-mono">
                    {v.key}<span className="text-muted-foreground ml-1">({v.type}{v.required ? ", required" : ""})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content</span>
              <button onClick={() => navigator.clipboard.writeText(prompt.content)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Copy className="w-3 h-3" />Copy
              </button>
            </div>
            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-y-auto">
              {prompt.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// AI Slot Edit Dialog
// ─────────────────────────────────────────────

function AiSlotEditDialog({
  slot,
  open,
  onClose,
  onSave,
  isSaving,
}: {
  slot: AiSlotDialogue;
  open: boolean;
  onClose: () => void;
  onSave: (data: { englishText: string; koreanText: string; data: Record<string, unknown> | null }) => void;
  isSaving: boolean;
}) {
  const [englishText, setEnglishText] = useState(slot.englishText);
  const [koreanText, setKoreanText] = useState(slot.koreanText);
  const [dataJson, setDataJson] = useState(
    slot.data ? JSON.stringify(slot.data, null, 2) : ""
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEnglishText(slot.englishText);
      setKoreanText(slot.koreanText);
      setDataJson(slot.data ? JSON.stringify(slot.data, null, 2) : "");
      setJsonError(null);
    }
  }, [open, slot.id]);

  function handleSave() {
    let parsedData: Record<string, unknown> | null = null;
    if (dataJson.trim()) {
      try {
        parsedData = JSON.parse(dataJson) as Record<string, unknown>;
      } catch {
        setJsonError("JSON 형식이 올바르지 않습니다.");
        return;
      }
    }
    onSave({ englishText, koreanText, data: parsedData });
  }

  const ep = slot.scene.episode;
  const breadcrumb = [ep.story?.title, `EP${ep.order} ${ep.title}`, `Scene ${slot.scene.order} ${slot.scene.title}`]
    .filter(Boolean)
    .join(" › ");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              slot.type === "AI_INPUT_SLOT" ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"
            )}>
              {slot.type}
            </span>
            <span className="text-sm font-normal text-muted-foreground truncate">{breadcrumb}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>English Text</Label>
            <Textarea
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              className="min-h-[80px] resize-y"
              placeholder="English prompt / instruction text"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Korean Text</Label>
            <Textarea
              value={koreanText}
              onChange={(e) => setKoreanText(e.target.value)}
              className="min-h-[80px] resize-y"
              placeholder="한국어 설명"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data (JSON)</Label>
            <Textarea
              value={dataJson}
              onChange={(e) => { setDataJson(e.target.value); setJsonError(null); }}
              className="font-mono text-xs min-h-[160px] resize-y"
              placeholder={'{\n  "promptKey": "eval_roleplay_v1",\n  "maxTurns": 10\n}'}
            />
            {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>취소</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// AI Slot Row
// ─────────────────────────────────────────────

function AiSlotRow({ slot, onEdit }: { slot: AiSlotDialogue; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const ep = slot.scene.episode;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
          slot.type === "AI_INPUT_SLOT" ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"
        )}>
          {slot.type === "AI_INPUT_SLOT" ? "INPUT" : "AI"}
        </span>

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            {ep.story && (
              <>
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[120px]">{ep.story.title}</span>
                <span>›</span>
              </>
            )}
            <Layers className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">EP{ep.order} {ep.title}</span>
            <span>›</span>
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">Scene {slot.scene.order} {slot.scene.title}</span>
            <span className="text-border">·</span>
            <span>#{slot.order}</span>
          </div>
          <p className="text-sm text-foreground truncate mt-0.5">{slot.englishText}</p>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">English</p>
              <p className="text-sm">{slot.englishText || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Korean</p>
              <p className="text-sm">{slot.koreanText || "—"}</p>
            </div>
          </div>
          {slot.data && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Data (JSON)</p>
              <pre className="font-mono text-xs bg-secondary rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(slot.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// AI Slots Tab
// ─────────────────────────────────────────────

function AiSlotsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "AI_INPUT_SLOT" | "AI_SLOT">("ALL");
  const [editTarget, setEditTarget] = useState<AiSlotDialogue | null>(null);

  const { data: slots = [], isLoading, error } = useQuery({
    queryKey: ["ai-slots", { search, typeFilter }],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (search) sp.set("search", search);
      const res = await fetch(`/api/ai-slots?${sp.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch AI slots");
      return res.json() as Promise<AiSlotDialogue[]>;
    },
  });

  const filtered = useMemo(() => {
    if (typeFilter === "ALL") return slots;
    return slots.filter((s) => s.type === typeFilter);
  }, [slots, typeFilter]);

  const updateSlot = useMutation({
    mutationFn: async ({
      slot,
      data,
    }: {
      slot: AiSlotDialogue;
      data: { englishText: string; koreanText: string; data: Record<string, unknown> | null };
    }) => {
      const ep = slot.scene.episode;
      const res = await fetch(
        `/api/stories/${ep.storyId}/episodes/${ep.id}/scenes/${slot.scene.id}/dialogues/${slot.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: slot.type, ...data }),
        }
      );
      if (!res.ok) throw new Error("Failed to update slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-slots"] });
      setEditTarget(null);
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="영어/한국어 텍스트 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(["ALL", "AI_INPUT_SLOT", "AI_SLOT"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                typeFilter === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {v === "ALL" ? "전체" : v === "AI_INPUT_SLOT" ? "INPUT" : "AI"}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} / {slots.length}
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />Loading...
        </div>
      )}
      {error && <div className="py-12 text-center text-destructive">불러오기 실패</div>}

      {!isLoading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">AI Slot이 없습니다.</div>
          ) : (
            filtered.map((slot) => (
              <AiSlotRow key={slot.id} slot={slot} onEdit={() => setEditTarget(slot)} />
            ))
          )}
        </div>
      )}

      {editTarget && (
        <AiSlotEditDialog
          slot={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(data) => updateSlot.mutate({ slot: editTarget, data })}
          isSaving={updateSlot.isPending}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Prompt Templates Tab
// ─────────────────────────────────────────────

function PromptTemplatesTab() {
  const { data: prompts = [], isLoading, error } = usePrompts();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(CreatePromptInput & { id?: number }) | null>(null);
  const [typeFilter, setTypeFilter] = useState<PromptType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = prompts.filter((p) => {
    const matchesType = typeFilter === "ALL" || p.type === typeFilter;
    const q = search.toLowerCase();
    return matchesType && (!q || p.key.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
  });

  function openCreate() { setEditTarget({ ...EMPTY_FORM }); setDialogOpen(true); }
  function openEdit(p: PromptTemplateBasic) {
    setEditTarget({ id: p.id, key: p.key, name: p.name, type: p.type, description: p.description, content: p.content, variables: Array.isArray(p.variables) ? p.variables : [], version: p.version, isActive: p.isActive });
    setDialogOpen(true);
  }

  async function handleSave(data: CreatePromptInput & { id?: number }) {
    if (data.id) await updatePrompt.mutateAsync({ id: data.id, ...data });
    else await createPrompt.mutateAsync(data);
    setDialogOpen(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this prompt template?")) return;
    await deletePrompt.mutateAsync(id);
  }

  const isSaving = createPrompt.isPending || updatePrompt.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search key, name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PromptType | "ALL")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {PROMPT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} / {prompts.length}</span>
        <Button className="rounded-xl shadow-lg shadow-primary/25" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />New Prompt
        </Button>
      </div>

      {isLoading && <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="w-5 h-5 mr-2 animate-spin" />Loading...</div>}
      {error && <div className="py-12 text-center text-destructive">Failed to load</div>}

      {!isLoading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground text-sm">No prompt templates found.</div>}
          {filtered.map((p) => (
            <PromptRow
              key={p.id}
              prompt={p}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p.id)}
              onToggleActive={(active) => updatePrompt.mutateAsync({ id: p.id, isActive: active })}
            />
          ))}
        </div>
      )}

      {editTarget && (
        <PromptFormDialog open={dialogOpen} initial={editTarget} onClose={() => setDialogOpen(false)} onSave={handleSave} isSaving={isSaving} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

type Tab = "templates" | "ai-slots";

export default function PromptsPage() {
  const [tab, setTab] = useState<Tab>("templates");

  return (
    <AdminLayout>
      <PageHeader title="Prompts" description="AI 프롬프트 템플릿 및 다이얼로그 AI 슬롯 관리" />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit mb-6">
        {([["templates", "Prompt Templates"], ["ai-slots", "AI Slots"]] as [Tab, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "templates" && <PromptTemplatesTab />}
      {tab === "ai-slots" && <AiSlotsTab />}
    </AdminLayout>
  );
}
