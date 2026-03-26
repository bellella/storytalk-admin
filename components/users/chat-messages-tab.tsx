"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  User,
  Bot,
} from "lucide-react";

type Chat = {
  id: number;
  userId: number;
  characterId: number;
  lastMessageAt: string | null;
  character: {
    id: number;
    name: string;
    koreanName: string | null;
    avatarImage: string | null;
    mainImage: string | null;
  };
  messages: Array<{
    id: number;
    content: string;
    isFromUser: boolean;
    type: string;
    senderType: string;
    createdAt: string;
  }>;
};

export function ChatMessagesTab({
  chats,
  isLoading,
  onEditMessage,
  onDeleteMessage,
  editingId,
  deletingId,
}: {
  chats: Chat[];
  isLoading: boolean;
  onEditMessage: (messageId: number, content: string) => void;
  onDeleteMessage: (messageId: number) => void;
  editingId: number | null;
  deletingId: number | null;
}) {
  const [expandedChatIds, setExpandedChatIds] = useState<Set<number>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const toggleChat = (chatId: number) => {
    setExpandedChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const startEdit = (msg: { id: number; content: string }) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const saveEdit = () => {
    if (editingMessageId != null && editContent.trim() !== "") {
      onEditMessage(editingMessageId, editContent.trim());
      cancelEdit();
    }
  };

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

  if (chats.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="text-center py-16 text-muted-foreground text-sm">
          캐릭터와의 채팅 내역이 없습니다
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {chats.map((chat) => {
        const isExpanded = expandedChatIds.has(chat.id);
        const messageCount = chat.messages?.length ?? 0;

        return (
          <Card key={chat.id} className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleChat(chat.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
            >
              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                <AvatarImage src={chat.character.avatarImage ?? chat.character.mainImage ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {chat.character.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">
                  {chat.character.name}
                  {chat.character.koreanName && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({chat.character.koreanName})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {messageCount}개 메시지
                  {chat.lastMessageAt && (
                    <> · 마지막 {new Date(chat.lastMessageAt).toLocaleString("ko-KR")}</>
                  )}
                </p>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <CardContent className="pt-0 px-5 pb-5 border-t border-border/50">
                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {chat.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.isFromUser ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex-1 max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.isFromUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {msg.isFromUser ? (
                              <User className="w-3.5 h-3.5 opacity-80" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 opacity-80" />
                            )}
                            <span className="text-xs opacity-80">
                              {msg.isFromUser ? "유저" : "캐릭터"} ·{" "}
                              {new Date(msg.createdAt).toLocaleString("ko-KR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {editingMessageId === msg.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={saveEdit}
                                  disabled={editingId === msg.id}
                                >
                                  {editingId === msg.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "저장"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={cancelEdit}
                                >
                                  취소
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                  onClick={() => startEdit(msg)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-destructive/80 hover:text-destructive"
                                  onClick={() => {
                                    if (confirm("이 메시지를 삭제하시겠습니까?")) {
                                      onDeleteMessage(msg.id);
                                    }
                                  }}
                                  disabled={deletingId === msg.id}
                                >
                                  {deletingId === msg.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {editingMessageId === msg.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[80px] text-sm bg-background/20 border-0"
                              placeholder="메시지 내용"
                            />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
