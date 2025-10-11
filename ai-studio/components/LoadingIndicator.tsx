import React, { useState, useEffect, useRef } from 'react';

// Progress-based messages that give a sense of the generation stages
const progressMessages = [
    { progress: 0, message: "Warming up the AI's creative circuits..." },
    { progress: 20, message: "Mixing digital paints on a virtual palette..." },
    { progress: 40, message: "Consulting with virtual muses for inspiration..." },
    { progress: 65, message: "Applying final touches to the digital canvas..." },
    { progress: 90, message: "Rendering a new reality..." },
];

/**
 * A self-contained circular progress bar component.
 * @param progress - A number from 0 to 100.
 */
const CircularProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const size = 120; // Increased size for better visibility
    const strokeWidth = 10;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="stroke-cyan-400/10"
                    fill="transparent"
                />
                {/* Progress Arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="stroke-cyan-400"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.35s linear' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-2xl font-mono font-bold text-slate-100">
                    {`${Math.floor(progress)}%`}
                </span>
            </div>
        </div>
    );
};

export const LoadingIndicator: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(progressMessages[0].message);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const startTime = Date.now();
        // A longer duration feels more appropriate for a complex task
        const duration = 25000; 

        const step = () => {
            const elapsedTime = Date.now() - startTime;
            let currentProgress = (elapsedTime / duration) * 100;

            // Apply an easing function (ease-out cubic) to make it start fast and slow down
            currentProgress = 100 * (1 - Math.pow(1 - currentProgress / 100, 3));

            // Cap at 99% because the component will be unmounted when the actual process finishes
            if (currentProgress >= 99) {
                currentProgress = 99;
            }

            setProgress(currentProgress);
            
            // Find the most relevant message for the current progress
            const currentMessageInfo = [...progressMessages].reverse().find(m => currentProgress >= m.progress);
            if (currentMessageInfo) {
                setMessage(currentMessageInfo.message);
            }

            if (currentProgress < 99) {
                animationFrameRef.current = requestAnimationFrame(step);
            }
        };

        animationFrameRef.current = requestAnimationFrame(step);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 w-full max-w-md mx-auto">
            <CircularProgressBar progress={progress} />
            <p className="mt-6 text-xl font-semibold text-slate-100">Generating Masterpiece</p>
            <p className="mt-2 text-sm text-slate-400 h-10 font-mono transition-opacity duration-500">{message}</p>
        </div>
    );
};
