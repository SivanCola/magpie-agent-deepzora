import assert from "node:assert/strict"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import { expandAgentPath, pathsFor, resolveDeepzoraHome } from "../bridge.mjs"

const home = () => path.join(os.tmpdir(), "magpie-deepzora-paths")

test("control file stays in the agent home; Unix config home matches it", () => {
  const h = home()
  const p = pathsFor({ home: h, env: {}, platform: "linux" })
  assert.equal(p.control, path.join(h, ".deepzora", "magpie-agent.json"))
  assert.equal(p.config, path.join(h, ".deepzora", "config.toml"))
  assert.equal(p.env, path.join(h, ".deepzora", ".env"))
  assert.equal(p.state, path.join(h, ".deepzora", ".magpie-bridge", "state.json"))
})

test("Windows uses APPDATA for Deepzora config but not for the control file", () => {
  const h = home()
  const appdata = path.join(h, "AppData", "Roaming")
  const p = pathsFor({ home: h, env: { APPDATA: appdata }, platform: "win32" })
  assert.equal(p.control, path.join(h, ".deepzora", "magpie-agent.json"))
  assert.equal(p.config, path.join(appdata, "deepzora", "config.toml"))
  assert.equal(p.env, path.join(appdata, "deepzora", ".env"))
  assert.equal(p.state, path.join(appdata, "deepzora", ".magpie-bridge", "state.json"))
})

test("Windows falls back to the standard AppData location when APPDATA is absent", () => {
  const h = home()
  assert.equal(
    resolveDeepzoraHome({ home: h, env: {}, platform: "win32" }),
    path.join(h, "AppData", "Roaming", "deepzora"),
  )
})

test("DEEPZORA_HOME wins over the Windows platform default", () => {
  const h = home()
  const portable = path.join(h, "portable-deepzora")
  const p = pathsFor({ home: h, env: { APPDATA: path.join(h, "AppData", "Roaming"), DEEPZORA_HOME: portable }, platform: "win32" })
  assert.equal(p.config, path.join(portable, "config.toml"))
  assert.ok(!p.config.includes("AppData"))
})

test("DEEPZORA_HOME may itself use ~ expansion", () => {
  const h = home()
  assert.equal(resolveDeepzoraHome({ home: h, env: { DEEPZORA_HOME: "~/portable-deepzora" }, platform: "linux" }), path.join(h, "portable-deepzora"))
})

test("descriptor paths expand ~, $HOME and $APPDATA like the Magpie host", () => {
  const h = home()
  const appdata = path.join(h, "AppData", "Roaming")
  assert.equal(expandAgentPath("~/.deepzora/magpie-agent.json", { home: h, env: {} }), path.join(h, ".deepzora", "magpie-agent.json"))
  assert.equal(expandAgentPath("$HOME/.deepzora/magpie-agent.json", { home: h, env: {} }), path.join(h, ".deepzora", "magpie-agent.json"))
  assert.equal(expandAgentPath("$APPDATA/deepzora/magpie-agent.json", { home: h, env: { APPDATA: appdata } }), path.join(appdata, "deepzora", "magpie-agent.json"))
  assert.throws(() => expandAgentPath("relative/magpie-agent.json", { home: h, env: {} }), /absolute/)
})
