"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  Trash2,
  Save,
  Upload,
  Volume2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Layers,
  BookOpen,
} from "lucide-react"

// Mock lesson data
const mockLesson = {
  id: "1",
  title: "Greetings & Introductions",
  levelId: "1",
  levelTitle: "Getting Started",
  description: "Learn common greetings and how to introduce yourself in various situations.",
  status: "published",
}

// Mock expressions
const mockExpressions = [
  {
    id: "1",
    english: "Nice to meet you",
    korean: "만나서 반갑습니다",
    explanation: "A polite phrase used when meeting someone for the first time. It's appropriate in both formal and casual situations.",
    example: "A: Hi, I'm Sarah. B: Nice to meet you, Sarah. I'm John.",
    audioUrl: null,
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "2",
    english: "How are you doing?",
    korean: "어떻게 지내세요?",
    explanation: "A casual way to ask about someone's well-being. More informal than 'How are you?'",
    example: "Hey Mike! How are you doing? — I'm doing great, thanks!",
    audioUrl: null,
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "3",
    english: "It's been a while",
    korean: "오랜만이네요",
    explanation: "Used when you meet someone you haven't seen for a long time.",
    example: "Sarah! It's been a while. How have you been?",
    audioUrl: null,
    difficulty: "medium",
    isActive: false,
  },
]

export default function LessonDetailPage() {
  const params = useParams()
  const [expressions, setExpressions] = useState(mockExpressions)
  const [showAddExpression, setShowAddExpression] = useState(false)
  const [expandedExpressions, setExpandedExpressions] = useState<string[]>(["1"])
  const [newExpression, setNewExpression] = useState({
    english: "",
    korean: "",
    explanation: "",
    example: "",
    difficulty: "easy",
  })

  const toggleExpanded = (id: string) => {
    setExpandedExpressions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleActive = (id: string) => {
    setExpressions((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, isActive: !exp.isActive } : exp))
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/learning" className="text-muted-foreground hover:text-foreground">
            Learning
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/learning/${params.levelId}`} className="text-muted-foreground hover:text-foreground">
            {mockLesson.levelTitle}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{mockLesson.title}</span>
        </div>

        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="rounded-xl">
            <Link href={`/learning/${params.levelId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Level
            </Link>
          </Button>
        </div>

        {/* Lesson Header Card */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-semibold">{mockLesson.title}</h1>
                    <StatusBadge status={mockLesson.status as "published"} />
                  </div>
                  <p className="text-muted-foreground max-w-xl">{mockLesson.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="rounded-lg">
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      Level {params.levelId}
                    </Badge>
                    <Badge variant="outline" className="rounded-lg">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      {expressions.length} expressions
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="rounded-xl bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Save Lesson
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expressions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Expressions</h2>
              <p className="text-sm text-muted-foreground">Each lesson contains 2-3 key expressions</p>
            </div>
            <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => setShowAddExpression(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expression
            </Button>
          </div>

          <div className="space-y-4">
            {expressions.map((expression, index) => (
              <Card 
                key={expression.id} 
                className={`border-0 shadow-sm rounded-2xl transition-all ${
                  !expression.isActive ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-0">
                  {/* Expression Header */}
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-2xl"
                    onClick={() => toggleExpanded(expression.id)}
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground/40 cursor-grab" />
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{expression.english}</h3>
                        <Badge 
                          variant="outline" 
                          className={`rounded-lg text-xs ${
                            expression.difficulty === "easy" 
                              ? "border-green-300 text-green-700 bg-green-50" 
                              : expression.difficulty === "medium"
                              ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                              : "border-red-300 text-red-700 bg-red-50"
                          }`}
                        >
                          {expression.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{expression.korean}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <Switch 
                          checked={expression.isActive} 
                          onCheckedChange={() => toggleActive(expression.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {expandedExpressions.includes(expression.id) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Expression Editor */}
                  {expandedExpressions.includes(expression.id) && (
                    <div className="border-t border-border p-6 space-y-6 bg-secondary/20 rounded-b-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>English Expression</Label>
                          <Input 
                            value={expression.english} 
                            className="rounded-xl bg-card"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Korean Translation</Label>
                          <Input 
                            value={expression.korean} 
                            className="rounded-xl bg-card"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Explanation</Label>
                        <Textarea 
                          value={expression.explanation}
                          className="rounded-xl bg-card min-h-[80px]"
                          placeholder="Explain when and how to use this expression..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Example Sentence</Label>
                        <Textarea 
                          value={expression.example}
                          className="rounded-xl bg-card"
                          placeholder="Provide an example conversation or sentence..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Audio File</Label>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-xl flex-1 bg-transparent">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Audio
                            </Button>
                            {expression.audioUrl && (
                              <Button variant="ghost" size="icon" className="rounded-xl">
                                <Volume2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select value={expression.difficulty}>
                            <SelectTrigger className="rounded-xl bg-card">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button variant="ghost" className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Expression
                        </Button>
                        <Button className="rounded-xl bg-primary hover:bg-primary/90">
                          <Save className="w-4 h-4 mr-2" />
                          Save Expression
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expression Dialog */}
      <Dialog open={showAddExpression} onOpenChange={setShowAddExpression}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              Add New Expression
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>English Expression</Label>
              <Input
                placeholder="e.g., What do you think?"
                value={newExpression.english}
                onChange={(e) => setNewExpression({ ...newExpression, english: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Korean Translation</Label>
              <Input
                placeholder="e.g., 어떻게 생각해요?"
                value={newExpression.korean}
                onChange={(e) => setNewExpression({ ...newExpression, korean: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                placeholder="Explain when and how to use this expression..."
                value={newExpression.explanation}
                onChange={(e) => setNewExpression({ ...newExpression, explanation: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Example Sentence</Label>
              <Textarea
                placeholder="Provide an example..."
                value={newExpression.example}
                onChange={(e) => setNewExpression({ ...newExpression, example: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select 
                value={newExpression.difficulty} 
                onValueChange={(value) => setNewExpression({ ...newExpression, difficulty: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpression(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              Add Expression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
