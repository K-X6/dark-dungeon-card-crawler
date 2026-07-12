window.ENEMIES = {
  chapter1: {
    normal: [
      { name:"骷髅兵", hp:[18,20,22], damage:[5,6,7], intents:["attack","defend(5)","attack"], hardVariations:[{"name":"暴怒","effect":{"damageMultiplier":1.5}},{"name":"亡语","effect":{"onDeathDamage":5}},{"name":"铁壁","effect":{"defendBonus":10}}], altIntents:["attack","attack","attack"] },
      { name:"巨型蜘蛛", hp:[14,16,18], damage:[4,5,6], intents:["attack","attack","strengthen(2)"], hardVariations:[{"name":"剧毒","effect":{"poisonOnAttack":3}},{"name":"织网","effect":{"frailOnAttack":true}},{"name":"狂暴","effect":{"doubleAttack":true}}], altIntents:["attack","defend(3)","attack","attack"] },
      { name:"暗影史莱姆", hp:[22,25,28], damage:[6,7,8], intents:["attack","defend(8)","attack"], hardVariations:[{"name":"分裂","effect":{"splitOnDeath":true}},{"name":"腐蚀","effect":{"vulnerableOnAttack":true}},{"name":"膨胀","effect":{"hpMultiplier":1.3}}], altIntents:["defend(10)","attack","attack"] }
    ],
    elite: [
      { name:"骨魔像", hp:[42,50,58], damage:[12,15,18], intents:["defend(15)","attack","attack","strengthen(5)"], hardVariations:[{"name":"碾压","effect":{"aoeAttack":true}},{"name":"不灭","effect":{"regen":5}},{"name":"反甲","effect":{"thorns":4}}] }
    ],
    boss: [
      { name:"亡灵法师", hp:[55,65,75], damage:[10,12,14], intents:["summon","attack","strengthenAll","attack"], special:"summonSkeleton" },
      { name:"巨型蜘蛛女王", hp:[60,72,84], damage:[8,10,12], intents:["attack","attack","aoePoison(6)","defend(12)"], special:"aoePoison" },
      { name:"墓穴守护者", hp:[70,85,100], damage:[14,17,20], intents:["defend(20)","attack","attack","strengthen(6)"], special:"halfHpArmor" }
    ]
  },
  chapter2: {
    normal: [
      { name:"暗影骑士", hp:[26,30,34], damage:[8,10,12], intents:["attack","strengthen(3)","attack","defend(10)"], hardVariations:[{"name":"冲锋","effect":{"firstStrikeDouble":true}},{"name":"破甲","effect":{"ignoreArmorPercent":30}},{"name":"坚韧","effect":{"hpRegen":3}}], altIntents:["strengthen(3)","attack","attack","defend(8)"] },
      { name:"邪教徒", hp:[20,23,26], damage:[6,7,8], intents:["attack","attack","applyWeak","attack"], hardVariations:[{"name":"狂热","effect":{"selfDamageBuff":3}},{"name":"献祭","effect":{"healOnAttack":3}},{"name":"诅咒","effect":{"curseOnAttack":true}}], altIntents:["applyWeak","attack","attack"] },
      { name:"幽灵", hp:[16,18,21], damage:[9,11,13], intents:["attack","defend(6)","attack","attack"], hardVariations:[{"name":"虚无","effect":{"dodgeChance":30}},{"name":"哀嚎","effect":{"strengthDown":2}},{"name":"附身","effect":{"copyIntent":true}}], altIntents:["defend(8)","attack","defend(8)","attack"] }
    ],
    elite: [
      { name:"吸血鬼", hp:[36,42,48], damage:[9,11,13], intents:["lifestealAttack","attack","defend(10)","applyWeak"], hardVariations:[{"name":"血宴","effect":{"lifestealPercent":75}},{"name":"魅惑","effect":{"stunOnAttack":true}},{"name":"暗裔","effect":{"extraTurn":true}}] }
    ],
    boss: [
      { name:"地狱骑士", hp:[70,82,94], damage:[14,17,20], intents:["attack","defend(20)","attack","attack","strengthen(8)"], special:"halfHpBuff" },
      { name:"深渊祭祀", hp:[58,68,78], damage:[10,12,14], intents:["applyCurse","attack","attack","heal(15)"], special:"addCurseToHand" }
    ]
  },
  chapter3: {
    normal: [
      { name:"恶魔", hp:[34,40,46], damage:[12,15,18], intents:["strengthen(4)","attack","attack","defend(12)"], hardVariations:[{"name":"地狱火","effect":{"burnOnAttack":3}},{"name":"蛮力","effect":{"damageMultiplier":1.4}},{"name":"不屈","effect":{"deathResist":true}}], altIntents:["attack","attack","strengthen(6)","attack"] },
      { name:"巫妖", hp:[22,26,30], damage:[10,12,14], intents:["attack","attack","applyFrail","attack"], hardVariations:[{"name":"冰霜","effect":{"freeze":true}},{"name":"吸取","effect":{"energyDrain":1}},{"name":"骨盾","effect":{"autoArmor":4}}], altIntents:["applyFrail","attack","attack"] },
      { name:"暗影幼龙", hp:[30,35,40], damage:[9,11,13], intents:["attack","attack","attack","strengthen(5)"], hardVariations:[{"name":"龙息","effect":{"aoeDamage":5}},{"name":"龙鳞","effect":{"damageReduction":3}},{"name":"威压","effect":{"weakenOnAttack":true}}], altIntents:["attack","attack","attack","attack"] }
    ],
    elite: [
      { name:"深渊恐魔", hp:[50,60,70], damage:[14,17,20], intents:["attack","attack","strengthen(6)","attack","applyFrail"], hardVariations:[{"name":"触手","effect":{"multiAttack":3}},{"name":"吞噬","effect":{"healOnKill":10}},{"name":"低语","effect":{"confuseOnAttack":true}}] }
    ],
    boss: [
      { name:"暗影巨龙", hp:[90,108,126], damage:[16,20,24], intents:["attack","attack","applyFrail","aoe","strengthen"], special:"dragonBreath" },
      { name:"堕落圣骑士", hp:[85,100,115], damage:[16,19,22], intents:["defend(25)","attack","attack","heal(20)","attack"], special:"heavyHeal" },
      { name:"深渊之主", hp:[100,120,140], damage:[18,22,26], intents:["attack","strengthen(10)","attack","defend(25)","charge","ultimate"], special:"ultimateSkill(30,40,50)" }
    ]
  }
};

window.getEnemyPool = function(chapter, type) { return (ENEMIES['chapter'+chapter] && ENEMIES['chapter'+chapter][type]) || []; };
