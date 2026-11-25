import type {
  PosAdapter,
  PosProvider,
} from "./types";

const adapters = new Map<PosProvider, PosAdapter>();

export function registerPosAdapter(
  adapter: PosAdapter
) {
  adapters.set(adapter.provider, adapter);
}

export function getPosAdapter(
  provider: PosProvider
): PosAdapter {
  const adapter = adapters.get(provider);

  if (!adapter) {
    throw new Error(
      `POS adapter not registered: ${provider}`
    );
  }

  return adapter;
}
