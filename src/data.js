export const COLS = 28;
export const ROWS = 20;

export const TERRAIN = {
  p: { name: '平原', cost: 1, def: 0, evade: 0, passable: true },
  r: { name: '道路', cost: 1, def: 0, evade: 0, passable: true },
  f: { name: '树林', cost: 2, def: 15, evade: 10, passable: true },
  h: { name: '山岩林地', cost: 99, def: 20, evade: 5, passable: false },
  v: { name: '村落', cost: 1, def: 10, evade: 5, passable: true, heal: 10 },
  w: { name: '河流', cost: 99, def: 0, evade: 0, passable: false },
  b: { name: '木桥', cost: 1, def: 0, evade: 0, passable: true },
};

// Stage 11 HQ 原图为 1120×800。逻辑棋盘改为 28×20，恰好每格 40×40，
// 让道路、树林、村落、河流与桥面按地图原生视觉颗粒对应，而不是旧版 80×80 粗格硬套。
const ROWS_28 = [
  'rfhhhhfpfpppfpwwwwpfffrrrpph',
  'vvvvhhpfrrrrppwwwwpfrpfrrfhh',
  'vvvvppphpprppffwwwpfrfvvvvfp',
  'pprpffhhfhfrrpfwwwprrfvvvvff',
  'fpffpfhhhhhprrfwwwppprfrvvpr',
  'hfhhfhffhhhprffwwwwpfrrprrrp',
  'hhhfhhppffffrfpwwwwpprprrrpr',
  'ffhfhhhrpprrppfwwwwpfrrpffhf',
  'hfffhhhprprrpfpwwwwprrffffhh',
  'fhfrfffprrrrrrpbbbbbrphfhhhf',
  'fhhhfhprffprrrpbbbbbrrrppphp',
  'phhhhhhprprrpfpwwwpppprrrfpf',
  'rpppphhfrrpppffwwwwpfrrffhpp',
  'ffrrffprrpvvvvpwwwwfrfphhfpf',
  'fhfrrrrrrpvvvvppwwwpfphhhppp',
  'fhhprrrprrrvvfppwwwprfhhhpph',
  'hhfrrrffrrpppfhwwwwpfpffffpf',
  'hfrrrpprrrrpffpwwwwppprffppf',
  'fppfppfffprrpfpwwwwpfffffffh',
  'hhhhhhhhhprpffpwwwwppfffppph',
];

export const YINGCHUAN_TERRAIN = ROWS_28.map((row, y) => {
  if (row.length !== COLS) throw new Error(`Terrain row ${y} has ${row.length} cells`);
  return [...row];
});

const u = (id, name, side, cls, x, y, hp, atk, def, mov, minR, maxR, skill, ai = null) => ({
  id, name, side, cls, x, y, hp, maxHp: hp, atk, def, mov, minR, maxR,
  mp: skill ? (skill.maxMp ?? 30) : 0,
  maxMp: skill ? (skill.maxMp ?? 30) : 0,
  acted: false, moved: false, dead: false,
  skill: skill ? { ...skill, cd: 0 } : null,
  ai: ai ? { ...ai } : null,
});

export const CHAPTER = {
  id: 'yingchuan',
  title: '颍川之战',
  subtitle: '突破河桥防线，击破驻守东岸营地的张宝。曹操阵亡则失败。',
  objective: '击破张宝',
  turnLimit: 18,
  intro: '黄巾军并未全部压在桥头：枪兵守桥，弓手据后，骑兵留作预备队，张宝本人驻守东岸村落。先夺桥头，再防反冲。',
  units: [
    u('cao','曹操','ally','lord',5,17,132,45,36,8,1,1,{name:'倚天剑势',power:1.65,mp:12,range:2,cdMax:3,maxMp:36}),
    u('dun','夏侯惇','ally','cavalry',3,16,150,52,35,10,1,1,{name:'刚烈突击',power:1.6,mp:10,range:1,cdMax:3,maxMp:30}),
    u('yuan','夏侯渊','ally','archer',6,18,116,48,28,9,4,7,{name:'穿云箭',power:1.72,mp:14,range:8,cdMax:4,maxMp:34}),
    u('ren','曹仁','ally','infantry',7,17,164,41,44,8,1,1,{name:'铁壁反击',power:1.38,mp:10,range:1,cdMax:4,maxMp:30}),

    u('e1','黄巾枪兵','enemy','spear',20,10,96,35,25,7,1,1,null,{role:'guard',anchorX:20,anchorY:10,leash:5,wakeDist:7}),
    u('e2','黄巾刀兵','enemy','infantry',21,9,92,34,24,7,1,1,null,{role:'guard',anchorX:21,anchorY:9,leash:5,wakeDist:7}),
    u('e3','黄巾弓手','enemy','archer',23,7,78,37,19,6,4,6,null,{role:'ranged',anchorX:23,anchorY:7,leash:7,wakeTurn:3}),
    u('e4','黄巾枪兵','enemy','spear',24,10,100,36,26,7,1,1,null,{role:'guard',anchorX:24,anchorY:10,leash:6,wakeDist:8}),
    u('e5','黄巾弓手','enemy','archer',25,6,80,38,19,6,4,6,null,{role:'ranged',anchorX:25,anchorY:6,leash:7,wakeTurn:4}),
    u('e6','黄巾骑兵','enemy','cavalry',24,12,112,40,27,9,1,1,null,{role:'reserve',anchorX:24,anchorY:12,leash:9,wakeTurn:5}),
    u('zhangbao','张宝','enemy','boss',24,3,188,49,33,6,3,5,{name:'妖火',power:1.58,mp:0,range:6,cdMax:3,maxMp:99},{role:'boss',anchorX:24,anchorY:3,leash:6,wakeTurn:8}),
  ],
};

export function cloneChapter() {
  return {
    ...CHAPTER,
    terrain: YINGCHUAN_TERRAIN.map(row => [...row]),
    units: CHAPTER.units.map(unit => ({
      ...unit,
      skill: unit.skill ? {...unit.skill} : null,
      ai: unit.ai ? {...unit.ai} : null,
    })),
  };
}
