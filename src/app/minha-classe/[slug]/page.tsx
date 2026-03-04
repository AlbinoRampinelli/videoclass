import { db } from "../../../../prisma/db";
import MinhaClasseClient from "./MinhaClasseClient";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from 'react';
import type { NavItem, SubmissionData } from "./MinhaClasseClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ videoId?: string, challengeId?: string }>
}) {
  const [resolvedParams, resolvedSearchParams, session] = await Promise.all([
    params, searchParams, auth()
  ]);

  const slug = resolvedParams?.slug;
  if (!slug) return redirect("/vitrine");

  const activeVideoId = resolvedSearchParams?.videoId || null;
  const activeChallengeId = resolvedSearchParams?.challengeId || null;

  try {
    const modulos = await db.module.findMany({
      where: { course: { slug } },
      orderBy: { order: 'asc' },
      include: {
        videos: {
          orderBy: { order: 'asc' },
          include: { challenges: { orderBy: { order: 'asc' } } }
        },
        // Desafios ligados ao módulo sem vídeo específico
        challenges: {
          where: { videoId: null },
          orderBy: { order: 'asc' },
        },
      }
    });

    if (!modulos.length) return redirect("/vitrine");

    // Build flat navigation items:
    // Para cada módulo → [video, challenge-do-video?, ...] depois [challenges-do-módulo]
    const navItems: NavItem[] = [];
    for (const mod of modulos) {
      for (const video of mod.videos) {
        const videoPdfUrl = video.pdfUrl ?? (mod as any).pdfUrl ?? null;
        navItems.push({
          type: 'video',
          id: video.id,
          moduleId: mod.id,
          moduleTitle: mod.title,
          title: video.title,
          url: video.url ?? (mod as any).videoUrl ?? null,
          description: video.description,
          initialCode: video.initialCode,
          expectedOutput: video.expectedOutput,
          pdfUrl: videoPdfUrl,
        });
        // Desafios vinculados a este vídeo (pode haver mais de um)
        for (const ch of video.challenges) {
          navItems.push({
            type: 'challenge',
            id: ch.id,
            moduleId: mod.id,
            moduleTitle: mod.title,
            title: ch.title,
            description: ch.description,
            initialCode: ch.initialCode,
            expectedOutput: ch.expected,
            challengeId: ch.id,
            pdfUrl: videoPdfUrl,
          });
        }
      }
      // Desafios vinculados apenas ao módulo (sem videoId)
      for (const ch of (mod as any).challenges) {
        navItems.push({
          type: 'challenge',
          id: ch.id,
          moduleId: mod.id,
          moduleTitle: mod.title,
          title: ch.title,
          description: ch.description,
          initialCode: ch.initialCode,
          expectedOutput: ch.expected,
          challengeId: ch.id,
          pdfUrl: (mod as any).pdfUrl ?? null,
        });
      }
    }

    if (!navItems.length) return redirect("/vitrine");

    // Fetch user's latest submission per challenge
    const submissions: Record<string, SubmissionData> = {};
    if (session?.user?.email) {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (user) {
        const challengeIds = navItems
          .filter(i => i.type === 'challenge' && i.challengeId)
          .map(i => i.challengeId!);
        if (challengeIds.length) {
          const subs = await db.submission.findMany({
            where: { userId: user.id, challengeId: { in: challengeIds } },
            orderBy: { createdAt: 'desc' },
          });
          for (const sub of subs) {
            if (!submissions[sub.challengeId]) {
              submissions[sub.challengeId] = {
                grade: sub.grade,
                completed: sub.completed,
                code: sub.code,
              };
            }
          }
        }
      }
    }

    // Determine active item index
    let activeIndex = 0;
    if (activeChallengeId) {
      const idx = navItems.findIndex(i => i.challengeId === activeChallengeId);
      if (idx >= 0) activeIndex = idx;
    } else if (activeVideoId) {
      const idx = navItems.findIndex(i => i.type === 'video' && i.id === activeVideoId);
      if (idx >= 0) activeIndex = idx;
    }

    const activeItem = navItems[activeIndex];
    const codigoSalvo = activeItem.type === 'challenge' && activeItem.challengeId
      ? (submissions[activeItem.challengeId]?.code || null)
      : null;

    return (
      <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
        <MinhaClasseClient
          navItems={navItems}
          activeIndex={activeIndex}
          submissions={submissions}
          codigoSalvo={codigoSalvo}
          slug={slug}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Erro no servidor:", error);
    return redirect("/vitrine?error=server_error");
  }
}
