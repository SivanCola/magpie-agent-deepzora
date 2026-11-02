// This module runs in Magpie's JS sandbox: no Node APIs or external imports.
// The companion plugin host bridges this JSON to existing Deepzora releases.
export const agent = {
  id: "deepzora",
  name: "Deepzora",
  bin: "deepzora",
  dir: "~/.deepzora",
  config: "~/.deepzora/magpie-agent.json",
  format: "json",
  model: "model",
  ua: ["deepzora"],
  notice: "Wait a moment for the bridge, restart Deepzora, then start a new conversation. 等待桥接完成，重启 Deepzora 并新建会话。",
}

export function connect({ gateway, model }) {
  if (!model?.id || !gateway?.v1 || !gateway?.key) throw new Error("Choose a model with a configured Magpie gateway first.")
  return {
    baseURL: gateway.v1,
    gatewayKey: gateway.key,
    modelInfo: {
      context: model.context > 0 ? model.context : 0,
      output: model.output > 0 ? model.output : 0,
      ...(typeof model.images === "boolean" ? { images: model.images } : {}),
    },
  }
}
