import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CouponWithCounts,
  CouponBasic,
  CouponCodeBasic,
  UserCouponBasic,
  CouponBenefitType,
  CouponTargetType,
  CouponStatus,
} from "@/types";

// ─────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────

async function fetchCoupons(params?: {
  status?: string;
  benefitType?: string;
  search?: string;
}): Promise<CouponWithCounts[]> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.benefitType) sp.set("benefitType", params.benefitType);
  if (params?.search) sp.set("search", params.search);
  const res = await fetch(`/api/coupons?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return res.json();
}

async function fetchCoupon(id: number) {
  const res = await fetch(`/api/coupons/${id}`);
  if (!res.ok) throw new Error("Failed to fetch coupon");
  return res.json() as Promise<
    CouponBasic & {
      codes: CouponCodeBasic[];
      userCoupons: UserCouponBasic[];
      _count: { codes: number; userCoupons: number };
    }
  >;
}

async function fetchCouponCodes(couponId: number): Promise<CouponCodeBasic[]> {
  const res = await fetch(`/api/coupons/${couponId}/codes`);
  if (!res.ok) throw new Error("Failed to fetch codes");
  return res.json();
}

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export function useCoupons(params?: {
  status?: string;
  benefitType?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: () => fetchCoupons(params),
  });
}

export function useCoupon(id: number) {
  return useQuery({
    queryKey: ["coupons", id],
    queryFn: () => fetchCoupon(id),
    enabled: !!id,
  });
}

export function useCouponCodes(couponId: number) {
  return useQuery({
    queryKey: ["coupon-codes", couponId],
    queryFn: () => fetchCouponCodes(couponId),
    enabled: !!couponId,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export type CouponInput = {
  name: string;
  key?: string | null;
  description?: string | null;
  benefitType: CouponBenefitType;
  discountAmount?: number | null;
  discountPercent?: number | null;
  maxDiscountAmount?: number | null;
  rewardCoinAmount?: number | null;
  minPurchaseAmount?: number | null;
  targetType?: CouponTargetType;
  targetId?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  expiresInDays?: number | null;
  isPublic?: boolean;
  status?: CouponStatus;
};

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CouponInput) => {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CouponInput> & { id: number }) => {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update coupon");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupons", variables.id] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useGenerateCodes(couponId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { count?: number; prefix?: string; assignedUserId?: number }) => {
      const res = await fetch(`/api/coupons/${couponId}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate codes");
      return res.json() as Promise<CouponCodeBasic[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon-codes", couponId] });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useIssueCoupon(couponId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId?: number; userIds?: number[]; validFrom?: string; validUntil?: string }) => {
      const res = await fetch(`/api/coupons/${couponId}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to issue coupon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupons", couponId] });
    },
  });
}
