/* eslint-env node */
// Declare Node globals for stricter linters that may not infer environment
/* global process */
import { Sandbox } from 'e2b';
import { Agent, MCPServerStreamableHttp, run as runAgent } from '@openai/agents';

// Accumulate logs so we emit ONE JSON object at the end (controller can parse easily)
const _logs = [];
function log(event, data = {}) {
  const logEntry = { ts: new Date().toISOString(), event, ...data };
  _logs.push(logEntry);
  
  if (process.env.STREAM_OUTPUT) {
    // Emit NDJSON log entry
    console.log(JSON.stringify({ type: 'progress', ...logEntry }));
  } else if (process.env.DEBUG_AGENT) {
    // echo to stderr when debugging enabled (stdout is reserved for final JSON)
    try {
      console.error(JSON.stringify(logEntry));
    } catch (e) {
      console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'log_error', message: String(e) }));
    }
  }
}

const E2B_API_KEY = process.env.E2B_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const DEBUG_AGENT = process.env.DEBUG_AGENT;
// Optional multi-turn messages passed as JSON string env var MESSAGES
let USER_MESSAGES = [];
try {
  if (process.env.MESSAGES) {
    USER_MESSAGES = JSON.parse(process.env.MESSAGES);
    if (!Array.isArray(USER_MESSAGES)) USER_MESSAGES = [];
  }
} catch (e) {
  // If parsing fails, ignore and continue.
}

// Revert to simple string content messages compatible with agents SDK.
const normalizeMessages = (messages = []) =>
  messages
    .filter((msg) => msg && typeof msg === 'object')
    .map((msg) => ({
      role: msg.role ?? 'user',
      content: typeof msg.content === 'string'
        ? msg.content
        : Array.isArray(msg.content)
          ? msg.content.map((p) => (typeof p === 'string' ? p : p.text)).join('\n')
          : String(msg.content ?? ''),
    }));

if (!E2B_API_KEY) {
  log('fatal_missing_env', { key: 'E2B_API_KEY' });
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  log('fatal_missing_env', { key: 'OPENAI_API_KEY' });
  process.exit(1);
}
if (!GITHUB_TOKEN) {
  log('fatal_missing_env', { key: 'GITHUB_TOKEN' });
  process.exit(1);
}

// Intentionally not emitting env_ok to keep initial terminal clean

async function run() {
  let sbx;
  try {
    log('sandbox_create_start');
    sbx = await Sandbox.create({
      mcp: {
        githubOfficial: {
          githubPersonalAccessToken: GITHUB_TOKEN,
        },
      },
    });
    log('sandbox_created', { sandboxId: sbx?.id });

    const mcpUrl = sbx.getMcpUrl();
    const mcpToken = await sbx.getMcpToken();
    log('mcp_info_acquired', { mcpUrl: !!mcpUrl, tokenLength: mcpToken?.length });

    // Wait for MCP servers to initialize
    log('mcp_init_wait_start');
    await new Promise((r) => setTimeout(r, 2000));
    log('mcp_init_wait_done');

    const mcp = new MCPServerStreamableHttp({
      url: mcpUrl,
      name: 'E2B MCP Gateway',
      requestInit: {
        headers: { Authorization: `Bearer ${mcpToken}` },
      },
    });
    log('mcp_client_created');

    // Connect MCP
    log('mcp_connect_start');
    await mcp.connect();
    log('mcp_connected');

    const username = GITHUB_USERNAME || 'me';
    const instructions = `You are an expert Open Source Impact Evaluator.
Your goal is to analyze the user's GitHub activity and assign an "Open Source Impact Score" from 0 to 100.

Use the available GitHub MCP tools to:
1. List recent repositories, commits, pull requests, and issues for user ${username}.
2. Analyze the quality, frequency, and reach of contributions.
3. Identify key projects and their popularity (stars, forks).
4. Evaluate collaboration (code reviews, discussions).

Output Format:
You must respond with a valid JSON object. Do not include markdown formatting like \`\`\`json.
{
  "score": number, // 0-100
  "rank": string, // A gaming-style rank title based on score (e.g., "Script Kiddie", "Code Ninja", "Open Source Warlord", "Legendary Architect")
  "strengths": string[], // Array of 3-5 key strengths
  "analysis": string, // A very concise summary (max 2 sentences) analyzing their impact
  "recommendations": string[], // Array of 2-3 actionable recommendations
  "top_repos": { "name": string, "description": string, "stars": number, "url": string }[] // Top 3 repositories they contributed to or own
}

If the user asks for changes, update the evaluation based on the previous context and new instructions.
Always use the tools to verify data if you are unsure.
Do NOT make up information.`;

    const baseMessages = USER_MESSAGES.length === 0
      ? [{
          role: 'user',
          content: `Please calculate my Open Source Impact Score based on my GitHub activity. Return JSON.`,
        }]
      : USER_MESSAGES;
    const seeded = normalizeMessages(baseMessages);

    const agent = new Agent({
      name: 'CV Writer',
      model: 'gpt-5-mini',
      instructions: instructions,
      mcpServers: [mcp],
    });



    log('agent_run_start');
    const result = await runAgent(agent, seeded);
    log('agent_output_received', {
      hasFinalOutput: typeof result.finalOutput !== 'undefined',
      finalOutputType: typeof result.finalOutput,
      outputItems: Array.isArray(result.output) ? result.output.length : null,
    });
    log('agent_run_done');

    const summary = typeof result.finalOutput === 'string' ? result.finalOutput : JSON.stringify(result.finalOutput);
    
    log('agent_result_extracted', { summaryLength: summary?.length, preview: summary?.slice(0,120) });
    
    const final = { logs: _logs, summary, raw: result, messages: seeded };
    if (process.env.STREAM_OUTPUT) {
      console.log(JSON.stringify({ type: 'result', ...final }));
    } else {
      process.stdout.write(JSON.stringify(final));
    }

  } catch (err) {
    log('agent_error', { message: err.message, stack: err.stack });
    const finalErr = { logs: _logs, error: err.message, stack: err.stack };
    if (process.env.STREAM_OUTPUT) {
      console.log(JSON.stringify({ type: 'error', ...finalErr }));
    } else {
      process.stdout.write(JSON.stringify(finalErr));
    }
    process.exit(1);
  } finally {
    log('sandbox_cleanup_start');
    if (sbx && typeof sbx.kill === 'function') {
      try {
        await sbx.kill();
        log('sandbox_cleanup_done');
      } catch (e) {
        log('sandbox_cleanup_error', { message: String(e) });
      }
    } else {
      log('sandbox_cleanup_skipped');
    }
  }
}

run();
