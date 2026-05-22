FUNCTION=$1

if [ -z "$FUNCTION" ]; then
  echo "Usage: ./deploy.sh [classify|lifestyle|pillar|travel|risk|api|ingest|all]"
  exit 1
fi

echo "Building all Lambda packages..."
node backend/scripts/package-functions.mjs

declare -A FUNCTION_MAP=(
  [classify]=ventus-classify-transactions
  [lifestyle]=ventus-analyze-lifestyle-signals
  [pillar]=ventus-analyze-pillar-transactions
  [travel]=ventus-travel-detection
  [risk]=ventus-risk-detection
  [api]=ventus-api
  [ingest]=ventus-ingest-transactions
)

deploy() {
  local short=$1
  local full=${FUNCTION_MAP[$short]}
  echo "Deploying $full..."
  aws lambda update-function-code \
    --function-name $full \
    --zip-file fileb://backend/dist/lambda/$full.zip \
    --region us-east-2
  echo "✓ $full deployed"
}

if [ "$FUNCTION" = "all" ]; then
  for key in "${!FUNCTION_MAP[@]}"; do
    deploy $key
  done
else
  deploy $FUNCTION
fi