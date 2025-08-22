"use client";

import { Target, Coffee, BarChart3, Keyboard, Zap, Smartphone } from 'lucide-react';
import { cn } from "@/lib/utils";

const features = [
  {
    title: "High-Precision Timer",
    description: "Web Worker-powered timer with minimal drift, even when tab is backgrounded.",
    icon: Target,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Smart Breaks",
    description: "Automatic short and long breaks with configurable intervals.",
    icon: Coffee,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Analytics & Insights",
    description: "Track your productivity with detailed charts and progress metrics.",
    icon: BarChart3,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Keyboard-First",
    description: "Full keyboard shortcuts and command palette for power users.",
    icon: Keyboard,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Task Management",
    description: "Organize tasks with projects, tags, and priority levels.",
    icon: Zap,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "PWA Ready",
    description: "Install as a native app with offline support and notifications.",
    icon: Smartphone,
    className: "md:col-span-1 md:row-span-1",
  },
];

export function FeaturesBentoGrid() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {features.map((item, i) => (
          <div
            key={i}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
              item.className
            )}
          >
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
