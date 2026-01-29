"use client"

import { useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  MoreHorizontal,
  Edit,
  GripVertical,
  BookOpen,
  MessageSquare,
  ChevronRight,
  GraduationCap,
  Layers,
} from "lucide-react"

// Mock levels data
const mockLevels = [
  {
    id: "1",
    number: 1,
    title: "Getting Started",
    lessonCount: 8,
    expressionCount: 20,
    difficultyRange: "A1",
    status: "published",
  },
  {
    id: "2",
    number: 2,
    title: "Daily Conversations",
    lessonCount: 10,
    expressionCount: 28,
    difficultyRange: "A1-A2",
    status: "published",
  },
  {
    id: "3",
    number: 3,
    title: "Travel & Directions",
    lessonCount: 8,
    expressionCount: 22,
    difficultyRange: "A2",
    status: "published",
  },
  {
    id: "4",
    number: 4,
    title: "Work & Business",
    lessonCount: 12,
    expressionCount: 32,
    difficultyRange: "A2-B1",
    status: "draft",
  },
  {
    id: "5",
    number: 5,
    title: "Social Situations",
    lessonCount: 6,
    expressionCount: 15,
    difficultyRange: "B1",
    status: "draft",
  },
]

const statsCards = [
  { label: "Total Levels", value: "5", icon: Layers, color: "bg-primary/10 text-primary" },
  { label: "Total Lessons", value: "44", icon: BookOpen, color: "bg-green-100 text-green-600" },
  { label: "Total Expressions", value: "117", icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
]

export default function LearningPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newLevel, setNewLevel] = useState({ title: "", difficultyRange: "" })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Learning Content"
          description="Manage levels, lessons, and expressions"
        >
          <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Level
          </Button>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Levels Table */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Lessons</TableHead>
                <TableHead className="font-semibold">Expressions</TableHead>
                <TableHead className="font-semibold">Difficulty</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLevels.map((level) => (
                <TableRow key={level.id} className="hover:bg-secondary/30 group">
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab group-hover:text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">{level.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/learning/${level.id}`} className="font-medium hover:text-primary transition-colors">
                      {level.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{level.lessonCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span>{level.expressionCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg font-medium">
                      {level.difficultyRange}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={level.status as "published" | "draft"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild className="rounded-xl">
                        <Link href={`/learning/${level.id}`}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Level
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Level Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              Add New Level
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Level Title</Label>
              <Input
                placeholder="e.g., Advanced Conversations"
                value={newLevel.title}
                onChange={(e) => setNewLevel({ ...newLevel, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty Range</Label>
              <Input
                placeholder="e.g., B1-B2"
                value={newLevel.difficultyRange}
                onChange={(e) => setNewLevel({ ...newLevel, difficultyRange: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              Create Level
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
