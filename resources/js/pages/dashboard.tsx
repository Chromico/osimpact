import AppLayout from '@/layouts/app-layout';
import ScoreBoard from '@/components/score-board';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    githubConnected: boolean;
    githubUsername?: string;
    githubAuthUrl: string;
}

export default function Dashboard({ githubConnected, githubUsername, githubAuthUrl }: DashboardProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    interface ProgressEventShape { event?: string; message?: string }
    const formatLogMessage = (event: ProgressEventShape) => {
        switch (event.event) {
            case 'sandbox_create_start':
                return 'Initializing secure sandbox environment...';
            case 'sandbox_created':
                return 'Sandbox created successfully.';
            case 'mcp_info_acquired':
                return 'Acquired MCP connection details.';
            case 'mcp_init_wait_start':
                return 'Waiting for MCP servers to initialize...';
            case 'mcp_init_wait_done':
                return 'MCP servers ready.';
            case 'mcp_client_created':
                return 'MCP client initialized.';
            case 'mcp_connect_start':
                return 'Connecting to GitHub MCP tools...';
            case 'mcp_connected':
                return 'Connected to GitHub tools.';
            case 'agent_run_start':
                return 'Starting AI agent analysis...';
            case 'agent_run_done':
                return 'Agent analysis complete.';
            case 'agent_result_extracted':
                return 'Processing results...';
            default:
                return (
                    event.message || event.event || JSON.stringify(event)
                );
        }
    };

    const handleGenerateSummary = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        setLogs([]);
        // Seed initial message
        setMessages([{ role: 'user', content: 'Please analyze my GitHub and calculate my Impact Score.' }]);

        try {
            const response = await fetch('/api/agent/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ messages: [{ role: 'user', content: 'Calculate Open Source Impact Score.' }] }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message || data.error || 'Failed to start generation',
                );
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported in this browser.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split('\n');

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const event = JSON.parse(line);
                        if (event.type === 'progress') {
                            setLogs((prev) => [...prev, formatLogMessage(event)]);
                        } else if (event.type === 'result') {
                            setResult(event.summary);
                            if (Array.isArray(event.messages)) {
                                // Append assistant reply as final message
                                setMessages((prev) => [...prev, { role: 'assistant', content: event.summary }]);
                            }
                        } else if (event.type === 'error') {
                            setError(event.error);
                        }
                    } catch {
                        console.warn('Failed to parse JSON line:', line);
                    }
                }
            }
        } catch (err) {
            console.error('Error:', err);
            setError(
                `An error occurred: ${err instanceof Error ? err.message : String(err)}`,
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async (text: string) => {
        if (!text.trim()) return;
        const newMessage = { role: 'user' as const, content: text.trim() };
        const newHistory = [...messages, newMessage];
        setMessages(newHistory);
        setChatInput('');
        setChatLoading(true);
        
        try {
            const response = await fetch('/api/agent/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ messages: newHistory }),
            });
            if (!response.body) throw new Error('Streaming unsupported');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() || '';
                for (const line of parts) {
                    if (!line.trim()) continue;
                    try {
                        const evt = JSON.parse(line);
                        if (evt.type === 'progress') {
                            setLogs((prev) => [...prev, formatLogMessage(evt)]);
                        } else if (evt.type === 'result') {
                            setResult(evt.summary);
                            setMessages((prev) => [...prev, { role: 'assistant', content: evt.summary }]);
                        } else if (evt.type === 'error') {
                            setError(evt.error);
                        }
                    } catch {
                        /* ignore parse errors */
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Impact Evaluator" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                    <div className="mb-6">
                        <h1 className="mb-2 text-3xl font-bold text-foreground">
                            Open Source Impact Evaluator
                        </h1>
                        <p className="text-muted-foreground">
                            Analyze your open source contributions and get a comprehensive impact score based on your GitHub activity.
                        </p>
                    </div>

                    {!githubConnected ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <p className="text-lg text-foreground">
                                Connect your GitHub account to get started.
                            </p>
                            <a
                                href={githubAuthUrl}
                                className="inline-flex items-center justify-center rounded-lg bg-[#24292F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-[#24292F]/50 focus:ring-offset-2"
                            >
                                <svg
                                    className="mr-2 h-5 w-5"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 3.611 3.611 0 0 0 4.904 1.36c.024-.62.336-1.044.611-1.283-2.206-.25-4.526-1.104-4.526-4.914a3.838 3.838 0 0 1 1.02-2.665 3.597 3.597 0 0 1 .097-2.625s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.625a3.84 3.84 0 0 1 1.02 2.665c0 3.818-2.327 4.66-4.533 4.907.347.3.657.896.657 1.805 0 1.303-.012 2.352-.012 2.671 0 .265.18.575.688.475A9.911 9.911 0 0 0 10 .333Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Connect with GitHub
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                                        {/* <svg
                                            className="h-6 w-6 text-foreground"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 3.611 3.611 0 0 0 4.904 1.36c.024-.62.336-1.044.611-1.283-2.206-.25-4.526-1.104-4.526-4.914a3.838 3.838 0 0 1 1.02-2.665 3.597 3.597 0 0 1 .097-2.625s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.625a3.84 3.84 0 0 1 1.02 2.665c0 3.818-2.327 4.66-4.533 4.907.347.3.657.896.657 1.805 0 1.303-.012 2.352-.012 2.671 0 .265.18.575.688.475A9.911 9.911 0 0 0 10 .333Z"
                                                clipRule="evenodd"
                                            />
                                        </svg> */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                            <path d="M9 18c-4.51 2-5-2-7-2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Connected as {githubUsername}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Ready to analyze contributions
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        router.post('/auth/github/disconnect')
                                    }
                                    className="text-sm font-medium text-destructive hover:underline"
                                >
                                    Disconnect
                                </button>
                            </div>

                            <button
                                onClick={handleGenerateSummary}
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="mr-3 h-5 w-5 animate-spin text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Calculating Impact Score...
                                    </>
                                ) : (
                                    'Calculate Impact Score'
                                )}
                            </button>

                            {logs.length > 0 && (
                                <div className="mt-6 overflow-hidden rounded-lg border border-gray-800 bg-[#1e1e1e] font-mono text-sm shadow-lg">
                                    <div className="flex items-center border-b border-gray-800 bg-[#252526] px-4 py-2">
                                        <div className="flex gap-2">
                                            <div className="h-3 w-3 rounded-full bg-[#ff5f56]"></div>
                                            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]"></div>
                                            <div className="h-3 w-3 rounded-full bg-[#27c93f]"></div>
                                        </div>
                                        <div className="ml-4 text-xs text-gray-400">
                                            AI Analysis Agent Logs
                                        </div>
                                    </div>
                                    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto p-4 text-gray-300">
                                        {logs.map((log, i) => (
                                            <div key={i} className="flex">
                                                <span className="mr-2 shrink-0 text-green-500">
                                                    ➜
                                                </span>
                                                <span>{log}</span>
                                            </div>
                                        ))}
                                        {loading && (
                                            <div className="flex animate-pulse">
                                                <span className="mr-2 shrink-0 text-green-500">➜</span>
                                                <span className="h-5 w-2 bg-gray-500"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                                    {error}
                                </div>
                            )}

                            {result && (
                                <div className="mt-6 space-y-4">
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(result);
                                            if (parsed.score && parsed.rank) {
                                                return (
                                                    <div className="space-y-4">
                                                        <ScoreBoard data={parsed} />
                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() => router.post('/scoreboard', parsed)}
                                                                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                                                            >
                                                                Publish to Leaderboard
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            throw new Error('Not score data');
                                        } catch {
                                            return (
                                                <div className="rounded-lg border border-border bg-card p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h2 className="text-xl font-semibold text-foreground">Impact Evaluation</h2>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(result)}
                                                                className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted/40"
                                                            >Copy</button>
                                                            <button
                                                                onClick={() => handleChatSubmit('Explain the reasoning behind this score in more detail.')}
                                                                className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted/40"
                                                            >Explain Score</button>
                                                        </div>
                                                    </div>
                                                    <div className="prose prose-invert max-w-none text-foreground">
                                                        <ReactMarkdown>{result}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            )}

                            {/* Chat Interface */}
                            {/* {githubConnected && (
                                <div className="mt-6 rounded-lg border border-border bg-card p-6">
                                    <h3 className="mb-2 text-lg font-medium text-foreground">Agent Chat</h3>
                                    <div className="mb-4 flex max-h-72 flex-col gap-3 overflow-y-auto">
                                        {messages.map((m, i) => (
                                            <div
                                                key={i}
                                                className={`rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-foreground'}`}
                                            >
                                                <span className="block font-semibold capitalize">{m.role}</span>
                                                <span className="whitespace-pre-wrap">{m.content}</span>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground animate-pulse">Thinking...</div>
                                        )}
                                    </div>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleChatSubmit(chatInput);
                                        }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Ask the agent to refine, expand, or adjust..."
                                            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={chatLoading}
                                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                                        >Send</button>
                                    </form>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
