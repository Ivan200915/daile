import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface DailyLog {
    date: string;
    checkIn?: {
        mood?: number;
        energy?: number;
    };
    metrics?: {
        sleepHours?: number;
        steps?: number;
        activeMinutes?: number;
    };
}

interface CorrelationChartProps {
    logs: DailyLog[];
    xMetric: 'sleep' | 'steps' | 'active';
    yMetric: 'mood' | 'energy';
}

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';

export const CorrelationChart: React.FC<CorrelationChartProps> = ({ logs, xMetric, yMetric }) => {
    const data = useMemo(() => {
        return logs
            .filter(log => {
                const hasX = xMetric === 'sleep' ? log.metrics?.sleepHours :
                    xMetric === 'steps' ? log.metrics?.steps :
                        log.metrics?.activeMinutes;
                const hasY = yMetric === 'mood' ? log.checkIn?.mood : log.checkIn?.energy;
                return hasX && hasY;
            })
            .map(log => ({
                x: xMetric === 'sleep' ? log.metrics?.sleepHours :
                    xMetric === 'steps' ? (log.metrics?.steps || 0) / 1000 :
                        log.metrics?.activeMinutes,
                y: yMetric === 'mood' ? log.checkIn?.mood : log.checkIn?.energy,
                date: log.date,
            }));
    }, [logs, xMetric, yMetric]);

    const xLabel = xMetric === 'sleep' ? 'Сон (часы)' :
        xMetric === 'steps' ? 'Шаги (тыс.)' : 'Активность (мин)';
    const yLabel = yMetric === 'mood' ? 'Настроение' : 'Энергия';

    // Calculate correlation coefficient
    const correlation = useMemo(() => {
        if (data.length < 3) return null;

        const n = data.length;
        const sumX = data.reduce((acc, d) => acc + (d.x || 0), 0);
        const sumY = data.reduce((acc, d) => acc + (d.y || 0), 0);
        const sumXY = data.reduce((acc, d) => acc + ((d.x || 0) * (d.y || 0)), 0);
        const sumX2 = data.reduce((acc, d) => acc + ((d.x || 0) ** 2), 0);
        const sumY2 = data.reduce((acc, d) => acc + ((d.y || 0) ** 2), 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));

        if (denominator === 0) return null;
        return numerator / denominator;
    }, [data]);

    const correlationText = correlation === null ? 'Недостаточно данных' :
        correlation > 0.5 ? 'Сильная положительная связь' :
            correlation > 0.2 ? 'Умеренная положительная связь' :
                correlation > -0.2 ? 'Слабая связь' :
                    correlation > -0.5 ? 'Умеренная отрицательная связь' :
                        'Сильная отрицательная связь';

    const avgX = data.length > 0 ? data.reduce((acc, d) => acc + (d.x || 0), 0) / data.length : 0;
    const avgY = data.length > 0 ? data.reduce((acc, d) => acc + (d.y || 0), 0) / data.length : 0;

    if (data.length < 3) {
        return (
            <div className={`${GLASS_PANEL} p-4`}>
                <h3 className="text-sm font-semibold text-white/70 mb-2">{xLabel} vs {yLabel}</h3>
                <p className="text-sm text-white/50">Минимум 3 записи для анализа корреляции</p>
            </div>
        );
    }

    return (
        <div className={`${GLASS_PANEL} p-4`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white/70">{xLabel} vs {yLabel}</h3>
                <div className={`${GLASS_PANEL_LIGHT} px-2 py-1`}>
                    <span className={`text-xs font-medium ${correlation && correlation > 0.2 ? 'text-[#00D4AA]' : correlation && correlation < -0.2 ? 'text-red-400' : 'text-white/50'}`}>
                        r = {correlation?.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                        <XAxis
                            dataKey="x"
                            type="number"
                            name={xLabel}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                            label={{ value: xLabel, position: 'bottom', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        />
                        <YAxis
                            dataKey="y"
                            type="number"
                            name={yLabel}
                            domain={[1, yMetric === 'mood' ? 5 : 10]}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                        />
                        <Tooltip
                            content={({ payload }) => {
                                if (!payload?.[0]) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-black/80 p-2 rounded-lg text-xs">
                                        <p className="font-semibold">{d.date}</p>
                                        <p>{xLabel}: {d.x}</p>
                                        <p>{yLabel}: {d.y}</p>
                                    </div>
                                );
                            }}
                        />
                        <ReferenceLine x={avgX} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                        <ReferenceLine y={avgY} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                        <Scatter name="Data" data={data} fill="#00D4AA">
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.y && entry.y >= 4 ? '#00D4AA' : entry.y && entry.y >= 3 ? '#FFD700' : '#FF6B6B'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            <p className="text-xs text-white/50 mt-2 text-center">{correlationText}</p>
        </div>
    );
};

export default CorrelationChart;
