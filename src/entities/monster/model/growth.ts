export const getMonsterGrowthValue = (turnProgress: number) =>
	Math.floor(Math.sqrt(Math.max(turnProgress, 0)) * 8)
