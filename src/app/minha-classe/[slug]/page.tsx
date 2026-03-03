import { db } from "../../../../prisma/db";
import MinhaClasseClient from "./MinhaClasseClient";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from 'react';

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ desafio?: string, aula?: string }>
}) {

    const [resolvedParams, resolvedSearchParams, session] = await Promise.all([
        params,
        searchParams,
        auth()
    ]);

    const slug = resolvedParams?.slug;
    const desafioId = resolvedSearchParams?.desafio;
    const aulaUrl = resolvedSearchParams?.aula;

    if (!slug) return redirect("/vitrine");

    try {
        // Busca módulos (vídeos) e desafios (por courseSlug) em paralelo
        const [modulos, todosOsDesafios] = await Promise.all([
            db.module.findMany({
                where: { course: { slug: slug } },
                orderBy: { order: 'asc' },
                include: { videos: { orderBy: { order: 'asc' } } }
            }),
            db.challenge.findMany({
                where: { courseSlug: slug },
                orderBy: { order: 'asc' },
                include: { module: true }
            })
        ]);

        if (!modulos || modulos.length === 0) return redirect("/vitrine");

        const primeirModulo = modulos[0];
        const todosOsVideos = modulos.flatMap((m: any) => m.videos);

        if (todosOsVideos.length === 0) return redirect("/vitrine");

        // 1. Localiza o VÍDEO
        const videoSelecionado = (aulaUrl
            ? todosOsVideos.find((v: any) => {
                const t = aulaUrl.toLowerCase();
                if (t.includes("configuracao") && v.title.includes("1.2")) return true;
                if (t.includes("hello") && v.title.includes("1.1")) return true;
                return v.title.toLowerCase().includes(t);
            })
            : null) || todosOsVideos[0];

        // 2. Localiza o DESAFIO pelo índice ordinal (desafio=1 → index 0, desafio=2 → index 1)
        const desafioCorrespondente = desafioId
            ? (todosOsDesafios as any[])[Number(desafioId) - 1]
            : null;

        // 3. MONTAGEM DA AULA ATIVA
        const aulaAtiva = {
            ...videoSelecionado,
            moduleTitle: desafioCorrespondente?.module?.title || primeirModulo.title,
            title: desafioCorrespondente?.title || videoSelecionado.title,
            description: desafioCorrespondente?.description || (videoSelecionado as any).description || "",
            expectedOutput: desafioCorrespondente?.expected || (videoSelecionado as any).expectedOutput || "",
            initialCode: desafioCorrespondente?.initialCode || (videoSelecionado as any).initialCode || "",
            url: desafioCorrespondente ? "" : videoSelecionado.url,
            challengeId: desafioCorrespondente?.id || null
        };

        let codigoSalvo = null;
        if (aulaAtiva.challengeId && session?.user?.id) {
            const ultimaSubmissao = await db.submission.findFirst({
                where: {
                    challengeId: aulaAtiva.challengeId,
                    userId: session.user.id,
                },
                orderBy: { createdAt: 'desc' }
            });
            codigoSalvo = ultimaSubmissao?.code || null;
        }

        return (
            <Suspense fallback={<div>Carregando...</div>}>
                <MinhaClasseClient
                    aulaAtiva={aulaAtiva}
                    todosOsVideos={todosOsVideos as any}
                    codigoSalvo={codigoSalvo}
                />
            </Suspense>
        );

    } catch (error) {
        console.error("Erro no servidor:", error);
        return redirect("/vitrine?error=server_error");
    }
}