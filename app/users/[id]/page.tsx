"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Crown,
  Flame,
  Star,
  BookOpen,
  Trophy,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  ChevronRight,
  Sparkles,
  Gift,
  UserCircle,
  Calendar,
} from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "Emma Watson",
  email: "emma@example.com",
  avatar: null,
  level: 12,
  totalExp: 4850,
  expToNextLevel: 5500,
  streak: 45,
  lastActive: "2024-01-15",
  joinedDate: "2023-06-12",
  status: "active",
  hasPremium: true,
  storiesCompleted: 8,
  episodesCompleted: 42,
}

// Mock story progress
const mockStoryProgress = [
  {
    id: "1",
    title: "The Coffee Shop Mystery",
    completion: 100,
    currentEpisode: 12,
    totalEpisodes: 12,
    lastAccessed: "2024-01-10",
    status: "completed",
  },
  {
    id: "2",
    title: "Summer in Seoul",
    completion: 75,
    currentEpisode: 9,
    totalEpisodes: 12,
    lastAccessed: "2024-01-15",
    status: "in-progress",
  },
  {
    id: "3",
    title: "The Lost Letter",
    completion: 30,
    currentEpisode: 3,
    totalEpisodes: 10,
    lastAccessed: "2024-01-08",
    status: "in-progress",
  },
]

// Mock episode progress
const mockEpisodeProgress = [
  { id: "1", title: "First Meeting", storyTitle: "Summer in Seoul", status: "completed", completedAt: "2024-01-15", timeSpent: "12 min" },
  { id: "2", title: "The Cafe Conversation", storyTitle: "Summer in Seoul", status: "completed", completedAt: "2024-01-14", timeSpent: "15 min" },
  { id: "3", title: "A Surprise Encounter", storyTitle: "Summer in Seoul", status: "completed", completedAt: "2024-01-13", timeSpent: "10 min" },
  { id: "4", title: "The Park Bench", storyTitle: "The Lost Letter", status: "in-progress", completedAt: null, timeSpent: "5 min" },
]

// Mock rewards log
const mockRewardsLog = [
  { id: "1", type: "exp", description: "+50 EXP (Episode completed)", date: "2024-01-15", icon: Sparkles },
  { id: "2", type: "character", description: "Character unlocked: Luna", date: "2024-01-14", icon: UserCircle },
  { id: "3", type: "item", description: "Item rewarded: Golden Bookmark", date: "2024-01-13", icon: Gift },
  { id: "4", type: "exp", description: "+100 EXP (Story completed)", date: "2024-01-10", icon: Sparkles },
  { id: "5", type: "achievement", description: "Achievement: 7-Day Streak", date: "2024-01-08", icon: Trophy },
]

// Mock character relationships
const mockCharacters = [
  { id: "1", name: "Luna", avatar: null, affinityLevel: 8, unlockedDate: "2024-01-14", chatCount: 24, lastInteraction: "2024-01-15" },
  { id: "2", name: "James", avatar: null, affinityLevel: 5, unlockedDate: "2023-12-20", chatCount: 12, lastInteraction: "2024-01-10" },
  { id: "3", name: "Sophie", avatar: null, affinityLevel: 3, unlockedDate: "2024-01-05", chatCount: 6, lastInteraction: "2024-01-08" },
]

// Mock vocabulary
const mockVocabulary = [
  { id: "1", expression: "break the ice", meaning: "To start a conversation", source: "Summer in Seoul - Ep. 1", mastery: 85, lastReviewed: "2024-01-14", bookmarked: true },
  { id: "2", expression: "hit the books", meaning: "To study hard", source: "The Coffee Shop - Ep. 3", mastery: 70, lastReviewed: "2024-01-12", bookmarked: true },
  { id: "3", expression: "piece of cake", meaning: "Something very easy", source: "Summer in Seoul - Ep. 5", mastery: 95, lastReviewed: "2024-01-15", bookmarked: false },
  { id: "4", expression: "under the weather", meaning: "Feeling sick or unwell", source: "The Lost Letter - Ep. 2", mastery: 40, lastReviewed: "2024-01-08", bookmarked: true },
]

// Mock activity timeline
const mockActivity = [
  { id: "1", type: "episode", description: "Completed Episode 9 of Summer in Seoul", date: "2024-01-15", exp: 50 },
  { id: "2", type: "character", description: "Unlocked character Luna", date: "2024-01-14", exp: 0 },
  { id: "3", type: "episode", description: "Completed Episode 8 of Summer in Seoul", date: "2024-01-14", exp: 50 },
  { id: "4", type: "streak", description: "Reached 45-day streak!", date: "2024-01-13", exp: 100 },
]

export default function UserDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="rounded-xl">
            <Link href="/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>

        {/* User Header */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 ring-4 ring-card">
                <AvatarImage src={mockUser.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {mockUser.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold">{mockUser.name}</h1>
                  {mockUser.hasPremium && (
                    <Badge className="bg-warning/10 text-warning border-0 rounded-lg">
                      <Crown className="w-3.5 h-3.5 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <StatusBadge status={mockUser.status as "active"} />
                </div>
                <p className="text-muted-foreground">{mockUser.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Joined {new Date(mockUser.joinedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl bg-transparent">
                  Reset Progress
                </Button>
                <Button variant="destructive" className="rounded-xl">
                  Suspend User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border rounded-xl p-1 h-auto">
            <TabsTrigger value="overview" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="story-progress" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Story Progress
            </TabsTrigger>
            <TabsTrigger value="episode-progress" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Episode Progress
            </TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Rewards & EXP
            </TabsTrigger>
            <TabsTrigger value="characters" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Characters
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Vocabulary
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{mockUser.level}</p>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{mockUser.totalExp.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total EXP</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold">{mockUser.streak}</p>
                  <p className="text-sm text-muted-foreground">Streak Days</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{mockUser.storiesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Stories Done</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{mockUser.episodesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Episodes Done</p>
                </CardContent>
              </Card>
            </div>

            {/* Level Progress */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Level Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress to Level {mockUser.level + 1}</span>
                    <span className="font-medium">{mockUser.totalExp} / {mockUser.expToNextLevel} EXP</span>
                  </div>
                  <Progress value={(mockUser.totalExp / mockUser.expToNextLevel) * 100} className="h-3 rounded-full" />
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {activity.type === "episode" && <BookOpen className="w-5 h-5 text-primary" />}
                        {activity.type === "character" && <UserCircle className="w-5 h-5 text-primary" />}
                        {activity.type === "streak" && <Flame className="w-5 h-5 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      {activity.exp > 0 && (
                        <Badge className="bg-green-100 text-green-700 border-0 rounded-lg">
                          +{activity.exp} EXP
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Progress Tab */}
          <TabsContent value="story-progress" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-semibold">Story</TableHead>
                    <TableHead className="font-semibold">Completion</TableHead>
                    <TableHead className="font-semibold">Current Episode</TableHead>
                    <TableHead className="font-semibold">Last Accessed</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStoryProgress.map((story) => (
                    <TableRow key={story.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{story.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 w-32">
                          <Progress value={story.completion} className="h-2 flex-1" />
                          <span className="text-sm text-muted-foreground w-10">{story.completion}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          Episode {story.currentEpisode} / {story.totalEpisodes}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(story.lastAccessed).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={story.status === "completed" ? "published" : "draft"} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Episode Progress Tab */}
          <TabsContent value="episode-progress" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-semibold">Episode</TableHead>
                    <TableHead className="font-semibold">Story</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Completed</TableHead>
                    <TableHead className="font-semibold">Time Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEpisodeProgress.map((episode) => (
                    <TableRow key={episode.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{episode.title}</TableCell>
                      <TableCell className="text-muted-foreground">{episode.storyTitle}</TableCell>
                      <TableCell>
                        <StatusBadge status={episode.status === "completed" ? "published" : "draft"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {episode.completedAt ? new Date(episode.completedAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {episode.timeSpent}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Rewards & EXP Tab */}
          <TabsContent value="rewards" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Rewards Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRewardsLog.map((reward) => (
                    <div key={reward.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reward.type === "exp" ? "bg-green-100" : 
                        reward.type === "character" ? "bg-primary/10" :
                        reward.type === "item" ? "bg-warning/10" : "bg-accent"
                      }`}>
                        <reward.icon className={`w-5 h-5 ${
                          reward.type === "exp" ? "text-green-600" : 
                          reward.type === "character" ? "text-primary" :
                          reward.type === "item" ? "text-warning" : "text-accent-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{reward.description}</p>
                        <p className="text-sm text-muted-foreground">{reward.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCharacters.map((character) => (
                <Card key={character.id} className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                        <AvatarImage src={character.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                          {character.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{character.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="text-sm">Affinity Level {character.affinityLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Chat Count</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{character.chatCount}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unlocked</p>
                        <p className="font-medium mt-1">{new Date(character.unlockedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-semibold">Expression</TableHead>
                    <TableHead className="font-semibold">Meaning</TableHead>
                    <TableHead className="font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Mastery</TableHead>
                    <TableHead className="font-semibold">Last Reviewed</TableHead>
                    <TableHead className="font-semibold text-center">Bookmarked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVocabulary.map((vocab) => (
                    <TableRow key={vocab.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{vocab.expression}</TableCell>
                      <TableCell className="text-muted-foreground">{vocab.meaning}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{vocab.source}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-24">
                          <Progress value={vocab.mastery} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8">{vocab.mastery}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(vocab.lastReviewed).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Bookmark className={`w-4 h-4 mx-auto ${vocab.bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
