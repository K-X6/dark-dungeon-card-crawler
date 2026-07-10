// 暗黑地牢卡牌爬塔 — 遗物数据
window.RELICS = {
  common: [
    { id:'iron_ring',    name:'铁指环',   hook:'onBattleStart', effect:{armor:4},          description:'每场战斗开始时获得 4 护甲' },
    { id:'life_charm',   name:'生命护符', hook:'onBattleStart', effect:{maxHp:10},          description:'最大 HP +10' },
    { id:'energy_crystal',name:'能量水晶',hook:'onBattleStart', effect:{firstTurnEnergy:1}, description:'第一回合额外 +1 能量' },
    { id:'lucky_coin',   name:'幸运币',   hook:'onPostBattle',  effect:{potionDropBonus:15},description:'战后药水掉落概率 +15%' },
    { id:'thorn_armor',  name:'荆棘护甲', hook:'onDamageTaken', effect:{reflect:3},         description:'受到攻击时对敌人造成 3 伤害' },
    { id:'heal_stone',   name:'治疗石',   hook:'onEnterRest',   effect:{bonusHeal:10},      description:'进入休息点时额外回复 10 HP' },
    { id:'snake_fang',   name:'毒蛇之牙', hook:'onBattleStart', effect:{randomPoison:3},    description:'每场战斗开始时给随机敌人施加 3 层中毒' },
    { id:'banner',       name:'战旗',     hook:'onBattleStart', effect:{firstAttackBonus:4},description:'每场战斗第一张攻击牌伤害 +4' },
    { id:'beads',        name:'冥想念珠', hook:'onPostBattle',  effect:{cardChoice:4},      description:'战后选牌从 3 选 1 变成 4 选 1（配合 showPicker allowSkip 仍然可用）' },
    { id:'big_backpack', name:'轻便背包', hook:'onBattleStart', effect:{potionSlots:1},     description:'药水携带上限 +1' }
  ],
  rare: [
    { id:'vampire_touch',name:'吸血鬼之触',hook:'onDamageDealt',effect:{lifestealPercent:15},description:'造成伤害的 15% 回复 HP' },
    { id:'phoenix_feather',name:'凤凰羽毛', hook:'onDeath',      effect:{revivePercent:50}, description:'HP=0 时复活，回复 50% HP（一次性，需自己实现消耗逻辑）' },
    { id:'frost_heart',  name:'冰霜之心',  hook:'onCardPlayed',  effect:{armorOnAbility:3}, description:'每使用一张技能牌获得 3 护甲' },
    { id:'power_totem',  name:'力量图腾',  hook:'onTurnStart',   effect:{strengthEvery3:1},description:'每 3 回合力量 +1' },
    { id:'time_glass',   name:'时光沙漏',  hook:'onBattleStart', effect:{extraDraw:1},      description:'每场战斗开始额外抽 1 张牌' },
    { id:'curse_charm',  name:'诅咒护符',  hook:'onBattleStart', effect:{strengthPerCurse:2},description:'每持有一张诅咒牌，力量 +2' },
    { id:'necronomicon', name:'死灵书',    hook:'onEnemyKilled', effect:{healOnKill:8},     description:'击杀敌人后回复 8 HP' },
    { id:'mirror_copy',  name:'复制镜',    hook:'onEnterShop',   effect:{gainCopyPotion:true},description:'进入商店时获得一瓶复制药水' }
  ],
  legendary: [
    { id:'dragon_heart', name:'龙之心',   hook:'onBattleStart', effect:{healToHalfIfLow:true},description:'战斗开始时若 HP < 50%，回复到 50%' },
    { id:'demon_wing',   name:'恶魔之翼', hook:'onBattleStart', effect:{bonusEnergy:1},       description:'每回合额外 +1 能量' },
    { id:'time_eye',     name:'时间之眼', hook:'onBattleStart', effect:{seeIntentTurns:2},    description:'可以看到敌人未来 2 回合的意图' },
    { id:'sage_stone',   name:'贤者之石', hook:'onBattleStart', effect:{costReduceAll:1},     description:'所有卡牌费用 -1（最低 0）' },
    { id:'death_scythe', name:'死神镰刀', hook:'onDamageDealt', effect:{firstHitPercent:20},  description:'每场战斗首次造成伤害时，额外造成目标当前 HP 的 20% 伤害' }
  ],
  unlock: {
    warrior: { id:'berserker_brace', name:'狂战士护腕', hook:'onBattleStart', effect:{lowHpStrength:6}, description:'战士专属：HP < 30% 时力量 +6' },
    mage:    { id:'archmage_staff',  name:'大法师之杖', hook:'onCardPlayed',   effect:{energyOn3Ability:1},description:'法师专属：每使用 3 张技能牌，获得 1 能量' },
    rogue:   { id:'assassin_hood',   name:'暗杀者兜帽', hook:'onBattleStart',  effect:{firstAttackFree:true},description:'盗贼专属：每场战斗首次使用攻击牌不消耗能量' }
  },
  ultimate: { id:'wheel_of_fate', name:'命运之轮', hook:'onGameStart', effect:{startRelicChoice:3}, description:'每局开始从 3 个随机传说遗物中选 1 个获得' }
};

window.getAllRelics = function() {
  return [...window.RELICS.common, ...window.RELICS.rare, ...window.RELICS.legendary];
};
window.getRelicById = function(id) {
  return getAllRelics().find(r => r.id === id) || Object.values(window.RELICS.unlock).find(r => r.id === id) || null;
};



