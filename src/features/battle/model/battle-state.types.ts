import type { CardInstance } from '@/entities/card/types/card.types';
import type { EnemyUnit } from '@/entities/battle/types/battle.types';

export interface SelectiveDrawState {
	cards: CardInstance[];
	selectedIds: string[];
	pickLimit: number;
}

export interface BattleState {
	deck: CardInstance[];
	hand: CardInstance[];
	field: Array<CardInstance | null>;
	discard: CardInstance[];
	enemy: EnemyUnit;
	selectiveDraw?: SelectiveDrawState;
}
