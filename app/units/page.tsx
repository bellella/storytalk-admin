"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import {
  useUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/hooks/use-units";
import { useStories } from "@/hooks/use-stories";
import { UnitList } from "@/components/units/unit-list";
import { UnitFormDialog } from "@/components/units/unit-form-dialog";
import type { PublishStatus, UnitWithStory } from "@/types";

const statusFilters = ["All", "Draft", "Published", "Hidden", "Archived"];

export default function UnitsPage() {
  const { data: units = [], isLoading, error } = useUnits();
  const { data: stories = [] } = useStories();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  const [statusFilter, setStatusFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitWithStory | null>(null);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      if (statusFilter === "All") return true;
      return unit.status === statusFilter.toUpperCase();
    });
  }, [units, statusFilter]);

  const handleCreate = () => {
    setEditingUnit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (unit: UnitWithStory) => {
    setEditingUnit(unit);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    deleteUnit.mutate(id);
  };

  const handleSave = (data: {
    storyId: number;
    order?: number;
    color?: string;
    status?: PublishStatus;
  }) => {
    if (editingUnit) {
      updateUnit.mutate(
        { id: editingUnit.id, ...data },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    } else {
      createUnit.mutate(data, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const saving = createUnit.isPending || updateUnit.isPending;

  return (
    <AdminLayout>
      <PageHeader
        title="Units"
        description="Manage learning units and story mappings"
      >
        <Button
          className="rounded-xl shadow-lg shadow-primary/25"
          onClick={handleCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Unit
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] rounded-xl bg-secondary border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {statusFilters.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="rounded-lg"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          Failed to load units: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <UnitList
          units={filteredUnits}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <UnitFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        unit={editingUnit}
        stories={stories}
        onSave={handleSave}
        saving={saving}
      />
    </AdminLayout>
  );
}
