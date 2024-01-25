


const echo = {
    time,
    feedback,
    maxDuration
}

const oscillator = createOcillator();
oscillator.connect(actx.destination);

const delayNode = actx.createDelay();
delayNode.delayTime.value = echo.time * maxDuration;
delayNode.connect(actx.destination);

const gainNode = actx.createGain();
gainNode.gain.value = echo.feedback;

oscillator.connect(delayNode);
delayNode.connect(gainNode);
gainNode.connect(delayNode);