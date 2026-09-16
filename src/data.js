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

// 14×10 逻辑地形直接按当前 1120×800 底图逐格校准。
// 规则层必须服从画面：房屋=村落、树冠=树林、河面=河流、桥面=木桥、明显土路=道路。
export const YINGCHUAN_TERRAIN = [
  ['v','v','f','f','p','p','p','w','w','p','p','p','f','h'],
  ['v','v','f','f','p','p','p','w','w','p','p','r','f','h'],
  ['f','f','f','p','p','r','r','w','w','p','r','r','f','h'],
  ['f','f','p','p','r','r','r','w','w','r','r','f','f','h'],
  ['f','p','p','r','r','r','r','w','w','r','r','p','f','h'],
  ['p','p','r','r','r','r','r','b','b','r','r','p','f','h'],
  ['p','r','r','r','v','v','f','w','w','p','p','f','f','h'],
  ['r','r','r','p','v','f','f','w','w','p','p','f','h','h'],
  ['r','r','p','p','p','f','f','w','w','p','f','f','h','h'],
  ['p','p','p','p','p','p','f','w','w','p','p','f','h','h'],
];

const u = (id, name, side, cls, x, y, hp, atk, def, mov, minR, maxR, skill, ai='advance') => ({
  id, name, side, cls, x, y, hp, maxHp: hp, atk, def, mov, minR, maxR, ai,
  mp: skill ? 30 : 0, maxMp: skill ? 30 : 0,
  acted: false, moved: false, dead: false,
  skill: skill ? { ...skill, cd: 0 } : null,
});

export const CHAPTER = {
  id: 'yingchuan',
  title: '颍川之战',
  subtitle: '突破黄巾前阵，再击破张宝。曹操阵亡则失败。',
  objective: '突破前阵，击破张宝',
  turnLimit: 18,
  intro: '黄巾军并未死守木桥：桥头只是诱敌前阵，林间与北侧道路另有伏兵。先夺桥、走林地侧翼，或用骑兵沿道路穿插，都能打开战局。',
  units: [
    u('cao','曹操','ally','lord',1,7,128,44,35,4,1,1,{name:'倚天剑势',power:1.65,mp:12,range:1,cdMax:3}),
    u('dun','夏侯惇','ally','cavalry',0,8,146,50,34,5,1,1,{name:'刚烈突击',power:1.55,mp:10,range:1,cdMax:3}),
    u('yuan','夏侯渊','ally','archer',2,8,112,47,28,5,2,3,{name:'穿云箭',power:1.7,mp:14,range:4,cdMax:4}),
    u('ren','曹仁','ally','infantry',1,9,158,40,42,4,1,1,{name:'铁壁反击',power:1.35,mp:10,range:1,cdMax:4}),

    // 桥头前阵会主动压出，不再形成两军隔桥静止对射。
    u('e1','黄巾刀兵','enemy','infantry',9,5,94,33,24,4,1,1,null,'bridge'),
    u('e2','黄巾枪兵','enemy','spear',10,4,102,36,26,4,1,1,null,'bridge'),
    u('e3','黄巾弓手','enemy','archer',11,3,80,36,19,4,2,3,null,'support'),
    // 南侧林地伏兵迫使玩家处理侧翼，不能只站桥西射主将。
    u('e4','黄巾刀兵','enemy','infantry',10,7,92,34,23,4,1,1,null,'flank'),
    u('e5','黄巾弓手','enemy','archer',11,8,82,37,19,4,2,3,null,'support'),
    u('e6','黄巾枪兵','enemy','spear',12,6,100,35,26,4,1,1,null,'flank'),
    // 张宝后置于北侧腹地；普通弓射程无法在桥西直接点杀。
    u('zhangbao','张宝','enemy','boss',12,1,188,49,34,4,1,2,{name:'妖火',power:1.55,mp:99,range:3,cdMax:3},'boss'),
  ],
};

export function cloneChapter() {
  return {
    ...CHAPTER,
    terrain: YINGCHUAN_TERRAIN.map(row => [...row]),
    units: CHAPTER.units.map(unit => ({...unit, skill: unit.skill ? {...unit.skill} : null})),
  };
}
