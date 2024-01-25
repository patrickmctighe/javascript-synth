const waveforms = ["sine", "square", "sawtooth", "triangle"];

let noteWidth = 0;
const oscBank = new Array(3)

const waveSlider = document.querySelector(".waveform-slider");
const widthSlider = document.querySelector(".width-slider");

// Add event listener to update noteWidth
widthSlider.addEventListener('input', function() {
    noteWidth = Number(this.value);
});

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
let actx = new (AudioContext || webkitAudioContext)();

const createOscillators = (freq, detune)=> {
    osc = actx.createOscillator();
    osc.type = waveforms[waveSlider.value];
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(actx.destination);
    osc.start();
    return osc;
}

const noteOn = (note)=> {
    const freq = notes[note];
    oscBank[0] = createOscillators(freq, 0);
    oscBank[1] = createOscillators(freq, -noteWidth);
    oscBank[2] = createOscillators(freq, noteWidth);
}

document.querySelectorAll("button[data-note]").forEach((button)=> {
    button.addEventListener("mousedown", function() {
        const note = this.dataset.note;
        if (!actx) throw "Not supported :(";
        noteOn(note);
    })
    button.addEventListener("mouseup", stopSound);
    button.addEventListener("mouseleave", stopSound);
});

function stopSound() {
    oscBank.forEach((osc, index) => {
        if(osc) {
            osc.stop();
            oscBank[index] = null;
        }
    })
}


// }).addEventListener("click", function() {
// const actx = new (AudioContext || webkitAudioContext)();
// if (!actx) throw "Not supported :(";
// const osc = actx.createOscillator();
// const gainNode = actx.createGain();

// const sliderValue = slider.value;
// osc.type = waveforms[sliderValue];


// osc.frequency.value = 440;
// osc.connect(gainNode)
// gainNode.connect(actx.destination);
// gainNode.gain.value =0.1;

// osc.start();
// osc.stop(actx.currentTime + 1);
// });