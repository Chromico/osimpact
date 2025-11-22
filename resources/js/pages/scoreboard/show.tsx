import ScoreBoard from '@/components/score-board';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

interface Score {
    id: number;
    github_username: string;
    score: number;
    rank: string;
    analysis: string;
    strengths: string[];
    recommendations: string[];
    top_repos?: { name: string; description: string; stars: number; url: string }[];
    created_at: string;
}

interface Props {
    score: Score;
}

export default function ScoreboardShow({ score }: Props) {
    return (
        <PublicLayout>
            <Head title={`${score.github_username}'s Impact Score`} />
            <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8 py-12">
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-6">
                        <h1 className="mb-2 text-3xl font-bold text-foreground">
                            {score.github_username}'s Impact Score
                        </h1>
                        <p className="text-muted-foreground">
                            Generated on {new Date(score.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <ScoreBoard data={score} />
                </div>
            </div>
        </PublicLayout>
    );
}
