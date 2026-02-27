"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft } from "lucide-react"
import { CollectionForm } from "@/components/collections/collection-form"
import { CollectionItemsTab } from "@/components/collections/collection-items-tab"
import { useCollection, useUpdateCollection } from "@/hooks/use-collections"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TABS = [
  { id: "overview", label: "기본 정보" },
  { id: "items", label: "상품 편집" },
]

export default function CollectionDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const collectionId = Number(params.id)
  const activeTab = searchParams.get("tab") || "overview"

  const { data: collection, isLoading, error } = useCollection(collectionId)
  const updateCollection = useUpdateCollection()

  const setTab = (tab: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("tab", tab)
    router.replace(`/collections/${collectionId}?${sp.toString()}`, { scroll: false })
  }

  const handleSave = (data: any) => {
    updateCollection.mutate(
      { id: collectionId, ...data },
      {
        onSuccess: () => toast.success("컬렉션이 저장되었습니다."),
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

  if (error || !collection) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-destructive">컬렉션을 불러오지 못했습니다.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/collections">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground truncate">{collection.title}</h1>
              <Badge
                variant={collection.isActive ? "default" : "secondary"}
                className="rounded-lg"
              >
                {collection.isActive ? "노출중" : "비노출"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              상품 {collection.products.length}개
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1.5 rounded-2xl w-fit">
          {TABS.map((tab) => (
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
            <CollectionForm
              defaultValues={collection}
              onSubmit={handleSave}
              isSubmitting={updateCollection.isPending}
            />
          )}
          {activeTab === "items" && <CollectionItemsTab collection={collection} />}
        </div>
      </div>
    </AdminLayout>
  )
}
