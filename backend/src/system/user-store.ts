/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS BUILDER USER STORE
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-07T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.system.user-store.20261007.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'developer' | 'super_admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

class UserStore {
  private readonly filePath = process.env['ORUS_USER_STORE_FILE'] || resolve(process.cwd(), '.orus-data', 'users.json');
  private readonly users = new Map<string, StoredUser>();

  constructor() {
    this.load();
  }

  findById(id: string): StoredUser | undefined {
    return this.users.get(id);
  }

  findByEmail(email: string): StoredUser | undefined {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.users.values()).find(user => user.email === normalized);
  }

  save(user: StoredUser): StoredUser {
    this.users.set(user.id, user);
    this.persist();
    return user;
  }

  clear(): void {
    this.users.clear();
    this.persist();
  }

  private load(): void {
    if (process.env['NODE_ENV'] === 'test' || !existsSync(this.filePath)) return;
    try {
      const stored = JSON.parse(readFileSync(this.filePath, 'utf8')) as StoredUser[];
      if (!Array.isArray(stored)) throw new Error('Invalid user store');
      stored.forEach(user => this.users.set(user.id, user));
    } catch {
      renameSync(this.filePath, `${this.filePath}.corrupt-${Date.now()}`);
    }
  }

  private persist(): void {
    if (process.env['NODE_ENV'] === 'test') return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(Array.from(this.users.values()), null, 2), 'utf8');
    renameSync(temporaryPath, this.filePath);
  }
}

export const userStore = new UserStore();
