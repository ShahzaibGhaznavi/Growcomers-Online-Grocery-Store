#!/usr/bin/env bash
set -euo pipefail

CONTEXT="kind-growcomers-lab"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CURRENT="$(kubectl config current-context)"
if [ "$CURRENT" != "$CONTEXT" ]; then
  echo "ERROR: Expected $CONTEXT, got $CURRENT"
  exit 1
fi

echo "This deletes resources declared in k8s/ only."
echo "The Kind cluster and AWS infrastructure will not be deleted."
read -r -p "Type DELETE to continue: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
  echo "Cancelled."
  exit 0
fi

kubectl --context "$CONTEXT" delete -f k8s/
