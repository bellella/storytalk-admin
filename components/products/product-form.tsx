"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUploader } from "@/components/ui/image-uploader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { ProductBasic, ProductType, CurrencyType } from "@/types"

const schema = z
  .object({
    name: z.string().min(1, "상품명을 입력해주세요."),
    description: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    type: z.enum(["PLAY_EPISODE", "COIN_PACK", "SUBSCRIPTION"]),
    currency: z.enum(["COIN", "KRW", "USD"]),
    price: z.coerce.number().min(0, "0 이상의 값을 입력해주세요."),
    storeSku: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.type === "PLAY_EPISODE") return data.currency === "COIN"
      return true
    },
    { message: "PLAY_EPISODE 타입은 COIN 통화만 사용합니다.", path: ["currency"] }
  )
  .refine(
    (data) => {
      if (data.type === "COIN_PACK" || data.type === "SUBSCRIPTION") {
        return !!data.storeSku
      }
      return true
    },
    { message: "COIN_PACK, SUBSCRIPTION은 Store SKU가 필요합니다.", path: ["storeSku"] }
  )

type FormValues = z.infer<typeof schema>

type ProductFormProps = {
  defaultValues?: Partial<ProductBasic>
  onSubmit: (data: FormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "저장",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      thumbnailUrl: defaultValues?.thumbnailUrl ?? "",
      type: (defaultValues?.type as ProductType) ?? "PLAY_EPISODE",
      currency: (defaultValues?.currency as CurrencyType) ?? "COIN",
      price: defaultValues?.price ?? 0,
      storeSku: defaultValues?.storeSku ?? "",
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const type = watch("type")
  const isActive = watch("isActive")

  // 타입 변경 시 currency 자동 설정
  const handleTypeChange = (v: ProductType) => {
    setValue("type", v)
    if (v === "PLAY_EPISODE") setValue("currency", "COIN")
    else setValue("currency", "KRW")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 타입 */}
      <div className="space-y-2">
        <Label>상품 타입</Label>
        <Select value={type} onValueChange={(v) => handleTypeChange(v as ProductType)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PLAY_EPISODE">PLAY_EPISODE (에피소드 해금)</SelectItem>
            <SelectItem value="COIN_PACK">COIN_PACK (코인 충전팩)</SelectItem>
            <SelectItem value="SUBSCRIPTION">SUBSCRIPTION (구독)</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label>
          상품명 <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register("name")}
          placeholder="스토어에 표시될 이름"
          className="rounded-xl"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Input {...register("description")} placeholder="상품 설명 (선택)" className="rounded-xl" />
      </div>

      {/* 썸네일 */}
      <div className="space-y-2">
        <Label>썸네일 이미지</Label>
        <Controller
          name="thumbnailUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? ""}
              onChange={field.onChange}
              aspectRatio="video"
              maxSizeMB={5}
            />
          )}
        />
      </div>

      {/* 가격 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            {type === "PLAY_EPISODE" ? "코인 가격" : "가격"}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("price")}
            type="number"
            min={0}
            placeholder="0"
            className="rounded-xl"
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>통화</Label>
          <Select
            value={watch("currency")}
            onValueChange={(v) => setValue("currency", v as CurrencyType)}
            disabled={type === "PLAY_EPISODE"}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COIN">COIN</SelectItem>
              <SelectItem value="KRW">KRW</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-xs text-destructive">{errors.currency.message}</p>
          )}
        </div>
      </div>

      {/* Store SKU (COIN_PACK / SUBSCRIPTION) */}
      {(type === "COIN_PACK" || type === "SUBSCRIPTION") && (
        <div className="space-y-2">
          <Label>
            Store SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("storeSku")}
            placeholder="com.app.product.sku"
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">인앱결제 상품 ID (App Store / Google Play)</p>
          {errors.storeSku && (
            <p className="text-xs text-destructive">{errors.storeSku.message}</p>
          )}
        </div>
      )}

      {/* 판매 활성 */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
        <div>
          <p className="font-medium text-sm">판매 활성화</p>
          <p className="text-xs text-muted-foreground">
            비활성화 시 Play 탭에서 노출되지 않습니다.
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(v) => setValue("isActive", v)}
        />
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? "저장 중..." : submitLabel}
      </Button>
    </form>
  )
}
