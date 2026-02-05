/**
 * Schema System - Defines what data nodes accept/produce
 * ============================================
 * This is the contract between nodes
 */

export type DataType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'json' | 'any';

/**
 * Coercion rules - How to auto-transform incoming data
 */
export interface CoercionRules {
  trim?: boolean;           // "  hello  " → "hello"
  removeQuotes?: boolean;   // '"123"' or "'123'" → 123
  parseInt?: boolean;       // "123" → 123
  parseFloat?: boolean;     // "123.45" → 123.45
  toLowerCase?: boolean;    // "HELLO" → "hello"
  toUpperCase?: boolean;    // "hello" → "HELLO"
  parseJSON?: boolean;      // '{"a":1}' → {a:1}
  split?: string;           // "a,b,c" → ["a", "b", "c"] (delimiter)
  join?: string;            // ["a", "b", "c"] → "a,b,c" (delimiter)
}

/**
 * Validation rules - For informational logging only
 * These don't block data flow, just warn
 */
export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  allowedValues?: any[];
  isEmail?: boolean;
  isURL?: boolean;
  isJSON?: boolean;
}

/**
 * Field definition - describes one input/output
 */
export interface FieldSchema {
  name: string;
  type: DataType;
  required: boolean;
  default?: any;
  description?: string;
  coerce?: CoercionRules;
  validate?: ValidationRules;
}

/**
 * Input schema - what a node accepts
 */
export interface InputSchema {
  fields: FieldSchema[];
  description?: string;
}

/**
 * Output schema - what a node produces
 */
export interface OutputSchema {
  fields: FieldSchema[];
  description?: string;
}

/**
 * Type compatibility check
 */
export interface TypeCompatibility {
  source: DataType;
  target: DataType;
  compatible: boolean;
  needsCoercion: boolean;
  reason?: string;
}

// ============================================
// Common pre-built schemas
// ============================================

export const CommonSchemas = {
  stringInput: {
    fields: [
      {
        name: 'value',
        type: 'string',
        required: true,
        coerce: { trim: true },
      },
    ],
  } as InputSchema,

  numberInput: {
    fields: [
      {
        name: 'value',
        type: 'number',
        required: true,
        coerce: { parseFloat: true },
      },
    ],
  } as InputSchema,

  anyInput: {
    fields: [
      {
        name: 'value',
        type: 'any',
        required: true,
      },
    ],
  } as InputSchema,

  stringOutput: {
    fields: [
      {
        name: 'value',
        type: 'string',
        required: true,
      },
    ],
  } as OutputSchema,

  numberOutput: {
    fields: [
      {
        name: 'value',
        type: 'number',
        required: true,
      },
    ],
  } as OutputSchema,

  anyOutput: {
    fields: [
      {
        name: 'value',
        type: 'any',
        required: true,
      },
    ],
  } as OutputSchema,
};
