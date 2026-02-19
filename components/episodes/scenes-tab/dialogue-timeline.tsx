"use client";

import type { DialogueBasic } from "@/types";
import { DialogueType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  GripVertical,
  FileText,
  Image as ImageIcon,
  Heading as HeadingIcon,
  ListChecks,
  MessageSquare,
  Bot,
  Target,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const DIALOGUE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
  [DialogueType.DIALOGUE]: { label: "Dialogue", icon: MessageSquare, badgeClass: "bg-primary/10 text-primary" },
  [DialogueType.NARRATION]: { label: "Narration", icon: FileText, badgeClass: "bg-amber-500/10 text-amber-600" },
  [DialogueType.IMAGE]: { label: "Image", icon: ImageIcon, badgeClass: "bg-violet-500/10 text-violet-600" },
  [DialogueType.HEADING]: { label: "Heading", icon: HeadingIcon, badgeClass: "bg-sky-500/10 text-sky-600" },
  [DialogueType.CHOICE]: { label: "Choice", icon: ListChecks, badgeClass: "bg-emerald-500/10 text-emerald-600" },
  [DialogueType.AI_INPUT_SLOT]: { label: "AI Input", icon: MessageSquare, badgeClass: "bg-orange-500/10 text-orange-600" },
  [DialogueType.AI_SLOT]: { label: "AI Slot", icon: Bot, badgeClass: "bg-indigo-500/10 text-indigo-600" },
  [DialogueType.SPEAKING_MISSION]: { label: "Speaking Mission", icon: Target, badgeClass: "bg-pink-500/10 text-pink-600" },
};

function getDialogueTypeConfig(type: string) {
  return DIALOGUE_TYPE_CONFIG[type] ?? {
    label: type,
    icon: FileText,
    badgeClass: "bg-muted text-muted-foreground",
  };
}

interface DialogueTimelineProps {
  dialogues: DialogueBasic[];
  selectedDialogue: DialogueBasic | null;
  onSelectDialogue: (dialogue: DialogueBasic) => void;
  onCreateDialogue: () => void;
  onReorderDialogues: (reorderedDialogues: DialogueBasic[]) => void;
}

function SortableDialogueItem({
  dialogue,
  isSelected,
  onSelect,
}: {
  dialogue: DialogueBasic;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dialogue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button
        onClick={onSelect}
        className={cn(
          "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
          isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-secondary",
          isDragging && "opacity-50 shadow-lg"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        </div>
        {dialogue.type === DialogueType.DIALOGUE ||
        dialogue.type === DialogueType.AI_INPUT_SLOT ||
        dialogue.type === DialogueType.AI_SLOT ? (
          <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm">
              {dialogue.characterName?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            {(() => {
              const { icon: Icon } = getDialogueTypeConfig(dialogue.type);
              return <Icon className="w-5 h-5 text-muted-foreground" />;
            })()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">
              {dialogue.type === DialogueType.DIALOGUE ||
              dialogue.type === DialogueType.AI_INPUT_SLOT ||
              dialogue.type === DialogueType.AI_SLOT
                ? dialogue.characterName ?? getDialogueTypeConfig(dialogue.type).label
                : getDialogueTypeConfig(dialogue.type).label}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                getDialogueTypeConfig(dialogue.type).badgeClass
              )}
            >
              {getDialogueTypeConfig(dialogue.type).label}
            </span>
            {(dialogue.type === DialogueType.DIALOGUE ||
              dialogue.type === DialogueType.AI_INPUT_SLOT ||
              dialogue.type === DialogueType.AI_SLOT) &&
              dialogue.charImageLabel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                {dialogue.charImageLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {dialogue.englishText}
          </p>
        </div>
      </button>
    </div>
  );
}

export function DialogueTimeline({
  dialogues,
  selectedDialogue,
  onSelectDialogue,
  onCreateDialogue,
  onReorderDialogues,
}: DialogueTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dialogues.findIndex((d) => d.id === active.id);
    const newIndex = dialogues.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(dialogues, oldIndex, newIndex);
    onReorderDialogues(reordered);
  };

  return (
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
              onClick={onCreateDialogue}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Dialog
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-3 p-3 pt-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dialogues.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {dialogues.map((dialogue) => (
                <SortableDialogueItem
                  key={dialogue.id}
                  dialogue={dialogue}
                  isSelected={selectedDialogue?.id === dialogue.id}
                  onSelect={() => onSelectDialogue(dialogue)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {dialogues.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No dialogues in this scene
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
