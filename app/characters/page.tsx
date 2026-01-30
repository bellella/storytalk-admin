"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCircle,
  Smile,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CharacterImage = {
  id: string;
  imageUrl: string;
  label: string | null;
  isDefault: boolean;
};

type StoryLink = {
  id: string;
  story: {
    id: string;
    title: string;
  };
};

type Character = {
  id: string;
  name: string;
  avatarImage: string;
  mainImage: string;
  description: string;
  personality: string | null;
  aiPrompt: string | null;
  images: CharacterImage[];
  storyLinks: StoryLink[];
};

const roles = ["All", "Main", "Support"];

function getRoleColor(isMain: boolean) {
  return isMain ? "bg-primary/10 text-primary" : "bg-success/10 text-success";
}

function getRoleLabel(isMain: boolean) {
  return isMain ? "Main" : "Support";
}

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchCharacters = async () => {
    setLoading(true);
    const res = await fetch("/api/characters");
    const data = await res.json();
    setCharacters(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const filteredCharacters = characters.filter((character) => {
    const matchesSearch = character.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "All" ||
      (roleFilter === "Main" && character.isMain) ||
      (roleFilter === "Support" && !character.isMain);
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (characterId: string) => {
    if (!confirm("Are you sure you want to delete this character?")) return;
    await fetch(`/api/characters/${characterId}`, { method: "DELETE" });
    fetchCharacters();
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
                <SelectValue placeholder="Role" />
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

      {/* Characters Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <Card
              key={character.id}
              className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              onClick={() => router.push(`/characters/${character.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 rounded-xl ring-2 ring-primary/10">
                      <AvatarImage src={character.avatarImage} />
                      <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-lg font-medium">
                        {character.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {character.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            getRoleColor(character.isMain)
                          )}
                        >
                          {getRoleLabel(character.isMain)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/characters/${character.id}`);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="rounded-lg text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(character.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {character.description}
                </p>

                {character.personality && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {character.personality.split(",").map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground"
                      >
                        {trait.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <Smile className="w-4 h-4" />
                    {character.images.length} expressions
                  </span>
                  <span>{character.storyLinks.length} stories</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCharacters.length === 0 && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No characters found</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
