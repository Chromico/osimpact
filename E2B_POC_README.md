# E2B & OpenAI Integration POC

This proof of concept demonstrates the integration of OpenAI's GPT-4o and E2B's code interpreter sandbox within a Laravel + Inertia + React application.

## Features

- **AI-Powered Code Generation**: Uses OpenAI GPT-4o to generate Python code from natural language prompts
- **Secure Code Execution**: Executes generated code in isolated E2B sandboxes (~150ms startup time)
- **Real-time Results**: Displays execution output with full stdout/stderr capture
- **Modern Stack**: Built with Laravel 12, Inertia.js v2, and React 19

## Architecture

### Backend (Laravel)
- **Controller**: `App\Http\Controllers\Api\CodeExecutionController`
  - Receives user prompts
  - Calls OpenAI API to generate Python code
  - Returns generated code to frontend
  
- **Form Request**: `App\Http\Requests\CodeExecutionRequest`
  - Validates user input (max 1000 characters)
  - Provides custom error messages

- **Route**: `POST /api/execute-code` (authenticated)

### Frontend (React)
- **Component**: `resources/js/pages/dashboard.tsx`
  - User prompt input form
  - OpenAI code generation trigger
  - E2B sandbox execution (client-side)
  - Real-time result display with proper error handling

## Setup Instructions

### 1. Install Dependencies

```bash
# Install PHP dependencies (already done)
composer install

# Install Node.js dependencies
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Add the following to your `.env` file:

```env
# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# E2B API Key (get from https://e2b.dev/dashboard)
VITE_E2B_API_KEY=e2b_...
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Database Migrations

```bash
php artisan migrate
```

### 5. Build Frontend Assets

```bash
# For development
npm run dev

# Or for production
npm run build
```

### 6. Start the Application

```bash
# Option 1: Using PHP's built-in server
php artisan serve

# Option 2: Using Laravel Sail (if configured)
./vendor/bin/sail up
```

## How to Use

1. **Register/Login**: Create an account or log in to access the dashboard
2. **Navigate to Dashboard**: Go to `/dashboard`
3. **Enter a Prompt**: Type a natural language prompt like:
   - "Calculate how many r's are in the word 'strawberry'"
   - "Generate a fibonacci sequence up to 100"
   - "Create a simple bar chart with matplotlib"
4. **Generate Code**: Click "Generate Code with OpenAI"
5. **Execute Code**: Once code is generated, click "Execute in E2B Sandbox"
6. **View Results**: See the execution output in real-time

## API Keys Setup

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy and paste into `.env` as `OPENAI_API_KEY`

### E2B API Key
1. Go to https://e2b.dev/auth/sign-up
2. Sign up for a free account (includes $100 in credits)
3. Navigate to https://e2b.dev/dashboard
4. Copy your API key
5. Paste into `.env` as `VITE_E2B_API_KEY`

## Technical Details

### OpenAI Integration
- **Model**: GPT-4o
- **System Prompt**: Instructs the model to output only executable Python code
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Implementation**: Server-side Laravel HTTP client

### E2B Integration
- **SDK**: `@e2b/code-interpreter` (v2.2.0)
- **Sandbox**: Isolated VM with Python runtime
- **Startup Time**: ~150ms per sandbox
- **Implementation**: Client-side React with async/await
- **Lifecycle**: Create → Execute → Close

### Security
- **Authentication Required**: All endpoints require authenticated users
- **CSRF Protection**: Laravel's built-in CSRF tokens on API calls
- **Isolated Execution**: E2B sandboxes are completely isolated VMs
- **Input Validation**: Laravel Form Request validation
- **Error Handling**: Comprehensive try-catch blocks with user-friendly messages

## Code Flow

```
User Input (Prompt)
    ↓
React Component (dashboard.tsx)
    ↓
POST /api/execute-code
    ↓
CodeExecutionController
    ↓
OpenAI API Call (GPT-4o)
    ↓
Return Generated Code
    ↓
React Component Receives Code
    ↓
User Clicks "Execute"
    ↓
E2B Sandbox.create()
    ↓
sandbox.runCode(generatedCode)
    ↓
Display Results (stdout/stderr)
    ↓
sandbox.close()
```

## Example Prompts to Try

1. **Basic Math**: "Calculate the sum of numbers from 1 to 100"
2. **String Operations**: "Count the vowels in 'Hello World'"
3. **Data Structures**: "Create a list of prime numbers under 50"
4. **File Operations**: "Create a JSON object with sample user data"
5. **Advanced**: "Generate 10 random numbers and calculate their mean and standard deviation"

## Troubleshooting

### Issue: "E2B API key not configured"
**Solution**: Ensure `VITE_E2B_API_KEY` is set in `.env` and you've rebuilt assets with `npm run build` or restarted `npm run dev`

### Issue: "Failed to generate code from OpenAI"
**Solution**: 
- Check that `OPENAI_API_KEY` is correctly set in `.env`
- Verify your OpenAI account has available credits
- Check Laravel logs: `tail -f storage/logs/laravel.log`

### Issue: Code execution hangs
**Solution**:
- Check E2B dashboard for sandbox status
- Verify your E2B account has available credits
- Check browser console for JavaScript errors

### Issue: CSRF token mismatch
**Solution**: Ensure the CSRF meta tag is present in `resources/views/app.blade.php`

## Testing

Run the test suite:

```bash
# Run all tests
php artisan test

# Run specific test file (when created)
php artisan test tests/Feature/CodeExecutionTest.php
```

## Extending the POC

### Add More LLM Providers
- Anthropic Claude
- Google Gemini
- Mistral
- Local models via Ollama

### Enhanced Features
- Save execution history
- Share code snippets
- Support multiple programming languages
- File upload/download from sandbox
- Persistent sandboxes for multi-step workflows
- Real-time streaming of execution logs

### Production Considerations
- Rate limiting on API endpoints
- Queue long-running executions
- Sandbox timeout configuration
- Cost monitoring and alerts
- User quotas for API usage

## Resources

- [E2B Documentation](https://e2b.dev/docs)
- [E2B GitHub](https://github.com/e2b-dev)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)

## License

This POC is built on Laravel (MIT License) and uses E2B and OpenAI APIs which have their own terms of service.
