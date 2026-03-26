"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Crown,
  Flame,
  Star,
  BookOpen,
  Heart,
  Sparkles,
  UserCircle,
  Calendar,
  Loader2,
  Gamepad2,
  ChevronDown,
  ChevronRight,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  useUser,
  useUserEpisodeProgress,
  useUserStoryProgress,
  useUserCharacters,
  useUserBookmarks,
  useUserPlayEpisodes,
  useDeleteUserPlayEpisode,
  useDeletePlayEpisodeSlot,
  useUpdateUserPlayEpisodeData,
  useResetUserPlayEpisode,
  useUpdateCharacterAffinity,
} from "@/hooks/use-users";
import { PublishStatus } from "@/types";

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  const [open, setOpen] = useState(false);
  const str = data != null ? JSON.stringify(data, null, 2) : "null";
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium bg-secondary/30 hover:bg-secondary/50"
      >
        {label}
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <pre className="p-3 text-xs font-mono bg-muted/30 overflow-x-auto max-h-48 overflow-y-auto">
          {str}
        </pre>
      )}
    </div>
  );
}

function EditableDataBlock({
  label,
  data,
  playEpisodeId,
  onSave,
  isSaving,
}: {
  label: string;
  data: unknown;
  playEpisodeId: number;
  onSave: (playEpisodeId: number, data: unknown) => void;
  isSaving: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editStr, setEditStr] = useState("");
  const [hasChange, setHasChange] = useState(false);
  const str = data != null ? JSON.stringify(data, null, 2) : "null";

  const handleOpen = () => {
    if (!open) {
      setEditStr(str);
      setHasChange(false);
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (open && !hasChange) {
      setEditStr(str);
    }
  }, [open, str, hasChange]);

  const handleSave = () => {
    try {
      const parsed = editStr.trim() === "null" ? null : JSON.parse(editStr);
      onSave(playEpisodeId, parsed);
      setHasChange(false);
    } catch (e) {
      alert("유효한 JSON이 아닙니다.");
    }
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium bg-secondary/30 hover:bg-secondary/50"
      >
        {label}
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="p-3 space-y-2">
          <textarea
            value={editStr}
            onChange={(e) => {
              setEditStr(e.target.value);
              setHasChange(e.target.value !== str);
            }}
            className="w-full p-3 text-xs font-mono bg-muted/30 border border-border rounded-lg min-h-[120px] max-h-48 overflow-y-auto resize-y"
            spellCheck={false}
          />
          <Button
            size="sm"
            className="rounded-lg"
            onClick={handleSave}
            disabled={!hasChange || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            저장
          </Button>
        </div>
      )}
    </div>
  );
}

function CharacterAffinityCard({
  cf,
  onSave,
}: {
  cf: any;
  onSave: (affinity: number) => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(cf.affinity));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      alert("0 이상의 정수를 입력하세요.");
      return;
    }
    setSaving(true);
    try {
      await onSave(num);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(String(cf.affinity));
    setEditing(false);
  };

  return (
    <Card className="border-0 shadow-sm rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 ring-2 ring-primary/20">
            <AvatarImage src={cf.character.avatarImage ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {cf.character.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{cf.character.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Heart className="w-4 h-4 text-pink-500 shrink-0" />
              {editing ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-7 w-24 text-sm px-2"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-sm hover:underline cursor-pointer"
                >
                  친밀도 {cf.affinity}
                </button>
              )}
            </div>
            <Badge variant="outline" className="mt-2 text-xs rounded-lg">
              {cf.status}
            </Badge>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          등록일 {new Date(cf.createdAt).toLocaleDateString("ko-KR")}
        </div>
      </CardContent>
    </Card>
  );
}

function PlayEpisodeProgressTab({
  playEpisodes,
  isLoading,
  onDelete,
  deletingId,
  onDeleteSlot,
  deletingSlotId,
  onSaveData,
  savingDataId,
  onReset,
  resettingId,
}: {
  playEpisodes: any[];
  isLoading: boolean;
  onDelete: (playEpisodeId: number) => void;
  deletingId: number | null;
  onDeleteSlot: (playEpisodeId: number, slotId: number) => void;
  deletingSlotId: number | null;
  onSaveData: (playEpisodeId: number, data: unknown) => void;
  savingDataId: number | null;
  onReset: (playEpisodeId: number) => void;
  resettingId: number | null;
}) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          로딩 중...
        </CardContent>
      </Card>
    );
  }
  if (playEpisodes.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="text-center py-16 text-muted-foreground text-sm">
          Play Episode 진행 기록이 없습니다
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {playEpisodes.map((pe: any) => (
        <Card
          key={pe.id}
          className="border-0 shadow-sm rounded-2xl overflow-hidden"
        >
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {pe.episode?.thumbnailUrl ? (
                  <img
                    src={pe.episode.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Gamepad2 className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">
                    {pe.episode?.title ?? `Episode #${pe.episodeId}`}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="data·slot 초기화"
                      className="rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 flex-shrink-0"
                      onClick={() => {
                        if (confirm("data와 slot을 모두 초기화하시겠습니까?")) {
                          onReset(pe.id);
                        }
                      }}
                      disabled={resettingId === pe.id}
                    >
                      {resettingId === pe.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={() => {
                        if (
                          confirm("해당 Play Episode 기록을 삭제하시겠습니까?")
                        ) {
                          onDelete(pe.id);
                        }
                      }}
                      disabled={deletingId === pe.id}
                    >
                      {deletingId === pe.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pe.episode?.story?.title ?? "-"} · #
                  {pe.episode?.order ?? "-"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="rounded-lg text-xs">
                    {pe.status}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs">
                    {pe.mode}
                  </Badge>
                  {pe.ending && (
                    <Badge className="rounded-lg text-xs bg-amber-500/10 text-amber-600">
                      {pe.ending.key}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  시작 {new Date(pe.startedAt).toLocaleString("ko-KR")}
                  {pe.completedAt && (
                    <>
                      {" "}
                      · 완료 {new Date(pe.completedAt).toLocaleString("ko-KR")}
                    </>
                  )}
                </p>
                {(pe.lastSceneId != null || pe.lastSlotId != null) && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    lastSceneId: {pe.lastSceneId ?? "-"} · lastSlotId:{" "}
                    {pe.lastSlotId ?? "-"}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <JsonBlock label="result" data={pe.result} />
              <EditableDataBlock
                label="data"
                data={pe.data}
                playEpisodeId={pe.id}
                onSave={onSaveData}
                isSaving={savingDataId === pe.id}
              />
              {pe.slots?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Slots ({pe.slots.length})
                  </p>
                  <div className="space-y-2">
                    {pe.slots.map((slot: any, i: number) => (
                      <div
                        key={slot.id}
                        className="rounded-lg border border-border/50 p-3 bg-secondary/20"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            #{i + 1} {slot.type} · order {slot.order} ·{" "}
                            {slot.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("해당 Slot을 삭제하시겠습니까?")) {
                                onDeleteSlot(pe.id, slot.id);
                              }
                            }}
                            disabled={deletingSlotId === slot.id}
                          >
                            {deletingSlotId === slot.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <JsonBlock label={`slot.data`} data={slot.data} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = Number(params.id);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: episodeProgress, isLoading: epLoading } =
    useUserEpisodeProgress(userId);
  const { data: storyProgress, isLoading: spLoading } =
    useUserStoryProgress(userId);
  const { data: characters, isLoading: charLoading } =
    useUserCharacters(userId);
  const { data: bookmarks, isLoading: bmLoading } = useUserBookmarks(userId);
  const { data: playEpisodes, isLoading: peLoading } =
    useUserPlayEpisodes(userId);
  const deletePlayEpisode = useDeleteUserPlayEpisode(userId);
  const deletePlayEpisodeSlot = useDeletePlayEpisodeSlot(userId);
  const updatePlayEpisodeData = useUpdateUserPlayEpisodeData(userId);
  const resetPlayEpisode = useResetUserPlayEpisode(userId);
  const updateAffinity = useUpdateCharacterAffinity(userId);

  if (userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          로딩 중...
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-32 text-muted-foreground">
          유저를 찾을 수 없습니다
        </div>
      </AdminLayout>
    );
  }

  const displayName = user.name ?? "(이름 없음)";
  const initials = displayName.slice(0, 2).toUpperCase();

  const TABS = [
    { value: "overview", label: "Overview" },
    { value: "story-progress", label: "Story Progress" },
    { value: "episode-progress", label: "Episode Progress" },
    { value: "play-episode-progress", label: "Play Episode Progress" },
    { value: "characters", label: "Characters" },
    { value: "bookmarks", label: "Bookmarks" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="rounded-xl">
          <Link href="/users">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
        </Button>

        {/* User Header */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 ring-4 ring-card">
                <AvatarImage src={user.profileImage ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold">{displayName}</h1>
                  {user.hasPremium && (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-0 rounded-lg">
                      <Crown className="w-3.5 h-3.5 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <StatusBadge status={user.status as PublishStatus} />
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                {user.registeredAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    가입일{" "}
                    {new Date(user.registeredAt).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border rounded-xl p-1 h-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                {
                  label: "레벨",
                  value: user.XpLevel,
                  icon: Star,
                  color: "bg-primary/10 text-primary",
                },
                {
                  label: "총 XP",
                  value: user.xp.toLocaleString(),
                  icon: Sparkles,
                  color: "bg-accent text-accent-foreground",
                },
                {
                  label: "스트릭",
                  value: `${user.streakDays}일`,
                  icon: Flame,
                  color: "bg-orange-100 text-orange-500",
                },
                {
                  label: "완료 스토리",
                  value: user._count.storyProgress,
                  icon: BookOpen,
                  color: "bg-green-100 text-green-600",
                },
                {
                  label: "완료 에피소드",
                  value: user._count.userEpisodes,
                  icon: UserCircle,
                  color: "bg-blue-100 text-blue-600",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Story Progress */}
          <TabsContent value="story-progress" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              {spLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  로딩 중...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold">스토리</TableHead>
                      <TableHead className="font-semibold">완료율</TableHead>
                      <TableHead className="font-semibold">상태</TableHead>
                      <TableHead className="font-semibold">
                        마지막 업데이트
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(storyProgress ?? []).map((sp: any) => (
                      <TableRow key={sp.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          {sp.story.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 w-40">
                            <Progress
                              value={sp.progressPct}
                              className="h-2 flex-1"
                            />
                            <span className="text-sm text-muted-foreground w-10">
                              {Math.round(sp.progressPct)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sp.isCompleted ? "default" : "secondary"}
                            className="rounded-lg text-xs"
                          >
                            {sp.isCompleted ? "완료" : "진행 중"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(sp.updatedAt).toLocaleDateString("ko-KR")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(storyProgress ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-16 text-muted-foreground text-sm"
                        >
                          스토리 진행 기록이 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Play Episode Progress */}
          <TabsContent value="play-episode-progress" className="mt-6">
            <PlayEpisodeProgressTab
              playEpisodes={playEpisodes ?? []}
              isLoading={peLoading}
              onDelete={(id) => deletePlayEpisode.mutate(id)}
              deletingId={
                deletePlayEpisode.isPending &&
                deletePlayEpisode.variables != null
                  ? deletePlayEpisode.variables
                  : null
              }
              onDeleteSlot={(peId, slotId) =>
                deletePlayEpisodeSlot.mutate({ playEpisodeId: peId, slotId })
              }
              deletingSlotId={
                deletePlayEpisodeSlot.isPending &&
                deletePlayEpisodeSlot.variables != null
                  ? deletePlayEpisodeSlot.variables.slotId
                  : null
              }
              onSaveData={(peId, data) =>
                updatePlayEpisodeData.mutate({ playEpisodeId: peId, data })
              }
              savingDataId={
                updatePlayEpisodeData.isPending &&
                updatePlayEpisodeData.variables != null
                  ? updatePlayEpisodeData.variables.playEpisodeId
                  : null
              }
              onReset={(peId) => resetPlayEpisode.mutate(peId)}
              resettingId={
                resetPlayEpisode.isPending && resetPlayEpisode.variables != null
                  ? resetPlayEpisode.variables
                  : null
              }
            />
          </TabsContent>

          {/* Episode Progress */}
          <TabsContent value="episode-progress" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              {epLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  로딩 중...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold">에피소드</TableHead>
                      <TableHead className="font-semibold">스토리</TableHead>
                      <TableHead className="font-semibold">상태</TableHead>
                      <TableHead className="font-semibold">완료일</TableHead>
                      <TableHead className="font-semibold">시작일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(episodeProgress ?? []).map((ep: any) => (
                      <TableRow key={ep.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          {ep.episode.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ep.episode.story.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ep.isCompleted ? "default" : "secondary"}
                            className="rounded-lg text-xs"
                          >
                            {ep.isCompleted ? "완료" : "진행 중"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {ep.completedAt
                            ? new Date(ep.completedAt).toLocaleDateString(
                                "ko-KR"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(ep.startedAt).toLocaleDateString("ko-KR")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(episodeProgress ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-16 text-muted-foreground text-sm"
                        >
                          에피소드 진행 기록이 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Characters */}
          <TabsContent value="characters" className="mt-6">
            {charLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                로딩 중...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(characters ?? []).map((cf: any) => (
                  <CharacterAffinityCard
                    key={cf.id}
                    cf={cf}
                    onSave={(affinity) =>
                      updateAffinity.mutateAsync({ friendId: cf.id, affinity })
                    }
                  />
                ))}
                {(characters ?? []).length === 0 && (
                  <div className="col-span-3 text-center py-16 text-muted-foreground text-sm">
                    친구 캐릭터가 없습니다
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Bookmarks */}
          <TabsContent value="bookmarks" className="mt-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              {bmLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  로딩 중...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold">영어</TableHead>
                      <TableHead className="font-semibold">한국어</TableHead>
                      <TableHead className="font-semibold">캐릭터</TableHead>
                      <TableHead className="font-semibold">
                        북마크 날짜
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bookmarks ?? []).map((bm: any) => (
                      <TableRow key={bm.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium max-w-xs truncate">
                          {bm.dialogue.englishText}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {bm.dialogue.koreanText}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {bm.dialogue.character?.name ??
                            bm.dialogue.characterName ??
                            "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(bm.createdAt).toLocaleDateString("ko-KR")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(bookmarks ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-16 text-muted-foreground text-sm"
                        >
                          북마크한 대사가 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
