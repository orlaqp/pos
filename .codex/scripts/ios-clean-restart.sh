#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/Users/orlando/dev/pos"
IOS_DIR="$REPO_ROOT/apps/mobile-ui/ios"
WORKSPACE="MobileUi.xcworkspace"
SCHEME="MobileUi"

if [[ ! -d "$IOS_DIR" ]]; then
  echo "ERROR: iOS directory not found at $IOS_DIR"
  exit 1
fi

echo "[1/5] Quitting Xcode (if open)..."
osascript -e 'tell application "Xcode" to quit' >/dev/null 2>&1 || true


echo "[2/5] Stopping Metro/React Native processes..."
pkill -f "react-native|metro" >/dev/null 2>&1 || true

echo "[3/5] Cleaning iOS build artifacts and DerivedData..."
cd "$IOS_DIR"
xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Debug clean
rm -rf "$HOME/Library/Developer/Xcode/DerivedData"/*

echo "[4/5] Reinstalling CocoaPods..."
pod install

echo "[5/5] Starting Metro with reset cache..."
cd "$REPO_ROOT"
yarn start --reset-cache
