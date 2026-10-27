/**
 * Кольцо карточек в 3D. Карточки стоят по окружности лицом к центру, кольцо
 * само медленно плывёт, его можно крутить мышью или пальцем. К краям дуги
 * карточки тают: теряют плотность и резкость, задняя половина не рисуется.
 * Радиус считается через синус, так что gap — реальные пиксели между соседями.
 */
export type RingOptions = {
  count: number;
  render: (i: number) => HTMLElement;
  cardWidth?: number; cardHeight?: number; gap?: number;
  speed?: number;    // градусов в секунду
  breath?: number;   // дыхание скорости 0…0.3
  clearArc?: number; // до этого угла карточка чёткая
  haze?: number;     // максимальное размытие на краю, px
  tilt?: number; perspective?: number; draggable?: boolean;
};

export function mountRing(host: HTMLElement, o: RingOptions) {
  const { count, render, cardWidth = 228, cardHeight = 268, gap = 30, speed = 2.2, breath = 0.2, clearArc = 46, haze = 12, tilt = -4, perspective = 2200, draggable = true } = o;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = 360 / Math.max(count, 1);
  const R = Math.round((cardWidth + gap) / (2 * Math.sin(Math.PI / Math.max(count, 2))));

  host.classList.add('ring');
  host.style.height = `${cardHeight + 40}px`;
  host.style.perspective = `${perspective}px`;
  if (!draggable) host.style.cursor = 'default';
  const tiltEl = document.createElement('div'); tiltEl.className = 'ring__tilt'; tiltEl.style.transform = `rotateX(${tilt}deg)`;
  const arc = document.createElement('div'); arc.className = 'ring__arc'; arc.style.width = `${cardWidth}px`; arc.style.height = `${cardHeight}px`;
  tiltEl.append(arc); host.append(tiltEl);

  const cards: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const a = document.createElement('article'); a.className = 'ring__card';
    a.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`;
    a.append(render(i)); arc.append(a); cards.push(a);
  }

  let rot = 0, vel = 0, last = 0, raf = 0, visible = true;
  const grab = { on: false, x: 0 };
  // магнит: после перетаскивания кольцо докручивается до ближайшей карточки и держит паузу
  let snapTarget: number | null = null, holdUntil = 0, dragged = false;
  // звук: еле слышный тик при смене активной карточки, только после первого касания страницы
  let audio: AudioContext | null = null, lastFront = -1;
  const frontIndex = () => { let best = 0, bestTurn = 999; for (let i = 0; i < count; i++) { let f = (rot + i * step) % 360; if (f < 0) f += 360; const t = f > 180 ? 360 - f : f; if (t < bestTurn) { bestTurn = t; best = i; } } return best; };
  const tickSound = () => {
    if (!audio) return;
    const t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 0.07);
  };
  const paint = () => {
    arc.style.transform = `translateZ(${-R}px) rotateY(${rot}deg)`;
    for (let i = 0; i < count; i++) {
      const el = cards[i];
      let facing = (rot + i * step) % 360; if (facing < 0) facing += 360;
      const turn = facing > 180 ? 360 - facing : facing;
      if (turn > 92) { el.style.visibility = 'hidden'; continue; }
      el.style.visibility = 'visible';
      const fade = Math.min(1, Math.max(0, (turn - clearArc) / (92 - clearArc)));
      const soft = fade * fade * (3 - 2 * fade);
      const sink = soft * soft;
      el.style.opacity = String(1 - sink * 0.98);
      el.style.filter = soft > 0.02 ? `blur(${Math.round(soft * haze)}px)` : 'none';
      // анимации внутри карточки живут только в резкой зоне и стартуют заново при входе
      const live = soft < 0.02;
      if (live !== el.hasAttribute('data-live')) el.toggleAttribute('data-live', live);
      el.style.transform = `rotateY(${i * step}deg) translateZ(${R - soft * 50}px)`;
    }
  };
  paint();
  if (reduced) return () => {};

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) last = 0; });
  io.observe(host);
  const tick = (now: number) => {
    if (visible) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
      if (!grab.on) {
        if (Math.abs(vel) > (dragged ? 18 : 0.5)) { rot += vel * dt; vel *= 0.94; } // после касания магнит включается раньше, без долгого доползания
        else if (dragged) { // инерция иссякла: выбираем ближайшую карточку и тянемся к ней
          dragged = false; const i = frontIndex(); let f = (rot + i * step) % 360; if (f < 0) f += 360; if (f > 180) f -= 360; snapTarget = rot - f;
        } else if (snapTarget !== null) {
          const d = snapTarget - rot; rot += d * Math.min(1, dt * 7);
          if (Math.abs(d) < 0.03) { rot = snapTarget; snapTarget = null; holdUntil = now + 2400; }
        } else if (now > holdUntil) rot += speed * (1 + Math.sin(now / 2600) * breath) * dt;
      }
      const fi = frontIndex(); if (fi !== lastFront) { if (lastFront >= 0) tickSound(); lastFront = fi; }
      paint();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  const wake = () => { if (document.visibilityState === 'visible') last = 0; };
  document.addEventListener('visibilitychange', wake);

  const down = (e: PointerEvent) => { if (!draggable) return; host.setPointerCapture?.(e.pointerId); grab.on = true; grab.x = e.clientX; vel = 0; snapTarget = null; dragged = true;
    if (!audio) { try { audio = new AudioContext(); } catch { audio = null; } } if (audio?.state === 'suspended') audio.resume(); };
  const move = (e: PointerEvent) => { if (!grab.on) return; const d = (e.clientX - grab.x) * 0.2; grab.x = e.clientX; rot += d; vel = d * 60; };
  const up = (e: PointerEvent) => { host.releasePointerCapture?.(e.pointerId); grab.on = false; };
  host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move);
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);

  return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', wake); host.replaceChildren(); };
}
