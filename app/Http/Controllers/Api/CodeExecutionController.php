<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CodeExecutionController extends Controller
{
    /**
     * Run the AI agent to generate a CV summary from GitHub contributions.
     */
    public function runAgent(Request $request): StreamedResponse|JsonResponse
    {
        set_time_limit(600); // Allow up to 10 minutes for execution

        $user = $request->user();
        
        // Use user's token
        $githubToken = $user->github_token;

        if (! $githubToken) {
            return response()->json([
                'error' => 'GitHub not connected',
                'message' => 'Please connect your GitHub account first.',
            ], 401);
        }

        $openaiApiKey = config('services.openai.api_key');
        $e2bApiKey = config('services.e2b.api_key');

        // if (! $openaiApiKey) {
        //     return response()->json([
        //         'error' => 'Configuration missing',
        //         'message' => 'OPENAI_API_KEY not set (check .env and ensure the key is on a single line)',
        //     ], 500);
        // }

        // if (! $e2bApiKey) {
        //     return response()->json([
        //         'error' => 'Configuration missing',
        //         'message' => 'E2B_API_KEY (or VITE_E2B_API_KEY) not set in .env',
        //     ], 500);
        // }

        $scriptPath = base_path('scripts/run-agent-mcp.js');

        // Pass the user's GitHub token to the script
        $debug = $request->boolean('debug');
        $githubUsername = $user->github_username ?? config('services.github.username') ?? 'me';

        $messages = $request->input('messages');
        $messagesJson = null;
        if (is_array($messages)) {
            $sanitized = [];
            foreach ($messages as $message) {
                if (! is_array($message) || ! isset($message['role'], $message['content'])) {
                    continue;
                }
                $sanitized[] = [
                    'role' => (string) $message['role'],
                    'content' => is_scalar($message['content'])
                        ? (string) $message['content']
                        : (is_array($message['content'])
                            ? implode("\n", array_map(static fn ($p) => is_scalar($p) ? (string) $p : (isset($p['text']) ? (string) $p['text'] : json_encode($p)), $message['content']))
                            : json_encode($message['content'])),
                ];
            }
            if ($sanitized !== []) {
                $messagesJson = json_encode($sanitized);
            }
        }

        return response()->stream(function () use ($e2bApiKey, $openaiApiKey, $githubToken, $githubUsername, $debug, $scriptPath, $messagesJson) {
            $env = [
                'E2B_API_KEY' => $e2bApiKey,
                'OPENAI_API_KEY' => $openaiApiKey,
                'GITHUB_TOKEN' => $githubToken,
                'GITHUB_USERNAME' => $githubUsername,
                'DEBUG_AGENT' => $debug ? '1' : null,
                'STREAM_OUTPUT' => '1',
                'MESSAGES' => $messagesJson,
                'PATH' => getenv('PATH'),
            ];

            $descriptorspec = [
                0 => ['pipe', 'r'],  // stdin
                1 => ['pipe', 'w'],  // stdout
                2 => ['pipe', 'w'],  // stderr
            ];

            $process = proc_open('node ' . escapeshellarg($scriptPath), $descriptorspec, $pipes, base_path(), $env);

            if (is_resource($process)) {
                // Close stdin immediately
                fclose($pipes[0]);

                // Read stdout line by line
                while (! feof($pipes[1])) {
                    $line = fgets($pipes[1]);
                    if ($line !== false) {
                        echo $line;
                        if (ob_get_level() > 0) {
                            ob_flush();
                        }
                        flush();
                    }
                }

                fclose($pipes[1]);
                fclose($pipes[2]);
                proc_close($process);
            }
        }, 200, [
            'Content-Type' => 'application/x-ndjson',
            'X-Accel-Buffering' => 'no',
            'Cache-Control' => 'no-cache',
        ]);
    }
}
