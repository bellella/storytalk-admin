import { cn } from "@/lib/utils";
import { PublishStatus } from "@/types";

interface StatusBadgeProps {
  status: PublishStatus;
  className?: string;
}

const statusConfig: Record<
  PublishStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  DRAFT: {
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
    label: "Draft",
  },
  PUBLISHED: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
    label: "Published",
  },
  HIDDEN: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Hidden",
  },
  ARCHIVED: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    dot: "bg-secondary-foreground/50",
    label: "Archived",
  },
  DELETED: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
    label: "Deleted",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.DRAFT;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
