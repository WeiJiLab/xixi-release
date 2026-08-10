#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "此脚本目前仅支持 macOS。" >&2
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "正在安装 Homebrew…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if [[ -x /opt/homebrew/bin/brew ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
fi

brew install --cask android-commandlinetools
brew install scrcpy

ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$PATH"
mkdir -p "$ANDROID_SDK_ROOT"

sdkmanager --sdk_root="$ANDROID_SDK_ROOT" \
  "platform-tools" "emulator" "platforms;android-34"

if [[ "$(uname -m)" == "arm64" ]]; then
  system_image="system-images;android-34;default;arm64-v8a"
  avd_name="aosp34_arm64"
else
  system_image="system-images;android-34;default;x86_64"
  avd_name="aosp34_x86_64"
fi

yes | sdkmanager --licenses >/dev/null || true
sdkmanager --sdk_root="$ANDROID_SDK_ROOT" "$system_image"

if ! avdmanager list avd | grep -q "Name: $avd_name"; then
  echo no | avdmanager create avd --force --name "$avd_name" --package "$system_image" --device "pixel_7"
fi

avd_config="$HOME/.android/avd/$avd_name.avd/config.ini"
set_avd_value() {
  local key="$1" value="$2" temporary
  temporary="$(mktemp "${TMPDIR:-/tmp}/xixi-avd-config.XXXXXX")"
  awk -F= -v key="$key" '$1 != key { print }' "$avd_config" > "$temporary"
  printf '%s=%s\n' "$key" "$value" >> "$temporary"
  mv "$temporary" "$avd_config"
}

set_avd_value "hw.gpu.enabled" "yes"
set_avd_value "hw.gpu.mode" "host"
set_avd_value "hw.ramSize" "4096"
set_avd_value "disk.dataPartition.size" "32G"

echo
echo "准备完成：$avd_name"
echo "ADB: $(command -v adb)"
echo "Emulator: $(command -v emulator)"
echo "现在安装并打开 xixi Desktop Node 即可。"
