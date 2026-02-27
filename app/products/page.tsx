"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductList } from "@/components/products/product-list"
import { useProducts } from "@/hooks/use-products"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("")

  const { data: products = [], isLoading, error } = useProducts()

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false
      if (activeFilter !== "" && String(p.isActive) !== activeFilter) return false
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !(p.storeSku ?? "").toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [products, typeFilter, activeFilter, search])

  const unmappedCount = products.filter(
    (p) => p.type === "PLAY_EPISODE" && p.episodes.length === 0
  ).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">상품 관리</h1>
            <p className="text-muted-foreground text-sm mt-1">
              에피소드 해금, 코인팩, 구독 상품을 관리합니다.
            </p>
          </div>
          <Link href="/products/create">
            <Button className="rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              상품 추가
            </Button>
          </Link>
        </div>

        {/* 미연결 경고 */}
        {unmappedCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{unmappedCount}개</span>의 PLAY_EPISODE 상품이 에피소드에
              연결되지 않았습니다. 상품을 클릭해 연결해주세요.
            </p>
          </div>
        )}

        {/* Filters */}
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
        />

        {/* List */}
        {isLoading && (
          <div className="text-center py-16 text-muted-foreground">로딩 중...</div>
        )}
        {error && (
          <div className="text-center py-16 text-destructive">데이터를 불러오지 못했습니다.</div>
        )}
        {!isLoading && !error && <ProductList products={filtered} />}
      </div>
    </AdminLayout>
  )
}
