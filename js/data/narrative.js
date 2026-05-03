// ============================================================
// NARRATIVE — openers, phrases, sprites, palette
// ============================================================

export const DIG_OPENERS = [
  (n, s) => `<em>${n}</em> returned from ${s}.`,
  (n, s) => `<em>${n}</em> came back from the ${s} this afternoon.`,
  (n, s) => `The ${s} expedition concluded. <em>${n}</em> reported in.`,
  (n, s) => `<em>${n}</em> closed up the dig at ${s} and returned to camp.`,
  (n, s) => `After hours at ${s}, <em>${n}</em> made it back.`,
];

export const FIND_PHRASES = [
  names => `Among the rubble: ${names}.`,
  names => `The finds: ${names}.`,
  names => `Recovered: ${names}.`,
  names => `The day's work yielded ${names}.`,
  names => `Brought back: ${names}.`,
  names => `Catalogued on return: ${names}.`,
];

export const MARKET_OPENERS_WIN = [
  (id, g) => `Won at auction for ${g}g. <span class="lmkt">A sharp bid.</span>`,
  (id, g) => `The lot went to us — ${g}g well spent. <span class="lmkt">[Auction]</span>`,
  (id, g) => `Outbid the rival and claimed it for ${g}g. <span class="lmkt">[Auction]</span>`,
];

export const MARKET_OPENERS_LOSE = [
  r => `The rival paid ${r}g. We walked away empty-handed. <span class="lmkt">[Auction]</span>`,
  r => `Outbid at ${r}g. The lot went elsewhere. <span class="lmkt">[Auction]</span>`,
];

export const GAMBLE_OPENERS = [
  (t, i) => `Opened a ${t}. Inside: a <em>${i}</em>. <span class="lmkt">[Gamble]</span>`,
  (t, i) => `The ${t} yielded a <em>${i}</em>. <span class="lmkt">[Gamble]</span>`,
  (t, i) => `The ${t} contained a <em>${i}</em>. <span class="lmkt">[Gamble]</span>`,
];

// ── Pixel art sprites (8×8, char→PAL key) ─────────────────
export const SPRITES = {
  // Archaeologists
  ada:             ["..FFFF..","FFFFFFFF","FF8888FF",".888888.","..8338..","..BBBB..","..B..B..","........"],
  ben:             ["..CCCC..","CCCCCCCC","CC9966CC",".996699.","..9559..","..AAAA..","..A..A..","........"],
  cora:            ["..6666..","66666666","66C871CC",".C87137.","..C7371.","..EEEE..","..E..E..","........"],
  dev:             ["..2222..","22222222","221111FF",".11FF11.","..1FF1..","..FDDF..","..F..F..","........"],
  elara:           ["..EEEE..","EEEEEEEE","EE1818EE",".181818.",".8.11.8.","..AAAA..","..A..A..","........"],
  // Sites
  roman:           ["........",".EEEEEE.",".E....E.",".EEEEEE.",".CCCCCC.",".C....C.","CCCCCCCC","BBBBBBBB"],
  egypt:           ["....A...","...AAA..","..AAAAA.",".AAAAAAA","AAAAAAAA",".DDDDDD.","..DDDD..","...DD..."],
  jungle:          [".3.3.3.3","33333333",".3.3.3.3","..5555..","..5..5..","..5555..","...55...","...55..."],
  sunken:          ["9.9.9.9.",".9.9.9.9","9.9.9.9.","..8888..",".88..88.","88888888",".888888.","..8888.."],
  monastery:       ["...EE...","..EEEE..","..E..E..","EEEEEEEE",".E....E.","EE....EE","EEEEEEEE","AAAAAAAA"],
  // General items
  shard:           ["........","...EE...","..EEEE..","..EEEE..","...EEE..","....EE..","........","........"],
  coin_ancient:    ["........","..FFFF..",".FFFFFF.",".FF55FF.",".FF55FF.",".FFFFFF.","..FFFF..","........"],
  figurine:        ["...BB...","..BBBB..","..B88B..","..BBBB..","...BB...","..BBBB..",".BB..BB.","........"],
  tablet:          [".AAAAAA.","AAAAAAAA","A.A..A.A","AAAAAAAA","A..AA..A","AAAAAAAA","AAAAAAAA",".AAAAAA."],
  jewel:           ["...CC...","..CCCC..",".CCCCCC.","CC9999CC",".C9999C.","..9999..","...99...","........"],
  scroll:          [".DDDDDD.","DDDDDDD.","D.D.D.DD","D.D.D.DD","D.D.D.DD","DDDDDDD.",".DDDDDD.","........"],
  statue:          ["..FFFF..",".FFFFFF.",".F5FF5F.",".FFFFFF.","..FFFF..",".FF.FF..","FFFFFFFF","FFFFFFFF"],
  crown:           ["F..F..F.","FFFFFFFF","FFFFFFFF","FFFFFFFF","5F5FF5F5","FFFFFFFF","FFFFFFFF","........"],
  // Site exclusives
  fresco:          ["CCCCCCCC","C3C8C3CC","C8383CCC","C3C8C3CC","CCCCCCCC","EEEEEEEE","E......E","EEEEEEEE"],
  amphora:         ["...BB...","..B..B..","..BBBB..",".B....B.",".B....B.","..BBBB..","...BB...","...BB..."],
  scarab:          ["..9999..","999B9B99","9BBBBBB9","B9BBBB9B","B9BBBB9B","9BBBBBB9","..9BB9..","...BB..."],
  idol:            ["..AAAA..","AAAAAAAA","A.A..A.A","AAAAAAAA","..AAAA..","..AAAA..","..AAAA..","..AAAA.."],
  compass:         ["..8888..","88FFFF88","8FF88FF8","8F8..8F8","8F8..8F8","8FF88FF8","88FFFF88","..8888.."],
  astrolabe:       ["...FF...","..F55F..","..5FF5..","F5FFFF5F","F5FFFF5F","..5FF5..","..F55F..","...FF..."],
  illum_page:      ["FFFFFFFF","F5FFFFFF","FF5FFFFF","FFFBFBFF","FF5FFFFF","F5FFFFFF","FFFFFFFF","........"],
  reliquary_cross: ["...A....","..AAA...","...A....","AAAAAAAA","...A....","..AAA...","...A....","........"],
  monks_seal:      ["..8888..","88AAAA88","8A....A8","8A.AA.A8","8A....A8","88AAAA88","..8888..","........"],
  codex_illum:     [".FFFFFF.","FFFFFFFF","F5F55FFF","FFFFFFFF","F5F55FFF","FFFFFFFF","FFFFFFFF",".FFFFFF."],
  // Craftables
  mosaic:          [".AEAEAE.","EAEAEAEA",".AEAEAE.","EAEAEAEA",".AEAEAE.","EAEAEAEA",".AEAEAE.","........"],
  codex:           [".DDDDDD.","DAAAAAAD","DA.DD.AD","DAAAAAAD","DA.DD.AD","DAAAAAAD","DAAAAAAD",".DDDDDD."],
  reliquary:       ["..FFFF..","FC5FF5CF","CFFCCFFC","FC5FF5CF","CFFCCFFC","FFFFFFFF",".FFFFFF.","..FFFF.."],
  reliq_triptych:  ["AFAFAFA.","FAFAFAFA","A.F.F.FA","FFFFFFFF","A.F.F.FA","FAFAFAFA","AFAFAFA.","........"],
  bound_scripture: [".FFFFFF.","FFFFFFFF","F5.5F5FF","FFFFFFFF","F5.5F5FF","FFFFFFFF","FF5FF5FF",".FFFFFF."],
  compendium:      [".DDDDDD.","DAAAFFAD","DA.FF.AD","DAAAFFAD","DA...FAD","DAAAAAAD","DAAAAAAD",".DDDDDD."],
  // Equipment
  brush:           ["....3...","...333..","....3...","....8...","....8...","....8...","....E...","........"],
  sonar:           ["..9.9...","..9...9.","9.....9.","..BBB...",".BBBBB..","..BBB...","...B....","........"],
  camera:          ["........",".AAAAAA.","A.AAAA.A","A.A55A.A","A.AAAA.A",".AAAAAA.","........","........"],
  detector:        ["...F....","...F....","..FFF...","...F....","...F....",".FFFFFF.",".F....F.","FFFFFFFF"],
  drone:           ["3..33..3",".3.33.3.","..3DD3..","..DDDD..","..DDDD..","..3DD3..",".3.33.3.","3..33..3"],
  theodolite:      ["...AA...","..AAAA..","..A..A..","...AA...","..AAAA..",".AAAAAA.","...AA...",".AAAAAA."],
  field_lab:       [".DDDDDD.","D5D5D5DD","DDDDDDDD","D.D..D.D","D......D","DDDDDDDD",".D.DD.D.","........"],
  lidar:           ["..9999..","999F9F99","9F.FF.F9","F9FFFF9F","F9FFFF9F","9F.FF.F9","..9FF9..","...99..."],
  heavy_rig:       ["AAAAAAAA","A.A..A.A","AAAAAAAA","8888888A","8......A","8.AAAA.A","8......A","88888888"],
  chem_kit:        ["...BB...","..B55B..","..B55B..",".BBBBBB.",".B....B.","BB....BB","B.BBBB.B","BBBBBBBB"],
  archive:         [".DDDDDD.","DAAAAAAD","DA.AA.AD","DAAAAAAD","DA.AA.AD","DAAAAAAD","D.DDDD.D",".DDDDDD."],
  magneto:         ["9.....9.","99...99.","9.9.9.9.","..999...","..9.9...","..999...","...9....","...9...."],
  nightvis:        ["........","33....33","333..333",".333333.","..3333..","..3..3..","..3..3..","........"],
  // Back Room
  card_back:       ["8888888A","8B5B5B8A","8B.B.B8A","8585858A","8.8.8.8A","8585858A","8B.B.B8A","8888888A"],
  ticket:          ["AAAAAAAAA","A.....AA","AFFFFF.A","AFBBBFAA","AFBBBFAA","AFFFFFAA","A.....AA","AAAAAAAA"],
  token:           ["..8888..","88FFFF88","8FF88FF8","8F8..8F8","8F8..8F8","8FF88FF8","88FFFF88","..8888.."],
};

export const PAL = {
  '.': 'transparent',
  '1': '#D3D1C7', '2': '#185FA5', '3': '#639922', '4': '#97C459',
  '5': '#EF9F27', '6': '#BA7517', '7': '#D85A30', '8': '#888780',
  '9': '#5DCAA5', 'A': '#B4B2A9', 'B': '#7F77DD', 'C': '#F0997B',
  'D': '#EF9F27', 'E': '#D3D1C7', 'F': '#FAC775',
};
