"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { CollectionForm } from "@/components/collections/collection-form"
import { useCreateCollection } from "@/hooks/use-collections"
import { toast } from "sonner"

export default function CreateCollectionPage() {
  const router = useRouter()
  const createCollection = useCreateCollection()

  const handleSubmit = (data: any) => {
    createCollection.mutate(data, {
      onSuccess: (collection) => {
        toast.success("컬렉션이 생성되었습니다.")
        router.push(`/collections/${collection.id}`)
      },
      onError: () => toast.error("컬렉션 생성 중 오류가 발생했습니다."),
    })
  }

  return (
    <AdminLayout>
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/collections">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">컬렉션 추가</h1>
            <p className="text-sm text-muted-foreground">새 컬렉션을 만듭니다.</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <CollectionForm
            onSubmit={handleSubmit}
            isSubmitting={createCollection.isPending}
            submitLabel="컬렉션 생성"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
