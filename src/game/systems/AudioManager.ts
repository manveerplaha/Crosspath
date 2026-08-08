/**
 * Every sound in this project is synthesized at runtime with the Web Audio
 * API, so the game works with zero binary asset dependencies. Drop real
 * .mp3/.ogg files into /public/audio and swap the methods below for
 * <audio>/Phaser.Sound calls if you want authored music instead.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientNodes: { stop: () => void } | null = null;
  muted = false;

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  private tone(freq: number, duration: number, type: OscillatorType = "sine", gainPeak = 0.08, delay = 0) {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.02);
  }

  hop() {
    this.tone(420, 0.08, "square", 0.05);
  }

  coin() {
    this.tone(880, 0.09, "triangle", 0.07);
    this.tone(1320, 0.12, "triangle", 0.06, 0.05);
  }

  unlock() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.22, "sine", 0.07, i * 0.09));
  }

  crash() {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  }

  startAmbient() {
    const ctx = this.ensureCtx();
    if (!ctx || this.ambientNodes) return;
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.035;
    master.connect(ctx.destination);

    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 110;
    const drone2 = ctx.createOscillator();
    drone2.type = "sine";
    drone2.frequency.value = 165;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(master.gain);

    drone.connect(master);
    drone2.connect(master);
    drone.start();
    drone2.start();
    lfo.start();

    this.ambientNodes = {
      stop: () => {
        drone.stop();
        drone2.stop();
        lfo.stop();
      },
    };
  }

  stopAmbient() {
    this.ambientNodes?.stop();
    this.ambientNodes = null;
  }
}

export const audioManager = new AudioManager();
