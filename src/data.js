export const U={
 cao:{n:'曹操',f:'wei',c:'lord',cn:'群雄',s:'cao',w:'剑',r:[1,1],m:4,h:128,p:48,a:44,d:35,i:47,g:39,sk:{n:'倚天剑势',mp:14,cd:3,r:[1,1],pow:1.65,k:'strike',t:'强力斩击，并使目标攻击下降 1 回合。'}},
 dun:{n:'夏侯惇',f:'wei',c:'cavalry',cn:'骑兵',s:'dun',w:'枪',r:[1,1],m:6,h:146,p:30,a:52,d:39,i:20,g:36,sk:{n:'刚烈突击',mp:12,cd:3,r:[1,2],pow:1.5,k:'charge',t:'突击最多 2 格，对步兵额外增伤。'}},
 yuan:{n:'夏侯渊',f:'wei',c:'mountedArcher',cn:'弓骑兵',s:'yuan',w:'弓',r:[2,4],m:6,h:118,p:36,a:47,d:30,i:26,g:48,sk:{n:'穿云箭',mp:15,cd:4,r:[3,5],pow:1.75,k:'arrow',t:'远距离强射，不受近战反击。'}},
 ren:{n:'曹仁',f:'wei',c:'infantry',cn:'重步兵',s:'ren',w:'盾枪',r:[1,1],m:4,h:154,p:32,a:41,d:49,i:22,g:26,sk:{n:'铁壁',mp:10,cd:4,r:[0,0],pow:0,k:'buff',t:'防御 +40%，持续 2 回合。'}},
 xun:{n:'荀彧',f:'wei',c:'strategist',cn:'策士',s:'xun',w:'扇',r:[1,2],m:4,h:96,p:72,a:24,d:23,i:58,g:35,sk:{n:'烈焰计',mp:18,cd:3,r:[2,4],pow:1.55,k:'fire',t:'对目标及相邻敌军造成火计伤害。'}},
 rs:{n:'黄巾枪兵',f:'yellow',c:'spear',cn:'枪兵',s:'spear',w:'长枪',r:[1,1],m:4,h:94,p:0,a:36,d:29,i:12,g:24},
 ri:{n:'黄巾刀兵',f:'yellow',c:'infantry',cn:'步兵',s:'inf',w:'刀',r:[1,1],m:4,h:102,p:0,a:38,d:31,i:11,g:25},
 ra:{n:'黄巾弓手',f:'yellow',c:'archer',cn:'弓兵',s:'archer',w:'弓',r:[2,3],m:4,h:78,p:0,a:40,d:22,i:14,g:33},
 zb:{n:'张宝',f:'yellow',c:'strategist',cn:'妖术师',s:'zhangbao',w:'杖',r:[2,3],m:3,h:186,p:80,a:30,d:35,i:62,g:31},
 li:{n:'西凉步兵',f:'liang',c:'infantry',cn:'西凉步兵',s:'inf',w:'刀盾',r:[1,1],m:4,h:116,p:0,a:42,d:37,i:14,g:25},
 ls:{n:'西凉枪兵',f:'liang',c:'spear',cn:'西凉枪兵',s:'spear',w:'长枪',r:[1,1],m:4,h:112,p:0,a:44,d:35,i:13,g:27},
 la:{n:'西凉弓手',f:'liang',c:'archer',cn:'西凉弓兵',s:'archer',w:'强弓',r:[2,3],m:4,h:88,p:0,a:45,d:25,i:16,g:32},
 hua:{n:'华雄',f:'liang',c:'cavalry',cn:'骁骑',s:'hua',w:'大刀',r:[1,1],m:6,h:205,p:28,a:58,d:41,i:18,g:38},
 lubu:{n:'吕布',f:'liang',c:'cavalry',cn:'飞将',s:'lubu',w:'方天戟',r:[1,2],m:7,h:238,p:44,a:66,d:46,i:24,g:52},
 yi:{n:'袁军步兵',f:'yuan',c:'infantry',cn:'步兵',s:'inf',w:'刀盾',r:[1,1],m:4,h:124,p:0,a:45,d:40,i:16,g:26},
 ya:{n:'袁军强弓',f:'yuan',c:'archer',cn:'强弓兵',s:'archer',w:'强弓',r:[2,4],m:4,h:95,p:0,a:49,d:28,i:18,g:34},
 yl:{n:'颜良',f:'yuan',c:'cavalry',cn:'猛将骑',s:'yanliang',w:'长刀',r:[1,1],m:6,h:210,p:25,a:61,d:42,i:17,g:39}
};
export const C=[
 {id:'yingchuan',no:'第一章',ti:'颍川之战',sub:'乱世初阵',obj:'击败张宝。曹操阵亡则失败。',short:'击破张宝',lim:18,talk:['曹操','cao','黄巾阵势松散，却占据河岸与林地。夏侯渊压制远处弓手，其余诸将稳步推进。'],grid:['hhffppprrrpppp','hfffppprrrpvpp','ppppppprbrpppp','ppffppprbrffpp','ppffppprbrffpp','pppppvpppppppp','ffppppppppffpp','ffpppphppfffpp','pppppphhpppppp','pppppppppppppp'],a:[['cao',1,7],['dun',0,8],['yuan',2,8],['ren',1,9]],e:[['rs',10,1,'guard'],['ri',11,2,'guard'],['ra',10,3,'sniper'],['rs',9,5,'guard'],['ri',11,6,'aggressive'],['ra',12,4,'sniper'],['zb',13,0,'boss']],ai:{hold:2,x:8,zone:[9,0,13,5]}},
 {id:'sishui',no:'第二章',ti:'汜水关之战',sub:'关隘夺锋',obj:'攻上高地，击败华雄。曹操阵亡则失败。',short:'击破华雄',lim:20,talk:['曹操','cao','汜水关地势险要。敌军依高地拒守，不可一味猛冲；先处理两翼弓手，再夺关口。'],grid:['hhhhhhhhhhhhhh','hhhfhhfffhhhhh','hhhfhhfffhhhhh','pppfppffpppppp','pppfppggpppppp','ppppppggpppppp','ffffppggppffff','pppppppppppppp','ppppvppppvpppp','pppppppppppppp'],a:[['cao',2,8],['dun',1,9],['yuan',3,9],['ren',4,8]],e:[['ls',6,4,'choke'],['ls',7,4,'choke'],['li',5,3,'guard'],['li',8,3,'guard'],['la',4,2,'sniper'],['la',9,2,'sniper'],['hua',7,1,'boss']],ai:{hold:5,y:5,zone:[4,0,10,4]}},
 {id:'hulao',no:'第三章',ti:'虎牢关之战',sub:'飞将临阵',obj:'击退吕布。不可让曹操阵亡。',short:'击退吕布',lim:22,talk:['夏侯惇','dun','吕布就在关前。孟德，让我去会他！'],grid:['hhhhgggghhhhhh','hhhgggggghhhhh','fffppggppfffff','ffpppggpppffff','pppppggppppppp','pppppggppppppp','pppppppppppppp','pppvpppppvpppp','pppppppppppppp','pppppppppppppp'],a:[['cao',2,8],['dun',1,9],['yuan',3,9],['ren',4,8],['xun',2,9]],e:[['li',5,3,'guard'],['ls',6,3,'guard'],['li',7,3,'guard'],['la',4,2,'sniper'],['la',9,2,'sniper'],['lubu',7,1,'boss'],['ls',10,4,'reserve']],ai:{hold:4,y:5,zone:[4,0,10,4]}},
 {id:'guandu',no:'第四章',ti:'官渡前哨战',sub:'以少击众',obj:'击败颜良，并保护荀彧。',short:'击破颜良',lim:24,talk:['荀彧','xun','袁军兵多，但阵线过长。利用树林掩护弓骑，诱其前锋脱离本阵。'],grid:['pppffffpppphhh','ppfffffppphhhh','pppffppppphhhh','rrrrbrrrrppppp','ppppbppppffffp','ppppbpppfffffp','ppppppppffvffp','ppvppppppppppp','pppppppppppppp','pppppppppppppp'],a:[['cao',1,8],['dun',0,9],['yuan',2,9],['ren',3,8],['xun',1,7]],e:[['yi',9,2,'guard'],['yi',10,2,'guard'],['ya',11,1,'sniper'],['ya',8,1,'sniper'],['yi',9,5,'aggressive'],['yi',11,5,'reserve'],['yl',12,0,'boss']],ai:{hold:3,x:7,zone:[8,0,13,5],protect:'xun'}}
];