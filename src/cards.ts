/**
 * Пять карточек про разработку сайтов в эстетике дорогих дашбордов:
 * точечная матрица, тонкие штрихи с подсказкой, концентрические круги, кольцо прогресса, точечные дни.
 */
const html = (s: string) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild as HTMLElement; };
const head = (label: string, tag = '') => `<div class="head"><span class="label">${label}</span>${tag ? `<span class="tag">${tag}</span>` : ''}</div>`;

/* цифры 5×7 из точек */
const GLYPH: Record<string, string[]> = {
  '0': ['01110','10001','10011','10101','11001','10001','01110'], '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'], '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'], '5': ['11111','10000','11110','00001','00001','10001','01110'],
  '6': ['00110','01000','10000','11110','10001','10001','01110'], '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'], '9': ['01110','10001','10001','01111','00001','00010','01100'],
};
const dotDigits = (s: string) => `<span class="dd">${[...s].map((ch) => `<i class="ddg">${GLYPH[ch].map((row) => [...row].map((b) => `<b class="${b === '1' ? 'on' : ''}"></b>`).join('')).join('')}</i>`).join('')}</span>`;

const heights = [3, 5, 4, 7, 6, 9, 5, 8, 10, 7, 11, 9, 12, 10, 13, 11, 14, 12, 15, 13];
const bars = [38, 52, 44, 60, 48, 70, 56, 66, 74, 62, 80, 68, 86, 72, 90, 78, 94, 84, 100, 88, 96, 90];

export function card(i: number): HTMLElement {
  switch (i) {
    case 0: // заявки: точечная матрица-гистограмма и точечная цифра
      return html(`
      <div class="inner white">
        ${head('Заявки', 'неделя')}
        <div class="matrix" aria-hidden>${heights.map((h, k) => `<i class="col" style="--h:${h};--k:${k}">${Array.from({ length: 15 }, (_, r) => `<b class="${r < h ? 'on' : ''}"></b>`).join('')}</i>`).join('')}</div>
        <div class="ddRow">${dotDigits('24')}<span class="ddUnit">за 7 дней<br>после запуска</span></div>
      </div>`);
    case 1: // трафик: тонкие штрихи и белая подсказка
      return html(`
      <div class="inner red">
        ${head('Трафик', 'после редизайна')}
        <div class="spectrum" aria-hidden>
          ${bars.map((h, k) => `<i style="--h:${h}%;--k:${k}"></i>`).join('')}
          <span class="tip"><b>+38%</b> визитов</span>
        </div>
        <p class="caption light">органика растёт без закупки рекламы</p>
      </div>`);
    case 2: // слои: концентрические круги
      return html(`
      <div class="inner white">
        ${head('Слои сайта')}
        <div class="rings" aria-hidden>
          <i class="rg rg4"><span>Запуск</span></i><i class="rg rg3"><span>Контент</span></i><i class="rg rg2"><span>Код</span></i><i class="rg rg1"><span>Дизайн</span></i>
        </div>
      </div>`);
    case 3: // конверсия: кольцо прогресса
      return html(`
      <div class="inner dark">
        ${head('Конверсия')}
        <div class="donut" aria-hidden>
          <svg viewBox="0 0 120 120" fill="none"><circle class="dTrack" cx="60" cy="60" r="52" stroke-width="6" pathLength="100"/><circle class="dFill" cx="60" cy="60" r="52" stroke-width="6" pathLength="100" stroke-linecap="round"/></svg>
          <div class="dNum"><b class="num">4,8%</b><span>в заявку</span></div>
        </div>
        <p class="idea"><span>Было 1,9%.</span> <span class="ideaMute">Та же реклама, новый сайт.</span></p>
      </div>`);
    default: // срок: 14 дней точками
      return html(`
      <div class="inner white">
        ${head('Срок')}
        <div><div class="big num">14 дней</div><p class="caption">от брифа до запуска</p></div>
        <div class="days" aria-hidden>${Array.from({ length: 21 }, (_, k) => `<i class="${k < 14 ? 'on' : ''}" style="--k:${k}"></i>`).join('')}</div>
        <div class="daysLabels"><span>бриф</span><span>запуск · день 14</span></div>
      </div>`);
  }
}
