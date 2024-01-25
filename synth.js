
const waveforms = ["sine", "square", "sawtooth", "triangle"];

const slider = document.querySelector(".waveform-slider");

document.querySelector(".a").addEventListener("click", function() {
const actx = new (AudioContext || webkitAudioContext)();
if (!actx) throw "Not supported :(";
const osc = actx.createOscillator();
const gainNode = actx.createGain();

const sliderValue = slider.value;
osc.type = waveforms[sliderValue];


osc.frequency.value = 440;
osc.connect(gainNode)
gainNode.connect(actx.destination);
gainNode.gain.value =0.1;

osc.start();
osc.stop(actx.currentTime + 1);
});