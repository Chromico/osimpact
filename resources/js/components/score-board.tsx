import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import { useCallback, useRef } from 'react';

interface ScoreData {
    id?: number;
    score: number;
    rank: string;
    strengths: string[];
    analysis: string;
    recommendations: string[];
    top_repos?: { name: string; description: string; stars: number; url: string }[];
}

interface ScoreBoardProps {
    data: ScoreData;
}

export default function ScoreBoard({ data }: ScoreBoardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const downloadPng = useCallback(() => {
        if (cardRef.current === null) {
            return;
        }

        toPng(cardRef.current, { cacheBust: true, backgroundColor: '#09090b', pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'impact-score-card.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Failed to generate image', err);
            });
    }, [cardRef]);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]';
        if (score >= 75) return 'text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]';
        if (score >= 50) return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]';
        return 'text-gray-400';
    };

    const getBorderColor = (score: number) => {
        if (score >= 90) return 'border-yellow-500/50 shadow-[0_0_30px_-10px_rgba(250,204,21,0.3)]';
        if (score >= 75) return 'border-purple-500/50 shadow-[0_0_30px_-10px_rgba(192,132,252,0.3)]';
        if (score >= 50) return 'border-blue-500/50 shadow-[0_0_30px_-10px_rgba(96,165,250,0.3)]';
        return 'border-gray-500/50';
    };

    const getRankColor = (score: number) => {
        if (score >= 90) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
        if (score >= 75) return 'bg-purple-500/10 text-purple-400 border-purple-500/50';
        if (score >= 50) return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
        return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
    };

    const getGradient = (score: number) => {
        if (score >= 90) return 'from-yellow-500/20 via-zinc-900 to-zinc-950';
        if (score >= 75) return 'from-purple-500/20 via-zinc-900 to-zinc-950';
        if (score >= 50) return 'from-blue-500/20 via-zinc-900 to-zinc-950';
        return 'from-gray-500/20 via-zinc-900 to-zinc-950';
    };

    return (
        <div className="flex flex-col gap-6 md:flex-row">
            {/* The Gaming Card (1/4 width) */}
            <div className="w-full md:w-1/4 flex flex-col gap-4">
                <div
                    ref={cardRef}
                    className={cn(
                        "relative flex aspect-[3/4] flex-col items-center justify-between overflow-hidden rounded-xl border-2 p-6 text-center shadow-2xl",
                        getBorderColor(data.score),
                        "bg-zinc-950"
                    )}
                >
                    {/* Shiny Gradient Background */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br",
                        getGradient(data.score)
                    )} />
                    
                    {/* Noise/Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* Shine effect */}
                    {/* <div className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] opacity-20 bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#ffffff10_50%,#00000000)]" /> */}

                    <div className="z-10 mt-4 space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Impact Score
                        </h3>
                    </div>

                    <div className="z-10 flex flex-col items-center gap-2">
                        <div className={cn('text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl', getScoreColor(data.score))}>
                            {data.score}
                        </div>
                    </div>

                    <div className="z-10 mb-2 w-full space-y-4">
                        <div className={cn('w-full rounded-lg border py-2 text-sm font-bold uppercase tracking-wider backdrop-blur-md', getRankColor(data.score))}>
                            {data.rank}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 opacity-50">
                            <div className="h-px w-8 bg-border" />
                            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                Open Source Impact
                            </span>
                            <div className="h-px w-8 bg-border" />
                        </div>
                        
                        {data.id && (
                            <div className="text-[10px] text-muted-foreground/50 font-mono">
                                #{data.id.toString().padStart(6, '0')}
                            </div>
                        )}
                    </div>
                    
                    {/* Scanlines effect */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
                </div>

                <button
                    onClick={downloadPng}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Download Card
                </button>
            </div>

            {/* Analysis & Details (3/4 width) */}
            <div className="flex-1 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm md:w-3/4">
                <div className="mb-6">
                    <h3 className="mb-3 text-xl font-bold text-foreground">Analysis</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {data.analysis}
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Key Strengths
                        </h4>
                        <ul className="space-y-3">
                            {data.strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            Recommendations
                        </h4>
                        <ul className="space-y-3">
                            {data.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {data.top_repos && data.top_repos.length > 0 && (
                    <div className="mt-8 border-t border-border pt-6">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                            Top Contributions
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.top_repos.map((repo, i) => (
                                <a
                                    key={i}
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col justify-between rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-purple-500/50 hover:bg-purple-500/5"
                                >
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-semibold text-foreground group-hover:text-purple-400">{repo.name}</span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                {repo.stars}
                                            </span>
                                        </div>
                                        <p className="line-clamp-2 text-xs text-muted-foreground">{repo.description}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
