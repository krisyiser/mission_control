const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const os = require('os');

// TARGET_URL should be the deployed Netlify URL
const TARGET_URL = process.argv[2] || 'http://localhost:3000';

function getHardwareInfo() {
  let model = os.hostname();
  let cpu = os.cpus()[0].model;
  let ram = `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`;
  let os_name = `${os.type()} ${os.release()}`;

  try {
    if (process.platform === 'win32') {
      // Windows hardware detection
      const modelInfo = execSync('wmic csproduct get name').toString();
      model = modelInfo.split('\n')[1].trim();
      
      const osInfo = execSync('wmic os get Caption').toString();
      os_name = osInfo.split('\n')[1].trim();
      
      const ramInfo = execSync('wmic computersystem get TotalPhysicalMemory').toString();
      const rawRam = parseInt(ramInfo.split('\n')[1].trim());
      ram = `${Math.round(rawRam / 1024 / 1024 / 1024)}GB`;
    } else if (process.platform === 'darwin') {
      // Mac hardware detection
      const systemProfiler = execSync('system_profiler SPHardwareDataType').toString();
      const modelMatch = systemProfiler.match(/Model Name: (.*)/);
      if (modelMatch) model = modelMatch[1].trim();
      
      const cpuMatch = systemProfiler.match(/Processor Name: (.*)/);
       if (cpuMatch) cpu = cpuMatch[1].trim();

      const osVersion = execSync('sw_vers -productVersion').toString().trim();
      os_name = `macOS ${osVersion}`;
    }
  } catch (err) {
    console.warn('Hardware detection warning:', err.message);
  }

  return {
    id: os.hostname(),
    name: os.hostname(),
    model: model || 'Unknown Device',
    cpu: cpu || 'Unknown CPU',
    ram: ram || 'Unknown RAM',
    os: os_name || 'Unknown OS',
    status: 'online'
  };
}

const data = JSON.stringify(getHardwareInfo());
console.log('--- JOINING FLEET ---');
console.log('Hardware detected:', data);

const urlObj = new URL(`${TARGET_URL}/api/heartbeat`);
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const protocol = urlObj.protocol === 'https:' ? https : http;

const req = protocol.request(urlObj, options, (res) => {
  let responseBody = '';
  res.on('data', (d) => responseBody += d);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ [SUCCESS] Machine registered successfully with specs!');
    } else {
      console.error('❌ [ERROR] Registration failed:', res.statusCode, responseBody);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ [ERROR] Connection error:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
