#!/usr/bin/env node

const { spawn } = require('child_process')
const electron = require('electron')
const path = require('path')

const appPath = path.join(__dirname, 'main.js')
const args = [appPath].concat(process.argv.slice(2))
const proc = spawn(electron, args, { stdio: 'inherit' })

proc.on('close', (code) => process.exit(code))


#!/usr/bin / env node

const { exec, spawn } = require('child_process');
exec('/Users/jkuruvilla/rms/miu-tools/scripts/jenkins_opentunnel.sh', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});