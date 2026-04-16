import type { DragPayload } from 'src/features/card-drag-drop/model/types'

export const encodeDragPayload = (payload: DragPayload) => JSON.stringify(payload)

export const decodeDragPayload = (rawPayload: string) => {
	try {
		const payload = JSON.parse(rawPayload) as DragPayload
		if ((payload.source === 'hand' || payload.source === 'board') && Number.isInteger(payload.index)) {
			return payload
		}
	} catch {
		return null
	}

	return null
}
