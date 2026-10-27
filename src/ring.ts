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
        if (Math.abs(vel) > 0.5) { rot += vel * dt; vel *= 0.94; }
        else rot += speed * (1 + Math.sin(now / 2600) * breath) * dt;
      }
      paint();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  const wake = () => { if (document.visibilityState === 'visible') last = 0; };
  document.addEventListener('visibilitychange', wake);

  const down = (e: PointerEvent) => { if (!draggable) return; host.setPointerCapture?.(e.pointerId); grab.on = true; grab.x = e.clientX; vel = 0; };
  const move = (e: PointerEvent) => { if (!grab.on) return; const d = (e.clientX - grab.x) * 0.2; grab.x = e.clientX; rot += d; vel = d * 60; };
  const up = (e: PointerEvent) => { host.releasePointerCapture?.(e.pointerId); grab.on = false; };
  host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move);
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);

  return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', wake); host.replaceChildren(); };
}
