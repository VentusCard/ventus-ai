#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FUNCTION=$1

if [ -z "$FUNCTION" ]; then
  echo "Usage: ./deploy.sh [classify|lifestyle|pillar|travel|risk|api|ingest|all]"
  exit 1
fi

echo "Building all Lambda packages..."
node "$REPO_ROOT/backend/scripts/package-functions.mjs"

get_function_name() {
  case $1 in
    classify) echo "ventus-classify-transactions" ;;
    lifestyle) echo "ventus-analyze-lifestyle-signals" ;;
    pillar) echo "ventus-analyze-pillar-transactions" ;;
    travel) echo "ventus-travel-detection" ;;
    risk) echo "ventus-risk-detection" ;;
    api) echo "ventus-api" ;;
    ingest) echo "ventus-ingest-transactions" ;;
    *) echo "" ;;
  esac
}

deploy() {
  local short=$1
  local full=$(get_function_name "$short")
  if [ -z "$full" ]; then
    echo "Unknown function: $short"
    exit 1
  fi
  echo "Deploying $full..."
  aws lambda update-function-code \
    --function-name "$full" \
    --zip-file "fileb://$REPO_ROOT/backend/dist/lambda/$full.zip" \
    --region us-east-2
  echo "✓ $full deployed"
}

if [ "$FUNCTION" = "all" ]; then
  for fn in classify lifestyle pillar travel risk api ingest; do
    deploy "$fn"
  done
else
  deploy "$FUNCTION"
fi