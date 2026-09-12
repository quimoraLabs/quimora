import { spawn } from 'child_process';
import http from 'http';

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => resolve(res.statusCode < 500));
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function main() {
  const targetUrl = 'http://localhost:5173';
  let serverProcess = null;

  const isRunning = await checkServer(targetUrl);
  if (!isRunning) {
    console.log('🚀 Starting Quimora frontend server...');
    serverProcess = spawn('npm.cmd', ['--prefix', 'frontend', 'run', 'dev'], {
      stdio: 'ignore',
      shell: true,
    });

    // Wait until server responds
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (await checkServer(targetUrl)) {
        ready = true;
        break;
      }
    }
    if (ready) {
      console.log('✅ Frontend server is ready!');
    } else {
      console.log('⚠️ Server takes longer to start, launching Codegen anyway...');
    }
  } else {
    console.log('✅ Frontend server is already running.');
  }

  console.log('🎥 Launching Playwright Codegen...');
  const codegen = spawn('npx.cmd', ['playwright', 'codegen', targetUrl], {
    stdio: 'inherit',
    shell: true,
  });

  codegen.on('exit', (code) => {
    if (serverProcess) {
      console.log('Stopping dev server...');
      serverProcess.kill();
    }
    process.exit(code || 0);
  });
}

main();
