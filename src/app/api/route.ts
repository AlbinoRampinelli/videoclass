import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Simula o tempo de processamento
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      point_of_interaction: {
        transaction_data: {
          qr_code: "00020101021126580014br.gov.bcb.pix0114SUA-CHAVE-AQUI",
          qr_code_base64:""
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar o pagamento" },
      { status: 500 }
    );
  }
}