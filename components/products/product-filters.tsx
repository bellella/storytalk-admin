"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

type ProductFiltersProps = {
  search: string
  onSearchChange: (v: string) => void
  typeFilter: string
  onTypeFilterChange: (v: string) => void
  activeFilter: string
  onActiveFilterChange: (v: string) => void
}

const TYPES = [
  { label: "전체", value: "ALL" },
  { label: "PLAY_EPISODE", value: "PLAY_EPISODE" },
  { label: "COIN_PACK", value: "COIN_PACK" },
  { label: "SUBSCRIPTION", value: "SUBSCRIPTION" },
]

const ACTIVE_OPTIONS = [
  { label: "전체", value: "" },
  { label: "판매중", value: "true" },
  { label: "판매중지", value: "false" },
]

export function ProductFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  activeFilter,
  onActiveFilterChange,
}: ProductFiltersProps) {
  const hasFilters = search || typeFilter !== "ALL" || activeFilter !== ""

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="이름, SKU 검색..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-xl bg-secondary border-0"
        />
      </div>

      <div className="flex gap-2">
        {TYPES.map((t) => (
          <Button
            key={t.value}
            variant={typeFilter === t.value ? "default" : "secondary"}
            size="sm"
            className="rounded-xl"
            onClick={() => onTypeFilterChange(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        {ACTIVE_OPTIONS.map((o) => (
          <Button
            key={o.value}
            variant={activeFilter === o.value ? "default" : "secondary"}
            size="sm"
            className="rounded-xl"
            onClick={() => onActiveFilterChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl text-muted-foreground"
          onClick={() => {
            onSearchChange("")
            onTypeFilterChange("ALL")
            onActiveFilterChange("")
          }}
        >
          <X className="w-4 h-4 mr-1" />
          초기화
        </Button>
      )}
    </div>
  )
}
