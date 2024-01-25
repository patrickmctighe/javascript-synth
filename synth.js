
const waveforms = ["sine", "square", "sawtooth", "triangle"];

const slider = document.querySelector(".waveform-slider");

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

document.querySelectorAll("button[data-note]").forEach((button)=> {
    button.addEventListener("click", function() {
        const note = this.dataset.note;
        const actx = new (AudioContext || webkitAudioContext)();
        if (!actx) throw "Not supported :(";
        const osc = actx.createOscillator();
        const gainNode = actx.createGain();

        osc.type = waveforms[slider.value];
        osc.frequency.value = notes[note];
        osc.connect(gainNode)
        gainNode.connect(actx.destination);
        gainNode.gain.value =0.1;

        osc.start();
        osc.stop(actx.currentTime + 1);
    });})











    
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