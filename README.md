# GitHub MCP + E2B Integration

A Laravel application demonstrating AI-powered GitHub repository creation using E2B sandboxes and the Model Context Protocol (MCP).

## 🚀 Features

- **AI-Powered Automation**: Uses OpenAI GPT-4o-mini to autonomously create GitHub repositories
- **Secure Execution**: Runs AI agents in isolated E2B sandboxes (~150ms startup time)
- **MCP Integration**: Leverages GitHub's official MCP server for direct API access
- **Modern Stack**: Built with Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4

## 🎯 What This Does

This application demonstrates a simple but powerful workflow:

1. User enters a GitHub repository name and description
2. Laravel backend spawns an E2B sandbox with GitHub MCP enabled
3. OpenAI agent runs inside the sandbox with instructions to create a repo
4. Agent uses GitHub MCP tools to create the repository, initialize README, and enable Issues
5. Results are returned and displayed in the React UI

It's a clean example of combining Laravel, E2B sandboxes, MCP servers, and AI agents.

## Setup

### Prerequisites
- PHP 8.4+
- Node.js 18+
- Composer
- npm

### API Keys Required

You'll need these API keys:

1. **OpenAI API Key**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **E2B API Key**: Get from [e2b.dev/dashboard](https://e2b.dev/dashboard)
3. **GitHub PAT**: Create at [github.com/settings/tokens](https://github.com/settings/tokens) with `repo` scope

### Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-...

# E2B API Key (for server-side execution)
E2B_API_KEY=e2b_...

# GitHub Personal Access Token (with repo scope)
GITHUB_TOKEN=ghp_...

# Your GitHub username or organization
GITHUB_OWNER=your-username
```

### Installation

```bash
# Install dependencies
composer install
npm install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Build assets
npm run build

# Start the application
php artisan serve

# In another terminal (for development):
npm run dev

# Or build for production:
npm run build
```

Visit `http://localhost:8000`, log in, and navigate to the Dashboard.

## 🎮 Usage

1. **Log In**: Register or log in to the application
2. **Go to Dashboard**: Click "Dashboard" in the navigation
3. **Enter Details**:
   - Repository name (must be unique on your GitHub account)
   - Optional description
4. **Click "Create Repository"**
5. **Wait for Results**: Usually takes 5-15 seconds
6. **Check Your GitHub**: Visit your GitHub profile to see the new repo!

## 📐 How It Works

### Backend Flow

```php
// Laravel Controller
public function runAgent(Request $request): JsonResponse
{
    // 1. Validate input
    $repoName = $request->input('repo_name');
    
    // 2. Get credentials from .env
    $e2bKey = env('E2B_API_KEY');
    $githubToken = env('GITHUB_TOKEN');
    $openaiKey = env('OPENAI_API_KEY');
    
    // 3. Run Node.js script with E2B
    $process = Process::env([
        'E2B_API_KEY' => $e2bKey,
        'OPENAI_API_KEY' => $openaiKey,
        'GITHUB_TOKEN' => $githubToken,
    ])->run(['node', 'scripts/run-agent-mcp.js', $repoName]);
    
    // 4. Return results
    return response()->json(['success' => true, 'output' => $process->output()]);
}
```

### E2B Sandbox Script

```javascript
// scripts/run-agent-mcp.js
const sbx = await Sandbox.betaCreate({
    mcp: {
        githubOfficial: {
            githubPersonalAccessToken: GITHUB_TOKEN,
        },
    },
});

const mcp = new MCPServerStreamableHttp({
    url: sbx.betaGetMcpUrl(),
    // ...
});

const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [{ role: 'user', content: `Create repo named ${repoName}` }],
    tools: [mcp],  // Agent can call GitHub MCP tools
});
```

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `app/Http/Controllers/Api/CodeExecutionController.php` | Main backend controller |
| `scripts/run-agent-mcp.js` | E2B sandbox + MCP integration |
| `resources/js/pages/dashboard.tsx` | React dashboard UI |
| `routes/web.php` | API routes definition |

## 🔧 Architecture

```
User Browser
    ↓ (HTTP POST)
Laravel Controller
    ↓ (spawn process)
Node.js Script
    ↓ (API call)
E2B Sandbox
    ├─ GitHub MCP Server
    └─ OpenAI Agent
        ↓ (uses tools)
GitHub API
    ↓ (creates repo)
Result → User
```
## 🛠️ Tech Stack

### Backend
- **Laravel 12** - Modern PHP framework
- **OpenAI SDK** - GPT-4o-mini integration
- **E2B SDK** - Sandbox management
- **Laravel Fortify** - Authentication

### Frontend
- **React 19** - UI library
- **Inertia.js v2** - SPA without API complexity
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn UI** - Component library

### External Services
- **E2B** - Secure cloud sandboxes (~150ms startup)
- **OpenAI** - AI agent (GPT-4o-mini)
- **GitHub API** - Repository management via MCP

## 🔒 Security

- All API keys stored server-side in `.env`
- E2B sandboxes are isolated and ephemeral
- GitHub token requires only `repo` scope
- CSRF protection on all endpoints
- User authentication required

## 🐛 Troubleshooting

### "Missing credentials" error
Make sure all required environment variables are set in `.env` and restart `php artisan serve`.

### "Agent execution failed"
- Verify your GitHub token has `repo` permissions
- Ensure repository name is unique (doesn't already exist)
- Check Laravel logs: `tail -f storage/logs/laravel.log`

### E2B timeout
E2B sandboxes can take 10-15 seconds on first run. Check your E2B dashboard for credit balance.

## 📚 Resources

- [E2B Documentation](https://e2b.dev/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers)
- [Laravel 12 Docs](https://laravel.com/docs/12.x)
- [Inertia.js Docs](https://inertiajs.com)

## 📄 License

MIT
