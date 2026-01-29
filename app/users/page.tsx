"use client"

import { useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserX,
  RotateCcw,
  Flame,
  Star,
  Crown,
  Download,
} from "lucide-react"

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "Emma Watson",
    email: "emma@example.com",
    avatar: null,
    level: 12,
    totalExp: 4850,
    streak: 45,
    lastActive: "2024-01-15",
    status: "active",
    hasPremium: true,
  },
  {
    id: "2",
    name: "James Lee",
    email: "james.lee@example.com",
    avatar: null,
    level: 8,
    totalExp: 2340,
    streak: 12,
    lastActive: "2024-01-14",
    status: "active",
    hasPremium: false,
  },
  {
    id: "3",
    name: "Sofia Chen",
    email: "sofia.chen@example.com",
    avatar: null,
    level: 15,
    totalExp: 6120,
    streak: 89,
    lastActive: "2024-01-15",
    status: "active",
    hasPremium: true,
  },
  {
    id: "4",
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    avatar: null,
    level: 5,
    totalExp: 1200,
    streak: 0,
    lastActive: "2024-01-02",
    status: "inactive",
    hasPremium: false,
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.com",
    avatar: null,
    level: 10,
    totalExp: 3500,
    streak: 23,
    lastActive: "2024-01-13",
    status: "active",
    hasPremium: true,
  },
  {
    id: "6",
    name: "Alex Rivera",
    email: "alex.r@example.com",
    avatar: null,
    level: 3,
    totalExp: 650,
    streak: 5,
    lastActive: "2024-01-10",
    status: "suspended",
    hasPremium: false,
  },
]

const statsCards = [
  { label: "Total Users", value: "12,458", icon: Star, color: "bg-primary/10 text-primary" },
  { label: "Active Today", value: "3,241", icon: Flame, color: "bg-success/10 text-success" },
  { label: "Premium Users", value: "4,892", icon: Crown, color: "bg-warning/10 text-warning" },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [premiumFilter, setPremiumFilter] = useState("all")

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel =
      levelFilter === "all" ||
      (levelFilter === "1-5" && user.level >= 1 && user.level <= 5) ||
      (levelFilter === "6-10" && user.level >= 6 && user.level <= 10) ||
      (levelFilter === "11+" && user.level >= 11)
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesPremium =
      premiumFilter === "all" ||
      (premiumFilter === "premium" && user.hasPremium) ||
      (premiumFilter === "free" && !user.hasPremium)

    return matchesSearch && matchesLevel && matchesStatus && matchesPremium
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage learners and track their progress"
        >
          <Button variant="outline" className="rounded-xl bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
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

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-border bg-secondary/50"
                />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1-5">Level 1-5</SelectItem>
                  <SelectItem value="6-10">Level 6-10</SelectItem>
                  <SelectItem value="11+">Level 11+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="font-semibold">Total EXP</TableHead>
                <TableHead className="font-semibold">Streak</TableHead>
                <TableHead className="font-semibold">Last Active</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-border">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.hasPremium && (
                            <Crown className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{user.level}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.totalExp.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">EXP</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Flame className={`w-4 h-4 ${user.streak > 0 ? "text-orange-500" : "text-muted-foreground/40"}`} />
                      <span className={user.streak > 0 ? "font-medium" : "text-muted-foreground"}>
                        {user.streak} days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {new Date(user.lastActive).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status as "active" | "inactive" | "suspended"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem asChild>
                          <Link href={`/users/${user.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserX className="w-4 h-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  )
}
