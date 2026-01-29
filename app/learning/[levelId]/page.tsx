"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  GripVertical,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Edit,
  Save,
} from "lucide-react"

// Mock level data
const mockLevel = {
  id: "1",
  number: 1,
  title: "Getting Started",
  description: "Learn the basics of English conversation with simple phrases and greetings.",
  difficultyRange: "A1",
  status: "published",
}

// Mock lessons data
const mockLessons = [
  {
    id: "1",
    title: "Greetings & Introductions",
    expressionCount: 3,
    status: "published",
  },
  {
    id: "2",
    title: "Asking for Directions",
    expressionCount: 2,
    status: "published",
  },
  {
    id: "3",
    title: "Ordering Food",
    expressionCount: 3,
    status: "published",
  },
  {
    id: "4",
    title: "Making Small Talk",
    expressionCount: 2,
    status: "draft",
  },
  {
    id: "5",
    title: "Shopping Phrases",
    expressionCount: 3,
    status: "draft",
  },
]

export default function LevelDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("lessons")
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: "", description: "" })
  const [settings, setSettings] = useState({
    title: mockLevel.title,
    description: mockLevel.description,
    difficultyRange: mockLevel.difficultyRange,
    status: mockLevel.status,
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Navigation & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <Link href="/learning">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Levels
              </Link>
            </Button>
          </div>
        </div>

        {/* Level Header */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{mockLevel.number}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-semibold">{mockLevel.title}</h1>
                    <Badge variant="outline" className="rounded-lg font-medium">
                      {mockLevel.difficultyRange}
                    </Badge>
                    <StatusBadge status={mockLevel.status as "published"} />
                  </div>
                  <p className="text-muted-foreground max-w-xl">{mockLevel.description}</p>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{mockLessons.length}</span>
                      <span className="text-muted-foreground">lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{mockLessons.reduce((acc, l) => acc + l.expressionCount, 0)}</span>
                      <span className="text-muted-foreground">expressions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border rounded-xl p-1 h-auto">
            <TabsTrigger value="lessons" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Lessons
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Drag to reorder lessons</p>
              <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => setShowAddLesson(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </div>

            <div className="space-y-3">
              {mockLessons.map((lesson, index) => (
                <Card key={lesson.id} className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground/40 cursor-grab group-hover:text-muted-foreground" />
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <StatusBadge status={lesson.status as "published" | "draft"} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{lesson.expressionCount} expressions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="rounded-xl">
                          <Link href={`/learning/${params.levelId}/lessons/${lesson.id}`}>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Level Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Level Title</Label>
                    <Input
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty Range</Label>
                    <Input
                      value={settings.difficultyRange}
                      onChange={(e) => setSettings({ ...settings, difficultyRange: e.target.value })}
                      className="rounded-xl"
                      placeholder="e.g., A1, A1-A2, B1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    className="rounded-xl min-h-[100px]"
                    placeholder="Describe what learners will achieve in this level..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={settings.status} onValueChange={(value) => setSettings({ ...settings, status: value })}>
                    <SelectTrigger className="w-48 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button className="rounded-xl bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Lesson Dialog */}
      <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              Add New Lesson
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="e.g., Talking About Hobbies"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of the lesson content..."
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLesson(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              Create Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
