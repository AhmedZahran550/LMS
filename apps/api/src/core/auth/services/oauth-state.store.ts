import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

interface OAuthStateEntry {
  role?: string;
  expiresAt: Date;
}

@Injectable()
export class OAuthStateStore {
  private readonly store = new Map<string, OAuthStateEntry>();
  private readonly TTL_MS = 10 * 60 * 1000;

  save(role?: string): string {
    const state = randomUUID();
    this.store.set(state, {
      role,
      expiresAt: new Date(Date.now() + this.TTL_MS),
    });
    return state;
  }

  consume(state: string): string | undefined {
    const entry = this.store.get(state);
    if (!entry || entry.expiresAt < new Date()) {
      this.store.delete(state);
      return undefined;
    }
    this.store.delete(state);
    return entry.role;
  }
}
