import type { CardDefinition } from '@/entities/card/types/card.types';

const cardCatalog: CardDefinition[] = [
	{ id: 'vanguard-captain', name: '선봉대장', race: 'human', job: 'warrior', attack: 17, hp: 40, attackType: 'melee' },
	{ id: 'sanctum-guard', name: '성소 수호병', race: 'human', job: 'tank', attack: 11, hp: 54, attackType: 'melee' },
	{ id: 'longbow-scout', name: '장궁 정찰병', race: 'elf', job: 'archer', attack: 16, hp: 28, attackType: 'range' },
	{ id: 'windrunner', name: '바람 추적자', race: 'elf', job: 'assassin', attack: 15, hp: 27, attackType: 'range' },
	{ id: 'pit-bruiser', name: '구덩이 난투꾼', race: 'orc', job: 'warrior', attack: 19, hp: 38, attackType: 'melee' },
	{ id: 'ironhide', name: '철가죽 방패병', race: 'orc', job: 'tank', attack: 13, hp: 57, attackType: 'melee' },
	{ id: 'ember-adept', name: '잿불 술사', race: 'demon', job: 'mage', attack: 18, hp: 25, attackType: 'magic' },
	{ id: 'night-hexer', name: '밤의 주술사', race: 'demon', job: 'assassin', attack: 15, hp: 23, attackType: 'magic' },
	{ id: 'grave-binder', name: '묘지 결속자', race: 'undead', job: 'mage', attack: 14, hp: 36, attackType: 'magic' },
	{ id: 'bone-ranger', name: '해골 사수', race: 'undead', job: 'archer', attack: 15, hp: 30, attackType: 'range' },
];

export default cardCatalog;
