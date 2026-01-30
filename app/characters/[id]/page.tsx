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
  aiPrompt: string | null;
  images: CharacterImage[];
};

type CharacterFormData = {
  name: string;
  description: string;
  personality: string;
  aiPrompt: string;
  avatarImage: string;
  mainImage: string;
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

  const { register, handleSubmit, control, reset, watch, setValue } =
    useForm<CharacterFormData>({
      defaultValues: {
        name: "",
        description: "",
        personality: "",
        aiPrompt: "",
        avatarImage: "",
        mainImage: "",
      },
    });

  const avatarImage = watch("avatarImage");
  const mainImage = watch("mainImage");
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
        reset({
          name: data.name,
          isMain: data.isMain,
          description: data.description,
          personality: data.personality || "",
          aiPrompt: data.aiPrompt || "",
          avatarImage: data.avatarImage,
          mainImage: data.mainImage,
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
    const body = {
      name: data.name,
      avatarImage: data.avatarImage || "/placeholder-avatar.png",
      description: data.description,
      personality: data.personality || null,
      aiPrompt: data.aiPrompt || null,
      mainImage: data.mainImage,
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
          await fetch(`/api/characters/${savedCharacterId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(img),
          });
        }
      }

      // Delete removed images
      for (const imageId of deletedImageIds) {
        await fetch(`/api/characters/${savedCharacterId}/images/${imageId}`, {
          method: "DELETE",
        });
      }

      // Update existing images (labels, isDefault)
      for (const img of images) {
        if (!deletedImageIds.includes(img.id)) {
          await fetch(`/api/characters/${savedCharacterId}/images/${img.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
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
    field: "label" | "isDefault",
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
              </CardContent>
            </Card>

            {/* AI Prompt Section */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Character Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("aiPrompt")}
                  className="rounded-xl bg-secondary border-0 min-h-[120px]"
                  placeholder="Describe how this character should behave and respond in conversations. This will guide the AI when generating dialog for this character..."
                />
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
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                          <img
                            src={img.imageUrl}
                            alt={img.label || "Expression"}
                            className="w-full h-full object-cover"
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
                <ImageUploader
                  value={avatarImage}
                  onChange={(url) => setValue("avatarImage", url)}
                  aspectRatio="square"
                  maxSizeMB={10}
                />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Main Image</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  value={mainImage}
                  onChange={(url) => setValue("mainImage", url)}
                  aspectRatio="square"
                  maxSizeMB={10}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
