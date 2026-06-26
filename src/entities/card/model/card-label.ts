import type { CardJob, CardRace } from '@/entities/card/types/card.types';

const raceLabelMap: Record<CardRace, string> = {
	human: '인간',
	elf: '엘프',
	orc: '오크',
	demon: '마족',
	undead: '언데드',
};

const jobLabelMap: Record<CardJob, string> = {
	warrior: '전사',
	tank: '탱커',
	archer: '궁수',
	mage: '마법사',
	assassin: '암살자',
};

export const getRaceLabel = (race: CardRace) => raceLabelMap[race];

export const getJobLabel = (job: CardJob) => jobLabelMap[job];
