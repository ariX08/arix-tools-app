import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Upload, Sparkles, Workflow } from "lucide-react";
import { useCallback, useMemo, useState, type ChangeEvent, type DragEvent } from "react";

import { ToolCard } from "@/components/ToolCard";
import { CATEGORIES, TOOLS, searchTools, suggestToolForFiles } from "@/lib/tools/registry";
import { FREE_LIMIT } from "@/hooks/useUsage";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);

  const tools = useMemo(() => searchTools(query, category), [query, category]);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const files = Array.from(event.dataTransfer.files ?? []);
      if (!files.length) return;
      const slug = suggestToolForFiles(files);
      void navigate({
        to: "/tools/$slug",
        params: { slug },
        state: { droppedFiles: files } as never,
      });
    },
    [navigate],
  );

  const onMobileUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (!files.length) return;
      const slug = suggestToolForFiles(files);
      void navigate({
        to: "/tools/$slug",
        params: { slug },
        state: { droppedFiles: files } as never,
      });
      event.target.value = "";
    },
    [navigate],
  );

  return (
    <div
      className="relative mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-md">
          <div className="glass-strong glass-sheen rounded-3xl px-10 py-8 text-center">
            <Upload className="text-brand mx-auto size-10" />
            <p className="mt-3 text-lg font-semibold">Drop files to launch a tool</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We will pick the best tool for what you dropped
            </p>
          </div>
        </div>
      )}

      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
        >
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-[var(--violet)]" />
            {user ? "Unlimited tasks unlocked" : `${FREE_LIMIT} free tasks · no card required`}
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Every file tool you need.
            <br />
            <span className="text-brand">Perfectly fluid.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            45+ PDF and image tools in one liquid-glass workspace. Merge, compress, convert, OCR,
            remove backgrounds, and more — processed privately and removed automatically.
          </p>
        </motion.div>

        <div className="mx-auto mt-6 max-w-md md:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="glass w-full rounded-2xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={
                  active
                    ? "bg-brand rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
                    : "glass liquid-hover rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        {tools.length === 0 ? (
          <div className="glass-strong mx-auto max-w-md rounded-3xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No tools match “{query}”.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="text-brand mt-3 text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <ToolCard key={tool.slug} tool={tool} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="glass-strong glass-sheen glass-noise relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="bg-brand grid size-12 shrink-0 place-items-center rounded-2xl text-white">
                <Workflow className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Create a workflow</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Chain your favourite tools, automate repetitive tasks, and reuse them anytime.
                  Sign in to save workflows to your dashboard.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void navigate({ to: user ? "/dashboard" : "/auth" })}
              className="bg-brand ring-glow shrink-0 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
            >
              {user ? "Open dashboard" : "Sign in to start"}
            </button>
          </div>
        </div>
      </section>

      <label className="bg-brand ring-glow fixed bottom-6 right-6 z-40 grid size-14 cursor-pointer place-items-center rounded-full text-white shadow-lg sm:hidden">
        <Upload className="size-6" />
        <input
          type="file"
          multiple
          accept="application/pdf,image/*,.pdf"
          className="sr-only"
          onChange={onMobileUpload}
        />
      </label>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        {TOOLS.filter((t) => t.status === "ready").length} tools ready ·{" "}
        {TOOLS.filter((t) => t.status === "soon").length} coming soon
      </p>
    </div>
  );
}
