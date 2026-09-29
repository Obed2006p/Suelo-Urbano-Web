import React from 'react';
import { SunIcon, HumidityIcon, SparklesIcon, QuestionMarkCircleIcon } from './icons/Icons';

export interface EnvironmentAnswers {
    ubicacion: string; // 'interior' | 'exterior_terraza' | 'jardin' | ''
    iluminacion: string; // 'sol_directo' | 'luz_indirecta' | 'sombra' | ''
    riegoFrecuencia: string; // 'cada_2_3_dias' | 'semanal' | 'cada_10_15_dias' | 'segun_sustrato' | ''
    drenajeAgujeros: string; // 'con_drenaje' | 'sin_drenaje' | ''
    materialMaceta: string; // 'plastico' | 'barro_ceramica' | 'otro' | ''
}

export const DEFAULT_ENVIRONMENT_ANSWERS: EnvironmentAnswers = {
    ubicacion: '',
    iluminacion: '',
    riegoFrecuencia: '',
    drenajeAgujeros: '',
    materialMaceta: ''
};

interface EnvironmentQuestionnaireProps {
    answers: EnvironmentAnswers;
    onChange: (updated: EnvironmentAnswers) => void;
    isAnalyzing?: boolean;
    compact?: boolean;
    onReapply?: () => void;
    hasDiagnosis?: boolean;
}

export const EnvironmentQuestionnaire: React.FC<EnvironmentQuestionnaireProps> = ({
    answers,
    onChange,
    isAnalyzing = false,
    compact = false,
    onReapply,
    hasDiagnosis = false
}) => {
    const handleSelect = (field: keyof EnvironmentAnswers, value: string) => {
        onChange({
            ...answers,
            [field]: answers[field] === value ? '' : value
        });
    };

    const countFilled = Object.values(answers).filter(v => v !== '').length;

    return (
        <div className={`rounded-2xl transition-all border ${
            isAnalyzing 
                ? 'bg-emerald-950/20 border-emerald-500/40 p-3.5 sm:p-5' 
                : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80 p-3.5 sm:p-5'
        }`}>
            {/* Header del Cuestionario */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white text-xs">
                        📋
                    </span>
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>Ficha de Entorno del Paciente</span>
                            {countFilled > 0 && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.2 rounded-full font-extrabold">
                                    {countFilled}/4 respondidas
                                </span>
                            )}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {isAnalyzing 
                                ? '✨ Puedes contestar o afinar mientras la IA analiza tu foto'
                                : 'Completa estas 4 preguntas rápidas (opcional) para calibración milimétrica'}
                        </p>
                    </div>
                </div>

                {hasDiagnosis && onReapply && (
                    <button
                        type="button"
                        onClick={onReapply}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                        title="Recalibrar diagnóstico con estas respuestas"
                    >
                        <span>🔄 Recalibrar</span>
                    </button>
                )}
            </div>

            {/* Pregunta 1: Ubicación */}
            <div className="space-y-1.5 mb-3 text-left">
                <label className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <span>1. Ubicación:</span>
                    <span className="text-stone-400 font-normal">¿Interior o exterior?</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'interior', label: '🏠 Interior (sala, recámara)', short: 'Interior' },
                        { id: 'exterior_terraza', label: '☀️ Exterior / Balcón', short: 'Balcón / Terraza' },
                        { id: 'jardin', label: '🌱 Jardín directo / Suelo', short: 'Jardín' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelect('ubicacion', opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                                answers.ubicacion === opt.id
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-emerald-500'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pregunta 2: Iluminación */}
            <div className="space-y-1.5 mb-3 text-left">
                <label className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <span>2. Iluminación recibida:</span>
                    <span className="text-stone-400 font-normal">¿Qué tipo de luz tiene?</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'sol_directo', label: '☀️ Sol directo (rayos directos)' },
                        { id: 'luz_indirecta', label: '🪟 Luz brillante indirecta (ventana)' },
                        { id: 'sombra', label: '☁️ Espacio sombrío / Luz baja' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelect('iluminacion', opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                                answers.iluminacion === opt.id
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-emerald-500'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pregunta 3: Riego */}
            <div className="space-y-1.5 mb-3 text-left">
                <label className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <span>3. Frecuencia de riego:</span>
                    <span className="text-stone-400 font-normal">¿Cada cuánto se aplica agua?</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'cada_2_3_dias', label: '💧💧 Muy frecuente (2-3 días)' },
                        { id: 'semanal', label: '💧 Moderado (1 vez por semana)' },
                        { id: 'cada_10_15_dias', label: '🌵 Espaciado (cada 10-15 días)' },
                        { id: 'segun_sustrato', label: '👆 Solo al secar la tierra' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelect('riegoFrecuencia', opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                                answers.riegoFrecuencia === opt.id
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-emerald-500'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pregunta 4: Maceta y Drenaje */}
            <div className="space-y-1.5 text-left">
                <label className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <span>4. Maceta y drenaje:</span>
                    <span className="text-stone-400 font-normal">¿Tiene agujeros en el fondo?</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'con_drenaje', label: '✅ Con orificios de drenaje' },
                        { id: 'sin_drenaje', label: '⚠️ Sin agujeros (maceta ciega)' },
                        { id: 'maceta_plastico', label: 'Plástico' },
                        { id: 'maceta_barro_ceramica', label: 'Barro o Cerámica' }
                    ].map((opt) => {
                        const isDrenaje = opt.id === 'con_drenaje' || opt.id === 'sin_drenaje';
                        const isSelected = isDrenaje 
                            ? answers.drenajeAgujeros === opt.id 
                            : answers.materialMaceta === opt.id;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    if (isDrenaje) {
                                        handleSelect('drenajeAgujeros', opt.id);
                                    } else {
                                        handleSelect('materialMaceta', opt.id);
                                    }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                                    isSelected
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-emerald-500'
                                }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Guía empática de fotos */}
            <div className="mt-3.5 pt-2.5 border-t border-stone-200/80 dark:border-stone-700/80 flex items-start gap-2 text-[10px] sm:text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                <span className="text-amber-500 shrink-0 text-sm">📸</span>
                <p>
                    <strong className="text-stone-800 dark:text-stone-200">Consejo fotográfico:</strong> Si tu foto inicial salió borrosa u oscura, sube preferentemente: 
                    1) Vista general de la planta, 2) Base del sustrato y corona, 3) Envés de las hojas.
                </p>
            </div>
        </div>
    );
};

export default EnvironmentQuestionnaire;
