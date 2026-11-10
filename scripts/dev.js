// Cross-platform local runner to start ParcelTrail backend and frontend concurrently
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function launch(label, prefixDir, scriptName) {
  const child = spawn(npmCmd, ['--prefix', prefixDir, 'run', scriptName], {
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  });

  const printLines = (stream, writeFn) => {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      lines.forEach((line) => writeFn(`[${label}] ${line}\n`));
    });
    stream.on('end', () => {
      if (buffer) writeFn(`[${label}] ${buffer}\n`);
    });
  };

  printLines(child.stdout, (msg) => process.stdout.write(msg));
  printLines(child.stderr, (msg) => process.stderr.write(msg));
  return child;
}

const serverProc = launch('server', 'server', 'dev');
const clientProc = launch('client', 'client', 'dev');

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (!serverProc.killed) serverProc.kill(signal);
  if (!clientProc.killed) clientProc.kill(signal);
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

serverProc.on('exit', (code) => {
  if (!shuttingDown && code && code !== 0) {
    console.error(`[server] exited with code ${code}`);
    shutdown('SIGTERM');
    process.exit(code);
  }
});

clientProc.on('exit', (code) => {
  if (!shuttingDown && code && code !== 0) {
    console.error(`[client] exited with code ${code}`);
    shutdown('SIGTERM');
    process.exit(code);
  }
});
