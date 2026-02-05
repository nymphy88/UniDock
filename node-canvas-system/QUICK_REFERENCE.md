# 🚀 Quick Reference Card

## Import Everything

```typescript
import {
  CanvasOrchestrator,
  DataCoercer,
  NodeManager,
  DataLinkManager,
  quickCoerce,
} from 'node-canvas-system';
```

---

## 1️⃣ Create Canvas & Nodes

```typescript
const canvas = new CanvasOrchestrator();

// Create nodes
const calc = canvas.createNode('calc-1', 'calculator');
const note = canvas.createNode('note-1', 'note');
const loader = canvas.createNode('loader-1', 'data-loader');
```

---

## 2️⃣ Connect Nodes

```typescript
// Create link with auto-coercion
const link = await canvas.createLink(
  'calc-1',    // source node
  'result',    // source output key
  'note-1',    // target node
  'content'    // target input key
);

// Data automatically transforms: number → string ✅
```

---

## 3️⃣ Update Configuration (AI-Safe)

```typescript
// ✅ Allowed (in constraints.allowedConfigKeys)
canvas.updateNodeConfig('calc-1', 'precision', 4, 'User request');

// ❌ Blocked (in constraints.readOnlyKeys)
canvas.updateNodeConfig('calc-1', 'id', 'calc-2'); // Error!
```

---

## 4️⃣ Manual Data Coercion

```typescript
const coercer = new DataCoercer();

const result = coercer.coerce(
  { price: '$99.99' },
  {
    fields: [
      {
        name: 'price',
        type: 'number',
        coerce: { parseFloat: true },
      },
    ],
  }
);

console.log(result.data.price);  // 99.99
console.log(result.log);         // ["parseFloat"]
console.log(result.isValid);     // true
```

---

## 5️⃣ Memory Optimization

```typescript
// Collapse nodes to free RAM (state preserved)
await canvas.collapseNode('note-3');

// Expand when needed
await canvas.expandNode('note-3');

// Check memory stats
const stats = canvas.getStats();
console.log(stats.nodes.collapsedNodes); // 1
```

---

## 6️⃣ Save & Load State

```typescript
// Save to file
const state = canvas.saveState({
  name: 'My Project',
  author: 'Developer',
});

// Save to disk (in Electron)
fs.writeFileSync('canvas.json', JSON.stringify(state));

// Load from disk
const saved = JSON.parse(fs.readFileSync('canvas.json', 'utf-8'));
await canvas.loadState(saved);
```

---

## 7️⃣ Debug & Monitor

```typescript
// Get statistics
const stats = canvas.getStats();
// { nodes: { total, loaded, collapsed, error }, links: { total, active, inactive } }

// Get flow history (last 10 events)
const history = canvas.getFlowHistory(10);

// Validate canvas integrity
const validation = canvas.validate();
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}

// Clear flow history
canvas.clearFlowHistory();
```

---

## 8️⃣ Handle Events

```typescript
const canvas = new CanvasOrchestrator();

// Node events
canvas.on('node:created', (node) => console.log('Created:', node.id));
canvas.on('node:deleted', (nodeId) => console.log('Deleted:', nodeId));
canvas.on('node:config:updated', (event) => {
  console.log(`${event.nodeId}: ${event.key} = ${event.newValue}`);
});

// Link events
canvas.on('link:created', (link) => console.log('Linked:', link.id));
canvas.on('link:deleted', (linkId) => console.log('Unlinked:', linkId));

// State events
canvas.on('state:saved', (state) => console.log('State saved'));
canvas.on('state:loaded', (state) => console.log('State loaded'));
```

---

## 🎯 Common Coercion Rules

### String Cleanup
```typescript
coerce: { trim: true, removeQuotes: true }
// "  'hello'  " → "hello"
```

### Parse Numbers
```typescript
coerce: { parseInt: true }
// "123" → 123

coerce: { parseFloat: true }
// "$99.99" → 99.99
```

### JSON Handling
```typescript
coerce: { parseJSON: true }
// '{"a":1}' → {a:1}
```

### String→Array
```typescript
coerce: { split: ',' }
// "a,b,c" → ["a", "b", "c"]
```

### Array→String
```typescript
coerce: { join: ',' }
// ["a", "b", "c"] → "a,b,c"
```

---

## 🔒 Safety Constraints

Every node has constraints:

```typescript
{
  // Size limits
  minWidth: 200,
  maxWidth: 600,
  minHeight: 100,
  maxHeight: 400,

  // Config security
  allowedConfigKeys: ['precision', 'theme'],
  readOnlyKeys: ['id', 'type'],

  // Connection limits
  allowConnections: true,
  maxIncomingLinks: 1,
  maxOutgoingLinks: 5,
}
```

---

## 📊 Data Flow Example

```
Input Data          Coercion           Output
─────────────────────────────────────────────
"  123  "    →   [trim]   →   "123"   →   123
'{"a":1}'    →   [parse]  →   {a:1}
"a,b,c"      →   [split]  →   ["a","b","c"]
```

**Key**: Data always reaches destination in correct format ✅

---

## 🧩 Create Custom Node

```typescript
class MyNodeExecutor implements INodeExecutor {
  async execute(input: Record<string, any>) {
    return {
      success: true,
      output: { result: input.value * 2 },
      executionTime: 0,
    };
  }

  validate(input: Record<string, any>) {
    return input.value !== undefined;
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'my-node',
      type: 'my-type',
      config: {},
      constraints: {
        allowedConfigKeys: [],
        readOnlyKeys: ['id', 'type'],
      },
      inputSchema: { /* ... */ },
      outputSchema: { /* ... */ },
    };
  }
}

canvas.registerExecutor('my-type', new MyNodeExecutor());
```

---

## 🔗 Link Compatibility

```typescript
// Check if nodes can connect
const compat = canvas.getLinkCompatibility(
  'calc-1', 'result',      // source
  'note-1', 'content'      // target
);

if (compat.compatible) {
  // Safe to create link
}
```

---

## 📡 Electron IPC Integration

### Preload Bridge
```typescript
// window.canvas.createNode(id, type, config)
// window.canvas.getNodes()
// window.canvas.saveState(metadata)
// window.canvas.getStats()
```

### React Component
```typescript
const [nodes, setNodes] = useState([]);

useEffect(() => {
  window.canvas.getNodes().then(setNodes);
  window.canvas.onNodeCreated((_, node) => {
    setNodes(prev => [...prev, node]);
  });
}, []);
```

---

## ⚡ Performance Tips

1. **Collapse unused nodes**
   ```typescript
   await canvas.collapseNode('expensive-node');
   ```

2. **Clear history regularly**
   ```typescript
   canvas.clearFlowHistory();
   ```

3. **Batch updates**
   ```typescript
   canvas.updateNodeConfig('node-1', 'key1', value1);
   canvas.updateNodeConfig('node-1', 'key2', value2);
   // Both apply together
   ```

4. **Check dirty state**
   ```typescript
   if (canvas.isDirtyState()) {
     // Show "unsaved changes" indicator
   }
   ```

---

## 🐛 Error Handling

```typescript
try {
  const link = await canvas.createLink(sourceId, key1, targetId, key2);
} catch (error) {
  if (error.message.includes('max incoming')) {
    console.log('Too many connections to target node');
  }
  if (error.message.includes('not found')) {
    console.log('Node not found');
  }
}
```

---

## 📝 Validation Checklist

```typescript
// Before shipping to users:
const validation = canvas.validate();

if (validation.valid) {
  console.log('✅ Canvas is valid');
} else {
  console.log('❌ Fix these:', validation.errors);
}
```

---

## 🎓 Learning Path

1. ✅ Read core concepts in README.md
2. ✅ Run tests: `npm run test`
3. ✅ Study examples in `tests/examples.ts`
4. ✅ Build simple 2-node canvas
5. ✅ Add custom node executor
6. ✅ Integrate with Electron
7. ✅ Add AI orchestration layer

---

## 🔗 Resources

- **Main Docs**: README.md
- **Electron Guide**: ELECTRON_INTEGRATION.md
- **Examples**: tests/examples.ts
- **Types**: src/types/schema.ts, src/types/node.ts
- **Source**: src/core/

---

**Need help?** Check the examples or raise an issue! 🚀
