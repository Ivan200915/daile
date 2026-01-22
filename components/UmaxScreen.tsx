import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { analyzeFace, FaceAnalysis } from '../services/umaxService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-bold rounded-2xl hover:bg-[#00D4AA]/90 transition shadow-[0_0_20px_rgba(0,212,170,0.3)]';
const OUTLINE_BUTTON = 'bg-transparent border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition';

type FlowState = 'intro' | 'front_capture' | 'front_review' | 'side_capture' | 'side_review' | 'analyzing' | 'results_locked' | 'results_unlocked';

export const UmaxScreen = () => {
    const [state, setState] = useState<FlowState>('intro');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [sideImage, setSideImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitesCount, setInvitesCount] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [streamActive, setStreamActive] = useState(false);

    // --- Camera Handling ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' } // Selfie mode
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStreamActive(true);
            }
        } catch (err) {
            console.error("Camera access denied", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            setStreamActive(false);
        }
    };

    useEffect(() => {
        if (state === 'front_capture' || state === 'side_capture') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [state]);

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1); // Mirror
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

                if (state === 'front_capture') {
                    setFrontImage(dataUrl);
                    setState('front_review');
                } else {
                    setSideImage(dataUrl);
                    setState('side_review');
                }
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                if (state === 'front_capture') {
                    setFrontImage(dataUrl);
                    setState('front_review');
                } else {
                    setSideImage(dataUrl);
                    setState('side_review');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const processAnalysis = async () => {
        setState('analyzing');
        const result = await analyzeFace(frontImage!);
        setAnalysis(result);
        setTimeout(() => {
            setState('results_locked');
        }, 2500);
    };

    const handleInviteShare = () => {
        const newCount = invitesCount + 1;
        setInvitesCount(newCount);
        if (newCount >= 3) {
            setShowInviteModal(false);
            setState('results_unlocked');
        }
    };

    // --- Render Helpers ---

    const renderOverlay = (type: 'front' | 'side') => (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {type === 'front' ? (
                <div className="w-[280px] h-[380px] border-2 border-white/30 rounded-[50%] bg-transparent shadow-[0_0_0_999px_rgba(0,0,0,0.5)]" />
            ) : (
                <div className="relative w-[300px] h-[400px]">
                    <div className="absolute top-0 right-0 bottom-0 w-1/2 border-l-2 border-white/30 rounded-l-[100px] shadow-[0_0_0_999px_rgba(0,0,0,0.5)]" />
                </div>
            )}
        </div>
    );

    // --- Views ---

    if (state === 'intro') {
        return (
            <div className="h-full flex flex-col relative overflow-hidden bg-black text-white p-6 pt-20">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-64 h-64 relative mb-8">
                        <div className="absolute inset-0 bg-[#00D4AA]/20 rounded-full blur-[50px] animate-pulse" />
                        <div className="relative z-10 w-full h-full border-2 border-white/10 rounded-full flex items-center justify-center">
                            <Icons.Camera size={80} className="text-[#00D4AA]" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-4">Reveal Your Potential</h2>
                    <p className="text-white/60 max-w-xs leading-relaxed">
                        Upload a front and side selfie to get a detailed AI analysis of your facial aesthetics.
                    </p>
                </div>

                <div className="pb-24">
                    <button onClick={() => setState('front_capture')} className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}>
                        Start Analysis
                    </button>
                </div>
            </div>
        );
    }

    if (state === 'front_capture' || state === 'side_capture') {
        const isFront = state === 'front_capture';
        return (
            <div className="h-full flex flex-col bg-black relative">
                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center">
                    <button onClick={() => setState(isFront ? 'intro' : 'front_review')} className="p-2 bg-black/50 rounded-full text-white">
                        <Icons.ArrowRight className="rotate-180" size={24} />
                    </button>
                    <h2 className="flex-1 text-center font-bold text-lg mr-10">
                        {isFront ? 'Upload a front selfie' : 'Upload a side selfie'}
                    </h2>
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    <canvas ref={canvasRef} className="hidden" />
                    {renderOverlay(isFront ? 'front' : 'side')}
                </div>
                <div className="p-8 pb-32 bg-black flex flex-col items-center space-y-4">
                    <button onClick={capture} className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}>Take a selfie</button>
                    <label className="text-sm font-medium text-white/60 cursor-pointer hover:text-white transition">
                        <span>Upload from gallery</span>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>
        );
    }

    if (state === 'front_review' || state === 'side_review') {
        const isFront = state === 'front_review';
        const img = isFront ? frontImage : sideImage;
        return (
            <div className="h-full flex flex-col bg-black relative p-6 pt-12">
                <button onClick={() => setState(isFront ? 'front_capture' : 'side_capture')} className="absolute top-6 left-6 p-2 bg-white/10 rounded-full z-20">
                    <Icons.ArrowRight className="rotate-180" size={20} />
                </button>
                <div className="flex-1 relative rounded-2xl overflow-hidden mb-8 border border-white/10">
                    <img src={img!} className="w-full h-full object-cover" alt="Review" />
                </div>
                <div className="pb-24 space-y-4">
                    <button onClick={() => isFront ? setState('side_capture') : processAnalysis()} className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}>Continue</button>
                    <button onClick={() => setState(isFront ? 'front_capture' : 'side_capture')} className={`w-full py-4 ${OUTLINE_BUTTON} text-lg`}>Use Another</button>
                </div>
            </div>
        );
    }

    if (state === 'analyzing') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black relative">
                <div className="w-24 h-24 border-4 border-[#00D4AA] border-t-transparent rounded-full animate-spin mb-8" />
                <h2 className="text-2xl font-bold tracking-widest text-[#00D4AA] animate-pulse">ANALYZING</h2>
                <div className="mt-4 space-y-2 text-center text-white/50 text-sm font-mono">
                    <p>Scanning facial structure...</p>
                    <p>Calculated symmetry...</p>
                </div>
            </div>
        );
    }

    if (state === 'results_locked' || state === 'results_unlocked') {
        const isLocked = state === 'results_locked';

        return (
            <div className="h-full flex flex-col bg-[#050505] text-white relative overflow-hidden">
                <div className={`h-full overflow-y-auto no-scrollbar pb-40 ${isLocked ? 'overflow-hidden' : ''}`}>

                    {/* Header: Reveal Results - Only visible if locked, otherwise standard header */}
                    {isLocked ? (
                        <div className="pt-16 pb-12 text-center relative z-20">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <span className="text-3xl">👀</span>
                                <h1 className="text-3xl font-bold">Reveal your results</h1>
                            </div>
                            <p className="text-white/60 text-sm max-w-xs mx-auto">
                                Invite 3 friends or get Umax Pro to view your results
                            </p>
                        </div>
                    ) : (
                        <div className="relative h-72 shrink-0">
                            <div className="absolute inset-0">
                                <img src={frontImage!} className="w-full h-full object-cover opacity-40" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
                            </div>
                            <div className="absolute bottom-6 left-6">
                                <h1 className="text-5xl font-bold mb-2">{analysis?.overallScore}</h1>
                                <div className="px-3 py-1 bg-[#00D4AA] text-black font-bold rounded-full w-fit text-sm">
                                    MASTERPIECE
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Central Card with Avatar Overlap */}
                    <div className="px-5 relative z-10">
                        {/* Avatar */}
                        {isLocked && (
                            <div className="flex justify-center -mb-12 relative z-20">
                                <div className="w-24 h-24 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#1A1A1A]">
                                    <img src={frontImage!} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Card */}
                        <div className={`bg-[#1A1A1A] rounded-[32px] ${isLocked ? 'pt-16' : 'pt-6'} pb-8 px-6 border border-white/5 shadow-2xl relative overflow-hidden`}>
                            {isLocked && <div className="absolute inset-0 bg-transparent z-10" />} {/* Transparent overlay if needed */}

                            <div className="grid grid-cols-2 gap-x-8 gap-y-6 relative z-0">
                                {/* Blurred Bars Content */}
                                {[
                                    { label: 'Overall', val: analysis?.overallScore },
                                    { label: 'Potential', val: analysis?.potentialScore },
                                    { label: 'Masculinity', val: analysis?.categories.masculinity },
                                    { label: 'Skin quality', val: analysis?.categories.skinQuality },
                                    { label: 'Jawline', val: analysis?.categories.jawline },
                                    { label: 'Cheekbones', val: analysis?.categories.cheekbones },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <p className="text-white/80 text-sm font-medium">{item.label}</p>
                                        {isLocked ? (
                                            // Blurred Pill
                                            <div className="h-3 w-full bg-white/20 rounded-full blur-md" />
                                        ) : (
                                            // Actual Bar
                                            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#00D4AA]" style={{ width: `${item.val}%` }} />
                                            </div>
                                        )}
                                        {isLocked && (
                                            <div className="h-2 w-2/3 bg-white/10 rounded-full blur-sm mt-1" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recommendations (Unlocked only) */}
                    {!isLocked && (
                        <div className="px-5 mt-6 pb-20">
                            <h3 className="text-lg font-bold mb-4">Your Plan</h3>
                            {analysis?.recommendations.map(rec => (
                                <div key={rec.id} className={`${GLASS_PANEL} p-5 mb-3 border-l-4 ${rec.impact === 'High' ? 'border-l-[#00D4AA]' : 'border-l-yellow-500'}`}>
                                    <h4 className="font-bold">{rec.title}</h4>
                                    <p className="text-white/60 text-sm">{rec.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sticky Action Buttons (Locked) */}
                {isLocked && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-28 bg-gradient-to-t from-black via-black to-transparent z-40 space-y-3">
                        <button
                            onClick={() => setState('results_unlocked')}
                            className={`w-full py-4 bg-[#00D4AA] text-black font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(0,212,170,0.4)] flex items-center justify-center space-x-2`}
                        >
                            <span>Get Premium</span>
                        </button>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className={`w-full py-4 bg-black border border-white/20 text-white font-bold rounded-2xl text-lg`}
                        >
                            Invite 3 Friends
                        </button>
                    </div>
                )}

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4 animate-fade-in" onClick={() => setShowInviteModal(false)}>
                        <div className={`${GLASS_PANEL} w-full max-w-sm p-6 bg-[#1A1A1A] border-white/10 relative`} onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                            <h3 className="text-xl font-bold mb-1">Share invite code</h3>
                            <p className="text-white/50 text-sm mb-6">Invite 3 friends to reveal your results</p>

                            <div className="bg-black/40 rounded-xl p-4 flex justify-between items-center mb-6 border border-white/5">
                                <span className="text-2xl font-mono font-bold tracking-wider">WNDQRL</span>
                                <Icons.Copy size={20} className="text-[#00D4AA]" />
                            </div>

                            <button
                                onClick={handleInviteShare}
                                className={`w-full py-4 bg-[#00D4AA] text-black font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(0,212,170,0.3)] mb-4`}
                            >
                                Share Link ({invitesCount}/3)
                            </button>
                            <button onClick={() => setShowInviteModal(false)} className="w-full text-center text-white/50">Close</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default UmaxScreen;
