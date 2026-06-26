import { getJobLabel, getRaceLabel } from '@/entities/card/model/card-label';
import type { CardJob, CardRace } from '@/entities/card/types/card.types';
import type { SynergyCategory } from '@/entities/synergy/types/synergy.type';

interface SynergyStageMeta {
	threshold: number;
	description: string;
}

export interface SynergyMeta {
	key: CardRace | CardJob;
	category: SynergyCategory;
	label: string;
	color: string;
	stages: SynergyStageMeta[];
}

const raceMetaMap: Record<CardRace, SynergyMeta> = {
	human: {
		key: 'human',
		category: 'race',
		label: getRaceLabel('human'),
		color: '#f2a65a',
		stages: [
			{ threshold: 2, description: '군단 최대 체력 +60' },
			{ threshold: 4, description: '군단 최대 체력 +140, 최종 피해 +6%' },
			{ threshold: 6, description: '군단 최대 체력 +240, 최종 피해 +12%' },
			{ threshold: 8, description: '군단 최대 체력 +380, 최종 피해 +20%' },
		],
	},
	elf: {
		key: 'elf',
		category: 'race',
		label: getRaceLabel('elf'),
		color: '#7de9df',
		stages: [
			{ threshold: 2, description: '군단 공격 타입이 원거리일 때 공격력 +12%' },
			{ threshold: 4, description: '군단 공격 타입이 원거리일 때 공격력 +24%' },
			{ threshold: 6, description: '공격 타입을 원거리로 고정하고 공격력 +30%' },
			{ threshold: 8, description: '공격 타입을 원거리로 고정하고 공격력 +45%, 최종 피해 +10%' },
		],
	},
	orc: {
		key: 'orc',
		category: 'race',
		label: getRaceLabel('orc'),
		color: '#8dcf6f',
		stages: [
			{ threshold: 2, description: '군단 공격 타입이 근접일 때 공격력 +15%' },
			{ threshold: 4, description: '군단 공격 타입이 근접일 때 공격력 +30%' },
			{ threshold: 6, description: '군단 공격 타입이 근접일 때 공격력 +45%, 최종 피해 +8%' },
			{ threshold: 8, description: '군단 공격 타입이 근접일 때 공격력 +65%, 최종 피해 +16%' },
		],
	},
	demon: {
		key: 'demon',
		category: 'race',
		label: getRaceLabel('demon'),
		color: '#f07f7b',
		stages: [
			{ threshold: 2, description: '군단 공격 타입이 마법일 때 공격력 +14%' },
			{ threshold: 4, description: '군단 공격 타입이 마법일 때 공격력 +28%, 적 회복 차단 25%' },
			{ threshold: 6, description: '군단 공격 타입이 마법일 때 공격력 +40%, 적 회복 차단 50%' },
			{ threshold: 8, description: '군단 공격 타입이 마법일 때 공격력 +55%, 적 회복 차단 75%, 최종 피해 +10%' },
		],
	},
	undead: {
		key: 'undead',
		category: 'race',
		label: getRaceLabel('undead'),
		color: '#8a98b9',
		stages: [
			{ threshold: 2, description: '턴 종료 회복량 +40%, 최종 피해 -5%' },
			{ threshold: 4, description: '턴 종료 회복량 +80%, 최종 피해 -5%' },
			{ threshold: 6, description: '턴 종료 회복량 +140%' },
			{ threshold: 8, description: '턴 종료 회복량 +220%, 군단 최대 체력 +120' },
		],
	},
};

const jobMetaMap: Record<CardJob, SynergyMeta> = {
	warrior: {
		key: 'warrior',
		category: 'job',
		label: getJobLabel('warrior'),
		color: '#dd7068',
		stages: [
			{ threshold: 1, description: '전사 카드 공격력 +10%' },
			{ threshold: 3, description: '전사 카드 공격력 +20%, 근접 조합 최종 피해 +6%' },
			{ threshold: 5, description: '전사 카드 공격력 +35%, 근접 조합 최종 피해 +12%, 암살자 상대로 추가 피해 +12%' },
		],
	},
	tank: {
		key: 'tank',
		category: 'job',
		label: getJobLabel('tank'),
		color: '#5ca7dd',
		stages: [
			{ threshold: 1, description: '군단 최대 체력 +40' },
			{ threshold: 3, description: '군단 최대 체력 +100, 회복량 +15%' },
			{ threshold: 5, description: '군단 최대 체력 +220, 회복량 +35%, 피해 감소 +8%' },
		],
	},
	archer: {
		key: 'archer',
		category: 'job',
		label: getJobLabel('archer'),
		color: '#53bf87',
		stages: [
			{ threshold: 1, description: '궁수 카드 공격력 +10%' },
			{ threshold: 3, description: '궁수 카드 공격력 +20%, 원거리 조합 최종 피해 +6%' },
			{ threshold: 5, description: '궁수 카드 공격력 +35%, 원거리 조합 최종 피해 +12%, 추가 최종 피해 +10%' },
		],
	},
	mage: {
		key: 'mage',
		category: 'job',
		label: getJobLabel('mage'),
		color: '#8770f4',
		stages: [
			{ threshold: 1, description: '마법사 카드 공격력 +10%' },
			{ threshold: 3, description: '마법사 카드 공격력 +20%, 언데드 상대로 최종 피해 +10%' },
			{ threshold: 5, description: '마법사 카드 공격력 +35%, 언데드 상대로 최종 피해 +20%, 마법 조합 최종 피해 +8%' },
		],
	},
	assassin: {
		key: 'assassin',
		category: 'job',
		label: getJobLabel('assassin'),
		color: '#4d4d57',
		stages: [
			{ threshold: 1, description: '암살자 카드 공격력 +10%' },
			{ threshold: 3, description: '암살자 카드 공격력 +20%, 마법사/궁수 상대로 최종 피해 +10%' },
			{ threshold: 5, description: '암살자 카드 공격력 +35%, 마법사/궁수 상대로 최종 피해 +20%, 추가 최종 피해 +6%' },
		],
	},
};

export const getSynergyMeta = (category: SynergyCategory, key: CardRace | CardJob) =>
	category === 'race'
		? raceMetaMap[key as CardRace]
		: jobMetaMap[key as CardJob];
