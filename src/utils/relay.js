const RELAY_TYPE_PREFIX = /^[A-Za-z_][A-Za-z0-9_]*:/;

const base64Decode = (value) => {
  if (typeof atob === 'function') return atob(value);
  return Buffer.from(value, 'base64').toString('binary');
};

/**
 * Returns the primary key carried by a relay global id ("<Type>:<pk>" in
 * base64). Values that are not relay ids (raw UUIDs, integers, null) are
 * returned unchanged, so the function is safe to apply more than once.
 */
export function decodeRelayId(id) {
  if (typeof id !== 'string' || id === '' || /^\d+$/.test(id) || id.includes('-')) return id;
  let decoded;
  try {
    decoded = base64Decode(id);
  } catch (e) {
    return id;
  }
  if (!RELAY_TYPE_PREFIX.test(decoded)) return id;
  return decoded.slice(decoded.indexOf(':') + 1);
}

/**
 * Deep copy of a GraphQL payload in which every `id` field holding a relay
 * global id is replaced by the raw primary key. Nested connections
 * (edges/node) are walked too, so ids sent back as UUID/Int mutation
 * arguments or used in routes are always raw keys.
 */
export function decodeNestedIds(value) {
  if (Array.isArray(value)) return value.map(decodeNestedIds);
  if (value === null || typeof value !== 'object') return value;
  const result = {};
  Object.keys(value).forEach((key) => {
    result[key] = key === 'id' ? decodeRelayId(value[key]) : decodeNestedIds(value[key]);
  });
  return result;
}
