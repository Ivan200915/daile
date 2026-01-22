import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { analyzeFace, FaceAnalysis, Recommendation } from '../services/umaxService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-semibold rounded-xl hover:bg-[#00D4AA]/90 transition';
const SCAN_BUTTON = 'bg-red-600 text-white font-bold rounded-full hover:bg-red-500 transition shadow-[0_0_20px_rgba(220,38,38,0.5)]';

export const UmaxScreen = () => {
    const [state, setState] = useState<'idle' | 'scanning' | 'analyzing' | 'result'>('idle');
    const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
    const [scanProgress, setScanProgress] = useState(0);

    const startScan = async () => {
        setState('scanning');
        setScanProgress(0);

        // Simulate scanning progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        setTimeout(() => {
            clearInterval(interval);
            setState('analyzing');
            processAnalysis();
        }, 3500);
    };

    const processAnalysis = async () => {
        const result = await analyzeFace();
        setAnalysis(result);
        setState('result');
    };

    const reset = () => {
        setState('idle');
        setAnalysis(null);
    };

    if (state === 'idle' || state === 'scanning') {
        return (
            <div className="h-full flex flex-col relative overflow-hidden bg-black text-white">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <h1 className="text-2xl font-bold tracking-wider">FACE ID</h1>
                    <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono">
                        AI READY
                    </div>
                </div>

                {/* Camera Viewport Placeholder */}
                <div className="flex-1 relative flex items-center justify-center bg-[#111]">
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 z-10 opacity-30 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}
                    />

                    {/* Face Frame */}
                    <div className="w-64 h-80 border-2 border-white/20 rounded-[50%] relative z-10 flex items-center justify-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-red-500/50" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-3 bg-red-500/50" />
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-1 bg-red-500/50" />
                        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-1 bg-red-500/50" />

                        {state === 'idle' && (
                            <Icons.Maximize2 size={64} className="text-white/20" />
                        )}
                    </div>

                    {/* Scanning Line */}
                    {state === 'scanning' && (
                        <div
                            className="absolute w-full h-1 bg-red-500 shadow-[0_0_15px_#ef4444] z-20 top-0 left-0"
                            style={{ animation: 'scan 2s linear infinite' }}
                        />
                    )}

                    {/* Scanning style */}
                    <style>{`
             @keyframes scan {
               0% { top: 10%; opacity: 0; }
               10% { opacity: 1; }
               90% { opacity: 1; }
               100% { top: 90%; opacity: 0; }
             }
           `}</style>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pb-32 z-20 flex flex-col items-center bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    {state === 'idle' ? (
                        <>
                            <p className="text-white/70 mb-8 text-center max-w-xs">
                                Position your face within the frame and ensure good lighting for accurate AI analysis.
                            </p>
                            <button
                                onClick={startScan}
                                className={`w-20 h-20 ${SCAN_BUTTON} flex items-center justify-center border-4 border-black/50`}
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-white/30" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between text-xs font-mono text-red-500 mb-2">
                                <span>SCANNING...</span>
                                <span>{scanProgress}%</span>
                            </div>
                            <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-600 transition-all duration-75"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <p className="text-center text-xs text-white/40 mt-4 font-mono">
                                ANALYZING GEOMETRY...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (state === 'analyzing') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-bold tracking-widest text-red-500 animate-pulse">COMPUTING SCORES</h2>
                <p className="text-white/40 text-sm mt-2">Checking symmetry, ratios, and quality...</p>
            </div>
        );
    }

    // Result State
    return (
        <div className="h-full flex flex-col bg-[#050505] text-white overflow-y-auto no-scrollbar pb-32 animate-fade-in">
            {/* Score Header */}
            <div className="relative h-80 shrink-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    <div className="relative">
                        <div className="w-40 h-40 rounded-full border-4 border-white/10 flex items-center justify-center backdrop-blur-sm bg-black/30">
                            <span className="text-6xl font-black bg-gradient-to-tr from-white to-gray-400 bg-clip-text text-transparent">
                                {analysis?.overallScore}
                            </span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-900/50">
                            Masterpiece
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-white/60 text-sm">Potential</p>
                        <p className="text-2xl font-bold text-[#00D4AA]">{analysis?.potentialScore}</p>
                    </div>
                </div>

                <div className="absolute top-6 left-6">
                    <button onClick={reset} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                        <Icons.ArrowRight className="rotate-180" size={20} />
                    </button>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-10 space-y-6">

                {/* Radar Chart */}
                <div className={`${GLASS_PANEL} p-4 flex flex-col items-center`}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Attributes</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                { subject: 'Jawline', A: analysis?.categories.jawline, fullMark: 100 },
                                { subject: 'Eyes', A: analysis?.categories.eyes, fullMark: 100 },
                                { subject: 'Skin', A: analysis?.categories.skinQuality, fullMark: 100 },
                                { subject: 'Masc', A: analysis?.categories.masculinity, fullMark: 100 },
                                { subject: 'Symm', A: analysis?.categories.symmetry, fullMark: 100 },
                                { subject: 'Cheeks', A: analysis?.categories.cheekbones, fullMark: 100 },
                            ]}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My Face" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold">Category Breakdown</h3>
                    {[
                        { label: 'Jawline', val: analysis?.categories.jawline, icon: Icons.Activity },
                        { label: 'Skin', val: analysis?.categories.skinQuality, icon: Icons.Leaf },
                        { label: 'Masculinity', val: analysis?.categories.masculinity, icon: Icons.Trophy },
                    ].map(c => (
                        <div key={c.label} className={`${GLASS_PANEL_LIGHT} p-4 flex items-center justify-between`}>
                            <div className="flex items-center space-x-3">
                                <IconBadge icon={c.icon} size="sm" variant="circle" color={c.val! >= 90 ? '#00D4AA' : c.val! >= 80 ? '#FFD700' : '#FF6B6B'} />
                                <span className="font-medium">{c.label}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${c.val! >= 90 ? 'bg-[#00D4AA]' : c.val! >= 80 ? 'bg-[#FFD700]' : 'bg-[#FF6B6B]'}`} style={{ width: `${c.val}%` }} />
                                </div>
                                <span className="font-bold w-6 text-right">{c.val}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <Icons.Zap className="text-[#FFD700] mr-2" size={20} />
                        Looksmaxxing Plan
                    </h3>
                    {analysis?.recommendations.map(rec => (
                        <div key={rec.id} className={`${GLASS_PANEL} p-5 border-l-4 ${rec.impact === 'High' ? 'border-l-red-500' : 'border-l-orange-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg">{rec.title}</h4>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${rec.impact === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                    {rec.impact} Impact
                                </span>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">{rec.description}</p>
                            <button className="mt-4 text-sm font-bold text-red-500 flex items-center hover:text-red-400">
                                START ROUTINE <Icons.ChevronRight size={14} className="ml-1" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
};

export default UmaxScreen;
