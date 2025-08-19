#!/usr/bin/env bash
set -euo pipefail

CHAIN_ID=1337
GENESIS_TS=1280759397
BLOCK_TIME=0.01
BASE_FEE=0
MNEMONIC="test test test test test test test test test test test junk"
STATE_PATH="./advil-state/dev.json"

log()  { printf "\033[1;32m[info]\033[0m %s\n" "$*"; }

ensure_foundry() {
  if command -v anvil >/dev/null 2>&1; then
    log "anvil found: $(command -v anvil)"
    return
  fi

  if ! command -v curl >/dev/null 2>&1; then
    err "curl is required to install Foundry. Please install curl and re-run."; exit 1
  fi

  log "Installing Foundry toolchain via foundryup..."
  # Install foundryup (adds binaries under ~/.foundry/bin)
  curl -L https://foundry.paradigm.xyz | bash

  # Make sure current process PATH can see the binaries now
  export PATH="$HOME/.foundry/bin:$PATH"

  # Install/Update foundry tools (anvil/forge/cast)
  if command -v foundryup >/dev/null 2>&1; then
    foundryup
  else
    err "foundryup not on PATH after install. Ensure ~/.foundry/bin is exported."; exit 1
  fi

  if ! command -v anvil >/dev/null 2>&1; then
    err "anvil not found after foundryup. Check installation logs."; exit 1
  fi
}

ensure_foundry

log "Starting anvil:"
log "  chain-id    : ${CHAIN_ID}"
log "  genesis ts  : ${GENESIS_TS} ($(date -u -d @"${GENESIS_TS}" 2>/dev/null || date -r "${GENESIS_TS}" -u))"
log "  block-time  : ${BLOCK_TIME}s"
log "  base-fee    : ${BASE_FEE} wei"

if [[ -n "${STATE_PATH}" ]]; then
  log "  state file  : ${STATE_PATH} (will persist & reload)"
fi

mkdir -p "$(dirname "${STATE_PATH}")"

ANVIL_ARGS=(
  --chain-id "${CHAIN_ID}"
  --timestamp "${GENESIS_TS}"
  --block-time "${BLOCK_TIME}"
  --base-fee "${BASE_FEE}"
  --mnemonic "${MNEMONIC}"
  --state "${STATE_PATH}"
)

exec anvil "${ANVIL_ARGS[@]}" 