"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  usePrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  type PromptTemplateBasic,
  type CreatePromptInput,
  type PromptVariable,
} from "@/hooks/use-prompts";
import type { PromptType } from "@/src/generated/prisma/enums";

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
  const form = useForm<PromptFormValues>({
    defaultValues: initial,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variables",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ...initial,
        variables: initial.variables ?? [],
      });
    }
  }, [open, initial.id, initial.key]);

  const onSubmit = (data: PromptFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <DialogTitle>{initial.id ? "Edit Prompt" : "New Prompt"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6">
            <div className="space-y-4 py-2 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Key (unique)</Label>
              <Input
                {...form.register("key", { required: true })}
                placeholder="e.g. eval_roleplay_v1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                {...form.register("name", { required: true })}
                placeholder="Human-readable name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Version</Label>
              <Input
                type="number"
                min={1}
                {...form.register("version", { valueAsNumber: true, min: 1 })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              {...form.register("description")}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Content</Label>
            <Textarea
              {...form.register("content", { required: true })}
              placeholder="Prompt content..."
              className="font-mono text-xs min-h-[240px] resize-y"
            />
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variables</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ key: "", required: true, type: "string" })
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border border-border/50 p-3 bg-secondary/30">
              {fields.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No variables. Add variables like userName, characterName.
                </p>
              ) : (
                fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    <Input
                      {...form.register(`variables.${i}.key`, {
                        required: true,
                      })}
                      placeholder="key"
                      className="flex-1 min-w-[100px] h-8 text-sm"
                    />
                    <Controller
                      name={`variables.${i}.type`}
                      control={form.control}
                      render={({ field: f }) => (
                        <Select
                          value={f.value}
                          onValueChange={f.onChange}
                        >
                          <SelectTrigger className="w-24 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VARIABLE_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        {...form.register(`variables.${i}.required`)}
                        className="rounded"
                      />
                      required
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove(i)}
                    >
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
              render={({ field }) => (
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label>Active</Label>
          </div>
          </div>
          </div>

          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving ||
                !form.watch("key") ||
                !form.watch("name") ||
                !form.watch("content")
              }
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[prompt.type]}`}
        >
          {prompt.type}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground font-medium">
              {prompt.key}
            </span>
            <span className="text-muted-foreground text-xs">v{prompt.version}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{prompt.name}</p>
        </div>

        {prompt.description && (
          <p className="text-xs text-muted-foreground hidden md:block max-w-xs truncate">
            {prompt.description}
          </p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Switch
            checked={prompt.isActive}
            onCheckedChange={onToggleActive}
            className="scale-90"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-4">
          {prompt.variables && prompt.variables.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                Variables
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {prompt.variables.map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-mono"
                  >
                    {v.key}
                    <span className="text-muted-foreground ml-1">
                      ({v.type}{v.required ? ", required" : ""})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Content
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(prompt.content)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
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

export default function PromptsPage() {
  const { data: prompts = [], isLoading, error } = usePrompts();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(CreatePromptInput & { id?: number }) | null>(
    null
  );
  const [typeFilter, setTypeFilter] = useState<PromptType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = prompts.filter((p) => {
    const matchesType = typeFilter === "ALL" || p.type === typeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.key.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  function openCreate() {
    setEditTarget({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(p: PromptTemplateBasic) {
    const vars = Array.isArray(p.variables) ? p.variables : [];
    setEditTarget({
      id: p.id,
      key: p.key,
      name: p.name,
      type: p.type,
      description: p.description,
      content: p.content,
      variables: vars,
      version: p.version,
      isActive: p.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave(data: CreatePromptInput & { id?: number }) {
    if (data.id) {
      await updatePrompt.mutateAsync({ id: data.id, ...data });
    } else {
      await createPrompt.mutateAsync(data);
    }
    setDialogOpen(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this prompt template?")) return;
    await deletePrompt.mutateAsync(id);
  }

  async function handleToggleActive(id: number, active: boolean) {
    await updatePrompt.mutateAsync({ id, isActive: active });
  }

  const isSaving = createPrompt.isPending || updatePrompt.isPending;

  return (
    <AdminLayout>
      <PageHeader title="Prompt Templates" description="Manage AI prompt templates">
        <Button className="rounded-xl shadow-lg shadow-primary/25" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Prompt
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Input
          placeholder="Search key, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as PromptType | "ALL")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {PROMPT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} / {prompts.length}
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          Failed to load: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No prompt templates found.
            </div>
          )}
          {filtered.map((p) => (
            <PromptRow
              key={p.id}
              prompt={p}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p.id)}
              onToggleActive={(active) => handleToggleActive(p.id, active)}
            />
          ))}
        </div>
      )}

      {editTarget && (
        <PromptFormDialog
          open={dialogOpen}
          initial={editTarget}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </AdminLayout>
  );
}
