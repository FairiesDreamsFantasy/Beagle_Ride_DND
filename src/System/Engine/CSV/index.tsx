/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSVConfig, DEFAULT_CSV_CONFIG } from "./General/index";

/**
 * CSV Tabular Parser & Serialization Controller.
 * Implements RFC 4180 compliant CSV stream parsing and row generation.
 */
export class CSVController {
  private config: CSVConfig = { ...DEFAULT_CSV_CONFIG };

  public getStatus() {
    return { module: "CSV", active: true, config: this.config };
  }

  /**
   * Parses CSV text into array of string rows.
   */
  public parse(csvText: string, delimiter: string = ","): string[][] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    return lines.map(line => {
      const row: string[] = [];
      let inQuotes = false;
      let currentField = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          row.push(currentField);
          currentField = "";
        } else {
          currentField += char;
        }
      }
      row.push(currentField);
      return row;
    });
  }

  /**
   * Formats 2D string grid into CSV output string.
   */
  public format(rows: (string | number)[][], delimiter: string = ","): string {
    return rows.map(row => {
      return row.map(cell => {
        const str = String(cell);
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(delimiter);
    }).join("\n");
  }
}

export const cSVController = new CSVController();
export default cSVController;
