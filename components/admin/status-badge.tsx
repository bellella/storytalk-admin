import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "draft" | "published" | "archived"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        status === "published" && "bg-success/10 text-success",
        status === "draft" && "bg-warning/10 text-warning",
        status === "archived" && "bg-muted text-muted-foreground",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "published" && "bg-success",
          status === "draft" && "bg-warning",
          status === "archived" && "bg-muted-foreground"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
