"use client"

import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  UserCircle,
} from "lucide-react"

const stats = [
  {
    label: "Total Stories",
    value: "24",
    change: "+3 this week",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Active Learners",
    value: "1,842",
    change: "+12% growth",
    icon: Users,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Episodes Created",
    value: "156",
    change: "+8 this week",
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    label: "Engagement Rate",
    value: "78%",
    change: "+5% increase",
    icon: TrendingUp,
    color: "text-accent-foreground",
    bgColor: "bg-accent",
  },
]

const recentStories = [
  {
    id: "1",
    title: "The Lost Kingdom",
    category: "Fantasy",
    status: "draft" as const,
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Coffee Shop Romance",
    category: "Romance",
    status: "published" as const,
    updatedAt: "1 day ago",
  },
  {
    id: "3",
    title: "Mystery at Midnight",
    category: "Mystery",
    status: "published" as const,
    updatedAt: "3 days ago",
  },
]

const recentActivity = [
  {
    user: "Admin",
    action: "published",
    target: "Episode 5 of The Lost Kingdom",
    time: "30 min ago",
  },
  {
    user: "Writer",
    action: "created",
    target: "New character: Aria",
    time: "2 hours ago",
  },
  {
    user: "Admin",
    action: "updated",
    target: "Coffee Shop Romance description",
    time: "5 hours ago",
  },
]

export default function DashboardPage() {
  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your content."
      >
        <Link href="/stories">
          <Button className="rounded-xl shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" />
            Create Story
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-success mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Stories */}
        <div className="col-span-2">
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Recent Stories</CardTitle>
                <Link href="/stories">
                  <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground">
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {story.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{story.category}</p>
                  </div>
                  <StatusBadge status={story.status} />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {story.updatedAt}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 rounded-lg flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs">
                      {activity.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/stories">
            <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <BookOpen className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">New Story</p>
                  <p className="text-sm text-muted-foreground">Create a new story</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/characters">
            <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success transition-colors">
                  <UserCircle className="w-5 h-5 text-success group-hover:text-success-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">New Character</p>
                  <p className="text-sm text-muted-foreground">Add a character</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning transition-colors">
                <FileText className="w-5 h-5 text-warning group-hover:text-warning-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">New Episode</p>
                <p className="text-sm text-muted-foreground">Add an episode</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary transition-colors">
                <TrendingUp className="w-5 h-5 text-accent-foreground group-hover:text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">View Analytics</p>
                <p className="text-sm text-muted-foreground">See performance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
