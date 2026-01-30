import { NextResponse } from "next/server";
import db from "../../../../prisma/db"; // Ajuste o caminho se necessário

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();

    // 1. Buscar o valor do curso (Exemplo via Prisma)
    const curso = await db.course.findUnique({
      where: { id: courseId }
    });

    if (!curso) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    const valor = curso.price; // Supondo que o campo seja 'price'

    // 2. Simular a resposta do Mercado Pago com o valor real
    return NextResponse.json({
      id: Math.floor(Math.random() * 1000000000), // Gera um ID aleatório para o teste
      status: "pending",
      transaction_amount: valor,
      point_of_interaction: {
        transaction_data: {
          qr_code: `PIX-ESTATICO-CURSO-${courseId}-VALOR-${valor}`,
          qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAOAAAADhCAYAAADX9v6pAAAACXBIWXMAAAsTAAALEwEAmpwYAAABlWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4LBoxmAAAALElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeBsYAAAB09j/NAAAAABJRU5ErkJggg==" 
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}