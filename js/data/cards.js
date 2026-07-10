// 暗黑地牢卡牌爬塔 — 卡牌数据
// 使用效果DSL格式，所有数值按设计文档定义

window.CARDS = [
  // ==================== 战士（16张） ====================
  // 普通 8 张
  { id:'slash',       name:'斩击',     class:'warrior', type:'attack',  rarity:'common', cost:1, casts:1, effects:[{type:'damage',value:6}],                 upgraded:{effects:[{type:'damage',value:9}]} },
  { id:'block',       name:'格挡',     class:'warrior', type:'defense', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:5}],                  upgraded:{effects:[{type:'armor',value:8}]} },
  { id:'battle_cry',  name:'战吼',     class:'warrior', type:'ability', rarity:'common', cost:0, casts:1, effects:[{type:'strength',value:2,duration:'thisTurn'}], upgraded:{effects:[{type:'strength',value:4,duration:'thisTurn'}]} },
  { id:'heavy_strike',name:'重击',     class:'warrior', type:'attack',  rarity:'common', cost:2, casts:1, effects:[{type:'damage',value:14}],                upgraded:{effects:[{type:'damage',value:17}]} },
  { id:'whirlwind',   name:'旋风斩',   class:'warrior', type:'attack',  rarity:'common', cost:2, casts:1, effects:[{type:'aoeDamage',value:6}],              upgraded:{effects:[{type:'aoeDamage',value:9}]} },
  { id:'shield_bash', name:'盾击',     class:'warrior', type:'attack',  rarity:'common', cost:1, casts:1, effects:[{type:'damage',value:6},{type:'armor',value:5}], upgraded:{effects:[{type:'damage',value:9},{type:'armor',value:8}]} },
  { id:'iron_wall',   name:'铁壁',     class:'warrior', type:'defense', rarity:'common', cost:2, casts:1, effects:[{type:'armor',value:12}],                 upgraded:{effects:[{type:'armor',value:15}]} },
  { id:'reckless',    name:'鲁莽攻击', class:'warrior', type:'attack',  rarity:'common', cost:0, casts:1, effects:[{type:'damage',value:8},{type:'loseHpFlat',value:3}], upgraded:{effects:[{type:'damage',value:11},{type:'loseHpFlat',value:3}]} },
  { id:'war_stomp',   name:'战争践踏', class:'warrior', type:'attack',  rarity:'common', cost:2, casts:1, effects:[{type:'damage',value:10},{type:'weak',turns:1}], upgraded:{effects:[{type:'damage',value:13},{type:'weak',turns:1}]} },
  { id:'second_wind', name:'再起',     class:'warrior', type:'ability', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:3},{type:'draw',count:1}], upgraded:{effects:[{type:'armor',value:6},{type:'draw',count:1}]} },
  { id:'intimidate',  name:'威吓',     class:'warrior', type:'ability', rarity:'common', cost:1, casts:1, effects:[{type:'enemyDmgReduce',value:3}],           upgraded:{effects:[{type:'enemyDmgReduce',value:5}]} },

  // 稀有 5 张
  { id:'blade_storm', name:'剑刃风暴', class:'warrior', type:'attack',  rarity:'rare',  cost:3, casts:1, effects:[{type:'aoeDamage',value:6,times:2}],        upgraded:{effects:[{type:'aoeDamage',value:9,times:2}]} },
  { id:'fortress',    name:'要塞',     class:'warrior', type:'defense', rarity:'rare',  cost:2, casts:1, effects:[{type:'armor',value:15},{type:'retainArmor'}], upgraded:{effects:[{type:'armor',value:22},{type:'retainArmor'}]} },
  { id:'fury',        name:'狂暴之怒', class:'warrior', type:'ability', rarity:'rare',  cost:1, casts:1, effects:[{type:'strength',value:3}],                  upgraded:{effects:[{type:'strength',value:5}]} },
  { id:'execute',     name:'处决',     class:'warrior', type:'attack',  rarity:'rare',  cost:3, casts:1, effects:[{type:'execute',threshold:50,value:30}],     upgraded:{effects:[{type:'execute',threshold:50,value:38}]} },
  { id:'shield_wall', name:'盾墙',     class:'warrior', type:'defense', rarity:'rare',  cost:2, casts:1, effects:[{type:'armor',value:12},{type:'draw',count:2}], upgraded:{effects:[{type:'armor',value:18},{type:'draw',count:2}]} },

  // 传说 3 张
  { id:'colossus',    name:'巨像猛击', class:'warrior', type:'attack',  rarity:'legendary', cost:3, casts:1, effects:[{type:'damage',value:25},{type:'stun'}],         upgraded:{effects:[{type:'damage',value:32},{type:'stun'}]} },
  { id:'unbreakable', name:'不破',     class:'warrior', type:'ability', rarity:'legendary', cost:2, casts:1, effects:[{type:'buff',buffType:'armorPerTurn',value:4}],   upgraded:{effects:[{type:'buff',buffType:'armorPerTurn',value:6}]} },
  { id:'godslayer',   name:'弑神',     class:'warrior', type:'attack',  rarity:'legendary', cost:4, casts:1, effects:[{type:'damage',value:40}],                       upgraded:{effects:[{type:'damage',value:50}]} },

  // ==================== 法师（16张） ====================
  // 普通 8 张
  { id:'frost_arrow', name:'冰霜箭',   class:'mage', type:'attack',  rarity:'common', cost:1, casts:1, effects:[{type:'damage',value:7},{type:'weak',turns:1}],     upgraded:{effects:[{type:'damage',value:10},{type:'weak',turns:1}]} },
  { id:'chain_light', name:'闪电链',   class:'mage', type:'attack',  rarity:'common', cost:2, casts:1, effects:[{type:'chain',value:5}],                             upgraded:{effects:[{type:'chain',value:8}]} },
  { id:'fireball',    name:'火球术',   class:'mage', type:'attack',  rarity:'common', cost:3, casts:1, effects:[{type:'aoeDamage',value:10}],                       upgraded:{effects:[{type:'aoeDamage',value:14}]} },
  { id:'mana_barrier',name:'法力屏障', class:'mage', type:'defense', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:7}],                           upgraded:{effects:[{type:'armor',value:10}]} },
  { id:'elem_affin',  name:'元素亲和', class:'mage', type:'ability', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:2},{type:'draw',count:2}],     upgraded:{effects:[{type:'armor',value:3},{type:'draw',count:2}]} },
  { id:'scorch',      name:'灼烧',     class:'mage', type:'attack',  rarity:'common', cost:2, casts:1, effects:[{type:'damage',value:12},{type:'burn',layers:3}],   upgraded:{effects:[{type:'damage',value:16},{type:'burn',layers:4}]} },
  { id:'arcane_blast',name:'奥术冲击', class:'mage', type:'attack',  rarity:'common', cost:1, casts:1, effects:[{type:'damage',value:8}],                           upgraded:{effects:[{type:'damage',value:11}]} },
  { id:'mana_surge',  name:'法力涌动', class:'mage', type:'ability', rarity:'common', cost:0, casts:1, effects:[{type:'energy',value:1}],                          upgraded:{effects:[{type:'energy',value:2}]} },

  // 稀有 5 张
  { id:'blizzard',    name:'暴风雪',   class:'mage', type:'attack',  rarity:'rare', cost:2, casts:1, effects:[{type:'aoeDamage',value:8},{type:'weak',turns:1}],  upgraded:{effects:[{type:'aoeDamage',value:11},{type:'weak',turns:1}]} },
  { id:'mirror',      name:'魔法镜像', class:'mage', type:'ability', rarity:'rare', cost:3, casts:1, effects:[{type:'duplicate',count:1}],                         upgraded:{effects:[{type:'duplicate',count:2}]} },
  { id:'timeback',    name:'时光回溯', class:'mage', type:'ability', rarity:'rare', cost:1, casts:1, effects:[{type:'retrieve',count:1}],                          upgraded:{effects:[{type:'retrieve',count:2}]} },
  { id:'lava_shield', name:'熔岩护盾', class:'mage', type:'defense', rarity:'rare', cost:2, casts:1, effects:[{type:'armor',value:10},{type:'thorns',value:6}],   upgraded:{effects:[{type:'armor',value:14},{type:'thorns',value:9}]} },
  { id:'apocalypse',  name:'天启',     class:'mage', type:'attack',  rarity:'rare', cost:3, casts:1, effects:[{type:'damage',value:20},{type:'draw',count:2}],     upgraded:{effects:[{type:'damage',value:26},{type:'draw',count:2}]} },

  // 传说 3 张
  { id:'meteor',      name:'陨石术',   class:'mage', type:'attack',  rarity:'legendary', cost:4, casts:1, effects:[{type:'aoeDamage',value:22},{type:'stun'}],                upgraded:{effects:[{type:'aoeDamage',value:28},{type:'stun'}]} },
  { id:'arcane_wis',  name:'奥术智慧', class:'mage', type:'ability', rarity:'legendary', cost:2, casts:1, effects:[{type:'buff',buffType:'drawPerTurn',value:2}],             upgraded:{effects:[{type:'buff',buffType:'drawPerTurn',value:3}]} },
  { id:'time_stop',   name:'时间停止', class:'mage', type:'ability', rarity:'legendary', cost:5, casts:1, effects:[{type:'extraTurn'}],                                       upgraded:{effects:[{type:'extraTurn'}], upgradedCost:4} },

  // ==================== 盗贼（16张） ====================
  // 普通 8 张
  { id:'poison_dart', name:'毒镖',     class:'rogue', type:'attack',  rarity:'common', cost:1, casts:1, effects:[{type:'damage',value:4},{type:'poison',layers:5}],         upgraded:{effects:[{type:'damage',value:4},{type:'poison',layers:7}]} },
  { id:'dagger',      name:'飞刀',     class:'rogue', type:'attack',  rarity:'common', cost:0, casts:1, effects:[{type:'damage',value:3}],                                   upgraded:{effects:[{type:'damage',value:5}]} },
  { id:'counter',     name:'格挡反击', class:'rogue', type:'defense', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:5},{type:'damage',value:3}],           upgraded:{effects:[{type:'armor',value:8},{type:'damage',value:5}]} },
  { id:'deadly_poison',name:'致命毒药',class:'rogue', type:'ability', rarity:'common', cost:2, casts:1, effects:[{type:'poison',layers:8}],                                  upgraded:{effects:[{type:'poison',layers:12}]} },
  { id:'smoke_bomb',  name:'烟雾弹',   class:'rogue', type:'ability', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:7},{type:'nextTurnEnergy',value:1}],   upgraded:{effects:[{type:'armor',value:11},{type:'nextTurnEnergy',value:1}]} },
  { id:'shadow_strike',name:'影袭',    class:'rogue', type:'attack',  rarity:'common', cost:1, casts:1, effects:[{type:'damage',value:7},{type:'bonusOnPoison',value:4}],   upgraded:{effects:[{type:'damage',value:10},{type:'bonusOnPoison',value:6}]} },
  { id:'quick_dodge', name:'快速闪避', class:'rogue', type:'defense', rarity:'common', cost:1, casts:1, effects:[{type:'armor',value:6},{type:'draw',count:1}],             upgraded:{effects:[{type:'armor',value:9},{type:'draw',count:1}]} },
  { id:'envenom',     name:'淬毒',     class:'rogue', type:'ability', rarity:'common', cost:1, casts:1, effects:[{type:'buff',buffType:'poisonOnAttack',value:2}],          upgraded:{effects:[{type:'buff',buffType:'poisonOnAttack',value:3}]} },

  // 稀有 5 张
  { id:'poison_burst',name:'毒爆',     class:'rogue', type:'ability', rarity:'rare', cost:2, casts:1, effects:[{type:'poisonDamage',multiplier:2}],                        upgraded:{effects:[{type:'poisonDamage',multiplier:2},{type:'poison',layers:3}]} },
  { id:'assassin_mark',name:'刺客印记',class:'rogue',type:'ability', rarity:'rare', cost:1, casts:1, effects:[{type:'poison',layers:3},{type:'vulnerable',turns:1}],       upgraded:{effects:[{type:'poison',layers:5},{type:'vulnerable',turns:1}]} },
  { id:'shadow_clone',name:'暗影分身', class:'rogue', type:'ability', rarity:'rare', cost:2, casts:1, effects:[{type:'buff',buffType:'armorAndPoisonPerTurn',value:2}],     upgraded:{effects:[{type:'buff',buffType:'armorAndPoisonPerTurn',value:3}]} },
  { id:'combo',       name:'连击',     class:'rogue', type:'attack',  rarity:'rare', cost:1, casts:2, effects:[{type:'damage',value:5}],                                   upgraded:{effects:[{type:'damage',value:7}]} },
  { id:'adrenaline',  name:'肾上腺素', class:'rogue', type:'ability', rarity:'rare', cost:0, casts:1, effects:[{type:'draw',count:2},{type:'energy',value:1}],             upgraded:{effects:[{type:'draw',count:3},{type:'energy',value:2}]} },

  // 传说 3 张
  { id:'death_mark',  name:'死亡标记', class:'rogue', type:'ability', rarity:'legendary', cost:2, casts:1, effects:[{type:'poisonDamage',multiplier:2,duration:'thisTurn'}],  upgraded:{upgradedCost:1} },
  { id:'toxic_spread',name:'剧毒蔓延', class:'rogue', type:'attack',  rarity:'legendary', cost:3, casts:1, effects:[{type:'aoePoison',layers:8}],                              upgraded:{effects:[{type:'aoePoison',layers:12}]} },
  { id:'assassinate', name:'暗杀',     class:'rogue', type:'attack',  rarity:'legendary', cost:3, casts:1, effects:[{type:'damage',value:15},{type:'perPoisonDamage',value:1}], upgraded:{effects:[{type:'damage',value:20},{type:'perPoisonDamage',value:2}]} },

  // ==================== 诅咒牌（5张） ====================
  { id:'curse_bleed',   name:'血蚀', class:'curse', type:'curse', rarity:'common', cost:99, casts:0, curseEffect:{type:'loseHpFlat',value:3} },
  { id:'curse_weaken',  name:'乏力', class:'curse', type:'curse', rarity:'common', cost:99, casts:0, curseEffect:{type:'nextTurnEnergy',value:-1} },
  { id:'curse_exhaust', name:'疲惫', class:'curse', type:'curse', rarity:'common', cost:99, casts:0, curseEffect:{type:'nextTurnDraw',value:-1} },
  { id:'curse_weak',    name:'虚弱', class:'curse', type:'curse', rarity:'common', cost:99, casts:0, curseEffect:{type:'weak',turns:1} },
  { id:'curse_vuln',    name:'易伤', class:'curse', type:'curse', rarity:'common', cost:99, casts:0, curseEffect:{type:'vulnerable',turns:1} },

  // ==================== 解锁卡牌 ====================
  // 战士通关解锁
  { id:'earth_split', name:'裂地斩',   class:'warrior', type:'attack', rarity:'legendary', cost:3, casts:1, effects:[{type:'damage',value:20},{type:'aoeDamage',value:10}], upgraded:{effects:[{type:'damage',value:28},{type:'aoeDamage',value:14}]}, unlock:'warrior' },
  { id:'iron_will',   name:'钢铁意志', class:'warrior', type:'ability', rarity:'rare', cost:1, casts:1, effects:[{type:'armor',value:8},{type:'buff',buffType:'strengthOnHit',value:1}], upgraded:{effects:[{type:'armor',value:12},{type:'buff',buffType:'strengthOnHit',value:1}]}, unlock:'warrior' },

  // 法师通关解锁
  { id:'black_hole',  name:'黑洞',     class:'mage', type:'attack', rarity:'legendary', cost:3, casts:1, effects:[{type:'aoeDamage',value:15},{type:'drawPerEnemy',count:1}], upgraded:{effects:[{type:'aoeDamage',value:20},{type:'drawPerEnemy',count:1}]}, unlock:'mage' },
  { id:'ice_ring',    name:'冰环',     class:'mage', type:'attack', rarity:'rare', cost:2, casts:1, effects:[{type:'damage',value:8},{type:'stun'}], upgraded:{effects:[{type:'damage',value:12},{type:'stun'}]}, unlock:'mage' },

  // 盗贼通关解锁
  { id:'toxic_fog',   name:'毒雾',     class:'rogue', type:'attack', rarity:'legendary', cost:2, casts:1, effects:[{type:'aoePoison',layers:6},{type:'weak',turns:2}], upgraded:{effects:[{type:'aoePoison',layers:10},{type:'weak',turns:2}]}, unlock:'rogue' },
  { id:'vital_strike',name:'要害打击', class:'rogue', type:'attack', rarity:'rare', cost:1, casts:1, effects:[{type:'damage',value:6},{type:'poisonDamageBuff',multiplier:1.5,duration:2}], upgraded:{effects:[{type:'damage',value:9},{type:'poisonDamageBuff',multiplier:1.5,duration:2}]}, unlock:'rogue' }
];

// 起手牌组
window.STARTER_DECKS = {
  warrior: ['slash','slash','slash','slash','slash','block','block','block','block','battle_cry'],
  mage:    ['arcane_blast','arcane_blast','arcane_blast','mana_barrier','mana_barrier','mana_barrier','mana_barrier','arcane_wis','fireball','fireball'],
  rogue:   ['dagger','dagger','dagger','dagger','counter','counter','counter','poison_dart','shadow_strike','shadow_strike']
};

// 辅助函数
window.getCardsByClass = function(cls) { return window.CARDS.filter(c => c.class === cls); };
window.getCardsByRarity = function(r) { return window.CARDS.filter(c => c.rarity === r); };
window.getCardById = function(id) { return window.CARDS.find(c => c.id === id); };

