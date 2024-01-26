

const waveforms = ["sine", "square", "sawtooth", "triangle"];

let echo = {
    feedback: 0.5, // default value
    time: 0.5, // default value
    maxDuration: 1 // default value
};

let noteWidth = 0;
const oscBank = new Array(3).fill(null);

const volumeSlider = document.querySelector(".volume-slider");
const waveSlider = document.querySelector(".waveform-slider");
const widthSlider = document.querySelector(".width-slider");
const attackSlider = document.querySelector(".attack-slider");
const decaySlider = document.querySelector(".decay-slider");
const sustainSlider = document.querySelector(".sustain-slider");
const releaseSlider = document.querySelector(".release-slider");
const frequencySlider = document.querySelector(".frequency-slider");
const qSlider = document.querySelector(".q-slider");
const timeSlider = document.querySelector(".time-slider");
const feedbackSlider = document.querySelector(".feedback-slider");
const maxDurationSlider = document.querySelector(".maxDuration-slider");


let curVolume = document.querySelector(".volume-value");
let curWave = document.querySelector(".wave-value");
let curWidth = document.querySelector(".width-value");
let curAttack = document.querySelector(".attack-value");
let curDecay = document.querySelector(".decay-value");
let curSustain = document.querySelector(".sustain-value");
let curRelease = document.querySelector(".release-value");
let curFrequency = document.querySelector(".frq-value");
let curQ = document.querySelector(".q-value");
let curTime = document.querySelector(".time-value");
let curFeedback = document.querySelector(".feedback-value");
let curMaxDuration = document.querySelector(".maxDuration-value");


let attack = attackSlider.value;
let decay = decaySlider.value;
let sustain = sustainSlider.value;
let release = releaseSlider.value;
const ADSR = {attack, decay, sustain, release};
let stageTime = 10;

let time = parseFloat(timeSlider.value);
let feedback = parseFloat(feedbackSlider.value);
let maxDuration = parseFloat(maxDurationSlider.value);

const notes = {
    "c-4":261.626,
    "d-4":293.665,
    "e-4":329.628,
    "f-4":349.228,
    "g-4":391.995,
    "a-4":440.000,
    "b-4":493.883,
    "c-5":523.251,
    "c#4":277.183,
    "d#4":311.127,
    "f#4":369.994,
    "g#4":415.305,
    "a#4":466.164
}

const keyNoteMap = {
    'a': 'c-4',
    's': 'd-4',
    'd': 'e-4',
    'f': 'f-4',
    'z': 'g-4',
    'x': 'a-4',
    'c': 'b-4',
    'v': 'c-5',
    'q': 'c#4',
    'w': 'd#4',
    'e': 'f#4',
    'r': 'g#4',
    't': 'a#4'


};

// Keep track of which keys are currently being pressed
const keysBeingPressed = {};
console.log('keysBeingPressed:', keysBeingPressed);

// Listen for keydown events
window.addEventListener('keydown', function(event) {
    const note = keyNoteMap[event.key];
    if (note && !keysBeingPressed[event.key]) {
        // This key was not already being pressed, so start the sound
        keysBeingPressed[event.key] = true;
        const button = document.querySelector(`button[data-note="${note}"]`);
        if (button) {
            button.dispatchEvent(new Event('mousedown'));
        }
    }
});

// Listen for keyup events
window.addEventListener('keyup', function(event) {
    const note = keyNoteMap[event.key];
    if (note) {
        // This key is no longer being pressed, so stop the sound
        keysBeingPressed[event.key] = false;
        const button = document.querySelector(`button[data-note="${note}"]`);
        if (button) {
            button.dispatchEvent(new Event('mouseup'));
        }
    }
});

let osc;
let actx;
try {
    actx = new (AudioContext || webkitAudioContext)();
    if (!actx) {
        throw "Web Audio API not supported :(";
    }
} catch (error) {
    console.error(error);
}

let gainNode = actx.createGain();

volumeSlider.addEventListener('input', function () {
    const maxVolume = parseFloat(volumeSlider.max);
    const volume = parseFloat(this.value) / maxVolume;
    gainNode.gain.value = volume;
    console.log('New gain value:', gainNode.gain.value);
});

waveSlider.addEventListener('input', function() {
    curWave.innerHTML = waveforms[this.value];
    oscBank.forEach(oscillator => {
        if (oscillator) {
            oscillator.type = waveforms[this.value];
        }
    });
});

widthSlider.addEventListener('input', function() {
    noteWidth = Number(this.value);
    curWidth.innerHTML = this.value;
});


attackSlider.addEventListener('input', function() {
    ADSR.attack = parseFloat(this.value);
   curAttack.innerHTML = this.value;
});
decaySlider.addEventListener('input', function() {
    ADSR.decay = parseFloat(this.value);
    curDecay.innerHTML = this.value;
});
sustainSlider.addEventListener('input', function() {
    ADSR.sustain = parseFloat(this.value);
    curSustain.innerHTML = this.value;
});
releaseSlider.addEventListener('input', function() {
    ADSR.release = parseFloat(this.value);
    curRelease.innerHTML = this.value;
});

frequencySlider.addEventListener('input', function() {
   
    curFrequency.innerHTML = this.value;
});
qSlider.addEventListener('input', function() {
    curQ.innerHTML = this.value;
});
timeSlider.addEventListener('input', function() {
    time = parseFloat(this.value);
    curTime.innerHTML = this.value;
});
feedbackSlider.addEventListener('input', function() {
    feedback = parseFloat(this.value);
    curFeedback.innerHTML = this.value;
});
maxDurationSlider.addEventListener('input', function() {
    maxDuration = parseFloat(this.value);
    curMaxDuration.innerHTML = this.value;
});

const noteOn = (note) => {
    console.log('noteOn function called');
    const freq = notes[note];
    const detuneValues = [0, -noteWidth, noteWidth];

    console.log('oscBank:', oscBank);
    oscBank.forEach((oscillator, index) => {
        if (oscillator) {
            // Stop the previous oscillator before creating a new one
            oscillator.stop();
            oscillator.disconnect();
        }

        const osc = actx.createOscillator();
        console.log('waveSlider.value:', waveSlider.value);
        osc.type = waveforms[waveSlider.value];
        console.log('freq:', freq);
        osc.frequency.value = freq;
        console.log('detune:', detuneValues[index]);
        osc.detune.value = detuneValues[index];

        const maxFilterFreq = actx.sampleRate / 2;
        const filter = actx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = frequencySlider.value * maxFilterFreq;
        filter.Q.value = qSlider.value * 30;

        const delayNode = actx.createDelay();
        delayNode.delayTime.value = echo.time * maxDuration;

        osc.connect(filter);
        filter.connect(gainNode);

        if (feedback > 0) {
            const feedbackGainNode = actx.createGain();
            const maxFeedbackVolume = gainNode.gain.value * volumeSlider.value;
            feedbackGainNode.gain.value = feedback * maxFeedbackVolume;

            filter.connect(feedbackGainNode);
            feedbackGainNode.connect(delayNode);
            feedbackGainNode.connect(actx.destination);
            delayNode.connect(feedbackGainNode);
        } else {
            filter.connect(delayNode);
            delayNode.connect(actx.destination);
        }

        console.log('oscillator connected to filter, feedbackGainNode, and destination');
        osc.start();
        console.log('oscillator started');
        gainNode.gain.cancelScheduledValues(actx.currentTime);

        const now = actx.currentTime;
        const atkDuration = ADSR.attack * stageTime;
        const atkEnd = now + atkDuration;
        const decDuration = ADSR.decay * stageTime;
        const decEnd = atkEnd + decDuration;
        const susDuration = ADSR.sustain * stageTime;
        const susEnd = decEnd + susDuration;
        const relDuration = ADSR.release * stageTime;
        
        const volume = gainNode.gain.value * volumeSlider.value;
        
        // Apply the volume only once outside the loop
        if (index === 0) {
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, atkEnd);
            gainNode.gain.linearRampToValueAtTime(ADSR.sustain * volume, decEnd);
            gainNode.gain.linearRampToValueAtTime(0, susEnd + relDuration);
        }

        console.log('ADSR values applied to gain node');
        oscBank[index] = osc;
    });
}
document.querySelectorAll("button[data-note]").forEach((button) => {
    button.addEventListener("mousedown", function () {
        console.log('mousedown event triggered');
        const note = this.dataset.note;
        if (!actx) throw "Not supported :(";
        
        actx.resume().then(() => {
            
            noteOn(note); 
            console.log(notes[note]);
            console.log(actx.state)
        });
    });

    button.addEventListener("mouseup", stopSound);
    button.addEventListener("mouseleave", stopSound);
});

function stopSound() {
    const now = actx.currentTime;
    const releaseTime = 0.5; // time in seconds for the sound to decay

    oscBank.forEach((osc, index) => {
        if(osc) {
            // Start the release phase
            const releaseEnd = now + releaseTime;
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0.001, releaseEnd);

            // Stop the oscillator after the release phase
            osc.stop(releaseEnd);
            oscBank[index] = null;
        }
    });
}

console.log(actx.state)