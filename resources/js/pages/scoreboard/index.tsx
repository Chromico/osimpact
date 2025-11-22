import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';

interface Score {
    id: number;
    github_username: string;
    score: number;
    rank: string;
    created_at: string;
    user: {
        name: string;
        avatar_url?: string;
    };
}

interface Props {
    scores: {
        data: Score[];
        links: unknown[];
    };
}

export default function ScoreboardIndex({ scores }: Props) {
    return (
        <PublicLayout>
            <Head title="Global Leaderboard" />
            <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8 py-12">
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-6">
                        <h1 className="mb-2 text-3xl font-bold text-foreground">
                            Global Leaderboard
                        </h1>
                        <p className="text-muted-foreground">
                            Top Open Source Contributors ranked by Impact Score.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Rank</th>
                                    <th className="px-4 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium">Score</th>
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {scores.data.map((score, index) => (
                                    <tr key={score.id} className="group hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono text-muted-foreground">
                                            #{index + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                {/* <img src={score.user.avatar_url} className="h-6 w-6 rounded-full" /> */}
                                                {score.github_username}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold ${
                                                score.score >= 90 ? 'text-yellow-400' :
                                                score.score >= 75 ? 'text-purple-400' :
                                                score.score >= 50 ? 'text-blue-400' : 'text-gray-400'
                                            }`}>
                                                {score.score}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {score.rank}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(score.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/scoreboard/${score.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {scores.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No scores recorded yet. Be the first!
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
