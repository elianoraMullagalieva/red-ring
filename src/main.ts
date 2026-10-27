import './style.css';
import { mountRing } from './ring';
import { card } from './cards';

const small = matchMedia('(max-width: 768px)').matches;
mountRing(document.getElementById('stage')!, {
  count: 15, // 5 карточек × 3: спереди читаются пять, края тают
  render: (i) => card(i % 5),
  cardWidth: small ? 198 : 228, cardHeight: small ? 236 : 268, gap: small ? 14 : 30,
  speed: 2.2, clearArc: 46, haze: small ? 0 : 12,
});
