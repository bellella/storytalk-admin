"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LayoutDashboard,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Layers,
  Sparkles,
  ShoppingBag,
  LayoutGrid,
  BrainCircuit,
  Smile,
  Image as ImageIcon,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Stories", href: "/stories" },
  { icon: Layers, label: "Units", href: "/units" },
  { icon: UserCircle, label: "Characters", href: "/characters" },
  { icon: ShoppingBag, label: "Products", href: "/products" },
  { icon: LayoutGrid, label: "Collections", href: "/collections" },
  { icon: ImageIcon, label: "Images", href: "/images" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Sparkles, label: "XP", href: "/xp" },
  { icon: Ticket, label: "Coupons", href: "/coupons" },
  { icon: Smile, label: "Stickers", href: "/stickers" },
  { icon: BrainCircuit, label: "Prompts", href: "/prompts" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col min-h-0 bg-card border-r border-border transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground text-lg">
                Story Talk
              </span>
            )}
          </div>
        </div>

        {/* Navigation - scrollable when many items */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center rounded-xl hover:bg-secondary"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stories, characters..."
                className="pl-10 bg-secondary border-0 rounded-xl focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground">
                  Admin User
                </p>
                <p className="text-xs text-muted-foreground">Content Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 min-h-0">{children}</main>
      </div>
    </div>
  );
}
