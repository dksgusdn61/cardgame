import type { LegionSummary } from '@/entities/battle/types/battle.types';
import SynergyPanel from '@/features/battle/ui/synergy-panel';

interface Props {
	legionSummary: LegionSummary;
}

const BattleSummary = ({ legionSummary }: Props) => <SynergyPanel legionSummary={legionSummary} />;

export default BattleSummary;
