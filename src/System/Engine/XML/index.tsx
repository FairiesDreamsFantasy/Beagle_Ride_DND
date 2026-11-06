/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { XMLConfig, DEFAULT_XML_CONFIG } from "./General/index";

export interface XMLNode {
  tag: string;
  attributes: Record<string, string>;
  children: XMLNode[];
  text?: string;
}

/**
 * XML Tree Parser & Serialization Controller.
 * Provides hierarchical node serialization and document tree building.
 */
export class XMLController {
  private config: XMLConfig = { ...DEFAULT_XML_CONFIG };

  public getStatus() {
    return { module: "XML", active: true, config: this.config };
  }

  /**
   * Serializes an XMLNode hierarchy into a well-formed XML string.
   */
  public serialize(node: XMLNode, indent: number = 0): string {
    const spaces = " ".repeat(indent);
    const attrStr = Object.entries(node.attributes)
      .map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`)
      .join("");

    if (node.children.length === 0 && !node.text) {
      return `${spaces}<${node.tag}${attrStr} />`;
    }

    if (node.children.length === 0 && node.text) {
      return `${spaces}<${node.tag}${attrStr}>${node.text}</${node.tag}>`;
    }

    const childLines = node.children.map(c => this.serialize(c, indent + 2)).join("\n");
    return `${spaces}<${node.tag}${attrStr}>\n${childLines}\n${spaces}</${node.tag}>`;
  }
}

export const xMLController = new XMLController();
export default xMLController;
