export type ConditionalLogic = {
  action: "show" | "hide";
  operator: "AND" | "OR";
  conditions: {
    fieldName: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_empty" | "is_empty";
    value: string;
  }[];
};

type FormValues = Record<string, unknown>;

function evaluateCondition(
  condition: ConditionalLogic["conditions"][0],
  values: FormValues
): boolean {
  const fieldValue = values[condition.fieldName];
  const strValue = String(fieldValue ?? "").trim();
  const condValue = condition.value;

  switch (condition.operator) {
    case "equals":
      return strValue === condValue;
    case "not_equals":
      return strValue !== condValue;
    case "greater_than":
      return parseFloat(strValue) > parseFloat(condValue);
    case "less_than":
      return parseFloat(strValue) < parseFloat(condValue);
    case "contains":
      return strValue.toLowerCase().includes(condValue.toLowerCase());
    case "not_empty":
      return strValue !== "" && fieldValue !== null && fieldValue !== undefined;
    case "is_empty":
      return strValue === "" || fieldValue === null || fieldValue === undefined;
    default:
      return false;
  }
}

/**
 * Returns true if a field should be VISIBLE given the current form values.
 */
export function isFieldVisible(
  logic: ConditionalLogic | null | undefined,
  values: FormValues
): boolean {
  if (!logic || !logic.conditions?.length) return true;

  const results = logic.conditions.map((c) => evaluateCondition(c, values));
  const conditionMet =
    logic.operator === "AND" ? results.every(Boolean) : results.some(Boolean);

  return logic.action === "show" ? conditionMet : !conditionMet;
}
