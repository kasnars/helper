import router from '../router'
import { useUsageStore } from '../stores/usage'
import { findTool, storageKeyFor, toolRoute } from './registry'

export function openTool(id: string) {
  const entry = findTool(id)
  if (!entry) return
  sessionStorage.setItem(storageKeyFor(entry.page), entry.id)
  useUsageStore().touch(entry.id)
  void router.push(toolRoute(entry))
  window.dispatchEvent(new CustomEvent('helper:open-tool', { detail: entry.id }))
}
