import type { EnemyUnit } from '@/entities/battle/types/battle.types';

const enemyCatalog: EnemyUnit[] = [
	{
		id: 'starved-zombie',
		name: '굶주린 좀비',
		hp: 140,
		attack: 26,
		recovery: 0,
		attackType: 'melee',
		race: 'undead',
		job: 'warrior',
		traits: [
			{
				id: 'stone-flesh',
				name: '단단한 살점',
				description: '첫 2턴 동안 받는 피해가 10% 감소합니다.',
			},
		],
	},
	{
		id: 'bone-spearman',
		name: '뼈창 투척병',
		hp: 180,
		attack: 36,
		recovery: 0,
		attackType: 'range',
		race: 'undead',
		job: 'archer',
		traits: [
			{
				id: 'piercing-throw',
				name: '관통 투척',
				description: '플레이어 군단 공격 타입이 원거리가 아니면 추가 피해를 12 더 입힙니다.',
			},
		],
	},
	{
		id: 'plague-priest',
		name: '역병 사제',
		hp: 230,
		attack: 32,
		recovery: 18,
		attackType: 'magic',
		race: 'undead',
		job: 'mage',
		traits: [
			{
				id: 'plague-ritual',
				name: '역병 의식',
				description: '플레이어 군단의 턴 종료 회복량을 25% 감소시킵니다.',
			},
		],
	},
];

export default enemyCatalog;
