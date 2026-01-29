"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Archive,
  UserCircle,
  ImageIcon,
  Smile,
  X,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const mockCharacters = [
  {
    id: "1",
    name: "Luna",
    role: "Main",
    status: "published" as const,
    description: "A curious and brave young adventurer with a heart of gold.",
    traits: ["Brave", "Curious", "Kind"],
    expressionCount: 8,
    storiesCount: 5,
  },
  {
    id: "2",
    name: "Marcus",
    role: "Support",
    status: "published" as const,
    description: "A wise mentor figure who guides the protagonist.",
    traits: ["Wise", "Patient", "Protective"],
    expressionCount: 6,
    storiesCount: 3,
  },
  {
    id: "3",
    name: "Elder Sage",
    role: "NPC",
    status: "draft" as const,
    description: "An ancient keeper of forgotten knowledge.",
    traits: ["Mysterious", "Ancient", "Knowledgeable"],
    expressionCount: 4,
    storiesCount: 2,
  },
  {
    id: "4",
    name: "Aria",
    role: "Main",
    status: "published" as const,
    description: "A skilled archer with a sharp wit and sharper aim.",
    traits: ["Skilled", "Witty", "Independent"],
    expressionCount: 7,
    storiesCount: 4,
  },
  {
    id: "5",
    name: "Shadow",
    role: "Support",
    status: "archived" as const,
    description: "A mysterious figure who appears when least expected.",
    traits: ["Mysterious", "Stealthy", "Loyal"],
    expressionCount: 5,
    storiesCount: 1,
  },
]

const roles = ["All", "Main", "Support", "NPC"]
const roleOptions = ["Main", "Support", "NPC"]
const expressions = ["happy", "sad", "angry", "neutral", "surprised", "worried", "excited", "thinking"]

function getRoleColor(role: string) {
  switch (role.toLowerCase()) {
    case "main":
      return "bg-primary/10 text-primary"
    case "support":
      return "bg-success/10 text-success"
    case "npc":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function CharactersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [selectedCharacter, setSelectedCharacter] = useState<typeof mockCharacters[0] | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const filteredCharacters = mockCharacters.filter((character) => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "All" || character.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <AdminLayout>
      <PageHeader
        title="Characters"
        description="Manage reusable characters across all stories"
      >
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/25">
              <Plus className="w-4 h-4 mr-2" />
              Create Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {selectedCharacter ? "Edit Character" : "Create Character"}
              </DialogTitle>
            </DialogHeader>
            <CharacterEditor
              character={selectedCharacter}
              onClose={() => {
                setIsEditorOpen(false)
                setSelectedCharacter(null)
              }}
            />
          </DialogContent>
        </Dialog>
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
      <div className="grid grid-cols-3 gap-6">
        {filteredCharacters.map((character) => (
          <Card
            key={character.id}
            className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 rounded-xl ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-lg font-medium">
                      {character.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{character.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getRoleColor(character.role))}>
                        {character.role}
                      </span>
                      <StatusBadge status={character.status} />
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() => {
                        setSelectedCharacter(character)
                        setIsEditorOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg text-destructive">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {character.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {character.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                <span className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4" />
                  {character.expressionCount} expressions
                </span>
                <span>{character.storiesCount} stories</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No characters found</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  )
}

function CharacterEditor({
  character,
  onClose,
}: {
  character: typeof mockCharacters[0] | null
  onClose: () => void
}) {
  const [name, setName] = useState(character?.name || "")
  const [role, setRole] = useState(character?.role || "Main")
  const [description, setDescription] = useState(character?.description || "")
  const [traits, setTraits] = useState(character?.traits.join(", ") || "")
  const [aiPrompt, setAiPrompt] = useState("")

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Character Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 rounded-xl bg-secondary border-0"
              placeholder="Enter character name"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Role Type</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r} className="rounded-lg">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 rounded-xl bg-secondary border-0 min-h-[100px]"
              placeholder="Brief character description..."
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Personality Traits</Label>
            <Input
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
              className="mt-2 rounded-xl bg-secondary border-0"
              placeholder="Brave, Curious, Kind (comma separated)"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Default Avatar</Label>
            <div className="mt-2 h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-sm text-muted-foreground">Upload avatar</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Expression Images</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {expressions.slice(0, 8).map((exp) => (
                <div
                  key={exp}
                  className="aspect-square rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <Smile className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground capitalize">{exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Prompt Section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">AI Character Prompt</Label>
        </div>
        <Textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="rounded-xl bg-secondary border-0 min-h-[120px]"
          placeholder="Describe how this character should behave and respond in conversations. This will guide the AI when generating dialog for this character..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose} className="rounded-xl bg-transparent">
          Cancel
        </Button>
        <Button className="rounded-xl shadow-lg shadow-primary/25">
          {character ? "Save Changes" : "Create Character"}
        </Button>
      </div>
    </div>
  )
}
