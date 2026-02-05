/**
 * Data Coercer - Auto-fix data to match target schema
 * ====================================================
 * Never throws errors - always returns valid data
 * Key insight: This prevents runtime errors between nodes
 */

import { InputSchema, FieldSchema, DataType, CoercionRules } from '../types/schema';

export interface CoercionResult {
  data: Record<string, any>;
  log: string[]; // Transformation audit trail
  isValid: boolean;
  warnings: string[];
}

export class DataCoercer {
  /**
   * Main entry point - coerce ANY data to match schema
   * GUARANTEES: Never throws, always returns valid data
   */
  coerce(
    input: Record<string, any>,
    schema: InputSchema,
    options: { verbose?: boolean } = {}
  ): CoercionResult {
    const log: string[] = [];
    const warnings: string[] = [];
    const result: Record<string, any> = {};
    let isValid = true;

    // Process each field in schema
    for (const field of schema.fields) {
      const fieldLog: string[] = [];

      try {
        let value = input[field.name];

        // Check if required field is missing
        if (
          (value === null || value === undefined || value === '') &&
          field.required
        ) {
          if (field.default !== undefined) {
            value = field.default;
            fieldLog.push(`⚠️ Missing required field, using default: ${field.default}`);
          } else {
            value = this.getDefaultForType(field.type);
            fieldLog.push(`⚠️ Missing required field, using type default: ${value}`);
            isValid = false;
            warnings.push(
              `Required field "${field.name}" is missing (field value: ${field.name})`
            );
          }
        }

        // Skip coercion if no value and not required
        if ((value === null || value === undefined) && !field.required) {
          result[field.name] = field.default ?? null;
          continue;
        }

        // Apply coercion rules
        const coercedValue = this.coerceValue(value, field, fieldLog);
        result[field.name] = coercedValue;

        log.push(`✓ [${field.name}]: ${fieldLog.join(' → ')}`);
      } catch (error) {
        // Catastrophic failure - fallback to default
        const fallback = field.default ?? this.getDefaultForType(field.type);
        result[field.name] = fallback;
        isValid = false;

        const errorMsg = error instanceof Error ? error.message : String(error);
        log.push(`❌ [${field.name}]: Failed (${errorMsg}), using default: ${fallback}`);
        warnings.push(
          `Failed to coerce field "${field.name}": ${errorMsg}`
        );
      }
    }

    return {
      data: result,
      log,
      isValid,
      warnings,
    };
  }

  /**
   * Core coercion logic - transform value based on type and rules
   */
  private coerceValue(value: any, field: FieldSchema, log: string[]): any {
    if (value === null || value === undefined) {
      return field.default ?? this.getDefaultForType(field.type);
    }

    // Apply custom coercion rules first
    if (field.coerce) {
      value = this.applyCoercionRules(value, field.coerce, log);
    }

    // Then convert to target type
    return this.convertToType(value, field.type, log);
  }

  /**
   * Apply custom coercion rules
   */
  private applyCoercionRules(
    value: any,
    rules: CoercionRules,
    log: string[]
  ): any {
    // Trim whitespace
    if (rules.trim && typeof value === 'string') {
      const before = value;
      value = value.trim();
      if (before !== value) log.push(`trim`);
    }

    // Remove quotes (both single and double)
    if (rules.removeQuotes && typeof value === 'string') {
      const before = value;
      value = value.replace(/^["']|["']$/g, '');
      if (before !== value) log.push(`removeQuotes`);
    }

    // Parse JSON
    if (rules.parseJSON && typeof value === 'string') {
      try {
        value = JSON.parse(value);
        log.push(`parseJSON`);
      } catch {
        log.push(`parseJSON(failed)`);
        // Don't throw - let next rules handle it
      }
    }

    // Parse as integer
    if (rules.parseInt && typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const num = parseInt(cleaned, 10);
      if (!isNaN(num)) {
        value = num;
        log.push(`parseInt`);
      }
    }

    // Parse as float
    if (rules.parseFloat && typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        value = num;
        log.push(`parseFloat`);
      }
    }

    // Case conversion
    if (rules.toLowerCase && typeof value === 'string') {
      value = value.toLowerCase();
      log.push(`toLowerCase`);
    }

    if (rules.toUpperCase && typeof value === 'string') {
      value = value.toUpperCase();
      log.push(`toUpperCase`);
    }

    // String split
    if (rules.split && typeof value === 'string') {
      value = value.split(rules.split).map((v) => v.trim());
      log.push(`split(${rules.split})`);
    }

    // Array join
    if (rules.join && Array.isArray(value)) {
      value = value.join(rules.join);
      log.push(`join(${rules.join})`);
    }

    return value;
  }

  /**
   * Convert value to target type
   */
  private convertToType(value: any, targetType: DataType, log: string[]): any {
    // Already correct type
    if (this.getValueType(value) === targetType) {
      return value;
    }

    switch (targetType) {
      case 'string':
        value = String(value);
        log.push(`→string`);
        break;

      case 'number':
        if (typeof value === 'string') {
          const cleaned = value.replace(/[^\d.-]/g, '');
          value = parseFloat(cleaned);
          if (isNaN(value)) {
            value = 0;
            log.push(`→number(0)`);
          } else {
            log.push(`→number`);
          }
        } else {
          value = Number(value);
          log.push(`→number`);
        }
        break;

      case 'boolean':
        if (typeof value === 'string') {
          value = ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
          log.push(`→boolean`);
        } else {
          value = Boolean(value);
          log.push(`→boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
              if (!Array.isArray(value)) throw new Error('Not an array');
              log.push(`→array(JSON)`);
            } catch {
              value = [value];
              log.push(`→array(wrapped)`);
            }
          } else {
            value = [value];
            log.push(`→array(wrapped)`);
          }
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null) {
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
              log.push(`→object(JSON)`);
            } catch {
              value = { value };
              log.push(`→object(wrapped)`);
            }
          } else {
            value = { value };
            log.push(`→object(wrapped)`);
          }
        }
        break;

      case 'json':
        // Same as object
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value);
            log.push(`→json`);
          } catch {
            value = { raw: value };
            log.push(`→json(wrapped)`);
          }
        }
        break;

      case 'any':
        // Pass through as-is
        log.push(`→any(passthrough)`);
        break;
    }

    return value;
  }

  /**
   * Get actual type of value
   */
  private getValueType(value: any): DataType {
    if (value === null || value === undefined) return 'any';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'any';
  }

  /**
   * Get default value for type
   */
  private getDefaultForType(type: DataType): any {
    const defaults: Record<DataType, any> = {
      string: '',
      number: 0,
      boolean: false,
      array: [],
      object: {},
      json: {},
      any: null,
    };
    return defaults[type];
  }

  /**
   * Validate if value matches expected type
   * (informational only, doesn't affect coercion)
   */
  validateValue(value: any, expectedType: DataType): boolean {
    const actualType = this.getValueType(value);
    if (actualType === expectedType) return true;
    if (expectedType === 'any') return true;

    // Allow some type flexibility
    const compatible: Record<string, DataType[]> = {
      number: ['string'],
      string: ['number', 'boolean'],
      boolean: ['string', 'number'],
      array: ['object', 'string'],
      object: ['string'],
    };

    return compatible[expectedType]?.includes(actualType) ?? false;
  }
}

// ============================================
// Utility functions
// ============================================

/**
 * Quick coercion helper
 */
export function quickCoerce(
  input: Record<string, any>,
  schema: InputSchema
): Record<string, any> {
  const coercer = new DataCoercer();
  return coercer.coerce(input, schema).data;
}

/**
 * Coerce with logging
 */
export function coerceWithLog(
  input: Record<string, any>,
  schema: InputSchema
): CoercionResult {
  const coercer = new DataCoercer();
  return coercer.coerce(input, schema);
}
