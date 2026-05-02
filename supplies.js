// ============================================================
// TAB — Collection Log
// ============================================================
import { S }          from '../../engine/state.js';
import { ARCHS }      from '../../data/archs.js';
import { SITES }      from '../../data/sites.js';
import { ITEMS, RARITY_STAMP } from '../../data/items.js';
import { pxImg }      from '../sprites.js';

function fdt(ts) { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }

function card(id, item, log) {
  const found = !!log;
  let hint = '';
  if (!found) {
    if (item.craftable) hint = '<div class="cc-hint">craft in workshop</div>';
    else if (item.sites?.length === 1) {
      const sn = SITES.find(s => s.id === item.sites[0])?.name || item.sites[0];
      hint = `<div class="cc-hint">found at ${sn}</div>`;
    } else if (item.sites?.length > 1) {
      hint = '<div class="cc-hint">found at multiple sites</div>';
    } else {
      hint = '<div class="cc-hint">found at any site</div>';
    }
  }
  return `
    <div class="cc${found ? '' : ' ud'}${item.craftable ? ' cft' : ''}">
      <div style="display:flex;justify-content:center">${pxImg(id, 28)}</div>
      <div class="ccn">${found ? item.name : '???'}</div>
      <div class="ccc">${found ? item.collectionCategory : '—'}</div>
      <div><span class="stamp ${RARITY_STAMP[item.rarity]}">${item.rarity}</span></div>
      <div class="ccf">${found ? 'Found ' + fdt(log.ff) : 'Not yet found'}</div>
      ${hint}
    </div>`;
}

export function renderCollection() {
  const allItems = Object.entries(ITEMS);
  const discovered = Object.keys(S.cl).length;
  const total = allItems.length;

  let h = `
    <div class="invs">
      <div><div class="isv">${discovered}</div><div class="isl">Discovered</div></div>
      <div><div class="isv">${total}</div><div class="isl">Total entries</div></div>
      <div><div class="isv">${Math.round(discovered / total * 100)}%</div><div class="isl">Complete</div></div>
    </div>`;

  // Per-site sections
  SITES.forEach(site => {
    const si = allItems.filter(([, v]) => !v.craftable && v.sites?.includes(site.id));
    if (!si.length) return;
    const foundHere = si.filter(([id]) => S.cl[id]).length;
    const ra = ARCHS.find(a => a.recruitSite === site.id);
    const isRec = ra && S.ra.includes(ra.id);

    h += `
      <div class="clog-section">
        <div class="clog-sh">
          <div class="clog-si">${pxImg(site.id, 24)}</div>
          <div>
            <div class="clog-sn">${site.name}</div>
            <div class="clog-sm">${site.desc}</div>
          </div>
          <div class="clog-sp">${foundHere}/${si.length} found</div>
        </div>
        ${ra && !isRec
          ? `<div class="rh"><div style="filter:grayscale(1);opacity:0.6">${pxImg(ra.id, 20)}</div><div class="rht">Someone is hiding here. Keep digging at the ${site.name}.</div></div>`
          : ra && isRec
            ? `<div class="rh" style="opacity:0.8;border-color:var(--teal)"><div>${pxImg(ra.id, 20)}</div><div class="rht" style="color:var(--teal)">${ra.name} recruited here.</div></div>`
            : ''
        }
        <div class="cg">${si.map(([id, item]) => card(id, item, S.cl[id])).join('')}</div>
      </div>`;
  });

  // General finds
  const gen = allItems.filter(([, v]) => !v.craftable && !v.sites);
  const gf  = gen.filter(([id]) => S.cl[id]).length;
  h += `
    <div class="clog-section">
      <div class="clog-sh">
        <div style="font-size:15px;width:30px;text-align:center;line-height:30px">⛏</div>
        <div><div class="clog-sn">General finds</div><div class="clog-sm">Can appear at any site</div></div>
        <div class="clog-sp">${gf}/${gen.length} found</div>
      </div>
      <div class="cg">${gen.map(([id, item]) => card(id, item, S.cl[id])).join('')}</div>
    </div>`;

  // Workshop
  const cft = allItems.filter(([, v]) => v.craftable);
  const cf  = cft.filter(([id]) => S.cl[id]).length;
  h += `
    <div class="clog-section">
      <div class="clog-sh">
        <div style="font-size:15px;width:30px;text-align:center;line-height:30px">🔨</div>
        <div><div class="clog-sn">Workshop</div><div class="clog-sm">Crafted pieces only</div></div>
        <div class="clog-sp">${cf}/${cft.length} crafted</div>
      </div>
      <div class="cg">${cft.map(([id, item]) => card(id, item, S.cl[id])).join('')}</div>
    </div>`;

  return h;
}
