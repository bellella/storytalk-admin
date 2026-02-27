"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, Pencil, Trash2, Package } from "lucide-react"
import type { CollectionWithProducts } from "@/types"
import { useDeleteCollection, useReorderCollections } from "@/hooks/use-collections"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { format } from "date-fns"

type CollectionListProps = {
  collections: CollectionWithProducts[]
}

function SortableRow({
  collection,
  onDelete,
}: {
  collection: CollectionWithProducts
  onDelete: (id: number, title: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: collection.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
    >
      <td className="px-4 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-4 py-3 font-medium text-sm">
        <Link
          href={`/collections/${collection.id}`}
          className="text-foreground hover:text-primary transition-colors"
        >
          {collection.title}
        </Link>
        {collection.description && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
            {collection.description}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Package className="w-3.5 h-3.5" />
          {collection._count?.products ?? collection.products.length}개
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {collection.startsAt && collection.endsAt ? (
          <span>
            {format(new Date(collection.startsAt), "MM.dd")} ~{" "}
            {format(new Date(collection.endsAt), "MM.dd")}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={collection.isActive ? "default" : "secondary"} className="rounded-lg">
          {collection.isActive ? "노출중" : "비노출"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/collections/${collection.id}`}>
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(collection.id, collection.title)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function CollectionList({ collections: initialCollections }: CollectionListProps) {
  const [collections, setCollections] = useState(initialCollections)
  const deleteCollection = useDeleteCollection()
  const reorderCollections = useReorderCollections()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 컬렉션을 삭제하시겠습니까?`)) return
    deleteCollection.mutate(id, {
      onSuccess: () => toast.success("컬렉션이 삭제되었습니다."),
      onError: () => toast.error("삭제 중 오류가 발생했습니다."),
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = collections.findIndex((c) => c.id === active.id)
    const newIndex = collections.findIndex((c) => c.id === over.id)
    const newOrder = arrayMove(collections, oldIndex, newIndex)
    setCollections(newOrder)
    reorderCollections.mutate(newOrder.map((c) => c.id))
  }

  // initialCollections 변경 시 sync
  if (initialCollections.length !== collections.length) {
    setCollections(initialCollections)
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">컬렉션이 없습니다.</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={collections.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 w-8" />
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">컬렉션명</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품수</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">노출기간</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <SortableRow
                  key={collection.id}
                  collection={collection}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  )
}
