"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

const categories = ["Fantasy", "Romance", "Mystery", "Sci-Fi", "Drama"];
const difficulties = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
];

export default function CreateStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    koreanTitle: "",
    type: "NOVEL" as "UNIT" | "NOVEL" | "PLAY",
    category: "",
    icon: "📖",
    level: "BEGINNER",
    description: "",
    coverImage: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.category) {
      setError("Category is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          koreanTitle: form.koreanTitle.trim(),
          type: form.type,
          category: form.category,
          icon: form.icon || "📖",
          level: form.level,
          description: form.description.trim() || null,
          coverImage: form.coverImage.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create story");
      }

      const story = await res.json();
      router.push(`/stories/${story.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Create Story"
        description="Add a new story to your library"
      >
        <Link href="/stories">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl border-border/50 shadow-sm max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter story title"
                value={form.title}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>

            {/* Korean Title */}

            <div className="space-y-2">
              <Label htmlFor="koreanTitle">Korean Title</Label>
              <Input
                id="koreanTitle"
                name="koreanTitle"
                placeholder="Enter story korean title"
                value={form.koreanTitle}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value: "UNIT" | "NOVEL" | "PLAY") =>
                  setForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="UNIT" className="rounded-lg">
                    Unit (Learning-focused)
                  </SelectItem>
                  <SelectItem value="NOVEL" className="rounded-lg">
                    Novel (Story-driven)
                  </SelectItem>
                  <SelectItem value="PLAY" className="rounded-lg">
                    Play (Premium)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="rounded-lg">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={form.level}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, difficulty: Number(value) }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {difficulties.map((diff) => (
                    <SelectItem
                      key={diff.value}
                      value={String(diff.value)}
                      className="rounded-lg"
                    >
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                name="icon"
                placeholder="📖"
                value={form.icon}
                onChange={handleChange}
                className="rounded-xl w-24"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter story description..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                name="coverImage"
                placeholder="https://..."
                value={form.coverImage}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/stories">
                <Button type="button" variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Story
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}
