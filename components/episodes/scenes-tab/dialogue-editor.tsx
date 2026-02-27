"use client";

import type { DialogueBasic, StoryCharacterWithCharacter } from "@/types";
import { DialogueType, DialogueSpeakerRole } from "@/types";
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
import { X, Save, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn } from "@/lib/utils";

const AI_DIALOGUE_TYPES = [
  DialogueType.AI_INPUT_SLOT,
  DialogueType.AI_SLOT,
  DialogueType.SPEAKING_MISSION,
] as const;

type DialogueFormData = {
  characterId?: number;
  characterName?: string;
  type: (typeof DialogueType)[keyof typeof DialogueType];
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
  { value: DialogueType.CHOICE, label: "Choice" },
  { value: DialogueType.AI_INPUT_SLOT, label: "AI Input Slot" },
  { value: DialogueType.AI_SLOT, label: "AI Slot" },
  { value: DialogueType.SPEAKING_MISSION, label: "Speaking Mission" },
];

interface DialogueEditorProps {
  dialogue: DialogueBasic | null;
  characters: StoryCharacterWithCharacter[];
  saving: boolean;
  onSave: (data: DialogueFormData) => void;
  onDelete?: (dialogue: DialogueBasic) => void;
  onClose: () => void;
}

export function DialogueEditor({
  dialogue,
  characters,
  saving,
  onSave,
  onDelete,
  onClose,
}: DialogueEditorProps) {
  const form = useForm<DialogueFormData>({
    defaultValues: {
      characterId: undefined,
      characterName: "",
      type: DialogueType.DIALOGUE,
      speakerRole: DialogueSpeakerRole.SYSTEM,
      englishText: "",
      koreanText: "",
      charImageLabel: "default",
      imageUrl: "",
      data: "{}",
    },
  });

  const validateDataJson = (value: string, type: DialogueFormData["type"]) => {
    if (type !== DialogueType.CHOICE && type !== DialogueType.AI_INPUT_SLOT && type !== DialogueType.AI_SLOT) return true;
    if (!value?.trim()) return true;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "object" || parsed === null) {
        return "JSON must be an object";
      }
      return true;
    } catch (e) {
      return `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`;
    }
  };

  useEffect(() => {
    if (dialogue) {
      form.reset({
        characterId: dialogue.character?.id ?? dialogue.characterId ?? undefined,
        characterName: dialogue.characterName || "",
        type: dialogue.type ?? DialogueType.DIALOGUE,
        speakerRole: (dialogue.speakerRole as "SYSTEM" | "USER") ?? DialogueSpeakerRole.SYSTEM,
        englishText: dialogue.englishText,
        koreanText: dialogue.koreanText,
        charImageLabel: dialogue.charImageLabel || "default",
        imageUrl: dialogue.imageUrl || "",
        data: dialogue.data ? JSON.stringify(dialogue.data, null, 2) : "{}",
      });
    }
  }, [dialogue, form]);

  return (
    <div className="col-span-4">
      <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Dialog Editor
            </CardTitle>
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
        <CardContent className="flex-1 overflow-auto space-y-4 p-4 pt-0">
          {dialogue ? (
            <form
              onSubmit={form.handleSubmit(
                (data) => {
                  const dataError = validateDataJson(data.data, data.type);
                  if (dataError !== true) {
                    form.setError("data", { type: "manual", message: dataError });
                    return;
                  }
                  form.clearErrors("data");
                  onSave(data);
                },
                (errors) => {
                  // react-hook-form validation errors
                }
              )}
            >
              <div className="space-y-4">
                {/* Type Selection */}
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

                {/* Speaker Role */}
                <div>
                  <Label className="text-sm font-medium">Speaker Role</Label>
                  <Select
                    value={form.watch("speakerRole") ?? DialogueSpeakerRole.SYSTEM}
                    onValueChange={(val: DialogueFormData["speakerRole"]) =>
                      form.setValue("speakerRole", val)
                    }
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

                {/* Character - for dialogue, ai_input_slot, ai_slot */}
                {(form.watch("type") === DialogueType.DIALOGUE ||
                  form.watch("type") === DialogueType.AI_INPUT_SLOT ||
                  form.watch("type") === DialogueType.AI_SLOT) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Character</Label>
                    <Select
                      value={form.watch("characterId")?.toString() || ""}
                      onValueChange={(val) => {
                        const id = parseInt(val);
                        const sc = characters.find(
                          (c) => c.character.id === id
                        );
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

                {/* Data (JSON) - for CHOICE, AI_INPUT_SLOT, AI_SLOT */}
                {(form.watch("type") === DialogueType.CHOICE ||
                  form.watch("type") === DialogueType.AI_INPUT_SLOT ||
                  form.watch("type") === DialogueType.AI_SLOT) && (
                  <div>
                    <Label className="text-sm font-medium">
                      {form.watch("type") === DialogueType.CHOICE
                        ? "Choice Data (JSON)"
                        : form.watch("type") === DialogueType.AI_SLOT
                          ? "AI Slot Data (JSON)"
                          : "Data (JSON)"}
                    </Label>
                    <Textarea
                      {...form.register("data")}
                      className={cn(
                        "mt-2 rounded-xl bg-secondary border-0 min-h-[120px] font-mono text-sm",
                        form.formState.errors.data && "border-destructive border"
                      )}
                      placeholder={
                        form.watch("type") === DialogueType.CHOICE
                          ? '{"options": ["A", "B", "C"]}'
                          : form.watch("type") === DialogueType.AI_SLOT
                            ? '{"prompt": "...", "config": {}}'
                            : '{"placeholder": "Enter text...", "maxLength": 100}'
                      }
                    />
                    {form.formState.errors.data && (
                      <p className="mt-1.5 text-sm text-destructive">
                        {form.formState.errors.data.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Image URL - only for image type */}
                {form.watch("type") === DialogueType.IMAGE && (
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
                  <Label className="text-sm font-medium">
                    Korean Translation
                  </Label>
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

                {/* Image Label - for dialogue, ai_input_slot, ai_slot */}
                {(form.watch("type") === DialogueType.DIALOGUE ||
                  form.watch("type") === DialogueType.AI_INPUT_SLOT ||
                  form.watch("type") === DialogueType.AI_SLOT) && (
                  <div>
                    <Label className="text-sm font-medium">
                      Character Image Label
                    </Label>
                    <Input
                      {...form.register("charImageLabel")}
                      className="mt-2 rounded-xl bg-secondary border-0"
                      placeholder="default"
                    />
                  </div>
                )}

                {/* Voice Audio placeholder - hidden for image, heading, choice (text-only types) */}
                {form.watch("type") !== DialogueType.IMAGE &&
                  form.watch("type") !== DialogueType.HEADING &&
                  form.watch("type") !== DialogueType.CHOICE && (
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
  );
}
