import { startBridge } from "./bridge.mjs"

// Magpie loads this OpenCode-compatible hook in its Bun plugin host. Agent
// descriptors alone cannot write TOML or a separate credentials file.
export default async function DeepzoraBridgePlugin() {
  startBridge()
  return {}
}
