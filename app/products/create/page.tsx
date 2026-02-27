"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ProductForm } from "@/components/products/product-form"
import { useCreateProduct } from "@/hooks/use-products"
import { toast } from "sonner"

export default function CreateProductPage() {
  const router = useRouter()
  const createProduct = useCreateProduct()

  const handleSubmit = (data: any) => {
    createProduct.mutate(data, {
      onSuccess: (product) => {
        toast.success("상품이 생성되었습니다.")
        router.push(`/products/${product.id}`)
      },
      onError: () => toast.error("상품 생성 중 오류가 발생했습니다."),
    })
  }

  return (
    <AdminLayout>
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">상품 추가</h1>
            <p className="text-sm text-muted-foreground">새 상품을 만듭니다.</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={createProduct.isPending}
            submitLabel="상품 생성"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
