
import React, { useState } from 'react';

interface VideoIntroProps {
    onComplete: () => void;
}

const VIDEO_URL = "https://res.cloudinary.com/dsmzpsool/video/upload/v1757882353/Video_de_WhatsApp_2025-09-05_a_las_14.06.48_e1cb3023_xked7e.mp4";

const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleComplete = () => {
        if (isExiting) return;
        setIsExiting(true);
        setTimeout(onComplete, 500); // Match animation duration
    };

    return (
        <div 
            className={`fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-500 ease-in-out ${isExiting ? 'animate-fade-out' : 'animate-fade-in-zoom'}`}
            aria-modal="true"
            role="dialog"
        >
            <main className="w-full max-w-4xl flex flex-col items-center gap-8">
                {/* Video Player Container */}
                <div className="relative w-full">
                     <div className="p-1 rounded-2xl bg-gradient-to-br from-green-500 via-lime-400 to-green-500 shadow-2xl shadow-green-400/20">
                        <video 
                            src={VIDEO_URL}
                            controls
                            autoPlay
                            muted
                            playsInline
                            controlsList="nodownload"
                            className="w-full h-auto max-h-[70vh] object-contain rounded-xl focus:outline-none"
                            aria-label="Video de introducción de Alimento para plantas"
                        />
                    </div>
                </div>


                {/* Continue Button */}
                <button
                    onClick={handleComplete}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg"
                >
                    Saltar Introducción
                </button>
            </main>
        </div>
    );
};

export default VideoIntro;