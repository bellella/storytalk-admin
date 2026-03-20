"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Coins, CreditCard, Repeat2, Pencil, Trash2 } from "lucide-react"
import type { ProductWithEpisodes } from "@/types"
import { useDeleteProduct } from "@/hooks/use-products"
import { toast } from "sonner"

type ProductListProps = {
  products: ProductWithEpisodes[]
}

const TYPE_CONFIG = {
  PLAY_EPISODE: { label: "에피소드", icon: Coins, color: "bg-blue-100 text-blue-700" },
  COIN_PACK: { label: "코인팩", icon: CreditCard, color: "bg-amber-100 text-amber-700" },
  SUBSCRIPTION: { label: "구독", icon: Repeat2, color: "bg-purple-100 text-purple-700" },
}

export function ProductList({ products }: ProductListProps) {
  const deleteProduct = useDeleteProduct()

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success("상품이 삭제되었습니다."),
      onError: () => toast.error("삭제 중 오류가 발생했습니다."),
    })
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">상품이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품명</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">타입</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">가격</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">에피소드 연결</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">상태</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">구매수</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const cfg = TYPE_CONFIG[product.type]
            const Icon = cfg.icon
            const isPlayEpisode = product.type === "PLAY_EPISODE"
            const linkedCount = product.episodes.length
            const needsLink = isPlayEpisode && linkedCount === 0

            return (
              <tr
                key={product.id}
                className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                  {product.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {product.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.price.toLocaleString()}{" "}
                  <span className="text-xs">{product.currency}</span>
                </td>
                <td className="px-4 py-3">
                  {isPlayEpisode ? (
                    needsLink ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        미연결
                      </span>
                    ) : (() => {
                      const ep = product.episodes[0]?.episode
                      const storyId = ep?.storyId ?? ep?.story?.id
                      const href = storyId && ep ? `/stories/${storyId}/episodes/${ep.id}` : null
                      return href ? (
                        <Link
                          href={href}
                          className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {ep?.story?.title ?? "—"} · Ep.{ep?.order}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {ep?.story?.title ?? "—"} · Ep.{ep?.order}
                        </span>
                      )
                    })()
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className="rounded-lg"
                  >
                    {product.isActive ? "판매중" : "중지"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {product._count?.purchases ?? 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
