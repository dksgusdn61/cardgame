import CardView from 'src/entities/card/ui'
import MonsterCard from 'src/entities/monster/ui'
import { ATTACK_TYPE_LABEL } from 'src/entities/card/model/constants'
import { decodeDragPayload, encodeDragPayload } from 'src/features/card-drag-drop/model/payload'
import type { DragPayload } from 'src/features/card-drag-drop/model/types'
import useBattleSession from 'src/features/battle-session/model/use-battle-session'
import styles from './style.module.scss'

const BattleScreen = () => {
	const {
		state,
		preview,
		placementLimit,
		isBattleFinished,
		selectHandCard,
		placeCard,
		returnCardToHand,
		exchangeSelectedCard,
		prepareBattle,
		resetBattle,
	} = useBattleSession()

	const handleDragStart = (payload: DragPayload, event: React.DragEvent<HTMLElement>) => {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('application/json', encodeDragPayload(payload))
	}

	const handleBoardDrop = (slotIndex: number, event: React.DragEvent<HTMLElement>) => {
		event.preventDefault()
		const payload = decodeDragPayload(event.dataTransfer.getData('application/json'))

		if (!payload) {
			return
		}

		placeCard(payload, slotIndex)
	}

	const handleHandDrop = (event: React.DragEvent<HTMLElement>) => {
		event.preventDefault()
		const payload = decodeDragPayload(event.dataTransfer.getData('application/json'))

		if (!payload) {
			return
		}

		returnCardToHand(payload)
	}

	return (
		<main className={styles.page}>
			<section className={styles.layout}>
				<aside className={styles.sidebar}>
					<div className={styles.panel}>
						<p className={styles.eyebrow}>Battle Status</p>
						<h1 className={styles.sidebar_title}>전투 준비</h1>
						<div className={styles.stat_list}>
							<div className={styles.stat_item}>
								<span>턴</span>
								<strong>{state.turn}</strong>
							</div>
							<div className={styles.stat_item}>
								<span>군단 체력</span>
								<strong>
									{state.legionHp} / {preview.legionMaxHp}
								</strong>
							</div>
							<div className={styles.stat_item}>
								<span>배치 한도</span>
								<strong>
									{state.board.filter(Boolean).length} / {placementLimit}
								</strong>
							</div>
							<div className={styles.stat_item}>
								<span>예상 회복</span>
								<strong>{preview.legionRegen}</strong>
							</div>
						</div>
					</div>

					<div className={styles.panel}>
						<p className={styles.eyebrow}>Synergy</p>
						<div className={styles.synergy_section}>
							<h2 className={styles.section_title}>종족</h2>
							<div className={styles.synergy_list}>
								{preview.raceSynergies.map((synergy) => (
									<div
										key={`race-${synergy.key}`}
										className={`${styles.synergy_item} ${synergy.threshold ? styles.active : ''}`}
									>
										<span>{synergy.label}</span>
										<strong>{synergy.streak}</strong>
										<small>{synergy.threshold ? `${synergy.threshold}+` : '대기'}</small>
									</div>
								))}
							</div>
						</div>
						<div className={styles.synergy_section}>
							<h2 className={styles.section_title}>직업</h2>
							<div className={styles.synergy_list}>
								{preview.jobSynergies.map((synergy) => (
									<div
										key={`job-${synergy.key}`}
										className={`${styles.synergy_item} ${synergy.threshold ? styles.active : ''}`}
									>
										<span>{synergy.label}</span>
										<strong>{synergy.streak}</strong>
										<small>{synergy.threshold ? `${synergy.threshold}+` : '대기'}</small>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className={styles.panel}>
						<button className={styles.primary_button} type="button" onClick={prepareBattle} disabled={isBattleFinished}>
							준비하기
						</button>
						<button
							className={styles.secondary_button}
							type="button"
							onClick={exchangeSelectedCard}
							disabled={
								isBattleFinished ||
								state.turn < 2 ||
								state.selectedHandCardId === null ||
								state.exchangedThisTurn
							}
						>
							선택 카드 교체
						</button>
						<button className={styles.ghost_button} type="button" onClick={resetBattle}>
							전투 초기화
						</button>
					</div>
				</aside>

				<section className={styles.board_area}>
					<div className={styles.panel}>
						<MonsterCard monster={state.monster} />
					</div>

					<div className={styles.panel}>
						<div className={styles.section_header}>
							<div>
								<p className={styles.eyebrow}>Formation</p>
								<h2 className={styles.section_title}>나의 필드</h2>
							</div>
							<div className={styles.readout}>
								<span>주력 {ATTACK_TYPE_LABEL[preview.dominantAttackType]}</span>
								<span>예상 피해 {preview.outgoingDamage}</span>
							</div>
						</div>
						<div className={styles.field_grid}>
							{state.board.map((card, index) => {
								const isLocked = index >= placementLimit

								return (
									<div
										key={`field-slot-${index}`}
										className={`${styles.field_slot} ${card ? styles.filled : ''} ${isLocked ? styles.locked : ''}`}
										onDragOver={(event) => event.preventDefault()}
										onDrop={(event) => handleBoardDrop(index, event)}
									>
										<span className={styles.slot_index}>{index + 1}</span>
										{card ? (
											<CardView
												card={card}
												draggable={!isBattleFinished}
												onDragStart={(event) => handleDragStart({ source: 'board', index }, event)}
											/>
										) : (
											<div className={styles.empty_slot}>{isLocked ? '잠금' : '드래그 배치'}</div>
										)}
									</div>
								)
							})}
						</div>
					</div>

					<div className={styles.lower_layout}>
						<section className={styles.panel}>
							<div className={styles.section_header}>
								<div>
									<p className={styles.eyebrow}>Discard</p>
									<h2 className={styles.section_title}>버린 카드</h2>
								</div>
								<span>{state.discard.length}</span>
							</div>
							<div className={styles.stack_list}>
								{state.discard.length === 0 ? <p className={styles.empty_message}>아직 버린 카드가 없습니다.</p> : null}
								{state.discard.slice(0, 4).map((card) => (
									<CardView key={card.id} card={card} size="sm" />
								))}
							</div>
						</section>

						<section className={`${styles.panel} ${styles.hand_panel}`} onDragOver={(event) => event.preventDefault()} onDrop={handleHandDrop}>
							<div className={styles.section_header}>
								<div>
									<p className={styles.eyebrow}>Hand</p>
									<h2 className={styles.section_title}>현재 뽑은 카드</h2>
								</div>
								<div className={styles.readout}>
									<span>드롭해서 회수 가능</span>
									{state.exchangedThisTurn ? <span>이번 턴 손패 배치 제한</span> : null}
								</div>
							</div>
							<div className={styles.hand_list}>
								{state.hand.map((card, index) => (
									<CardView
										key={card.id}
										card={card}
										draggable={!isBattleFinished}
										isSelected={state.selectedHandCardId === card.id}
										onClick={() => selectHandCard(card.id)}
										onDragStart={(event) => handleDragStart({ source: 'hand', index }, event)}
									/>
								))}
							</div>
						</section>

						<section className={styles.panel}>
							<div className={styles.section_header}>
								<div>
									<p className={styles.eyebrow}>Deck</p>
									<h2 className={styles.section_title}>드로우 더미</h2>
								</div>
								<span>{state.deck.length}</span>
							</div>
							<div className={styles.deck_stack}>
								{state.deck.length > 0 ? (
									Array.from({ length: Math.min(4, state.deck.length) }).map((_, index) => (
										<div key={`deck-card-${index}`} className={styles.deck_card} />
									))
								) : (
									<p className={styles.empty_message}>덱이 비었습니다.</p>
								)}
							</div>
						</section>
					</div>

					<div className={styles.analysis_grid}>
						<section className={styles.panel}>
							<div className={styles.section_header}>
								<div>
									<p className={styles.eyebrow}>Combat</p>
									<h2 className={styles.section_title}>공격 계산</h2>
								</div>
							</div>
							<div className={styles.metric_list}>
								<div className={styles.metric_item}>
									<span>근접</span>
									<strong>{preview.attackByType.melee}</strong>
								</div>
								<div className={styles.metric_item}>
									<span>원거리</span>
									<strong>{preview.attackByType.range}</strong>
								</div>
								<div className={styles.metric_item}>
									<span>마법</span>
									<strong>{preview.attackByType.magic}</strong>
								</div>
								<div className={styles.metric_item}>
									<span>보정</span>
									<strong>{preview.multipliers.length > 0 ? preview.multipliers.join(', ') : '없음'}</strong>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<div className={styles.section_header}>
								<div>
									<p className={styles.eyebrow}>Battle Log</p>
									<h2 className={styles.section_title}>전투 기록</h2>
								</div>
							</div>
							<div className={styles.log_list}>
								{state.logs.map((log, index) => (
									<p key={`${log}-${index}`}>{log}</p>
								))}
							</div>
						</section>
					</div>
				</section>
			</section>
		</main>
	)
}

export default BattleScreen
