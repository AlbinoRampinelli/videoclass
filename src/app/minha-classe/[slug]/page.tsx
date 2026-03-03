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
        const modulo = await db.module.findFirst({
            where: { course: { slug: slug } },
            include: {
                videos: { 
                    orderBy: { order: 'asc' }
                },
                challenges: true // Buscamos a tabela onde estão os desafios (o "20")
            }
        });

        if (!modulo || !modulo.videos || modulo.videos.length === 0) {
            return redirect("/vitrine");
        }

        // 1. Localiza o VÍDEO (para a navegação da tela)
        const videoSelecionado = modulo.videos.find((v: any) => {
            const termoBusca = aulaUrl?.toLowerCase() || "";
            if (termoBusca.includes("configuracao") && v.title.includes("1.2")) return true;
            if (termoBusca.includes("hello") && v.title.includes("1.1")) return true;
            return v.title.toLowerCase().includes(termoBusca);
        }) || modulo.videos[0];

        // 2. Localiza o DESAFIO correspondente (pelo ID ou por título parecido)
        const desafioCorrespondente = modulo.challenges.find((c: any) => {
            const termoBusca = aulaUrl?.toLowerCase() || "";
            return c.id === desafioId || c.title.toLowerCase().includes(termoBusca);
        });

        // 3. MONTAGEM DA AULA ATIVA (Unindo Video + Challenge)
        const aulaAtiva = {
            ...videoSelecionado,
            moduleTitle: modulo.title,
            // Aqui está a mágica: se achou um desafio, usa o "expected" dele
            expectedOutput: desafioCorrespondente?.expected || (videoSelecionado as any).expectedOutput || "",
            initialCode: desafioCorrespondente?.initialCode || (videoSelecionado as any).initialCode || "",
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
                    todosOsVideos={modulo.videos as any}
                    codigoSalvo={codigoSalvo}
                />
            </Suspense>
        );

    } catch (error) {
        console.error("Erro no servidor:", error);
        return redirect("/vitrine?error=server_error");
    }
}