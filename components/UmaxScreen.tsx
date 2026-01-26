import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { analyzeFace, FaceAnalysis, saveScanResult, getScanHistory, ScanResult } from '../services/umaxService';
import { PremiumPaywall } from './PremiumPaywall';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MewingTools } from './MewingTools';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-bold rounded-2xl hover:bg-[#00D4AA]/90 transition shadow-[0_0_20px_rgba(0,212,170,0.3)]';
const OUTLINE_BUTTON = 'bg-transparent border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition';

type FlowState = 'intro' | 'front_capture' | 'front_review' | 'side_capture' | 'side_review' | 'analyzing' | 'results_locked' | 'results_unlocked';

export const UmaxScreen = () => {
    // Inject animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes scan-y {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .animate-scan-y {
            animation: scan-y 2s linear infinite;
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const [state, setState] = useState<FlowState>('intro');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [sideImage, setSideImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitesCount, setInvitesCount] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);
    const [scanProgress, setScanProgress] = useState(0); // 0-100
    const [scanStep, setScanStep] = useState('');
    const [history, setHistory] = useState<ScanResult[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [activeTab, setActiveTab] = useState<'scan' | 'tools'>('scan');
    const { language } = useLanguage();
    const isRu = language === 'ru';

    useEffect(() => {
        setHistory(getScanHistory());
    }, []);

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
        setScanProgress(0);

        // Mock Progress Steps
        const steps = isRu ? [
            { p: 10, text: 'Инициализация биометрического скана...' },
            { p: 30, text: 'Картирование точек лица...' },
            { p: 50, text: 'Анализ текстуры и качества кожи...' },
            { p: 70, text: 'Расчёт золотого сечения...' },
            { p: 90, text: 'Финализация отчёта...' },
        ] : [
            { p: 10, text: 'Initializing biometric scan...' },
            { p: 30, text: 'Mapping facial landmarks...' },
            { p: 50, text: 'Analyzing skin texture & quality...' },
            { p: 70, text: 'Calculating golden ratio...' },
            { p: 90, text: 'Finalizing aesthetic report...' },
        ];

        for (const step of steps) {
            setScanStep(step.text);
            setScanProgress(step.p);
            await new Promise(r => setTimeout(r, 800)); // Simulate work
        }

        const result = await analyzeFace(frontImage!);
        const savedResult = saveScanResult(result);
        setAnalysis(savedResult);
        setHistory(prev => [savedResult, ...prev]);
        setScanProgress(100);
        setState('results_locked');
    };

    const handleInviteShare = () => {
        // Native Telegram Share
        const botName = "DailyDisciplineBot"; // Replace with actual bot if known
        const inviteLink = `https://t.me/${botName}?start=ref_${Math.random().toString(36).substring(7)}`;
        const text = encodeURIComponent("👀 I just scanned my face with AI to see my potential. Check yours here!");
        const url = `https://t.me/share/url?url=${inviteLink}&text=${text}`;

        window.open(url, '_blank');

        // Increment count for demo purposes (usually would wait for callback/webhook)
        const newCount = invitesCount + 1;
        setInvitesCount(newCount);
        if (newCount >= 3) {
            setShowInviteModal(false);
            setState('results_unlocked');
        }
    };

    const renderOverlay = (type: 'front' | 'side') => (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {type === 'front' ? (
                <div className="w-[280px] h-[380px] border-2 border-white/30 rounded-[50%] bg-transparent shadow-[0_0_0_999px_rgba(0,0,0,0.5)]" />
            ) : (
                <div className="relative w-[300px] h-[400px] opacity-70">
                    <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-lg">
                        {/* Profile Silhouette Path - Right facing */}
                        <path
                            d="M90,20 C80,20 60,30 50,60 C45,75 45,90 48,100 C48,100 40,105 35,108 C30,111 30,120 35,125 C38,128 45,128 48,128 C48,128 48,135 48,140 C48,140 35,145 35,155 C35,165 48,165 55,160 C55,160 52,180 55,190 C58,200 70,220 90,230 C90,230 90,280 90,280 L180,280 L180,20 L90,20"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                        />
                        {/* Masking the outside (Shadow) */}
                        <path
                            d="M0,0 L200,0 L200,300 L0,300 L0,0 M90,20 C80,20 60,30 50,60 C45,75 45,90 48,100 C48,100 40,105 35,108 C30,111 30,120 35,125 C38,128 45,128 48,128 C48,128 48,135 48,140 C48,140 35,145 35,155 C35,165 48,165 55,160 C55,160 52,180 55,190 C58,200 70,220 90,230 C90,230 90,280 90,280 L180,280 L180,20 L90,20"
                            fill="rgba(0,0,0,0.6)"
                            fillRule="evenodd"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white/50 text-xs -rotate-90">
                        Align Nose & Chin
                    </div>
                </div>
            )}
        </div>
    );

    // --- Views ---

    if (state === 'intro') {
        return (
            <div className="h-full flex flex-col relative overflow-hidden bg-black text-white">
                {/* Tab Switcher */}
                <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none" style={{ paddingTop: 'calc(var(--safe-area-top, 0px) + 24px)' }}>
                    <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex pointer-events-auto">
                        <button
                            onClick={() => setActiveTab('scan')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === 'scan' ? 'bg-[#00D4AA] text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            {isRu ? 'Скан' : 'Scan'}
                        </button>
                        <button
                            onClick={() => setActiveTab('tools')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === 'tools' ? 'bg-[#00D4AA] text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            {isRu ? 'Инструменты' : 'Tools'}
                        </button>
                    </div>
                </div>

                {activeTab === 'tools' ? (
                    <MewingTools />
                ) : (
                    <div className="flex-1 flex flex-col p-6 pt-20">
                        {showHistory ? (
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">{isRu ? 'История прогресса' : 'Progress History'}</h3>
                                    <button onClick={() => setShowHistory(false)} className="p-2 bg-white/10 rounded-full">
                                        <Icons.X size={20} />
                                    </button>
                                </div>

                                {history.length > 0 ? (
                                    <div className="flex-1">
                                        <div className={`${GLASS_PANEL} p-4 h-64 mb-6`}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={[...history].reverse()}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate() + '/' + (new Date(d).getMonth() + 1)} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                                                    <YAxis domain={[0, 100]} hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                        itemStyle={{ color: '#fff' }}
                                                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                                                        labelFormatter={(l) => new Date(l).toLocaleDateString()}
                                                    />
                                                    <Line type="monotone" dataKey="overallScore" stroke="#00D4AA" strokeWidth={3} dot={{ r: 4, fill: '#00D4AA', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-3 overflow-y-auto max-h-[40vh] no-scrollbar">
                                            {history.map(scan => (
                                                <div key={scan.id} className={`${GLASS_PANEL_LIGHT} p-4 flex items-center justify-between`}>
                                                    <div>
                                                        <p className="font-bold text-lg">{scan.overallScore}</p>
                                                        <p className="text-xs text-white/50">{new Date(scan.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-[#00D4AA]">Potential: {scan.potentialScore}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                                        <Icons.Chart size={48} className="mb-4 opacity-50" />
                                        <p>{isRu ? 'Сканов пока нет' : 'No scans yet'}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-64 h-64 relative mb-8">
                                        <div className="absolute inset-0 bg-[#00D4AA]/20 rounded-full blur-[50px] animate-pulse" />
                                        <div className="relative z-10 w-full h-full border-2 border-white/10 rounded-full flex items-center justify-center">
                                            <Icons.Camera size={80} className="text-[#00D4AA]" />
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold mb-4">{isRu ? 'Раскрой свой потенциал' : 'Reveal Your Potential'}</h2>
                                    <p className="text-white/60 max-w-xs leading-relaxed mb-6">
                                        {isRu
                                            ? 'Загрузи фото спереди и сбоку для AI-анализа внешности.'
                                            : 'Upload a front and side selfie to get a detailed AI analysis of your facial aesthetics.'
                                        }
                                    </p>

                                    {/* History Toggle */}
                                    {history.length > 0 && (
                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="flex items-center space-x-2 text-[#00D4AA] text-sm font-medium hover:text-white transition"
                                        >
                                            <Icons.BarChart2 size={16} />
                                            <span>{isRu ? 'История' : 'View History'}</span>
                                        </button>
                                    )}
                                </div>

                                <div style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 96px)' }}>
                                    <button onClick={() => setState('front_capture')} className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}>
                                        {isRu ? 'Начать анализ' : 'Start Analysis'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
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
                        {isFront
                            ? (isRu ? 'Загрузи фото спереди' : 'Upload a front selfie')
                            : (isRu ? 'Загрузи фото сбоку' : 'Upload a side selfie')
                        }
                    </h2>
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    <canvas ref={canvasRef} className="hidden" />
                    {renderOverlay(isFront ? 'front' : 'side')}
                </div>
                <div className="p-8 bg-black flex flex-col items-center space-y-4" style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 100px)' }}>
                    <button onClick={capture} className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}>
                        {isRu ? 'Сделать селфи' : 'Take a selfie'}
                    </button>
                    <label className="text-sm font-medium text-white/60 cursor-pointer hover:text-white transition">
                        <span>{isRu ? 'Загрузить из галереи' : 'Upload from gallery'}</span>
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
                <div className="space-y-4" style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 96px)' }}>
                    <button onClick={() => isFront ? setState('side_capture') : processAnalysis()} className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}>
                        {isRu ? 'Продолжить' : 'Continue'}
                    </button>
                    <button onClick={() => setState(isFront ? 'front_capture' : 'side_capture')} className={`w-full py-4 ${OUTLINE_BUTTON} text-lg`}>
                        {isRu ? 'Выбрать другое' : 'Use Another'}
                    </button>
                </div>
            </div>
        );
    }

    if (state === 'analyzing') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                {/* Background Image with Scanner Overlay */}
                <div className="absolute inset-0 opacity-30">
                    <img src={frontImage!} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#00D4AA]/10" />
                </div>

                {/* Scanning Line */}
                <div className="absolute inset-0 z-10 animate-scan-y bg-gradient-to-b from-transparent via-[#00D4AA]/50 to-transparent h-[20%]" />

                <div className="relative z-20 flex flex-col items-center">
                    <div className="w-32 h-32 relative mb-8">
                        {/* Spinning Rings */}
                        <div className="absolute inset-0 border-4 border-[#00D4AA]/30 border-t-[#00D4AA] rounded-full animate-spin" />
                        <div className="absolute inset-2 border-4 border-white/10 border-b-white rounded-full animate-spin-slow" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold font-mono">{scanProgress}%</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold tracking-widest text-[#00D4AA] animate-pulse mb-2">
                    {isRu ? 'АНАЛИЗИРУЕМ' : 'ANALYZING'}
                </h2>
                <p className="text-white/70 font-mono text-sm">{scanStep}</p>
            </div>
        );
    }

    if (state === 'results_locked' || state === 'results_unlocked') {
        const isLocked = state === 'results_locked';

        return (
            <div className="h-full flex flex-col bg-[#050505] text-white relative overflow-hidden">
                {showPaywall && (
                    <PremiumPaywall
                        onClose={() => setShowPaywall(false)}
                        onPurchase={() => {
                            setShowPaywall(false);
                            setState('results_unlocked');
                        }}
                    />
                )}
                <div className={`h-full overflow-y-auto no-scrollbar pb-40`}>

                    {/* Header: Reveal Results - Only visible if locked, otherwise standard header */}
                    {isLocked ? (
                        <div className="pt-16 pb-12 text-center relative z-20">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <span className="text-3xl">👀</span>
                                <h1 className="text-3xl font-bold">{isRu ? 'Раскрой результаты' : 'Reveal your results'}</h1>
                            </div>
                            <p className="text-white/60 text-sm max-w-xs mx-auto">
                                {isRu
                                    ? 'Пригласи 3 друзей или получи Премиум для просмотра'
                                    : 'Invite 3 friends or get Premium to view your results'
                                }
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
                                    {isRu ? 'ПРЕВОСХОДНО' : 'MASTERPIECE'}
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
                        <div className={`bg-[#1A1A1A] rounded-[32px] ${isLocked ? 'pt-16' : 'pt-6'} pb-10 px-6 border border-white/5 shadow-2xl relative overflow-visible`}>
                            {isLocked && <div className="absolute inset-0 bg-transparent z-10" />} {/* Transparent overlay if needed */}

                            <div className="grid grid-cols-2 gap-x-8 gap-y-5 relative z-0">
                                {/* Blurred Bars Content */}
                                {[
                                    { label: isRu ? 'Общий балл' : 'Overall', val: analysis?.overallScore },
                                    { label: isRu ? 'Потенциал' : 'Potential', val: analysis?.potentialScore },
                                    { label: isRu ? 'Маскулинность' : 'Masculinity', val: analysis?.categories.masculinity },
                                    { label: isRu ? 'Качество кожи' : 'Skin quality', val: analysis?.categories.skinQuality },
                                    { label: isRu ? 'Линия челюсти' : 'Jawline', val: analysis?.categories.jawline },
                                    { label: isRu ? 'Скулы' : 'Cheekbones', val: analysis?.categories.cheekbones },
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
                            <h3 className="text-lg font-bold mb-4">{isRu ? 'Твой план' : 'Your Plan'}</h3>
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
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-40 space-y-3" style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 100px)' }}>
                        <button
                            onClick={() => setShowPaywall(true)}
                            className={`w-full py-4 bg-[#00D4AA] text-black font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(0,212,170,0.4)] flex items-center justify-center space-x-2`}
                        >
                            <Icons.Crown size={20} />
                            <span>{isRu ? 'Получить Премиум' : 'Get Premium'}</span>
                        </button>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className={`w-full py-4 bg-black border border-white/20 text-white font-bold rounded-2xl text-lg`}
                        >
                            {isRu ? 'Пригласить 3 друзей' : 'Invite 3 Friends'}
                        </button>
                    </div>
                )}

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4 animate-fade-in" onClick={() => setShowInviteModal(false)}>
                        <div className={`${GLASS_PANEL} w-full max-w-sm p-6 bg-[#1A1A1A] border-white/10 relative`} onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                            <h3 className="text-xl font-bold mb-1">{isRu ? 'Поделись кодом' : 'Share invite code'}</h3>
                            <p className="text-white/50 text-sm mb-6">{isRu ? 'Пригласи 3 друзей для просмотра результатов' : 'Invite 3 friends to reveal your results'}</p>

                            <div className="bg-black/40 rounded-xl p-4 flex justify-between items-center mb-6 border border-white/5">
                                <span className="text-2xl font-mono font-bold tracking-wider">WNDQRL</span>
                                <Icons.Copy size={20} className="text-[#00D4AA]" />
                            </div>

                            <button
                                onClick={handleInviteShare}
                                className={`w-full py-4 bg-[#00D4AA] text-black font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(0,212,170,0.3)] mb-4`}
                            >
                                {isRu ? `Поделиться (${invitesCount}/3)` : `Share Link (${invitesCount}/3)`}
                            </button>
                            <button onClick={() => setShowInviteModal(false)} className="w-full text-center text-white/50">
                                {isRu ? 'Закрыть' : 'Close'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default UmaxScreen;
