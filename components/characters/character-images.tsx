"use client";

import type { CharacterImageBasic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";

export type NewImage = {
  imageUrl: string;
  label: string;
  isDefault: boolean;
};

interface CharacterImagesProps {
  images: CharacterImageBasic[];
  deletedImageIds: number[];
  newImages: NewImage[];
  onAddImage: () => void;
  onRemoveExistingImage: (imageId: number) => void;
  onRemoveNewImage: (index: number) => void;
  onUpdateExistingImage: (
    imageId: number,
    field: "imageUrl" | "label" | "isDefault",
    value: string | boolean
  ) => void;
  onUpdateNewImage: (
    index: number,
    field: "imageUrl" | "label" | "isDefault",
    value: string | boolean
  ) => void;
}

export function CharacterImages({
  images,
  deletedImageIds,
  newImages,
  onAddImage,
  onRemoveExistingImage,
  onRemoveNewImage,
  onUpdateExistingImage,
  onUpdateNewImage,
}: CharacterImagesProps) {
  const visibleImages = images.filter(
    (img) => !deletedImageIds.includes(img.id)
  );

  return (
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
          onClick={onAddImage}
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
            {visibleImages.map((img) => (
              <div
                key={img.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
              >
                <div className="w-38 flex-shrink-0">
                  <ImageUploader
                    value={img.imageUrl}
                    onChange={(url) =>
                      onUpdateExistingImage(img.id, "imageUrl", url)
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
                        onUpdateExistingImage(img.id, "label", e.target.value)
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
                        onUpdateExistingImage(
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
                  onClick={() => onRemoveExistingImage(img.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {newImages.map((img, index) => (
              <div
                key={`new-${index}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
              >
                <div className="w-24 flex-shrink-0">
                  <ImageUploader
                    value={img.imageUrl}
                    onChange={(url) =>
                      onUpdateNewImage(index, "imageUrl", url)
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
                        onUpdateNewImage(index, "label", e.target.value)
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
                        onUpdateNewImage(index, "isDefault", e.target.checked)
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
                  onClick={() => onRemoveNewImage(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
