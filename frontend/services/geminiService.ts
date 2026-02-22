
import { GoogleGenAI, Type } from '@google/genai';
import { IncomeVerification } from '../types';

// Inicialização seguindo estritamente as diretrizes
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const analyzeIncome = async (
  text: string, 
  clientName: string, 
  fatherName?: string, 
  motherName?: string
): Promise<Partial<IncomeVerification>> => {
  
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Regra do dia 25: "quando chegar no dia 25 de cada mes vigente... retire o ultimo mês e adicione o outro na apuração"
  // Exemplo: 25 de Janeiro -> Apura Julho a Dezembro (Janeiro é retirado).
  const dateContext = `
    DATA ATUAL DO SISTEMA: ${day}/${month}/${year}.
    REGRA DE PERÍODO (CRÍTICA): 
    - Se hoje for dia 25 ou posterior, o mês atual (${month}/${year}) deve ser TOTALMENTE EXCLUÍDO. A apuração deve focar nos 6 meses anteriores ao mês atual.
    - Se hoje for antes do dia 25, o mês atual pode ser considerado se houver dados, mas a janela de 6 meses retroage a partir dele.
    - No exemplo do usuário: Em 25 de Janeiro de 2026, o período deve ser de Julho/2025 a Dezembro/2025.
  `;

  const systemInstruction = `
    Você é um Auditor Bancário Sênior especializado em análise de propostas de crédito.
    Sua tarefa é analisar o texto de extratos bancários e extrair APENAS as ENTRADAS de renda válidas.

    ${dateContext}

    REGRAS DE EXCLUSÃO (NÃO CONSIDERE):
    1. Entradas do próprio favorecido: ${clientName}.
    2. Sobrenomes IGUAIS: Desconsidere remetentes cujo sobrenome seja EXATAMENTE igual ao do cliente (${clientName}). 
       - ATENÇÃO: Não desconsidere por semelhança, abreviação ou "parecido". Apenas se o sobrenome for idêntico.
    3. Parentesco: Desconsidere se o nome bater com o Pai (${fatherName || 'Não informado'}) ou Mãe (${motherName || 'Não informado'}).
    4. Transações Proibidas: Pix de cartão de crédito, reembolso, estorno, rendimentos de aplicação/investimento, resgates, recebimento de boletos.
    5. Origens de Apostas/Games: Nomes como BET, Blaze, games, jogos, cassinos.
    6. Nomenclatura de Salário: Entradas com nome "salário" ou "líquido de vencimento" (pois podem ser de outra fonte de renda já declarada).
    7. Valor Mínimo: Entradas abaixo de R$ 30,00.
    8. Churn/Corriqueiro: Valores que entram e saem em seguida para a mesma pessoa/origem (mesmo valor).

    FORMATO DE SAÍDA:
    Retorne um JSON estruturado com:
    - monthlyData: Array de objetos por mês (mês/ano, total do mês, lista de transações válidas).
    - totalIncome: Soma de todos os meses.
    - averageIncome: Média (Total / número de meses apurados).
    - Se houver mais de um banco, crie tabelas/seções separadas internamente no JSON se necessário, mas consolide por mês.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: `Analise este extrato bancário e aplique os filtros de renda:\n\n${text}` }]
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
                  month: { type: Type.STRING, description: "Mês e Ano (ex: Dezembro/2025)" },
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
    // Tratamento para o erro 404 mencionado pelo usuário
    if (error.message?.includes('404') || error.status === 404) {
      throw new Error("Erro 404: O modelo 'gemini-2.5-flash' não foi encontrado ou o endpoint está indisponível. Verifique se a API Key tem permissão para este modelo.");
    }
    throw new Error("Falha ao processar o extrato. Certifique-se de que o arquivo contém dados legíveis.");
  }
};
