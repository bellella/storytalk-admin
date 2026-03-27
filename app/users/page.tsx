"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, Eye, Flame, Star, Crown, Users, Loader2 } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useDebounce } from "@/hooks/use-debounce"

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [premiumFilter, setPremiumFilter] = useState("all")

  const search = useDebounce(searchInput, 400)
  const { data, isLoading, error } = useUsers(search)

  const users = useMemo(() => {
    if (!data?.users) return []
    return data.users.filter((u) => {
      const matchesLevel =
        levelFilter === "all" ||
        (levelFilter === "1-5" && u.XpLevel >= 1 && u.XpLevel <= 5) ||
        (levelFilter === "6-10" && u.XpLevel >= 6 && u.XpLevel <= 10) ||
        (levelFilter === "11+" && u.XpLevel >= 11)
      const matchesPremium =
        premiumFilter === "all" ||
        (premiumFilter === "premium" && u.hasPremium) ||
        (premiumFilter === "free" && !u.hasPremium)
      return matchesLevel && matchesPremium
    })
  }, [data?.users, levelFilter, premiumFilter])

  const stats = data?.stats

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground text-sm mt-1">유저를 조회하고 진행 상황을 확인합니다</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "전체 유저", value: stats?.total, icon: Users, color: "text-primary bg-primary/10" },
            { label: "활성 유저 (7일)", value: stats?.active, icon: Flame, color: "text-orange-500 bg-orange-500/10" },
            { label: "프리미엄", value: stats?.premium, icon: Crown, color: "text-yellow-500 bg-yellow-500/10" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-semibold mt-1">{s.value?.toLocaleString() ?? "—"}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
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
                  placeholder="이름 또는 이메일 검색..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 rounded-xl border-border bg-secondary/50"
                />
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[130px] rounded-xl">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 레벨</SelectItem>
                  <SelectItem value="1-5">Lv 1-5</SelectItem>
                  <SelectItem value="6-10">Lv 6-10</SelectItem>
                  <SelectItem value="11+">Lv 11+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                <SelectTrigger className="w-[130px] rounded-xl">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="premium">프리미엄</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              로딩 중...
            </div>
          )}
          {error && (
            <div className="text-center py-16 text-destructive text-sm">데이터를 불러오지 못했습니다</div>
          )}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">유저</TableHead>
                  <TableHead className="font-semibold">역할</TableHead>
                  <TableHead className="font-semibold">레벨</TableHead>
                  <TableHead className="font-semibold">XP</TableHead>
                  <TableHead className="font-semibold">스트릭</TableHead>
                  <TableHead className="font-semibold">마지막 접속</TableHead>
                  <TableHead className="font-semibold">상태</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => window.location.href = `/users/${user.id}`}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 ring-2 ring-border">
                          <AvatarImage src={user.profileImage ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                            {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link href={`/users/${user.id}`} className="font-medium text-sm hover:underline" onClick={(e) => e.stopPropagation()}>
                              {user.name ?? "(이름 없음)"}
                            </Link>
                            {user.hasPremium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className="rounded-lg text-xs font-normal"
                      >
                        {user.role === "ADMIN" ? "어드민" : "일반"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{user.XpLevel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-sm">{user.xp.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Flame className={`w-4 h-4 ${user.streakDays > 0 ? "text-orange-500" : "text-muted-foreground/30"}`} />
                        <span className={`text-sm ${user.streakDays > 0 ? "font-medium" : "text-muted-foreground"}`}>
                          {user.streakDays}일
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.lastLoginAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="rounded-lg text-xs">
                        {user.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                              프로필 보기
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                      유저가 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
