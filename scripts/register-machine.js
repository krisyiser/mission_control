const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const os = require('os');

// TARGET_URL should be the deployed Netlify URL
const TARGET_URL = process.argv[2] || 'http://localhost:3000';

function getHardwareInfo() {
  let model = 'Unknown Mac';
  let cpu = os.cpus()[0].model;
  let ram = `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`;
  let os_name = `${os.type()} ${os.release()}`;

  try {
    if (process.platform === 'darwin') {
      const systemProfiler = execSync('system_profiler SPHardwareDataType').toString();
      const modelMatch = systemProfiler.match(/Model Name: (.*)/);
      if (modelMatch) model = modelMatch[1].trim();
      
      const osVersion = execSync('sw_vers -productVersion').toString().trim();
      os_name = `macOS ${osVersion}`;
    }
  } catch (err) {
    console.error('Error fetching deep hardware info:', err.message);
  }

  return {
    id: os.hostname(),
    name: os.hostname(),
    model,
    cpu,
    ram,
    os: os_name,
    status: 'online'
  };
}

const data = JSON.stringify(getHardwareInfo());
console.log('Sending Registration to Mission Control:', data);

const urlObj = new URL(`${TARGET_URL}/api/heartbeat`);
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const protocol = urlObj.protocol === 'https:' ? https : http;

const req = protocol.request(urlObj, options, (res) => {
  let responseBody = '';
  res.on('data', (d) => responseBody += d);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Machine registered successfully!');
    } else {
      console.error('❌ Registration failed:', res.statusCode, responseBody);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e.message);
});

req.write(data);
req.end();
