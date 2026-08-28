export function normalizeBenchmarkPredictionContract(row, options = {}) {
  const rawConfidenceScore = row?.confidence_score;
  const repairs = [];
  const violations = [];
  const confidenceScore = normalizeConfidenceScore(rawConfidenceScore, { repairs, violations });

  validateAllowedCategory({
    value: row?.lifestyle_category,
    allowedValues: options.allowedLifestyleCategories,
    field: 'lifestyle_category',
    violations,
  });
  validateAllowedCategory({
    value: row?.merchant_category,
    allowedValues: options.allowedMerchantCategories,
    field: 'merchant_category',
    violations,
  });

  return {
    confidence_score: confidenceScore,
    raw_confidence_score: rawConfidenceScore,
    contract_repair: {
      repaired: repairs.length > 0,
      repairs,
      violations,
    },
  };
}

function normalizeConfidenceScore(value, { repairs, violations }) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    violations.push({
      field: 'confidence_score',
      code: 'non_numeric_confidence',
      raw_value: value,
    });
    return numeric;
  }

  if (numeric >= 0 && numeric <= 1) return numeric;

  if (numeric < 0 && numeric >= -1) {
    const repaired = Math.abs(numeric);
    repairs.push({
      field: 'confidence_score',
      code: 'negative_confidence_sign_repaired',
      raw_value: value,
      repaired_value: repaired,
    });
    return repaired;
  }

  if (numeric > 1 && numeric <= 100) {
    const repaired = numeric / 100;
    repairs.push({
      field: 'confidence_score',
      code: 'percentage_confidence_repaired',
      raw_value: value,
      repaired_value: repaired,
    });
    return repaired;
  }

  violations.push({
    field: 'confidence_score',
    code: 'confidence_out_of_bounds',
    raw_value: value,
  });
  return numeric;
}

function validateAllowedCategory({ value, allowedValues, field, violations }) {
  if (!Array.isArray(allowedValues) || allowedValues.length === 0) return;
  if (allowedValues.includes(value)) return;
  violations.push({
    field,
    code: 'category_outside_allowed_taxonomy',
    raw_value: value,
  });
}
