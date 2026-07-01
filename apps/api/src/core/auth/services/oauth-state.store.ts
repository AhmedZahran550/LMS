import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

interface OAuthStateEntry {
  role?: string;
  client?: string;
  expiresAt: Date;
}

@Injectable()
export class OAuthStateStore {
  private readonly store = new Map<string, OAuthStateEntry>();
  private readonly TTL_MS = 10 * 60 * 1000;

  save(role?: string, client?: string): string {
    const state = randomUUID();
    this.store.set(state, {
      role,
      client,
      expiresAt: new Date(Date.now() + this.TTL_MS),
    });
    return state;
  }

  consume(state: string): { role?: string; client?: string } | undefined {
    const entry = this.store.get(state);
    if (!entry || entry.expiresAt < new Date()) {
      this.store.delete(state);
      return undefined;
    }
    this.store.delete(state);
    return { role: entry.role, client: entry.client };
  }
}
