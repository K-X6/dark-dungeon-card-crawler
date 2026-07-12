window.EVENTS = [
  {
    name:'古老神龛', description:'你发现一座散发幽光的神龛。',
    options:[
      { text:'祈祷', effects:[{"type":"heal","value":20}] },
      { text:'献祭 10 HP 获得遗物', effects:[{"type":"loseHpFlat","value":10},{"type":"gainRelic","rarity":"random"}] }
    ]
  },
  {
    name:'赌徒的陷阱', description:'一个地精提出赌局，你敢试试运气吗？',
    options:[
      { text:'下注（50% 得稀有遗物 / 50% 失一个遗物）', effects:[{"type":"gamble","win":{"type":"gainRelic","rarity":"rare"},"lose":{"type":"loseRelic","count":1},"chance":50}] },
      { text:'拒绝离开', effects:[] }
    ]
  },
  {
    name:'诅咒之泉', description:'一池黑水，散发着不祥气息。',
    options:[
      { text:'喝下', effects:[{"type":"gainCard","rarity":"rare","count":1},{"type":"gainCurse","count":1}] },
      { text:'转身离开', effects:[] }
    ]
  },
  {
    name:'迷失的冒险者', description:'一个受伤的冒险者向你求助。',
    options:[
      { text:'给他一瓶药水', effects:[{"type":"losePotion","count":1},{"type":"gainCard","rarity":"rare","count":1}] },
      { text:'无视他', effects:[{"type":"heal","value":10}] },
      { text:'搜刮他', effects:[{"type":"gainCard","rarity":"common","count":2},{"type":"loseHpFlat","value":5}] }
    ]
  },
  {
    name:'恶魔契约', description:'一个恶魔提出交易，代价不菲但回报惊人。',
    options:[
      { text:'接受（失去 20% HP，获得传说遗物）', effects:[{"type":"loseHpPercent","percent":20},{"type":"gainRelic","rarity":"legendary"}] },
      { text:'拒绝', effects:[] }
    ]
  },
  {
    name:'铁匠熔炉', description:'一间废弃的铁匠铺，炉火未熄。',
    options:[
      { text:'升级一张牌', effects:[{"type":"upgradeCard"}] },
      { text:'修复护甲（回复 15 HP）', effects:[{"type":"heal","value":15}] }
    ]
  },
  {
    name:'迷宫岔路', description:'你面前有三条路，各有所得。',
    options:[
      { text:'左（获得随机卡牌）', effects:[{"type":"gainCard","rarity":"common","count":1}] },
      { text:'中（回复 10 HP）', effects:[{"type":"heal","value":10}] },
      { text:'右（获得随机药水）', effects:[{"type":"gainPotion","rarity":"common"}] }
    ]
  },
  {
    name:'古老图书馆', description:'满是尘土的卷轴和古籍。',
    options:[
      { text:'研读（5 选 1 卡牌）', effects:[{"type":"gainCardChoice","rarity":"random","count":5}] },
      { text:'冥想（下 3 场战斗起始 +1 能量）', effects:[{"type":"addBuff","buffType":"bonusEnergy","turns":3,"value":1}] }
    ]
  },
  {
    name:'宝箱陷阱', description:'一个宝箱，但似乎有机关。',
    options:[
      { text:'强行打开（70% 得遗物 / 30% 受 15 伤害）', effects:[{"type":"gamble","win":{"type":"gainRelic","rarity":"random"},"lose":{"type":"loseHpFlat","value":15},"chance":70}] },
      { text:'小心解除（得药水）', effects:[{"type":"gainPotion","rarity":"common"}] }
    ]
  },
  {
    name:'墓园', description:'一片古老的墓地，安静的让人不安。',
    options:[
      { text:'挖掘（-10 HP，2 次 3 选 1 遗物）', effects:[{"type":"loseHpFlat","value":10},{"type":"gainRelicChoice","rarity":"random","count":3},{"type":"gainRelicChoice","rarity":"random","count":3}] },
      { text:'安息（移除一张牌）', effects:[{"type":"removeCard"}] }
    ]
  },
  {
    name:'迷雾商人', description:'一个穿着斗篷的神秘商人从雾中现身。',
    options:[
      { text:'买遗物（35 HP 换稀有遗物）', effects:[{"type":"loseHpFlat","value":35},{"type":"gainRelic","rarity":"rare"}] },
      { text:'卖牌（移除一张牌，回复 10 HP）', effects:[{"type":"removeCard"},{"type":"heal","value":10}] },
      { text:'离开', effects:[] }
    ]
  },
  {
    name:'幻象之间', description:'你看到了另一个自己。',
    options:[
      { text:'战斗（赢=稀有卡牌，输=-10HP）', effects:[{"type":"fightMirror","win":{"type":"gainCard","rarity":"rare","count":1},"lose":{"type":"loseHpFlat","value":10}}] },
      { text:'和解（失去随机牌，得稀有牌）', effects:[{"type":"loseRandomCard"},{"type":"gainCard","rarity":"rare","count":1}] }
    ]
  },
  {
    name:'深渊低语', description:'黑暗中传来不可名状的低语，你的心智在颤抖。',
    options:[
      { text:'聆听（获得诅咒牌，力量+2整场）', effects:[{"type":"gainCurse","count":1},{"type":"addBuff","buffType":"strength","value":2,"turns":999}] },
      { text:'抵抗（失去5 HP）', effects:[{"type":"loseHpFlat","value":5}] }
    ]
  },
  {
    name:'破旧武器架', description:'一把锈迹斑斑的武器靠在墙边，似乎还能用。',
    options:[
      { text:'拿起武器（升级一张随机攻击牌）', effects:[{"type":"upgradeCard"}] },
      { text:'拆解护甲片（下3场战斗起始护甲+5）', effects:[{"type":"addBuff","buffType":"startArmor","value":5,"turns":3}] }
    ]
  },
  {
    name:'垂死冒险者', description:'一个奄奄一息的冒险者向你伸出手。',
    options:[
      { text:'超度他（回复25 HP，失去一个随机遗物）', effects:[{"type":"heal","value":25},{"type":"loseRelic","count":1}] },
      { text:'吸收力量（获得稀有卡牌，失去15 HP）', effects:[{"type":"gainCard","rarity":"rare","count":1},{"type":"loseHpFlat","value":15}] }
    ]
  }
];
