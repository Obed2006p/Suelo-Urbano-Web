import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon } from './icons/Icons';

export interface PlantDiagnosticMarker {
    id?: number;
    titulo: string;
    descripcion: string;
    x: number; // Porcentaje 0 a 100 en el ancho
    y: number; // Porcentaje 0 a 100 en el alto
    categoria?: 'corona' | 'follaje' | 'patogeno' | 'riego' | 'nutricion' | string;
    severidad?: 'critica' | 'moderada' | 'leve' | string;
    accionSugerida?: string;
}

interface InteractivePlantScanProps {
    imageUrl: string;
    plantName: string;
    markers: PlantDiagnosticMarker[];
}

export const InteractivePlantScan: React.FC<InteractivePlantScanProps> = ({
    imageUrl,
    plantName,
    markers = []
}) => {
    const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(
        markers.length > 0 ? 0 : null
    );
    const [showOverlay, setShowOverlay] = useState<boolean>(true);
    const [isZoomed, setIsZoomed] = useState<boolean>(false);

    if (!markers || markers.length === 0) {
        return null;
    }

    const activeMarker = selectedMarkerId !== null ? markers[selectedMarkerId] : null;

    const getSeverityBadge = (sev?: string) => {
        switch (sev) {
            case 'critica':
                return {
                    bg: 'bg-rose-500',
                    border: 'border-rose-400',
                    text: 'text-rose-100',
                    badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
                    label: '⚠️ Severidad Alta / Crítica'
                };
            case 'moderada':
                return {
                    bg: 'bg-amber-500',
                    border: 'border-amber-400',
                    text: 'text-amber-100',
                    badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                    label: '⚡ Atención Moderada'
                };
            default:
                return {
                    bg: 'bg-emerald-500',
                    border: 'border-emerald-400',
                    text: 'text-emerald-100',
                    badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                    label: '🔍 Observación Preventiva'
                };
        }
    };

    const getCategoryIcon = (cat?: string) => {
        switch (cat) {
            case 'corona':
                return '👑';
            case 'follaje':
                return '🍃';
            case 'patogeno':
                return '🍄';
            case 'riego':
                return '💧';
            case 'nutricion':
                return '🧪';
            default:
                return '🎯';
        }
    };

    return (
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 sm:p-5 text-white shadow-xl space-y-4">
            {/* Header del Escaneo Clínico */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                        <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                                <span>🎯 Radiografía Visual: Mapeo de Focos y Fallas</span>
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {markers.length} puntos localizados
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-stone-300 font-medium">
                            Señalamiento espacial sobre la fotografía original enviada por el cliente
                        </p>
                    </div>
                </div>

                {/* Controles de visualización */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowOverlay(!showOverlay)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                            showOverlay
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-sm'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-600'
                        }`}
                        title="Alternar entre ver las marcas o la foto limpia"
                    >
                        <span>{showOverlay ? '👁️ Ocultar Marcas' : '🎯 Mostrar Flechas y Focos'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 transition-all cursor-pointer"
                        title={isZoomed ? "Reducir vista" : "Ampliar fotografía"}
                    >
                        {isZoomed ? '🔍 Normal' : '🔍 Ampliar'}
                    </button>
                </div>
            </div>

            {/* Canvas / Visor de la Fotografía con Marcadores y Flechas */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/90 border border-stone-700 shadow-2xl flex items-center justify-center select-none group">
                <div className={`relative w-full transition-all duration-300 ${isZoomed ? 'max-h-[650px]' : 'max-h-[460px]'} flex justify-center`}>
                    <img
                        src={imageUrl}
                        alt={`Diagnóstico visual de ${plantName}`}
                        className="w-full h-auto max-h-[460px] sm:max-h-[520px] object-contain rounded-xl block mx-auto"
                    />

                    {/* Overlay interactivo de flechas y círculos diana */}
                    {showOverlay && (
                        <div className="absolute inset-0 pointer-events-none">
                            {markers.map((marker, idx) => {
                                const isSelected = selectedMarkerId === idx;
                                const sevStyle = getSeverityBadge(marker.severidad);
                                const clampedX = Math.max(6, Math.min(94, marker.x));
                                const clampedY = Math.max(8, Math.min(92, marker.y));

                                // Determinar la orientación óptima de la flecha
                                // Si el punto está muy arriba, la flecha viene de arriba; si está a la derecha, viene de la derecha.
                                const isUpperHalf = clampedY < 40;
                                const isRightHalf = clampedX > 60;
                                const isLowerHalf = clampedY > 70;

                                // Coordenadas del origen de la flecha respecto al pin
                                const arrowDeltaX = isRightHalf ? 32 : -32;
                                const arrowDeltaY = isUpperHalf ? -28 : isLowerHalf ? 28 : -24;

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            left: `${clampedX}%`,
                                            top: `${clampedY}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        className="absolute pointer-events-auto"
                                    >
                                        {/* Pulso radar animado */}
                                        <div className={`absolute -inset-3 rounded-full ${sevStyle.bg} opacity-40 animate-ping pointer-events-none`} />

                                        {/* Anillo de diana circular */}
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${isSelected ? 'border-white ring-4 ring-emerald-400 scale-110' : sevStyle.border} ${sevStyle.bg}/80 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-200 cursor-pointer hover:scale-125 z-20`}
                                            onClick={() => setSelectedMarkerId(idx)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <span className="text-white font-black text-xs sm:text-sm drop-shadow">
                                                {idx + 1}
                                            </span>
                                        </div>

                                        {/* Flecha gráfica SVG señalando el centro exacto del punto */}
                                        <svg
                                            className="absolute pointer-events-none z-10 overflow-visible"
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                left: arrowDeltaX > 0 ? '16px' : '-46px',
                                                top: arrowDeltaY > 0 ? '16px' : '-46px'
                                            }}
                                            viewBox="0 0 46 46"
                                        >
                                            <defs>
                                                <marker
                                                    id={`arrowhead-${idx}`}
                                                    markerWidth="6"
                                                    markerHeight="6"
                                                    refX="5"
                                                    refY="3"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 6 3, 0 6" fill={isSelected ? '#ffffff' : '#34d399'} />
                                                </marker>
                                            </defs>
                                            <line
                                                x1={arrowDeltaX > 0 ? 40 : 6}
                                                y1={arrowDeltaY > 0 ? 40 : 6}
                                                x2={arrowDeltaX > 0 ? 6 : 40}
                                                y2={arrowDeltaY > 0 ? 6 : 40}
                                                stroke={isSelected ? '#ffffff' : '#34d399'}
                                                strokeWidth={isSelected ? '3' : '2.2'}
                                                strokeDasharray={isSelected ? 'none' : '4,2'}
                                                markerEnd={`url(#arrowhead-${idx})`}
                                            />
                                        </svg>

                                        {/* Mini etiqueta flotante compacta visible siempre */}
                                        <div
                                            onClick={() => setSelectedMarkerId(idx)}
                                            className={`absolute whitespace-nowrap cursor-pointer z-30 transition-all ${
                                                isUpperHalf ? 'top-10' : '-top-8'
                                            } ${isRightHalf ? '-right-2' : '-left-2'} px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md border ${
                                                isSelected
                                                    ? 'bg-white text-stone-900 border-emerald-400 font-extrabold scale-105'
                                                    : 'bg-stone-900/90 text-stone-200 border-stone-600 hover:bg-stone-800'
                                            }`}
                                        >
                                            <span className="mr-1">{getCategoryIcon(marker.categoria)}</span>
                                            <span>{marker.titulo}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Leyenda flotante de instrucciones en la esquina inferior */}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] text-stone-300 border border-white/10 pointer-events-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Toca los números (1, 2, 3) sobre la foto para ver el detalle de cada falla</span>
                </div>
            </div>

            {/* Tarjeta de Detalle del Marcador Seleccionado (Leyenda Activa) */}
            {activeMarker && (
                <div className="bg-stone-850/90 dark:bg-stone-800/90 border-2 border-emerald-500/60 p-4 rounded-xl shadow-lg space-y-2 animate-fade-in text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow">
                                {(selectedMarkerId ?? 0) + 1}
                            </span>
                            <h5 className="font-extrabold text-sm sm:text-base text-white">
                                {activeMarker.titulo}
                            </h5>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(activeMarker.severidad).badge}`}>
                                {getSeverityBadge(activeMarker.severidad).label}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                        {activeMarker.descripcion}
                    </p>

                    {activeMarker.accionSugerida && (
                        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2.5 flex items-start gap-2 text-xs text-emerald-200">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold text-emerald-300 block mb-0.5">Acción correctiva para esta zona:</strong>
                                <span>{activeMarker.accionSugerida}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Carrusel / Lista rápida de todas las inconsistencias detectadas */}
            <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider text-left">
                    Índice de Focos Clínicos Detectados ({markers.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {markers.map((marker, idx) => {
                        const isSelected = selectedMarkerId === idx;
                        const sev = getSeverityBadge(marker.severidad);
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedMarkerId(idx)}
                                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                    isSelected
                                        ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-500/30'
                                        : 'bg-stone-850 hover:bg-stone-800 border-stone-700/80 text-stone-300'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full ${sev.bg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-stone-200'}`}>
                                        {marker.titulo}
                                    </p>
                                    <p className="text-[10px] text-stone-400 line-clamp-1">
                                        {marker.descripcion}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InteractivePlantScan;
