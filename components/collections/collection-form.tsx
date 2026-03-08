"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CollectionBasic, CollectionKey } from "@/types"

const COLLECTION_KEYS: { value: CollectionKey; label: string }[] = [
  { value: "TOP", label: "상단 (TOP)" },
  { value: "OTHER", label: "기타 (OTHER)" },
]

const schema = z.object({
  key: z.enum(["TOP", "OTHER"]),
  title: z.string().min(1, "제목을 입력해주세요."),
  description: z.string().optional(),
  thumbnailUrl: z.string().url("유효한 URL을 입력해주세요.").optional().or(z.literal("")),
  isActive: z.boolean(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type CollectionFormProps = {
  defaultValues?: Partial<CollectionBasic>
  onSubmit: (data: FormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 16) // "YYYY-MM-DDTHH:mm"
}

export function CollectionForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "저장",
}: CollectionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: (defaultValues?.key ?? "OTHER") as CollectionKey,
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      thumbnailUrl: defaultValues?.thumbnailUrl ?? "",
      isActive: defaultValues?.isActive ?? true,
      startsAt: toDatetimeLocal(defaultValues?.startsAt),
      endsAt: toDatetimeLocal(defaultValues?.endsAt),
    },
  })

  const isActive = watch("isActive")
  const keyValue = watch("key")

  const handleSubmitWrapper = (data: FormValues) => {
    onSubmit({
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
    } as FormValues)
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitWrapper)} className="space-y-6">
      {/* 위치 (key) */}
      <div className="space-y-2">
        <Label>위치</Label>
        <Select
          value={keyValue}
          onValueChange={(v) => setValue("key", v as CollectionKey)}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLLECTION_KEYS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          TOP: 상단 노출, OTHER: 기타 (안정화 전)
        </p>
      </div>

      {/* 제목 */}
      <div className="space-y-2">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register("title")}
          placeholder="이번주 추천 / 신규 / 시즌..."
          className="rounded-xl"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Input {...register("description")} placeholder="컬렉션 설명 (선택)" className="rounded-xl" />
      </div>

      {/* 썸네일 */}
      <div className="space-y-2">
        <Label>썸네일 URL</Label>
        <Input
          {...register("thumbnailUrl")}
          placeholder="https://..."
          className="rounded-xl"
        />
        {errors.thumbnailUrl && (
          <p className="text-xs text-destructive">{errors.thumbnailUrl.message}</p>
        )}
      </div>

      {/* 노출 기간 */}
      <div className="space-y-2">
        <Label>노출 기간 (선택)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">시작일</p>
            <Input {...register("startsAt")} type="datetime-local" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">종료일</p>
            <Input {...register("endsAt")} type="datetime-local" className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* 노출 활성 */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
        <div>
          <p className="font-medium text-sm">노출 활성화</p>
          <p className="text-xs text-muted-foreground">Play 탭에서 이 컬렉션을 보여줍니다.</p>
        </div>
        <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? "저장 중..." : submitLabel}
      </Button>
    </form>
  )
}
