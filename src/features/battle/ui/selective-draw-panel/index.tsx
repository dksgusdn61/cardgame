import { useEffect, useState } from 'react';
import type { SelectiveDrawState } from '@/features/battle/model/battle-state.types';
import CardTile from '@/features/battle/ui/card-tile';
import styles from './style.module.scss';

interface Props {
	selectiveDraw?: SelectiveDrawState;
	onToggleCard: (cardId: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
}

const SelectiveDrawPanel = ({ selectiveDraw, onToggleCard, onConfirm, onCancel }: Props) => {
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		setIsCollapsed(false);
	}, [selectiveDraw?.cards]);

	if (!selectiveDraw) {
		return null;
	}

	return (
		<>
			{isCollapsed ? (
				<div className={styles.collapsed_trigger}>
					<button
						type="button"
						onClick={() => setIsCollapsed(false)}
						className={styles.primary_button}
					>
						카드 선택 다시 열기
					</button>
				</div>
			) : (
				<div className={styles.overlay}>
				<section
					className={styles.panel}
					role="dialog"
					aria-modal="true"
					aria-labelledby="selective-draw-title"
				>
					<div className={styles.header_row}>
						<div>
							<h2 id="selective-draw-title">선택 드로우</h2>
							<p>
								{selectiveDraw.cards.length}장 중 {selectiveDraw.pickLimit}장을 고릅니다.
							</p>
						</div>
						<button
							type="button"
							onClick={() => setIsCollapsed(true)}
							className={styles.peek_button}
						>
							잠깐 닫기
						</button>
					</div>
					<div className={styles.hand_grid}>
						{selectiveDraw.cards.map((card) => (
							<CardTile
								key={card.instanceId}
								card={card}
								zone="hand"
								isSelected={selectiveDraw.selectedIds.includes(card.instanceId)}
								isDraggable={false}
								onClick={() => onToggleCard(card.instanceId)}
							/>
						))}
					</div>
					<div className={styles.button_row}>
						<button
							type="button"
							onClick={onConfirm}
							disabled={selectiveDraw.selectedIds.length !== selectiveDraw.pickLimit}
							className={styles.primary_button}
						>
							선택 반영
						</button>
						<button type="button" onClick={onCancel} className={styles.ghost_button}>
							전부 버리기
						</button>
					</div>
				</section>
				</div>
			)}
		</>
	);
};

export default SelectiveDrawPanel;
