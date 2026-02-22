
import { GoogleGenAI, Type } from '@google/genai';
import { IncomeVerification } from '../types';

// Inicialização conforme diretrizes: vertexai: true e apiKey do process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const analyzeIncome = async (
  text: string, 
  clientName: string, 
  fatherName?: string, 
  motherName?: string
): Promise<Partial<IncomeVerification>> => {
  
  const now = new Date();
  const dayOfMonth = now.getDate();
  const currentMonth = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  
  // Regra do dia 25: Se hoje >= 25, o mês atual é ignorado na apuração
  const dateContext = `Hoje é dia ${dayOfMonth} de ${currentMonth}. 
    REGRA DE PERÍODO: Se hoje for dia 25 ou posterior, desconsidere o mês atual (${now.getMonth() + 1}) e apure os 6 meses anteriores. 
    Caso contrário, inclua o mês atual na contagem dos 6 meses.`;

  const systemInstruction = `
    Você é um especialista em análise de crédito bancário. Sua tarefa é extrair ENTRADAS de renda válidas de extratos.
    
    ${dateContext}

    REGRAS CRÍTICAS DE FILTRO (DESCONSIDERAR):
    1. Entradas do próprio favorecido: ${clientName}.
    2. Sobrenomes IGUAIS: Desconsidere remetentes cujo sobrenome seja EXATAMENTE igual ao do cliente (${clientName}). 
       - Não desconsidere por semelhança, abreviação ou "parecido". Apenas se for idêntico.
    3. Parentesco: Desconsidere se o nome bater com o Pai (${fatherName || 'Não informado'}) ou Mãe (${motherName || 'Não informado'}).
    4. Tipos de Transação Proibidos: Pix de cartão de crédito, reembolso, estorno, rendimentos de aplicação/investimento, resgates, recebimento de boletos.
    5. Origens Proibidas: Aplicativos de apostas (BET, games, jogos, cassinos).
    6. Nomenclatura: Entradas com nome "salário" ou "líquido de vencimento" (pois podem vir de outra fonte já contabilizada).
    7. Valor Mínimo: Entradas abaixo de R$ 30,00.
    8. Churn/Corriqueiro: Valores que entram e saem em seguida para a mesma pessoa/origem.

    FORMATO DE SAÍDA:
    Retorne um JSON com a lista de meses (máximo 6), as transações válidas de cada mês, o total mensal e a média final.
    Separe por banco se houver mais de um no texto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: `Analise este extrato e aplique os filtros:\n\n${text}` }]
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
                  month: { type: Type.STRING, description: "Mês e Ano (ex: Julho/2024)" },
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

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    // Tratamento específico para erro de cotação ou modelo não encontrado
    if (error.message?.includes('404')) {
      throw new Error("Erro de conexão com o serviço de IA (404). Verifique se o modelo está disponível.");
    }
    throw new Error("Falha ao processar o extrato. Certifique-se de que o texto é legível.");
  }
};
