export const COLS = 14;
export const ROWS = 10;

export const TERRAIN = {
  p: { name: '平原', cost: 1, def: 0, evade: 0, passable: true },
  r: { name: '道路', cost: 1, def: 0, evade: 0, passable: true },
  f: { name: '树林', cost: 2, def: 15, evade: 10, passable: true },
  h: { name: '山地', cost: 2, def: 20, evade: 5, passable: true },
  v: { name: '村落', cost: 1, def: 10, evade: 5, passable: true, heal: 10 },
  w: { name: '河流', cost: 99, def: 0, evade: 0, passable: false },
  b: { name: '木桥', cost: 1, def: 0, evade: 0, passable: true },
};

// 仅负责规则映射；美术地图与此矩阵完全分离。
export const YINGCHUAN_TERRAIN = [
  ['v','v','f','f','p','p','p','w','w','p','p','v','f','h'],
  ['f','f','f','p','p','p','p','w','w','p','v','r','f','h'],
  ['f','f','p','p','p','r','p','w','w','p','r','r','f','h'],
  ['f','p','p','p','r','r','r','w','w','r','r','f','f','h'],
  ['p','p','p','r','r','r','r','w','w','r','r','p','f','h'],
  ['p','p','r','r','r','r','r','b','b','r','r','p','f','h'],
  ['p','r','r','r','v','r','p','w','w','p','p','f','f','h'],
  ['r','r','r','p','p','p','p','w','w','p','p','f','h','h'],
  ['r','r','p','p','p','p','p','w','w','p','f','f','h','h'],
  ['p','p','p','p','p','p','p','w','w','p','p','f','h','h'],
];

const u = (id, name, side, cls, x, y, hp, atk, def, mov, minR, maxR, skill) => ({
  id, name, side, cls, x, y, hp, maxHp: hp, atk, def, mov, minR, maxR,
  mp: skill ? 30 : 0, maxMp: skill ? 30 : 0,
  acted: false, moved: false, dead: false,
  skill: skill ? { ...skill, cd: 0 } : null,
});

export const CHAPTER = {
  id: 'yingchuan',
  title: '颍川之战',
  subtitle: '击破张宝，曹操阵亡则失败。',
  objective: '击破张宝',
  turnLimit: 18,
  intro: '黄巾阵势松散，却占据河岸与林地。夏侯渊压制远处弓手，其余诸将稳步推进。',
  units: [
    u('cao','曹操','ally','lord',1,7,128,44,35,4,1,1,{name:'倚天剑势',power:1.65,mp:12,range:1,cdMax:3}),
    u('dun','夏侯惇','ally','cavalry',0,8,146,50,34,5,1,1,{name:'刚烈突击',power:1.55,mp:10,range:1,cdMax:3}),
    u('yuan','夏侯渊','ally','archer',2,8,112,47,28,5,2,4,{name:'穿云箭',power:1.7,mp:14,range:5,cdMax:4}),
    u('ren','曹仁','ally','infantry',1,9,158,40,42,4,1,1,{name:'铁壁反击',power:1.35,mp:10,range:1,cdMax:4}),

    u('e1','黄巾刀兵','enemy','infantry',10,2,86,31,23,4,1,1,null),
    u('e2','黄巾枪兵','enemy','spear',11,3,92,34,24,4,1,1,null),
    u('e3','黄巾弓手','enemy','archer',10,5,74,35,18,4,2,3,null),
    u('e4','黄巾刀兵','enemy','infantry',12,5,88,32,22,4,1,1,null),
    u('e5','黄巾弓手','enemy','archer',11,7,76,36,18,4,2,3,null),
    u('e6','黄巾枪兵','enemy','spear',9,4,94,34,25,4,1,1,null),
    u('zhangbao','张宝','enemy','boss',11,1,168,48,32,4,1,2,{name:'妖火',power:1.55,mp:99,range:3,cdMax:3}),
  ],
};

export function cloneChapter() {
  return {
    ...CHAPTER,
    terrain: YINGCHUAN_TERRAIN.map(row => [...row]),
    units: CHAPTER.units.map(unit => ({...unit, skill: unit.skill ? {...unit.skill} : null})),
  };
}
