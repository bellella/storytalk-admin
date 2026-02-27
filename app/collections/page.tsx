"use client"

import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CollectionList } from "@/components/collections/collection-list"
import { useCollections } from "@/hooks/use-collections"

export default function CollectionsPage() {
  const { data: collections = [], isLoading, error } = useCollections()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">컬렉션 관리</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Play 탭 진열 섹션을 관리합니다. 드래그로 순서를 변경할 수 있습니다.
            </p>
          </div>
          <Link href="/collections/create">
            <Button className="rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              컬렉션 추가
            </Button>
          </Link>
        </div>

        {/* List */}
        {isLoading && (
          <div className="text-center py-16 text-muted-foreground">로딩 중...</div>
        )}
        {error && (
          <div className="text-center py-16 text-destructive">데이터를 불러오지 못했습니다.</div>
        )}
        {!isLoading && !error && <CollectionList collections={collections} />}
      </div>
    </AdminLayout>
  )
}
