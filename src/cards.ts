/** Пять живых карточек: ниши, запуски, уведомление, команда, бюджет. В кольце каждая повторяется трижды. */
const faces = ['andrey', 'olga', 'mira', 'danil'].map((n) => `${import.meta.env.BASE_URL}faces/${n}-face.webp`);
const html = (s: string) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild as HTMLElement; };
const head = (label: string, trend = false) => `
  <div class="head"><span class="label">${label}</span>${trend ? '<span class="trend" aria-hidden><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9 9 1M3 1h6v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : ''}</div>`;

const niches = ['Производство', 'Стройка и ремонт', 'Услуги', 'Обучение', 'Товары'];
const channels = ['Яндекс Директ', 'Avito Ads'];

export function card(i: number): HTMLElement {
  switch (i) {
    case 0: return html(`
      <div class="inner white">
        ${head('Ниша')}
        <div class="chips">${niches.map((n, k) => `<span class="chip pop ${k === 0 ? 'chipOn' : ''}" style="animation-delay:${0.3 + k * 0.12}s">${n}</span>`).join('')}</div>
        <div class="chipsBottom">${channels.map((n, k) => `<span class="chip chipDark pop" style="animation-delay:${1 + k * 0.12}s"><i class="dot"></i>${n}</span>`).join('')}</div>
      </div>`);
    case 1: return html(`
      <div class="inner white">
        ${head('Запуски', true)}
        <div>
          <div class="big num">9 <span class="bigMute">из 10</span></div>
          <div class="segs">${Array.from({ length: 10 }, (_, k) => `<i class="${k < 9 ? 'segOn' : 'segOff'}" style="animation-delay:${k * 0.12}s"></i>`).join('')}</div>
          <p class="caption">запусков — заявки в 1-й день</p>
        </div>
      </div>`);
    case 2: return html(`
      <div class="inner red notifWrap">
        <div class="notif">
          <span class="appIcon"><b>П</b></span>
          <div class="notifBody">
            <div class="notifHead"><span class="appName">Поток</span><span>сейчас</span></div>
            <div class="notifTitle">Новая заявка</div>
            <div class="notifText">Игорь, +7 927 ··· — промышленные ворота, Казань</div>
          </div>
        </div>
        <p class="notifUnder">Заявки сразу в CRM или Telegram</p>
      </div>`);
    case 3: return html(`
      <div class="inner dark">
        ${head('Команда')}
        <div class="avatars">${faces.map((f, k) => `<img class="avatar" src="${f}" alt="" style="animation-delay:${k * 0.1}s" draggable="false">`).join('')}</div>
        <p class="idea"><span>Четверо без менеджеров.</span> <span class="ideaMute">Каждый отвечает за своё.</span></p>
      </div>`);
    default: return html(`
      <div class="inner white">
        ${head('Бюджет на рекламу', true)}
        <div><div class="big num">от 2 000 ₽</div><p class="caption">в день</p></div>
        <svg class="area" viewBox="0 0 200 70" fill="none" aria-hidden>
          <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".28"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></linearGradient></defs>
          <path d="M2 58 C 30 52, 50 60, 72 44 S 110 40, 132 28 S 170 24, 198 8 V 70 H 2 Z" fill="url(#ag)"/>
          <path class="areaLine" d="M2 58 C 30 52, 50 60, 72 44 S 110 40, 132 28 S 170 24, 198 8" stroke="#1a1a1c" stroke-width="1.6" stroke-linecap="round"/>
          <circle class="pulse" cx="198" cy="8" r="9" fill="#ff2a2a" opacity=".35"/>
          <circle cx="198" cy="8" r="4" fill="#ff2a2a" stroke="#1a1a1c" stroke-width="1.5"/>
        </svg>
      </div>`);
  }
}
