import './style.css';
import { mountRing } from './ring';
import { card } from './cards';

// заголовок: слова всплывают по одному
const lines = [['Заявки', 'с', 'первого', 'дня'], ['от', 'людей,', 'которым', 'нужна', 'ваша', 'услуга']];
document.querySelectorAll<HTMLElement>('.h1 .line').forEach((line, li) => {
  line.replaceChildren(...lines[li].flatMap((w, i) => { const m = document.createElement('span'); m.className = 'mask'; const s = document.createElement('span'); s.className = 'word'; s.textContent = w; s.style.animationDelay = `${0.15 + (li * 4 + i) * 0.06}s`; m.append(s); return [m, document.createTextNode(' ')]; }));
});

const small = matchMedia('(max-width: 768px)').matches;
mountRing(document.getElementById('stage')!, {
  count: 15, // 5 карточек × 3: спереди читаются пять, края тают
  render: (i) => card(i % 5),
  cardWidth: small ? 198 : 228, cardHeight: small ? 236 : 268, gap: small ? 14 : 30,
  speed: 2.2, clearArc: 46, haze: small ? 0 : 12,
});
