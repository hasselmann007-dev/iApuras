
import { GoogleGenAI, Type } from '@google/genai';
import { IncomeVerification, Transaction, MonthlyData } from '../types';

const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY, vertexai: true });

export const analyzeIncome = async (
  text: string, 
  clientName: string, 
  fatherName?: string, 
  motherName?: string
): Promise<Partial<IncomeVerification>> => {
  
  const systemInstruction = `
    Você é um especialista em análise de crédito e apuração de renda bancária.
    Sua tarefa é analisar extratos bancários fornecidos em texto e extrair apenas as ENTRADAS válidas de acordo com regras rígidas.

    REGRAS DE EXCLUSÃO (Desconsiderar):
    1. Entradas do próprio favorecido (mesmo nome do cliente: ${clientName}).
    2. Remetentes com SOBRENOME EXATAMENTE IGUAL ao do cliente (${clientName}). Não desconsidere por semelhança ou abreviação.
    3. Pix de cartão de crédito, reembolso, estorno.
    4. Rendimentos da própria conta (aplicações, investimentos, resgates).
    5. Recebimento de boletos.
    6. Entradas de aplicativos de apostas (BET, games, jogos).
    7. Entradas nomeadas como "salário" ou "líquido de vencimento" (conforme solicitado pelo usuário).
    8. Valores abaixo de R$ 30,00.
    9. "Churn": Valores que entram e saem de forma corriqueira (mesmo valor entrando e saindo logo em seguida para a mesma pessoa).

    REGRAS DE PERÍODO:
    - Considere os últimos 6 meses.
    - Se hoje for dia 25 ou posterior, o mês atual é excluído e a janela retrocede.

    FORMATO DE SAÍDA:
    Retorne um JSON estruturado com os meses apurados, as transações válidas de cada mês, o total de cada mês e o cálculo final.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: `Analise o seguinte extrato:\n\n${text}\n\nCliente: ${clientName}\nPai: ${fatherName || 'N/A'}\nMãe: ${motherName || 'N/A'}` }]
    },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          monthlyData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                total: { type: Type.NUMBER },
                transactions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      description: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      bank: { type: Type.STRING },
                      sender: { type: Type.STRING },
                      isValid: { type: Type.BOOLEAN }
                    },
                    required: ['date', 'description', 'amount', 'bank', 'sender', 'isValid']
                  }
                }
              },
              required: ['month', 'total', 'transactions']
            }
          },
          totalIncome: { type: Type.NUMBER },
          averageIncome: { type: Type.NUMBER }
        },
        required: ['monthlyData', 'totalIncome', 'averageIncome']
      }
    }
  });

  try {
    const result = JSON.parse(response.text);
    return result;
  } catch (e) {
    console.error("Erro ao parsear resposta do Gemini", e);
    throw new Error("Falha na análise dos dados. Verifique o formato do texto enviado.");
  }
};
