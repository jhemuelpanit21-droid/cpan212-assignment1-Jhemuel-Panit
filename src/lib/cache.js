export class TtlCache {
  #store = new Map();
  #hits = 0;
  #misses = 0;
  #ttlSeconds;

  constructor(ttlSeconds) {
    this.#ttlSeconds = ttlSeconds;
  }

  // Counts exactly one hit or one miss per call.
  get(key) {
    const entry = this.#store.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      this.#hits++;
      return entry.value;
    }
    if (entry) this.#store.delete(key); // expired
    this.#misses++;
    return undefined;
  }

  set(key, value) {
    this.#store.set(key, {
      value,
      expiresAt: Date.now() + this.#ttlSeconds * 1000,
    });
  }

  stats() {
    const now = Date.now();
    let entries = 0;
    for (const [key, entry] of this.#store) {
      if (entry.expiresAt > now) entries++;
      else this.#store.delete(key);
    }
    return {
      entries,
      hits: this.#hits,
      misses: this.#misses,
      ttlSeconds: this.#ttlSeconds,
    };
  }
}
