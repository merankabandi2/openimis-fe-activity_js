/**
 * GraphQL literal for a choice-backed filter argument. graphene-django types
 * filters on Django choice fields as enums, so the value is sent unquoted;
 * integer choices are exposed as `A_<value>`.
 */
export const enumLiteral = (value) => (/^\d+$/.test(String(value)) ? `A_${value}` : String(value));

/** Quarter number carried by a QuarterlyExecutionQuarter enum value ("A_2" -> 2). */
export const quarterNumber = (value) => {
  if (value === null || value === undefined) return null;
  const match = /(\d+)$/.exec(String(value));
  return match ? parseInt(match[1], 10) : null;
};
