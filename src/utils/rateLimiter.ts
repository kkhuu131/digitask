interface RateLimitConfig {
  maxRequests: number; // Maximum requests per window
  windowMs: number; // Time window in milliseconds
  cooldownMs: number; // Cooldown period between messages
}

interface RateLimitState {
  requests: number;
  lastRequest: number;
  windowStart: number;
}

class RateLimiter {
  private config: RateLimitConfig;
  private states: Map<string, RateLimitState>;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.states = new Map();
  }

  private getState(key: string): RateLimitState {
    if (!this.states.has(key)) {
      this.states.set(key, {
        requests: 0,
        lastRequest: 0,
        windowStart: Date.now(),
      });
    }
    return this.states.get(key)!;
  }

  private cleanupOldStates() {
    const now = Date.now();
    for (const [key, state] of this.states.entries()) {
      if (now - state.windowStart > this.config.windowMs) {
        this.states.delete(key);
      }
    }
  }

  canMakeRequest(key: string): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
  } {
    this.cleanupOldStates();
    const state = this.getState(key);
    const now = Date.now();

    // Check if we're in a new window
    if (now - state.windowStart > this.config.windowMs) {
      state.requests = 0;
      state.windowStart = now;
    }

    // Check cooldown
    const timeSinceLastRequest = now - state.lastRequest;
    if (timeSinceLastRequest < this.config.cooldownMs) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: this.config.cooldownMs - timeSinceLastRequest,
      };
    }

    // Check rate limit
    if (state.requests >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: this.config.windowMs - (now - state.windowStart),
      };
    }

    state.requests++;
    state.lastRequest = now;

    return {
      allowed: true,
      remaining: this.config.maxRequests - state.requests,
      resetIn: this.config.windowMs - (now - state.windowStart),
    };
  }
}

// Create a singleton instance with typical limits for an AI chat feature
export const rateLimiter = new RateLimiter({
  maxRequests: 50, // 50 messages per window
  windowMs: 3600000, // 1 hour window
  cooldownMs: 2000, // 2 seconds between messages
});
