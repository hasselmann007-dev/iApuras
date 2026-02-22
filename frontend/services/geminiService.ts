
import { GoogleGenAI, Type } from '@google/genai';
import { IncomeVerification } from '../types';

// Inicialização obrigatória usando process.env.API_KEY e vertexai: true
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const analyzeIncome = async (
  text: string, 
  clientName: string, 
  fatherName?: string, 
  motherName?: string
): Promise<Partial<IncomeVerification>> => {
  
  const now = new Date();
  const dayOfMonth = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Lógica do dia 25: Se hoje >= 25, o mês atual é ignorado e retrocedemos 6 meses a partir do anterior.
  const dateContext = `Data atual: ${now.toLocaleDateString('pt-BR')}. 
    REGRA DE PERÍODO: Como hoje é dia ${dayOfMonth}, se for dia 25 ou posterior, o mês ${currentMonth}/${currentYear} deve ser EXCLUÍDO da apuração, considerando os 6 meses imediatamente anteriores. Caso contrário, inclua o mês atual.`;

  const systemInstruction = `
    Você é um especialista em auditoria bancária e análise de renda. Sua missão é extrair ENTRADAS de renda válidas de extratos bancários em texto.
    
    ${dateContext}

    REGRAS DE FILTRO (DESCONSIDERAR):
    1. Entradas do próprio favorecido: ${clientName}.
    2. Sobrenomes IGUAIS: Desconsidere remetentes cujo sobrenome seja EXATAMENTE igual ao do cliente (${clientName}). Não desconsidere por semelhança ou abreviação.
    3. Parentesco: Desconsidere se o nome bater com o Pai (${fatherName || 'N/A'}) ou Mãe (${motherName || 'N/A'}).
    4. Transações Proibidas: Pix de cartão de crédito, reembolso, estorno, rendimentos de aplicação/investimento, resgates, recebimento de boletos.
    5. Origens de Apostas: Nomes como BET, games, jogos, cassinos.
    6. Nomenclatura Específica: Entradas com nome "salário" ou "líquido de vencimento" (podem ser de outra fonte).
    7. Valor Mínimo: Entradas abaixo de R$ 30,00.
    8. Churn: Valores que entram e saem em seguida para a mesma pessoa.

    FORMATO DE SAÍDA:
    Retorne um JSON com a lista de meses apurados, as transações válidas de cada mês, o total mensal e a média final.
    Se houver mais de um banco no texto, organize as transações indicando o banco de origem.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: `Analise o extrato abaixo e extraia as rendas válidas:\n\n${text}` }]
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

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    if (error.message?.includes('404')) {
      throw new Error("Erro 404: O modelo ou o endpoint da API não foi encontrado. Verifique a configuração do projeto.");
    }
    throw new Error("Falha ao processar o extrato. Verifique se o texto enviado contém dados bancários legíveis.");
  }
};
