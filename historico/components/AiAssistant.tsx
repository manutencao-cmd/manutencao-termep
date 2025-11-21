import React, { useState } from 'react';
import { Sparkles, Lightbulb, CheckCircle2, Microscope } from 'lucide-react';
import { Equipment } from '../types';
import { analyzeDefect, improveDiagnosis } from '../services/geminiService';
import Button from './Button';

interface AiAssistantProps {
  equipment: Equipment | null;
  currentDefect: string;
  currentDiagnosis?: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ equipment, currentDefect, currentDiagnosis }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [diagnosisFeedback, setDiagnosisFeedback] = useState<string | null>(null);
  
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingRefinement, setLoadingRefinement] = useState(false);

  const handleAnalyzeDefect = async () => {
    if (!equipment || !currentDefect) return;
    setLoadingAnalysis(true);
    setDiagnosisFeedback(null); // Clear other tab
    const result = await analyzeDefect(currentDefect, equipment);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  const handleImproveDiagnosis = async () => {
    if (!equipment || !currentDefect || !currentDiagnosis) return;
    setLoadingRefinement(true);
    setAnalysis(null); // Clear other tab
    const result = await improveDiagnosis(currentDiagnosis, currentDefect, equipment);
    setDiagnosisFeedback(result);
    setLoadingRefinement(false);
  };

  if (!equipment || (!currentDefect && !currentDiagnosis)) return null;

  return (
    <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-indigo-800 font-semibold">
          <Sparkles size={20} className="text-indigo-600" />
          <span>Assistente Técnico IA</span>
        </div>
        
        <div className="flex gap-2">
          {currentDefect && (
            <Button 
              variant="secondary" 
              onClick={handleAnalyzeDefect}
              isLoading={loadingAnalysis}
              disabled={loadingRefinement}
              className="text-xs py-1.5 px-3 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              type="button"
            >
              <Microscope size={14} />
              Analisar Causa
            </Button>
          )}
          
          {currentDiagnosis && (
            <Button 
              variant="secondary" 
              onClick={handleImproveDiagnosis}
              isLoading={loadingRefinement}
              disabled={loadingAnalysis}
              className="text-xs py-1.5 px-3 bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              type="button"
            >
              <CheckCircle2 size={14} />
              Melhorar Diagnóstico
            </Button>
          )}
        </div>
      </div>

      {(loadingAnalysis || loadingRefinement) && (
        <div className="text-sm text-indigo-600 animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          Processando informações técnicas do equipamento...
        </div>
      )}

      {analysis && (
        <div className="mt-3 animate-fade-in">
           <div className="flex gap-2 mb-2 text-amber-600 font-bold text-xs uppercase tracking-wide">
             <Lightbulb size={14} /> Sugestão de Causas
           </div>
           <div className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm whitespace-pre-wrap leading-relaxed text-sm">
             {analysis}
           </div>
        </div>
      )}

      {diagnosisFeedback && (
        <div className="mt-3 animate-fade-in">
           <div className="flex gap-2 mb-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
             <CheckCircle2 size={14} /> Refinamento do Diagnóstico
           </div>
           <div className="prose prose-sm max-w-none text-slate-700 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 shadow-sm whitespace-pre-wrap leading-relaxed text-sm">
             {diagnosisFeedback}
           </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;