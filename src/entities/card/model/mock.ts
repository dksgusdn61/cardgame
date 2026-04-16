import type { CardEntity } from 'src/entities/card/model/types'

const baseDeck: Omit<CardEntity, 'id'>[] = [
	{ name: '왕실 검병', race: 'human', job: 'warrior', attack: 22, hp: 18, attackType: 'melee' },
	{ name: '성채 방패병', race: 'human', job: 'tank', attack: 14, hp: 30, attackType: 'melee' },
	{ name: '숲길 사수', race: 'elf', job: 'archer', attack: 20, hp: 16, attackType: 'range' },
	{ name: '달빛 저격수', race: 'elf', job: 'archer', attack: 24, hp: 15, attackType: 'range' },
	{ name: '수림 창병', race: 'elf', job: 'warrior', attack: 21, hp: 17, attackType: 'melee' },
	{ name: '산악 분쇄자', race: 'orc', job: 'warrior', attack: 28, hp: 18, attackType: 'melee' },
	{ name: '핏빛 방벽병', race: 'orc', job: 'tank', attack: 17, hp: 26, attackType: 'melee' },
	{ name: '암야 투척수', race: 'orc', job: 'archer', attack: 23, hp: 15, attackType: 'range' },
	{ name: '투견 조련사', race: 'beast', job: 'tank', attack: 16, hp: 24, attackType: 'melee' },
	{ name: '야성 추적자', race: 'beast', job: 'assassin', attack: 24, hp: 15, attackType: 'melee' },
	{ name: '발톱 맹수', race: 'beast', job: 'warrior', attack: 26, hp: 14, attackType: 'melee' },
	{ name: '심연 흑마도사', race: 'demon', job: 'mage', attack: 25, hp: 16, attackType: 'magic' },
	{ name: '붉은 주술사', race: 'demon', job: 'mage', attack: 23, hp: 17, attackType: 'magic' },
	{ name: '혼돈 척후', race: 'demon', job: 'assassin', attack: 24, hp: 15, attackType: 'magic' },
	{ name: '저주 사제', race: 'undead', job: 'mage', attack: 19, hp: 22, attackType: 'magic' },
	{ name: '유령 사수', race: 'undead', job: 'archer', attack: 21, hp: 16, attackType: 'range' },
	{ name: '무덤 순찰자', race: 'undead', job: 'tank', attack: 16, hp: 28, attackType: 'melee' },
	{ name: '황혼 척후', race: 'human', job: 'assassin', attack: 23, hp: 14, attackType: 'melee' },
]

const starterDeck = baseDeck.map((card, index) => ({
	...card,
	id: `card-${index + 1}`,
}))

export default starterDeck
