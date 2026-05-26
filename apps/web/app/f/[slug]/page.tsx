"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { PublicFormRenderer } from "~/components/public-form-renderer";
import { useGetFormBySlug } from "~/hooks/api/form";

export default function SlugFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { form, isLoading, error } = useGetFormBySlug(slug);

  const fields = form?.fields ?? [];
  const isExpired = form?.expiresAt ? new Date() > new Date(form.expiresAt) : false;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
        rel="stylesheet"
      />

      <main
        className="relative min-h-screen overflow-hidden bg-[#0d0d0d] px-4 py-20 text-white sm:px-6 sm:py-24"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
          style={{ background: "linear-gradient(90deg, #0f6e56, #1d9e75, #0f6e56)" }}
        />
        <div
          className="pointer-events-none fixed -right-[200px] -top-[200px] size-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(11,92,71,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="mb-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                <span
                  className="inline-block size-[5px] rounded-full"
                  style={{ background: "#1d9e75", boxShadow: "0 0 6px rgba(29,158,117,0.7)" }}
                />
                Public form
              </span>
            </div>

            <h1
              className="mb-2 text-4xl leading-[1.1] tracking-tight text-white/90 sm:text-[2.6rem]"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {isLoading ? "Loading form…" : form?.title ?? "Untitled form"}
            </h1>

            {form?.description ? (
              <p className="text-[14px] leading-[1.5] text-white/35">{form.description}</p>
            ) : null}
          </div>

          <div
            className="mb-7 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(29,158,117,0.2) 60%, transparent)",
            }}
          />

          {error ? (
            <div className="rounded-[10px] border border-rose-500/30 bg-rose-500/[0.06] p-4 text-sm text-rose-300">
              This form could not be loaded. Please try again.
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-28 rounded-full bg-white/[0.06]" />
                  <div className="h-12 rounded-[10px] border border-white/[0.06] bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : !form ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] p-5 text-sm text-white/40">
              This form is not available.
            </div>
          ) : isExpired ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div
                className="grid size-16 place-items-center rounded-full"
                style={{
                  background: "rgba(220,38,38,0.1)",
                  border: "1px solid rgba(220,38,38,0.3)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(248,113,113,0.9)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2
                className="text-2xl text-white/80"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                }}
              >
                Form closed
              </h2>
              <p className="max-w-[280px] text-sm leading-[1.6] text-white/40">
                This form is no longer accepting responses.
              </p>
            </div>
          ) : fields.length === 0 ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] p-5 text-sm text-white/40">
              This form does not have any fields yet.
            </div>
          ) : (
            <PublicFormRenderer formId={form.id} fields={fields} />
          )}
        </div>
      </main>
    </>
  );
}
