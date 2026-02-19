"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Settings2,
} from "lucide-react";
import {
  useXpLevels,
  useXpRules,
  useCreateXpLevel,
  useUpdateXpLevel,
  useDeleteXpLevel,
  useCreateXpRule,
  useUpdateXpRule,
  useDeleteXpRule,
  type XpLevelBasic,
  type XpRuleBasic,
} from "@/hooks/use-xp";

type XpLevelFormValues = {
  level: number;
  requiredTotalXp: number;
  title: string;
  isActive: boolean;
};

type XpRuleFormValues = {
  id?: number;
  triggerType: string;
  xpAmount: number;
  startsAt: string;
  endsAt: string;
  priority: number;
  isActive: boolean;
};

const TRIGGER_OPTIONS = [
  { value: "EPISODE_COMPLETE", label: "Episode Complete" },
  { value: "DAILY_QUIZ_COMPLETE", label: "Daily Quiz Complete" },
];

export default function XpSettingsPage() {
  const { data: levels = [], isLoading: levelsLoading } = useXpLevels();
  const { data: rules = [], isLoading: rulesLoading } = useXpRules();

  const createLevel = useCreateXpLevel();
  const updateLevel = useUpdateXpLevel();
  const deleteLevel = useDeleteXpLevel();

  const createRule = useCreateXpRule();
  const updateRule = useUpdateXpRule();
  const deleteRule = useDeleteXpRule();

  const [selectedLevel, setSelectedLevel] = useState<XpLevelBasic | null>(null);
  const [selectedRule, setSelectedRule] = useState<XpRuleBasic | null>(null);

  const levelForm = useForm<XpLevelFormValues>({
    defaultValues: {
      level: 1,
      requiredTotalXp: 0,
      title: "",
      isActive: true,
    },
  });

  const ruleForm = useForm<XpRuleFormValues>({
    defaultValues: {
      triggerType: "EPISODE_COMPLETE",
      xpAmount: 10,
      startsAt: "",
      endsAt: "",
      priority: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (selectedLevel) {
      levelForm.reset({
        level: selectedLevel.level,
        requiredTotalXp: selectedLevel.requiredTotalXp,
        title: selectedLevel.title ?? "",
        isActive: selectedLevel.isActive,
      });
    } else {
      levelForm.reset({
        level: (levels[levels.length - 1]?.level ?? 0) + 1,
        requiredTotalXp:
          (levels[levels.length - 1]?.requiredTotalXp ?? 0) + 100,
        title: "",
        isActive: true,
      });
    }
  }, [selectedLevel, levels, levelForm]);

  useEffect(() => {
    if (selectedRule) {
      ruleForm.reset({
        id: selectedRule.id,
        triggerType: selectedRule.triggerType,
        xpAmount: selectedRule.xpAmount,
        startsAt: selectedRule.startsAt
          ? new Date(selectedRule.startsAt).toISOString().slice(0, 16)
          : "",
        endsAt: selectedRule.endsAt
          ? new Date(selectedRule.endsAt).toISOString().slice(0, 16)
          : "",
        priority: selectedRule.priority,
        isActive: selectedRule.isActive,
      });
    } else {
      ruleForm.reset({
        triggerType: "EPISODE_COMPLETE",
        xpAmount: 10,
        startsAt: "",
        endsAt: "",
        priority: 0,
        isActive: true,
      });
    }
  }, [selectedRule, ruleForm]);

  const handleSubmitLevel = levelForm.handleSubmit((values) => {
    const payload = {
      level: Number(values.level),
      requiredTotalXp: Number(values.requiredTotalXp),
      title: values.title || null,
      isActive: values.isActive,
    };

    if (selectedLevel) {
      updateLevel.mutate(payload, {
        onSuccess: () => setSelectedLevel(null),
      });
    } else {
      createLevel.mutate(payload, {
        onSuccess: () => setSelectedLevel(null),
      });
    }
  });

  const handleDeleteLevel = (level: number) => {
    if (!confirm(`XP Level ${level} 을(를) 삭제할까요?`)) return;
    deleteLevel.mutate(level, {
      onSuccess: () => {
        if (selectedLevel?.level === level) setSelectedLevel(null);
      },
    });
  };

  const handleSubmitRule = ruleForm.handleSubmit((values) => {
    const payload = {
      id: values.id,
      triggerType: values.triggerType,
      xpAmount: Number(values.xpAmount),
      startsAt: values.startsAt || null,
      endsAt: values.endsAt || null,
      priority: Number(values.priority),
      isActive: values.isActive,
    };

    if (selectedRule) {
      if (!selectedRule.id) return;
      updateRule.mutate(
        {
          ...(payload as Required<typeof payload>),
          id: selectedRule.id,
        },
        {
          onSuccess: () => setSelectedRule(null),
        }
      );
    } else {
      createRule.mutate(payload, {
        onSuccess: () => setSelectedRule(null),
      });
    }
  });

  const handleDeleteRule = (id: number) => {
    if (!confirm(`XP Rule #${id} 을(를) 삭제할까요?`)) return;
    deleteRule.mutate(id, {
      onSuccess: () => {
        if (selectedRule?.id === id) setSelectedRule(null);
      },
    });
  };

  const loading = levelsLoading || rulesLoading;

  const totalLevels = levels.length;
  const totalRules = rules.length;
  const defaultEpisodeRule = rules
    .filter((r) => r.triggerType === "EPISODE_COMPLETE")
    .sort((a, b) => b.priority - a.priority)[0];

  return (
    <AdminLayout>
      <PageHeader
        title="XP Settings"
        description="XP 레벨 및 XP 지급 규칙을 설정합니다."
      >
        <Sparkles className="w-5 h-5 text-primary" />
      </PageHeader>

      {loading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading XP settings...
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="rounded-2xl border-border/60 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-primary mb-1">
                  Total XP Levels
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {totalLevels}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  레벨당 필요한 누적 XP를 관리하세요.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-primary mb-1">
                  Active XP Rules
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {rules.filter((r) => r.isActive).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  이벤트/미션별 XP 지급 정책.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-primary mb-1">
                  Default Episode XP
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {defaultEpisodeRule ? `${defaultEpisodeRule.xpAmount} XP` : "-"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  EPISODE_COMPLETE 최상위(priority) 룰 기준.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* XP Levels */}
            <Card className="col-span-7 rounded-2xl border-border/60 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-medium">
                XP Levels
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => setSelectedLevel(null)}
              >
                <Plus className="w-4 h-4 mr-1" />
                새 레벨
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                유저의 누적 XP에 따라 자동으로 레벨을 계산합니다.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] gap-4">
              <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
                {levels.map((level) => (
                  <button
                    key={level.level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border ${
                      selectedLevel?.level === level.level
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">
                        Lv. {level.level}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {level.requiredTotalXp} XP 이상
                      </div>
                      {level.title && (
                        <div className="text-xs text-primary mt-0.5">
                          {level.title}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          level.isActive
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-slate-500/10 text-slate-600"
                        }`}
                      >
                        {level.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLevel(level.level);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </button>
                ))}
                {levels.length === 0 && (
                  <div className="text-sm text-muted-foreground py-6 text-center rounded-xl border border-dashed border-border/60">
                    아직 XP 레벨이 없습니다. <br />
                    오른쪽 폼에서 첫 레벨을 추가해 보세요.
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmitLevel}
                className="space-y-4 rounded-2xl bg-secondary/40 p-4 border border-border/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">
                    {selectedLevel ? "레벨 수정" : "레벨 추가"}
                  </p>
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Level</Label>
                    <Input
                      type="number"
                      min={1}
                      {...levelForm.register("level", {
                        valueAsNumber: true,
                      })}
                      className="mt-1 rounded-xl bg-background border-border/60"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">
                      Required Total XP
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      {...levelForm.register("requiredTotalXp", {
                        valueAsNumber: true,
                      })}
                      className="mt-1 rounded-xl bg-background border-border/60"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">
                    Title (optional)
                  </Label>
                  <Input
                    placeholder="Beginner, Explorer 등"
                    {...levelForm.register("title")}
                    className="mt-1 rounded-xl bg-background border-border/60"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={levelForm.watch("isActive")}
                      onCheckedChange={(checked) =>
                        levelForm.setValue("isActive", checked)
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-xl"
                    disabled={createLevel.isPending || updateLevel.isPending}
                  >
                    {(createLevel.isPending || updateLevel.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-1" />
                    {selectedLevel ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>

            {/* XP Rules */}
            <Card className="col-span-5 rounded-2xl border-border/60 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-medium">
                XP Rules
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => setSelectedRule(null)}
              >
                <Plus className="w-4 h-4 mr-1" />
                새 룰
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                에피소드 완료, 데일리 퀴즈 등 상황별 XP 지급 룰입니다.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] gap-4">
              <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
                {rules.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => setSelectedRule(rule)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border ${
                      selectedRule?.id === rule.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">
                        #{rule.id} · {rule.triggerType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rule.xpAmount} XP · priority {rule.priority}
                      </div>
                      {(rule.startsAt || rule.endsAt) && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {rule.startsAt
                            ? new Date(rule.startsAt).toLocaleString()
                            : "Always"}
                          {" ~ "}
                          {rule.endsAt
                            ? new Date(rule.endsAt).toLocaleString()
                            : "∞"}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rule.isActive
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-slate-500/10 text-slate-600"
                        }`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRule(rule.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </button>
                ))}
                {rules.length === 0 && (
                  <div className="text-sm text-muted-foreground py-6 text-center rounded-xl border border-dashed border-border/60">
                    아직 XP Rule이 없습니다. <br />
                    오른쪽 폼에서 기본 XP 룰을 정의해 주세요.
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmitRule}
                className="space-y-4 rounded-2xl bg-secondary/40 p-4 border border-border/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">
                    {selectedRule ? "XP Rule 수정" : "XP Rule 추가"}
                  </p>
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </div>

                <div>
                  <Label className="text-xs font-medium">Trigger Type</Label>
                  <Select
                    value={ruleForm.watch("triggerType")}
                    onValueChange={(val) =>
                      ruleForm.setValue("triggerType", val)
                    }
                  >
                    <SelectTrigger className="mt-1 rounded-xl bg-background border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TRIGGER_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="rounded-lg"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">XP Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      {...ruleForm.register("xpAmount", {
                        valueAsNumber: true,
                      })}
                      className="mt-1 rounded-xl bg-background border-border/60"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Priority</Label>
                    <Input
                      type="number"
                      {...ruleForm.register("priority", {
                        valueAsNumber: true,
                      })}
                      className="mt-1 rounded-xl bg-background border-border/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">
                      Starts At (optional)
                    </Label>
                    <Input
                      type="datetime-local"
                      {...ruleForm.register("startsAt")}
                      className="mt-1 rounded-xl bg-background border-border/60"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">
                      Ends At (optional)
                    </Label>
                    <Input
                      type="datetime-local"
                      {...ruleForm.register("endsAt")}
                      className="mt-1 rounded-xl bg-background border-border/60"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ruleForm.watch("isActive")}
                      onCheckedChange={(checked) =>
                        ruleForm.setValue("isActive", checked)
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-xl"
                    disabled={createRule.isPending || updateRule.isPending}
                  >
                    {(createRule.isPending || updateRule.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-1" />
                    {selectedRule ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

