"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Gift, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminGlobalReward } from "@/types";
import type { RewardType } from "@/src/generated/prisma/enums";

const SOURCE_TABS = [
  { value: "ATTENDANCE" as const, label: "출석 보상", hint: "출석 체크 시 지급되는 리워드 정의" },
  { value: "SIGNUP" as const, label: "회원가입 보상", hint: "가입 완료 시 지급되는 리워드 정의" },
];

const REWARD_TYPES: RewardType[] = [
  "COIN",
  "COUPON",
  "CHARACTER_INVITE",
  "XP",
  "ITEM",
];

const TYPE_LABELS: Record<RewardType, string> = {
  COIN: "코인",
  COUPON: "쿠폰",
  CHARACTER_INVITE: "캐릭터 초대",
  XP: "XP",
  ITEM: "아이템",
};

const TYPE_STYLES: Record<RewardType, string> = {
  COIN: "bg-amber-500/10 text-amber-700",
  COUPON: "bg-sky-500/10 text-sky-700",
  CHARACTER_INVITE: "bg-violet-500/10 text-violet-700",
  XP: "bg-emerald-500/10 text-emerald-700",
  ITEM: "bg-blue-500/10 text-blue-700",
};

function payloadPreview(p: Record<string, unknown>): string {
  try {
    const s = JSON.stringify(p);
    return s.length > 80 ? `${s.slice(0, 80)}…` : s;
  } catch {
    return "—";
  }
}

export default function RewardsAdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof SOURCE_TABS)[number]["value"]>("ATTENDANCE");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGlobalReward | null>(null);

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards", tab],
    queryFn: async () => {
      const res = await fetch(`/api/rewards?sourceType=${tab}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<AdminGlobalReward[]>;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["rewards", "ATTENDANCE"] });
    queryClient.invalidateQueries({ queryKey: ["rewards", "SIGNUP"] });
  };

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/rewards/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast.success("삭제했습니다.");
      invalidate();
    },
    onError: () => toast.error("삭제 실패"),
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary" />
            리워드 (출석 · 가입)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            출석·회원가입 보상만 여기서 관리합니다. 에피소드/엔딩 등은 스토리·에피소드 화면에서 설정하세요.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
          <TabsList className="bg-card border border-border rounded-xl p-1 h-auto flex flex-wrap gap-1">
            {SOURCE_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {SOURCE_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{t.label}</CardTitle>
                    <CardDescription>{t.hint}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl shrink-0"
                    onClick={() => {
                      setEditing(null);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    리워드 추가
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading && tab === t.value && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      불러오는 중…
                    </div>
                  )}
                  {!isLoading && tab === t.value && rewards.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      등록된 리워드가 없습니다.
                    </p>
                  )}
                  {!isLoading && tab === t.value && rewards.length > 0 && (
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                            <TableHead className="w-14">ID</TableHead>
                            <TableHead className="w-24">sourceId</TableHead>
                            <TableHead className="w-28">보상 타입</TableHead>
                            <TableHead>설명</TableHead>
                            <TableHead className="min-w-[140px]">payload</TableHead>
                            <TableHead className="w-20">활성</TableHead>
                            <TableHead className="w-24 text-right">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rewards.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {r.id}
                              </TableCell>
                              <TableCell className="font-mono text-sm">{r.sourceId}</TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    TYPE_STYLES[r.type]
                                  )}
                                >
                                  {TYPE_LABELS[r.type]}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm max-w-[200px] truncate">
                                {r.description ?? "—"}
                              </TableCell>
                              <TableCell
                                className="font-mono text-xs text-muted-foreground max-w-[200px] truncate"
                                title={JSON.stringify(r.payload)}
                              >
                                {payloadPreview(r.payload)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "text-xs",
                                    r.isActive ? "text-emerald-600" : "text-muted-foreground"
                                  )}
                                >
                                  {r.isActive ? "ON" : "OFF"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg"
                                  onClick={() => {
                                    setEditing(r);
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
                                    if (confirm("이 리워드를 삭제할까요?")) remove.mutate(r.id);
                                  }}
                                  disabled={remove.isPending}
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
            </TabsContent>
          ))}
        </Tabs>

        <RewardFormDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
          sourceType={tab}
          editing={editing}
          onSaved={() => {
            invalidate();
            setDialogOpen(false);
            setEditing(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

function RewardFormDialog({
  open,
  onOpenChange,
  sourceType,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sourceType: "ATTENDANCE" | "SIGNUP";
  editing: AdminGlobalReward | null;
  onSaved: () => void;
}) {
  const [sourceId, setSourceId] = useState("0");
  const [type, setType] = useState<RewardType>("COIN");
  const [description, setDescription] = useState("");
  const [payloadText, setPayloadText] = useState("{}");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setSourceId(String(editing.sourceId));
      setType(editing.type);
      setDescription(editing.description ?? "");
      setPayloadText(JSON.stringify(editing.payload ?? {}, null, 2));
      setIsActive(editing.isActive);
    } else {
      setSourceId("0");
      setType("COIN");
      setDescription("");
      setPayloadText("{}");
      setIsActive(true);
    }
  }, [open, editing]);

  const handleSave = async () => {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText || "{}") as Record<string, unknown>;
      if (typeof payload !== "object" || payload === null) throw new Error("object");
    } catch {
      toast.error("payload는 유효한 JSON 객체여야 합니다.");
      return;
    }
    const sid = parseInt(sourceId, 10);
    if (Number.isNaN(sid)) {
      toast.error("sourceId는 정수여야 합니다.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/rewards/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId: sid,
            type,
            description: description.trim() || null,
            payload,
            isActive,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error((e as { error?: string }).error || "저장 실패");
        }
      } else {
        const res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceType,
            sourceId: sid,
            type,
            description: description.trim() || null,
            payload,
            isActive,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error((e as { error?: string }).error || "저장 실패");
        }
      }
      toast.success(editing ? "수정했습니다." : "추가했습니다.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{editing ? "리워드 수정" : "리워드 추가"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 py-1">
          <div>
            <Label className="text-xs">소스</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {sourceType === "ATTENDANCE" ? "출석 (ATTENDANCE)" : "회원가입 (SIGNUP)"}
            </p>
          </div>
          <div>
            <Label className="text-xs">sourceId</Label>
            <Input
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="mt-1 rounded-xl bg-secondary border-0 font-mono h-9"
              placeholder="0"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              구분용 ID (예: 연속출석 일수, 0=기본)
            </p>
          </div>
          <div>
            <Label className="text-xs">보상 타입</Label>
            <Select value={type} onValueChange={(v) => setType(v as RewardType)}>
              <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {REWARD_TYPES.map((rt) => (
                  <SelectItem key={rt} value={rt} className="rounded-lg">
                    {TYPE_LABELS[rt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">설명 (관리용)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 rounded-xl bg-secondary border-0 h-9"
              placeholder="예: 7일 출석 보너스"
            />
          </div>
          <div>
            <Label className="text-xs">payload (JSON)</Label>
            <Textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="mt-1 rounded-xl bg-secondary border-0 font-mono text-xs min-h-[100px]"
              placeholder='{"amount": 100}'
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="rw-active" className="text-xs">
              활성
            </Label>
            <Switch id="rw-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button className="rounded-xl" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
