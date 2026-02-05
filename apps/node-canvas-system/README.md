# 🎨 Node Canvas System

**Self-healing, modular node-based canvas with AI orchestration and automatic data coercion**

## 🎯 Key Features

### ✨ **Auto-Coercion Engine**
- Never throws errors - always returns valid data
- Automatically transforms data types to match node schemas
- Handles messy data: quotes, whitespace, type mismatches
- **Example**: `"  123  "` → `123`, `'{"a":1}'` → `{a:1}`

### 🔒 **Safety Guardrails**
- Strict node constraints (min/max size, config keys)
- Read-only fields AI cannot modify
- Connection limits per node
- Execution state validation

### 📦 **Memory Optimization**
- Collapse nodes to free RAM (state preserved)
- Lazy loading on expand
- Execution caching
- Flow history management

### 🔗 **Smart Data Linking**
- Automatic type compatibility checking
- Real-time data propagation
- Coercion audit trail
- Flow history tracking

### 🤖 **AI-Ready**
- Type-safe interfaces for AI agents
- Configuration constraints API
- Command execution with validation
- Modular executor registration

---

## 📁 Architecture

```
src/
├── types/
│   ├── schema.ts          # DataType, FieldSchema, InputSchema, OutputSchema
│   └── node.ts            # NodeDefinition, constraints, built-in nodes
│
├── core/
│   ├── data-coercer.ts    # Auto-fix engine ✨
│   ├── data-link.ts       # Node connections
│   ├── node-manager.ts    # Node lifecycle
│   └── canvas.ts          # Main orchestrator
│
└── utils/
    └── [custom executors]
```

---

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### Basic Usage

```typescript
import { CanvasOrchestrator } from './src/core/canvas';

// Create canvas
const canvas = new CanvasOrchestrator();

// Create nodes
const calc = canvas.createNode('calc-1', 'calculator');
const note = canvas.createNode('note-1', 'note');

// Connect nodes
const link = await canvas.createLink(
  'calc-1', 'result',
  'note-1', 'content'
);

// Data automatically coerces as it flows!
```

---

## 💡 Core Concepts

### 1. **Schemas Define Contract**

Every node has input and output schemas that describe what data it accepts/produces:

```typescript
const calculatorNode = {
  inputSchema: {
    fields: [
      {
        name: 'expression',
        type: 'string',
        required: true,
        coerce: { trim: true, removeQuotes: true },
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
```

### 2. **Data Coercion - Never Fails**

```typescript
const coercer = new DataCoercer();

// Input can be messy
const result = coercer.coerce(
  { price: '$99.99' },
  { fields: [{ name: 'price', type: 'number', coerce: { parseFloat: true } }] }
);

// Output is always valid
console.log(result.data.price); // 99.99
console.log(result.log);        // ["trim", "parseFloat"]
```

### 3. **Links Auto-Transform Data**

```typescript
// Connect nodes with different type expectations
const link = await canvas.createLink(
  'calculator', 'result',      // outputs: number
  'note',       'content'      // expects: string
);

// When data flows: 123 → "123" (automatic!)
```

### 4. **Constraints Ensure Safety**

```typescript
const node = {
  constraints: {
    allowedConfigKeys: ['precision', 'theme'],
    readOnlyKeys: ['id', 'type'],
    maxIncomingLinks: 1,
    maxOutgoingLinks: 5,
  },
};

// AI can only modify: precision, theme
// AI cannot touch: id, type
// Connection limits enforced automatically
```

---

## 📊 Coercion Rules

### Available Coercion Rules

| Rule | Effect | Example |
|------|--------|---------|
| `trim` | Remove whitespace | `"  hello  "` → `"hello"` |
| `removeQuotes` | Strip quotes | `'"123"'` → `123` |
| `parseInt` | Parse as integer | `"123"` → `123` |
| `parseFloat` | Parse as float | `"3.14"` → `3.14` |
| `toLowerCase` | Convert to lower | `"HELLO"` → `"hello"` |
| `toUpperCase` | Convert to upper | `"hello"` → `"HELLO"` |
| `parseJSON` | Parse JSON string | `'{"a":1}'` → `{a:1}` |
| `split` | Split string to array | `"a,b,c"` → `["a","b","c"]` |
| `join` | Join array to string | `["a","b","c"]` → `"a,b,c"` |

### Type Conversion

Automatic conversion between types:

```
string ↔ number ↔ boolean
string ↔ array (split/join)
string ↔ object (JSON parse)
any type → any other type (graceful fallback)
```

---

## 🔧 API Reference

### CanvasOrchestrator

Main coordinator for the system.

```typescript
// Node management
canvas.createNode(id, type, config?)
canvas.getNode(id)
canvas.updateNodeConfig(id, key, value, reason?)
canvas.collapseNode(id)
canvas.expandNode(id)
canvas.deleteNode(id)

// Link management
canvas.createLink(sourceId, sourceKey, targetId, targetKey)
canvas.getNodeLinks(nodeId, direction?)
canvas.deleteLink(linkId)
canvas.toggleLink(linkId)

// State management
canvas.saveState(metadata?)
canvas.loadState(state)
canvas.getState()
canvas.isDirtyState()

// Debugging
canvas.getStats()
canvas.getFlowHistory(limit?)
canvas.validate()
canvas.export()
```

### DataCoercer

Auto-fix engine for data transformation.

```typescript
const coercer = new DataCoercer();

// Main method - never throws
const result = coercer.coerce(input, schema);
// Returns: { data, log, isValid, warnings }

// Validate type compatibility
coercer.validateValue(value, expectedType) // boolean
```

### NodeManager

Manages node lifecycle and execution.

```typescript
const nodeManager = new NodeManager();

// Lifecycle
nodeManager.createNode(id, type, config?)
nodeManager.deleteNode(id)

// Config (respects constraints)
nodeManager.updateNodeConfig(id, key, value, reason?)

// Execution
nodeManager.executeNode(id, input)

// State
nodeManager.collapseNode(id)
nodeManager.expandNode(id)

// Utilities
nodeManager.getStats()
nodeManager.export()
nodeManager.import(nodes)
```

### DataLinkManager

Manages connections between nodes.

```typescript
const linkManager = new DataLinkManager();

// Create link (validates constraints)
linkManager.createLink(sourceId, sourceKey, targetId, targetKey)

// Data flow (with auto-coercion)
linkManager.flowData(linkId, data)

// Subscription
linkManager.onDataFlow(linkId, callback)

// Link control
linkManager.disableLink(linkId)
linkManager.enableLink(linkId)
linkManager.deleteLink(linkId)

// Debugging
linkManager.getFlowHistory(limit?)
linkManager.getLinkFlowHistory(linkId, limit?)
```

---

## 🧪 Testing

Run comprehensive tests:

```bash
npm run test
```

Tests cover:
- ✅ Data coercion with various types
- ✅ Node creation and management
- ✅ Data linking and constraints
- ✅ Canvas orchestration
- ✅ Complex coercion scenarios

---

## 📈 Real-world Example

**Scenario**: Calculator outputs messy data, multiple notes need clean data

```typescript
const canvas = new CanvasOrchestrator();

// Create nodes
const calc = canvas.createNode('calc-1', 'calculator');
const note1 = canvas.createNode('note-1', 'note');
const note2 = canvas.createNode('note-2', 'note');

// Connect calculator to both notes
await canvas.createLink('calc-1', 'result', 'note-1', 'content');
await canvas.createLink('calc-1', 'result', 'note-2', 'content');

// Calculator outputs: 123 (number)
// Note expects: content (string)
// Link automatically handles: 123 → "123"

// No errors, no manual conversion needed! ✅
```

---

## 🛡️ Safety Features

### Constraint Enforcement

```typescript
// Create node with constraints
const node = canvas.createNode('calc-1', 'calculator');

// AI can modify these:
canvas.updateNodeConfig('calc-1', 'precision', 4); // ✅

// AI cannot modify these:
canvas.updateNodeConfig('calc-1', 'id', 'calc-2'); // ❌ Error

// Connection limits enforced:
// If maxOutgoingLinks = 5, creating 6th link fails ❌
```

### Data Validation

```typescript
// All data is validated before flowing
const result = coercer.coerce(input, schema);

// Returns validation status
if (!result.isValid) {
  console.log('Warnings:', result.warnings);
}

// Flow history for debugging
const history = canvas.getFlowHistory(10);
```

---

## 🎮 Integration with Electron

```typescript
// In Electron main process
import { CanvasOrchestrator } from 'node-canvas-system';

const canvas = new CanvasOrchestrator();

// Listen to state changes
canvas.on('node:created', (node) => {
  mainWindow.webContents.send('canvas:node-created', node);
});

// Handle IPC from renderer
ipcMain.on('canvas:create-node', (event, args) => {
  const node = canvas.createNode(args.id, args.type);
  event.reply('canvas:node-created', node);
});
```

---

## 📚 Pre-built Node Types

### Calculator
- Evaluates math expressions
- Input: `expression` (string)
- Output: `result` (number)

### Note
- Text storage with references
- Inputs: `content` (string), `reference` (any)
- Outputs: `content` (string), `reference` (any), `savedAt` (string)

### Data Loader
- Load from files/API
- Input: `source` (string), `format` (string)
- Output: `data` (any), `format` (string)

### Data Saver
- Save to file
- Input: `data` (any), `filename` (string), `format` (string)
- Output: `success` (boolean), `path` (string)

---

## 🤝 Creating Custom Nodes

```typescript
import { INodeExecutor, ExecutionResult } from 'node-canvas-system';

class MyCustomExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const result = input.value * 2;
      return {
        success: true,
        output: { result },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Execution failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return input.value !== undefined;
  }

  getMetadata(): NodeDefinition {
    // Return node definition
  }
}

// Register
canvas.registerExecutor('my-custom', new MyCustomExecutor());

// Create instance
canvas.createNode('custom-1', 'my-custom');
```

---

## 📊 Performance Tips

1. **Collapse unused nodes** to free RAM
   ```typescript
   canvas.collapseNode('note-3');
   ```

2. **Clear flow history** periodically
   ```typescript
   canvas.clearFlowHistory();
   ```

3. **Use caching** for expensive operations
   ```typescript
   const cached = nodeManager.getCachedResult('calc-1');
   ```

---

## 🐛 Debugging

```typescript
// Get full canvas statistics
const stats = canvas.getStats();
console.log(stats);

// Get flow history
const history = canvas.getFlowHistory(20);
history.forEach(event => {
  console.log(`${event.sourceNodeId} → ${event.targetNodeId}:`, event.coercedData);
});

// Validate canvas
const validation = canvas.validate();
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}

// Get link coercion details
const link = canvas.getLink(linkId);
console.log('Latest coercion:', link.coercionLog);
```

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions welcome! Key areas:
- Custom node templates
- Performance optimizations
- UI integrations
- Documentation

---

## 📖 More Examples

See `tests/examples.ts` for comprehensive examples:
- Data coercion scenarios
- Node management workflows
- Complex linking patterns
- Canvas orchestration examples

