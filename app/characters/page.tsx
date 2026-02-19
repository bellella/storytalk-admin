"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2 } from "lucide-react";
import { useCharacters, useDeleteCharacter } from "@/hooks/use-characters";
import { CharacterGrid } from "@/components/characters/character-grid";

const roles = ["All", "Global", "Story"];

export default function CharactersPage() {
  const router = useRouter();
  const { data: characters = [], isLoading, error } = useCharacters();
  const deleteCharacter = useDeleteCharacter();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredCharacters = useMemo(() => {
    return characters.filter((character) => {
      const matchesSearch = character.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === "All" ||
        (roleFilter === "Global" && character.scope === "GLOBAL") ||
        (roleFilter === "Story" && character.scope === "STORY");
      return matchesSearch && matchesRole;
    });
  }, [characters, searchQuery, roleFilter]);

  const handleDelete = (characterId: number) => {
    if (!confirm("Are you sure you want to delete this character?")) return;
    deleteCharacter.mutate(characterId);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Characters"
        description="Manage reusable characters across all stories"
      >
        <Button
          className="rounded-xl shadow-lg shadow-primary/25"
          onClick={() => router.push("/characters/new")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Character
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0 rounded-xl"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px] rounded-xl bg-secondary border-0">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="rounded-lg">
                    {role}
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
          Failed to load characters: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <CharacterGrid
          characters={filteredCharacters}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
}
