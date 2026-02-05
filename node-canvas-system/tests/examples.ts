/**
 * Test Cases & Examples
 * =====================
 * Demonstrates the complete data coercion and node system
 */

import { DataCoercer, coerceWithLog } from '../core/data-coercer';
import { NodeManager } from '../core/node-manager';
import { DataLinkManager } from '../core/data-link';
import { CanvasOrchestrator } from '../core/canvas';
import { InputSchema, OutputSchema } from '../types/schema';
import { NodeDefinition, INodeExecutor, ExecutionResult } from '../types/node';

// ============================================
// Test 1: Data Coercion Examples
// ============================================

export function testDataCoercion(): void {
  console.log('\n🧪 TEST 1: Data Coercion\n');

  const coercer = new DataCoercer();

  // Example 1: String with quotes and spaces
  {
    const schema: InputSchema = {
      fields: [
        {
          name: 'text',
          type: 'string',
          required: true,
          coerce: { trim: true, removeQuotes: true },
        },
      ],
    };

    const result = coerceWithLog({ text: '"  Hello World  "' }, schema);
    console.log('Example 1 - String cleanup:');
    console.log('  Input:  "  Hello World  " (with quotes)');
    console.log('  Output:', result.data.text, '\n');
    console.log('  Transformations:', result.log, '\n');
  }

  // Example 2: String to number
  {
    const schema: InputSchema = {
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          coerce: { parseFloat: true },
        },
      ],
    };

    const result = coerceWithLog({ price: '$99.99' }, schema);
    console.log('Example 2 - String to number:');
    console.log('  Input:  "$99.99" (string with $)');
    console.log('  Output:', result.data.price, '\n');
    console.log('  Transformations:', result.log, '\n');
  }

  // Example 3: String to array
  {
    const schema: InputSchema = {
      fields: [
        {
          name: 'tags',
          type: 'array',
          required: true,
          coerce: { split: ',' },
        },
      ],
    };

    const result = coerceWithLog({ tags: 'react, typescript, node' }, schema);
    console.log('Example 3 - String to array:');
    console.log('  Input:  "react, typescript, node" (string)');
    console.log('  Output:', result.data.tags, '\n');
    console.log('  Transformations:', result.log, '\n');
  }

  // Example 4: JSON string to object
  {
    const schema: InputSchema = {
      fields: [
        {
          name: 'config',
          type: 'object',
          required: true,
          coerce: { parseJSON: true },
        },
      ],
    };

    const result = coerceWithLog({ config: '{"theme":"dark","size":"large"}' }, schema);
    console.log('Example 4 - JSON string to object:');
    console.log('  Input:  \'{"theme":"dark","size":"large"}\' (JSON string)');
    console.log('  Output:', result.data.config, '\n');
    console.log('  Transformations:', result.log, '\n');
  }

  // Example 5: Missing required field (fallback)
  {
    const schema: InputSchema = {
      fields: [
        {
          name: 'name',
          type: 'string',
          required: true,
          default: 'Unnamed',
        },
      ],
    };

    const result = coerceWithLog({}, schema);
    console.log('Example 5 - Missing required field:');
    console.log('  Input:  {} (empty object)');
    console.log('  Output:', result.data.name, '(default)\n');
    console.log('  Transformations:', result.log, '\n');
    console.log('  Valid?:', result.isValid, '\n');
  }
}

// ============================================
// Test 2: Node Creation & Management
// ============================================

export function testNodeManagement(): void {
  console.log('\n🧪 TEST 2: Node Management\n');

  const nodeManager = new NodeManager();

  // Create calculator node
  const calc = nodeManager.createNode('calc-1', 'calculator', { precision: 2 });
  console.log('Created node:', calc.id, '-', calc.label);

  // Create note node
  const note = nodeManager.createNode('note-1', 'note', { maxChars: 5000 });
  console.log('Created node:', note.id, '-', note.label, '\n');

  // Update config
  console.log('Updating calculator precision to 4...');
  nodeManager.updateNodeConfig('calc-1', 'precision', 4, 'User preference');
  console.log('✅ Updated\n');

  // Try to update read-only key (should fail)
  console.log('Attempting to modify read-only key "id"...');
  try {
    nodeManager.updateNodeConfig('calc-1', 'id', 'calc-2');
  } catch (error) {
    console.log('❌ Error:', (error as Error).message, '\n');
  }

  // Get stats
  const stats = nodeManager.getStats();
  console.log('Node statistics:', stats, '\n');
}

// ============================================
// Test 3: Data Linking with Auto-Coercion
// ============================================

export function testDataLinking(): void {
  console.log('\n🧪 TEST 3: Data Linking\n');

  const linkManager = new DataLinkManager();

  // Create mock nodes with schemas
  const calcNode: NodeDefinition = {
    id: 'calc-1',
    type: 'calculator',
    config: {},
    constraints: {
      allowedConfigKeys: [],
      readOnlyKeys: [],
    },
    inputSchema: {
      fields: [
        {
          name: 'expression',
          type: 'string',
          required: true,
        },
      ],
    },
    outputSchema: {
      fields: [
        {
          name: 'result',
          type: 'number',
          required: true,
        },
      ],
    },
  };

  const noteNode: NodeDefinition = {
    id: 'note-1',
    type: 'note',
    config: {},
    constraints: {
      allowedConfigKeys: [],
      readOnlyKeys: [],
    },
    inputSchema: {
      fields: [
        {
          name: 'content',
          type: 'string',
          required: true,
          coerce: { trim: true },
        },
      ],
    },
    outputSchema: {
      fields: [
        {
          name: 'content',
          type: 'string',
          required: true,
        },
      ],
    },
  };

  // Register nodes
  linkManager.registerNode(calcNode);
  linkManager.registerNode(noteNode);

  // Create link
  const link = linkManager.createLink(
    'calc-1',
    'result',
    'note-1',
    'content'
  );

  console.log('Created link:', link.id);
  console.log('  Source:', `${link.sourceNodeId}.${link.sourceKey}`);
  console.log('  Target:', `${link.targetNodeId}.${link.targetKey}\n`);

  // Simulate data flow
  console.log('Simulating data flow...');
  const flowResult = linkManager.flowData(link.id, 123);
  flowResult.then(({ coercedData, log }) => {
    console.log('Original value: 123');
    console.log('Coerced value:', coercedData);
    console.log('Transformations:', log, '\n');
  });
}

// ============================================
// Test 4: Canvas Orchestrator
// ============================================

export async function testCanvasOrchestrator(): Promise<void> {
  console.log('\n🧪 TEST 4: Canvas Orchestrator\n');

  const canvas = new CanvasOrchestrator();

  // Create nodes
  const calc = canvas.createNode('calc-1', 'calculator');
  console.log('Created:', calc.id);

  const note = canvas.createNode('note-1', 'note');
  console.log('Created:', note.id, '\n');

  // Create link
  const link = await canvas.createLink('calc-1', 'result', 'note-1', 'content');
  console.log('Created link:', link.id, '\n');

  // Get statistics
  const stats = canvas.getStats();
  console.log('Canvas statistics:');
  console.log('  Nodes:', stats.nodes);
  console.log('  Links:', stats.links, '\n');

  // Save state
  const state = canvas.saveState({ name: 'My Canvas', author: 'Developer' });
  console.log('Saved canvas state with', state.nodes.length, 'nodes and', state.links.length, 'links\n');

  // Validate
  const validation = canvas.validate();
  console.log('Canvas validation:');
  console.log('  Valid?:', validation.valid);
  console.log('  Errors:', validation.errors.length ? validation.errors : 'None', '\n');
}

// ============================================
// Test 5: Complex Coercion Scenario
// ============================================

export function testComplexCoercion(): void {
  console.log('\n🧪 TEST 5: Complex Coercion Scenario\n');

  // Scenario: Calculator outputs messy data, Note needs clean data
  const calculatorOutput: OutputSchema = {
    fields: [
      {
        name: 'result',
        type: 'number',
        required: true,
      },
    ],
  };

  const noteInput: InputSchema = {
    fields: [
      {
        name: 'content',
        type: 'string',
        required: true,
        coerce: { trim: true, removeQuotes: true },
        validate: { minLength: 1 },
      },
    ],
  };

  const coercer = new DataCoercer();

  // Various messy inputs from calculator
  const messyOutputs = [
    { result: '  123.45  ' },
    { result: '"999"' },
    { result: '[1, 2, 3]' },
    { result: null },
  ];

  console.log('Transforming calculator outputs → note input:\n');

  for (const output of messyOutputs) {
    const result = coercer.coerce(
      { content: String(output.result) },
      noteInput
    );

    console.log('Input:');
    console.log('  Result value:', output.result);
    console.log('Coerced:');
    console.log('  Content:', result.data.content);
    console.log('  Valid?:', result.isValid);
    console.log('  Transformations:', result.log);
    console.log();
  }
}

// ============================================
// Run all tests
// ============================================

export async function runAllTests(): Promise<void> {
  console.log('\n═════════════════════════════════════════════════════════════');
  console.log('   🚀 NODE CANVAS SYSTEM - COMPREHENSIVE TESTS');
  console.log('═════════════════════════════════════════════════════════════\n');

  testDataCoercion();
  testNodeManagement();
  testDataLinking();
  await testCanvasOrchestrator();
  testComplexCoercion();

  console.log('\n═════════════════════════════════════════════════════════════');
  console.log('   ✅ All tests completed');
  console.log('═════════════════════════════════════════════════════════════\n');
}

// Export for testing
if (require.main === module) {
  runAllTests().catch(console.error);
}
