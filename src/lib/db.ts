import fs from 'fs';
import path from 'path';
import { AdGroup, AdSource, MOCK_AD_GROUPS } from './waterfall-types';

const DB_DIR = path.join(process.env.COZE_WORKSPACE_PATH || '/workspace/projects', 'data');
const DB_FILE = path.join(DB_DIR, 'waterfall-db.json');

interface Database {
  groups: AdGroup[];
}

function getDefaultDb(): Database {
  const groups: AdGroup[] = JSON.parse(JSON.stringify(MOCK_AD_GROUPS));
  // JSON.stringify converts Infinity to null, restore sentinel value for default group
  groups.forEach(g => {
    if (g.priority === null) {
      g.priority = 999;
    }
  });
  return { groups };
}

function readDb(): Database {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const defaultDb = getDefaultDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw) as Database;
    return data;
  } catch {
    const defaultDb = getDefaultDb();
    return defaultDb;
  }
}

function writeDb(db: Database): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// ============ Groups ============

export function getAllGroups(): AdGroup[] {
  return readDb().groups;
}

export function getGroupById(id: string): AdGroup | undefined {
  return readDb().groups.find((g) => g.id === id);
}

export function createGroup(group: AdGroup): AdGroup {
  const db = readDb();
  db.groups.push(group);
  writeDb(db);
  return group;
}

export function updateGroup(id: string, updates: Partial<AdGroup>): AdGroup | null {
  const db = readDb();
  const index = db.groups.findIndex((g) => g.id === id);
  if (index === -1) return null;
  db.groups[index] = { ...db.groups[index], ...updates };
  writeDb(db);
  return db.groups[index];
}

export function deleteGroup(id: string): boolean {
  const db = readDb();
  const index = db.groups.findIndex((g) => g.id === id);
  if (index === -1) return false;
  db.groups.splice(index, 1);
  writeDb(db);
  return true;
}

// ============ Sources ============

export function getSourceById(sourceId: string): AdSource | undefined {
  const db = readDb();
  for (const group of db.groups) {
    const source = group.adSources.find((s) => s.id === sourceId);
    if (source) return source;
  }
  return undefined;
}

export function addSourceToGroup(groupId: string, source: AdSource): AdSource | null {
  const db = readDb();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null;
  group.adSources.push(source);
  writeDb(db);
  return source;
}

export function updateSource(sourceId: string, updates: Partial<AdSource>): AdSource | null {
  const db = readDb();
  for (const group of db.groups) {
    const index = group.adSources.findIndex((s) => s.id === sourceId);
    if (index !== -1) {
      group.adSources[index] = { ...group.adSources[index], ...updates };
      writeDb(db);
      return group.adSources[index];
    }
  }
  return null;
}

export function deleteSource(sourceId: string): boolean {
  const db = readDb();
  for (const group of db.groups) {
    const index = group.adSources.findIndex((s) => s.id === sourceId);
    if (index !== -1) {
      group.adSources.splice(index, 1);
      writeDb(db);
      return true;
    }
  }
  return false;
}

export function batchUpdateSources(sourceIds: string[], updates: Partial<AdSource>): number {
  const db = readDb();
  let count = 0;
  for (const group of db.groups) {
    for (const source of group.adSources) {
      if (sourceIds.includes(source.id)) {
        Object.assign(source, updates);
        count++;
      }
    }
  }
  if (count > 0) writeDb(db);
  return count;
}

// ============ Reset ============

export function resetDatabase(): Database {
  const db = getDefaultDb();
  writeDb(db);
  return db;
}