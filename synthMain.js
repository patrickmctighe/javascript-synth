

const waveforms = ["sine", "square", "sawtooth", "triangle"];

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
let stageTime = 2;

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

volumeSlider.addEventListener('input', function() {
    gainNode.gain.value = this.value;
    curVolume.innerHTML = this.value;
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
    oscBank.forEach((_, index) => {
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
        const echo = {
            time,
            feedback,
            maxDuration
        };
        const delayNode = actx.createDelay();
        delayNode.delayTime.value = echo.time * maxDuration;
        delayNode.connect(actx.destination);
        const gainNode = actx.createGain();
        gainNode.gain.value = echo.feedback;
        osc.connect(delayNode);
        delayNode.connect(gainNode);
        gainNode.connect(delayNode);
        delayNode.connect(gainNode).connect(actx.destination);
        osc.connect(filter).connect(gainNode).connect(actx.destination);
        console.log('oscillator connected to gain node and destination');

        osc.start();
        console.log('oscillator started');
        gainNode.gain.cancelScheduledValues(actx.currentTime);

        const now = actx.currentTime;
        const atkDuration = ADSR.attack * stageTime;
        const atkEnd = now + atkDuration;
        const decDuration = ADSR.decay * stageTime;
        const susDuration = ADSR.sustain * stageTime;
        const relDuration = ADSR.release * stageTime;

        gainNode.gain.setValueAtTime(0 , now);
        gainNode.gain.linearRampToValueAtTime(1, atkEnd);
        gainNode.gain.linearRampToValueAtTime(ADSR.sustain, atkEnd + decDuration);
        gainNode.gain.linearRampToValueAtTime(0, atkEnd + decDuration + susDuration + relDuration);
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
            
            noteOn(note); // Call noteOn with the frequency
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
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

            // Stop the oscillator after the release phase
            osc.stop(now + releaseTime);
            oscBank[index] = null;
        }
    });
}

console.log(actx.state)