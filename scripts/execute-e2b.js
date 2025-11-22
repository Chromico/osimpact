import { Sandbox } from '@e2b/code-interpreter';

const apiKey = process.env.E2B_API_KEY;
if (!apiKey) {
    console.error(JSON.stringify({ error: 'E2B_API_KEY not set' }));
    process.exit(1);
}

const codeBase64 = process.argv[2];
if (!codeBase64) {
    console.error(JSON.stringify({ error: 'No code provided' }));
    process.exit(1);
}

const code = Buffer.from(codeBase64, 'base64').toString('utf-8');

async function run() {
    let sandbox;
    try {
        sandbox = await Sandbox.create({ apiKey });
        
        const execution = await sandbox.runCode(code);
        
        const result = {
            stdout: execution.logs.stdout,
            stderr: execution.logs.stderr,
            results: execution.results,
            error: execution.error
        };
        
        console.log(JSON.stringify(result));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    } finally {
        if (sandbox && typeof sandbox.kill === 'function') {
            await sandbox.kill();
        }
    }
}

run();
