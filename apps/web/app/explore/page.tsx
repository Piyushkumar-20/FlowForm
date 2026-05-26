"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, CompassIcon } from "lucide-react";

import { useGetPublicForms } from "~/hooks/api/form";
import { Skeleton } from "~/components/ui/skeleton";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(d);
}

export default function ExplorePage() {
  const { forms, isLoading, error } = useGetPublicForms();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
        rel="stylesheet"
      />

      <main
        className="relative min-h-screen overflow-hidden bg-[#0d0d0d] px-4 py-16 text-white sm:px-6 sm:py-20"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Top accent bar */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
          style={{ background: "linear-gradient(90deg, #0f6e56, #1d9e75, #0f6e56)" }}
        />

        {/* Ambient orb */}
        <div
          className="pointer-events-none fixed -left-[300px] -top-[300px] size-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(11,92,71,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                <CompassIcon className="size-3.5" style={{ color: "#1d9e75" }} />
                Explore
              </span>
            </div>
            <h1
              className="mb-3 text-5xl leading-[1.05] tracking-tight text-white/90"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Public forms
            </h1>
            <p className="text-[15px] leading-[1.6] text-white/40">
              Browse and fill out forms shared by the community.
            </p>
          </div>

          {/* Divider */}
          <div
            className="mb-10 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(29,158,117,0.3), transparent)",
            }}
          />

          {/* Content */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] p-5"
                >
                  <Skeleton className="mb-3 h-4 w-3/4 bg-white/[0.06]" />
                  <Skeleton className="mb-1 h-3 w-full bg-white/[0.04]" />
                  <Skeleton className="h-3 w-2/3 bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[10px] border border-rose-500/30 bg-rose-500/[0.06] p-5 text-sm text-rose-300">
              {error instanceof Error
                ? error.message
                : "Could not load public forms."}
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div
                className="grid size-16 place-items-center rounded-full"
                style={{
                  background: "rgba(29,158,117,0.08)",
                  border: "1px solid rgba(29,158,117,0.2)",
                }}
              >
                <CompassIcon
                  className="size-7"
                  style={{ color: "rgba(29,158,117,0.6)" }}
                />
              </div>
              <h2
                className="text-2xl text-white/70"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                }}
              >
                Nothing here yet
              </h2>
              <p className="max-w-[280px] text-sm leading-[1.6] text-white/35">
                No public forms have been published yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/form/${form.id}`}
                  className="group relative flex flex-col justify-between rounded-[14px] border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(29,158,117,0.3)] hover:bg-[rgba(29,158,117,0.04)]"
                >
                  <div>
                    <h2
                      className="mb-2 text-[18px] leading-[1.2] text-white/85 transition-colors group-hover:text-white"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 600,
                      }}
                    >
                      {form.title ?? "Untitled form"}
                    </h2>
                    {form.description ? (
                      <p className="line-clamp-2 text-[13px] leading-[1.5] text-white/35">
                        {form.description}
                      </p>
                    ) : (
                      <p className="text-[13px] text-white/20 italic">
                        No description
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-white/30">
                      {formatDate(form.createdAt)}
                    </span>
                    <ArrowRightIcon
                      className="size-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-[#1d9e75]"
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
