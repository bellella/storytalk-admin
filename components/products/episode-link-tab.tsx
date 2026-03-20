"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Link2, Unlink, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  useAllEpisodes,
  useLinkEpisode,
  useUnlinkEpisode,
} from "@/hooks/use-products";
import type { ProductWithEpisodes } from "@/types";
import { toast } from "sonner";

type EpisodeLinkTabProps = {
  product: ProductWithEpisodes;
};

export function EpisodeLinkTab({ product }: EpisodeLinkTabProps) {
  const [search, setSearch] = useState("");
  const { data: allEpisodes = [], isLoading } = useAllEpisodes({
    search: search || undefined,
  });
  const linkEpisode = useLinkEpisode(product.id);
  const unlinkEpisode = useUnlinkEpisode(product.id);

  const linkedEpisodeIds = new Set(product.episodes.map((e) => e.episodeId));

  const handleLink = (episodeId: number) => {
    linkEpisode.mutate(episodeId, {
      onSuccess: () => toast.success("에피소드가 연결되었습니다."),
      onError: () => toast.error("연결 중 오류가 발생했습니다."),
    });
  };

  const handleUnlink = (episodeId: number) => {
    unlinkEpisode.mutate(episodeId, {
      onSuccess: () => toast.success("연결이 해제되었습니다."),
      onError: () => toast.error("해제 중 오류가 발생했습니다."),
    });
  };

  const linkedEpisodes = product.episodes;

  return (
    <div className="space-y-6">
      {/* 현재 연결된 에피소드 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          연결된 에피소드
        </h3>
        {linkedEpisodes.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              연결된 에피소드가 없습니다. 아래에서 에피소드를 연결해주세요.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {linkedEpisodes.map((ep) => {
              const storyId = ep.episode.storyId ?? ep.episode.story?.id;
              const href = storyId
                ? `/stories/${storyId}/episodes/${ep.episode.id}`
                : null;
              return (
                <div
                  key={ep.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      {href ? (
                        <Link
                          href={href}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline block truncate"
                        >
                          {ep.episode.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">
                          {ep.episode.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {ep.episode.story?.title ?? "—"} · Ep.{ep.episode.order}{" "}
                        ·{" "}
                        <span className="capitalize">
                          {ep.episode.status.toLowerCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive h-8"
                    onClick={() => handleUnlink(ep.episodeId)}
                    disabled={unlinkEpisode.isPending}
                  >
                    <Unlink className="w-3.5 h-3.5 mr-1" />
                    해제
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 에피소드 검색 & 연결 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          에피소드 검색 & 연결
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="에피소드 이름 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-secondary border-0"
          />
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            로딩 중...
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {allEpisodes.map((episode) => {
              const isLinked = linkedEpisodeIds.has(episode.id);
              const otherProduct = !isLinked
                ? episode.episodeProducts?.find(
                    (ep: any) => ep.product.type === "PLAY_EPISODE"
                  )
                : null;
              const alreadyMapped = !!otherProduct;

              return (
                <div
                  key={episode.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isLinked
                      ? "border-green-200 bg-green-50/50"
                      : "border-border hover:bg-secondary/30"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {episode.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {episode.story?.title ?? "스토리 없음"} · Ep.
                        {episode.order}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs rounded-md px-1.5 py-0"
                      >
                        {episode.status}
                      </Badge>
                      {alreadyMapped && (
                        <span className="text-xs text-amber-600 font-medium">
                          ({otherProduct!.product.name})
                        </span>
                      )}
                    </div>
                  </div>
                  {isLinked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:text-destructive h-8 flex-shrink-0"
                      onClick={() => handleUnlink(episode.id)}
                      disabled={unlinkEpisode.isPending}
                    >
                      <Unlink className="w-3.5 h-3.5 mr-1" />
                      해제
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 flex-shrink-0"
                      onClick={() => handleLink(episode.id)}
                      disabled={linkEpisode.isPending}
                    >
                      <Link2 className="w-3.5 h-3.5 mr-1" />
                      연결
                    </Button>
                  )}
                </div>
              );
            })}
            {allEpisodes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                에피소드가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
