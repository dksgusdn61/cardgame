import { createFileRoute } from '@tanstack/react-router';
import BattleScreen from 'src/widgets/battle-screen/ui';

export const Route = createFileRoute('/(home)/')({
	component: HomePage,
});

function HomePage() {
	return <BattleScreen />;
}
