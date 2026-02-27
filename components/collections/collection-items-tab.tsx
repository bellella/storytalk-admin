"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Search, Plus, Trash2, Coins, CreditCard, Repeat2 } from "lucide-react"
import type { CollectionWithProducts } from "@/types"
import {
  useAddCollectionProduct,
  useRemoveCollectionProduct,
  useReorderCollectionProducts,
} from "@/hooks/use-collections"
import { useProducts } from "@/hooks/use-products"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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

type Props = {
  collection: CollectionWithProducts
}

const TYPE_ICON = {
  PLAY_EPISODE: Coins,
  COIN_PACK: CreditCard,
  SUBSCRIPTION: Repeat2,
}

type CollectionProductItem = CollectionWithProducts["products"][number]

function SortableItem({
  item,
  onRemove,
}: {
  item: CollectionProductItem
  onRemove: (productId: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const Icon = TYPE_ICON[item.product.type] ?? Coins

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.product.price.toLocaleString()} {item.product.currency}
          </p>
        </div>
      </div>
      <Badge
        variant={item.product.isActive ? "default" : "secondary"}
        className="rounded-lg flex-shrink-0"
      >
        {item.product.isActive ? "판매중" : "중지"}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
        onClick={() => onRemove(item.product.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

export function CollectionItemsTab({ collection }: Props) {
  const [search, setSearch] = useState("")
  const [items, setItems] = useState(collection.products)

  const { data: allProducts = [] } = useProducts()
  const addProduct = useAddCollectionProduct(collection.id)
  const removeProduct = useRemoveCollectionProduct(collection.id)
  const reorderProducts = useReorderCollectionProducts(collection.id)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // 이미 추가된 productId 목록
  const addedIds = new Set(items.map((i) => i.productId))

  const filteredProducts = allProducts.filter(
    (p) =>
      !addedIds.has(p.id) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = (productId: number) => {
    addProduct.mutate(productId, {
      onSuccess: (newItem) => {
        setItems((prev) => [...prev, newItem])
        toast.success("상품이 추가되었습니다.")
      },
      onError: () => toast.error("추가 중 오류가 발생했습니다."),
    })
  }

  const handleRemove = (productId: number) => {
    removeProduct.mutate(productId, {
      onSuccess: () => {
        setItems((prev) => prev.filter((i) => i.productId !== productId))
        toast.success("상품이 제거되었습니다.")
      },
      onError: () => toast.error("제거 중 오류가 발생했습니다."),
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    reorderProducts.mutate(newItems.map((item, idx) => ({ id: item.id, order: idx + 1 })))
  }

  // collection prop 변경 시 sync
  if (collection.products.length !== items.length && !addProduct.isPending && !removeProduct.isPending) {
    setItems(collection.products)
  }

  return (
    <div className="space-y-6">
      {/* 현재 상품 목록 (드래그 정렬) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            컬렉션 상품 ({items.length}개)
          </h3>
          <p className="text-xs text-muted-foreground">드래그로 순서 변경</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
            아래에서 상품을 추가해주세요.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableItem key={item.id} item={item} onRemove={handleRemove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* 상품 추가 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">상품 추가</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="상품 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-secondary border-0"
          />
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const Icon = TYPE_ICON[product.type] ?? Coins
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.price.toLocaleString()} {product.currency} ·{" "}
                      <span className={product.isActive ? "text-green-600" : "text-muted-foreground"}>
                        {product.isActive ? "판매중" : "중지"}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 flex-shrink-0"
                  onClick={() => handleAdd(product.id)}
                  disabled={addProduct.isPending}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  추가
                </Button>
              </div>
            )
          })}
          {filteredProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? "검색 결과가 없습니다." : "추가할 수 있는 상품이 없습니다."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
