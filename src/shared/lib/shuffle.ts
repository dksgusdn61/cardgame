export const shuffle = <T,>(items: T[]) => {
	const nextItems = [...items];

	for (let index = nextItems.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		const currentItem = nextItems[index];

		nextItems[index] = nextItems[swapIndex];
		nextItems[swapIndex] = currentItem;
	}

	return nextItems;
};
