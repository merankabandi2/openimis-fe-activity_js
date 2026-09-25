// Resolves '@openimis/fe-core' to a local stub and extensionless relative
// imports to '.js' files, so the module sources load under `node --test`.
const STUB = new URL('./fe-core-stub.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@openimis/fe-core') {
    return { url: STUB, shortCircuit: true };
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[cm]?js$/.test(specifier)) {
    return nextResolve(`${specifier}.js`, context);
  }
  return nextResolve(specifier, context);
}
