export type DragSource = 'hand' | 'board'

export type DragPayload = {
	source: DragSource
	index: number
}
