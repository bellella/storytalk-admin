"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";

type CharacterImage = {
  id: string;
  imageUrl: string;
  label: string | null;
  isDefault: boolean;
};

type Character = {
  id: string;
  name: string;
  avatarImage: string;
  mainImage: string;
  description: string;
  personality: string | null;
  chatPrompt: string | null;
  playEpisodePrompt: string | null;
  data: unknown;
  images: CharacterImage[];
};

type CharacterFormData = {
  name: string;
  description: string;
  personality: string;
  chatPrompt: string;
  playEpisodePrompt: string;
  greetingEnglish: string;
  greetingKorean: string;
  avatarImage: string;
  mainImage: string;
  isUserSelectable: boolean;
  minUserLevel: number;
};

export default function CharacterEditPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;
  const isNew = characterId === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [images, setImages] = useState<CharacterImage[]>([]);
  const [newImages, setNewImages] = useState<
    { imageUrl: string; label: string; isDefault: boolean }[]
  >([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  /** data JSON minus greetingMessage merge target on save */
  const [characterDataRest, setCharacterDataRest] = useState<Record<string, unknown>>({});

  const { register, handleSubmit, control, reset, watch } =
    useForm<CharacterFormData>({
      defaultValues: {
        name: "",
        description: "",
        personality: "",
        chatPrompt: "",
        playEpisodePrompt: "",
        greetingEnglish: "",
        greetingKorean: "",
        avatarImage: "",
        mainImage: "",
        isUserSelectable: false,
        minUserLevel: 1,
      },
    });

  const name = watch("name");
  const description = watch("description");

  // Fetch character data
  useEffect(() => {
    if (isNew) return;

    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/characters/${characterId}`);
        if (!res.ok) throw new Error("Failed to fetch character");
        const data = await res.json();
        setCharacter(data);
        setImages(data.images || []);
        const rawData =
          data.data &&
          typeof data.data === "object" &&
          !Array.isArray(data.data)
            ? (data.data as Record<string, unknown>)
            : {};
        const gm = rawData.greetingMessage as
          | { englishText?: string; koreanText?: string }
          | undefined;
        const { greetingMessage: _omit, ...rest } = rawData;
        setCharacterDataRest(rest);
        reset({
          name: data.name,
          description: data.description,
          personality: data.personality || "",
          chatPrompt: data.chatPrompt || "",
          playEpisodePrompt: data.playEpisodePrompt || "",
          greetingEnglish:
            typeof gm?.englishText === "string" ? gm.englishText : "",
          greetingKorean:
            typeof gm?.koreanText === "string" ? gm.koreanText : "",
          avatarImage: data.avatarImage,
          mainImage: data.mainImage,
          isUserSelectable: data.isUserSelectable ?? false,
          minUserLevel: data.minUserLevel ?? 1,
        });
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId, isNew, reset]);

  const onSubmit = async (data: CharacterFormData) => {
    setSaving(true);
    const dataJson = {
      ...characterDataRest,
      greetingMessage: {
        englishText: data.greetingEnglish.trim(),
        koreanText: data.greetingKorean.trim(),
      },
    };
    const body = {
      name: data.name,
      avatarImage: data.avatarImage || "/placeholder-avatar.png",
      description: data.description,
      personality: data.personality || null,
      chatPrompt: data.chatPrompt || null,
      playEpisodePrompt: data.playEpisodePrompt || null,
      data: dataJson,
      mainImage: data.mainImage ?? null,
      isUserSelectable: data.isUserSelectable,
      minUserLevel: data.isUserSelectable ? data.minUserLevel : 1,
    };

    try {
      let savedCharacterId = characterId;

      if (isNew) {
        const res = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create character");
        const newCharacter = await res.json();
        savedCharacterId = newCharacter.id;
      } else {
        const res = await fetch(`/api/characters/${characterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update character");
      }

      // Save new images
      for (const img of newImages) {
        if (img.imageUrl) {
          const imgRes = await fetch(
            `/api/characters/${savedCharacterId}/images`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(img),
            }
          );
          if (!imgRes.ok) throw new Error("Failed to save expression image");
        }
      }

      // Delete removed images
      for (const imageId of deletedImageIds) {
        await fetch(`/api/characters/${savedCharacterId}/images/${imageId}`, {
          method: "DELETE",
        });
      }

      // Update existing images (imageUrl, labels, isDefault)
      for (const img of images) {
        if (!deletedImageIds.includes(img.id)) {
          await fetch(`/api/characters/${savedCharacterId}/images/${img.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: img.imageUrl,
              label: img.label,
              isDefault: img.isDefault,
            }),
          });
        }
      }

      router.push("/characters");
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    setNewImages([...newImages, { imageUrl: "", label: "", isDefault: false }]);
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleUpdateExistingImage = (
    imageId: string,
    field: "imageUrl" | "label" | "isDefault",
    value: string | boolean
  ) => {
    setImages(
      images.map((img) =>
        img.id === imageId ? { ...img, [field]: value } : img
      )
    );
  };

  const handleUpdateNewImage = (
    index: number,
    field: "imageUrl" | "label" | "isDefault",
    value: string | boolean
  ) => {
    setNewImages(
      newImages.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      )
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </div>
      </AdminLayout>
    );
  }

  const visibleImages = images.filter(
    (img) => !deletedImageIds.includes(img.id)
  );

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PageHeader
          title={isNew ? "Create Character" : "Edit Character"}
          description={
            isNew
              ? "Create a new character"
              : `Editing ${character?.name || ""}`
          }
        >
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push("/characters")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="rounded-xl shadow-lg shadow-primary/25"
              disabled={saving || !name || !description}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isNew ? "Create" : "Save Changes"}
            </Button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Character Name
                    </Label>
                    <Input
                      {...register("name", { required: true })}
                      className="mt-2 rounded-xl bg-secondary border-0"
                      placeholder="Enter character name"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    {...register("description", { required: true })}
                    className="mt-2 rounded-xl bg-secondary border-0 min-h-[100px]"
                    placeholder="Brief character description..."
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Personality Traits
                  </Label>
                  <Input
                    {...register("personality")}
                    className="mt-2 rounded-xl bg-secondary border-0"
                    placeholder="Brave, Curious, Kind (comma separated)"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Greeting Message
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    채팅 시작 시 인사 — 영어 / 한국어 각각 저장됩니다 (
                    <code className="text-[11px]">data.greetingMessage</code>)
                  </p>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      English
                    </Label>
                    <Textarea
                      {...register("greetingEnglish")}
                      className="mt-1 rounded-xl bg-secondary border-0 min-h-[72px]"
                      placeholder="First message in English..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Korean
                    </Label>
                    <Textarea
                      {...register("greetingKorean")}
                      className="mt-1 rounded-xl bg-secondary border-0 min-h-[72px]"
                      placeholder="첫 인사 (한국어)..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isUserSelectable")}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">
                      User Selectable
                    </span>
                  </label>
                  {watch("isUserSelectable") && (
                    <div>
                      <Label className="text-sm font-medium">
                        Min User Level
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        {...register("minUserLevel", {
                          valueAsNumber: true,
                          min: 1,
                        })}
                        className="mt-2 rounded-xl bg-secondary border-0 w-24"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Prompt Section */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Character Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Chat Prompt</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">캐릭터 채팅 시 사용되는 프롬프트</p>
                  <Textarea
                    {...register("chatPrompt")}
                    className="rounded-xl bg-secondary border-0 min-h-[120px]"
                    placeholder="채팅에서 이 캐릭터가 어떻게 행동하고 응답해야 하는지 설명하세요..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Play Episode Prompt</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">Play 에피소드 AI 슬롯에서 사용되는 프롬프트</p>
                  <Textarea
                    {...register("playEpisodePrompt")}
                    className="rounded-xl bg-secondary border-0 min-h-[120px]"
                    placeholder="Play 에피소드에서 이 캐릭터가 어떻게 행동하고 응답해야 하는지 설명하세요..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expression Images Section */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Expression Images
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleAddImage}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Expression
                </Button>
              </CardHeader>
              <CardContent>
                {visibleImages.length === 0 && newImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No expression images yet</p>
                    <p className="text-sm">
                      Add expressions like happy, sad, angry, etc.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Existing Images */}
                    {visibleImages.map((img) => (
                      <div
                        key={img.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
                      >
                        <div className="w-38 flex-shrink-0">
                          <ImageUploader
                            value={img.imageUrl}
                            onChange={(url) =>
                              handleUpdateExistingImage(img.id, "imageUrl", url)
                            }
                            aspectRatio="square"
                            maxSizeMB={10}
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Label</Label>
                            <Input
                              value={img.label || ""}
                              onChange={(e) =>
                                handleUpdateExistingImage(
                                  img.id,
                                  "label",
                                  e.target.value
                                )
                              }
                              className="mt-1 rounded-xl bg-secondary border-0"
                              placeholder="e.g., happy, sad, angry"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={img.isDefault}
                              onChange={(e) =>
                                handleUpdateExistingImage(
                                  img.id,
                                  "isDefault",
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-muted-foreground">
                              Default expression
                            </span>
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-destructive hover:text-destructive"
                          onClick={() => handleRemoveExistingImage(img.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {/* New Images */}
                    {newImages.map((img, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
                      >
                        <div className="w-24 flex-shrink-0">
                          <ImageUploader
                            value={img.imageUrl}
                            onChange={(url) =>
                              handleUpdateNewImage(index, "imageUrl", url)
                            }
                            aspectRatio="square"
                            maxSizeMB={10}
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Label</Label>
                            <Input
                              value={img.label}
                              onChange={(e) =>
                                handleUpdateNewImage(
                                  index,
                                  "label",
                                  e.target.value
                                )
                              }
                              className="mt-1 rounded-xl bg-secondary border-0"
                              placeholder="e.g., happy, sad, angry"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={img.isDefault}
                              onChange={(e) =>
                                handleUpdateNewImage(
                                  index,
                                  "isDefault",
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-muted-foreground">
                              Default expression
                            </span>
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-destructive hover:text-destructive"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Avatar and Main Image */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Avatar Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="avatarImage"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      aspectRatio="square"
                      maxSizeMB={10}
                    />
                  )}
                />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Main Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="mainImage"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      aspectRatio="square"
                      maxSizeMB={10}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
