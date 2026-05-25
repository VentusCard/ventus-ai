#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_ROOT="$REPO_ROOT/backend"
REGION="${AWS_REGION:-us-east-2}"
TARGET=$1

PIPELINE_FUNCTIONS=(classify lifestyle pillar travel risk api ingest)
MONITOR_FUNCTIONS=(stuck-job-monitor webhook-delivery-monitor)

usage() {
  echo "Usage: ./deploy.sh <target>"
  echo ""
  echo "Targets:"
  echo "  api | ingest | classify | lifestyle | pillar | travel | risk"
  echo "    Deploy one pipeline Lambda (packages all pipeline functions first)."
  echo "  pipeline"
  echo "    Package and deploy all seven pipeline Lambdas."
  echo "  monitors"
  echo "    Package and deploy scheduled monitor Lambdas (code only; infra is CDK)."
  echo "  all"
  echo "    pipeline + monitors"
  exit 1
}

package_pipeline() {
  echo "Building pipeline Lambda packages..."
  node "$BACKEND_ROOT/scripts/package-functions.mjs"
}

package_monitors() {
  echo "Building monitor Lambda packages..."
  node "$BACKEND_ROOT/scripts/package-monitors.mjs"
}

get_pipeline_function_name() {
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

get_monitor_function_name() {
  case $1 in
    stuck-job-monitor) echo "ventus-stuck-job-monitor" ;;
    webhook-delivery-monitor) echo "ventus-webhook-delivery-monitor" ;;
    *) echo "" ;;
  esac
}

deploy_pipeline() {
  local short=$1
  local full
  full=$(get_pipeline_function_name "$short")
  if [ -z "$full" ]; then
    echo "Unknown pipeline function: $short"
    exit 1
  fi
  echo "Deploying $full..."
  aws lambda update-function-code \
    --function-name "$full" \
    --zip-file "fileb://$BACKEND_ROOT/dist/lambda/$full.zip" \
    --region "$REGION"
  echo "✓ $full deployed"
}

deploy_monitor() {
  local short=$1
  local full
  full=$(get_monitor_function_name "$short")
  if [ -z "$full" ]; then
    echo "Unknown monitor: $short"
    exit 1
  fi
  echo "Deploying $full..."
  aws lambda update-function-code \
    --function-name "$full" \
    --zip-file "fileb://$BACKEND_ROOT/dist/monitors/$short.zip" \
    --region "$REGION"
  echo "✓ $full deployed"
}

deploy_all_pipeline() {
  local fn
  for fn in "${PIPELINE_FUNCTIONS[@]}"; do
    deploy_pipeline "$fn"
  done
}

deploy_all_monitors() {
  local fn
  for fn in "${MONITOR_FUNCTIONS[@]}"; do
    deploy_monitor "$fn"
  done
}

if [ -z "$TARGET" ]; then
  usage
fi

case "$TARGET" in
  all)
    package_pipeline
    package_monitors
    deploy_all_pipeline
    deploy_all_monitors
    ;;
  pipeline)
    package_pipeline
    deploy_all_pipeline
    ;;
  monitors)
    package_monitors
    deploy_all_monitors
    ;;
  stuck-job-monitor | webhook-delivery-monitor)
    package_monitors
    deploy_monitor "$TARGET"
    ;;
  api | ingest | classify | lifestyle | pillar | travel | risk)
    package_pipeline
    deploy_pipeline "$TARGET"
    ;;
  *)
    echo "Unknown target: $TARGET"
    usage
    ;;
esac
