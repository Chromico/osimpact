import { Sandbox } from 'e2b';
import OpenAI from 'openai';

const {
  E2B_API_KEY,
  OPENAI_API_KEY,
  SSH_HOST,
  SSH_USER,
  SSH_PORT,
  SSH_PRIVATE_KEY,
} = process.env;

if (!E2B_API_KEY || !OPENAI_API_KEY || !SSH_HOST || !SSH_USER || !SSH_PRIVATE_KEY) {
  console.error(JSON.stringify({ 
    error: 'Missing required env vars: E2B_API_KEY, OPENAI_API_KEY, SSH_HOST, SSH_USER, SSH_PRIVATE_KEY' 
  }));
  process.exit(1);
}

const taskDescription = process.argv[2];
const debugFlag = process.argv[3] === '--debug';
if (!taskDescription) {
  console.error(JSON.stringify({
    error: 'Task description required. Usage: node run-ansible-agent.js "install nginx and configure ssl" [--debug]'
  }));
  process.exit(1);
}

async function run() {
  let sbx;
  try {
    // Create E2B sandbox
    sbx = await Sandbox.create({ apiKey: E2B_API_KEY });
    
    const steps = [];
    
    // Step 1: Setup SSH credentials
    steps.push('Setting up SSH credentials...');
    await sbx.commands.run('mkdir -p ~/.ssh && chmod 700 ~/.ssh');
    await sbx.files.write('/home/user/.ssh/id_rsa', SSH_PRIVATE_KEY);
    await sbx.commands.run('chmod 600 ~/.ssh/id_rsa');
    
    // Step 2: Check server status via SSH
    steps.push(`Checking server status at ${SSH_HOST}...`);
    const port = SSH_PORT && String(SSH_PORT).trim() !== '' ? String(SSH_PORT).trim() : '22';
    let statusCmd;
    try {
      const sshDiagnostics = debugFlag ? '-vvv' : '';
      statusCmd = await sbx.commands.run(
        `ssh ${sshDiagnostics} -p ${port} -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} 'uname -a && uptime && df -h && free -h'`,
        { timeoutMs: 30000 }
      );
    } catch (err) {
      console.error(JSON.stringify({
        error: 'SSH status command failed',
        stage: 'ssh_status',
        sshHost: SSH_HOST,
        sshUser: SSH_USER,
        sshPort: port,
        message: err.message,
        suggestions: [
          'Verify the host is reachable and not firewalled',
          'Confirm the SSH user has permissions and the key matches',
          'Ensure the private key is not encrypted with a passphrase (currently unsupported)',
          'Check if a custom port is required and provided',
          'Try adding --debug to enable verbose SSH output'
        ]
      }));
      process.exit(1);
    }

    if (statusCmd.exitCode !== 0) {
      console.error(JSON.stringify({
        error: 'SSH connection failed',
        stage: 'ssh_status',
        sshHost: SSH_HOST,
        sshUser: SSH_USER,
        sshPort: port,
        exitCode: statusCmd.exitCode,
        stderr: statusCmd.stderr,
        stdout: statusCmd.stdout,
        suggestions: [
          'Double-check host/user/port values',
          'Ensure the private key matches the remote authorized_keys',
          'Confirm the key has correct permissions and no passphrase',
          'Test manually from a local terminal: ssh -p PORT USER@HOST',
          'Re-run with --debug for verbose SSH diagnostics'
        ]
      }));
      process.exit(1);
    }

    const serverInfo = statusCmd.stdout;
    steps.push('Server status retrieved successfully');
    
    // Step 3: Use OpenAI to generate Ansible playbook
    steps.push('Generating Ansible playbook with AI...');
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    
    const prompt = `You are a senior DevOps engineer. Generate a complete, production-ready Ansible playbook for the following task:

Task: ${taskDescription}

Server Information:
${serverInfo}

Requirements:
1. Write a complete YAML playbook with proper structure
2. Include all necessary tasks, handlers, and variables
3. Add error handling and idempotency checks
4. Include comments explaining each section
5. Use best practices for Ansible 2.x
6. The playbook should be testable with --check mode

Output ONLY the raw YAML playbook content, no markdown code blocks or explanations.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert DevOps engineer specializing in Ansible automation.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });
    
    let playbook = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    playbook = playbook.replace(/^```ya?ml\n/gm, '').replace(/^```\n?/gm, '');
    
    steps.push('Playbook generated');
    
    // Step 4: Install Ansible in sandbox
    steps.push('Installing Ansible in sandbox...');
    const installAnsible = await sbx.commands.run(
      'pip install --quiet ansible',
      { timeoutMs: 120000 }
    );
    
    if (installAnsible.exitCode !== 0) {
      throw new Error(`Ansible installation failed: ${installAnsible.stderr}`);
    }
    
    steps.push('Ansible installed successfully');
    
    // Step 5: Create inventory file
    await sbx.files.write('/home/user/inventory.ini', `[servers]
  ${SSH_HOST} ansible_user=${SSH_USER} ansible_port=${port} ansible_ssh_private_key_file=~/.ssh/id_rsa ansible_ssh_common_args='-o StrictHostKeyChecking=no'`);
    
    // Step 6: Write playbook to sandbox
    await sbx.files.write('/home/user/playbook.yml', playbook);
    steps.push('Playbook written to sandbox');
    
    // Step 7: Run Ansible in check mode
    steps.push('Running Ansible playbook in check mode...');
    const ansibleRun = await sbx.commands.run(
      'cd /home/user && ansible-playbook -i inventory.ini playbook.yml --check --diff',
      { timeoutMs: 180000 }
    );
    
    const result = {
      success: ansibleRun.exitCode === 0,
      steps,
      serverInfo,
      playbook,
      checkModeOutput: ansibleRun.stdout,
      checkModeErrors: ansibleRun.stderr,
      exitCode: ansibleRun.exitCode,
      debug: debugFlag,
    };
    
    console.log(JSON.stringify(result));
    
  } catch (err) {
    console.error(JSON.stringify({ 
      error: err.message,
      stack: err.stack 
    }));
    process.exit(1);
  } finally {
    if (sbx && typeof sbx.kill === 'function') {
      await sbx.kill();
    }
  }
}

run();
