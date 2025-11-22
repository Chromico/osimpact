# Quick Start Guide - GitHub MCP + E2B

This is a streamlined version of the E2B Hackathon project, focused solely on the GitHub MCP integration. The Ansible automation features have been removed for simplicity.

## What This Does

Creates GitHub repositories using an AI agent running in an E2B sandbox with MCP (Model Context Protocol) integration.

**User Flow:**
1. User enters repo name + description
2. Laravel spawns E2B sandbox with GitHub MCP
3. OpenAI agent creates the repository
4. Results displayed in React UI

## Prerequisites

- GitHub account
- E2B account (free tier available)
- OpenAI API access
- PHP 8.4+, Node.js 18+

## 5-Minute Setup

### 1. Get API Keys

**E2B API Key:**
- Go to [e2b.dev/dashboard](https://e2b.dev/dashboard)
- Sign up / log in
- Copy your API key

**OpenAI API Key:**
- Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Create a new API key
- Copy it

**GitHub Personal Access Token:**
- Go to [github.com/settings/tokens](https://github.com/settings/tokens)
- Click "Generate new token" → "Generate new token (classic)"
- Select scopes: `repo` (all checkboxes under it)
- Click "Generate token"
- Copy the token (you won't see it again!)

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your favorite editor
```

Add these lines to `.env`:

```env
OPENAI_API_KEY=sk-proj-...your-key...
E2B_API_KEY=e2b_...your-key...
GITHUB_TOKEN=ghp_...your-token...
GITHUB_OWNER=your-github-username
```

### 3. Install & Run

```bash
# Install dependencies
composer install
npm install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Build frontend
npm run build

# Start server
php artisan serve
```

Visit `http://localhost:8000`

## Testing It Out

1. Register an account or log in
2. Go to "Dashboard"
3. Enter a repository name (e.g., `test-mcp-repo-${Date.now()}`)
4. Click "Create Repository"
5. Wait 5-15 seconds
6. Check your GitHub profile - the repo should be there!

## What Changed from Original

**Removed:**
- Python code execution feature
- Ansible automation agent
- SSH connectivity features
- All Ansible-related UI components

**Kept:**
- GitHub MCP integration (the core feature)
- E2B sandbox execution
- OpenAI agent with MCP tools
- Clean, modern UI with Shadcn components

**Improved:**
- Simplified dashboard UI
- Clearer user flow
- Better error messages
- Updated documentation

## Common Issues

### "Missing credentials"
You forgot to set one of the API keys in `.env`. Check all three are present:
- `OPENAI_API_KEY`
- `E2B_API_KEY`
- `GITHUB_TOKEN`

### "Repository already exists"
The repo name must be unique. Try adding a timestamp or number to the name.

### "GitHub token invalid"
Make sure your GitHub PAT has the `repo` scope enabled.

## Next Steps

Once you've tested the basic flow, try:

1. **Modify the agent prompt** in `scripts/run-agent-mcp.js` to:
   - Add a LICENSE file
   - Create initial project structure
   - Add GitHub Actions workflows
   - Configure branch protection rules

2. **Extend the UI** to support:
   - Private vs public repo selection
   - Custom README templates
   - Multiple files in initial commit
   - Organization repositories

3. **Add more MCP servers**:
   - SSH MCP for server management
   - Filesystem MCP for file operations
   - Custom MCP servers for your tools

## File Structure

```
app/
  Http/
    Controllers/
      Api/
        CodeExecutionController.php  ← Main backend logic
scripts/
  run-agent-mcp.js                   ← E2B + MCP integration
resources/
  js/
    pages/
      dashboard.tsx                  ← React UI
routes/
  web.php                            ← API routes
```

## Architecture Diagram

```
┌──────────────────┐
│   User Browser   │
│   (React UI)     │
└────────┬─────────┘
         │ POST /api/agent/run
         ▼
┌──────────────────────────────┐
│   Laravel Controller         │
│   - Validates input          │
│   - Gets API keys from .env  │
└────────┬─────────────────────┘
         │ Spawns Node process
         ▼
┌──────────────────────────────┐
│   Node.js Script             │
│   (run-agent-mcp.js)         │
└────────┬─────────────────────┘
         │ E2B SDK
         ▼
┌──────────────────────────────┐
│   E2B Sandbox                │
│   ┌────────────────────────┐ │
│   │  GitHub MCP Server     │ │
│   │  (Official Tools)      │ │
│   └────────────────────────┘ │
│   ┌────────────────────────┐ │
│   │  OpenAI Agent          │ │
│   │  (GPT-4o-mini)         │ │
│   │  Uses MCP tools →      │ │
│   └────────────────────────┘ │
└────────┬─────────────────────┘
         │ MCP Protocol
         ▼
┌──────────────────────────────┐
│   GitHub API                 │
│   - Creates repository       │
│   - Adds README              │
│   - Enables Issues           │
└────────┬─────────────────────┘
         │ Success response
         ▼
      [New Repo Created! 🎉]
```

## Pro Tips

1. **Use unique names**: Add timestamps to avoid conflicts:
   ```javascript
   const name = `my-repo-${Date.now()}`;
   ```

2. **Check E2B credits**: Free tier has limits. Monitor usage at [e2b.dev/dashboard](https://e2b.dev/dashboard)

3. **Log everything**: Check Laravel logs for debugging:
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Test locally first**: Use a test GitHub account before deploying to production

5. **Rate limits**: GitHub API has rate limits. Implement exponential backoff for production use.

## Support

- E2B Discord: [discord.gg/35NF4Y8WSE](https://discord.gg/35NF4Y8WSE)
- GitHub Issues: Create an issue in this repo
- Laravel Docs: [laravel.com/docs](https://laravel.com/docs)

Happy coding! 🚀
