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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  FileText,
  Gift,
  MessageSquare,
  Smile,
  X,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const mockEpisode = {
  id: "1",
  number: 1,
  title: "The Beginning",
  status: "draft" as const,
}

const mockScenes = [
  { id: "1", number: 1, title: "Morning Wake Up", dialogCount: 6 },
  { id: "2", number: 2, title: "Breakfast Talk", dialogCount: 8 },
  { id: "3", number: 3, title: "Journey Begins", dialogCount: 10 },
]

const mockDialogs = [
  {
    id: "1",
    characterId: "1",
    characterName: "Luna",
    expression: "happy",
    englishText: "Good morning! Did you sleep well?",
    koreanText: "좋은 아침이에요! 잘 주무셨어요?",
    emotion: "cheerful",
  },
  {
    id: "2",
    characterId: "2",
    characterName: "Marcus",
    expression: "neutral",
    englishText: "Not really. I kept thinking about our journey.",
    koreanText: "별로요. 계속 우리 여행에 대해 생각했어요.",
    emotion: "thoughtful",
  },
  {
    id: "3",
    characterId: "1",
    characterName: "Luna",
    expression: "worried",
    englishText: "Are you nervous about what we might find?",
    koreanText: "우리가 무엇을 발견할지 긴장되세요?",
    emotion: "concerned",
  },
]

const mockCharacters = [
  { id: "1", name: "Luna", avatar: null },
  { id: "2", name: "Marcus", avatar: null },
  { id: "3", name: "Elder Sage", avatar: null },
]

const expressions = ["happy", "sad", "angry", "neutral", "surprised", "worried", "excited"]
const emotions = ["cheerful", "thoughtful", "concerned", "excited", "calm", "serious"]

const tabs = [
  { id: "scenes", label: "Scenes", icon: FileText },
  { id: "rewards", label: "Rewards", icon: Gift },
]

const rewardTypes = [
  { type: "exp", label: "Experience Points", value: 100 },
  { type: "character", label: "Character Unlock", value: "Luna" },
]

export default function EpisodeDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("scenes")
  const [selectedScene, setSelectedScene] = useState(mockScenes[0])
  const [selectedDialog, setSelectedDialog] = useState(mockDialogs[0])
  const [episode, setEpisode] = useState(mockEpisode)

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/stories/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Story
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {episode.number}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Input
                  value={episode.title}
                  onChange={(e) => setEpisode({ ...episode, title: e.target.value })}
                  className="text-2xl font-semibold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <StatusBadge status={episode.status} />
              </div>
              <p className="text-muted-foreground mt-1">
                Episode {episode.number} · {mockScenes.length} scenes · {mockDialogs.length} dialogs
              </p>
            </div>
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/25">
            <Save className="w-4 h-4 mr-2" />
            Save Episode
          </Button>
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

      {/* Scenes Tab - Three Panel Layout */}
      {activeTab === "scenes" && (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Left Panel - Scenes List */}
          <div className="col-span-3">
            <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Scenes</CardTitle>
                  <Button size="sm" className="rounded-xl h-8">
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-2 p-3 pt-0">
                {mockScenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedScene?.id === scene.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <GripVertical className={cn(
                      "w-4 h-4 flex-shrink-0",
                      selectedScene?.id === scene.id ? "text-primary-foreground/50" : "text-muted-foreground/50"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{scene.title}</p>
                      <p className={cn(
                        "text-xs",
                        selectedScene?.id === scene.id ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {scene.dialogCount} dialogs
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4",
                      selectedScene?.id === scene.id ? "text-primary-foreground/50" : "text-muted-foreground/30"
                    )} />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Dialog Timeline */}
          <div className="col-span-5">
            <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Dialog Timeline</CardTitle>
                  <Button size="sm" className="rounded-xl h-8">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Dialog
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-3 p-3 pt-0">
                {mockDialogs.map((dialog, index) => (
                  <button
                    key={dialog.id}
                    onClick={() => setSelectedDialog(dialog)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedDialog?.id === dialog.id
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "hover:bg-secondary"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-1 flex-shrink-0" />
                    <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm">
                        {dialog.characterName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{dialog.characterName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                          {dialog.expression}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{dialog.englishText}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Dialog Editor */}
          <div className="col-span-4">
            <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Dialog Editor</CardTitle>
                  <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-4 p-4 pt-0">
                {selectedDialog && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Character</Label>
                      <Select defaultValue={selectedDialog.characterId}>
                        <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                          <SelectValue />
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

                    <div>
                      <Label className="text-sm font-medium">Expression</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {expressions.slice(0, 8).map((exp) => (
                          <button
                            key={exp}
                            className={cn(
                              "p-2 rounded-xl text-center transition-all duration-200",
                              selectedDialog.expression === exp
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                            )}
                          >
                            <Smile className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs capitalize">{exp}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">English Text</Label>
                      <Textarea
                        defaultValue={selectedDialog.englishText}
                        className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Korean Translation</Label>
                      <Textarea
                        defaultValue={selectedDialog.koreanText}
                        className="mt-2 rounded-xl bg-secondary border-0 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Emotion Tag</Label>
                      <Select defaultValue={selectedDialog.emotion}>
                        <SelectTrigger className="mt-2 rounded-xl bg-secondary border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {emotions.map((emotion) => (
                            <SelectItem key={emotion} value={emotion} className="rounded-lg capitalize">
                              {emotion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Voice Audio (Optional)</Label>
                      <div className="mt-2 h-20 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                        <div className="text-center">
                          <MessageSquare className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground">Upload audio</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="max-w-2xl">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Episode Rewards</CardTitle>
                <Button size="sm" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewardTypes.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{reward.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {reward.type === "exp" ? `${reward.value} XP` : `Unlock: ${reward.value}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
