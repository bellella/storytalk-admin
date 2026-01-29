"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  ArrowLeft,
  Save,
  Send,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Plus,
  GripVertical,
  ImageIcon,
  Clock,
  Calendar,
  FileText,
  UserCircle,
  Smile,
  Upload,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const mockStory = {
  id: "1",
  title: "The Lost Kingdom",
  category: "Fantasy",
  difficulty: "Intermediate",
  description: "A brave young hero embarks on a journey to discover the secrets of an ancient kingdom lost to time. Along the way, they meet fascinating characters and face challenges that test their courage and wit.",
  estimatedDuration: "45 min",
  status: "draft" as const,
  createdAt: "Jan 15, 2024",
  updatedAt: "2 hours ago",
  episodeCount: 12,
}

const mockEpisodes = [
  { id: "1", number: 1, title: "The Beginning", sceneCount: 5, dialogCount: 24, status: "published" as const },
  { id: "2", number: 2, title: "Into the Forest", sceneCount: 4, dialogCount: 18, status: "published" as const },
  { id: "3", number: 3, title: "The Hidden Village", sceneCount: 6, dialogCount: 32, status: "draft" as const },
  { id: "4", number: 4, title: "Secrets Revealed", sceneCount: 3, dialogCount: 15, status: "draft" as const },
]

const mockCharacters = [
  { id: "1", name: "Luna", role: "Main", avatar: null },
  { id: "2", name: "Marcus", role: "Support", avatar: null },
  { id: "3", name: "Elder Sage", role: "NPC", avatar: null },
]

// Expression images for characters in this story
const mockExpressions = [
  { 
    id: "1", 
    characterId: "1",
    characterName: "Luna", 
    expressionName: "happy", 
    imageUrl: null,
  },
  { 
    id: "2", 
    characterId: "1",
    characterName: "Luna", 
    expressionName: "sad", 
    imageUrl: null,
  },
  { 
    id: "3", 
    characterId: "1",
    characterName: "Luna", 
    expressionName: "surprised", 
    imageUrl: null,
  },
  { 
    id: "4", 
    characterId: "1",
    characterName: "Luna", 
    expressionName: "angry", 
    imageUrl: null,
  },
  { 
    id: "5", 
    characterId: "2",
    characterName: "Marcus", 
    expressionName: "neutral", 
    imageUrl: null,
  },
  { 
    id: "6", 
    characterId: "2",
    characterName: "Marcus", 
    expressionName: "thinking", 
    imageUrl: null,
  },
  { 
    id: "7", 
    characterId: "3",
    characterName: "Elder Sage", 
    expressionName: "wise", 
    imageUrl: null,
  },
]

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "episodes", label: "Episodes", icon: FileText },
  { id: "characters", label: "Characters", icon: UserCircle },
  { id: "expressions", label: "Expressions", icon: Smile },
]

const categories = ["Fantasy", "Romance", "Mystery", "Sci-Fi", "Drama", "Adventure"]
const difficulties = ["Beginner", "Intermediate", "Advanced"]

export default function StoryDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")
  const [story, setStory] = useState(mockStory)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setStory({ ...story, [field]: value })
    setHasUnsavedChanges(true)
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stories
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">{story.title}</h1>
                <StatusBadge status={story.status} />
              </div>
              <p className="text-muted-foreground mt-1">
                {story.category} · {story.difficulty} · {story.episodeCount} episodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-warning">Unsaved changes</span>
            )}
            <Button variant="outline" className="rounded-xl bg-transparent">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button className="rounded-xl shadow-lg shadow-primary/25">
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-secondary/50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Story Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="title"
                    value={story.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-2 rounded-xl bg-secondary border-0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select
                      value={story.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="rounded-lg">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <Select
                      value={story.difficulty}
                      onValueChange={(value) => handleInputChange("difficulty", value)}
                    >
                      <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {difficulties.map((diff) => (
                          <SelectItem key={diff} value={diff} className="rounded-lg">
                            {diff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={story.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="mt-2 rounded-xl bg-secondary border-0 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium">Estimated Duration</Label>
                  <Input
                    id="duration"
                    value={story.estimatedDuration}
                    onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                    className="mt-2 rounded-xl bg-secondary border-0"
                    placeholder="e.g., 45 min"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Icon</Label>
                    <div className="mt-2 h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">Upload icon</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cover Image</Label>
                    <div className="mt-2 h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">Upload cover</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <Switch
                    checked={story.status === "published"}
                    onCheckedChange={(checked) =>
                      handleInputChange("status", checked ? "published" : "draft")
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">{story.createdAt}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="text-foreground">{story.updatedAt}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Episodes:</span>
                  <span className="text-foreground">{story.episodeCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "episodes" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">Drag to reorder episodes</p>
            <Button className="rounded-xl shadow-lg shadow-primary/25">
              <Plus className="w-4 h-4 mr-2" />
              Create Episode
            </Button>
          </div>
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/50">
              {mockEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {episode.number}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/stories/${params.id}/episodes/${episode.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {episode.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {episode.sceneCount} scenes · {episode.dialogCount} dialogs
                    </p>
                  </div>
                  <StatusBadge status={episode.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem className="rounded-lg">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "characters" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">Characters appearing in this story</p>
            <Button variant="outline" className="rounded-xl bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {mockCharacters.map((character) => (
              <Card key={character.id} className="rounded-2xl border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{character.name}</p>
                      <p className="text-sm text-muted-foreground">{character.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "expressions" && (
        <ExpressionsTab />
      )}
    </AdminLayout>
  )
}

function ExpressionsTab() {
  const [expressions, setExpressions] = useState(mockExpressions)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newExpression, setNewExpression] = useState({ characterId: "", expressionName: "" })

  // Group expressions by character
  const expressionsByCharacter = expressions.reduce((acc, expr) => {
    if (!acc[expr.characterId]) {
      acc[expr.characterId] = {
        characterName: expr.characterName,
        expressions: []
      }
    }
    acc[expr.characterId].expressions.push(expr)
    return acc
  }, {} as Record<string, { characterName: string; expressions: typeof mockExpressions }>)

  const filteredCharacters = selectedCharacter 
    ? { [selectedCharacter]: expressionsByCharacter[selectedCharacter] }
    : expressionsByCharacter

  const handleAddExpression = () => {
    if (!newExpression.characterId || !newExpression.expressionName.trim()) return
    
    const character = mockCharacters.find(c => c.id === newExpression.characterId)
    if (!character) return

    const newExpr = {
      id: String(expressions.length + 1),
      characterId: newExpression.characterId,
      characterName: character.name,
      expressionName: newExpression.expressionName.toLowerCase().trim(),
      imageUrl: null,
    }
    
    setExpressions([...expressions, newExpr])
    setNewExpression({ characterId: "", expressionName: "" })
    setIsAddingNew(false)
  }

  const handleDeleteExpression = (id: string) => {
    setExpressions(expressions.filter(e => e.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">Character expression images used in dialogs</p>
          <Select
            value={selectedCharacter || "all"}
            onValueChange={(value) => setSelectedCharacter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px] rounded-xl bg-card border-border/50">
              <SelectValue placeholder="All Characters" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">All Characters</SelectItem>
              {mockCharacters.map((char) => (
                <SelectItem key={char.id} value={char.id} className="rounded-lg">
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="rounded-xl shadow-lg shadow-primary/25"
          onClick={() => setIsAddingNew(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expression
        </Button>
      </div>

      {/* Add New Expression Form */}
      {isAddingNew && (
        <Card className="rounded-2xl border-border/50 shadow-sm mb-6 border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">Character</Label>
                <Select
                  value={newExpression.characterId}
                  onValueChange={(value) => setNewExpression({ ...newExpression, characterId: value })}
                >
                  <SelectTrigger className="mt-2 rounded-xl bg-card border-border/50">
                    <SelectValue placeholder="Select character" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {mockCharacters.map((char) => (
                      <SelectItem key={char.id} value={char.id} className="rounded-lg">
                        {char.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Expression Name</Label>
                <Input
                  value={newExpression.expressionName}
                  onChange={(e) => setNewExpression({ ...newExpression, expressionName: e.target.value })}
                  placeholder="e.g., happy, sad, angry"
                  className="mt-2 rounded-xl bg-card border-border/50"
                />
              </div>
              <Button 
                className="rounded-xl"
                onClick={handleAddExpression}
                disabled={!newExpression.characterId || !newExpression.expressionName.trim()}
              >
                Add
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl bg-transparent"
                onClick={() => {
                  setIsAddingNew(false)
                  setNewExpression({ characterId: "", expressionName: "" })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expressions grouped by character */}
      <div className="space-y-8">
        {Object.entries(filteredCharacters).map(([characterId, data]) => (
          <div key={characterId}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{data.characterName}</h3>
                <p className="text-sm text-muted-foreground">{data.expressions.length} expressions</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {data.expressions.map((expression) => (
                <Card 
                  key={expression.id} 
                  className="rounded-2xl border-border/50 shadow-sm overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="aspect-[3/4] bg-secondary relative">
                    {expression.imageUrl ? (
                      <img 
                        src={expression.imageUrl || "/placeholder.svg"} 
                        alt={`${expression.characterName} - ${expression.expressionName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">Upload image</span>
                        <span className="text-xs text-muted-foreground/60 mt-1">Upper-body shot</span>
                      </div>
                    )}
                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="rounded-xl">
                        <Upload className="w-4 h-4 mr-1" />
                        Replace
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-xl h-9 w-9"
                        onClick={() => handleDeleteExpression(expression.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium capitalize">
                        <Smile className="w-3.5 h-3.5" />
                        {expression.expressionName}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="rounded-lg">
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg">
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-lg text-destructive"
                            onClick={() => handleDeleteExpression(expression.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Add more expression card */}
              <Card 
                className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 shadow-sm overflow-hidden cursor-pointer transition-colors group"
                onClick={() => {
                  setNewExpression({ characterId, expressionName: "" })
                  setIsAddingNew(true)
                }}
              >
                <div className="aspect-[3/4] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Add expression</span>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
