import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
    getGardenPlants, 
    updateAfterImage, 
    deleteFromGarden, 
    updatePlantStatus,
    togglePlantStep,
    addPlantNote,
    deletePlantNote,
    recordWatering,
    GardenPlant, 
    resizeImageToBase64 
} from '../lib/gardenStorage';
import { 
    HeartIcon, 
    CameraIcon, 
    CalendarIcon, 
    HeartbeatIcon, 
    SparklesIcon,
    LeafIcon, 
    CheckCircleIcon, 
    QuestionMarkCircleIcon, 
    ClipboardListIcon, 
    HumidityIcon, 
    DownloadIcon,
    SearchIcon,
    WaterDropIcon,
    XIcon,
    SproutIcon,
    WormIcon,
    RobotIcon,
    ChatBubbleIcon
} from './icons/Icons';

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

// --- Modal de Expediente Clínico Completo ---
interface PlantModalProps {
    plant: GardenPlant;
    onClose: () => void;
    onUpdate: () => void;
}

const PlantRecordModal: React.FC<PlantModalProps> = ({ plant, onClose, onUpdate }) => {
    const [newNote, setNewNote] = useState('');
    const [activeTab, setActiveTab] = useState<'expediente' | 'tratamiento' | 'bitacora'>('expediente');

    const handleToggleStep = (index: number) => {
        togglePlantStep(plant.id, index);
        onUpdate();
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        addPlantNote(plant.id, newNote);
        setNewNote('');
        onUpdate();
    };

    const handleDeleteNote = (noteId: string) => {
        deletePlantNote(plant.id, noteId);
        onUpdate();
    };

    const handleStatusChange = (newStatus: 'critico' | 'en_tratamiento' | 'recuperada') => {
        updatePlantStatus(plant.id, newStatus);
        onUpdate();
    };

    const generatePlantPDF = () => {
        const doc = new jsPDF();
        let y = 20;
        const margin = 20;
        const pageWidth = doc.internal.pageSize.width;
        const contentWidth = pageWidth - (margin * 2);

        const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, y);
            y += (lines.length * fontSize * 0.4) + 2;
        };

        // Header
        doc.setFillColor(22, 101, 52);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Expediente de Salud Botánica", margin, 18);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Suelo Urbano - Mi Jardín Urbano", margin, 25);

        y = 42;
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(plant.name, margin, y);
        y += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Estado Clínico: ${plant.health} | Ingreso: ${new Date(plant.date).toLocaleDateString()}`, margin, y);
        y += 10;

        addWrappedText("Diagnóstico Inicial:", 13, true);
        addWrappedText(plant.diagnosis, 10);
        y += 4;

        if (plant.problemasDetectados && plant.problemasDetectados.length > 0) {
            addWrappedText("Problemas Detectados:", 11, true);
            plant.problemasDetectados.forEach(p => addWrappedText(`• ${p}`, 10));
            y += 3;
        }

        if (plant.causasPosibles && plant.causasPosibles.length > 0) {
            addWrappedText("Posibles Causas:", 11, true);
            plant.causasPosibles.forEach(c => addWrappedText(`• ${c}`, 10));
            y += 4;
        }

        if (y > 230) { doc.addPage(); y = 20; }
        addWrappedText("Tratamiento y Plan de Acción:", 13, true);
        plant.actionPlan.forEach((step, i) => {
            if (y > 260) { doc.addPage(); y = 20; }
            const isDone = (plant.completedSteps || []).includes(i);
            addWrappedText(`${i + 1}. [${isDone ? 'REALIZADO' : 'PENDIENTE'}] ${step.paso}`, 10, true);
            addWrappedText(step.detalle, 10);
            y += 2;
        });
        y += 4;

        if (plant.seguimiento) {
            if (y > 230) { doc.addPage(); y = 20; }
            addWrappedText("Seguimiento y Pronóstico:", 12, true);
            addWrappedText(plant.seguimiento, 10);
            y += 4;
        }

        if (plant.resultadosEsperados && plant.resultadosEsperados.length > 0) {
            addWrappedText("Resultados Esperados:", 11, true);
            plant.resultadosEsperados.forEach(r => addWrappedText(`✓ ${r}`, 10));
            y += 4;
        }

        if (plant.notes && plant.notes.length > 0) {
            if (y > 230) { doc.addPage(); y = 20; }
            addWrappedText("Bitácora de Notas del Jardinero:", 12, true);
            plant.notes.forEach(n => {
                addWrappedText(`• [${new Date(n.date).toLocaleDateString()}]: ${n.text}`, 10);
            });
        }

        doc.save(`Expediente_${plant.name.replace(/\s+/g, '_')}.pdf`);
    };

    const completedCount = (plant.completedSteps || []).length;
    const totalSteps = plant.actionPlan.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-stone-200 dark:border-stone-700 flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 p-5 sm:p-6 text-white flex justify-between items-start flex-shrink-0">
                    <div className="flex items-start gap-4">
                        <img 
                            src={plant.beforeImage} 
                            alt={plant.name} 
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md flex-shrink-0"
                        />
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                                    Ficha Botánica
                                </span>
                                <span className="text-xs text-emerald-200 font-medium">
                                    Ingresada: {new Date(plant.date).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                {plant.name}
                            </h2>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                                Diagnóstico inicial: <strong className="text-white">{plant.health}</strong>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                        aria-label="Cerrar expediente"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress & Quick Status Bar */}
                <div className="bg-stone-100 dark:bg-stone-800/80 px-5 sm:px-6 py-3 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700 dark:text-stone-300">Estado del tratamiento:</span>
                        <select 
                            value={plant.status || 'en_tratamiento'}
                            onChange={(e) => handleStatusChange(e.target.value as any)}
                            className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="critico">🚨 Crítico</option>
                            <option value="en_tratamiento">🌿 En Tratamiento Activo</option>
                            <option value="recuperada">✨ ¡Recuperada 100%!</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-32 bg-stone-200 dark:bg-stone-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                            {completedCount}/{totalSteps} pasos ({progressPercent}%)
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-5 gap-2 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('expediente')}
                        className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'expediente' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'}`}
                    >
                        📋 Diagnóstico y Seguimiento
                    </button>
                    <button
                        onClick={() => setActiveTab('tratamiento')}
                        className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'tratamiento' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'}`}
                    >
                        💊 Plan de Acción ({completedCount}/{totalSteps})
                    </button>
                    <button
                        onClick={() => setActiveTab('bitacora')}
                        className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'bitacora' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'}`}
                    >
                        📝 Bitácora de Notas ({(plant.notes || []).length})
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-stone-800 dark:text-stone-200">
                    
                    {/* TAB 1: DIAGNOSTICO COMPLETO Y SEGUIMIENTO */}
                    {activeTab === 'expediente' && (
                        <div className="space-y-6">
                            
                            {/* Diagnóstico General */}
                            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                                <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                    Diagnóstico Clínico Inicial
                                </h3>
                                <p className="text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200 font-medium">
                                    {plant.diagnosis}
                                </p>
                            </div>

                            {/* Problemas Detectados y Causas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-red-50/90 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-900/40">
                                    <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-2.5 flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4 text-red-500" />
                                        Problemas Observados
                                    </h4>
                                    {plant.problemasDetectados && plant.problemasDetectados.length > 0 ? (
                                        <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                                            {plant.problemasDetectados.map((prob, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-red-500 font-bold">•</span>
                                                    <span>{prob}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-stone-500 italic">No se especificaron detalles adicionales.</p>
                                    )}
                                </div>

                                <div className="bg-amber-50/90 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-2.5 flex items-center gap-2">
                                        <QuestionMarkCircleIcon className="w-4 h-4 text-amber-500" />
                                        Posibles Causas
                                    </h4>
                                    {plant.causasPosibles && plant.causasPosibles.length > 0 ? (
                                        <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                                            {plant.causasPosibles.map((causa, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-amber-500 font-bold">•</span>
                                                    <span>{causa}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-stone-500 italic">Desbalance hídrico o nutricional.</p>
                                    )}
                                </div>
                            </div>

                            {/* SECCIÓN DESTACADA: SEGUIMIENTO Y PRONÓSTICO COMPLETO */}
                            <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 rounded-2xl shadow-lg border border-green-500/50">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <CalendarIcon className="w-6 h-6 text-green-200" />
                                    <div>
                                        <h3 className="font-extrabold text-base sm:text-lg">
                                            Pronóstico & Seguimiento Completo
                                        </h3>
                                        <p className="text-xs text-green-100">
                                            Evolución esperada según el protocolo biológico de Suelo Urbano
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm mb-4 border border-white/10">
                                    <p className="text-sm sm:text-base leading-relaxed text-white font-medium">
                                        {plant.seguimiento || "Aplica el tratamiento indicado y monitorea semanalmente la turgencia de las hojas y la aparición de nuevos brotes. Evita cambios bruscos de luz o riego."}
                                    </p>
                                </div>

                                {plant.resultadosEsperados && plant.resultadosEsperados.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-green-200 mb-2">
                                            Resultados Esperados:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {plant.resultadosEsperados.map((res, idx) => (
                                                <span key={idx} className="bg-green-900/60 border border-green-400/40 text-xs px-3 py-1.5 rounded-full font-bold text-green-100 flex items-center gap-1.5 shadow-sm">
                                                    <span>✓</span> {res}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Luz, Riego & Sustrato */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                                    <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm mb-2 flex items-center gap-2">
                                        <HumidityIcon className="w-4 h-4 text-cyan-500" />
                                        Luz y Riego Recomendado
                                    </h4>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                                        {plant.luzYRiego || "Luz indirecta brillante y riego moderado cuando la capa superior del sustrato esté seca al tacto."}
                                    </p>
                                </div>

                                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                                    <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm mb-2 flex items-center gap-2">
                                        <SproutIcon className="w-4 h-4 text-emerald-500" />
                                        Sustrato y Nutrición
                                    </h4>
                                    <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                                        {plant.sustratoRecomendado || "Suelo Urbano Tu Hogar (Nutrición Viva)"}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        Sustrato con microvida activa, porosidad alta y libre de químicos sintéticos.
                                    </p>
                                </div>
                            </div>

                            {/* Regla de Riego, Agua y Sustrato si está guardada */}
                            {plant.riegoYSustrato && (
                                <div className="bg-gradient-to-br from-cyan-950/20 via-stone-900/10 to-emerald-950/20 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <HumidityIcon className="w-5 h-5 text-cyan-500" />
                                            <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                                                Regla de Riego, Agua y Sustrato
                                            </h4>
                                        </div>
                                        <div>
                                            {plant.riegoYSustrato.clasificacionEspecie === 'SENSIBLE' ? (
                                                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                                                    ⚠️ Sensible al Agua de la Llave
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                                                    ✅ Tolerante al Agua de la Llave
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">
                                        {plant.riegoYSustrato.descripcionClasificacion}
                                    </p>
                                    <div className="space-y-2 pt-1">
                                        {plant.riegoYSustrato.puntos.map((punto, idx) => (
                                            <div 
                                                key={idx}
                                                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                                                    punto.tipo === 'agua' 
                                                        ? 'bg-cyan-50/70 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/40' 
                                                        : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0 mt-0.5 ${
                                                    punto.tipo === 'agua' ? 'bg-cyan-600' : 'bg-emerald-600'
                                                }`}>
                                                    {punto.numero}
                                                </span>
                                                <div>
                                                    <strong className="block text-stone-900 dark:text-white font-bold">{punto.titulo}</strong>
                                                    <span className="text-stone-600 dark:text-stone-300">{punto.detalle}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* TAB 2: TRATAMIENTO PASO A PASO CON CHECKBOXES */}
                    {activeTab === 'tratamiento' && (
                        <div className="space-y-4">
                            <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-2xl text-xs sm:text-sm text-stone-600 dark:text-stone-300 flex items-center justify-between">
                                <span>Marca los pasos que vayas aplicando para llevar el control exacto de tu tratamiento:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {completedCount} de {totalSteps} completados
                                </span>
                            </div>

                            <div className="space-y-3">
                                {plant.actionPlan.map((step, idx) => {
                                    const isDone = (plant.completedSteps || []).includes(idx);
                                    return (
                                        <div 
                                            key={idx}
                                            onClick={() => handleToggleStep(idx)}
                                            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${isDone ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-emerald-400'}`}
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={isDone}
                                                onChange={() => {}} // Handled by parent div
                                                className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'}`}>
                                                        Paso {idx + 1}
                                                    </span>
                                                    <strong className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-stone-500 dark:text-stone-400' : 'text-stone-900 dark:text-white'}`}>
                                                        {step.paso}
                                                    </strong>
                                                </div>
                                                <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDone ? 'text-stone-400 dark:text-stone-500' : 'text-stone-600 dark:text-stone-300'}`}>
                                                    {step.detalle}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {plant.planRecuperacion && plant.planRecuperacion.length > 0 && (
                                <div className="mt-6 bg-blue-50/90 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40">
                                    <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                                        <LeafIcon className="w-4 h-4 text-blue-500" />
                                        Mantenimiento a Mediano Plazo
                                    </h4>
                                    <ul className="space-y-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                                        {plant.planRecuperacion.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-blue-500">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: BITÁCORA DE NOTAS DEL JARDINERO */}
                    {activeTab === 'bitacora' && (
                        <div className="space-y-5">
                            <form onSubmit={handleAddNote} className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                    Añadir entrada al diario de cuidados
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Ej: 'Día 4: Brote nuevo en la punta', 'Aplicado riego ligero'..."
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button 
                                        type="submit"
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        <span>Guardar</span>
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {plant.notes && plant.notes.length > 0 ? (
                                    plant.notes.map((note) => (
                                        <div 
                                            key={note.id}
                                            className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex justify-between items-start gap-3"
                                        >
                                            <div>
                                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                                    {new Date(note.date).toLocaleDateString()} a las {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-medium">
                                                    {note.text}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                                                title="Borrar nota"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-stone-400 text-xs sm:text-sm">
                                        No hay notas registradas todavía. ¡Escribe tus observaciones para recordar la evolución de tu planta!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                    <button 
                        onClick={generatePlantPDF}
                        className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Descargar PDF Completo</span>
                    </button>

                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer ml-auto"
                    >
                        Cerrar Expediente
                    </button>
                </div>

            </div>
        </div>
    );
};

// --- Tarjeta de Planta Individual ---
const PlantCard: React.FC<{ plant: GardenPlant, onUpdate: () => void, onOpenRecord: (plant: GardenPlant) => void }> = ({ plant, onUpdate, onOpenRecord }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'both' | 'before' | 'after'>('both');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const base64 = await resizeImageToBase64(e.target.files[0]);
                updateAfterImage(plant.id, base64);
                onUpdate();
            } catch (err) {
                alert("Hubo un error procesando la imagen");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleDelete = () => {
        if (window.confirm(`¿Seguro que quieres eliminar "${plant.name}" de tu jardín?`)) {
            deleteFromGarden(plant.id);
            onUpdate();
        }
    };

    const handleWaterClick = () => {
        recordWatering(plant.id);
        onUpdate();
    };

    const isAfter = !!plant.afterImage;
    const completedCount = (plant.completedSteps || []).length;
    const totalSteps = plant.actionPlan.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    
    // Status visual
    const status = plant.status || (isAfter ? 'recuperada' : 'en_tratamiento');
    const statusConfig = {
        critico: { label: '🚨 Crítico', bg: 'bg-red-500/90 text-white' },
        en_tratamiento: { label: '🌿 En Tratamiento', bg: 'bg-amber-500/90 text-white' },
        recuperada: { label: '✨ ¡Recuperada!', bg: 'bg-emerald-500 text-white' }
    }[status] || { label: '🌿 En Tratamiento', bg: 'bg-amber-500/90 text-white' };

    // Days since diagnosis
    const daysSince = Math.max(0, Math.floor((Date.now() - plant.date) / (1000 * 60 * 60 * 24)));

    return (
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-lg hover:shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
            
            {/* Image Stage with Before/After toggles */}
            <div className="relative h-56 bg-stone-950 overflow-hidden">
                {isAfter ? (
                    <div className="w-full h-full relative">
                        {viewMode === 'both' && (
                            <div className="grid grid-cols-2 h-full w-full relative">
                                <div className="relative border-r border-white/30 overflow-hidden">
                                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm">
                                        Antes
                                    </span>
                                    <img src={plant.beforeImage} alt="Antes" className="w-full h-full object-cover" />
                                </div>
                                <div className="relative overflow-hidden">
                                    <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm">
                                        Después
                                    </span>
                                    <img src={plant.afterImage} alt="Después" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                        {viewMode === 'before' && (
                            <div className="w-full h-full relative">
                                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm">
                                    Foto Inicial (Día 1)
                                </span>
                                <img src={plant.beforeImage} alt="Antes" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {viewMode === 'after' && (
                            <div className="w-full h-full relative">
                                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm">
                                    Resultado Actual
                                </span>
                                <img src={plant.afterImage} alt="Después" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* View Switcher Overlay */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-full p-0.5 flex gap-1 z-20 border border-white/20">
                            <button 
                                onClick={() => setViewMode('both')} 
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${viewMode === 'both' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'}`}
                            >
                                50/50
                            </button>
                            <button 
                                onClick={() => setViewMode('before')} 
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${viewMode === 'before' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'}`}
                            >
                                Antes
                            </button>
                            <button 
                                onClick={() => setViewMode('after')} 
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${viewMode === 'after' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'}`}
                            >
                                Después
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full w-full">
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm">
                            Día 1
                        </span>
                        <img 
                            src={plant.beforeImage} 
                            alt={plant.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md shadow-md ${statusConfig.bg}`}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white leading-snug">
                            {plant.name}
                        </h3>
                        <button 
                            onClick={handleDelete} 
                            className="text-stone-400 hover:text-red-500 transition-colors p-1" 
                            title="Eliminar del jardín"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-medium mb-3">
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {daysSince === 0 ? 'Hoy' : `Hace ${daysSince} días`}
                        </span>
                        {plant.lastWateredDate && (
                            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                                <WaterDropIcon className="h-3.5 w-3.5" />
                                Regada {new Date(plant.lastWateredDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {/* Resumen Clínico */}
                    <div className="bg-stone-50 dark:bg-stone-700/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-600/50 mb-3.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <HeartbeatIcon className="h-3.5 w-3.5" />
                                {plant.health}
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">
                                {(plant.notes || []).length} notas
                            </span>
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 text-xs line-clamp-2 leading-relaxed font-medium">
                            {plant.diagnosis}
                        </p>
                    </div>

                    {/* Progress of Treatment */}
                    <div className="mb-4">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                            <span className="text-stone-600 dark:text-stone-400">Progreso del plan:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{completedCount}/{totalSteps} pasos ({progressPercent}%)</span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-700">
                    
                    {/* Primary Button: Open Full Record */}
                    <button
                        onClick={() => onOpenRecord(plant)}
                        className="w-full bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex justify-center items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                    >
                        <ClipboardListIcon className="h-4 w-4" />
                        <span>Ver Expediente Completo</span>
                    </button>

                    <div className="flex gap-2">
                        {/* Record watering button */}
                        <button
                            onClick={handleWaterClick}
                            className="flex-1 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 py-2 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Registrar riego realizado hoy"
                        >
                            <WaterDropIcon className="h-3.5 w-3.5 text-cyan-500" />
                            <span>Regar Hoy</span>
                        </button>

                        {/* After Photo Button */}
                        {!isAfter ? (
                            <>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 py-2 px-3 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <CameraIcon className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>{isUploading ? '...' : '+ Foto Después'}</span>
                                </button>
                            </>
                        ) : (
                            <span className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 text-center">
                                🌱 Foto Lista
                            </span>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

// --- Página Principal de Mi Jardín Urbano ---
interface MyGardenPageProps {
    header?: React.ReactNode;
}

const MyGardenPage: React.FC<MyGardenPageProps> = ({ header }) => {
    const [plants, setPlants] = useState<GardenPlant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'critico' | 'en_tratamiento' | 'recuperada'>('all');
    const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);

    const loadPlants = () => {
        const loaded = getGardenPlants();
        setPlants(loaded);
        if (selectedPlant) {
            const updatedSelected = loaded.find(p => p.id === selectedPlant.id);
            if (updatedSelected) setSelectedPlant(updatedSelected);
        }
    };

    useEffect(() => {
        loadPlants();
    }, []);

    // Filter logic
    const filteredPlants = plants.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              plant.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
        
        const currentStatus = plant.status || (plant.afterImage ? 'recuperada' : 'en_tratamiento');
        const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Quick Metrics
    const totalCount = plants.length;
    const criticalCount = plants.filter(p => (p.status || '').includes('critico') || p.health.toLowerCase().includes('crítico')).length;
    const inTreatmentCount = plants.filter(p => (p.status === 'en_tratamiento' || (!p.status && !p.afterImage))).length;
    const recoveredCount = plants.filter(p => p.status === 'recuperada' || !!p.afterImage).length;
    const recoveryRate = totalCount > 0 ? Math.round((recoveredCount / totalCount) * 100) : 0;

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900 font-sans">
            {header}
            
            <main className="flex-1 py-10 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold mb-3 border border-emerald-300 dark:border-emerald-700/50 shadow-sm animate-fade-in-down">
                            <SparklesIcon className="w-4 h-4 text-emerald-600" />
                            <span>Diario de Evolución & Ficha Clínica Botánica</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white mb-3 tracking-tight">
                            Mi Jardín Urbano
                        </h1>
                        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base md:text-lg font-medium">
                            Monitorea el progreso de tus plantas, consulta el expediente médico completo con todos los pasos de recuperación y registra su evolución. 🌿
                        </p>
                    </div>

                    {/* Stats Dashboard */}
                    {totalCount > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up">
                            <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm text-center">
                                <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white block">
                                    {totalCount}
                                </span>
                                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                    Total en Jardín
                                </span>
                            </div>

                            <div className="bg-amber-50/80 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm text-center">
                                <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 block">
                                    {inTreatmentCount}
                                </span>
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                                    En Tratamiento
                                </span>
                            </div>

                            <div className="bg-red-50/80 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm text-center">
                                <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 block">
                                    {criticalCount}
                                </span>
                                <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                                    Casos Críticos
                                </span>
                            </div>

                            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm text-center">
                                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300 block">
                                    {recoveredCount} <span className="text-xs text-emerald-500 font-normal">({recoveryRate}%)</span>
                                </span>
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                                    ¡Recuperadas! 🌱
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Quick Consultation Banner for Jardinero IA */}
                    <div className="bg-gradient-to-r from-emerald-900/90 via-stone-900 to-green-950/90 p-4 sm:p-5 rounded-3xl border border-emerald-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in-up">
                        <div className="flex items-center gap-3.5 text-left">
                            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex-shrink-0">
                                <RobotIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-sm sm:text-base text-emerald-300">
                                    ¿Dudas con el tratamiento o riego de tu jardín?
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-300 font-medium">
                                    Consulta a nuestro Jardinero IA: resuelve dudas de dosis, sustrato, plagas y fotos en tiempo real.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-suelo-chatbot'))}
                            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
                        >
                            <ChatBubbleIcon className="w-4 h-4" />
                            <span>Preguntar al Jardinero IA</span>
                        </button>
                    </div>

                    {/* Search & Filter Controls */}
                    {totalCount > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-stone-800 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
                            {/* Search */}
                            <div className="relative w-full sm:w-72">
                                <SearchIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar planta o síntoma..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Status Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filterStatus === 'all' ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300 hover:bg-stone-200'}`}
                                >
                                    Todas ({totalCount})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('en_tratamiento')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filterStatus === 'en_tratamiento' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300 hover:bg-stone-200'}`}
                                >
                                    🌿 En Tratamiento
                                </button>
                                <button
                                    onClick={() => setFilterStatus('critico')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filterStatus === 'critico' ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300 hover:bg-stone-200'}`}
                                >
                                    🚨 Críticas
                                </button>
                                <button
                                    onClick={() => setFilterStatus('recuperada')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filterStatus === 'recuperada' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300 hover:bg-stone-200'}`}
                                >
                                    ✨ Recuperadas ({recoveredCount})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Plants Grid or Empty State */}
                    {plants.length === 0 ? (
                        <div className="text-center py-16 sm:py-20 bg-white dark:bg-stone-800 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 shadow-sm animate-fade-in-up">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-4xl shadow-inner">
                                🪴
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 mb-2">
                                Tu jardín botánico está listo para comenzar
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed font-medium">
                                Realiza un análisis con el Doctor de Plantas y presiona <strong>"Guardar en Mi Jardín"</strong> para archivar su expediente clínico y dar seguimiento a su tratamiento.
                            </p>
                            <a 
                                href="#/doctor-plantas" 
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                            >
                                <HeartbeatIcon className="w-5 h-5" />
                                <span>Diagnosticar mi primera planta</span>
                            </a>
                        </div>
                    ) : filteredPlants.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700">
                            <p className="text-stone-500 text-sm">No se encontraron plantas con los filtros seleccionados.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
                            >
                                Restablecer filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                            {filteredPlants.map(plant => (
                                <PlantCard 
                                    key={plant.id} 
                                    plant={plant} 
                                    onUpdate={loadPlants} 
                                    onOpenRecord={(p) => setSelectedPlant(p)}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </main>

            {/* Modal de Expediente Completo */}
            {selectedPlant && (
                <PlantRecordModal 
                    plant={selectedPlant}
                    onClose={() => setSelectedPlant(null)}
                    onUpdate={loadPlants}
                />
            )}
        </div>
    );
};

export default MyGardenPage;
