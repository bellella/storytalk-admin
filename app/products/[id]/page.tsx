"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft } from "lucide-react"
import { ProductForm } from "@/components/products/product-form"
import { EpisodeLinkTab } from "@/components/products/episode-link-tab"
import { useProduct, useUpdateProduct } from "@/hooks/use-products"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TABS = [
  { id: "overview", label: "기본 정보" },
  { id: "episodes", label: "에피소드 연결" },
]

export default function ProductDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const productId = Number(params.id)
  const activeTab = searchParams.get("tab") || "overview"

  const { data: product, isLoading, error } = useProduct(productId)
  const updateProduct = useUpdateProduct()

  const setTab = (tab: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("tab", tab)
    router.replace(`/products/${productId}?${sp.toString()}`, { scroll: false })
  }

  const handleSave = (data: any) => {
    updateProduct.mutate(
      { id: productId, ...data },
      {
        onSuccess: () => toast.success("상품이 저장되었습니다."),
        onError: () => toast.error("저장 중 오류가 발생했습니다."),
      }
    )
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-muted-foreground">로딩 중...</div>
      </AdminLayout>
    )
  }

  if (error || !product) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-destructive">상품을 불러오지 못했습니다.</div>
      </AdminLayout>
    )
  }

  const isPlayEpisode = product.type === "PLAY_EPISODE"

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground truncate">{product.name}</h1>
              <Badge variant={product.isActive ? "default" : "secondary"} className="rounded-lg">
                {product.isActive ? "판매중" : "중지"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {product.type} · {product.price.toLocaleString()} {product.currency}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1.5 rounded-2xl w-fit">
          {TABS.filter((t) => t.id !== "episodes" || isPlayEpisode).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-2xl border border-border p-6">
          {activeTab === "overview" && (
            <ProductForm
              defaultValues={product}
              onSubmit={handleSave}
              isSubmitting={updateProduct.isPending}
            />
          )}
          {activeTab === "episodes" && isPlayEpisode && (
            <EpisodeLinkTab product={product} />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
