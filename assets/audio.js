// ASCII Aurora: an original ambient score synthesised live with WebAudio.
// No audio files, no samples, no streamed media. The AudioContext is created
// only when start() is called from the Sound toggle click handler, so nothing
// sounds before a user gesture.
(function () {
  'use strict';

  const MASTER_GAIN = 0.16; // stays at or below 0.2
  const DELAY_TIME = 0.45;
  const DELAY_FEEDBACK = 0.35;
  const DELAY_WET = 0.42;

  // Pad chord roots: A2, F2, C3, G2. Each chord is root, third, fifth, octave.
  const CHORDS = [
    { root: 110.0, intervals: [0, 3, 7, 12] }, // A minor
    { root: 87.31, intervals: [0, 4, 7, 12] }, // F major
    { root: 130.81, intervals: [0, 4, 7, 12] }, // C major
    { root: 98.0, intervals: [0, 4, 7, 12] }, // G major
  ];
  const CHORD_SECONDS = 8;
  const PAD_ATTACK = 2.6;
  const PAD_RELEASE = 3.2;
  const PAD_LEVEL = 0.05;
  const DETUNE_CENTS = [-7, 6];

  // A minor pentatonic (A, C, D, E, G) in octaves 4 and 5.
  const BELL_NOTES = [
    261.63, 293.66, 329.63, 392.0, 440.0,
    523.25, 587.33, 659.26, 783.99, 880.0,
  ];
  const BELL_MIN_S = 2.5;
  const BELL_MAX_S = 6;
  const BELL_LEVEL = 0.07;
  const BELL_DECAY = 3.2;

  let ctx = null;
  let master = null;
  let padBus = null;
  let fxIn = null;
  let running = false;
  let chordIndex = 0;
  let chordTimer = 0;
  let bellTimer = 0;

  function semitone(root, n) {
    return root * Math.pow(2, n / 12);
  }

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('WebAudio AudioContext is not supported');
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);

    // Feedback delay: the liminal space around every tone.
    fxIn = ctx.createGain();
    const delay = ctx.createDelay(2);
    delay.delayTime.value = DELAY_TIME;
    const feedback = ctx.createGain();
    feedback.gain.value = DELAY_FEEDBACK;
    const wet = ctx.createGain();
    wet.gain.value = DELAY_WET;
    fxIn.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);

    // Pads run through one lowpass filter.
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 820;
    lowpass.Q.value = 0.6;
    padBus = ctx.createGain();
    padBus.gain.value = 1;
    padBus.connect(lowpass);
    lowpass.connect(master);
    lowpass.connect(fxIn);
  }

  function playChord(chord, at) {
    const end = at + CHORD_SECONDS + PAD_RELEASE;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(PAD_LEVEL, at + PAD_ATTACK);
    env.gain.setValueAtTime(PAD_LEVEL, at + CHORD_SECONDS);
    env.gain.linearRampToValueAtTime(0, end);
    env.connect(padBus);
    for (const n of chord.intervals) {
      const freq = semitone(chord.root, n);
      for (const cents of DETUNE_CENTS) {
        const osc = ctx.createOscillator();
        osc.type = n === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = cents;
        osc.connect(env);
        osc.start(at);
        osc.stop(end + 0.05);
      }
    }
  }

  function playBell(at) {
    const freq = BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)];
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(BELL_LEVEL, at + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, at + BELL_DECAY);
    env.connect(master);
    env.connect(fxIn);

    const tone = ctx.createOscillator();
    tone.type = 'sine';
    tone.frequency.value = freq;
    const harmonic = ctx.createOscillator();
    harmonic.type = 'sine';
    harmonic.frequency.value = freq * 2.76; // inharmonic partial gives the bell colour
    const harmonicGain = ctx.createGain();
    harmonicGain.gain.value = 0.3;
    tone.connect(env);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(env);
    for (const osc of [tone, harmonic]) {
      osc.start(at);
      osc.stop(at + BELL_DECAY + 0.1);
    }
  }

  // The score runs on its own short timers that schedule ahead on the audio
  // clock; it never touches the animation loop.
  function chordStep() {
    if (!running) return;
    playChord(CHORDS[chordIndex], ctx.currentTime + 0.05);
    chordIndex = (chordIndex + 1) % CHORDS.length;
    chordTimer = setTimeout(chordStep, CHORD_SECONDS * 1000);
  }

  function bellStep() {
    if (!running) return;
    playBell(ctx.currentTime + 0.05);
    const wait = BELL_MIN_S + Math.random() * (BELL_MAX_S - BELL_MIN_S);
    bellTimer = setTimeout(bellStep, wait * 1000);
  }

  function start() {
    if (running) return;
    if (!ctx) build();
    if (ctx.state === 'suspended') ctx.resume();
    running = true;
    chordStep();
    bellTimer = setTimeout(bellStep, 1800);
  }

  function stop() {
    if (!running) return;
    running = false;
    clearTimeout(chordTimer);
    clearTimeout(bellTimer);
    if (ctx) ctx.suspend();
  }

  window.AsciiAuroraAudio = {
    start,
    stop,
    get state() {
      return running ? 'on' : 'off';
    },
  };
})();
