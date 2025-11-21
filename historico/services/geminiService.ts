import { GoogleGenAI } from "@google/genai";
import { MaintenanceRecord, Equipment } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  return new GoogleGenAI({ apiKey });
};

export const analyzeDefect = async (
  defectDescription: string,
  equipment: Equipment
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Você é um especialista em manutenção industrial.
      Equipamento: ${equipment.descricao} (Modelo: ${equipment.modelo}).
      Problema relatado: "${defectDescription}".
      
      Forneça uma breve análise técnica de possíveis causas raízes e sugira 3 passos para solução.
      Mantenha a resposta concisa e formatada.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma análise.";
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Erro ao conectar com o assistente de IA.";
  }
};

export const improveDiagnosis = async (
  diagnosis: string,
  defectDescription: string,
  equipment: Equipment
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Atue como um Supervisor Sênior de Manutenção Técnica.
      
      Contexto:
      - Equipamento: ${equipment.descricao} (${equipment.modelo} - ${equipment.marca})
      - Problema Original: "${defectDescription}"
      - Diagnóstico Inicial do Mecânico: "${diagnosis}"
      
      Sua tarefa é melhorar e validar esse diagnóstico.
      1. Reescreva o diagnóstico de forma mais técnica e precisa (terminologia padrão da indústria).
      2. Identifique se o mecânico pode ter esquecido de verificar algo relacionado a esse sintoma.
      3. Se o diagnóstico parecer incompleto ou vago, sugira o que mais deve ser investigado.
      
      Responda de forma direta e instrutiva, formatada em Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível refinar o diagnóstico.";
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Erro ao conectar com o assistente de IA.";
  }
};

export const generateHistorySummary = async (
  records: MaintenanceRecord[],
  equipment: Equipment
): Promise<string> => {
  try {
    if (records.length === 0) return "Sem histórico para análise.";

    const ai = getClient();
    // Updated mapping to new field names
    const historyText = records.map(r => 
      `- Data: ${r.dataInicial}, Falha: ${r.defeitoFalha}, Causa: ${r.causaDiagnostico}, Solução: ${r.solucaoProcedimentos}, Valor: R$${r.valor}`
    ).join('\n');

    const prompt = `
      Analise o histórico de manutenção abaixo para o equipamento: ${equipment.descricao}.
      Histórico:
      ${historyText}

      Identifique padrões recorrentes, eficácia das soluções e sugira um plano de manutenção preventiva.
      Responda em português, formato markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Análise indisponível.";
  } catch (error) {
    console.error(error);
    return "Erro na análise de histórico.";
  }
};