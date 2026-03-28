"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Loader2, Pencil, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NoticeAdmin, NoticeType } from "@/types";
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useDeleteNotice,
} from "@/hooks/use-notices";

const TYPE_LABELS: Record<NoticeType, string> = {
  GENERAL: "일반",
  BETA: "베타",
  EVENT: "이벤트",
  MAINTENANCE: "점검",
  UPDATE: "업데이트",
};

const TYPE_STYLES: Record<NoticeType, string> = {
  GENERAL: "bg-secondary text-secondary-foreground",
  BETA: "bg-violet-500/15 text-violet-700",
  EVENT: "bg-pink-500/15 text-pink-700",
  MAINTENANCE: "bg-orange-500/15 text-orange-800",
  UPDATE: "bg-sky-500/15 text-sky-800",
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(s: string): string | null {
  if (!s.trim()) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function contentPreview(htmlOrText: string, max = 72): string {
  const t = htmlOrText.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function NoticesPage() {
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NoticeAdmin | null>(null);

  const { data: notices = [], isLoading } = useNotices({
    activeOnly,
    search: search || undefined,
  });

  const createNotice = useCreateNotice();
  const deleteNotice = useDeleteNotice();

  const handleSearch = () => setSearch(searchInput.trim());

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-primary" />
            공지사항
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            앱에 노출되는 공지를 등록·수정합니다. 노출 기간·팝업 여부를 설정할 수 있습니다.
          </p>
        </div>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">목록</CardTitle>
              <CardDescription>최근 수정 순 · 최대 200건</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-1.5">
                <Label htmlFor="active-only" className="text-xs text-muted-foreground whitespace-nowrap">
                  활성만
                </Label>
                <Switch
                  id="active-only"
                  checked={activeOnly}
                  onCheckedChange={setActiveOnly}
                />
              </div>
              <div className="flex items-center gap-1">
                <Input
                  placeholder="제목 검색…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-9 w-44 rounded-xl bg-secondary border-0"
                />
                <Button size="sm" variant="secondary" className="rounded-xl h-9" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                공지 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                불러오는 중…
              </div>
            )}
            {!isLoading && notices.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">공지가 없습니다.</p>
            )}
            {!isLoading && notices.length > 0 && (
              <div className="rounded-xl border border-border/50 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead className="w-14">ID</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead className="w-24">유형</TableHead>
                      <TableHead className="w-16">팝업</TableHead>
                      <TableHead className="w-16">활성</TableHead>
                      <TableHead className="w-12">v</TableHead>
                      <TableHead className="min-w-[120px]">노출 기간</TableHead>
                      <TableHead className="w-32">수정일</TableHead>
                      <TableHead className="w-24 text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{n.id}</TableCell>
                        <TableCell className="font-medium max-w-[220px]">
                          <span className="line-clamp-2">{n.title}</span>
                          <span className="block text-xs text-muted-foreground font-normal mt-0.5 line-clamp-1">
                            {contentPreview(n.content)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              TYPE_STYLES[n.type]
                            )}
                          >
                            {TYPE_LABELS[n.type]}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{n.isPopup ? "Y" : "—"}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs",
                              n.isActive ? "text-emerald-600" : "text-muted-foreground"
                            )}
                          >
                            {n.isActive ? "ON" : "OFF"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{n.version}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {n.startsAt || n.endsAt ? (
                            <>
                              {n.startsAt
                                ? new Date(n.startsAt).toLocaleString("ko-KR", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                              {" ~ "}
                              {n.endsAt
                                ? new Date(n.endsAt).toLocaleString("ko-KR", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </>
                          ) : (
                            "제한 없음"
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(n.updatedAt).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => {
                              setEditing(n);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm(`공지 #${n.id}를 삭제할까요?`)) {
                                deleteNotice.mutate(n.id, {
                                  onSuccess: () => toast.success("삭제했습니다."),
                                  onError: (e) =>
                                    toast.error(e instanceof Error ? e.message : "삭제 실패"),
                                });
                              }
                            }}
                            disabled={deleteNotice.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <NoticeFormDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
          editing={editing}
          onSaved={() => {
            setDialogOpen(false);
            setEditing(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

function NoticeFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: NoticeAdmin | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<NoticeType>("GENERAL");
  const [isPopup, setIsPopup] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [version, setVersion] = useState("1");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);

  const updateNotice = useUpdateNotice();
  const createNotice = useCreateNotice();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setContent(editing.content);
      setType(editing.type);
      setIsPopup(editing.isPopup);
      setIsActive(editing.isActive);
      setVersion(String(editing.version));
      setStartsAt(toDatetimeLocal(editing.startsAt));
      setEndsAt(toDatetimeLocal(editing.endsAt));
    } else {
      setTitle("");
      setContent("");
      setType("GENERAL");
      setIsPopup(false);
      setIsActive(true);
      setVersion("1");
      setStartsAt("");
      setEndsAt("");
    }
  }, [open, editing]);

  const handleSave = async () => {
    const v = parseInt(version, 10);
    if (!title.trim()) {
      toast.error("제목을 입력하세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력하세요.");
      return;
    }
    if (Number.isNaN(v) || v < 1) {
      toast.error("버전은 1 이상의 정수여야 합니다.");
      return;
    }

    const startsIso = fromDatetimeLocal(startsAt);
    const endsIso = fromDatetimeLocal(endsAt);

    setSaving(true);
    try {
      if (editing) {
        await updateNotice.mutateAsync({
          id: editing.id,
          body: {
            title: title.trim(),
            content,
            type,
            isPopup,
            isActive,
            version: v,
            startsAt: startsIso,
            endsAt: endsIso,
          },
        });
        toast.success("저장했습니다.");
      } else {
        await createNotice.mutateAsync({
          title: title.trim(),
          content,
          type,
          isPopup,
          isActive,
          version: v,
          startsAt: startsIso,
          endsAt: endsIso,
        });
        toast.success("등록했습니다.");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const pending = saving || createNotice.isPending || updateNotice.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] flex flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "공지 수정" : "공지 추가"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 py-1">
          <div>
            <Label className="text-xs">제목</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 rounded-xl bg-secondary border-0"
              placeholder="공지 제목"
            />
          </div>
          <div>
            <Label className="text-xs">내용</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 rounded-xl bg-secondary border-0 min-h-[160px] text-sm"
              placeholder="본문 (텍스트 또는 HTML)"
            />
          </div>
          <div>
            <Label className="text-xs">유형</Label>
            <Select value={type} onValueChange={(v) => setType(v as NoticeType)}>
              <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {(Object.keys(TYPE_LABELS) as NoticeType[]).map((t) => (
                  <SelectItem key={t} value={t} className="rounded-lg">
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center justify-between gap-2 min-w-[120px]">
              <Label htmlFor="n-popup" className="text-xs">
                팝업
              </Label>
              <Switch id="n-popup" checked={isPopup} onCheckedChange={setIsPopup} />
            </div>
            <div className="flex items-center justify-between gap-2 min-w-[120px]">
              <Label htmlFor="n-active" className="text-xs">
                활성
              </Label>
              <Switch id="n-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <div>
            <Label className="text-xs">버전 (클라이언트 캐시 무효화 등)</Label>
            <Input
              type="number"
              min={1}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1 rounded-xl bg-secondary border-0 h-9 font-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">노출 시작 (선택)</Label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 rounded-xl bg-secondary border-0 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">노출 종료 (선택)</Label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-1 rounded-xl bg-secondary border-0 h-9"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button className="rounded-xl" onClick={handleSave} disabled={pending}>
            {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
