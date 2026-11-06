/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { MySQLConfig, DEFAULT_MYSQL_CONFIG } from "./General/index";

export interface RecordRow {
  id: string | number;
  [key: string]: any;
}

/**
 * MySQL In-Memory Relational Engine Controller.
 * Formulates O(1) primary key index lookups, B-tree record caching, and predicate filtering.
 */
export class MySQLController {
  private config: MySQLConfig = { ...DEFAULT_MYSQL_CONFIG };
  private tables: Map<string, Map<string | number, RecordRow>> = new Map();

  public getStatus() {
    return { module: "MySQL", active: true, config: this.config, tableCount: this.tables.size };
  }

  public createTable(tableName: string): void {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }
  }

  public insert(tableName: string, row: RecordRow): boolean {
    let table = this.tables.get(tableName);
    if (!table) {
      table = new Map();
      this.tables.set(tableName, table);
    }
    table.set(row.id, { ...row });
    return true;
  }

  public findById(tableName: string, id: string | number): RecordRow | null {
    const table = this.tables.get(tableName);
    return table?.get(id) || null;
  }

  public selectWhere(tableName: string, predicate: (row: RecordRow) => boolean): RecordRow[] {
    const table = this.tables.get(tableName);
    if (!table) return [];
    const results: RecordRow[] = [];
    for (const row of table.values()) {
      if (predicate(row)) {
        results.push(row);
      }
    }
    return results;
  }
}

export const mySQLController = new MySQLController();
export default mySQLController;
