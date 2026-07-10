// 暗黑地牢卡牌爬塔 — 药水数据
window.POTIONS = [
  // 普通
  { id:'heal_potion',     name:'治疗药水', rarity:'common',    effect:{type:'heal',value:15},         description:'回复 15 HP' },
  { id:'energy_potion',   name:'能量药水', rarity:'common',    effect:{type:'energy',value:2},         description:'本回合 +2 能量' },
  { id:'draw_potion',     name:'抽牌药水', rarity:'common',    effect:{type:'draw',count:3},           description:'抽 3 张牌' },
  { id:'strength_potion', name:'力量药水', rarity:'common',    effect:{type:'strength',value:4,duration:'thisTurn'}, description:'本回合攻击伤害 +4' },
  { id:'armor_potion',    name:'护甲药水', rarity:'common',    effect:{type:'armor',value:10},         description:'获得 10 护甲' },
  // 稀有
  { id:'agility_potion',  name:'敏捷药水', rarity:'rare',      effect:{type:'costReduce',value:1,duration:'thisTurn'}, description:'本回合所有牌费用 -1（最低 0）' },
  { id:'regen_potion',    name:'再生药水', rarity:'rare',      effect:{type:'regen',value:5,turns:3},  description:'接下来 3 回合每回合回复 5 HP' },
  { id:'copy_potion',     name:'复制药水', rarity:'rare',      effect:{type:'duplicate',count:1},      description:'选择手牌中一张牌，复制一张 0 费版本' },
  // 传说
  { id:'phoenix_potion',  name:'凤凰药水', rarity:'legendary', effect:{type:'revive',percent:30},      description:'本场战斗中死亡时自动复活，回复 30% HP' }
];

window.getPotionById = function(id) { return POTIONS.find(p => p.id === id); };
window.getRandomPotion = function(rarity) {
  const pool = rarity ? POTIONS.filter(p => p.rarity === rarity) : POTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
};
