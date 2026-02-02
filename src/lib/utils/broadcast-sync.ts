const CHANNEL_NAME = "sikas-sync"

interface SyncMessage {
  type: "INVALIDATE_QUERIES"
  queryKeys: string[][]
}

let channel: BroadcastChannel | null = null

export function initBroadcastChannel() {
  if (typeof window === "undefined") return null
  if (channel) return channel
  channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

export function broadcastInvalidation(queryKeys: string[][]) {
  const ch = initBroadcastChannel()
  if (!ch) return
  ch.postMessage({ type: "INVALIDATE_QUERIES", queryKeys } satisfies SyncMessage)
}

export function onBroadcastMessage(callback: (message: SyncMessage) => void) {
  const ch = initBroadcastChannel()
  if (!ch) return () => {}
  const handler = (event: MessageEvent<SyncMessage>) => callback(event.data)
  ch.addEventListener("message", handler)
  return () => ch.removeEventListener("message", handler)
}
