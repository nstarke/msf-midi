# WARNING: This project didn't end up working because of how long it takes Metasploit to generate the exploit traffic to send over the wire.  It takes long enough that this can't really be used for musical applications.  As such, I am archiving this repo.

Check out [https://github.com/nstarke/nsa-midi](https://github.com/nstarke/nsa-midi) instead!

# MSF-MIDI
This repository contains a NodeJS Command Line Application that maps MIDI Notes to randomly selected Metasploit Framework exploit modules and then executes those metasploit modules when the associated MIDI note is received from a MIDI device.

## Why?
I built this application to work with [https://lectronz.com/products/thensaselector](https://lectronz.com/products/thensaselector), which is a Eurorack module that converts network traffic to audio.  

## Configuration
You will need to install the Metasploit Framework: [https://docs.metasploit.com/docs/using-metasploit/getting-started/nightly-installers.html](https://docs.metasploit.com/docs/using-metasploit/getting-started/nightly-installers.html)

After MSF is installed, you will need to start the `msfrpc` daemon.  I included a small shell script to do this for you: `bash run-msfrpcd.sh`

On Linux Systems, you will need `alsa-utils` installed:

```
sudo apt install alsa-utils
```

## Arguments
* `--start` - The MIDI Note to start at for the map.  For example, `48` will start at `C3`
* `--length` - The number of MIDI Notes to map to exploits.  For example, setting this to 3 with `--start` being `48` will map notes `48`, `49`, `50` to random exploits.
* `--device` - The MIDI Device to use.  You can see a list of MIDI inputs by running the application in `DEBUG` mode, or by running `aconnect -l` at the Linux Command Line.
* `--targetHost` - The host to run the random exploits against.
* `--targetPort` - The port on the target host to run the random exploits against.
* `--useList` - A file path to a list of exploits to use, if you only want to select from a predefined list of exploits.

## Debug Mode
To enable DEBUG mode, which provides verbose output logging, set a process environment variable for `DEBUG`.

For example:
```
DEBUG=1 node index.js --start 60 --length 10 --device 'USB MIDI Device' --targetHost $TARGET_HOST --targetPort $TARGET_PORT
```

## Notes
The port on the target host will need to be open for the traffic to actually go over the wire and thus create sound on the NSA Selector.
