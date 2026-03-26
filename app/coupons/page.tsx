"use client";

import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Code2,
  UserPlus,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useGenerateCodes,
  useIssueCoupon,
  useCouponCodes,
  type CouponInput,
} from "@/hooks/use-coupons";
import type {
  CouponWithCounts,
  CouponBenefitType,
  CouponTargetType,
  CouponStatus,
  CouponCodeBasic,
} from "@/types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const BENEFIT_TYPE_LABELS: Record<CouponBenefitType, string> = {
  FIXED_AMOUNT: "정액 할인",
  PERCENTAGE: "정률 할인",
  FREE_PRODUCT: "상품 무료",
  FREE_PRODUCT_TYPE: "카테고리 무료",
  COIN_REWARD: "코인 지급",
};

const BENEFIT_TYPE_COLORS: Record<CouponBenefitType, string> = {
  FIXED_AMOUNT: "bg-blue-500/10 text-blue-600",
  PERCENTAGE: "bg-violet-500/10 text-violet-600",
  FREE_PRODUCT: "bg-emerald-500/10 text-emerald-600",
  FREE_PRODUCT_TYPE: "bg-teal-500/10 text-teal-600",
  COIN_REWARD: "bg-amber-500/10 text-amber-600",
};

const STATUS_LABELS: Record<CouponStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  EXPIRED: "만료",
  DELETED: "삭제됨",
};

const STATUS_COLORS: Record<CouponStatus, string> = {
  ACTIVE: "bg-green-500/10 text-green-600",
  INACTIVE: "bg-secondary text-muted-foreground",
  EXPIRED: "bg-orange-500/10 text-orange-600",
  DELETED: "bg-destructive/10 text-destructive",
};

// ─────────────────────────────────────────────
// Empty form
// ─────────────────────────────────────────────

const EMPTY_FORM: CouponInput = {
  name: "",
  key: null,
  description: "",
  benefitType: "FIXED_AMOUNT",
  discountAmount: null,
  discountPercent: null,
  maxDiscountAmount: null,
  rewardCoinAmount: null,
  minPurchaseAmount: null,
  targetType: "ALL",
  targetId: null,
  validFrom: null,
  validUntil: null,
  expiresInDays: null,
  isPublic: true,
  status: "ACTIVE",
};

// ─────────────────────────────────────────────
// Coupon Form Dialog
// ─────────────────────────────────────────────

function CouponFormDialog({
  open,
  initial,
  onClose,
  onSave,
  isSaving,
  saveError,
}: {
  open: boolean;
  initial: CouponInput & { id?: number };
  onClose: () => void;
  onSave: (data: CouponInput & { id?: number }) => void;
  isSaving: boolean;
  saveError?: string | null;
}) {
  const [form, setForm] = useState<CouponInput & { id?: number }>(initial);
  const key = initial.id ?? "new";

  function set<K extends keyof CouponInput>(k: K, v: CouponInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const showDiscount =
    form.benefitType === "FIXED_AMOUNT" || form.benefitType === "PERCENTAGE";
  const showCoin = form.benefitType === "COIN_REWARD";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "쿠폰 수정" : "쿠폰 생성"}</DialogTitle>
        </DialogHeader>

        {saveError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        <div className="space-y-4 py-2" key={String(key)}>
          {/* Name */}
          <div className="space-y-1.5">
            <Label>쿠폰명 *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="예: 신규가입 10% 할인"
            />
          </div>

          {/* Key */}
          <div className="space-y-1.5">
            <Label>쿠폰 키 (unique, 선택)</Label>
            <Input
              value={form.key ?? ""}
              onChange={(e) => set("key", e.target.value.trim() || null)}
              placeholder="예: WELCOME2024 (입력 시 이 키로 쿠폰 조회 가능)"
              className="font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>설명</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value || null)}
              placeholder="쿠폰 설명 (선택)"
            />
          </div>

          {/* Benefit Type */}
          <div className="space-y-1.5">
            <Label>혜택 유형 *</Label>
            <Select
              value={form.benefitType}
              onValueChange={(v) => set("benefitType", v as CouponBenefitType)}
            >
              <SelectTrigger className="rounded-xl bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(BENEFIT_TYPE_LABELS) as [CouponBenefitType, string][]).map(
                  ([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Discount fields */}
          {showDiscount && (
            <div className="grid grid-cols-2 gap-3">
              {form.benefitType === "FIXED_AMOUNT" && (
                <div className="space-y-1.5">
                  <Label>할인 금액 (원)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.discountAmount ?? ""}
                    onChange={(e) =>
                      set("discountAmount", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="1000"
                  />
                </div>
              )}
              {form.benefitType === "PERCENTAGE" && (
                <>
                  <div className="space-y-1.5">
                    <Label>할인율 (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.discountPercent ?? ""}
                      onChange={(e) =>
                        set("discountPercent", e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>최대 할인 금액 (원)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.maxDiscountAmount ?? ""}
                      onChange={(e) =>
                        set("maxDiscountAmount", e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="5000 (선택)"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Coin reward */}
          {showCoin && (
            <div className="space-y-1.5">
              <Label>지급 코인량</Label>
              <Input
                type="number"
                min={0}
                value={form.rewardCoinAmount ?? ""}
                onChange={(e) =>
                  set("rewardCoinAmount", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="100"
              />
            </div>
          )}

          {/* Min purchase */}
          <div className="space-y-1.5">
            <Label>최소 구매 금액 (원, 선택)</Label>
            <Input
              type="number"
              min={0}
              value={form.minPurchaseAmount ?? ""}
              onChange={(e) =>
                set("minPurchaseAmount", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="0"
            />
          </div>

          {/* Target type */}
          <div className="space-y-1.5">
            <Label>대상 타입</Label>
            <Select
              value={form.targetType ?? "ALL"}
              onValueChange={(v) => set("targetType", v as CouponTargetType)}
            >
              <SelectTrigger className="rounded-xl bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="PRODUCT">특정 상품</SelectItem>
                <SelectItem value="PRODUCT_TYPE">상품 타입</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.targetType !== "ALL" && (
            <div className="space-y-1.5">
              <Label>대상 ID</Label>
              <Input
                type="number"
                value={form.targetId ?? ""}
                onChange={(e) =>
                  set("targetId", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Product ID 또는 타입 코드"
              />
            </div>
          )}

          {/* Validity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>유효 시작일</Label>
              <Input
                type="datetime-local"
                value={form.validFrom ? form.validFrom.slice(0, 16) : ""}
                onChange={(e) => set("validFrom", e.target.value ? e.target.value : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>유효 종료일</Label>
              <Input
                type="datetime-local"
                value={form.validUntil ? form.validUntil.slice(0, 16) : ""}
                onChange={(e) => set("validUntil", e.target.value ? e.target.value : null)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>발급 후 유효기간 (일, 선택)</Label>
            <Input
              type="number"
              min={1}
              value={form.expiresInDays ?? ""}
              onChange={(e) =>
                set("expiresInDays", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="30 (발급일로부터 30일)"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>상태</Label>
            <Select
              value={form.status ?? "ACTIVE"}
              onValueChange={(v) => set("status", v as CouponStatus)}
            >
              <SelectTrigger className="rounded-xl bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="INACTIVE">비활성</SelectItem>
                <SelectItem value="EXPIRED">만료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* isPublic */}
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isPublic ?? true}
              onCheckedChange={(v) => set("isPublic", v)}
            />
            <Label>공개 쿠폰 (사용자가 직접 입력 가능)</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.name || !form.benefitType}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Codes Dialog
// ─────────────────────────────────────────────

function CodesDialog({
  couponId,
  couponName,
  open,
  onClose,
}: {
  couponId: number;
  couponName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: codes = [], isLoading } = useCouponCodes(couponId);
  const generateCodes = useGenerateCodes(couponId);
  const [count, setCount] = useState("1");
  const [prefix, setPrefix] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  async function handleGenerate() {
    await generateCodes.mutateAsync({ count: parseInt(count), prefix: prefix || undefined });
  }

  async function copyCode(id: number, code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>코드 관리 — {couponName}</DialogTitle>
        </DialogHeader>

        {/* Generate section */}
        <div className="flex items-end gap-2 pt-2">
          <div className="space-y-1.5 flex-1">
            <Label>접두사 (선택)</Label>
            <Input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="WELCOME"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5 w-20">
            <Label>개수</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateCodes.isPending}
            className="rounded-xl"
          >
            {generateCodes.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            생성
          </Button>
        </div>

        {/* Codes list */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 min-h-0">
          {isLoading && (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> 로딩 중...
            </div>
          )}
          {codes.length === 0 && !isLoading && (
            <p className="text-center py-8 text-sm text-muted-foreground">
              생성된 코드가 없습니다.
            </p>
          )}
          {codes.map((c: CouponCodeBasic) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/60"
            >
              <span className="font-mono text-sm font-medium flex-1">{c.code}</span>
              {c.usedAt ? (
                <span className="text-xs text-muted-foreground">
                  사용됨 · {new Date(c.usedAt).toLocaleDateString("ko-KR")}
                </span>
              ) : c.assignedUser ? (
                <span className="text-xs text-muted-foreground">
                  {c.assignedUser.name ?? c.assignedUser.email}
                </span>
              ) : (
                <span className="text-xs text-green-600">미사용</span>
              )}
              <button
                type="button"
                onClick={() => copyCode(c.id, c.code)}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              >
                {copied === c.id ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Issue Dialog
// ─────────────────────────────────────────────

function IssueDialog({
  couponId,
  couponName,
  open,
  onClose,
}: {
  couponId: number;
  couponName: string;
  open: boolean;
  onClose: () => void;
}) {
  const issueCoupon = useIssueCoupon(couponId);
  const [userIdInput, setUserIdInput] = useState("");
  const [result, setResult] = useState<{ issued: number; skipped: number } | null>(null);

  async function handleIssue() {
    const ids = userIdInput
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return;

    const res = await issueCoupon.mutateAsync({ userIds: ids });
    setResult({ issued: res.issued?.length ?? 0, skipped: res.skipped ?? 0 });
  }

  function handleClose() {
    setUserIdInput("");
    setResult(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>쿠폰 지급 — {couponName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>User ID (쉼표 또는 줄바꿈으로 구분, 복수 가능)</Label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 rounded-xl bg-secondary border-0 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder={"1\n2\n3"}
            />
          </div>

          {result && (
            <div className="px-3 py-2 rounded-xl bg-secondary text-sm">
              <p className="text-green-600 font-medium">✅ {result.issued}명 지급 완료</p>
              {result.skipped > 0 && (
                <p className="text-muted-foreground">⏭ {result.skipped}명 이미 보유 (스킵)</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          <Button
            onClick={handleIssue}
            disabled={issueCoupon.isPending || !userIdInput.trim()}
          >
            {issueCoupon.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            지급
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Coupon Row
// ─────────────────────────────────────────────

function CouponRow({
  coupon,
  onEdit,
  onDelete,
  onCodes,
  onIssue,
}: {
  coupon: CouponWithCounts;
  onEdit: () => void;
  onDelete: () => void;
  onCodes: () => void;
  onIssue: () => void;
}) {
  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function getBenefitSummary() {
    switch (coupon.benefitType) {
      case "FIXED_AMOUNT":
        return coupon.discountAmount ? `${coupon.discountAmount.toLocaleString()}원 할인` : "—";
      case "PERCENTAGE":
        return coupon.discountPercent ? `${coupon.discountPercent}% 할인` : "—";
      case "COIN_REWARD":
        return coupon.rewardCoinAmount ? `${coupon.rewardCoinAmount} 코인` : "—";
      case "FREE_PRODUCT":
        return "상품 무료";
      case "FREE_PRODUCT_TYPE":
        return "카테고리 무료";
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground truncate">{coupon.name}</span>
            {coupon.key && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {coupon.key}
              </span>
            )}
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                BENEFIT_TYPE_COLORS[coupon.benefitType]
              )}
            >
              {BENEFIT_TYPE_LABELS[coupon.benefitType]}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                STATUS_COLORS[coupon.status]
              )}
            >
              {STATUS_LABELS[coupon.status]}
            </span>
            {!coupon.isPublic && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                비공개
              </span>
            )}
          </div>
          {coupon.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{coupon.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onIssue}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="유저에게 지급"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={onCodes}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="코드 관리"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">{getBenefitSummary()}</span>
        <span>발급 {coupon.issuedCount} · 사용 {coupon.usedCount}</span>
        <span>
          코드 {coupon._count?.codes ?? 0} · 유저쿠폰 {coupon._count?.userCoupons ?? 0}
        </span>
        <span className="ml-auto">
          {formatDate(coupon.validFrom)} ~ {formatDate(coupon.validUntil)}
          {coupon.expiresInDays ? ` (발급 후 ${coupon.expiresInDays}일)` : ""}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [benefitFilter, setBenefitFilter] = useState("ALL");

  const { data: coupons = [], isLoading, error } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(CouponInput & { id?: number }) | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [codesTarget, setCodesTarget] = useState<CouponWithCounts | null>(null);
  const [issueTarget, setIssueTarget] = useState<CouponWithCounts | null>(null);

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (benefitFilter !== "ALL" && c.benefitType !== benefitFilter) return false;
      if (
        search &&
        !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !(c.description ?? "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [coupons, statusFilter, benefitFilter, search]);

  function openCreate() {
    setSaveError(null);
    setEditTarget({ ...EMPTY_FORM });
    setFormOpen(true);
  }

  function openEdit(c: CouponWithCounts) {
    setSaveError(null);
    setEditTarget({
      id: c.id,
      name: c.name,
      key: c.key,
      description: c.description,
      benefitType: c.benefitType,
      discountAmount: c.discountAmount,
      discountPercent: c.discountPercent,
      maxDiscountAmount: c.maxDiscountAmount,
      rewardCoinAmount: c.rewardCoinAmount,
      minPurchaseAmount: c.minPurchaseAmount,
      targetType: c.targetType,
      targetId: c.targetId,
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      expiresInDays: c.expiresInDays,
      isPublic: c.isPublic,
      status: c.status,
    });
    setFormOpen(true);
  }

  async function handleSave(data: CouponInput & { id?: number }) {
    setSaveError(null);
    try {
      if (data.id) {
        const { id, ...rest } = data;
        await updateCoupon.mutateAsync({ id, ...rest });
      } else {
        await createCoupon.mutateAsync(data);
      }
      setFormOpen(false);
      setEditTarget(null);
    } catch (e: any) {
      const msg = e?.message ?? "저장 중 오류가 발생했습니다.";
      setSaveError(msg);
    }
  }

  async function handleDelete(c: CouponWithCounts) {
    if (!confirm(`"${c.name}" 쿠폰을 삭제하시겠습니까? (상태가 DELETED로 변경됩니다)`)) return;
    await deleteCoupon.mutateAsync(c.id);
  }

  const isSaving = createCoupon.isPending || updateCoupon.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">쿠폰 관리</h1>
            <p className="text-muted-foreground text-sm mt-1">
              할인 쿠폰, 코인 지급 쿠폰을 생성하고 유저에게 발급합니다.
            </p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            쿠폰 생성
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="쿠폰명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 rounded-xl bg-secondary border-0">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="INACTIVE">비활성</SelectItem>
              <SelectItem value="EXPIRED">만료</SelectItem>
              <SelectItem value="DELETED">삭제됨</SelectItem>
            </SelectContent>
          </Select>
          <Select value={benefitFilter} onValueChange={setBenefitFilter}>
            <SelectTrigger className="w-40 rounded-xl bg-secondary border-0">
              <SelectValue placeholder="혜택 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 유형</SelectItem>
              {(Object.entries(BENEFIT_TYPE_LABELS) as [CouponBenefitType, string][]).map(
                ([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">
            {filtered.length} / {coupons.length}
          </span>
        </div>

        {/* List */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 로딩 중...
          </div>
        )}
        {error && (
          <div className="py-12 text-center text-destructive">
            데이터를 불러오지 못했습니다.
          </div>
        )}
        {!isLoading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">
                쿠폰이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((c) => (
                  <CouponRow
                    key={c.id}
                    coupon={c}
                    onEdit={() => openEdit(c)}
                    onDelete={() => handleDelete(c)}
                    onCodes={() => setCodesTarget(c)}
                    onIssue={() => setIssueTarget(c)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      {editTarget && (
        <CouponFormDialog
          open={formOpen}
          initial={editTarget}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
            setSaveError(null);
          }}
          onSave={handleSave}
          isSaving={isSaving}
          saveError={saveError}
        />
      )}

      {codesTarget && (
        <CodesDialog
          couponId={codesTarget.id}
          couponName={codesTarget.name}
          open={!!codesTarget}
          onClose={() => setCodesTarget(null)}
        />
      )}

      {issueTarget && (
        <IssueDialog
          couponId={issueTarget.id}
          couponName={issueTarget.name}
          open={!!issueTarget}
          onClose={() => setIssueTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
