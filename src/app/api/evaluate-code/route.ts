import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { userCode, expectedOutput, challengeTitle, challengeDescription } = await req.json();

    if (!userCode) {
      return NextResponse.json({ error: "Código não enviado" }, { status: 400 });
    }

    const prompt = `Você é um professor de programação Python avaliando o código de um aluno iniciante.

Desafio: ${challengeTitle || "Sem título"}
Descrição: ${challengeDescription || "Sem descrição"}
Saída esperada: ${expectedOutput || "Não especificada"}

Código do aluno:
\`\`\`python
${userCode}
\`\`\`

Avalie o código e responda APENAS com JSON válido, sem markdown, sem texto extra, sem \`\`\`json:
{
  "nota": <número inteiro de 0 a 10>,
  "aprovado": <true se nota >= 7, false caso contrário>,
  "saida": "<o que o código produziria ao executar, ou 'sem saída' se não produzir nada>",
  "feedback": "<1 frase curta em português: elogio motivador se aprovado, ou incentivo positivo se reprovado>",
  "motivo": "<se reprovado: explique detalhadamente o que está errado no código e o que o aluno precisa corrigir. Se aprovado, retorne string vazia>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() ?? "";

    // Remove possíveis marcadores markdown que o modelo possa incluir
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      nota: Number(parsed.nota ?? 0),
      aprovado: Boolean(parsed.aprovado),
      saida: String(parsed.saida ?? ""),
      feedback: String(parsed.feedback ?? ""),
      motivo: String(parsed.motivo ?? ""),
    });
  } catch (error) {
    console.error("Erro ao avaliar código com Gemini:", error);
    return NextResponse.json(
      { error: "Erro ao processar avaliação", nota: 0, aprovado: false, saida: "", feedback: "Não foi possível avaliar o código. Tente novamente." },
      { status: 500 }
    );
  }
}
