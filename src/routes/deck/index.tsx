import { createFileRoute } from '@tanstack/react-router';
import DeckBuilderScreen from '@/widgets/deck-builder-screen/ui';

export const Route = createFileRoute('/deck/')({
	component: DeckPage,
});

function DeckPage() {
	return <DeckBuilderScreen />;
}
