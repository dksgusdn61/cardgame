import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SynergyActivation } from '@/entities/synergy/types/synergy.type';
import type { LegionSummary } from '@/entities/battle/types/battle.types';
import { getSynergyMeta } from '@/entities/synergy/model/synergy-meta';
import styles from './style.module.scss';

interface Props {
	legionSummary: LegionSummary;
}

interface RenderedSynergyItem {
	synergy: SynergyActivation;
	state: 'entering' | 'active' | 'exiting';
}

const SynergyPanel = ({ legionSummary }: Props) => {
	const removalTimeoutsRef = useRef<Map<string, number>>(new Map());
	const activeKeys = useMemo(
		() =>
			new Set(
				legionSummary.activeSynergies.map((synergy) => `${synergy.category}-${synergy.key}`),
			),
		[legionSummary.activeSynergies],
	);
	const [renderedSynergies, setRenderedSynergies] = useState<RenderedSynergyItem[]>([]);

	useEffect(() => {
		setRenderedSynergies((current) => {
			const next = [...current];

			for (const synergy of legionSummary.activeSynergies) {
				const key = `${synergy.category}-${synergy.key}`;
				const existingIndex = next.findIndex(
					(item) => `${item.synergy.category}-${item.synergy.key}` === key,
				);

				if (existingIndex === -1) {
					next.push({ synergy, state: 'entering' });
					window.setTimeout(() => {
						setRenderedSynergies((latest) =>
							latest.map((item) =>
								`${item.synergy.category}-${item.synergy.key}` === key
									? { ...item, state: 'active' }
									: item,
							),
						);
					}, 20);
					continue;
				}

				next[existingIndex] = {
					synergy,
					state: 'active',
				};

				const timeoutId = removalTimeoutsRef.current.get(key);
				if (timeoutId) {
					window.clearTimeout(timeoutId);
					removalTimeoutsRef.current.delete(key);
				}
			}

			for (const item of current) {
				const key = `${item.synergy.category}-${item.synergy.key}`;
				if (!activeKeys.has(key)) {
					const existingIndex = next.findIndex(
						(candidate) => `${candidate.synergy.category}-${candidate.synergy.key}` === key,
					);

					if (existingIndex !== -1) {
						next[existingIndex] = {
							...next[existingIndex],
							state: 'exiting',
						};
					}

					if (!removalTimeoutsRef.current.has(key)) {
						const timeoutId = window.setTimeout(() => {
							setRenderedSynergies((latest) =>
								latest.filter(
									(candidate) =>
										`${candidate.synergy.category}-${candidate.synergy.key}` !== key,
								),
							);
							removalTimeoutsRef.current.delete(key);
						}, 240);
						removalTimeoutsRef.current.set(key, timeoutId);
					}
				}
			}

			return next;
		});
	}, [activeKeys, legionSummary.activeSynergies]);

	useEffect(() => {
		return () => {
			for (const timeoutId of removalTimeoutsRef.current.values()) {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	if (renderedSynergies.length === 0) {
		return (
			<section className={styles.panel}>
				<h2>시너지</h2>
				<div className={styles.empty}>연속 배치 시너지가 아직 없습니다.</div>
			</section>
		);
	}

	return (
		<section className={styles.panel}>
			<h2>시너지</h2>
			<div className={styles.synergy_cards}>
				{renderedSynergies.map(({ synergy, state }, index) => {
					const meta = getSynergyMeta(synergy.category, synergy.key);
					const currentCount =
						synergy.category === 'race'
							? legionSummary.raceStreaks[synergy.key]
							: legionSummary.jobStreaks[synergy.key];

					return (
						<article
							key={`${synergy.category}-${synergy.key}`}
							className={`${styles.synergy_card} ${
								state === 'exiting'
									? styles.is_exiting
									: state === 'active'
										? styles.is_active_card
										: ''
							}`}
							style={
								{
									'--synergy-color': meta.color,
									'--synergy-delay': `${index * 70}ms`,
								} as CSSProperties
							}
						>
							<div className={styles.synergy_main}>
								<div className={styles.synergy_label}>
									<strong>
										{meta.label} {currentCount ?? synergy.count}
									</strong>
								</div>
								<div className={styles.synergy_steps} aria-label={`${meta.label} 시너지 단계`}>
									{meta.stages.map((stage) => (
										<span
											key={stage.threshold}
											className={
												stage.threshold === synergy.threshold
													? `${styles.synergy_step} ${styles.is_active}`
													: styles.synergy_step
											}
										>
											{stage.threshold}
										</span>
									))}
								</div>
							</div>
							<div className={styles.synergy_tooltip}>
								<p className={styles.synergy_tooltip_title}>{meta.label} 시너지</p>
								<p className={styles.synergy_tooltip_text}>{synergy.description}</p>
								<ul className={styles.synergy_stage_list}>
									{meta.stages.map((stage) => (
										<li
											key={stage.threshold}
											className={
												stage.threshold === synergy.threshold
													? `${styles.synergy_stage_item} ${styles.is_active}`
													: styles.synergy_stage_item
											}
										>
											<span>{stage.threshold}</span>
											<span>{stage.description}</span>
										</li>
									))}
								</ul>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default SynergyPanel;
