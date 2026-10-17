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

echo "Validating Kubernetes manifests..."
kubectl --context "$CONTEXT" apply --dry-run=client -f k8s/

echo "Applying Kubernetes manifests..."
kubectl --context "$CONTEXT" apply -f k8s/

echo "Waiting for frontend..."
kubectl --context "$CONTEXT" rollout status deployment/frontend \
  -n growcomers --timeout=120s

echo "Current resources:"
kubectl --context "$CONTEXT" get pods,deployments,services -n growcomers
