import Nc, { ipcMain as mn, app as Ys, screen as Ru, BrowserWindow as Ou } from "electron";
import Qs from "path";
import { fileURLToPath as Tu } from "url";
import le from "node:process";
import ae from "node:path";
import { promisify as we, isDeepStrictEqual as Oi } from "node:util";
import ne from "node:fs";
import tt from "node:crypto";
import Ti from "node:assert";
import Cc from "node:os";
import "node:events";
import "node:stream";
const dt = (t) => {
  const e = typeof t;
  return t !== null && (e === "object" || e === "function");
}, Dc = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Lc = 1e6, Pu = (t) => t >= "0" && t <= "9";
function qc(t) {
  if (t === "0")
    return !0;
  if (/^[1-9]\d*$/.test(t)) {
    const e = Number.parseInt(t, 10);
    return e <= Number.MAX_SAFE_INTEGER && e <= Lc;
  }
  return !1;
}
function Cn(t, e) {
  return Dc.has(t) ? !1 : (t && qc(t) ? e.push(Number.parseInt(t, 10)) : e.push(t), !0);
}
function ku(t) {
  if (typeof t != "string")
    throw new TypeError(`Expected a string, got ${typeof t}`);
  const e = [];
  let r = "", n = "start", i = !1, s = 0;
  for (const a of t) {
    if (s++, i) {
      r += a, i = !1;
      continue;
    }
    if (a === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${a}' in an index at position ${s}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${a}' after an index at position ${s}`);
      i = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (a) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${a}' in an index at position ${s}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!Cn(r, e))
          return [];
        r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${a}' in an index at position ${s}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((r || n === "property") && !Cn(r, e))
            return [];
          r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (r === "")
            r = (e.pop() || "") + "[]", n = "property";
          else {
            const o = Number.parseInt(r, 10);
            !Number.isNaN(o) && Number.isFinite(o) && o >= 0 && o <= Number.MAX_SAFE_INTEGER && o <= Lc && r === String(o) ? e.push(o) : e.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${a}' after an index at position ${s}`);
        r += a;
        break;
      }
      default: {
        if (n === "index" && !Pu(a))
          throw new Error(`Invalid character '${a}' in an index at position ${s}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${a}' after an index at position ${s}`);
        n === "start" && (n = "property"), r += a;
      }
    }
  }
  switch (i && (r += "\\"), n) {
    case "property": {
      if (!Cn(r, e))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      e.push("");
      break;
    }
  }
  return e;
}
function yn(t) {
  if (typeof t == "string")
    return ku(t);
  if (Array.isArray(t)) {
    const e = [];
    for (const [r, n] of t.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (Dc.has(n))
        return [];
      typeof n == "string" && qc(n) ? e.push(Number.parseInt(n, 10)) : e.push(n);
    }
    return e;
  }
  return [];
}
function Pi(t, e, r) {
  if (!dt(t) || typeof e != "string" && !Array.isArray(e))
    return r === void 0 ? t : r;
  const n = yn(e);
  if (n.length === 0)
    return r;
  for (let i = 0; i < n.length; i++) {
    const s = n[i];
    if (t = t[s], t == null) {
      if (i !== n.length - 1)
        return r;
      break;
    }
  }
  return t === void 0 ? r : t;
}
function Qt(t, e, r) {
  if (!dt(t) || typeof e != "string" && !Array.isArray(e))
    return t;
  const n = t, i = yn(e);
  if (i.length === 0)
    return t;
  for (let s = 0; s < i.length; s++) {
    const a = i[s];
    if (s === i.length - 1)
      t[a] = r;
    else if (!dt(t[a])) {
      const c = typeof i[s + 1] == "number";
      t[a] = c ? [] : {};
    }
    t = t[a];
  }
  return n;
}
function Au(t, e) {
  if (!dt(t) || typeof e != "string" && !Array.isArray(e))
    return !1;
  const r = yn(e);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const i = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(t, i) ? (delete t[i], !0) : !1;
    if (t = t[i], !dt(t))
      return !1;
  }
}
function Dn(t, e) {
  if (!dt(t) || typeof e != "string" && !Array.isArray(e))
    return !1;
  const r = yn(e);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!dt(t) || !(n in t))
      return !1;
    t = t[n];
  }
  return !0;
}
const Ze = Cc.homedir(), li = Cc.tmpdir(), { env: Tt } = le, Iu = (t) => {
  const e = ae.join(Ze, "Library");
  return {
    data: ae.join(e, "Application Support", t),
    config: ae.join(e, "Preferences", t),
    cache: ae.join(e, "Caches", t),
    log: ae.join(e, "Logs", t),
    temp: ae.join(li, t)
  };
}, ju = (t) => {
  const e = Tt.APPDATA || ae.join(Ze, "AppData", "Roaming"), r = Tt.LOCALAPPDATA || ae.join(Ze, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ae.join(r, t, "Data"),
    config: ae.join(e, t, "Config"),
    cache: ae.join(r, t, "Cache"),
    log: ae.join(r, t, "Log"),
    temp: ae.join(li, t)
  };
}, Nu = (t) => {
  const e = ae.basename(Ze);
  return {
    data: ae.join(Tt.XDG_DATA_HOME || ae.join(Ze, ".local", "share"), t),
    config: ae.join(Tt.XDG_CONFIG_HOME || ae.join(Ze, ".config"), t),
    cache: ae.join(Tt.XDG_CACHE_HOME || ae.join(Ze, ".cache"), t),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ae.join(Tt.XDG_STATE_HOME || ae.join(Ze, ".local", "state"), t),
    temp: ae.join(li, e, t)
  };
};
function Cu(t, { suffix: e = "nodejs" } = {}) {
  if (typeof t != "string")
    throw new TypeError(`Expected a string, got ${typeof t}`);
  return e && (t += `-${e}`), le.platform === "darwin" ? Iu(t) : le.platform === "win32" ? ju(t) : Nu(t);
}
const Ge = (t, e) => {
  const { onError: r } = e;
  return function(...i) {
    return t.apply(void 0, i).catch(r);
  };
}, xe = (t, e) => {
  const { onError: r } = e;
  return function(...i) {
    try {
      return t.apply(void 0, i);
    } catch (s) {
      return r(s);
    }
  };
}, Du = 250, He = (t, e) => {
  const { isRetriable: r } = e;
  return function(i) {
    const { timeout: s } = i, a = i.interval ?? Du, o = Date.now() + s;
    return function c(...u) {
      return t.apply(void 0, u).catch((l) => {
        if (!r(l) || Date.now() >= o)
          throw l;
        const m = Math.round(a * Math.random());
        return m > 0 ? new Promise((h) => setTimeout(h, m)).then(() => c.apply(void 0, u)) : c.apply(void 0, u);
      });
    };
  };
}, We = (t, e) => {
  const { isRetriable: r } = e;
  return function(i) {
    const { timeout: s } = i, a = Date.now() + s;
    return function(...c) {
      for (; ; )
        try {
          return t.apply(void 0, c);
        } catch (u) {
          if (!r(u) || Date.now() >= a)
            throw u;
          continue;
        }
    };
  };
}, Pt = {
  /* API */
  isChangeErrorOk: (t) => {
    if (!Pt.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "ENOSYS" || !Lu && (e === "EINVAL" || e === "EPERM");
  },
  isNodeError: (t) => t instanceof Error,
  isRetriableError: (t) => {
    if (!Pt.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "EMFILE" || e === "ENFILE" || e === "EAGAIN" || e === "EBUSY" || e === "EACCESS" || e === "EACCES" || e === "EACCS" || e === "EPERM";
  },
  onChangeError: (t) => {
    if (!Pt.isNodeError(t))
      throw t;
    if (!Pt.isChangeErrorOk(t))
      throw t;
  }
}, Zt = {
  onError: Pt.onChangeError
}, Te = {
  onError: () => {
  }
}, Lu = le.getuid ? !le.getuid() : !1, be = {
  isRetriable: Pt.isRetriableError
}, Ee = {
  attempt: {
    /* ASYNC */
    chmod: Ge(we(ne.chmod), Zt),
    chown: Ge(we(ne.chown), Zt),
    close: Ge(we(ne.close), Te),
    fsync: Ge(we(ne.fsync), Te),
    mkdir: Ge(we(ne.mkdir), Te),
    realpath: Ge(we(ne.realpath), Te),
    stat: Ge(we(ne.stat), Te),
    unlink: Ge(we(ne.unlink), Te),
    /* SYNC */
    chmodSync: xe(ne.chmodSync, Zt),
    chownSync: xe(ne.chownSync, Zt),
    closeSync: xe(ne.closeSync, Te),
    existsSync: xe(ne.existsSync, Te),
    fsyncSync: xe(ne.fsync, Te),
    mkdirSync: xe(ne.mkdirSync, Te),
    realpathSync: xe(ne.realpathSync, Te),
    statSync: xe(ne.statSync, Te),
    unlinkSync: xe(ne.unlinkSync, Te)
  },
  retry: {
    /* ASYNC */
    close: He(we(ne.close), be),
    fsync: He(we(ne.fsync), be),
    open: He(we(ne.open), be),
    readFile: He(we(ne.readFile), be),
    rename: He(we(ne.rename), be),
    stat: He(we(ne.stat), be),
    write: He(we(ne.write), be),
    writeFile: He(we(ne.writeFile), be),
    /* SYNC */
    closeSync: We(ne.closeSync, be),
    fsyncSync: We(ne.fsyncSync, be),
    openSync: We(ne.openSync, be),
    readFileSync: We(ne.readFileSync, be),
    renameSync: We(ne.renameSync, be),
    statSync: We(ne.statSync, be),
    writeSync: We(ne.writeSync, be),
    writeFileSync: We(ne.writeFileSync, be)
  }
}, qu = "utf8", ki = 438, Uu = 511, Mu = {}, xu = le.geteuid ? le.geteuid() : -1, Fu = le.getegid ? le.getegid() : -1, Vu = 1e3, zu = !!le.getuid;
le.getuid && le.getuid();
const Ai = 128, Bu = (t) => t instanceof Error && "code" in t, Ii = (t) => typeof t == "string", Ln = (t) => t === void 0, Ku = le.platform === "linux", Uc = le.platform === "win32", di = ["SIGHUP", "SIGINT", "SIGTERM"];
Uc || di.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Ku && di.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Gu {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (e) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        e && (Uc && e !== "SIGINT" && e !== "SIGTERM" && e !== "SIGKILL" ? le.kill(le.pid, "SIGTERM") : le.kill(le.pid, e));
      }
    }, this.hook = () => {
      le.once("exit", () => this.exit());
      for (const e of di)
        try {
          le.once(e, () => this.exit(e));
        } catch {
        }
    }, this.register = (e) => (this.callbacks.add(e), () => {
      this.callbacks.delete(e);
    }), this.hook();
  }
}
const Hu = new Gu(), Wu = Hu.register, $e = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (t) => {
    const e = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), i = `.tmp-${Date.now().toString().slice(-10)}${e}`;
    return `${t}${i}`;
  },
  get: (t, e, r = !0) => {
    const n = $e.truncate(e(t));
    return n in $e.store ? $e.get(t, e, r) : ($e.store[n] = r, [n, () => delete $e.store[n]]);
  },
  purge: (t) => {
    $e.store[t] && (delete $e.store[t], Ee.attempt.unlink(t));
  },
  purgeSync: (t) => {
    $e.store[t] && (delete $e.store[t], Ee.attempt.unlinkSync(t));
  },
  purgeSyncAll: () => {
    for (const t in $e.store)
      $e.purgeSync(t);
  },
  truncate: (t) => {
    const e = ae.basename(t);
    if (e.length <= Ai)
      return t;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(e);
    if (!r)
      return t;
    const n = e.length - Ai;
    return `${t.slice(0, -e.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Wu($e.purgeSyncAll);
function Mc(t, e, r = Mu) {
  if (Ii(r))
    return Mc(t, e, { encoding: r });
  const i = { timeout: r.timeout ?? Vu };
  let s = null, a = null, o = null;
  try {
    const c = Ee.attempt.realpathSync(t), u = !!c;
    t = c || t, [a, s] = $e.get(t, r.tmpCreate || $e.create, r.tmpPurge !== !1);
    const l = zu && Ln(r.chown), m = Ln(r.mode);
    if (u && (l || m)) {
      const d = Ee.attempt.statSync(t);
      d && (r = { ...r }, l && (r.chown = { uid: d.uid, gid: d.gid }), m && (r.mode = d.mode));
    }
    if (!u) {
      const d = ae.dirname(t);
      Ee.attempt.mkdirSync(d, {
        mode: Uu,
        recursive: !0
      });
    }
    o = Ee.retry.openSync(i)(a, "w", r.mode || ki), r.tmpCreated && r.tmpCreated(a), Ii(e) ? Ee.retry.writeSync(i)(o, e, 0, r.encoding || qu) : Ln(e) || Ee.retry.writeSync(i)(o, e, 0, e.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Ee.retry.fsyncSync(i)(o) : Ee.attempt.fsync(o)), Ee.retry.closeSync(i)(o), o = null, r.chown && (r.chown.uid !== xu || r.chown.gid !== Fu) && Ee.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== ki && Ee.attempt.chmodSync(a, r.mode);
    try {
      Ee.retry.renameSync(i)(a, t);
    } catch (d) {
      if (!Bu(d) || d.code !== "ENAMETOOLONG")
        throw d;
      Ee.retry.renameSync(i)(a, $e.truncate(t));
    }
    s(), a = null;
  } finally {
    o && Ee.attempt.closeSync(o), a && $e.purge(a);
  }
}
var ji = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function hi(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var er = { exports: {} }, qn = {}, Fe = {}, rt = {}, Un = {}, Mn = {}, xn = {}, Ni;
function ln() {
  return Ni || (Ni = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
    class e {
    }
    t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class r extends e {
      constructor(f) {
        if (super(), !t.IDENTIFIER.test(f))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = f;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    t.Name = r;
    class n extends e {
      constructor(f) {
        super(), this._items = typeof f == "string" ? [f] : f;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const f = this._items[0];
        return f === "" || f === '""';
      }
      get str() {
        var f;
        return (f = this._str) !== null && f !== void 0 ? f : this._str = this._items.reduce((g, S) => `${g}${S}`, "");
      }
      get names() {
        var f;
        return (f = this._names) !== null && f !== void 0 ? f : this._names = this._items.reduce((g, S) => (S instanceof r && (g[S.str] = (g[S.str] || 0) + 1), g), {});
      }
    }
    t._Code = n, t.nil = new n("");
    function i(_, ...f) {
      const g = [_[0]];
      let S = 0;
      for (; S < f.length; )
        o(g, f[S]), g.push(_[++S]);
      return new n(g);
    }
    t._ = i;
    const s = new n("+");
    function a(_, ...f) {
      const g = [h(_[0])];
      let S = 0;
      for (; S < f.length; )
        g.push(s), o(g, f[S]), g.push(s, h(_[++S]));
      return c(g), new n(g);
    }
    t.str = a;
    function o(_, f) {
      f instanceof n ? _.push(...f._items) : f instanceof r ? _.push(f) : _.push(m(f));
    }
    t.addCodeArg = o;
    function c(_) {
      let f = 1;
      for (; f < _.length - 1; ) {
        if (_[f] === s) {
          const g = u(_[f - 1], _[f + 1]);
          if (g !== void 0) {
            _.splice(f - 1, 3, g);
            continue;
          }
          _[f++] = "+";
        }
        f++;
      }
    }
    function u(_, f) {
      if (f === '""')
        return _;
      if (_ === '""')
        return f;
      if (typeof _ == "string")
        return f instanceof r || _[_.length - 1] !== '"' ? void 0 : typeof f != "string" ? `${_.slice(0, -1)}${f}"` : f[0] === '"' ? _.slice(0, -1) + f.slice(1) : void 0;
      if (typeof f == "string" && f[0] === '"' && !(_ instanceof r))
        return `"${_}${f.slice(1)}`;
    }
    function l(_, f) {
      return f.emptyStr() ? _ : _.emptyStr() ? f : a`${_}${f}`;
    }
    t.strConcat = l;
    function m(_) {
      return typeof _ == "number" || typeof _ == "boolean" || _ === null ? _ : h(Array.isArray(_) ? _.join(",") : _);
    }
    function d(_) {
      return new n(h(_));
    }
    t.stringify = d;
    function h(_) {
      return JSON.stringify(_).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    t.safeStringify = h;
    function v(_) {
      return typeof _ == "string" && t.IDENTIFIER.test(_) ? new n(`.${_}`) : i`[${_}]`;
    }
    t.getProperty = v;
    function w(_) {
      if (typeof _ == "string" && t.IDENTIFIER.test(_))
        return new n(`${_}`);
      throw new Error(`CodeGen: invalid export name: ${_}, use explicit $id name mapping`);
    }
    t.getEsmExportName = w;
    function p(_) {
      return new n(_.toString());
    }
    t.regexpCode = p;
  })(xn)), xn;
}
var Fn = {}, Ci;
function Di() {
  return Ci || (Ci = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
    const e = ln();
    class r extends Error {
      constructor(u) {
        super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
      }
    }
    var n;
    (function(c) {
      c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
    })(n || (t.UsedValueState = n = {})), t.varKinds = {
      const: new e.Name("const"),
      let: new e.Name("let"),
      var: new e.Name("var")
    };
    class i {
      constructor({ prefixes: u, parent: l } = {}) {
        this._names = {}, this._prefixes = u, this._parent = l;
      }
      toName(u) {
        return u instanceof e.Name ? u : this.name(u);
      }
      name(u) {
        return new e.Name(this._newName(u));
      }
      _newName(u) {
        const l = this._names[u] || this._nameGroup(u);
        return `${u}${l.index++}`;
      }
      _nameGroup(u) {
        var l, m;
        if (!((m = (l = this._parent) === null || l === void 0 ? void 0 : l._prefixes) === null || m === void 0) && m.has(u) || this._prefixes && !this._prefixes.has(u))
          throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
        return this._names[u] = { prefix: u, index: 0 };
      }
    }
    t.Scope = i;
    class s extends e.Name {
      constructor(u, l) {
        super(l), this.prefix = u;
      }
      setValue(u, { property: l, itemIndex: m }) {
        this.value = u, this.scopePath = (0, e._)`.${new e.Name(l)}[${m}]`;
      }
    }
    t.ValueScopeName = s;
    const a = (0, e._)`\n`;
    class o extends i {
      constructor(u) {
        super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? a : e.nil };
      }
      get() {
        return this._scope;
      }
      name(u) {
        return new s(u, this._newName(u));
      }
      value(u, l) {
        var m;
        if (l.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const d = this.toName(u), { prefix: h } = d, v = (m = l.key) !== null && m !== void 0 ? m : l.ref;
        let w = this._values[h];
        if (w) {
          const f = w.get(v);
          if (f)
            return f;
        } else
          w = this._values[h] = /* @__PURE__ */ new Map();
        w.set(v, d);
        const p = this._scope[h] || (this._scope[h] = []), _ = p.length;
        return p[_] = l.ref, d.setValue(l, { property: h, itemIndex: _ }), d;
      }
      getValue(u, l) {
        const m = this._values[u];
        if (m)
          return m.get(l);
      }
      scopeRefs(u, l = this._values) {
        return this._reduceValues(l, (m) => {
          if (m.scopePath === void 0)
            throw new Error(`CodeGen: name "${m}" has no value`);
          return (0, e._)`${u}${m.scopePath}`;
        });
      }
      scopeCode(u = this._values, l, m) {
        return this._reduceValues(u, (d) => {
          if (d.value === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return d.value.code;
        }, l, m);
      }
      _reduceValues(u, l, m = {}, d) {
        let h = e.nil;
        for (const v in u) {
          const w = u[v];
          if (!w)
            continue;
          const p = m[v] = m[v] || /* @__PURE__ */ new Map();
          w.forEach((_) => {
            if (p.has(_))
              return;
            p.set(_, n.Started);
            let f = l(_);
            if (f) {
              const g = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
              h = (0, e._)`${h}${g} ${_} = ${f};${this.opts._n}`;
            } else if (f = d?.(_))
              h = (0, e._)`${h}${f}${this.opts._n}`;
            else
              throw new r(_);
            p.set(_, n.Completed);
          });
        }
        return h;
      }
    }
    t.ValueScope = o;
  })(Fn)), Fn;
}
var Li;
function re() {
  return Li || (Li = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
    const e = ln(), r = Di();
    var n = ln();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var i = Di();
    Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
      return i.Scope;
    } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
      return i.ValueScope;
    } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
      return i.ValueScopeName;
    } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
      return i.varKinds;
    } }), t.operators = {
      GT: new e._Code(">"),
      GTE: new e._Code(">="),
      LT: new e._Code("<"),
      LTE: new e._Code("<="),
      EQ: new e._Code("==="),
      NEQ: new e._Code("!=="),
      NOT: new e._Code("!"),
      OR: new e._Code("||"),
      AND: new e._Code("&&"),
      ADD: new e._Code("+")
    };
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames(y, E) {
        return this;
      }
    }
    class a extends s {
      constructor(y, E, k) {
        super(), this.varKind = y, this.name = E, this.rhs = k;
      }
      render({ es5: y, _n: E }) {
        const k = y ? r.varKinds.var : this.varKind, N = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${k} ${this.name}${N};` + E;
      }
      optimizeNames(y, E) {
        if (y[this.name.str])
          return this.rhs && (this.rhs = D(this.rhs, y, E)), this;
      }
      get names() {
        return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
      }
    }
    class o extends s {
      constructor(y, E, k) {
        super(), this.lhs = y, this.rhs = E, this.sideEffects = k;
      }
      render({ _n: y }) {
        return `${this.lhs} = ${this.rhs};` + y;
      }
      optimizeNames(y, E) {
        if (!(this.lhs instanceof e.Name && !y[this.lhs.str] && !this.sideEffects))
          return this.rhs = D(this.rhs, y, E), this;
      }
      get names() {
        const y = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
        return H(y, this.rhs);
      }
    }
    class c extends o {
      constructor(y, E, k, N) {
        super(y, k, N), this.op = E;
      }
      render({ _n: y }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + y;
      }
    }
    class u extends s {
      constructor(y) {
        super(), this.label = y, this.names = {};
      }
      render({ _n: y }) {
        return `${this.label}:` + y;
      }
    }
    class l extends s {
      constructor(y) {
        super(), this.label = y, this.names = {};
      }
      render({ _n: y }) {
        return `break${this.label ? ` ${this.label}` : ""};` + y;
      }
    }
    class m extends s {
      constructor(y) {
        super(), this.error = y;
      }
      render({ _n: y }) {
        return `throw ${this.error};` + y;
      }
      get names() {
        return this.error.names;
      }
    }
    class d extends s {
      constructor(y) {
        super(), this.code = y;
      }
      render({ _n: y }) {
        return `${this.code};` + y;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(y, E) {
        return this.code = D(this.code, y, E), this;
      }
      get names() {
        return this.code instanceof e._CodeOrName ? this.code.names : {};
      }
    }
    class h extends s {
      constructor(y = []) {
        super(), this.nodes = y;
      }
      render(y) {
        return this.nodes.reduce((E, k) => E + k.render(y), "");
      }
      optimizeNodes() {
        const { nodes: y } = this;
        let E = y.length;
        for (; E--; ) {
          const k = y[E].optimizeNodes();
          Array.isArray(k) ? y.splice(E, 1, ...k) : k ? y[E] = k : y.splice(E, 1);
        }
        return y.length > 0 ? this : void 0;
      }
      optimizeNames(y, E) {
        const { nodes: k } = this;
        let N = k.length;
        for (; N--; ) {
          const M = k[N];
          M.optimizeNames(y, E) || (U(y, M.names), k.splice(N, 1));
        }
        return k.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((y, E) => z(y, E.names), {});
      }
    }
    class v extends h {
      render(y) {
        return "{" + y._n + super.render(y) + "}" + y._n;
      }
    }
    class w extends h {
    }
    class p extends v {
    }
    p.kind = "else";
    class _ extends v {
      constructor(y, E) {
        super(E), this.condition = y;
      }
      render(y) {
        let E = `if(${this.condition})` + super.render(y);
        return this.else && (E += "else " + this.else.render(y)), E;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const y = this.condition;
        if (y === !0)
          return this.nodes;
        let E = this.else;
        if (E) {
          const k = E.optimizeNodes();
          E = this.else = Array.isArray(k) ? new p(k) : k;
        }
        if (E)
          return y === !1 ? E instanceof _ ? E : E.nodes : this.nodes.length ? this : new _(J(y), E instanceof _ ? [E] : E.nodes);
        if (!(y === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(y, E) {
        var k;
        if (this.else = (k = this.else) === null || k === void 0 ? void 0 : k.optimizeNames(y, E), !!(super.optimizeNames(y, E) || this.else))
          return this.condition = D(this.condition, y, E), this;
      }
      get names() {
        const y = super.names;
        return H(y, this.condition), this.else && z(y, this.else.names), y;
      }
    }
    _.kind = "if";
    class f extends v {
    }
    f.kind = "for";
    class g extends f {
      constructor(y) {
        super(), this.iteration = y;
      }
      render(y) {
        return `for(${this.iteration})` + super.render(y);
      }
      optimizeNames(y, E) {
        if (super.optimizeNames(y, E))
          return this.iteration = D(this.iteration, y, E), this;
      }
      get names() {
        return z(super.names, this.iteration.names);
      }
    }
    class S extends f {
      constructor(y, E, k, N) {
        super(), this.varKind = y, this.name = E, this.from = k, this.to = N;
      }
      render(y) {
        const E = y.es5 ? r.varKinds.var : this.varKind, { name: k, from: N, to: M } = this;
        return `for(${E} ${k}=${N}; ${k}<${M}; ${k}++)` + super.render(y);
      }
      get names() {
        const y = H(super.names, this.from);
        return H(y, this.to);
      }
    }
    class b extends f {
      constructor(y, E, k, N) {
        super(), this.loop = y, this.varKind = E, this.name = k, this.iterable = N;
      }
      render(y) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(y);
      }
      optimizeNames(y, E) {
        if (super.optimizeNames(y, E))
          return this.iterable = D(this.iterable, y, E), this;
      }
      get names() {
        return z(super.names, this.iterable.names);
      }
    }
    class $ extends v {
      constructor(y, E, k) {
        super(), this.name = y, this.args = E, this.async = k;
      }
      render(y) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(y);
      }
    }
    $.kind = "func";
    class T extends h {
      render(y) {
        return "return " + super.render(y);
      }
    }
    T.kind = "return";
    class I extends v {
      render(y) {
        let E = "try" + super.render(y);
        return this.catch && (E += this.catch.render(y)), this.finally && (E += this.finally.render(y)), E;
      }
      optimizeNodes() {
        var y, E;
        return super.optimizeNodes(), (y = this.catch) === null || y === void 0 || y.optimizeNodes(), (E = this.finally) === null || E === void 0 || E.optimizeNodes(), this;
      }
      optimizeNames(y, E) {
        var k, N;
        return super.optimizeNames(y, E), (k = this.catch) === null || k === void 0 || k.optimizeNames(y, E), (N = this.finally) === null || N === void 0 || N.optimizeNames(y, E), this;
      }
      get names() {
        const y = super.names;
        return this.catch && z(y, this.catch.names), this.finally && z(y, this.finally.names), y;
      }
    }
    class x extends v {
      constructor(y) {
        super(), this.error = y;
      }
      render(y) {
        return `catch(${this.error})` + super.render(y);
      }
    }
    x.kind = "catch";
    class G extends v {
      render(y) {
        return "finally" + super.render(y);
      }
    }
    G.kind = "finally";
    class q {
      constructor(y, E = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...E, _n: E.lines ? `
` : "" }, this._extScope = y, this._scope = new r.Scope({ parent: y }), this._nodes = [new w()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(y) {
        return this._scope.name(y);
      }
      // reserves unique name in the external scope
      scopeName(y) {
        return this._extScope.name(y);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(y, E) {
        const k = this._extScope.value(y, E);
        return (this._values[k.prefix] || (this._values[k.prefix] = /* @__PURE__ */ new Set())).add(k), k;
      }
      getScopeValue(y, E) {
        return this._extScope.getValue(y, E);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(y) {
        return this._extScope.scopeRefs(y, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(y, E, k, N) {
        const M = this._scope.toName(E);
        return k !== void 0 && N && (this._constants[M.str] = k), this._leafNode(new a(y, M, k)), M;
      }
      // `const` declaration (`var` in es5 mode)
      const(y, E, k) {
        return this._def(r.varKinds.const, y, E, k);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(y, E, k) {
        return this._def(r.varKinds.let, y, E, k);
      }
      // `var` declaration with optional assignment
      var(y, E, k) {
        return this._def(r.varKinds.var, y, E, k);
      }
      // assignment code
      assign(y, E, k) {
        return this._leafNode(new o(y, E, k));
      }
      // `+=` code
      add(y, E) {
        return this._leafNode(new c(y, t.operators.ADD, E));
      }
      // appends passed SafeExpr to code or executes Block
      code(y) {
        return typeof y == "function" ? y() : y !== e.nil && this._leafNode(new d(y)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...y) {
        const E = ["{"];
        for (const [k, N] of y)
          E.length > 1 && E.push(","), E.push(k), (k !== N || this.opts.es5) && (E.push(":"), (0, e.addCodeArg)(E, N));
        return E.push("}"), new e._Code(E);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(y, E, k) {
        if (this._blockNode(new _(y)), E && k)
          this.code(E).else().code(k).endIf();
        else if (E)
          this.code(E).endIf();
        else if (k)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(y) {
        return this._elseNode(new _(y));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new p());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(_, p);
      }
      _for(y, E) {
        return this._blockNode(y), E && this.code(E).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(y, E) {
        return this._for(new g(y), E);
      }
      // `for` statement for a range of values
      forRange(y, E, k, N, M = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const X = this._scope.toName(y);
        return this._for(new S(M, X, E, k), () => N(X));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(y, E, k, N = r.varKinds.const) {
        const M = this._scope.toName(y);
        if (this.opts.es5) {
          const X = E instanceof e.Name ? E : this.var("_arr", E);
          return this.forRange("_i", 0, (0, e._)`${X}.length`, (Z) => {
            this.var(M, (0, e._)`${X}[${Z}]`), k(M);
          });
        }
        return this._for(new b("of", N, M, E), () => k(M));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(y, E, k, N = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(y, (0, e._)`Object.keys(${E})`, k);
        const M = this._scope.toName(y);
        return this._for(new b("in", N, M, E), () => k(M));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(f);
      }
      // `label` statement
      label(y) {
        return this._leafNode(new u(y));
      }
      // `break` statement
      break(y) {
        return this._leafNode(new l(y));
      }
      // `return` statement
      return(y) {
        const E = new T();
        if (this._blockNode(E), this.code(y), E.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(T);
      }
      // `try` statement
      try(y, E, k) {
        if (!E && !k)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const N = new I();
        if (this._blockNode(N), this.code(y), E) {
          const M = this.name("e");
          this._currNode = N.catch = new x(M), E(M);
        }
        return k && (this._currNode = N.finally = new G(), this.code(k)), this._endBlockNode(x, G);
      }
      // `throw` statement
      throw(y) {
        return this._leafNode(new m(y));
      }
      // start self-balancing block
      block(y, E) {
        return this._blockStarts.push(this._nodes.length), y && this.code(y).endBlock(E), this;
      }
      // end the current self-balancing block
      endBlock(y) {
        const E = this._blockStarts.pop();
        if (E === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const k = this._nodes.length - E;
        if (k < 0 || y !== void 0 && k !== y)
          throw new Error(`CodeGen: wrong number of nodes: ${k} vs ${y} expected`);
        return this._nodes.length = E, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(y, E = e.nil, k, N) {
        return this._blockNode(new $(y, E, k)), N && this.code(N).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode($);
      }
      optimize(y = 1) {
        for (; y-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(y) {
        return this._currNode.nodes.push(y), this;
      }
      _blockNode(y) {
        this._currNode.nodes.push(y), this._nodes.push(y);
      }
      _endBlockNode(y, E) {
        const k = this._currNode;
        if (k instanceof y || E && k instanceof E)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${E ? `${y.kind}/${E.kind}` : y.kind}"`);
      }
      _elseNode(y) {
        const E = this._currNode;
        if (!(E instanceof _))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = E.else = y, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const y = this._nodes;
        return y[y.length - 1];
      }
      set _currNode(y) {
        const E = this._nodes;
        E[E.length - 1] = y;
      }
    }
    t.CodeGen = q;
    function z(R, y) {
      for (const E in y)
        R[E] = (R[E] || 0) + (y[E] || 0);
      return R;
    }
    function H(R, y) {
      return y instanceof e._CodeOrName ? z(R, y.names) : R;
    }
    function D(R, y, E) {
      if (R instanceof e.Name)
        return k(R);
      if (!N(R))
        return R;
      return new e._Code(R._items.reduce((M, X) => (X instanceof e.Name && (X = k(X)), X instanceof e._Code ? M.push(...X._items) : M.push(X), M), []));
      function k(M) {
        const X = E[M.str];
        return X === void 0 || y[M.str] !== 1 ? M : (delete y[M.str], X);
      }
      function N(M) {
        return M instanceof e._Code && M._items.some((X) => X instanceof e.Name && y[X.str] === 1 && E[X.str] !== void 0);
      }
    }
    function U(R, y) {
      for (const E in y)
        R[E] = (R[E] || 0) - (y[E] || 0);
    }
    function J(R) {
      return typeof R == "boolean" || typeof R == "number" || R === null ? !R : (0, e._)`!${O(R)}`;
    }
    t.not = J;
    const F = A(t.operators.AND);
    function B(...R) {
      return R.reduce(F);
    }
    t.and = B;
    const W = A(t.operators.OR);
    function C(...R) {
      return R.reduce(W);
    }
    t.or = C;
    function A(R) {
      return (y, E) => y === e.nil ? E : E === e.nil ? y : (0, e._)`${O(y)} ${R} ${O(E)}`;
    }
    function O(R) {
      return R instanceof e.Name ? R : (0, e._)`(${R})`;
    }
  })(Mn)), Mn;
}
var se = {}, qi;
function ie() {
  if (qi) return se;
  qi = 1, Object.defineProperty(se, "__esModule", { value: !0 }), se.checkStrictMode = se.getErrorPath = se.Type = se.useFunc = se.setEvaluated = se.evaluatedPropsToName = se.mergeEvaluated = se.eachItem = se.unescapeJsonPointer = se.escapeJsonPointer = se.escapeFragment = se.unescapeFragment = se.schemaRefOrVal = se.schemaHasRulesButRef = se.schemaHasRules = se.checkUnknownRules = se.alwaysValidSchema = se.toHash = void 0;
  const t = re(), e = ln();
  function r(b) {
    const $ = {};
    for (const T of b)
      $[T] = !0;
    return $;
  }
  se.toHash = r;
  function n(b, $) {
    return typeof $ == "boolean" ? $ : Object.keys($).length === 0 ? !0 : (i(b, $), !s($, b.self.RULES.all));
  }
  se.alwaysValidSchema = n;
  function i(b, $ = b.schema) {
    const { opts: T, self: I } = b;
    if (!T.strictSchema || typeof $ == "boolean")
      return;
    const x = I.RULES.keywords;
    for (const G in $)
      x[G] || S(b, `unknown keyword: "${G}"`);
  }
  se.checkUnknownRules = i;
  function s(b, $) {
    if (typeof b == "boolean")
      return !b;
    for (const T in b)
      if ($[T])
        return !0;
    return !1;
  }
  se.schemaHasRules = s;
  function a(b, $) {
    if (typeof b == "boolean")
      return !b;
    for (const T in b)
      if (T !== "$ref" && $.all[T])
        return !0;
    return !1;
  }
  se.schemaHasRulesButRef = a;
  function o({ topSchemaRef: b, schemaPath: $ }, T, I, x) {
    if (!x) {
      if (typeof T == "number" || typeof T == "boolean")
        return T;
      if (typeof T == "string")
        return (0, t._)`${T}`;
    }
    return (0, t._)`${b}${$}${(0, t.getProperty)(I)}`;
  }
  se.schemaRefOrVal = o;
  function c(b) {
    return m(decodeURIComponent(b));
  }
  se.unescapeFragment = c;
  function u(b) {
    return encodeURIComponent(l(b));
  }
  se.escapeFragment = u;
  function l(b) {
    return typeof b == "number" ? `${b}` : b.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  se.escapeJsonPointer = l;
  function m(b) {
    return b.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  se.unescapeJsonPointer = m;
  function d(b, $) {
    if (Array.isArray(b))
      for (const T of b)
        $(T);
    else
      $(b);
  }
  se.eachItem = d;
  function h({ mergeNames: b, mergeToName: $, mergeValues: T, resultToName: I }) {
    return (x, G, q, z) => {
      const H = q === void 0 ? G : q instanceof t.Name ? (G instanceof t.Name ? b(x, G, q) : $(x, G, q), q) : G instanceof t.Name ? ($(x, q, G), G) : T(G, q);
      return z === t.Name && !(H instanceof t.Name) ? I(x, H) : H;
    };
  }
  se.mergeEvaluated = {
    props: h({
      mergeNames: (b, $, T) => b.if((0, t._)`${T} !== true && ${$} !== undefined`, () => {
        b.if((0, t._)`${$} === true`, () => b.assign(T, !0), () => b.assign(T, (0, t._)`${T} || {}`).code((0, t._)`Object.assign(${T}, ${$})`));
      }),
      mergeToName: (b, $, T) => b.if((0, t._)`${T} !== true`, () => {
        $ === !0 ? b.assign(T, !0) : (b.assign(T, (0, t._)`${T} || {}`), w(b, T, $));
      }),
      mergeValues: (b, $) => b === !0 ? !0 : { ...b, ...$ },
      resultToName: v
    }),
    items: h({
      mergeNames: (b, $, T) => b.if((0, t._)`${T} !== true && ${$} !== undefined`, () => b.assign(T, (0, t._)`${$} === true ? true : ${T} > ${$} ? ${T} : ${$}`)),
      mergeToName: (b, $, T) => b.if((0, t._)`${T} !== true`, () => b.assign(T, $ === !0 ? !0 : (0, t._)`${T} > ${$} ? ${T} : ${$}`)),
      mergeValues: (b, $) => b === !0 ? !0 : Math.max(b, $),
      resultToName: (b, $) => b.var("items", $)
    })
  };
  function v(b, $) {
    if ($ === !0)
      return b.var("props", !0);
    const T = b.var("props", (0, t._)`{}`);
    return $ !== void 0 && w(b, T, $), T;
  }
  se.evaluatedPropsToName = v;
  function w(b, $, T) {
    Object.keys(T).forEach((I) => b.assign((0, t._)`${$}${(0, t.getProperty)(I)}`, !0));
  }
  se.setEvaluated = w;
  const p = {};
  function _(b, $) {
    return b.scopeValue("func", {
      ref: $,
      code: p[$.code] || (p[$.code] = new e._Code($.code))
    });
  }
  se.useFunc = _;
  var f;
  (function(b) {
    b[b.Num = 0] = "Num", b[b.Str = 1] = "Str";
  })(f || (se.Type = f = {}));
  function g(b, $, T) {
    if (b instanceof t.Name) {
      const I = $ === f.Num;
      return T ? I ? (0, t._)`"[" + ${b} + "]"` : (0, t._)`"['" + ${b} + "']"` : I ? (0, t._)`"/" + ${b}` : (0, t._)`"/" + ${b}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return T ? (0, t.getProperty)(b).toString() : "/" + l(b);
  }
  se.getErrorPath = g;
  function S(b, $, T = b.opts.strictSchema) {
    if (T) {
      if ($ = `strict mode: ${$}`, T === !0)
        throw new Error($);
      b.self.logger.warn($);
    }
  }
  return se.checkStrictMode = S, se;
}
var tr = {}, Ui;
function Le() {
  if (Ui) return tr;
  Ui = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const t = re(), e = {
    // validation function arguments
    data: new t.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new t.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new t.Name("instancePath"),
    parentData: new t.Name("parentData"),
    parentDataProperty: new t.Name("parentDataProperty"),
    rootData: new t.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new t.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new t.Name("vErrors"),
    // null or array of validation errors
    errors: new t.Name("errors"),
    // counter of validation errors
    this: new t.Name("this"),
    // "globals"
    self: new t.Name("self"),
    scope: new t.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new t.Name("json"),
    jsonPos: new t.Name("jsonPos"),
    jsonLen: new t.Name("jsonLen"),
    jsonPart: new t.Name("jsonPart")
  };
  return tr.default = e, tr;
}
var Mi;
function gn() {
  return Mi || (Mi = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
    const e = re(), r = ie(), n = Le();
    t.keywordError = {
      message: ({ keyword: p }) => (0, e.str)`must pass "${p}" keyword validation`
    }, t.keyword$DataError = {
      message: ({ keyword: p, schemaType: _ }) => _ ? (0, e.str)`"${p}" keyword must be ${_} ($data)` : (0, e.str)`"${p}" keyword is invalid ($data)`
    };
    function i(p, _ = t.keywordError, f, g) {
      const { it: S } = p, { gen: b, compositeRule: $, allErrors: T } = S, I = m(p, _, f);
      g ?? ($ || T) ? c(b, I) : u(S, (0, e._)`[${I}]`);
    }
    t.reportError = i;
    function s(p, _ = t.keywordError, f) {
      const { it: g } = p, { gen: S, compositeRule: b, allErrors: $ } = g, T = m(p, _, f);
      c(S, T), b || $ || u(g, n.default.vErrors);
    }
    t.reportExtraError = s;
    function a(p, _) {
      p.assign(n.default.errors, _), p.if((0, e._)`${n.default.vErrors} !== null`, () => p.if(_, () => p.assign((0, e._)`${n.default.vErrors}.length`, _), () => p.assign(n.default.vErrors, null)));
    }
    t.resetErrorsCount = a;
    function o({ gen: p, keyword: _, schemaValue: f, data: g, errsCount: S, it: b }) {
      if (S === void 0)
        throw new Error("ajv implementation error");
      const $ = p.name("err");
      p.forRange("i", S, n.default.errors, (T) => {
        p.const($, (0, e._)`${n.default.vErrors}[${T}]`), p.if((0, e._)`${$}.instancePath === undefined`, () => p.assign((0, e._)`${$}.instancePath`, (0, e.strConcat)(n.default.instancePath, b.errorPath))), p.assign((0, e._)`${$}.schemaPath`, (0, e.str)`${b.errSchemaPath}/${_}`), b.opts.verbose && (p.assign((0, e._)`${$}.schema`, f), p.assign((0, e._)`${$}.data`, g));
      });
    }
    t.extendErrors = o;
    function c(p, _) {
      const f = p.const("err", _);
      p.if((0, e._)`${n.default.vErrors} === null`, () => p.assign(n.default.vErrors, (0, e._)`[${f}]`), (0, e._)`${n.default.vErrors}.push(${f})`), p.code((0, e._)`${n.default.errors}++`);
    }
    function u(p, _) {
      const { gen: f, validateName: g, schemaEnv: S } = p;
      S.$async ? f.throw((0, e._)`new ${p.ValidationError}(${_})`) : (f.assign((0, e._)`${g}.errors`, _), f.return(!1));
    }
    const l = {
      keyword: new e.Name("keyword"),
      schemaPath: new e.Name("schemaPath"),
      // also used in JTD errors
      params: new e.Name("params"),
      propertyName: new e.Name("propertyName"),
      message: new e.Name("message"),
      schema: new e.Name("schema"),
      parentSchema: new e.Name("parentSchema")
    };
    function m(p, _, f) {
      const { createErrors: g } = p.it;
      return g === !1 ? (0, e._)`{}` : d(p, _, f);
    }
    function d(p, _, f = {}) {
      const { gen: g, it: S } = p, b = [
        h(S, f),
        v(p, f)
      ];
      return w(p, _, b), g.object(...b);
    }
    function h({ errorPath: p }, { instancePath: _ }) {
      const f = _ ? (0, e.str)`${p}${(0, r.getErrorPath)(_, r.Type.Str)}` : p;
      return [n.default.instancePath, (0, e.strConcat)(n.default.instancePath, f)];
    }
    function v({ keyword: p, it: { errSchemaPath: _ } }, { schemaPath: f, parentSchema: g }) {
      let S = g ? _ : (0, e.str)`${_}/${p}`;
      return f && (S = (0, e.str)`${S}${(0, r.getErrorPath)(f, r.Type.Str)}`), [l.schemaPath, S];
    }
    function w(p, { params: _, message: f }, g) {
      const { keyword: S, data: b, schemaValue: $, it: T } = p, { opts: I, propertyName: x, topSchemaRef: G, schemaPath: q } = T;
      g.push([l.keyword, S], [l.params, typeof _ == "function" ? _(p) : _ || (0, e._)`{}`]), I.messages && g.push([l.message, typeof f == "function" ? f(p) : f]), I.verbose && g.push([l.schema, $], [l.parentSchema, (0, e._)`${G}${q}`], [n.default.data, b]), x && g.push([l.propertyName, x]);
    }
  })(Un)), Un;
}
var xi;
function Ju() {
  if (xi) return rt;
  xi = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.boolOrEmptySchema = rt.topBoolOrEmptySchema = void 0;
  const t = gn(), e = re(), r = Le(), n = {
    message: "boolean schema is false"
  };
  function i(o) {
    const { gen: c, schema: u, validateName: l } = o;
    u === !1 ? a(o, !1) : typeof u == "object" && u.$async === !0 ? c.return(r.default.data) : (c.assign((0, e._)`${l}.errors`, null), c.return(!0));
  }
  rt.topBoolOrEmptySchema = i;
  function s(o, c) {
    const { gen: u, schema: l } = o;
    l === !1 ? (u.var(c, !1), a(o)) : u.var(c, !0);
  }
  rt.boolOrEmptySchema = s;
  function a(o, c) {
    const { gen: u, data: l } = o, m = {
      gen: u,
      keyword: "false schema",
      data: l,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, t.reportError)(m, n, void 0, c);
  }
  return rt;
}
var ge = {}, nt = {}, Fi;
function xc() {
  if (Fi) return nt;
  Fi = 1, Object.defineProperty(nt, "__esModule", { value: !0 }), nt.getRules = nt.isJSONType = void 0;
  const t = ["string", "number", "integer", "boolean", "null", "object", "array"], e = new Set(t);
  function r(i) {
    return typeof i == "string" && e.has(i);
  }
  nt.isJSONType = r;
  function n() {
    const i = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...i, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, i.number, i.string, i.array, i.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return nt.getRules = n, nt;
}
var Ve = {}, Vi;
function Fc() {
  if (Vi) return Ve;
  Vi = 1, Object.defineProperty(Ve, "__esModule", { value: !0 }), Ve.shouldUseRule = Ve.shouldUseGroup = Ve.schemaHasRulesForType = void 0;
  function t({ schema: n, self: i }, s) {
    const a = i.RULES.types[s];
    return a && a !== !0 && e(n, a);
  }
  Ve.schemaHasRulesForType = t;
  function e(n, i) {
    return i.rules.some((s) => r(n, s));
  }
  Ve.shouldUseGroup = e;
  function r(n, i) {
    var s;
    return n[i.keyword] !== void 0 || ((s = i.definition.implements) === null || s === void 0 ? void 0 : s.some((a) => n[a] !== void 0));
  }
  return Ve.shouldUseRule = r, Ve;
}
var zi;
function dn() {
  if (zi) return ge;
  zi = 1, Object.defineProperty(ge, "__esModule", { value: !0 }), ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
  const t = xc(), e = Fc(), r = gn(), n = re(), i = ie();
  var s;
  (function(f) {
    f[f.Correct = 0] = "Correct", f[f.Wrong = 1] = "Wrong";
  })(s || (ge.DataType = s = {}));
  function a(f) {
    const g = o(f.type);
    if (g.includes("null")) {
      if (f.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!g.length && f.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      f.nullable === !0 && g.push("null");
    }
    return g;
  }
  ge.getSchemaTypes = a;
  function o(f) {
    const g = Array.isArray(f) ? f : f ? [f] : [];
    if (g.every(t.isJSONType))
      return g;
    throw new Error("type must be JSONType or JSONType[]: " + g.join(","));
  }
  ge.getJSONTypes = o;
  function c(f, g) {
    const { gen: S, data: b, opts: $ } = f, T = l(g, $.coerceTypes), I = g.length > 0 && !(T.length === 0 && g.length === 1 && (0, e.schemaHasRulesForType)(f, g[0]));
    if (I) {
      const x = v(g, b, $.strictNumbers, s.Wrong);
      S.if(x, () => {
        T.length ? m(f, g, T) : p(f);
      });
    }
    return I;
  }
  ge.coerceAndCheckDataType = c;
  const u = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function l(f, g) {
    return g ? f.filter((S) => u.has(S) || g === "array" && S === "array") : [];
  }
  function m(f, g, S) {
    const { gen: b, data: $, opts: T } = f, I = b.let("dataType", (0, n._)`typeof ${$}`), x = b.let("coerced", (0, n._)`undefined`);
    T.coerceTypes === "array" && b.if((0, n._)`${I} == 'object' && Array.isArray(${$}) && ${$}.length == 1`, () => b.assign($, (0, n._)`${$}[0]`).assign(I, (0, n._)`typeof ${$}`).if(v(g, $, T.strictNumbers), () => b.assign(x, $))), b.if((0, n._)`${x} !== undefined`);
    for (const q of S)
      (u.has(q) || q === "array" && T.coerceTypes === "array") && G(q);
    b.else(), p(f), b.endIf(), b.if((0, n._)`${x} !== undefined`, () => {
      b.assign($, x), d(f, x);
    });
    function G(q) {
      switch (q) {
        case "string":
          b.elseIf((0, n._)`${I} == "number" || ${I} == "boolean"`).assign(x, (0, n._)`"" + ${$}`).elseIf((0, n._)`${$} === null`).assign(x, (0, n._)`""`);
          return;
        case "number":
          b.elseIf((0, n._)`${I} == "boolean" || ${$} === null
              || (${I} == "string" && ${$} && ${$} == +${$})`).assign(x, (0, n._)`+${$}`);
          return;
        case "integer":
          b.elseIf((0, n._)`${I} === "boolean" || ${$} === null
              || (${I} === "string" && ${$} && ${$} == +${$} && !(${$} % 1))`).assign(x, (0, n._)`+${$}`);
          return;
        case "boolean":
          b.elseIf((0, n._)`${$} === "false" || ${$} === 0 || ${$} === null`).assign(x, !1).elseIf((0, n._)`${$} === "true" || ${$} === 1`).assign(x, !0);
          return;
        case "null":
          b.elseIf((0, n._)`${$} === "" || ${$} === 0 || ${$} === false`), b.assign(x, null);
          return;
        case "array":
          b.elseIf((0, n._)`${I} === "string" || ${I} === "number"
              || ${I} === "boolean" || ${$} === null`).assign(x, (0, n._)`[${$}]`);
      }
    }
  }
  function d({ gen: f, parentData: g, parentDataProperty: S }, b) {
    f.if((0, n._)`${g} !== undefined`, () => f.assign((0, n._)`${g}[${S}]`, b));
  }
  function h(f, g, S, b = s.Correct) {
    const $ = b === s.Correct ? n.operators.EQ : n.operators.NEQ;
    let T;
    switch (f) {
      case "null":
        return (0, n._)`${g} ${$} null`;
      case "array":
        T = (0, n._)`Array.isArray(${g})`;
        break;
      case "object":
        T = (0, n._)`${g} && typeof ${g} == "object" && !Array.isArray(${g})`;
        break;
      case "integer":
        T = I((0, n._)`!(${g} % 1) && !isNaN(${g})`);
        break;
      case "number":
        T = I();
        break;
      default:
        return (0, n._)`typeof ${g} ${$} ${f}`;
    }
    return b === s.Correct ? T : (0, n.not)(T);
    function I(x = n.nil) {
      return (0, n.and)((0, n._)`typeof ${g} == "number"`, x, S ? (0, n._)`isFinite(${g})` : n.nil);
    }
  }
  ge.checkDataType = h;
  function v(f, g, S, b) {
    if (f.length === 1)
      return h(f[0], g, S, b);
    let $;
    const T = (0, i.toHash)(f);
    if (T.array && T.object) {
      const I = (0, n._)`typeof ${g} != "object"`;
      $ = T.null ? I : (0, n._)`!${g} || ${I}`, delete T.null, delete T.array, delete T.object;
    } else
      $ = n.nil;
    T.number && delete T.integer;
    for (const I in T)
      $ = (0, n.and)($, h(I, g, S, b));
    return $;
  }
  ge.checkDataTypes = v;
  const w = {
    message: ({ schema: f }) => `must be ${f}`,
    params: ({ schema: f, schemaValue: g }) => typeof f == "string" ? (0, n._)`{type: ${f}}` : (0, n._)`{type: ${g}}`
  };
  function p(f) {
    const g = _(f);
    (0, r.reportError)(g, w);
  }
  ge.reportTypeError = p;
  function _(f) {
    const { gen: g, data: S, schema: b } = f, $ = (0, i.schemaRefOrVal)(f, b, "type");
    return {
      gen: g,
      keyword: "type",
      data: S,
      schema: b.type,
      schemaCode: $,
      schemaValue: $,
      parentSchema: b,
      params: {},
      it: f
    };
  }
  return ge;
}
var Ct = {}, Bi;
function Xu() {
  if (Bi) return Ct;
  Bi = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.assignDefaults = void 0;
  const t = re(), e = ie();
  function r(i, s) {
    const { properties: a, items: o } = i.schema;
    if (s === "object" && a)
      for (const c in a)
        n(i, c, a[c].default);
    else s === "array" && Array.isArray(o) && o.forEach((c, u) => n(i, u, c.default));
  }
  Ct.assignDefaults = r;
  function n(i, s, a) {
    const { gen: o, compositeRule: c, data: u, opts: l } = i;
    if (a === void 0)
      return;
    const m = (0, t._)`${u}${(0, t.getProperty)(s)}`;
    if (c) {
      (0, e.checkStrictMode)(i, `default is ignored for: ${m}`);
      return;
    }
    let d = (0, t._)`${m} === undefined`;
    l.useDefaults === "empty" && (d = (0, t._)`${d} || ${m} === null || ${m} === ""`), o.if(d, (0, t._)`${m} = ${(0, t.stringify)(a)}`);
  }
  return Ct;
}
var je = {}, ce = {}, Ki;
function qe() {
  if (Ki) return ce;
  Ki = 1, Object.defineProperty(ce, "__esModule", { value: !0 }), ce.validateUnion = ce.validateArray = ce.usePattern = ce.callValidateCode = ce.schemaProperties = ce.allSchemaProperties = ce.noPropertyInData = ce.propertyInData = ce.isOwnProperty = ce.hasPropFunc = ce.reportMissingProp = ce.checkMissingProp = ce.checkReportMissingProp = void 0;
  const t = re(), e = ie(), r = Le(), n = ie();
  function i(f, g) {
    const { gen: S, data: b, it: $ } = f;
    S.if(l(S, b, g, $.opts.ownProperties), () => {
      f.setParams({ missingProperty: (0, t._)`${g}` }, !0), f.error();
    });
  }
  ce.checkReportMissingProp = i;
  function s({ gen: f, data: g, it: { opts: S } }, b, $) {
    return (0, t.or)(...b.map((T) => (0, t.and)(l(f, g, T, S.ownProperties), (0, t._)`${$} = ${T}`)));
  }
  ce.checkMissingProp = s;
  function a(f, g) {
    f.setParams({ missingProperty: g }, !0), f.error();
  }
  ce.reportMissingProp = a;
  function o(f) {
    return f.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, t._)`Object.prototype.hasOwnProperty`
    });
  }
  ce.hasPropFunc = o;
  function c(f, g, S) {
    return (0, t._)`${o(f)}.call(${g}, ${S})`;
  }
  ce.isOwnProperty = c;
  function u(f, g, S, b) {
    const $ = (0, t._)`${g}${(0, t.getProperty)(S)} !== undefined`;
    return b ? (0, t._)`${$} && ${c(f, g, S)}` : $;
  }
  ce.propertyInData = u;
  function l(f, g, S, b) {
    const $ = (0, t._)`${g}${(0, t.getProperty)(S)} === undefined`;
    return b ? (0, t.or)($, (0, t.not)(c(f, g, S))) : $;
  }
  ce.noPropertyInData = l;
  function m(f) {
    return f ? Object.keys(f).filter((g) => g !== "__proto__") : [];
  }
  ce.allSchemaProperties = m;
  function d(f, g) {
    return m(g).filter((S) => !(0, e.alwaysValidSchema)(f, g[S]));
  }
  ce.schemaProperties = d;
  function h({ schemaCode: f, data: g, it: { gen: S, topSchemaRef: b, schemaPath: $, errorPath: T }, it: I }, x, G, q) {
    const z = q ? (0, t._)`${f}, ${g}, ${b}${$}` : g, H = [
      [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, T)],
      [r.default.parentData, I.parentData],
      [r.default.parentDataProperty, I.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    I.opts.dynamicRef && H.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const D = (0, t._)`${z}, ${S.object(...H)}`;
    return G !== t.nil ? (0, t._)`${x}.call(${G}, ${D})` : (0, t._)`${x}(${D})`;
  }
  ce.callValidateCode = h;
  const v = (0, t._)`new RegExp`;
  function w({ gen: f, it: { opts: g } }, S) {
    const b = g.unicodeRegExp ? "u" : "", { regExp: $ } = g.code, T = $(S, b);
    return f.scopeValue("pattern", {
      key: T.toString(),
      ref: T,
      code: (0, t._)`${$.code === "new RegExp" ? v : (0, n.useFunc)(f, $)}(${S}, ${b})`
    });
  }
  ce.usePattern = w;
  function p(f) {
    const { gen: g, data: S, keyword: b, it: $ } = f, T = g.name("valid");
    if ($.allErrors) {
      const x = g.let("valid", !0);
      return I(() => g.assign(x, !1)), x;
    }
    return g.var(T, !0), I(() => g.break()), T;
    function I(x) {
      const G = g.const("len", (0, t._)`${S}.length`);
      g.forRange("i", 0, G, (q) => {
        f.subschema({
          keyword: b,
          dataProp: q,
          dataPropType: e.Type.Num
        }, T), g.if((0, t.not)(T), x);
      });
    }
  }
  ce.validateArray = p;
  function _(f) {
    const { gen: g, schema: S, keyword: b, it: $ } = f;
    if (!Array.isArray(S))
      throw new Error("ajv implementation error");
    if (S.some((G) => (0, e.alwaysValidSchema)($, G)) && !$.opts.unevaluated)
      return;
    const I = g.let("valid", !1), x = g.name("_valid");
    g.block(() => S.forEach((G, q) => {
      const z = f.subschema({
        keyword: b,
        schemaProp: q,
        compositeRule: !0
      }, x);
      g.assign(I, (0, t._)`${I} || ${x}`), f.mergeValidEvaluated(z, x) || g.if((0, t.not)(I));
    })), f.result(I, () => f.reset(), () => f.error(!0));
  }
  return ce.validateUnion = _, ce;
}
var Gi;
function Yu() {
  if (Gi) return je;
  Gi = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.validateKeywordUsage = je.validSchemaType = je.funcKeywordCode = je.macroKeywordCode = void 0;
  const t = re(), e = Le(), r = qe(), n = gn();
  function i(d, h) {
    const { gen: v, keyword: w, schema: p, parentSchema: _, it: f } = d, g = h.macro.call(f.self, p, _, f), S = u(v, w, g);
    f.opts.validateSchema !== !1 && f.self.validateSchema(g, !0);
    const b = v.name("valid");
    d.subschema({
      schema: g,
      schemaPath: t.nil,
      errSchemaPath: `${f.errSchemaPath}/${w}`,
      topSchemaRef: S,
      compositeRule: !0
    }, b), d.pass(b, () => d.error(!0));
  }
  je.macroKeywordCode = i;
  function s(d, h) {
    var v;
    const { gen: w, keyword: p, schema: _, parentSchema: f, $data: g, it: S } = d;
    c(S, h);
    const b = !g && h.compile ? h.compile.call(S.self, _, f, S) : h.validate, $ = u(w, p, b), T = w.let("valid");
    d.block$data(T, I), d.ok((v = h.valid) !== null && v !== void 0 ? v : T);
    function I() {
      if (h.errors === !1)
        q(), h.modifying && a(d), z(() => d.error());
      else {
        const H = h.async ? x() : G();
        h.modifying && a(d), z(() => o(d, H));
      }
    }
    function x() {
      const H = w.let("ruleErrs", null);
      return w.try(() => q((0, t._)`await `), (D) => w.assign(T, !1).if((0, t._)`${D} instanceof ${S.ValidationError}`, () => w.assign(H, (0, t._)`${D}.errors`), () => w.throw(D))), H;
    }
    function G() {
      const H = (0, t._)`${$}.errors`;
      return w.assign(H, null), q(t.nil), H;
    }
    function q(H = h.async ? (0, t._)`await ` : t.nil) {
      const D = S.opts.passContext ? e.default.this : e.default.self, U = !("compile" in h && !g || h.schema === !1);
      w.assign(T, (0, t._)`${H}${(0, r.callValidateCode)(d, $, D, U)}`, h.modifying);
    }
    function z(H) {
      var D;
      w.if((0, t.not)((D = h.valid) !== null && D !== void 0 ? D : T), H);
    }
  }
  je.funcKeywordCode = s;
  function a(d) {
    const { gen: h, data: v, it: w } = d;
    h.if(w.parentData, () => h.assign(v, (0, t._)`${w.parentData}[${w.parentDataProperty}]`));
  }
  function o(d, h) {
    const { gen: v } = d;
    v.if((0, t._)`Array.isArray(${h})`, () => {
      v.assign(e.default.vErrors, (0, t._)`${e.default.vErrors} === null ? ${h} : ${e.default.vErrors}.concat(${h})`).assign(e.default.errors, (0, t._)`${e.default.vErrors}.length`), (0, n.extendErrors)(d);
    }, () => d.error());
  }
  function c({ schemaEnv: d }, h) {
    if (h.async && !d.$async)
      throw new Error("async keyword in sync schema");
  }
  function u(d, h, v) {
    if (v === void 0)
      throw new Error(`keyword "${h}" failed to compile`);
    return d.scopeValue("keyword", typeof v == "function" ? { ref: v } : { ref: v, code: (0, t.stringify)(v) });
  }
  function l(d, h, v = !1) {
    return !h.length || h.some((w) => w === "array" ? Array.isArray(d) : w === "object" ? d && typeof d == "object" && !Array.isArray(d) : typeof d == w || v && typeof d > "u");
  }
  je.validSchemaType = l;
  function m({ schema: d, opts: h, self: v, errSchemaPath: w }, p, _) {
    if (Array.isArray(p.keyword) ? !p.keyword.includes(_) : p.keyword !== _)
      throw new Error("ajv implementation error");
    const f = p.dependencies;
    if (f?.some((g) => !Object.prototype.hasOwnProperty.call(d, g)))
      throw new Error(`parent schema must have dependencies of ${_}: ${f.join(",")}`);
    if (p.validateSchema && !p.validateSchema(d[_])) {
      const S = `keyword "${_}" value is invalid at path "${w}": ` + v.errorsText(p.validateSchema.errors);
      if (h.validateSchema === "log")
        v.logger.error(S);
      else
        throw new Error(S);
    }
  }
  return je.validateKeywordUsage = m, je;
}
var ze = {}, Hi;
function Qu() {
  if (Hi) return ze;
  Hi = 1, Object.defineProperty(ze, "__esModule", { value: !0 }), ze.extendSubschemaMode = ze.extendSubschemaData = ze.getSubschema = void 0;
  const t = re(), e = ie();
  function r(s, { keyword: a, schemaProp: o, schema: c, schemaPath: u, errSchemaPath: l, topSchemaRef: m }) {
    if (a !== void 0 && c !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (a !== void 0) {
      const d = s.schema[a];
      return o === void 0 ? {
        schema: d,
        schemaPath: (0, t._)`${s.schemaPath}${(0, t.getProperty)(a)}`,
        errSchemaPath: `${s.errSchemaPath}/${a}`
      } : {
        schema: d[o],
        schemaPath: (0, t._)`${s.schemaPath}${(0, t.getProperty)(a)}${(0, t.getProperty)(o)}`,
        errSchemaPath: `${s.errSchemaPath}/${a}/${(0, e.escapeFragment)(o)}`
      };
    }
    if (c !== void 0) {
      if (u === void 0 || l === void 0 || m === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: c,
        schemaPath: u,
        topSchemaRef: m,
        errSchemaPath: l
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  ze.getSubschema = r;
  function n(s, a, { dataProp: o, dataPropType: c, data: u, dataTypes: l, propertyName: m }) {
    if (u !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: d } = a;
    if (o !== void 0) {
      const { errorPath: v, dataPathArr: w, opts: p } = a, _ = d.let("data", (0, t._)`${a.data}${(0, t.getProperty)(o)}`, !0);
      h(_), s.errorPath = (0, t.str)`${v}${(0, e.getErrorPath)(o, c, p.jsPropertySyntax)}`, s.parentDataProperty = (0, t._)`${o}`, s.dataPathArr = [...w, s.parentDataProperty];
    }
    if (u !== void 0) {
      const v = u instanceof t.Name ? u : d.let("data", u, !0);
      h(v), m !== void 0 && (s.propertyName = m);
    }
    l && (s.dataTypes = l);
    function h(v) {
      s.data = v, s.dataLevel = a.dataLevel + 1, s.dataTypes = [], a.definedProperties = /* @__PURE__ */ new Set(), s.parentData = a.data, s.dataNames = [...a.dataNames, v];
    }
  }
  ze.extendSubschemaData = n;
  function i(s, { jtdDiscriminator: a, jtdMetadata: o, compositeRule: c, createErrors: u, allErrors: l }) {
    c !== void 0 && (s.compositeRule = c), u !== void 0 && (s.createErrors = u), l !== void 0 && (s.allErrors = l), s.jtdDiscriminator = a, s.jtdMetadata = o;
  }
  return ze.extendSubschemaMode = i, ze;
}
var Se = {}, Vn, Wi;
function Vc() {
  return Wi || (Wi = 1, Vn = function t(e, r) {
    if (e === r) return !0;
    if (e && r && typeof e == "object" && typeof r == "object") {
      if (e.constructor !== r.constructor) return !1;
      var n, i, s;
      if (Array.isArray(e)) {
        if (n = e.length, n != r.length) return !1;
        for (i = n; i-- !== 0; )
          if (!t(e[i], r[i])) return !1;
        return !0;
      }
      if (e.constructor === RegExp) return e.source === r.source && e.flags === r.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === r.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === r.toString();
      if (s = Object.keys(e), n = s.length, n !== Object.keys(r).length) return !1;
      for (i = n; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(r, s[i])) return !1;
      for (i = n; i-- !== 0; ) {
        var a = s[i];
        if (!t(e[a], r[a])) return !1;
      }
      return !0;
    }
    return e !== e && r !== r;
  }), Vn;
}
var zn = { exports: {} }, Ji;
function Zu() {
  if (Ji) return zn.exports;
  Ji = 1;
  var t = zn.exports = function(n, i, s) {
    typeof i == "function" && (s = i, i = {}), s = i.cb || s;
    var a = typeof s == "function" ? s : s.pre || function() {
    }, o = s.post || function() {
    };
    e(i, a, o, n, "", n);
  };
  t.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, t.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, t.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, t.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function e(n, i, s, a, o, c, u, l, m, d) {
    if (a && typeof a == "object" && !Array.isArray(a)) {
      i(a, o, c, u, l, m, d);
      for (var h in a) {
        var v = a[h];
        if (Array.isArray(v)) {
          if (h in t.arrayKeywords)
            for (var w = 0; w < v.length; w++)
              e(n, i, s, v[w], o + "/" + h + "/" + w, c, o, h, a, w);
        } else if (h in t.propsKeywords) {
          if (v && typeof v == "object")
            for (var p in v)
              e(n, i, s, v[p], o + "/" + h + "/" + r(p), c, o, h, a, p);
        } else (h in t.keywords || n.allKeys && !(h in t.skipKeywords)) && e(n, i, s, v, o + "/" + h, c, o, h, a);
      }
      s(a, o, c, u, l, m, d);
    }
  }
  function r(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return zn.exports;
}
var Xi;
function vn() {
  if (Xi) return Se;
  Xi = 1, Object.defineProperty(Se, "__esModule", { value: !0 }), Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
  const t = ie(), e = Vc(), r = Zu(), n = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function i(w, p = !0) {
    return typeof w == "boolean" ? !0 : p === !0 ? !a(w) : p ? o(w) <= p : !1;
  }
  Se.inlineRef = i;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function a(w) {
    for (const p in w) {
      if (s.has(p))
        return !0;
      const _ = w[p];
      if (Array.isArray(_) && _.some(a) || typeof _ == "object" && a(_))
        return !0;
    }
    return !1;
  }
  function o(w) {
    let p = 0;
    for (const _ in w) {
      if (_ === "$ref")
        return 1 / 0;
      if (p++, !n.has(_) && (typeof w[_] == "object" && (0, t.eachItem)(w[_], (f) => p += o(f)), p === 1 / 0))
        return 1 / 0;
    }
    return p;
  }
  function c(w, p = "", _) {
    _ !== !1 && (p = m(p));
    const f = w.parse(p);
    return u(w, f);
  }
  Se.getFullPath = c;
  function u(w, p) {
    return w.serialize(p).split("#")[0] + "#";
  }
  Se._getFullPath = u;
  const l = /#\/?$/;
  function m(w) {
    return w ? w.replace(l, "") : "";
  }
  Se.normalizeId = m;
  function d(w, p, _) {
    return _ = m(_), w.resolve(p, _);
  }
  Se.resolveUrl = d;
  const h = /^[a-z_][-a-z0-9._]*$/i;
  function v(w, p) {
    if (typeof w == "boolean")
      return {};
    const { schemaId: _, uriResolver: f } = this.opts, g = m(w[_] || p), S = { "": g }, b = c(f, g, !1), $ = {}, T = /* @__PURE__ */ new Set();
    return r(w, { allKeys: !0 }, (G, q, z, H) => {
      if (H === void 0)
        return;
      const D = b + q;
      let U = S[H];
      typeof G[_] == "string" && (U = J.call(this, G[_])), F.call(this, G.$anchor), F.call(this, G.$dynamicAnchor), S[q] = U;
      function J(B) {
        const W = this.opts.uriResolver.resolve;
        if (B = m(U ? W(U, B) : B), T.has(B))
          throw x(B);
        T.add(B);
        let C = this.refs[B];
        return typeof C == "string" && (C = this.refs[C]), typeof C == "object" ? I(G, C.schema, B) : B !== m(D) && (B[0] === "#" ? (I(G, $[B], B), $[B] = G) : this.refs[B] = D), B;
      }
      function F(B) {
        if (typeof B == "string") {
          if (!h.test(B))
            throw new Error(`invalid anchor "${B}"`);
          J.call(this, `#${B}`);
        }
      }
    }), $;
    function I(G, q, z) {
      if (q !== void 0 && !e(G, q))
        throw x(z);
    }
    function x(G) {
      return new Error(`reference "${G}" resolves to more than one schema`);
    }
  }
  return Se.getSchemaRefs = v, Se;
}
var Yi;
function Wt() {
  if (Yi) return Fe;
  Yi = 1, Object.defineProperty(Fe, "__esModule", { value: !0 }), Fe.getData = Fe.KeywordCxt = Fe.validateFunctionCode = void 0;
  const t = Ju(), e = dn(), r = Fc(), n = dn(), i = Xu(), s = Yu(), a = Qu(), o = re(), c = Le(), u = vn(), l = ie(), m = gn();
  function d(P) {
    if (b(P) && (T(P), S(P))) {
      p(P);
      return;
    }
    h(P, () => (0, t.topBoolOrEmptySchema)(P));
  }
  Fe.validateFunctionCode = d;
  function h({ gen: P, validateName: j, schema: L, schemaEnv: V, opts: K }, Q) {
    K.code.es5 ? P.func(j, (0, o._)`${c.default.data}, ${c.default.valCxt}`, V.$async, () => {
      P.code((0, o._)`"use strict"; ${f(L, K)}`), w(P, K), P.code(Q);
    }) : P.func(j, (0, o._)`${c.default.data}, ${v(K)}`, V.$async, () => P.code(f(L, K)).code(Q));
  }
  function v(P) {
    return (0, o._)`{${c.default.instancePath}="", ${c.default.parentData}, ${c.default.parentDataProperty}, ${c.default.rootData}=${c.default.data}${P.dynamicRef ? (0, o._)`, ${c.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function w(P, j) {
    P.if(c.default.valCxt, () => {
      P.var(c.default.instancePath, (0, o._)`${c.default.valCxt}.${c.default.instancePath}`), P.var(c.default.parentData, (0, o._)`${c.default.valCxt}.${c.default.parentData}`), P.var(c.default.parentDataProperty, (0, o._)`${c.default.valCxt}.${c.default.parentDataProperty}`), P.var(c.default.rootData, (0, o._)`${c.default.valCxt}.${c.default.rootData}`), j.dynamicRef && P.var(c.default.dynamicAnchors, (0, o._)`${c.default.valCxt}.${c.default.dynamicAnchors}`);
    }, () => {
      P.var(c.default.instancePath, (0, o._)`""`), P.var(c.default.parentData, (0, o._)`undefined`), P.var(c.default.parentDataProperty, (0, o._)`undefined`), P.var(c.default.rootData, c.default.data), j.dynamicRef && P.var(c.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function p(P) {
    const { schema: j, opts: L, gen: V } = P;
    h(P, () => {
      L.$comment && j.$comment && H(P), G(P), V.let(c.default.vErrors, null), V.let(c.default.errors, 0), L.unevaluated && _(P), I(P), D(P);
    });
  }
  function _(P) {
    const { gen: j, validateName: L } = P;
    P.evaluated = j.const("evaluated", (0, o._)`${L}.evaluated`), j.if((0, o._)`${P.evaluated}.dynamicProps`, () => j.assign((0, o._)`${P.evaluated}.props`, (0, o._)`undefined`)), j.if((0, o._)`${P.evaluated}.dynamicItems`, () => j.assign((0, o._)`${P.evaluated}.items`, (0, o._)`undefined`));
  }
  function f(P, j) {
    const L = typeof P == "object" && P[j.schemaId];
    return L && (j.code.source || j.code.process) ? (0, o._)`/*# sourceURL=${L} */` : o.nil;
  }
  function g(P, j) {
    if (b(P) && (T(P), S(P))) {
      $(P, j);
      return;
    }
    (0, t.boolOrEmptySchema)(P, j);
  }
  function S({ schema: P, self: j }) {
    if (typeof P == "boolean")
      return !P;
    for (const L in P)
      if (j.RULES.all[L])
        return !0;
    return !1;
  }
  function b(P) {
    return typeof P.schema != "boolean";
  }
  function $(P, j) {
    const { schema: L, gen: V, opts: K } = P;
    K.$comment && L.$comment && H(P), q(P), z(P);
    const Q = V.const("_errs", c.default.errors);
    I(P, Q), V.var(j, (0, o._)`${Q} === ${c.default.errors}`);
  }
  function T(P) {
    (0, l.checkUnknownRules)(P), x(P);
  }
  function I(P, j) {
    if (P.opts.jtd)
      return J(P, [], !1, j);
    const L = (0, e.getSchemaTypes)(P.schema), V = (0, e.coerceAndCheckDataType)(P, L);
    J(P, L, !V, j);
  }
  function x(P) {
    const { schema: j, errSchemaPath: L, opts: V, self: K } = P;
    j.$ref && V.ignoreKeywordsWithRef && (0, l.schemaHasRulesButRef)(j, K.RULES) && K.logger.warn(`$ref: keywords ignored in schema at path "${L}"`);
  }
  function G(P) {
    const { schema: j, opts: L } = P;
    j.default !== void 0 && L.useDefaults && L.strictSchema && (0, l.checkStrictMode)(P, "default is ignored in the schema root");
  }
  function q(P) {
    const j = P.schema[P.opts.schemaId];
    j && (P.baseId = (0, u.resolveUrl)(P.opts.uriResolver, P.baseId, j));
  }
  function z(P) {
    if (P.schema.$async && !P.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function H({ gen: P, schemaEnv: j, schema: L, errSchemaPath: V, opts: K }) {
    const Q = L.$comment;
    if (K.$comment === !0)
      P.code((0, o._)`${c.default.self}.logger.log(${Q})`);
    else if (typeof K.$comment == "function") {
      const oe = (0, o.str)`${V}/$comment`, fe = P.scopeValue("root", { ref: j.root });
      P.code((0, o._)`${c.default.self}.opts.$comment(${Q}, ${oe}, ${fe}.schema)`);
    }
  }
  function D(P) {
    const { gen: j, schemaEnv: L, validateName: V, ValidationError: K, opts: Q } = P;
    L.$async ? j.if((0, o._)`${c.default.errors} === 0`, () => j.return(c.default.data), () => j.throw((0, o._)`new ${K}(${c.default.vErrors})`)) : (j.assign((0, o._)`${V}.errors`, c.default.vErrors), Q.unevaluated && U(P), j.return((0, o._)`${c.default.errors} === 0`));
  }
  function U({ gen: P, evaluated: j, props: L, items: V }) {
    L instanceof o.Name && P.assign((0, o._)`${j}.props`, L), V instanceof o.Name && P.assign((0, o._)`${j}.items`, V);
  }
  function J(P, j, L, V) {
    const { gen: K, schema: Q, data: oe, allErrors: fe, opts: de, self: Oe } = P, { RULES: ye } = Oe;
    if (Q.$ref && (de.ignoreKeywordsWithRef || !(0, l.schemaHasRulesButRef)(Q, ye))) {
      K.block(() => N(P, "$ref", ye.all.$ref.definition));
      return;
    }
    de.jtd || B(P, j), K.block(() => {
      for (const Ie of ye.rules)
        ht(Ie);
      ht(ye.post);
    });
    function ht(Ie) {
      (0, r.shouldUseGroup)(Q, Ie) && (Ie.type ? (K.if((0, n.checkDataType)(Ie.type, oe, de.strictNumbers)), F(P, Ie), j.length === 1 && j[0] === Ie.type && L && (K.else(), (0, n.reportTypeError)(P)), K.endIf()) : F(P, Ie), fe || K.if((0, o._)`${c.default.errors} === ${V || 0}`));
    }
  }
  function F(P, j) {
    const { gen: L, schema: V, opts: { useDefaults: K } } = P;
    K && (0, i.assignDefaults)(P, j.type), L.block(() => {
      for (const Q of j.rules)
        (0, r.shouldUseRule)(V, Q) && N(P, Q.keyword, Q.definition, j.type);
    });
  }
  function B(P, j) {
    P.schemaEnv.meta || !P.opts.strictTypes || (W(P, j), P.opts.allowUnionTypes || C(P, j), A(P, P.dataTypes));
  }
  function W(P, j) {
    if (j.length) {
      if (!P.dataTypes.length) {
        P.dataTypes = j;
        return;
      }
      j.forEach((L) => {
        R(P.dataTypes, L) || E(P, `type "${L}" not allowed by context "${P.dataTypes.join(",")}"`);
      }), y(P, j);
    }
  }
  function C(P, j) {
    j.length > 1 && !(j.length === 2 && j.includes("null")) && E(P, "use allowUnionTypes to allow union type keyword");
  }
  function A(P, j) {
    const L = P.self.RULES.all;
    for (const V in L) {
      const K = L[V];
      if (typeof K == "object" && (0, r.shouldUseRule)(P.schema, K)) {
        const { type: Q } = K.definition;
        Q.length && !Q.some((oe) => O(j, oe)) && E(P, `missing type "${Q.join(",")}" for keyword "${V}"`);
      }
    }
  }
  function O(P, j) {
    return P.includes(j) || j === "number" && P.includes("integer");
  }
  function R(P, j) {
    return P.includes(j) || j === "integer" && P.includes("number");
  }
  function y(P, j) {
    const L = [];
    for (const V of P.dataTypes)
      R(j, V) ? L.push(V) : j.includes("integer") && V === "number" && L.push("integer");
    P.dataTypes = L;
  }
  function E(P, j) {
    const L = P.schemaEnv.baseId + P.errSchemaPath;
    j += ` at "${L}" (strictTypes)`, (0, l.checkStrictMode)(P, j, P.opts.strictTypes);
  }
  class k {
    constructor(j, L, V) {
      if ((0, s.validateKeywordUsage)(j, L, V), this.gen = j.gen, this.allErrors = j.allErrors, this.keyword = V, this.data = j.data, this.schema = j.schema[V], this.$data = L.$data && j.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, l.schemaRefOrVal)(j, this.schema, V, this.$data), this.schemaType = L.schemaType, this.parentSchema = j.schema, this.params = {}, this.it = j, this.def = L, this.$data)
        this.schemaCode = j.gen.const("vSchema", Z(this.$data, j));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, L.schemaType, L.allowUndefined))
        throw new Error(`${V} value must be ${JSON.stringify(L.schemaType)}`);
      ("code" in L ? L.trackErrors : L.errors !== !1) && (this.errsCount = j.gen.const("_errs", c.default.errors));
    }
    result(j, L, V) {
      this.failResult((0, o.not)(j), L, V);
    }
    failResult(j, L, V) {
      this.gen.if(j), V ? V() : this.error(), L ? (this.gen.else(), L(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(j, L) {
      this.failResult((0, o.not)(j), void 0, L);
    }
    fail(j) {
      if (j === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(j), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(j) {
      if (!this.$data)
        return this.fail(j);
      const { schemaCode: L } = this;
      this.fail((0, o._)`${L} !== undefined && (${(0, o.or)(this.invalid$data(), j)})`);
    }
    error(j, L, V) {
      if (L) {
        this.setParams(L), this._error(j, V), this.setParams({});
        return;
      }
      this._error(j, V);
    }
    _error(j, L) {
      (j ? m.reportExtraError : m.reportError)(this, this.def.error, L);
    }
    $dataError() {
      (0, m.reportError)(this, this.def.$dataError || m.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, m.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(j) {
      this.allErrors || this.gen.if(j);
    }
    setParams(j, L) {
      L ? Object.assign(this.params, j) : this.params = j;
    }
    block$data(j, L, V = o.nil) {
      this.gen.block(() => {
        this.check$data(j, V), L();
      });
    }
    check$data(j = o.nil, L = o.nil) {
      if (!this.$data)
        return;
      const { gen: V, schemaCode: K, schemaType: Q, def: oe } = this;
      V.if((0, o.or)((0, o._)`${K} === undefined`, L)), j !== o.nil && V.assign(j, !0), (Q.length || oe.validateSchema) && (V.elseIf(this.invalid$data()), this.$dataError(), j !== o.nil && V.assign(j, !1)), V.else();
    }
    invalid$data() {
      const { gen: j, schemaCode: L, schemaType: V, def: K, it: Q } = this;
      return (0, o.or)(oe(), fe());
      function oe() {
        if (V.length) {
          if (!(L instanceof o.Name))
            throw new Error("ajv implementation error");
          const de = Array.isArray(V) ? V : [V];
          return (0, o._)`${(0, n.checkDataTypes)(de, L, Q.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function fe() {
        if (K.validateSchema) {
          const de = j.scopeValue("validate$data", { ref: K.validateSchema });
          return (0, o._)`!${de}(${L})`;
        }
        return o.nil;
      }
    }
    subschema(j, L) {
      const V = (0, a.getSubschema)(this.it, j);
      (0, a.extendSubschemaData)(V, this.it, j), (0, a.extendSubschemaMode)(V, j);
      const K = { ...this.it, ...V, items: void 0, props: void 0 };
      return g(K, L), K;
    }
    mergeEvaluated(j, L) {
      const { it: V, gen: K } = this;
      V.opts.unevaluated && (V.props !== !0 && j.props !== void 0 && (V.props = l.mergeEvaluated.props(K, j.props, V.props, L)), V.items !== !0 && j.items !== void 0 && (V.items = l.mergeEvaluated.items(K, j.items, V.items, L)));
    }
    mergeValidEvaluated(j, L) {
      const { it: V, gen: K } = this;
      if (V.opts.unevaluated && (V.props !== !0 || V.items !== !0))
        return K.if(L, () => this.mergeEvaluated(j, o.Name)), !0;
    }
  }
  Fe.KeywordCxt = k;
  function N(P, j, L, V) {
    const K = new k(P, L, j);
    "code" in L ? L.code(K, V) : K.$data && L.validate ? (0, s.funcKeywordCode)(K, L) : "macro" in L ? (0, s.macroKeywordCode)(K, L) : (L.compile || L.validate) && (0, s.funcKeywordCode)(K, L);
  }
  const M = /^\/(?:[^~]|~0|~1)*$/, X = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Z(P, { dataLevel: j, dataNames: L, dataPathArr: V }) {
    let K, Q;
    if (P === "")
      return c.default.rootData;
    if (P[0] === "/") {
      if (!M.test(P))
        throw new Error(`Invalid JSON-pointer: ${P}`);
      K = P, Q = c.default.rootData;
    } else {
      const Oe = X.exec(P);
      if (!Oe)
        throw new Error(`Invalid JSON-pointer: ${P}`);
      const ye = +Oe[1];
      if (K = Oe[2], K === "#") {
        if (ye >= j)
          throw new Error(de("property/index", ye));
        return V[j - ye];
      }
      if (ye > j)
        throw new Error(de("data", ye));
      if (Q = L[j - ye], !K)
        return Q;
    }
    let oe = Q;
    const fe = K.split("/");
    for (const Oe of fe)
      Oe && (Q = (0, o._)`${Q}${(0, o.getProperty)((0, l.unescapeJsonPointer)(Oe))}`, oe = (0, o._)`${oe} && ${Q}`);
    return oe;
    function de(Oe, ye) {
      return `Cannot access ${Oe} ${ye} levels up, current level is ${j}`;
    }
  }
  return Fe.getData = Z, Fe;
}
var rr = {}, Qi;
function _n() {
  if (Qi) return rr;
  Qi = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  class t extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return rr.default = t, rr;
}
var nr = {}, Zi;
function Jt() {
  if (Zi) return nr;
  Zi = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const t = vn();
  class e extends Error {
    constructor(n, i, s, a) {
      super(a || `can't resolve reference ${s} from id ${i}`), this.missingRef = (0, t.resolveUrl)(n, i, s), this.missingSchema = (0, t.normalizeId)((0, t.getFullPath)(n, this.missingRef));
    }
  }
  return nr.default = e, nr;
}
var Pe = {}, ea;
function wn() {
  if (ea) return Pe;
  ea = 1, Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.resolveSchema = Pe.getCompilingSchema = Pe.resolveRef = Pe.compileSchema = Pe.SchemaEnv = void 0;
  const t = re(), e = _n(), r = Le(), n = vn(), i = ie(), s = Wt();
  class a {
    constructor(_) {
      var f;
      this.refs = {}, this.dynamicAnchors = {};
      let g;
      typeof _.schema == "object" && (g = _.schema), this.schema = _.schema, this.schemaId = _.schemaId, this.root = _.root || this, this.baseId = (f = _.baseId) !== null && f !== void 0 ? f : (0, n.normalizeId)(g?.[_.schemaId || "$id"]), this.schemaPath = _.schemaPath, this.localRefs = _.localRefs, this.meta = _.meta, this.$async = g?.$async, this.refs = {};
    }
  }
  Pe.SchemaEnv = a;
  function o(p) {
    const _ = l.call(this, p);
    if (_)
      return _;
    const f = (0, n.getFullPath)(this.opts.uriResolver, p.root.baseId), { es5: g, lines: S } = this.opts.code, { ownProperties: b } = this.opts, $ = new t.CodeGen(this.scope, { es5: g, lines: S, ownProperties: b });
    let T;
    p.$async && (T = $.scopeValue("Error", {
      ref: e.default,
      code: (0, t._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const I = $.scopeName("validate");
    p.validateName = I;
    const x = {
      gen: $,
      allErrors: this.opts.allErrors,
      data: r.default.data,
      parentData: r.default.parentData,
      parentDataProperty: r.default.parentDataProperty,
      dataNames: [r.default.data],
      dataPathArr: [t.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: $.scopeValue("schema", this.opts.code.source === !0 ? { ref: p.schema, code: (0, t.stringify)(p.schema) } : { ref: p.schema }),
      validateName: I,
      ValidationError: T,
      schema: p.schema,
      schemaEnv: p,
      rootId: f,
      baseId: p.baseId || f,
      schemaPath: t.nil,
      errSchemaPath: p.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, t._)`""`,
      opts: this.opts,
      self: this
    };
    let G;
    try {
      this._compilations.add(p), (0, s.validateFunctionCode)(x), $.optimize(this.opts.code.optimize);
      const q = $.toString();
      G = `${$.scopeRefs(r.default.scope)}return ${q}`, this.opts.code.process && (G = this.opts.code.process(G, p));
      const H = new Function(`${r.default.self}`, `${r.default.scope}`, G)(this, this.scope.get());
      if (this.scope.value(I, { ref: H }), H.errors = null, H.schema = p.schema, H.schemaEnv = p, p.$async && (H.$async = !0), this.opts.code.source === !0 && (H.source = { validateName: I, validateCode: q, scopeValues: $._values }), this.opts.unevaluated) {
        const { props: D, items: U } = x;
        H.evaluated = {
          props: D instanceof t.Name ? void 0 : D,
          items: U instanceof t.Name ? void 0 : U,
          dynamicProps: D instanceof t.Name,
          dynamicItems: U instanceof t.Name
        }, H.source && (H.source.evaluated = (0, t.stringify)(H.evaluated));
      }
      return p.validate = H, p;
    } catch (q) {
      throw delete p.validate, delete p.validateName, G && this.logger.error("Error compiling schema, function code:", G), q;
    } finally {
      this._compilations.delete(p);
    }
  }
  Pe.compileSchema = o;
  function c(p, _, f) {
    var g;
    f = (0, n.resolveUrl)(this.opts.uriResolver, _, f);
    const S = p.refs[f];
    if (S)
      return S;
    let b = d.call(this, p, f);
    if (b === void 0) {
      const $ = (g = p.localRefs) === null || g === void 0 ? void 0 : g[f], { schemaId: T } = this.opts;
      $ && (b = new a({ schema: $, schemaId: T, root: p, baseId: _ }));
    }
    if (b !== void 0)
      return p.refs[f] = u.call(this, b);
  }
  Pe.resolveRef = c;
  function u(p) {
    return (0, n.inlineRef)(p.schema, this.opts.inlineRefs) ? p.schema : p.validate ? p : o.call(this, p);
  }
  function l(p) {
    for (const _ of this._compilations)
      if (m(_, p))
        return _;
  }
  Pe.getCompilingSchema = l;
  function m(p, _) {
    return p.schema === _.schema && p.root === _.root && p.baseId === _.baseId;
  }
  function d(p, _) {
    let f;
    for (; typeof (f = this.refs[_]) == "string"; )
      _ = f;
    return f || this.schemas[_] || h.call(this, p, _);
  }
  function h(p, _) {
    const f = this.opts.uriResolver.parse(_), g = (0, n._getFullPath)(this.opts.uriResolver, f);
    let S = (0, n.getFullPath)(this.opts.uriResolver, p.baseId, void 0);
    if (Object.keys(p.schema).length > 0 && g === S)
      return w.call(this, f, p);
    const b = (0, n.normalizeId)(g), $ = this.refs[b] || this.schemas[b];
    if (typeof $ == "string") {
      const T = h.call(this, p, $);
      return typeof T?.schema != "object" ? void 0 : w.call(this, f, T);
    }
    if (typeof $?.schema == "object") {
      if ($.validate || o.call(this, $), b === (0, n.normalizeId)(_)) {
        const { schema: T } = $, { schemaId: I } = this.opts, x = T[I];
        return x && (S = (0, n.resolveUrl)(this.opts.uriResolver, S, x)), new a({ schema: T, schemaId: I, root: p, baseId: S });
      }
      return w.call(this, f, $);
    }
  }
  Pe.resolveSchema = h;
  const v = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function w(p, { baseId: _, schema: f, root: g }) {
    var S;
    if (((S = p.fragment) === null || S === void 0 ? void 0 : S[0]) !== "/")
      return;
    for (const T of p.fragment.slice(1).split("/")) {
      if (typeof f == "boolean")
        return;
      const I = f[(0, i.unescapeFragment)(T)];
      if (I === void 0)
        return;
      f = I;
      const x = typeof f == "object" && f[this.opts.schemaId];
      !v.has(T) && x && (_ = (0, n.resolveUrl)(this.opts.uriResolver, _, x));
    }
    let b;
    if (typeof f != "boolean" && f.$ref && !(0, i.schemaHasRulesButRef)(f, this.RULES)) {
      const T = (0, n.resolveUrl)(this.opts.uriResolver, _, f.$ref);
      b = h.call(this, g, T);
    }
    const { schemaId: $ } = this.opts;
    if (b = b || new a({ schema: f, schemaId: $, root: g, baseId: _ }), b.schema !== b.root.schema)
      return b;
  }
  return Pe;
}
const el = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", tl = "Meta-schema for $data reference (JSON AnySchema extension proposal)", rl = "object", nl = ["$data"], sl = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, il = !1, al = {
  $id: el,
  description: tl,
  type: rl,
  required: nl,
  properties: sl,
  additionalProperties: il
};
var sr = {}, Dt = { exports: {} }, Bn, ta;
function zc() {
  if (ta) return Bn;
  ta = 1;
  const t = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), e = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function r(d) {
    let h = "", v = 0, w = 0;
    for (w = 0; w < d.length; w++)
      if (v = d[w].charCodeAt(0), v !== 48) {
        if (!(v >= 48 && v <= 57 || v >= 65 && v <= 70 || v >= 97 && v <= 102))
          return "";
        h += d[w];
        break;
      }
    for (w += 1; w < d.length; w++) {
      if (v = d[w].charCodeAt(0), !(v >= 48 && v <= 57 || v >= 65 && v <= 70 || v >= 97 && v <= 102))
        return "";
      h += d[w];
    }
    return h;
  }
  const n = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function i(d) {
    return d.length = 0, !0;
  }
  function s(d, h, v) {
    if (d.length) {
      const w = r(d);
      if (w !== "")
        h.push(w);
      else
        return v.error = !0, !1;
      d.length = 0;
    }
    return !0;
  }
  function a(d) {
    let h = 0;
    const v = { error: !1, address: "", zone: "" }, w = [], p = [];
    let _ = !1, f = !1, g = s;
    for (let S = 0; S < d.length; S++) {
      const b = d[S];
      if (!(b === "[" || b === "]"))
        if (b === ":") {
          if (_ === !0 && (f = !0), !g(p, w, v))
            break;
          if (++h > 7) {
            v.error = !0;
            break;
          }
          S > 0 && d[S - 1] === ":" && (_ = !0), w.push(":");
          continue;
        } else if (b === "%") {
          if (!g(p, w, v))
            break;
          g = i;
        } else {
          p.push(b);
          continue;
        }
    }
    return p.length && (g === i ? v.zone = p.join("") : f ? w.push(p.join("")) : w.push(r(p))), v.address = w.join(""), v;
  }
  function o(d) {
    if (c(d, ":") < 2)
      return { host: d, isIPV6: !1 };
    const h = a(d);
    if (h.error)
      return { host: d, isIPV6: !1 };
    {
      let v = h.address, w = h.address;
      return h.zone && (v += "%" + h.zone, w += "%25" + h.zone), { host: v, isIPV6: !0, escapedHost: w };
    }
  }
  function c(d, h) {
    let v = 0;
    for (let w = 0; w < d.length; w++)
      d[w] === h && v++;
    return v;
  }
  function u(d) {
    let h = d;
    const v = [];
    let w = -1, p = 0;
    for (; p = h.length; ) {
      if (p === 1) {
        if (h === ".")
          break;
        if (h === "/") {
          v.push("/");
          break;
        } else {
          v.push(h);
          break;
        }
      } else if (p === 2) {
        if (h[0] === ".") {
          if (h[1] === ".")
            break;
          if (h[1] === "/") {
            h = h.slice(2);
            continue;
          }
        } else if (h[0] === "/" && (h[1] === "." || h[1] === "/")) {
          v.push("/");
          break;
        }
      } else if (p === 3 && h === "/..") {
        v.length !== 0 && v.pop(), v.push("/");
        break;
      }
      if (h[0] === ".") {
        if (h[1] === ".") {
          if (h[2] === "/") {
            h = h.slice(3);
            continue;
          }
        } else if (h[1] === "/") {
          h = h.slice(2);
          continue;
        }
      } else if (h[0] === "/" && h[1] === ".") {
        if (h[2] === "/") {
          h = h.slice(2);
          continue;
        } else if (h[2] === "." && h[3] === "/") {
          h = h.slice(3), v.length !== 0 && v.pop();
          continue;
        }
      }
      if ((w = h.indexOf("/", 1)) === -1) {
        v.push(h);
        break;
      } else
        v.push(h.slice(0, w)), h = h.slice(w);
    }
    return v.join("");
  }
  function l(d, h) {
    const v = h !== !0 ? escape : unescape;
    return d.scheme !== void 0 && (d.scheme = v(d.scheme)), d.userinfo !== void 0 && (d.userinfo = v(d.userinfo)), d.host !== void 0 && (d.host = v(d.host)), d.path !== void 0 && (d.path = v(d.path)), d.query !== void 0 && (d.query = v(d.query)), d.fragment !== void 0 && (d.fragment = v(d.fragment)), d;
  }
  function m(d) {
    const h = [];
    if (d.userinfo !== void 0 && (h.push(d.userinfo), h.push("@")), d.host !== void 0) {
      let v = unescape(d.host);
      if (!e(v)) {
        const w = o(v);
        w.isIPV6 === !0 ? v = `[${w.escapedHost}]` : v = d.host;
      }
      h.push(v);
    }
    return (typeof d.port == "number" || typeof d.port == "string") && (h.push(":"), h.push(String(d.port))), h.length ? h.join("") : void 0;
  }
  return Bn = {
    nonSimpleDomain: n,
    recomposeAuthority: m,
    normalizeComponentEncoding: l,
    removeDotSegments: u,
    isIPv4: e,
    isUUID: t,
    normalizeIPv6: o,
    stringArrayToHexStripped: r
  }, Bn;
}
var Kn, ra;
function ol() {
  if (ra) return Kn;
  ra = 1;
  const { isUUID: t } = zc(), e = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, r = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function n(b) {
    return r.indexOf(
      /** @type {*} */
      b
    ) !== -1;
  }
  function i(b) {
    return b.secure === !0 ? !0 : b.secure === !1 ? !1 : b.scheme ? b.scheme.length === 3 && (b.scheme[0] === "w" || b.scheme[0] === "W") && (b.scheme[1] === "s" || b.scheme[1] === "S") && (b.scheme[2] === "s" || b.scheme[2] === "S") : !1;
  }
  function s(b) {
    return b.host || (b.error = b.error || "HTTP URIs must have a host."), b;
  }
  function a(b) {
    const $ = String(b.scheme).toLowerCase() === "https";
    return (b.port === ($ ? 443 : 80) || b.port === "") && (b.port = void 0), b.path || (b.path = "/"), b;
  }
  function o(b) {
    return b.secure = i(b), b.resourceName = (b.path || "/") + (b.query ? "?" + b.query : ""), b.path = void 0, b.query = void 0, b;
  }
  function c(b) {
    if ((b.port === (i(b) ? 443 : 80) || b.port === "") && (b.port = void 0), typeof b.secure == "boolean" && (b.scheme = b.secure ? "wss" : "ws", b.secure = void 0), b.resourceName) {
      const [$, T] = b.resourceName.split("?");
      b.path = $ && $ !== "/" ? $ : void 0, b.query = T, b.resourceName = void 0;
    }
    return b.fragment = void 0, b;
  }
  function u(b, $) {
    if (!b.path)
      return b.error = "URN can not be parsed", b;
    const T = b.path.match(e);
    if (T) {
      const I = $.scheme || b.scheme || "urn";
      b.nid = T[1].toLowerCase(), b.nss = T[2];
      const x = `${I}:${$.nid || b.nid}`, G = S(x);
      b.path = void 0, G && (b = G.parse(b, $));
    } else
      b.error = b.error || "URN can not be parsed.";
    return b;
  }
  function l(b, $) {
    if (b.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const T = $.scheme || b.scheme || "urn", I = b.nid.toLowerCase(), x = `${T}:${$.nid || I}`, G = S(x);
    G && (b = G.serialize(b, $));
    const q = b, z = b.nss;
    return q.path = `${I || $.nid}:${z}`, $.skipEscape = !0, q;
  }
  function m(b, $) {
    const T = b;
    return T.uuid = T.nss, T.nss = void 0, !$.tolerant && (!T.uuid || !t(T.uuid)) && (T.error = T.error || "UUID is not valid."), T;
  }
  function d(b) {
    const $ = b;
    return $.nss = (b.uuid || "").toLowerCase(), $;
  }
  const h = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: a
    }
  ), v = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: h.domainHost,
      parse: s,
      serialize: a
    }
  ), w = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: o,
      serialize: c
    }
  ), p = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: w.domainHost,
      parse: w.parse,
      serialize: w.serialize
    }
  ), g = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: h,
      https: v,
      ws: w,
      wss: p,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: u,
          serialize: l,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: m,
          serialize: d,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(g, null);
  function S(b) {
    return b && (g[
      /** @type {SchemeName} */
      b
    ] || g[
      /** @type {SchemeName} */
      b.toLowerCase()
    ]) || void 0;
  }
  return Kn = {
    wsIsSecure: i,
    SCHEMES: g,
    isValidSchemeName: n,
    getSchemeHandler: S
  }, Kn;
}
var na;
function cl() {
  if (na) return Dt.exports;
  na = 1;
  const { normalizeIPv6: t, removeDotSegments: e, recomposeAuthority: r, normalizeComponentEncoding: n, isIPv4: i, nonSimpleDomain: s } = zc(), { SCHEMES: a, getSchemeHandler: o } = ol();
  function c(p, _) {
    return typeof p == "string" ? p = /** @type {T} */
    d(v(p, _), _) : typeof p == "object" && (p = /** @type {T} */
    v(d(p, _), _)), p;
  }
  function u(p, _, f) {
    const g = f ? Object.assign({ scheme: "null" }, f) : { scheme: "null" }, S = l(v(p, g), v(_, g), g, !0);
    return g.skipEscape = !0, d(S, g);
  }
  function l(p, _, f, g) {
    const S = {};
    return g || (p = v(d(p, f), f), _ = v(d(_, f), f)), f = f || {}, !f.tolerant && _.scheme ? (S.scheme = _.scheme, S.userinfo = _.userinfo, S.host = _.host, S.port = _.port, S.path = e(_.path || ""), S.query = _.query) : (_.userinfo !== void 0 || _.host !== void 0 || _.port !== void 0 ? (S.userinfo = _.userinfo, S.host = _.host, S.port = _.port, S.path = e(_.path || ""), S.query = _.query) : (_.path ? (_.path[0] === "/" ? S.path = e(_.path) : ((p.userinfo !== void 0 || p.host !== void 0 || p.port !== void 0) && !p.path ? S.path = "/" + _.path : p.path ? S.path = p.path.slice(0, p.path.lastIndexOf("/") + 1) + _.path : S.path = _.path, S.path = e(S.path)), S.query = _.query) : (S.path = p.path, _.query !== void 0 ? S.query = _.query : S.query = p.query), S.userinfo = p.userinfo, S.host = p.host, S.port = p.port), S.scheme = p.scheme), S.fragment = _.fragment, S;
  }
  function m(p, _, f) {
    return typeof p == "string" ? (p = unescape(p), p = d(n(v(p, f), !0), { ...f, skipEscape: !0 })) : typeof p == "object" && (p = d(n(p, !0), { ...f, skipEscape: !0 })), typeof _ == "string" ? (_ = unescape(_), _ = d(n(v(_, f), !0), { ...f, skipEscape: !0 })) : typeof _ == "object" && (_ = d(n(_, !0), { ...f, skipEscape: !0 })), p.toLowerCase() === _.toLowerCase();
  }
  function d(p, _) {
    const f = {
      host: p.host,
      scheme: p.scheme,
      userinfo: p.userinfo,
      port: p.port,
      path: p.path,
      query: p.query,
      nid: p.nid,
      nss: p.nss,
      uuid: p.uuid,
      fragment: p.fragment,
      reference: p.reference,
      resourceName: p.resourceName,
      secure: p.secure,
      error: ""
    }, g = Object.assign({}, _), S = [], b = o(g.scheme || f.scheme);
    b && b.serialize && b.serialize(f, g), f.path !== void 0 && (g.skipEscape ? f.path = unescape(f.path) : (f.path = escape(f.path), f.scheme !== void 0 && (f.path = f.path.split("%3A").join(":")))), g.reference !== "suffix" && f.scheme && S.push(f.scheme, ":");
    const $ = r(f);
    if ($ !== void 0 && (g.reference !== "suffix" && S.push("//"), S.push($), f.path && f.path[0] !== "/" && S.push("/")), f.path !== void 0) {
      let T = f.path;
      !g.absolutePath && (!b || !b.absolutePath) && (T = e(T)), $ === void 0 && T[0] === "/" && T[1] === "/" && (T = "/%2F" + T.slice(2)), S.push(T);
    }
    return f.query !== void 0 && S.push("?", f.query), f.fragment !== void 0 && S.push("#", f.fragment), S.join("");
  }
  const h = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function v(p, _) {
    const f = Object.assign({}, _), g = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let S = !1;
    f.reference === "suffix" && (f.scheme ? p = f.scheme + ":" + p : p = "//" + p);
    const b = p.match(h);
    if (b) {
      if (g.scheme = b[1], g.userinfo = b[3], g.host = b[4], g.port = parseInt(b[5], 10), g.path = b[6] || "", g.query = b[7], g.fragment = b[8], isNaN(g.port) && (g.port = b[5]), g.host)
        if (i(g.host) === !1) {
          const I = t(g.host);
          g.host = I.host.toLowerCase(), S = I.isIPV6;
        } else
          S = !0;
      g.scheme === void 0 && g.userinfo === void 0 && g.host === void 0 && g.port === void 0 && g.query === void 0 && !g.path ? g.reference = "same-document" : g.scheme === void 0 ? g.reference = "relative" : g.fragment === void 0 ? g.reference = "absolute" : g.reference = "uri", f.reference && f.reference !== "suffix" && f.reference !== g.reference && (g.error = g.error || "URI is not a " + f.reference + " reference.");
      const $ = o(f.scheme || g.scheme);
      if (!f.unicodeSupport && (!$ || !$.unicodeSupport) && g.host && (f.domainHost || $ && $.domainHost) && S === !1 && s(g.host))
        try {
          g.host = URL.domainToASCII(g.host.toLowerCase());
        } catch (T) {
          g.error = g.error || "Host's domain name can not be converted to ASCII: " + T;
        }
      (!$ || $ && !$.skipNormalize) && (p.indexOf("%") !== -1 && (g.scheme !== void 0 && (g.scheme = unescape(g.scheme)), g.host !== void 0 && (g.host = unescape(g.host))), g.path && (g.path = escape(unescape(g.path))), g.fragment && (g.fragment = encodeURI(decodeURIComponent(g.fragment)))), $ && $.parse && $.parse(g, f);
    } else
      g.error = g.error || "URI can not be parsed.";
    return g;
  }
  const w = {
    SCHEMES: a,
    normalize: c,
    resolve: u,
    resolveComponent: l,
    equal: m,
    serialize: d,
    parse: v
  };
  return Dt.exports = w, Dt.exports.default = w, Dt.exports.fastUri = w, Dt.exports;
}
var sa;
function ul() {
  if (sa) return sr;
  sa = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const t = cl();
  return t.code = 'require("ajv/dist/runtime/uri").default', sr.default = t, sr;
}
var ia;
function Bc() {
  return ia || (ia = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
    var e = Wt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return e.KeywordCxt;
    } });
    var r = re();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return r.CodeGen;
    } });
    const n = _n(), i = Jt(), s = xc(), a = wn(), o = re(), c = vn(), u = dn(), l = ie(), m = al, d = ul(), h = (C, A) => new RegExp(C, A);
    h.code = "new RegExp";
    const v = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), p = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, _ = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, f = 200;
    function g(C) {
      var A, O, R, y, E, k, N, M, X, Z, P, j, L, V, K, Q, oe, fe, de, Oe, ye, ht, Ie, In, jn;
      const Nt = C.strict, Nn = (A = C.code) === null || A === void 0 ? void 0 : A.optimize, Si = Nn === !0 || Nn === void 0 ? 1 : Nn || 0, Ri = (R = (O = C.code) === null || O === void 0 ? void 0 : O.regExp) !== null && R !== void 0 ? R : h, Su = (y = C.uriResolver) !== null && y !== void 0 ? y : d.default;
      return {
        strictSchema: (k = (E = C.strictSchema) !== null && E !== void 0 ? E : Nt) !== null && k !== void 0 ? k : !0,
        strictNumbers: (M = (N = C.strictNumbers) !== null && N !== void 0 ? N : Nt) !== null && M !== void 0 ? M : !0,
        strictTypes: (Z = (X = C.strictTypes) !== null && X !== void 0 ? X : Nt) !== null && Z !== void 0 ? Z : "log",
        strictTuples: (j = (P = C.strictTuples) !== null && P !== void 0 ? P : Nt) !== null && j !== void 0 ? j : "log",
        strictRequired: (V = (L = C.strictRequired) !== null && L !== void 0 ? L : Nt) !== null && V !== void 0 ? V : !1,
        code: C.code ? { ...C.code, optimize: Si, regExp: Ri } : { optimize: Si, regExp: Ri },
        loopRequired: (K = C.loopRequired) !== null && K !== void 0 ? K : f,
        loopEnum: (Q = C.loopEnum) !== null && Q !== void 0 ? Q : f,
        meta: (oe = C.meta) !== null && oe !== void 0 ? oe : !0,
        messages: (fe = C.messages) !== null && fe !== void 0 ? fe : !0,
        inlineRefs: (de = C.inlineRefs) !== null && de !== void 0 ? de : !0,
        schemaId: (Oe = C.schemaId) !== null && Oe !== void 0 ? Oe : "$id",
        addUsedSchema: (ye = C.addUsedSchema) !== null && ye !== void 0 ? ye : !0,
        validateSchema: (ht = C.validateSchema) !== null && ht !== void 0 ? ht : !0,
        validateFormats: (Ie = C.validateFormats) !== null && Ie !== void 0 ? Ie : !0,
        unicodeRegExp: (In = C.unicodeRegExp) !== null && In !== void 0 ? In : !0,
        int32range: (jn = C.int32range) !== null && jn !== void 0 ? jn : !0,
        uriResolver: Su
      };
    }
    class S {
      constructor(A = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), A = this.opts = { ...A, ...g(A) };
        const { es5: O, lines: R } = this.opts.code;
        this.scope = new o.ValueScope({ scope: {}, prefixes: w, es5: O, lines: R }), this.logger = z(A.logger);
        const y = A.validateFormats;
        A.validateFormats = !1, this.RULES = (0, s.getRules)(), b.call(this, p, A, "NOT SUPPORTED"), b.call(this, _, A, "DEPRECATED", "warn"), this._metaOpts = G.call(this), A.formats && I.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), A.keywords && x.call(this, A.keywords), typeof A.meta == "object" && this.addMetaSchema(A.meta), T.call(this), A.validateFormats = y;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: A, meta: O, schemaId: R } = this.opts;
        let y = m;
        R === "id" && (y = { ...m }, y.id = y.$id, delete y.$id), O && A && this.addMetaSchema(y, y[R], !1);
      }
      defaultMeta() {
        const { meta: A, schemaId: O } = this.opts;
        return this.opts.defaultMeta = typeof A == "object" ? A[O] || A : void 0;
      }
      validate(A, O) {
        let R;
        if (typeof A == "string") {
          if (R = this.getSchema(A), !R)
            throw new Error(`no schema with key or ref "${A}"`);
        } else
          R = this.compile(A);
        const y = R(O);
        return "$async" in R || (this.errors = R.errors), y;
      }
      compile(A, O) {
        const R = this._addSchema(A, O);
        return R.validate || this._compileSchemaEnv(R);
      }
      compileAsync(A, O) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: R } = this.opts;
        return y.call(this, A, O);
        async function y(Z, P) {
          await E.call(this, Z.$schema);
          const j = this._addSchema(Z, P);
          return j.validate || k.call(this, j);
        }
        async function E(Z) {
          Z && !this.getSchema(Z) && await y.call(this, { $ref: Z }, !0);
        }
        async function k(Z) {
          try {
            return this._compileSchemaEnv(Z);
          } catch (P) {
            if (!(P instanceof i.default))
              throw P;
            return N.call(this, P), await M.call(this, P.missingSchema), k.call(this, Z);
          }
        }
        function N({ missingSchema: Z, missingRef: P }) {
          if (this.refs[Z])
            throw new Error(`AnySchema ${Z} is loaded but ${P} cannot be resolved`);
        }
        async function M(Z) {
          const P = await X.call(this, Z);
          this.refs[Z] || await E.call(this, P.$schema), this.refs[Z] || this.addSchema(P, Z, O);
        }
        async function X(Z) {
          const P = this._loading[Z];
          if (P)
            return P;
          try {
            return await (this._loading[Z] = R(Z));
          } finally {
            delete this._loading[Z];
          }
        }
      }
      // Adds schema to the instance
      addSchema(A, O, R, y = this.opts.validateSchema) {
        if (Array.isArray(A)) {
          for (const k of A)
            this.addSchema(k, void 0, R, y);
          return this;
        }
        let E;
        if (typeof A == "object") {
          const { schemaId: k } = this.opts;
          if (E = A[k], E !== void 0 && typeof E != "string")
            throw new Error(`schema ${k} must be string`);
        }
        return O = (0, c.normalizeId)(O || E), this._checkUnique(O), this.schemas[O] = this._addSchema(A, R, O, y, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(A, O, R = this.opts.validateSchema) {
        return this.addSchema(A, O, !0, R), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(A, O) {
        if (typeof A == "boolean")
          return !0;
        let R;
        if (R = A.$schema, R !== void 0 && typeof R != "string")
          throw new Error("$schema must be a string");
        if (R = R || this.opts.defaultMeta || this.defaultMeta(), !R)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const y = this.validate(R, A);
        if (!y && O) {
          const E = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(E);
          else
            throw new Error(E);
        }
        return y;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(A) {
        let O;
        for (; typeof (O = $.call(this, A)) == "string"; )
          A = O;
        if (O === void 0) {
          const { schemaId: R } = this.opts, y = new a.SchemaEnv({ schema: {}, schemaId: R });
          if (O = a.resolveSchema.call(this, y, A), !O)
            return;
          this.refs[A] = O;
        }
        return O.validate || this._compileSchemaEnv(O);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(A) {
        if (A instanceof RegExp)
          return this._removeAllSchemas(this.schemas, A), this._removeAllSchemas(this.refs, A), this;
        switch (typeof A) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const O = $.call(this, A);
            return typeof O == "object" && this._cache.delete(O.schema), delete this.schemas[A], delete this.refs[A], this;
          }
          case "object": {
            const O = A;
            this._cache.delete(O);
            let R = A[this.opts.schemaId];
            return R && (R = (0, c.normalizeId)(R), delete this.schemas[R], delete this.refs[R]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(A) {
        for (const O of A)
          this.addKeyword(O);
        return this;
      }
      addKeyword(A, O) {
        let R;
        if (typeof A == "string")
          R = A, typeof O == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), O.keyword = R);
        else if (typeof A == "object" && O === void 0) {
          if (O = A, R = O.keyword, Array.isArray(R) && !R.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (D.call(this, R, O), !O)
          return (0, l.eachItem)(R, (E) => U.call(this, E)), this;
        F.call(this, O);
        const y = {
          ...O,
          type: (0, u.getJSONTypes)(O.type),
          schemaType: (0, u.getJSONTypes)(O.schemaType)
        };
        return (0, l.eachItem)(R, y.type.length === 0 ? (E) => U.call(this, E, y) : (E) => y.type.forEach((k) => U.call(this, E, y, k))), this;
      }
      getKeyword(A) {
        const O = this.RULES.all[A];
        return typeof O == "object" ? O.definition : !!O;
      }
      // Remove keyword
      removeKeyword(A) {
        const { RULES: O } = this;
        delete O.keywords[A], delete O.all[A];
        for (const R of O.rules) {
          const y = R.rules.findIndex((E) => E.keyword === A);
          y >= 0 && R.rules.splice(y, 1);
        }
        return this;
      }
      // Add format
      addFormat(A, O) {
        return typeof O == "string" && (O = new RegExp(O)), this.formats[A] = O, this;
      }
      errorsText(A = this.errors, { separator: O = ", ", dataVar: R = "data" } = {}) {
        return !A || A.length === 0 ? "No errors" : A.map((y) => `${R}${y.instancePath} ${y.message}`).reduce((y, E) => y + O + E);
      }
      $dataMetaSchema(A, O) {
        const R = this.RULES.all;
        A = JSON.parse(JSON.stringify(A));
        for (const y of O) {
          const E = y.split("/").slice(1);
          let k = A;
          for (const N of E)
            k = k[N];
          for (const N in R) {
            const M = R[N];
            if (typeof M != "object")
              continue;
            const { $data: X } = M.definition, Z = k[N];
            X && Z && (k[N] = W(Z));
          }
        }
        return A;
      }
      _removeAllSchemas(A, O) {
        for (const R in A) {
          const y = A[R];
          (!O || O.test(R)) && (typeof y == "string" ? delete A[R] : y && !y.meta && (this._cache.delete(y.schema), delete A[R]));
        }
      }
      _addSchema(A, O, R, y = this.opts.validateSchema, E = this.opts.addUsedSchema) {
        let k;
        const { schemaId: N } = this.opts;
        if (typeof A == "object")
          k = A[N];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof A != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let M = this._cache.get(A);
        if (M !== void 0)
          return M;
        R = (0, c.normalizeId)(k || R);
        const X = c.getSchemaRefs.call(this, A, R);
        return M = new a.SchemaEnv({ schema: A, schemaId: N, meta: O, baseId: R, localRefs: X }), this._cache.set(M.schema, M), E && !R.startsWith("#") && (R && this._checkUnique(R), this.refs[R] = M), y && this.validateSchema(A, !0), M;
      }
      _checkUnique(A) {
        if (this.schemas[A] || this.refs[A])
          throw new Error(`schema with key or id "${A}" already exists`);
      }
      _compileSchemaEnv(A) {
        if (A.meta ? this._compileMetaSchema(A) : a.compileSchema.call(this, A), !A.validate)
          throw new Error("ajv implementation error");
        return A.validate;
      }
      _compileMetaSchema(A) {
        const O = this.opts;
        this.opts = this._metaOpts;
        try {
          a.compileSchema.call(this, A);
        } finally {
          this.opts = O;
        }
      }
    }
    S.ValidationError = n.default, S.MissingRefError = i.default, t.default = S;
    function b(C, A, O, R = "error") {
      for (const y in C) {
        const E = y;
        E in A && this.logger[R](`${O}: option ${y}. ${C[E]}`);
      }
    }
    function $(C) {
      return C = (0, c.normalizeId)(C), this.schemas[C] || this.refs[C];
    }
    function T() {
      const C = this.opts.schemas;
      if (C)
        if (Array.isArray(C))
          this.addSchema(C);
        else
          for (const A in C)
            this.addSchema(C[A], A);
    }
    function I() {
      for (const C in this.opts.formats) {
        const A = this.opts.formats[C];
        A && this.addFormat(C, A);
      }
    }
    function x(C) {
      if (Array.isArray(C)) {
        this.addVocabulary(C);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const A in C) {
        const O = C[A];
        O.keyword || (O.keyword = A), this.addKeyword(O);
      }
    }
    function G() {
      const C = { ...this.opts };
      for (const A of v)
        delete C[A];
      return C;
    }
    const q = { log() {
    }, warn() {
    }, error() {
    } };
    function z(C) {
      if (C === !1)
        return q;
      if (C === void 0)
        return console;
      if (C.log && C.warn && C.error)
        return C;
      throw new Error("logger must implement log, warn and error methods");
    }
    const H = /^[a-z_$][a-z0-9_$:-]*$/i;
    function D(C, A) {
      const { RULES: O } = this;
      if ((0, l.eachItem)(C, (R) => {
        if (O.keywords[R])
          throw new Error(`Keyword ${R} is already defined`);
        if (!H.test(R))
          throw new Error(`Keyword ${R} has invalid name`);
      }), !!A && A.$data && !("code" in A || "validate" in A))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function U(C, A, O) {
      var R;
      const y = A?.post;
      if (O && y)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: E } = this;
      let k = y ? E.post : E.rules.find(({ type: M }) => M === O);
      if (k || (k = { type: O, rules: [] }, E.rules.push(k)), E.keywords[C] = !0, !A)
        return;
      const N = {
        keyword: C,
        definition: {
          ...A,
          type: (0, u.getJSONTypes)(A.type),
          schemaType: (0, u.getJSONTypes)(A.schemaType)
        }
      };
      A.before ? J.call(this, k, N, A.before) : k.rules.push(N), E.all[C] = N, (R = A.implements) === null || R === void 0 || R.forEach((M) => this.addKeyword(M));
    }
    function J(C, A, O) {
      const R = C.rules.findIndex((y) => y.keyword === O);
      R >= 0 ? C.rules.splice(R, 0, A) : (C.rules.push(A), this.logger.warn(`rule ${O} is not defined`));
    }
    function F(C) {
      let { metaSchema: A } = C;
      A !== void 0 && (C.$data && this.opts.$data && (A = W(A)), C.validateSchema = this.compile(A, !0));
    }
    const B = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function W(C) {
      return { anyOf: [C, B] };
    }
  })(qn)), qn;
}
var ir = {}, ar = {}, or = {}, aa;
function ll() {
  if (aa) return or;
  aa = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const t = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return or.default = t, or;
}
var Je = {}, oa;
function fi() {
  if (oa) return Je;
  oa = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.callRef = Je.getValidate = void 0;
  const t = Jt(), e = qe(), r = re(), n = Le(), i = wn(), s = ie(), a = {
    keyword: "$ref",
    schemaType: "string",
    code(u) {
      const { gen: l, schema: m, it: d } = u, { baseId: h, schemaEnv: v, validateName: w, opts: p, self: _ } = d, { root: f } = v;
      if ((m === "#" || m === "#/") && h === f.baseId)
        return S();
      const g = i.resolveRef.call(_, f, h, m);
      if (g === void 0)
        throw new t.default(d.opts.uriResolver, h, m);
      if (g instanceof i.SchemaEnv)
        return b(g);
      return $(g);
      function S() {
        if (v === f)
          return c(u, w, v, v.$async);
        const T = l.scopeValue("root", { ref: f });
        return c(u, (0, r._)`${T}.validate`, f, f.$async);
      }
      function b(T) {
        const I = o(u, T);
        c(u, I, T, T.$async);
      }
      function $(T) {
        const I = l.scopeValue("schema", p.code.source === !0 ? { ref: T, code: (0, r.stringify)(T) } : { ref: T }), x = l.name("valid"), G = u.subschema({
          schema: T,
          dataTypes: [],
          schemaPath: r.nil,
          topSchemaRef: I,
          errSchemaPath: m
        }, x);
        u.mergeEvaluated(G), u.ok(x);
      }
    }
  };
  function o(u, l) {
    const { gen: m } = u;
    return l.validate ? m.scopeValue("validate", { ref: l.validate }) : (0, r._)`${m.scopeValue("wrapper", { ref: l })}.validate`;
  }
  Je.getValidate = o;
  function c(u, l, m, d) {
    const { gen: h, it: v } = u, { allErrors: w, schemaEnv: p, opts: _ } = v, f = _.passContext ? n.default.this : r.nil;
    d ? g() : S();
    function g() {
      if (!p.$async)
        throw new Error("async schema referenced by sync schema");
      const T = h.let("valid");
      h.try(() => {
        h.code((0, r._)`await ${(0, e.callValidateCode)(u, l, f)}`), $(l), w || h.assign(T, !0);
      }, (I) => {
        h.if((0, r._)`!(${I} instanceof ${v.ValidationError})`, () => h.throw(I)), b(I), w || h.assign(T, !1);
      }), u.ok(T);
    }
    function S() {
      u.result((0, e.callValidateCode)(u, l, f), () => $(l), () => b(l));
    }
    function b(T) {
      const I = (0, r._)`${T}.errors`;
      h.assign(n.default.vErrors, (0, r._)`${n.default.vErrors} === null ? ${I} : ${n.default.vErrors}.concat(${I})`), h.assign(n.default.errors, (0, r._)`${n.default.vErrors}.length`);
    }
    function $(T) {
      var I;
      if (!v.opts.unevaluated)
        return;
      const x = (I = m?.validate) === null || I === void 0 ? void 0 : I.evaluated;
      if (v.props !== !0)
        if (x && !x.dynamicProps)
          x.props !== void 0 && (v.props = s.mergeEvaluated.props(h, x.props, v.props));
        else {
          const G = h.var("props", (0, r._)`${T}.evaluated.props`);
          v.props = s.mergeEvaluated.props(h, G, v.props, r.Name);
        }
      if (v.items !== !0)
        if (x && !x.dynamicItems)
          x.items !== void 0 && (v.items = s.mergeEvaluated.items(h, x.items, v.items));
        else {
          const G = h.var("items", (0, r._)`${T}.evaluated.items`);
          v.items = s.mergeEvaluated.items(h, G, v.items, r.Name);
        }
    }
  }
  return Je.callRef = c, Je.default = a, Je;
}
var ca;
function Kc() {
  if (ca) return ar;
  ca = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const t = ll(), e = fi(), r = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    t.default,
    e.default
  ];
  return ar.default = r, ar;
}
var cr = {}, ur = {}, ua;
function dl() {
  if (ua) return ur;
  ua = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const t = re(), e = t.operators, r = {
    maximum: { okStr: "<=", ok: e.LTE, fail: e.GT },
    minimum: { okStr: ">=", ok: e.GTE, fail: e.LT },
    exclusiveMaximum: { okStr: "<", ok: e.LT, fail: e.GTE },
    exclusiveMinimum: { okStr: ">", ok: e.GT, fail: e.LTE }
  }, n = {
    message: ({ keyword: s, schemaCode: a }) => (0, t.str)`must be ${r[s].okStr} ${a}`,
    params: ({ keyword: s, schemaCode: a }) => (0, t._)`{comparison: ${r[s].okStr}, limit: ${a}}`
  }, i = {
    keyword: Object.keys(r),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(s) {
      const { keyword: a, data: o, schemaCode: c } = s;
      s.fail$data((0, t._)`${o} ${r[a].fail} ${c} || isNaN(${o})`);
    }
  };
  return ur.default = i, ur;
}
var lr = {}, la;
function hl() {
  if (la) return lr;
  la = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const t = re(), r = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, t.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, t._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: i, data: s, schemaCode: a, it: o } = n, c = o.opts.multipleOfPrecision, u = i.let("res"), l = c ? (0, t._)`Math.abs(Math.round(${u}) - ${u}) > 1e-${c}` : (0, t._)`${u} !== parseInt(${u})`;
      n.fail$data((0, t._)`(${a} === 0 || (${u} = ${s}/${a}, ${l}))`);
    }
  };
  return lr.default = r, lr;
}
var dr = {}, hr = {}, da;
function fl() {
  if (da) return hr;
  da = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  function t(e) {
    const r = e.length;
    let n = 0, i = 0, s;
    for (; i < r; )
      n++, s = e.charCodeAt(i++), s >= 55296 && s <= 56319 && i < r && (s = e.charCodeAt(i), (s & 64512) === 56320 && i++);
    return n;
  }
  return hr.default = t, t.code = 'require("ajv/dist/runtime/ucs2length").default', hr;
}
var ha;
function pl() {
  if (ha) return dr;
  ha = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const t = re(), e = ie(), r = fl(), i = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: a }) {
        const o = s === "maxLength" ? "more" : "fewer";
        return (0, t.str)`must NOT have ${o} than ${a} characters`;
      },
      params: ({ schemaCode: s }) => (0, t._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: a, data: o, schemaCode: c, it: u } = s, l = a === "maxLength" ? t.operators.GT : t.operators.LT, m = u.opts.unicode === !1 ? (0, t._)`${o}.length` : (0, t._)`${(0, e.useFunc)(s.gen, r.default)}(${o})`;
      s.fail$data((0, t._)`${m} ${l} ${c}`);
    }
  };
  return dr.default = i, dr;
}
var fr = {}, fa;
function ml() {
  if (fa) return fr;
  fa = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const t = qe(), e = re(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: i }) => (0, e.str)`must match pattern "${i}"`,
      params: ({ schemaCode: i }) => (0, e._)`{pattern: ${i}}`
    },
    code(i) {
      const { data: s, $data: a, schema: o, schemaCode: c, it: u } = i, l = u.opts.unicodeRegExp ? "u" : "", m = a ? (0, e._)`(new RegExp(${c}, ${l}))` : (0, t.usePattern)(i, o);
      i.fail$data((0, e._)`!${m}.test(${s})`);
    }
  };
  return fr.default = n, fr;
}
var pr = {}, pa;
function yl() {
  if (pa) return pr;
  pa = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const t = re(), r = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const s = n === "maxProperties" ? "more" : "fewer";
        return (0, t.str)`must NOT have ${s} than ${i} properties`;
      },
      params: ({ schemaCode: n }) => (0, t._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: s, schemaCode: a } = n, o = i === "maxProperties" ? t.operators.GT : t.operators.LT;
      n.fail$data((0, t._)`Object.keys(${s}).length ${o} ${a}`);
    }
  };
  return pr.default = r, pr;
}
var mr = {}, ma;
function gl() {
  if (ma) return mr;
  ma = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const t = qe(), e = re(), r = ie(), i = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, e.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, e._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: a, schema: o, schemaCode: c, data: u, $data: l, it: m } = s, { opts: d } = m;
      if (!l && o.length === 0)
        return;
      const h = o.length >= d.loopRequired;
      if (m.allErrors ? v() : w(), d.strictRequired) {
        const f = s.parentSchema.properties, { definedProperties: g } = s.it;
        for (const S of o)
          if (f?.[S] === void 0 && !g.has(S)) {
            const b = m.schemaEnv.baseId + m.errSchemaPath, $ = `required property "${S}" is not defined at "${b}" (strictRequired)`;
            (0, r.checkStrictMode)(m, $, m.opts.strictRequired);
          }
      }
      function v() {
        if (h || l)
          s.block$data(e.nil, p);
        else
          for (const f of o)
            (0, t.checkReportMissingProp)(s, f);
      }
      function w() {
        const f = a.let("missing");
        if (h || l) {
          const g = a.let("valid", !0);
          s.block$data(g, () => _(f, g)), s.ok(g);
        } else
          a.if((0, t.checkMissingProp)(s, o, f)), (0, t.reportMissingProp)(s, f), a.else();
      }
      function p() {
        a.forOf("prop", c, (f) => {
          s.setParams({ missingProperty: f }), a.if((0, t.noPropertyInData)(a, u, f, d.ownProperties), () => s.error());
        });
      }
      function _(f, g) {
        s.setParams({ missingProperty: f }), a.forOf(f, c, () => {
          a.assign(g, (0, t.propertyInData)(a, u, f, d.ownProperties)), a.if((0, e.not)(g), () => {
            s.error(), a.break();
          });
        }, e.nil);
      }
    }
  };
  return mr.default = i, mr;
}
var yr = {}, ya;
function vl() {
  if (ya) return yr;
  ya = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const t = re(), r = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const s = n === "maxItems" ? "more" : "fewer";
        return (0, t.str)`must NOT have ${s} than ${i} items`;
      },
      params: ({ schemaCode: n }) => (0, t._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: s, schemaCode: a } = n, o = i === "maxItems" ? t.operators.GT : t.operators.LT;
      n.fail$data((0, t._)`${s}.length ${o} ${a}`);
    }
  };
  return yr.default = r, yr;
}
var gr = {}, vr = {}, ga;
function pi() {
  if (ga) return vr;
  ga = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const t = Vc();
  return t.code = 'require("ajv/dist/runtime/equal").default', vr.default = t, vr;
}
var va;
function _l() {
  if (va) return gr;
  va = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const t = dn(), e = re(), r = ie(), n = pi(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: a, j: o } }) => (0, e.str)`must NOT have duplicate items (items ## ${o} and ${a} are identical)`,
      params: ({ params: { i: a, j: o } }) => (0, e._)`{i: ${a}, j: ${o}}`
    },
    code(a) {
      const { gen: o, data: c, $data: u, schema: l, parentSchema: m, schemaCode: d, it: h } = a;
      if (!u && !l)
        return;
      const v = o.let("valid"), w = m.items ? (0, t.getSchemaTypes)(m.items) : [];
      a.block$data(v, p, (0, e._)`${d} === false`), a.ok(v);
      function p() {
        const S = o.let("i", (0, e._)`${c}.length`), b = o.let("j");
        a.setParams({ i: S, j: b }), o.assign(v, !0), o.if((0, e._)`${S} > 1`, () => (_() ? f : g)(S, b));
      }
      function _() {
        return w.length > 0 && !w.some((S) => S === "object" || S === "array");
      }
      function f(S, b) {
        const $ = o.name("item"), T = (0, t.checkDataTypes)(w, $, h.opts.strictNumbers, t.DataType.Wrong), I = o.const("indices", (0, e._)`{}`);
        o.for((0, e._)`;${S}--;`, () => {
          o.let($, (0, e._)`${c}[${S}]`), o.if(T, (0, e._)`continue`), w.length > 1 && o.if((0, e._)`typeof ${$} == "string"`, (0, e._)`${$} += "_"`), o.if((0, e._)`typeof ${I}[${$}] == "number"`, () => {
            o.assign(b, (0, e._)`${I}[${$}]`), a.error(), o.assign(v, !1).break();
          }).code((0, e._)`${I}[${$}] = ${S}`);
        });
      }
      function g(S, b) {
        const $ = (0, r.useFunc)(o, n.default), T = o.name("outer");
        o.label(T).for((0, e._)`;${S}--;`, () => o.for((0, e._)`${b} = ${S}; ${b}--;`, () => o.if((0, e._)`${$}(${c}[${S}], ${c}[${b}])`, () => {
          a.error(), o.assign(v, !1).break(T);
        })));
      }
    }
  };
  return gr.default = s, gr;
}
var _r = {}, _a;
function wl() {
  if (_a) return _r;
  _a = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const t = re(), e = ie(), r = pi(), i = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, t._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: a, data: o, $data: c, schemaCode: u, schema: l } = s;
      c || l && typeof l == "object" ? s.fail$data((0, t._)`!${(0, e.useFunc)(a, r.default)}(${o}, ${u})`) : s.fail((0, t._)`${l} !== ${o}`);
    }
  };
  return _r.default = i, _r;
}
var wr = {}, wa;
function bl() {
  if (wa) return wr;
  wa = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const t = re(), e = ie(), r = pi(), i = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, t._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: a, data: o, $data: c, schema: u, schemaCode: l, it: m } = s;
      if (!c && u.length === 0)
        throw new Error("enum must have non-empty array");
      const d = u.length >= m.opts.loopEnum;
      let h;
      const v = () => h ?? (h = (0, e.useFunc)(a, r.default));
      let w;
      if (d || c)
        w = a.let("valid"), s.block$data(w, p);
      else {
        if (!Array.isArray(u))
          throw new Error("ajv implementation error");
        const f = a.const("vSchema", l);
        w = (0, t.or)(...u.map((g, S) => _(f, S)));
      }
      s.pass(w);
      function p() {
        a.assign(w, !1), a.forOf("v", l, (f) => a.if((0, t._)`${v()}(${o}, ${f})`, () => a.assign(w, !0).break()));
      }
      function _(f, g) {
        const S = u[g];
        return typeof S == "object" && S !== null ? (0, t._)`${v()}(${o}, ${f}[${g}])` : (0, t._)`${o} === ${S}`;
      }
    }
  };
  return wr.default = i, wr;
}
var ba;
function Gc() {
  if (ba) return cr;
  ba = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const t = dl(), e = hl(), r = pl(), n = ml(), i = yl(), s = gl(), a = vl(), o = _l(), c = wl(), u = bl(), l = [
    // number
    t.default,
    e.default,
    // string
    r.default,
    n.default,
    // object
    i.default,
    s.default,
    // array
    a.default,
    o.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    c.default,
    u.default
  ];
  return cr.default = l, cr;
}
var br = {}, ft = {}, Ea;
function Hc() {
  if (Ea) return ft;
  Ea = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.validateAdditionalItems = void 0;
  const t = re(), e = ie(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, t.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, t._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: a, it: o } = s, { items: c } = a;
      if (!Array.isArray(c)) {
        (0, e.checkStrictMode)(o, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      i(s, c);
    }
  };
  function i(s, a) {
    const { gen: o, schema: c, data: u, keyword: l, it: m } = s;
    m.items = !0;
    const d = o.const("len", (0, t._)`${u}.length`);
    if (c === !1)
      s.setParams({ len: a.length }), s.pass((0, t._)`${d} <= ${a.length}`);
    else if (typeof c == "object" && !(0, e.alwaysValidSchema)(m, c)) {
      const v = o.var("valid", (0, t._)`${d} <= ${a.length}`);
      o.if((0, t.not)(v), () => h(v)), s.ok(v);
    }
    function h(v) {
      o.forRange("i", a.length, d, (w) => {
        s.subschema({ keyword: l, dataProp: w, dataPropType: e.Type.Num }, v), m.allErrors || o.if((0, t.not)(v), () => o.break());
      });
    }
  }
  return ft.validateAdditionalItems = i, ft.default = n, ft;
}
var Er = {}, pt = {}, $a;
function Wc() {
  if ($a) return pt;
  $a = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.validateTuple = void 0;
  const t = re(), e = ie(), r = qe(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: a, it: o } = s;
      if (Array.isArray(a))
        return i(s, "additionalItems", a);
      o.items = !0, !(0, e.alwaysValidSchema)(o, a) && s.ok((0, r.validateArray)(s));
    }
  };
  function i(s, a, o = s.schema) {
    const { gen: c, parentSchema: u, data: l, keyword: m, it: d } = s;
    w(u), d.opts.unevaluated && o.length && d.items !== !0 && (d.items = e.mergeEvaluated.items(c, o.length, d.items));
    const h = c.name("valid"), v = c.const("len", (0, t._)`${l}.length`);
    o.forEach((p, _) => {
      (0, e.alwaysValidSchema)(d, p) || (c.if((0, t._)`${v} > ${_}`, () => s.subschema({
        keyword: m,
        schemaProp: _,
        dataProp: _
      }, h)), s.ok(h));
    });
    function w(p) {
      const { opts: _, errSchemaPath: f } = d, g = o.length, S = g === p.minItems && (g === p.maxItems || p[a] === !1);
      if (_.strictTuples && !S) {
        const b = `"${m}" is ${g}-tuple, but minItems or maxItems/${a} are not specified or different at path "${f}"`;
        (0, e.checkStrictMode)(d, b, _.strictTuples);
      }
    }
  }
  return pt.validateTuple = i, pt.default = n, pt;
}
var Sa;
function El() {
  if (Sa) return Er;
  Sa = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const t = Wc(), e = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, t.validateTuple)(r, "items")
  };
  return Er.default = e, Er;
}
var $r = {}, Ra;
function $l() {
  if (Ra) return $r;
  Ra = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const t = re(), e = ie(), r = qe(), n = Hc(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: a } }) => (0, t.str)`must NOT have more than ${a} items`,
      params: ({ params: { len: a } }) => (0, t._)`{limit: ${a}}`
    },
    code(a) {
      const { schema: o, parentSchema: c, it: u } = a, { prefixItems: l } = c;
      u.items = !0, !(0, e.alwaysValidSchema)(u, o) && (l ? (0, n.validateAdditionalItems)(a, l) : a.ok((0, r.validateArray)(a)));
    }
  };
  return $r.default = s, $r;
}
var Sr = {}, Oa;
function Sl() {
  if (Oa) return Sr;
  Oa = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const t = re(), e = ie(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: i, max: s } }) => s === void 0 ? (0, t.str)`must contain at least ${i} valid item(s)` : (0, t.str)`must contain at least ${i} and no more than ${s} valid item(s)`,
      params: ({ params: { min: i, max: s } }) => s === void 0 ? (0, t._)`{minContains: ${i}}` : (0, t._)`{minContains: ${i}, maxContains: ${s}}`
    },
    code(i) {
      const { gen: s, schema: a, parentSchema: o, data: c, it: u } = i;
      let l, m;
      const { minContains: d, maxContains: h } = o;
      u.opts.next ? (l = d === void 0 ? 1 : d, m = h) : l = 1;
      const v = s.const("len", (0, t._)`${c}.length`);
      if (i.setParams({ min: l, max: m }), m === void 0 && l === 0) {
        (0, e.checkStrictMode)(u, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (m !== void 0 && l > m) {
        (0, e.checkStrictMode)(u, '"minContains" > "maxContains" is always invalid'), i.fail();
        return;
      }
      if ((0, e.alwaysValidSchema)(u, a)) {
        let g = (0, t._)`${v} >= ${l}`;
        m !== void 0 && (g = (0, t._)`${g} && ${v} <= ${m}`), i.pass(g);
        return;
      }
      u.items = !0;
      const w = s.name("valid");
      m === void 0 && l === 1 ? _(w, () => s.if(w, () => s.break())) : l === 0 ? (s.let(w, !0), m !== void 0 && s.if((0, t._)`${c}.length > 0`, p)) : (s.let(w, !1), p()), i.result(w, () => i.reset());
      function p() {
        const g = s.name("_valid"), S = s.let("count", 0);
        _(g, () => s.if(g, () => f(S)));
      }
      function _(g, S) {
        s.forRange("i", 0, v, (b) => {
          i.subschema({
            keyword: "contains",
            dataProp: b,
            dataPropType: e.Type.Num,
            compositeRule: !0
          }, g), S();
        });
      }
      function f(g) {
        s.code((0, t._)`${g}++`), m === void 0 ? s.if((0, t._)`${g} >= ${l}`, () => s.assign(w, !0).break()) : (s.if((0, t._)`${g} > ${m}`, () => s.assign(w, !1).break()), l === 1 ? s.assign(w, !0) : s.if((0, t._)`${g} >= ${l}`, () => s.assign(w, !0)));
      }
    }
  };
  return Sr.default = n, Sr;
}
var Gn = {}, Ta;
function mi() {
  return Ta || (Ta = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
    const e = re(), r = ie(), n = qe();
    t.error = {
      message: ({ params: { property: c, depsCount: u, deps: l } }) => {
        const m = u === 1 ? "property" : "properties";
        return (0, e.str)`must have ${m} ${l} when property ${c} is present`;
      },
      params: ({ params: { property: c, depsCount: u, deps: l, missingProperty: m } }) => (0, e._)`{property: ${c},
    missingProperty: ${m},
    depsCount: ${u},
    deps: ${l}}`
      // TODO change to reference
    };
    const i = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: t.error,
      code(c) {
        const [u, l] = s(c);
        a(c, u), o(c, l);
      }
    };
    function s({ schema: c }) {
      const u = {}, l = {};
      for (const m in c) {
        if (m === "__proto__")
          continue;
        const d = Array.isArray(c[m]) ? u : l;
        d[m] = c[m];
      }
      return [u, l];
    }
    function a(c, u = c.schema) {
      const { gen: l, data: m, it: d } = c;
      if (Object.keys(u).length === 0)
        return;
      const h = l.let("missing");
      for (const v in u) {
        const w = u[v];
        if (w.length === 0)
          continue;
        const p = (0, n.propertyInData)(l, m, v, d.opts.ownProperties);
        c.setParams({
          property: v,
          depsCount: w.length,
          deps: w.join(", ")
        }), d.allErrors ? l.if(p, () => {
          for (const _ of w)
            (0, n.checkReportMissingProp)(c, _);
        }) : (l.if((0, e._)`${p} && (${(0, n.checkMissingProp)(c, w, h)})`), (0, n.reportMissingProp)(c, h), l.else());
      }
    }
    t.validatePropertyDeps = a;
    function o(c, u = c.schema) {
      const { gen: l, data: m, keyword: d, it: h } = c, v = l.name("valid");
      for (const w in u)
        (0, r.alwaysValidSchema)(h, u[w]) || (l.if(
          (0, n.propertyInData)(l, m, w, h.opts.ownProperties),
          () => {
            const p = c.subschema({ keyword: d, schemaProp: w }, v);
            c.mergeValidEvaluated(p, v);
          },
          () => l.var(v, !0)
          // TODO var
        ), c.ok(v));
    }
    t.validateSchemaDeps = o, t.default = i;
  })(Gn)), Gn;
}
var Rr = {}, Pa;
function Rl() {
  if (Pa) return Rr;
  Pa = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const t = re(), e = ie(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: i }) => (0, t._)`{propertyName: ${i.propertyName}}`
    },
    code(i) {
      const { gen: s, schema: a, data: o, it: c } = i;
      if ((0, e.alwaysValidSchema)(c, a))
        return;
      const u = s.name("valid");
      s.forIn("key", o, (l) => {
        i.setParams({ propertyName: l }), i.subschema({
          keyword: "propertyNames",
          data: l,
          dataTypes: ["string"],
          propertyName: l,
          compositeRule: !0
        }, u), s.if((0, t.not)(u), () => {
          i.error(!0), c.allErrors || s.break();
        });
      }), i.ok(u);
    }
  };
  return Rr.default = n, Rr;
}
var Or = {}, ka;
function Jc() {
  if (ka) return Or;
  ka = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const t = qe(), e = re(), r = Le(), n = ie(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: a }) => (0, e._)`{additionalProperty: ${a.additionalProperty}}`
    },
    code(a) {
      const { gen: o, schema: c, parentSchema: u, data: l, errsCount: m, it: d } = a;
      if (!m)
        throw new Error("ajv implementation error");
      const { allErrors: h, opts: v } = d;
      if (d.props = !0, v.removeAdditional !== "all" && (0, n.alwaysValidSchema)(d, c))
        return;
      const w = (0, t.allSchemaProperties)(u.properties), p = (0, t.allSchemaProperties)(u.patternProperties);
      _(), a.ok((0, e._)`${m} === ${r.default.errors}`);
      function _() {
        o.forIn("key", l, ($) => {
          !w.length && !p.length ? S($) : o.if(f($), () => S($));
        });
      }
      function f($) {
        let T;
        if (w.length > 8) {
          const I = (0, n.schemaRefOrVal)(d, u.properties, "properties");
          T = (0, t.isOwnProperty)(o, I, $);
        } else w.length ? T = (0, e.or)(...w.map((I) => (0, e._)`${$} === ${I}`)) : T = e.nil;
        return p.length && (T = (0, e.or)(T, ...p.map((I) => (0, e._)`${(0, t.usePattern)(a, I)}.test(${$})`))), (0, e.not)(T);
      }
      function g($) {
        o.code((0, e._)`delete ${l}[${$}]`);
      }
      function S($) {
        if (v.removeAdditional === "all" || v.removeAdditional && c === !1) {
          g($);
          return;
        }
        if (c === !1) {
          a.setParams({ additionalProperty: $ }), a.error(), h || o.break();
          return;
        }
        if (typeof c == "object" && !(0, n.alwaysValidSchema)(d, c)) {
          const T = o.name("valid");
          v.removeAdditional === "failing" ? (b($, T, !1), o.if((0, e.not)(T), () => {
            a.reset(), g($);
          })) : (b($, T), h || o.if((0, e.not)(T), () => o.break()));
        }
      }
      function b($, T, I) {
        const x = {
          keyword: "additionalProperties",
          dataProp: $,
          dataPropType: n.Type.Str
        };
        I === !1 && Object.assign(x, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), a.subschema(x, T);
      }
    }
  };
  return Or.default = s, Or;
}
var Tr = {}, Aa;
function Ol() {
  if (Aa) return Tr;
  Aa = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const t = Wt(), e = qe(), r = ie(), n = Jc(), i = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: a, schema: o, parentSchema: c, data: u, it: l } = s;
      l.opts.removeAdditional === "all" && c.additionalProperties === void 0 && n.default.code(new t.KeywordCxt(l, n.default, "additionalProperties"));
      const m = (0, e.allSchemaProperties)(o);
      for (const p of m)
        l.definedProperties.add(p);
      l.opts.unevaluated && m.length && l.props !== !0 && (l.props = r.mergeEvaluated.props(a, (0, r.toHash)(m), l.props));
      const d = m.filter((p) => !(0, r.alwaysValidSchema)(l, o[p]));
      if (d.length === 0)
        return;
      const h = a.name("valid");
      for (const p of d)
        v(p) ? w(p) : (a.if((0, e.propertyInData)(a, u, p, l.opts.ownProperties)), w(p), l.allErrors || a.else().var(h, !0), a.endIf()), s.it.definedProperties.add(p), s.ok(h);
      function v(p) {
        return l.opts.useDefaults && !l.compositeRule && o[p].default !== void 0;
      }
      function w(p) {
        s.subschema({
          keyword: "properties",
          schemaProp: p,
          dataProp: p
        }, h);
      }
    }
  };
  return Tr.default = i, Tr;
}
var Pr = {}, Ia;
function Tl() {
  if (Ia) return Pr;
  Ia = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const t = qe(), e = re(), r = ie(), n = ie(), i = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: a, schema: o, data: c, parentSchema: u, it: l } = s, { opts: m } = l, d = (0, t.allSchemaProperties)(o), h = d.filter((S) => (0, r.alwaysValidSchema)(l, o[S]));
      if (d.length === 0 || h.length === d.length && (!l.opts.unevaluated || l.props === !0))
        return;
      const v = m.strictSchema && !m.allowMatchingProperties && u.properties, w = a.name("valid");
      l.props !== !0 && !(l.props instanceof e.Name) && (l.props = (0, n.evaluatedPropsToName)(a, l.props));
      const { props: p } = l;
      _();
      function _() {
        for (const S of d)
          v && f(S), l.allErrors ? g(S) : (a.var(w, !0), g(S), a.if(w));
      }
      function f(S) {
        for (const b in v)
          new RegExp(S).test(b) && (0, r.checkStrictMode)(l, `property ${b} matches pattern ${S} (use allowMatchingProperties)`);
      }
      function g(S) {
        a.forIn("key", c, (b) => {
          a.if((0, e._)`${(0, t.usePattern)(s, S)}.test(${b})`, () => {
            const $ = h.includes(S);
            $ || s.subschema({
              keyword: "patternProperties",
              schemaProp: S,
              dataProp: b,
              dataPropType: n.Type.Str
            }, w), l.opts.unevaluated && p !== !0 ? a.assign((0, e._)`${p}[${b}]`, !0) : !$ && !l.allErrors && a.if((0, e.not)(w), () => a.break());
          });
        });
      }
    }
  };
  return Pr.default = i, Pr;
}
var kr = {}, ja;
function Pl() {
  if (ja) return kr;
  ja = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const t = ie(), e = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(r) {
      const { gen: n, schema: i, it: s } = r;
      if ((0, t.alwaysValidSchema)(s, i)) {
        r.fail();
        return;
      }
      const a = n.name("valid");
      r.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, a), r.failResult(a, () => r.reset(), () => r.error());
    },
    error: { message: "must NOT be valid" }
  };
  return kr.default = e, kr;
}
var Ar = {}, Na;
function kl() {
  if (Na) return Ar;
  Na = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: qe().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Ar.default = e, Ar;
}
var Ir = {}, Ca;
function Al() {
  if (Ca) return Ir;
  Ca = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const t = re(), e = ie(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: i }) => (0, t._)`{passingSchemas: ${i.passing}}`
    },
    code(i) {
      const { gen: s, schema: a, parentSchema: o, it: c } = i;
      if (!Array.isArray(a))
        throw new Error("ajv implementation error");
      if (c.opts.discriminator && o.discriminator)
        return;
      const u = a, l = s.let("valid", !1), m = s.let("passing", null), d = s.name("_valid");
      i.setParams({ passing: m }), s.block(h), i.result(l, () => i.reset(), () => i.error(!0));
      function h() {
        u.forEach((v, w) => {
          let p;
          (0, e.alwaysValidSchema)(c, v) ? s.var(d, !0) : p = i.subschema({
            keyword: "oneOf",
            schemaProp: w,
            compositeRule: !0
          }, d), w > 0 && s.if((0, t._)`${d} && ${l}`).assign(l, !1).assign(m, (0, t._)`[${m}, ${w}]`).else(), s.if(d, () => {
            s.assign(l, !0), s.assign(m, w), p && i.mergeEvaluated(p, t.Name);
          });
        });
      }
    }
  };
  return Ir.default = n, Ir;
}
var jr = {}, Da;
function Il() {
  if (Da) return jr;
  Da = 1, Object.defineProperty(jr, "__esModule", { value: !0 });
  const t = ie(), e = {
    keyword: "allOf",
    schemaType: "array",
    code(r) {
      const { gen: n, schema: i, it: s } = r;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      const a = n.name("valid");
      i.forEach((o, c) => {
        if ((0, t.alwaysValidSchema)(s, o))
          return;
        const u = r.subschema({ keyword: "allOf", schemaProp: c }, a);
        r.ok(a), r.mergeEvaluated(u);
      });
    }
  };
  return jr.default = e, jr;
}
var Nr = {}, La;
function jl() {
  if (La) return Nr;
  La = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const t = re(), e = ie(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, t.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, t._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: a, parentSchema: o, it: c } = s;
      o.then === void 0 && o.else === void 0 && (0, e.checkStrictMode)(c, '"if" without "then" and "else" is ignored');
      const u = i(c, "then"), l = i(c, "else");
      if (!u && !l)
        return;
      const m = a.let("valid", !0), d = a.name("_valid");
      if (h(), s.reset(), u && l) {
        const w = a.let("ifClause");
        s.setParams({ ifClause: w }), a.if(d, v("then", w), v("else", w));
      } else u ? a.if(d, v("then")) : a.if((0, t.not)(d), v("else"));
      s.pass(m, () => s.error(!0));
      function h() {
        const w = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, d);
        s.mergeEvaluated(w);
      }
      function v(w, p) {
        return () => {
          const _ = s.subschema({ keyword: w }, d);
          a.assign(m, d), s.mergeValidEvaluated(_, m), p ? a.assign(p, (0, t._)`${w}`) : s.setParams({ ifClause: w });
        };
      }
    }
  };
  function i(s, a) {
    const o = s.schema[a];
    return o !== void 0 && !(0, e.alwaysValidSchema)(s, o);
  }
  return Nr.default = n, Nr;
}
var Cr = {}, qa;
function Nl() {
  if (qa) return Cr;
  qa = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const t = ie(), e = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: n, it: i }) {
      n.if === void 0 && (0, t.checkStrictMode)(i, `"${r}" without "if" is ignored`);
    }
  };
  return Cr.default = e, Cr;
}
var Ua;
function Xc() {
  if (Ua) return br;
  Ua = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const t = Hc(), e = El(), r = Wc(), n = $l(), i = Sl(), s = mi(), a = Rl(), o = Jc(), c = Ol(), u = Tl(), l = Pl(), m = kl(), d = Al(), h = Il(), v = jl(), w = Nl();
  function p(_ = !1) {
    const f = [
      // any
      l.default,
      m.default,
      d.default,
      h.default,
      v.default,
      w.default,
      // object
      a.default,
      o.default,
      s.default,
      c.default,
      u.default
    ];
    return _ ? f.push(e.default, n.default) : f.push(t.default, r.default), f.push(i.default), f;
  }
  return br.default = p, br;
}
var Dr = {}, mt = {}, Ma;
function Yc() {
  if (Ma) return mt;
  Ma = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.dynamicAnchor = void 0;
  const t = re(), e = Le(), r = wn(), n = fi(), i = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (o) => s(o, o.schema)
  };
  function s(o, c) {
    const { gen: u, it: l } = o;
    l.schemaEnv.root.dynamicAnchors[c] = !0;
    const m = (0, t._)`${e.default.dynamicAnchors}${(0, t.getProperty)(c)}`, d = l.errSchemaPath === "#" ? l.validateName : a(o);
    u.if((0, t._)`!${m}`, () => u.assign(m, d));
  }
  mt.dynamicAnchor = s;
  function a(o) {
    const { schemaEnv: c, schema: u, self: l } = o.it, { root: m, baseId: d, localRefs: h, meta: v } = c.root, { schemaId: w } = l.opts, p = new r.SchemaEnv({ schema: u, schemaId: w, root: m, baseId: d, localRefs: h, meta: v });
    return r.compileSchema.call(l, p), (0, n.getValidate)(o, p);
  }
  return mt.default = i, mt;
}
var yt = {}, xa;
function Qc() {
  if (xa) return yt;
  xa = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.dynamicRef = void 0;
  const t = re(), e = Le(), r = fi(), n = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (s) => i(s, s.schema)
  };
  function i(s, a) {
    const { gen: o, keyword: c, it: u } = s;
    if (a[0] !== "#")
      throw new Error(`"${c}" only supports hash fragment reference`);
    const l = a.slice(1);
    if (u.allErrors)
      m();
    else {
      const h = o.let("valid", !1);
      m(h), s.ok(h);
    }
    function m(h) {
      if (u.schemaEnv.root.dynamicAnchors[l]) {
        const v = o.let("_v", (0, t._)`${e.default.dynamicAnchors}${(0, t.getProperty)(l)}`);
        o.if(v, d(v, h), d(u.validateName, h));
      } else
        d(u.validateName, h)();
    }
    function d(h, v) {
      return v ? () => o.block(() => {
        (0, r.callRef)(s, h), o.let(v, !0);
      }) : () => (0, r.callRef)(s, h);
    }
  }
  return yt.dynamicRef = i, yt.default = n, yt;
}
var Lr = {}, Fa;
function Cl() {
  if (Fa) return Lr;
  Fa = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const t = Yc(), e = ie(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, t.dynamicAnchor)(n, "") : (0, e.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Lr.default = r, Lr;
}
var qr = {}, Va;
function Dl() {
  if (Va) return qr;
  Va = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const t = Qc(), e = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, t.dynamicRef)(r, r.schema)
  };
  return qr.default = e, qr;
}
var za;
function Ll() {
  if (za) return Dr;
  za = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const t = Yc(), e = Qc(), r = Cl(), n = Dl(), i = [t.default, e.default, r.default, n.default];
  return Dr.default = i, Dr;
}
var Ur = {}, Mr = {}, Ba;
function ql() {
  if (Ba) return Mr;
  Ba = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const t = mi(), e = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: t.error,
    code: (r) => (0, t.validatePropertyDeps)(r)
  };
  return Mr.default = e, Mr;
}
var xr = {}, Ka;
function Ul() {
  if (Ka) return xr;
  Ka = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const t = mi(), e = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, t.validateSchemaDeps)(r)
  };
  return xr.default = e, xr;
}
var Fr = {}, Ga;
function Ml() {
  if (Ga) return Fr;
  Ga = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const t = ie(), e = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: n, it: i }) {
      n.contains === void 0 && (0, t.checkStrictMode)(i, `"${r}" without "contains" is ignored`);
    }
  };
  return Fr.default = e, Fr;
}
var Ha;
function xl() {
  if (Ha) return Ur;
  Ha = 1, Object.defineProperty(Ur, "__esModule", { value: !0 });
  const t = ql(), e = Ul(), r = Ml(), n = [t.default, e.default, r.default];
  return Ur.default = n, Ur;
}
var Vr = {}, zr = {}, Wa;
function Fl() {
  if (Wa) return zr;
  Wa = 1, Object.defineProperty(zr, "__esModule", { value: !0 });
  const t = re(), e = ie(), r = Le(), i = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: s }) => (0, t._)`{unevaluatedProperty: ${s.unevaluatedProperty}}`
    },
    code(s) {
      const { gen: a, schema: o, data: c, errsCount: u, it: l } = s;
      if (!u)
        throw new Error("ajv implementation error");
      const { allErrors: m, props: d } = l;
      d instanceof t.Name ? a.if((0, t._)`${d} !== true`, () => a.forIn("key", c, (p) => a.if(v(d, p), () => h(p)))) : d !== !0 && a.forIn("key", c, (p) => d === void 0 ? h(p) : a.if(w(d, p), () => h(p))), l.props = !0, s.ok((0, t._)`${u} === ${r.default.errors}`);
      function h(p) {
        if (o === !1) {
          s.setParams({ unevaluatedProperty: p }), s.error(), m || a.break();
          return;
        }
        if (!(0, e.alwaysValidSchema)(l, o)) {
          const _ = a.name("valid");
          s.subschema({
            keyword: "unevaluatedProperties",
            dataProp: p,
            dataPropType: e.Type.Str
          }, _), m || a.if((0, t.not)(_), () => a.break());
        }
      }
      function v(p, _) {
        return (0, t._)`!${p} || !${p}[${_}]`;
      }
      function w(p, _) {
        const f = [];
        for (const g in p)
          p[g] === !0 && f.push((0, t._)`${_} !== ${g}`);
        return (0, t.and)(...f);
      }
    }
  };
  return zr.default = i, zr;
}
var Br = {}, Ja;
function Vl() {
  if (Ja) return Br;
  Ja = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const t = re(), e = ie(), n = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: i } }) => (0, t.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, t._)`{limit: ${i}}`
    },
    code(i) {
      const { gen: s, schema: a, data: o, it: c } = i, u = c.items || 0;
      if (u === !0)
        return;
      const l = s.const("len", (0, t._)`${o}.length`);
      if (a === !1)
        i.setParams({ len: u }), i.fail((0, t._)`${l} > ${u}`);
      else if (typeof a == "object" && !(0, e.alwaysValidSchema)(c, a)) {
        const d = s.var("valid", (0, t._)`${l} <= ${u}`);
        s.if((0, t.not)(d), () => m(d, u)), i.ok(d);
      }
      c.items = !0;
      function m(d, h) {
        s.forRange("i", h, l, (v) => {
          i.subschema({ keyword: "unevaluatedItems", dataProp: v, dataPropType: e.Type.Num }, d), c.allErrors || s.if((0, t.not)(d), () => s.break());
        });
      }
    }
  };
  return Br.default = n, Br;
}
var Xa;
function zl() {
  if (Xa) return Vr;
  Xa = 1, Object.defineProperty(Vr, "__esModule", { value: !0 });
  const t = Fl(), e = Vl(), r = [t.default, e.default];
  return Vr.default = r, Vr;
}
var Kr = {}, Gr = {}, Ya;
function Bl() {
  if (Ya) return Gr;
  Ya = 1, Object.defineProperty(Gr, "__esModule", { value: !0 });
  const t = re(), r = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, t.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, t._)`{format: ${n}}`
    },
    code(n, i) {
      const { gen: s, data: a, $data: o, schema: c, schemaCode: u, it: l } = n, { opts: m, errSchemaPath: d, schemaEnv: h, self: v } = l;
      if (!m.validateFormats)
        return;
      o ? w() : p();
      function w() {
        const _ = s.scopeValue("formats", {
          ref: v.formats,
          code: m.code.formats
        }), f = s.const("fDef", (0, t._)`${_}[${u}]`), g = s.let("fType"), S = s.let("format");
        s.if((0, t._)`typeof ${f} == "object" && !(${f} instanceof RegExp)`, () => s.assign(g, (0, t._)`${f}.type || "string"`).assign(S, (0, t._)`${f}.validate`), () => s.assign(g, (0, t._)`"string"`).assign(S, f)), n.fail$data((0, t.or)(b(), $()));
        function b() {
          return m.strictSchema === !1 ? t.nil : (0, t._)`${u} && !${S}`;
        }
        function $() {
          const T = h.$async ? (0, t._)`(${f}.async ? await ${S}(${a}) : ${S}(${a}))` : (0, t._)`${S}(${a})`, I = (0, t._)`(typeof ${S} == "function" ? ${T} : ${S}.test(${a}))`;
          return (0, t._)`${S} && ${S} !== true && ${g} === ${i} && !${I}`;
        }
      }
      function p() {
        const _ = v.formats[c];
        if (!_) {
          b();
          return;
        }
        if (_ === !0)
          return;
        const [f, g, S] = $(_);
        f === i && n.pass(T());
        function b() {
          if (m.strictSchema === !1) {
            v.logger.warn(I());
            return;
          }
          throw new Error(I());
          function I() {
            return `unknown format "${c}" ignored in schema at path "${d}"`;
          }
        }
        function $(I) {
          const x = I instanceof RegExp ? (0, t.regexpCode)(I) : m.code.formats ? (0, t._)`${m.code.formats}${(0, t.getProperty)(c)}` : void 0, G = s.scopeValue("formats", { key: c, ref: I, code: x });
          return typeof I == "object" && !(I instanceof RegExp) ? [I.type || "string", I.validate, (0, t._)`${G}.validate`] : ["string", I, G];
        }
        function T() {
          if (typeof _ == "object" && !(_ instanceof RegExp) && _.async) {
            if (!h.$async)
              throw new Error("async format in sync schema");
            return (0, t._)`await ${S}(${a})`;
          }
          return typeof g == "function" ? (0, t._)`${S}(${a})` : (0, t._)`${S}.test(${a})`;
        }
      }
    }
  };
  return Gr.default = r, Gr;
}
var Qa;
function Zc() {
  if (Qa) return Kr;
  Qa = 1, Object.defineProperty(Kr, "__esModule", { value: !0 });
  const e = [Bl().default];
  return Kr.default = e, Kr;
}
var st = {}, Za;
function eu() {
  return Za || (Za = 1, Object.defineProperty(st, "__esModule", { value: !0 }), st.contentVocabulary = st.metadataVocabulary = void 0, st.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], st.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), st;
}
var eo;
function Kl() {
  if (eo) return ir;
  eo = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const t = Kc(), e = Gc(), r = Xc(), n = Ll(), i = xl(), s = zl(), a = Zc(), o = eu(), c = [
    n.default,
    t.default,
    e.default,
    (0, r.default)(!0),
    a.default,
    o.metadataVocabulary,
    o.contentVocabulary,
    i.default,
    s.default
  ];
  return ir.default = c, ir;
}
var Hr = {}, Lt = {}, to;
function Gl() {
  if (to) return Lt;
  to = 1, Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.DiscrError = void 0;
  var t;
  return (function(e) {
    e.Tag = "tag", e.Mapping = "mapping";
  })(t || (Lt.DiscrError = t = {})), Lt;
}
var ro;
function tu() {
  if (ro) return Hr;
  ro = 1, Object.defineProperty(Hr, "__esModule", { value: !0 });
  const t = re(), e = Gl(), r = wn(), n = Jt(), i = ie(), a = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: o, tagName: c } }) => o === e.DiscrError.Tag ? `tag "${c}" must be string` : `value of tag "${c}" must be in oneOf`,
      params: ({ params: { discrError: o, tag: c, tagName: u } }) => (0, t._)`{error: ${o}, tag: ${u}, tagValue: ${c}}`
    },
    code(o) {
      const { gen: c, data: u, schema: l, parentSchema: m, it: d } = o, { oneOf: h } = m;
      if (!d.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const v = l.propertyName;
      if (typeof v != "string")
        throw new Error("discriminator: requires propertyName");
      if (l.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!h)
        throw new Error("discriminator: requires oneOf keyword");
      const w = c.let("valid", !1), p = c.const("tag", (0, t._)`${u}${(0, t.getProperty)(v)}`);
      c.if((0, t._)`typeof ${p} == "string"`, () => _(), () => o.error(!1, { discrError: e.DiscrError.Tag, tag: p, tagName: v })), o.ok(w);
      function _() {
        const S = g();
        c.if(!1);
        for (const b in S)
          c.elseIf((0, t._)`${p} === ${b}`), c.assign(w, f(S[b]));
        c.else(), o.error(!1, { discrError: e.DiscrError.Mapping, tag: p, tagName: v }), c.endIf();
      }
      function f(S) {
        const b = c.name("valid"), $ = o.subschema({ keyword: "oneOf", schemaProp: S }, b);
        return o.mergeEvaluated($, t.Name), b;
      }
      function g() {
        var S;
        const b = {}, $ = I(m);
        let T = !0;
        for (let q = 0; q < h.length; q++) {
          let z = h[q];
          if (z?.$ref && !(0, i.schemaHasRulesButRef)(z, d.self.RULES)) {
            const D = z.$ref;
            if (z = r.resolveRef.call(d.self, d.schemaEnv.root, d.baseId, D), z instanceof r.SchemaEnv && (z = z.schema), z === void 0)
              throw new n.default(d.opts.uriResolver, d.baseId, D);
          }
          const H = (S = z?.properties) === null || S === void 0 ? void 0 : S[v];
          if (typeof H != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${v}"`);
          T = T && ($ || I(z)), x(H, q);
        }
        if (!T)
          throw new Error(`discriminator: "${v}" must be required`);
        return b;
        function I({ required: q }) {
          return Array.isArray(q) && q.includes(v);
        }
        function x(q, z) {
          if (q.const)
            G(q.const, z);
          else if (q.enum)
            for (const H of q.enum)
              G(H, z);
          else
            throw new Error(`discriminator: "properties/${v}" must have "const" or "enum"`);
        }
        function G(q, z) {
          if (typeof q != "string" || q in b)
            throw new Error(`discriminator: "${v}" values must be unique strings`);
          b[q] = z;
        }
      }
    }
  };
  return Hr.default = a, Hr;
}
var Wr = {};
const Hl = "https://json-schema.org/draft/2020-12/schema", Wl = "https://json-schema.org/draft/2020-12/schema", Jl = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Xl = "meta", Yl = "Core and Validation specifications meta-schema", Ql = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], Zl = ["object", "boolean"], ed = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", td = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, rd = {
  $schema: Hl,
  $id: Wl,
  $vocabulary: Jl,
  $dynamicAnchor: Xl,
  title: Yl,
  allOf: Ql,
  type: Zl,
  $comment: ed,
  properties: td
}, nd = "https://json-schema.org/draft/2020-12/schema", sd = "https://json-schema.org/draft/2020-12/meta/applicator", id = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, ad = "meta", od = "Applicator vocabulary meta-schema", cd = ["object", "boolean"], ud = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, ld = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, dd = {
  $schema: nd,
  $id: sd,
  $vocabulary: id,
  $dynamicAnchor: ad,
  title: od,
  type: cd,
  properties: ud,
  $defs: ld
}, hd = "https://json-schema.org/draft/2020-12/schema", fd = "https://json-schema.org/draft/2020-12/meta/unevaluated", pd = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, md = "meta", yd = "Unevaluated applicator vocabulary meta-schema", gd = ["object", "boolean"], vd = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, _d = {
  $schema: hd,
  $id: fd,
  $vocabulary: pd,
  $dynamicAnchor: md,
  title: yd,
  type: gd,
  properties: vd
}, wd = "https://json-schema.org/draft/2020-12/schema", bd = "https://json-schema.org/draft/2020-12/meta/content", Ed = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, $d = "meta", Sd = "Content vocabulary meta-schema", Rd = ["object", "boolean"], Od = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, Td = {
  $schema: wd,
  $id: bd,
  $vocabulary: Ed,
  $dynamicAnchor: $d,
  title: Sd,
  type: Rd,
  properties: Od
}, Pd = "https://json-schema.org/draft/2020-12/schema", kd = "https://json-schema.org/draft/2020-12/meta/core", Ad = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, Id = "meta", jd = "Core vocabulary meta-schema", Nd = ["object", "boolean"], Cd = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, Dd = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, Ld = {
  $schema: Pd,
  $id: kd,
  $vocabulary: Ad,
  $dynamicAnchor: Id,
  title: jd,
  type: Nd,
  properties: Cd,
  $defs: Dd
}, qd = "https://json-schema.org/draft/2020-12/schema", Ud = "https://json-schema.org/draft/2020-12/meta/format-annotation", Md = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, xd = "meta", Fd = "Format vocabulary meta-schema for annotation results", Vd = ["object", "boolean"], zd = { format: { type: "string" } }, Bd = {
  $schema: qd,
  $id: Ud,
  $vocabulary: Md,
  $dynamicAnchor: xd,
  title: Fd,
  type: Vd,
  properties: zd
}, Kd = "https://json-schema.org/draft/2020-12/schema", Gd = "https://json-schema.org/draft/2020-12/meta/meta-data", Hd = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, Wd = "meta", Jd = "Meta-data vocabulary meta-schema", Xd = ["object", "boolean"], Yd = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, Qd = {
  $schema: Kd,
  $id: Gd,
  $vocabulary: Hd,
  $dynamicAnchor: Wd,
  title: Jd,
  type: Xd,
  properties: Yd
}, Zd = "https://json-schema.org/draft/2020-12/schema", eh = "https://json-schema.org/draft/2020-12/meta/validation", th = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, rh = "meta", nh = "Validation vocabulary meta-schema", sh = ["object", "boolean"], ih = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, ah = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, oh = {
  $schema: Zd,
  $id: eh,
  $vocabulary: th,
  $dynamicAnchor: rh,
  title: nh,
  type: sh,
  properties: ih,
  $defs: ah
};
var no;
function ch() {
  if (no) return Wr;
  no = 1, Object.defineProperty(Wr, "__esModule", { value: !0 });
  const t = rd, e = dd, r = _d, n = Td, i = Ld, s = Bd, a = Qd, o = oh, c = ["/properties"];
  function u(l) {
    return [
      t,
      e,
      r,
      n,
      i,
      m(this, s),
      a,
      m(this, o)
    ].forEach((d) => this.addMetaSchema(d, void 0, !1)), this;
    function m(d, h) {
      return l ? d.$dataMetaSchema(h, c) : h;
    }
  }
  return Wr.default = u, Wr;
}
var so;
function uh() {
  return so || (so = 1, (function(t, e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv2020 = void 0;
    const r = Bc(), n = Kl(), i = tu(), s = ch(), a = "https://json-schema.org/draft/2020-12/schema";
    class o extends r.default {
      constructor(h = {}) {
        super({
          ...h,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((h) => this.addVocabulary(h)), this.opts.discriminator && this.addKeyword(i.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: h, meta: v } = this.opts;
        v && (s.default.call(this, h), this.refs["http://json-schema.org/schema"] = a);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
      }
    }
    e.Ajv2020 = o, t.exports = e = o, t.exports.Ajv2020 = o, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = o;
    var c = Wt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return c.KeywordCxt;
    } });
    var u = re();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return u._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return u.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return u.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return u.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return u.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return u.CodeGen;
    } });
    var l = _n();
    Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
      return l.default;
    } });
    var m = Jt();
    Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
      return m.default;
    } });
  })(er, er.exports)), er.exports;
}
var lh = uh(), Jr = { exports: {} }, Hn = {}, io;
function dh() {
  return io || (io = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.formatNames = t.fastFormats = t.fullFormats = void 0;
    function e(q, z) {
      return { validate: q, compare: z };
    }
    t.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: e(s, a),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: e(c(!0), u),
      "date-time": e(d(!0), h),
      "iso-time": e(c(), l),
      "iso-date-time": e(d(), v),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: _,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: G,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: g,
      // signed 32 bit integer
      int32: { type: "number", validate: $ },
      // signed 64 bit integer
      int64: { type: "number", validate: T },
      // C-type float
      float: { type: "number", validate: I },
      // C-type double
      double: { type: "number", validate: I },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, t.fastFormats = {
      ...t.fullFormats,
      date: e(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, a),
      time: e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, u),
      "date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, h),
      "iso-time": e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, l),
      "iso-date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, v),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, t.formatNames = Object.keys(t.fullFormats);
    function r(q) {
      return q % 4 === 0 && (q % 100 !== 0 || q % 400 === 0);
    }
    const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, i = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(q) {
      const z = n.exec(q);
      if (!z)
        return !1;
      const H = +z[1], D = +z[2], U = +z[3];
      return D >= 1 && D <= 12 && U >= 1 && U <= (D === 2 && r(H) ? 29 : i[D]);
    }
    function a(q, z) {
      if (q && z)
        return q > z ? 1 : q < z ? -1 : 0;
    }
    const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function c(q) {
      return function(H) {
        const D = o.exec(H);
        if (!D)
          return !1;
        const U = +D[1], J = +D[2], F = +D[3], B = D[4], W = D[5] === "-" ? -1 : 1, C = +(D[6] || 0), A = +(D[7] || 0);
        if (C > 23 || A > 59 || q && !B)
          return !1;
        if (U <= 23 && J <= 59 && F < 60)
          return !0;
        const O = J - A * W, R = U - C * W - (O < 0 ? 1 : 0);
        return (R === 23 || R === -1) && (O === 59 || O === -1) && F < 61;
      };
    }
    function u(q, z) {
      if (!(q && z))
        return;
      const H = (/* @__PURE__ */ new Date("2020-01-01T" + q)).valueOf(), D = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf();
      if (H && D)
        return H - D;
    }
    function l(q, z) {
      if (!(q && z))
        return;
      const H = o.exec(q), D = o.exec(z);
      if (H && D)
        return q = H[1] + H[2] + H[3], z = D[1] + D[2] + D[3], q > z ? 1 : q < z ? -1 : 0;
    }
    const m = /t|\s/i;
    function d(q) {
      const z = c(q);
      return function(D) {
        const U = D.split(m);
        return U.length === 2 && s(U[0]) && z(U[1]);
      };
    }
    function h(q, z) {
      if (!(q && z))
        return;
      const H = new Date(q).valueOf(), D = new Date(z).valueOf();
      if (H && D)
        return H - D;
    }
    function v(q, z) {
      if (!(q && z))
        return;
      const [H, D] = q.split(m), [U, J] = z.split(m), F = a(H, U);
      if (F !== void 0)
        return F || u(D, J);
    }
    const w = /\/|:/, p = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function _(q) {
      return w.test(q) && p.test(q);
    }
    const f = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function g(q) {
      return f.lastIndex = 0, f.test(q);
    }
    const S = -2147483648, b = 2 ** 31 - 1;
    function $(q) {
      return Number.isInteger(q) && q <= b && q >= S;
    }
    function T(q) {
      return Number.isInteger(q);
    }
    function I() {
      return !0;
    }
    const x = /[^\\]\\Z/;
    function G(q) {
      if (x.test(q))
        return !1;
      try {
        return new RegExp(q), !0;
      } catch {
        return !1;
      }
    }
  })(Hn)), Hn;
}
var Wn = {}, Xr = { exports: {} }, Yr = {}, ao;
function hh() {
  if (ao) return Yr;
  ao = 1, Object.defineProperty(Yr, "__esModule", { value: !0 });
  const t = Kc(), e = Gc(), r = Xc(), n = Zc(), i = eu(), s = [
    t.default,
    e.default,
    (0, r.default)(),
    n.default,
    i.metadataVocabulary,
    i.contentVocabulary
  ];
  return Yr.default = s, Yr;
}
const fh = "http://json-schema.org/draft-07/schema#", ph = "http://json-schema.org/draft-07/schema#", mh = "Core schema meta-schema", yh = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, gh = ["object", "boolean"], vh = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, _h = {
  $schema: fh,
  $id: ph,
  title: mh,
  definitions: yh,
  type: gh,
  properties: vh,
  default: !0
};
var oo;
function wh() {
  return oo || (oo = 1, (function(t, e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv = void 0;
    const r = Bc(), n = hh(), i = tu(), s = _h, a = ["/properties"], o = "http://json-schema.org/draft-07/schema";
    class c extends r.default {
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((v) => this.addVocabulary(v)), this.opts.discriminator && this.addKeyword(i.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const v = this.opts.$data ? this.$dataMetaSchema(s, a) : s;
        this.addMetaSchema(v, o, !1), this.refs["http://json-schema.org/schema"] = o;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    e.Ajv = c, t.exports = e = c, t.exports.Ajv = c, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = c;
    var u = Wt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var l = re();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return l._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return l.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return l.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return l.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return l.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return l.CodeGen;
    } });
    var m = _n();
    Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
      return m.default;
    } });
    var d = Jt();
    Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })(Xr, Xr.exports)), Xr.exports;
}
var co;
function bh() {
  return co || (co = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.formatLimitDefinition = void 0;
    const e = wh(), r = re(), n = r.operators, i = {
      formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
      formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
      formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
    }, s = {
      message: ({ keyword: o, schemaCode: c }) => (0, r.str)`should be ${i[o].okStr} ${c}`,
      params: ({ keyword: o, schemaCode: c }) => (0, r._)`{comparison: ${i[o].okStr}, limit: ${c}}`
    };
    t.formatLimitDefinition = {
      keyword: Object.keys(i),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(o) {
        const { gen: c, data: u, schemaCode: l, keyword: m, it: d } = o, { opts: h, self: v } = d;
        if (!h.validateFormats)
          return;
        const w = new e.KeywordCxt(d, v.RULES.all.format.definition, "format");
        w.$data ? p() : _();
        function p() {
          const g = c.scopeValue("formats", {
            ref: v.formats,
            code: h.code.formats
          }), S = c.const("fmt", (0, r._)`${g}[${w.schemaCode}]`);
          o.fail$data((0, r.or)((0, r._)`typeof ${S} != "object"`, (0, r._)`${S} instanceof RegExp`, (0, r._)`typeof ${S}.compare != "function"`, f(S)));
        }
        function _() {
          const g = w.schema, S = v.formats[g];
          if (!S || S === !0)
            return;
          if (typeof S != "object" || S instanceof RegExp || typeof S.compare != "function")
            throw new Error(`"${m}": format "${g}" does not define "compare" function`);
          const b = c.scopeValue("formats", {
            key: g,
            ref: S,
            code: h.code.formats ? (0, r._)`${h.code.formats}${(0, r.getProperty)(g)}` : void 0
          });
          o.fail$data(f(b));
        }
        function f(g) {
          return (0, r._)`${g}.compare(${u}, ${l}) ${i[m].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const a = (o) => (o.addKeyword(t.formatLimitDefinition), o);
    t.default = a;
  })(Wn)), Wn;
}
var uo;
function Eh() {
  return uo || (uo = 1, (function(t, e) {
    Object.defineProperty(e, "__esModule", { value: !0 });
    const r = dh(), n = bh(), i = re(), s = new i.Name("fullFormats"), a = new i.Name("fastFormats"), o = (u, l = { keywords: !0 }) => {
      if (Array.isArray(l))
        return c(u, l, r.fullFormats, s), u;
      const [m, d] = l.mode === "fast" ? [r.fastFormats, a] : [r.fullFormats, s], h = l.formats || r.formatNames;
      return c(u, h, m, d), l.keywords && (0, n.default)(u), u;
    };
    o.get = (u, l = "full") => {
      const d = (l === "fast" ? r.fastFormats : r.fullFormats)[u];
      if (!d)
        throw new Error(`Unknown format "${u}"`);
      return d;
    };
    function c(u, l, m, d) {
      var h, v;
      (h = (v = u.opts.code).formats) !== null && h !== void 0 || (v.formats = (0, i._)`require("ajv-formats/dist/formats").${d}`);
      for (const w of l)
        u.addFormat(w, m[w]);
    }
    t.exports = e = o, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = o;
  })(Jr, Jr.exports)), Jr.exports;
}
var $h = Eh();
const Sh = /* @__PURE__ */ hi($h), Rh = (t, e, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const i = Object.getOwnPropertyDescriptor(t, r), s = Object.getOwnPropertyDescriptor(e, r);
  !Oh(i, s) && n || Object.defineProperty(t, r, s);
}, Oh = function(t, e) {
  return t === void 0 || t.configurable || t.writable === e.writable && t.enumerable === e.enumerable && t.configurable === e.configurable && (t.writable || t.value === e.value);
}, Th = (t, e) => {
  const r = Object.getPrototypeOf(e);
  r !== Object.getPrototypeOf(t) && Object.setPrototypeOf(t, r);
}, Ph = (t, e) => `/* Wrapped ${t}*/
${e}`, kh = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Ah = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Ih = (t, e, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, i = Ph.bind(null, n, e.toString());
  Object.defineProperty(i, "name", Ah);
  const { writable: s, enumerable: a, configurable: o } = kh;
  Object.defineProperty(t, "toString", { value: i, writable: s, enumerable: a, configurable: o });
};
function jh(t, e, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = t;
  for (const i of Reflect.ownKeys(e))
    Rh(t, e, i, r);
  return Th(t, e), Ih(t, e, n), t;
}
const lo = (t, e = {}) => {
  if (typeof t != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: i = !1,
    after: s = !0
  } = e;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!i && !s)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let a, o, c;
  const u = function(...l) {
    const m = this, d = () => {
      a = void 0, o && (clearTimeout(o), o = void 0), s && (c = t.apply(m, l));
    }, h = () => {
      o = void 0, a && (clearTimeout(a), a = void 0), s && (c = t.apply(m, l));
    }, v = i && !a;
    return clearTimeout(a), a = setTimeout(d, r), n > 0 && n !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(h, n)), v && (c = t.apply(m, l)), c;
  };
  return jh(u, t), u.cancel = () => {
    a && (clearTimeout(a), a = void 0), o && (clearTimeout(o), o = void 0);
  }, u;
};
var Qr = { exports: {} }, Jn, ho;
function bn() {
  if (ho) return Jn;
  ho = 1;
  const t = "2.0.0", e = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, i = e - 6;
  return Jn = {
    MAX_LENGTH: e,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: i,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: t,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Jn;
}
var Xn, fo;
function En() {
  return fo || (fo = 1, Xn = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
  }), Xn;
}
var po;
function Xt() {
  return po || (po = 1, (function(t, e) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: i
    } = bn(), s = En();
    e = t.exports = {};
    const a = e.re = [], o = e.safeRe = [], c = e.src = [], u = e.safeSrc = [], l = e.t = {};
    let m = 0;
    const d = "[a-zA-Z0-9-]", h = [
      ["\\s", 1],
      ["\\d", i],
      [d, n]
    ], v = (p) => {
      for (const [_, f] of h)
        p = p.split(`${_}*`).join(`${_}{0,${f}}`).split(`${_}+`).join(`${_}{1,${f}}`);
      return p;
    }, w = (p, _, f) => {
      const g = v(_), S = m++;
      s(p, S, _), l[p] = S, c[S] = _, u[S] = g, a[S] = new RegExp(_, f ? "g" : void 0), o[S] = new RegExp(g, f ? "g" : void 0);
    };
    w("NUMERICIDENTIFIER", "0|[1-9]\\d*"), w("NUMERICIDENTIFIERLOOSE", "\\d+"), w("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), w("MAINVERSION", `(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`), w("MAINVERSIONLOOSE", `(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`), w("PRERELEASEIDENTIFIER", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIER]})`), w("PRERELEASEIDENTIFIERLOOSE", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIERLOOSE]})`), w("PRERELEASE", `(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`), w("PRERELEASELOOSE", `(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`), w("BUILDIDENTIFIER", `${d}+`), w("BUILD", `(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`), w("FULLPLAIN", `v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`), w("FULL", `^${c[l.FULLPLAIN]}$`), w("LOOSEPLAIN", `[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`), w("LOOSE", `^${c[l.LOOSEPLAIN]}$`), w("GTLT", "((?:<|>)?=?)"), w("XRANGEIDENTIFIERLOOSE", `${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), w("XRANGEIDENTIFIER", `${c[l.NUMERICIDENTIFIER]}|x|X|\\*`), w("XRANGEPLAIN", `[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`), w("XRANGEPLAINLOOSE", `[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`), w("XRANGE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`), w("XRANGELOOSE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`), w("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), w("COERCE", `${c[l.COERCEPLAIN]}(?:$|[^\\d])`), w("COERCEFULL", c[l.COERCEPLAIN] + `(?:${c[l.PRERELEASE]})?(?:${c[l.BUILD]})?(?:$|[^\\d])`), w("COERCERTL", c[l.COERCE], !0), w("COERCERTLFULL", c[l.COERCEFULL], !0), w("LONETILDE", "(?:~>?)"), w("TILDETRIM", `(\\s*)${c[l.LONETILDE]}\\s+`, !0), e.tildeTrimReplace = "$1~", w("TILDE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`), w("TILDELOOSE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`), w("LONECARET", "(?:\\^)"), w("CARETTRIM", `(\\s*)${c[l.LONECARET]}\\s+`, !0), e.caretTrimReplace = "$1^", w("CARET", `^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`), w("CARETLOOSE", `^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`), w("COMPARATORLOOSE", `^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`), w("COMPARATOR", `^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`), w("COMPARATORTRIM", `(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`, !0), e.comparatorTrimReplace = "$1$2$3", w("HYPHENRANGE", `^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`), w("HYPHENRANGELOOSE", `^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`), w("STAR", "(<|>)?=?\\s*\\*"), w("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), w("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Qr, Qr.exports)), Qr.exports;
}
var Yn, mo;
function yi() {
  if (mo) return Yn;
  mo = 1;
  const t = Object.freeze({ loose: !0 }), e = Object.freeze({});
  return Yn = (n) => n ? typeof n != "object" ? t : n : e, Yn;
}
var Qn, yo;
function ru() {
  if (yo) return Qn;
  yo = 1;
  const t = /^[0-9]+$/, e = (n, i) => {
    if (typeof n == "number" && typeof i == "number")
      return n === i ? 0 : n < i ? -1 : 1;
    const s = t.test(n), a = t.test(i);
    return s && a && (n = +n, i = +i), n === i ? 0 : s && !a ? -1 : a && !s ? 1 : n < i ? -1 : 1;
  };
  return Qn = {
    compareIdentifiers: e,
    rcompareIdentifiers: (n, i) => e(i, n)
  }, Qn;
}
var Zn, go;
function Re() {
  if (go) return Zn;
  go = 1;
  const t = En(), { MAX_LENGTH: e, MAX_SAFE_INTEGER: r } = bn(), { safeRe: n, t: i } = Xt(), s = yi(), { compareIdentifiers: a } = ru();
  class o {
    constructor(u, l) {
      if (l = s(l), u instanceof o) {
        if (u.loose === !!l.loose && u.includePrerelease === !!l.includePrerelease)
          return u;
        u = u.version;
      } else if (typeof u != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof u}".`);
      if (u.length > e)
        throw new TypeError(
          `version is longer than ${e} characters`
        );
      t("SemVer", u, l), this.options = l, this.loose = !!l.loose, this.includePrerelease = !!l.includePrerelease;
      const m = u.trim().match(l.loose ? n[i.LOOSE] : n[i.FULL]);
      if (!m)
        throw new TypeError(`Invalid Version: ${u}`);
      if (this.raw = u, this.major = +m[1], this.minor = +m[2], this.patch = +m[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      m[4] ? this.prerelease = m[4].split(".").map((d) => {
        if (/^[0-9]+$/.test(d)) {
          const h = +d;
          if (h >= 0 && h < r)
            return h;
        }
        return d;
      }) : this.prerelease = [], this.build = m[5] ? m[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(u) {
      if (t("SemVer.compare", this.version, this.options, u), !(u instanceof o)) {
        if (typeof u == "string" && u === this.version)
          return 0;
        u = new o(u, this.options);
      }
      return u.version === this.version ? 0 : this.compareMain(u) || this.comparePre(u);
    }
    compareMain(u) {
      return u instanceof o || (u = new o(u, this.options)), this.major < u.major ? -1 : this.major > u.major ? 1 : this.minor < u.minor ? -1 : this.minor > u.minor ? 1 : this.patch < u.patch ? -1 : this.patch > u.patch ? 1 : 0;
    }
    comparePre(u) {
      if (u instanceof o || (u = new o(u, this.options)), this.prerelease.length && !u.prerelease.length)
        return -1;
      if (!this.prerelease.length && u.prerelease.length)
        return 1;
      if (!this.prerelease.length && !u.prerelease.length)
        return 0;
      let l = 0;
      do {
        const m = this.prerelease[l], d = u.prerelease[l];
        if (t("prerelease compare", l, m, d), m === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (m === void 0)
          return -1;
        if (m === d)
          continue;
        return a(m, d);
      } while (++l);
    }
    compareBuild(u) {
      u instanceof o || (u = new o(u, this.options));
      let l = 0;
      do {
        const m = this.build[l], d = u.build[l];
        if (t("build compare", l, m, d), m === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (m === void 0)
          return -1;
        if (m === d)
          continue;
        return a(m, d);
      } while (++l);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(u, l, m) {
      if (u.startsWith("pre")) {
        if (!l && m === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (l) {
          const d = `-${l}`.match(this.options.loose ? n[i.PRERELEASELOOSE] : n[i.PRERELEASE]);
          if (!d || d[1] !== l)
            throw new Error(`invalid identifier: ${l}`);
        }
      }
      switch (u) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", l, m);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", l, m);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", l, m), this.inc("pre", l, m);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", l, m), this.inc("pre", l, m);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const d = Number(m) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [d];
          else {
            let h = this.prerelease.length;
            for (; --h >= 0; )
              typeof this.prerelease[h] == "number" && (this.prerelease[h]++, h = -2);
            if (h === -1) {
              if (l === this.prerelease.join(".") && m === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(d);
            }
          }
          if (l) {
            let h = [l, d];
            m === !1 && (h = [l]), a(this.prerelease[0], l) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = h) : this.prerelease = h;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${u}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Zn = o, Zn;
}
var es, vo;
function It() {
  if (vo) return es;
  vo = 1;
  const t = Re();
  return es = (r, n, i = !1) => {
    if (r instanceof t)
      return r;
    try {
      return new t(r, n);
    } catch (s) {
      if (!i)
        return null;
      throw s;
    }
  }, es;
}
var ts, _o;
function Nh() {
  if (_o) return ts;
  _o = 1;
  const t = It();
  return ts = (r, n) => {
    const i = t(r, n);
    return i ? i.version : null;
  }, ts;
}
var rs, wo;
function Ch() {
  if (wo) return rs;
  wo = 1;
  const t = It();
  return rs = (r, n) => {
    const i = t(r.trim().replace(/^[=v]+/, ""), n);
    return i ? i.version : null;
  }, rs;
}
var ns, bo;
function Dh() {
  if (bo) return ns;
  bo = 1;
  const t = Re();
  return ns = (r, n, i, s, a) => {
    typeof i == "string" && (a = s, s = i, i = void 0);
    try {
      return new t(
        r instanceof t ? r.version : r,
        i
      ).inc(n, s, a).version;
    } catch {
      return null;
    }
  }, ns;
}
var ss, Eo;
function Lh() {
  if (Eo) return ss;
  Eo = 1;
  const t = It();
  return ss = (r, n) => {
    const i = t(r, null, !0), s = t(n, null, !0), a = i.compare(s);
    if (a === 0)
      return null;
    const o = a > 0, c = o ? i : s, u = o ? s : i, l = !!c.prerelease.length;
    if (!!u.prerelease.length && !l) {
      if (!u.patch && !u.minor)
        return "major";
      if (u.compareMain(c) === 0)
        return u.minor && !u.patch ? "minor" : "patch";
    }
    const d = l ? "pre" : "";
    return i.major !== s.major ? d + "major" : i.minor !== s.minor ? d + "minor" : i.patch !== s.patch ? d + "patch" : "prerelease";
  }, ss;
}
var is, $o;
function qh() {
  if ($o) return is;
  $o = 1;
  const t = Re();
  return is = (r, n) => new t(r, n).major, is;
}
var as, So;
function Uh() {
  if (So) return as;
  So = 1;
  const t = Re();
  return as = (r, n) => new t(r, n).minor, as;
}
var os, Ro;
function Mh() {
  if (Ro) return os;
  Ro = 1;
  const t = Re();
  return os = (r, n) => new t(r, n).patch, os;
}
var cs, Oo;
function xh() {
  if (Oo) return cs;
  Oo = 1;
  const t = It();
  return cs = (r, n) => {
    const i = t(r, n);
    return i && i.prerelease.length ? i.prerelease : null;
  }, cs;
}
var us, To;
function Ue() {
  if (To) return us;
  To = 1;
  const t = Re();
  return us = (r, n, i) => new t(r, i).compare(new t(n, i)), us;
}
var ls, Po;
function Fh() {
  if (Po) return ls;
  Po = 1;
  const t = Ue();
  return ls = (r, n, i) => t(n, r, i), ls;
}
var ds, ko;
function Vh() {
  if (ko) return ds;
  ko = 1;
  const t = Ue();
  return ds = (r, n) => t(r, n, !0), ds;
}
var hs, Ao;
function gi() {
  if (Ao) return hs;
  Ao = 1;
  const t = Re();
  return hs = (r, n, i) => {
    const s = new t(r, i), a = new t(n, i);
    return s.compare(a) || s.compareBuild(a);
  }, hs;
}
var fs, Io;
function zh() {
  if (Io) return fs;
  Io = 1;
  const t = gi();
  return fs = (r, n) => r.sort((i, s) => t(i, s, n)), fs;
}
var ps, jo;
function Bh() {
  if (jo) return ps;
  jo = 1;
  const t = gi();
  return ps = (r, n) => r.sort((i, s) => t(s, i, n)), ps;
}
var ms, No;
function $n() {
  if (No) return ms;
  No = 1;
  const t = Ue();
  return ms = (r, n, i) => t(r, n, i) > 0, ms;
}
var ys, Co;
function vi() {
  if (Co) return ys;
  Co = 1;
  const t = Ue();
  return ys = (r, n, i) => t(r, n, i) < 0, ys;
}
var gs, Do;
function nu() {
  if (Do) return gs;
  Do = 1;
  const t = Ue();
  return gs = (r, n, i) => t(r, n, i) === 0, gs;
}
var vs, Lo;
function su() {
  if (Lo) return vs;
  Lo = 1;
  const t = Ue();
  return vs = (r, n, i) => t(r, n, i) !== 0, vs;
}
var _s, qo;
function _i() {
  if (qo) return _s;
  qo = 1;
  const t = Ue();
  return _s = (r, n, i) => t(r, n, i) >= 0, _s;
}
var ws, Uo;
function wi() {
  if (Uo) return ws;
  Uo = 1;
  const t = Ue();
  return ws = (r, n, i) => t(r, n, i) <= 0, ws;
}
var bs, Mo;
function iu() {
  if (Mo) return bs;
  Mo = 1;
  const t = nu(), e = su(), r = $n(), n = _i(), i = vi(), s = wi();
  return bs = (o, c, u, l) => {
    switch (c) {
      case "===":
        return typeof o == "object" && (o = o.version), typeof u == "object" && (u = u.version), o === u;
      case "!==":
        return typeof o == "object" && (o = o.version), typeof u == "object" && (u = u.version), o !== u;
      case "":
      case "=":
      case "==":
        return t(o, u, l);
      case "!=":
        return e(o, u, l);
      case ">":
        return r(o, u, l);
      case ">=":
        return n(o, u, l);
      case "<":
        return i(o, u, l);
      case "<=":
        return s(o, u, l);
      default:
        throw new TypeError(`Invalid operator: ${c}`);
    }
  }, bs;
}
var Es, xo;
function Kh() {
  if (xo) return Es;
  xo = 1;
  const t = Re(), e = It(), { safeRe: r, t: n } = Xt();
  return Es = (s, a) => {
    if (s instanceof t)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    a = a || {};
    let o = null;
    if (!a.rtl)
      o = s.match(a.includePrerelease ? r[n.COERCEFULL] : r[n.COERCE]);
    else {
      const h = a.includePrerelease ? r[n.COERCERTLFULL] : r[n.COERCERTL];
      let v;
      for (; (v = h.exec(s)) && (!o || o.index + o[0].length !== s.length); )
        (!o || v.index + v[0].length !== o.index + o[0].length) && (o = v), h.lastIndex = v.index + v[1].length + v[2].length;
      h.lastIndex = -1;
    }
    if (o === null)
      return null;
    const c = o[2], u = o[3] || "0", l = o[4] || "0", m = a.includePrerelease && o[5] ? `-${o[5]}` : "", d = a.includePrerelease && o[6] ? `+${o[6]}` : "";
    return e(`${c}.${u}.${l}${m}${d}`, a);
  }, Es;
}
var $s, Fo;
function Gh() {
  if (Fo) return $s;
  Fo = 1;
  class t {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const n = this.map.get(r);
      if (n !== void 0)
        return this.map.delete(r), this.map.set(r, n), n;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, n) {
      if (!this.delete(r) && n !== void 0) {
        if (this.map.size >= this.max) {
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(r, n);
      }
      return this;
    }
  }
  return $s = t, $s;
}
var Ss, Vo;
function Me() {
  if (Vo) return Ss;
  Vo = 1;
  const t = /\s+/g;
  class e {
    constructor(U, J) {
      if (J = i(J), U instanceof e)
        return U.loose === !!J.loose && U.includePrerelease === !!J.includePrerelease ? U : new e(U.raw, J);
      if (U instanceof s)
        return this.raw = U.value, this.set = [[U]], this.formatted = void 0, this;
      if (this.options = J, this.loose = !!J.loose, this.includePrerelease = !!J.includePrerelease, this.raw = U.trim().replace(t, " "), this.set = this.raw.split("||").map((F) => this.parseRange(F.trim())).filter((F) => F.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const F = this.set[0];
        if (this.set = this.set.filter((B) => !w(B[0])), this.set.length === 0)
          this.set = [F];
        else if (this.set.length > 1) {
          for (const B of this.set)
            if (B.length === 1 && p(B[0])) {
              this.set = [B];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let U = 0; U < this.set.length; U++) {
          U > 0 && (this.formatted += "||");
          const J = this.set[U];
          for (let F = 0; F < J.length; F++)
            F > 0 && (this.formatted += " "), this.formatted += J[F].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(U) {
      const F = ((this.options.includePrerelease && h) | (this.options.loose && v)) + ":" + U, B = n.get(F);
      if (B)
        return B;
      const W = this.options.loose, C = W ? c[u.HYPHENRANGELOOSE] : c[u.HYPHENRANGE];
      U = U.replace(C, z(this.options.includePrerelease)), a("hyphen replace", U), U = U.replace(c[u.COMPARATORTRIM], l), a("comparator trim", U), U = U.replace(c[u.TILDETRIM], m), a("tilde trim", U), U = U.replace(c[u.CARETTRIM], d), a("caret trim", U);
      let A = U.split(" ").map((E) => f(E, this.options)).join(" ").split(/\s+/).map((E) => q(E, this.options));
      W && (A = A.filter((E) => (a("loose invalid filter", E, this.options), !!E.match(c[u.COMPARATORLOOSE])))), a("range list", A);
      const O = /* @__PURE__ */ new Map(), R = A.map((E) => new s(E, this.options));
      for (const E of R) {
        if (w(E))
          return [E];
        O.set(E.value, E);
      }
      O.size > 1 && O.has("") && O.delete("");
      const y = [...O.values()];
      return n.set(F, y), y;
    }
    intersects(U, J) {
      if (!(U instanceof e))
        throw new TypeError("a Range is required");
      return this.set.some((F) => _(F, J) && U.set.some((B) => _(B, J) && F.every((W) => B.every((C) => W.intersects(C, J)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(U) {
      if (!U)
        return !1;
      if (typeof U == "string")
        try {
          U = new o(U, this.options);
        } catch {
          return !1;
        }
      for (let J = 0; J < this.set.length; J++)
        if (H(this.set[J], U, this.options))
          return !0;
      return !1;
    }
  }
  Ss = e;
  const r = Gh(), n = new r(), i = yi(), s = Sn(), a = En(), o = Re(), {
    safeRe: c,
    t: u,
    comparatorTrimReplace: l,
    tildeTrimReplace: m,
    caretTrimReplace: d
  } = Xt(), { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: v } = bn(), w = (D) => D.value === "<0.0.0-0", p = (D) => D.value === "", _ = (D, U) => {
    let J = !0;
    const F = D.slice();
    let B = F.pop();
    for (; J && F.length; )
      J = F.every((W) => B.intersects(W, U)), B = F.pop();
    return J;
  }, f = (D, U) => (D = D.replace(c[u.BUILD], ""), a("comp", D, U), D = $(D, U), a("caret", D), D = S(D, U), a("tildes", D), D = I(D, U), a("xrange", D), D = G(D, U), a("stars", D), D), g = (D) => !D || D.toLowerCase() === "x" || D === "*", S = (D, U) => D.trim().split(/\s+/).map((J) => b(J, U)).join(" "), b = (D, U) => {
    const J = U.loose ? c[u.TILDELOOSE] : c[u.TILDE];
    return D.replace(J, (F, B, W, C, A) => {
      a("tilde", D, F, B, W, C, A);
      let O;
      return g(B) ? O = "" : g(W) ? O = `>=${B}.0.0 <${+B + 1}.0.0-0` : g(C) ? O = `>=${B}.${W}.0 <${B}.${+W + 1}.0-0` : A ? (a("replaceTilde pr", A), O = `>=${B}.${W}.${C}-${A} <${B}.${+W + 1}.0-0`) : O = `>=${B}.${W}.${C} <${B}.${+W + 1}.0-0`, a("tilde return", O), O;
    });
  }, $ = (D, U) => D.trim().split(/\s+/).map((J) => T(J, U)).join(" "), T = (D, U) => {
    a("caret", D, U);
    const J = U.loose ? c[u.CARETLOOSE] : c[u.CARET], F = U.includePrerelease ? "-0" : "";
    return D.replace(J, (B, W, C, A, O) => {
      a("caret", D, B, W, C, A, O);
      let R;
      return g(W) ? R = "" : g(C) ? R = `>=${W}.0.0${F} <${+W + 1}.0.0-0` : g(A) ? W === "0" ? R = `>=${W}.${C}.0${F} <${W}.${+C + 1}.0-0` : R = `>=${W}.${C}.0${F} <${+W + 1}.0.0-0` : O ? (a("replaceCaret pr", O), W === "0" ? C === "0" ? R = `>=${W}.${C}.${A}-${O} <${W}.${C}.${+A + 1}-0` : R = `>=${W}.${C}.${A}-${O} <${W}.${+C + 1}.0-0` : R = `>=${W}.${C}.${A}-${O} <${+W + 1}.0.0-0`) : (a("no pr"), W === "0" ? C === "0" ? R = `>=${W}.${C}.${A}${F} <${W}.${C}.${+A + 1}-0` : R = `>=${W}.${C}.${A}${F} <${W}.${+C + 1}.0-0` : R = `>=${W}.${C}.${A} <${+W + 1}.0.0-0`), a("caret return", R), R;
    });
  }, I = (D, U) => (a("replaceXRanges", D, U), D.split(/\s+/).map((J) => x(J, U)).join(" ")), x = (D, U) => {
    D = D.trim();
    const J = U.loose ? c[u.XRANGELOOSE] : c[u.XRANGE];
    return D.replace(J, (F, B, W, C, A, O) => {
      a("xRange", D, F, B, W, C, A, O);
      const R = g(W), y = R || g(C), E = y || g(A), k = E;
      return B === "=" && k && (B = ""), O = U.includePrerelease ? "-0" : "", R ? B === ">" || B === "<" ? F = "<0.0.0-0" : F = "*" : B && k ? (y && (C = 0), A = 0, B === ">" ? (B = ">=", y ? (W = +W + 1, C = 0, A = 0) : (C = +C + 1, A = 0)) : B === "<=" && (B = "<", y ? W = +W + 1 : C = +C + 1), B === "<" && (O = "-0"), F = `${B + W}.${C}.${A}${O}`) : y ? F = `>=${W}.0.0${O} <${+W + 1}.0.0-0` : E && (F = `>=${W}.${C}.0${O} <${W}.${+C + 1}.0-0`), a("xRange return", F), F;
    });
  }, G = (D, U) => (a("replaceStars", D, U), D.trim().replace(c[u.STAR], "")), q = (D, U) => (a("replaceGTE0", D, U), D.trim().replace(c[U.includePrerelease ? u.GTE0PRE : u.GTE0], "")), z = (D) => (U, J, F, B, W, C, A, O, R, y, E, k) => (g(F) ? J = "" : g(B) ? J = `>=${F}.0.0${D ? "-0" : ""}` : g(W) ? J = `>=${F}.${B}.0${D ? "-0" : ""}` : C ? J = `>=${J}` : J = `>=${J}${D ? "-0" : ""}`, g(R) ? O = "" : g(y) ? O = `<${+R + 1}.0.0-0` : g(E) ? O = `<${R}.${+y + 1}.0-0` : k ? O = `<=${R}.${y}.${E}-${k}` : D ? O = `<${R}.${y}.${+E + 1}-0` : O = `<=${O}`, `${J} ${O}`.trim()), H = (D, U, J) => {
    for (let F = 0; F < D.length; F++)
      if (!D[F].test(U))
        return !1;
    if (U.prerelease.length && !J.includePrerelease) {
      for (let F = 0; F < D.length; F++)
        if (a(D[F].semver), D[F].semver !== s.ANY && D[F].semver.prerelease.length > 0) {
          const B = D[F].semver;
          if (B.major === U.major && B.minor === U.minor && B.patch === U.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Ss;
}
var Rs, zo;
function Sn() {
  if (zo) return Rs;
  zo = 1;
  const t = /* @__PURE__ */ Symbol("SemVer ANY");
  class e {
    static get ANY() {
      return t;
    }
    constructor(l, m) {
      if (m = r(m), l instanceof e) {
        if (l.loose === !!m.loose)
          return l;
        l = l.value;
      }
      l = l.trim().split(/\s+/).join(" "), a("comparator", l, m), this.options = m, this.loose = !!m.loose, this.parse(l), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(l) {
      const m = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], d = l.match(m);
      if (!d)
        throw new TypeError(`Invalid comparator: ${l}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new o(d[2], this.options.loose) : this.semver = t;
    }
    toString() {
      return this.value;
    }
    test(l) {
      if (a("Comparator.test", l, this.options.loose), this.semver === t || l === t)
        return !0;
      if (typeof l == "string")
        try {
          l = new o(l, this.options);
        } catch {
          return !1;
        }
      return s(l, this.operator, this.semver, this.options);
    }
    intersects(l, m) {
      if (!(l instanceof e))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(l.value, m).test(this.value) : l.operator === "" ? l.value === "" ? !0 : new c(this.value, m).test(l.semver) : (m = r(m), m.includePrerelease && (this.value === "<0.0.0-0" || l.value === "<0.0.0-0") || !m.includePrerelease && (this.value.startsWith("<0.0.0") || l.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && l.operator.startsWith(">") || this.operator.startsWith("<") && l.operator.startsWith("<") || this.semver.version === l.semver.version && this.operator.includes("=") && l.operator.includes("=") || s(this.semver, "<", l.semver, m) && this.operator.startsWith(">") && l.operator.startsWith("<") || s(this.semver, ">", l.semver, m) && this.operator.startsWith("<") && l.operator.startsWith(">")));
    }
  }
  Rs = e;
  const r = yi(), { safeRe: n, t: i } = Xt(), s = iu(), a = En(), o = Re(), c = Me();
  return Rs;
}
var Os, Bo;
function Rn() {
  if (Bo) return Os;
  Bo = 1;
  const t = Me();
  return Os = (r, n, i) => {
    try {
      n = new t(n, i);
    } catch {
      return !1;
    }
    return n.test(r);
  }, Os;
}
var Ts, Ko;
function Hh() {
  if (Ko) return Ts;
  Ko = 1;
  const t = Me();
  return Ts = (r, n) => new t(r, n).set.map((i) => i.map((s) => s.value).join(" ").trim().split(" ")), Ts;
}
var Ps, Go;
function Wh() {
  if (Go) return Ps;
  Go = 1;
  const t = Re(), e = Me();
  return Ps = (n, i, s) => {
    let a = null, o = null, c = null;
    try {
      c = new e(i, s);
    } catch {
      return null;
    }
    return n.forEach((u) => {
      c.test(u) && (!a || o.compare(u) === -1) && (a = u, o = new t(a, s));
    }), a;
  }, Ps;
}
var ks, Ho;
function Jh() {
  if (Ho) return ks;
  Ho = 1;
  const t = Re(), e = Me();
  return ks = (n, i, s) => {
    let a = null, o = null, c = null;
    try {
      c = new e(i, s);
    } catch {
      return null;
    }
    return n.forEach((u) => {
      c.test(u) && (!a || o.compare(u) === 1) && (a = u, o = new t(a, s));
    }), a;
  }, ks;
}
var As, Wo;
function Xh() {
  if (Wo) return As;
  Wo = 1;
  const t = Re(), e = Me(), r = $n();
  return As = (i, s) => {
    i = new e(i, s);
    let a = new t("0.0.0");
    if (i.test(a) || (a = new t("0.0.0-0"), i.test(a)))
      return a;
    a = null;
    for (let o = 0; o < i.set.length; ++o) {
      const c = i.set[o];
      let u = null;
      c.forEach((l) => {
        const m = new t(l.semver.version);
        switch (l.operator) {
          case ">":
            m.prerelease.length === 0 ? m.patch++ : m.prerelease.push(0), m.raw = m.format();
          /* fallthrough */
          case "":
          case ">=":
            (!u || r(m, u)) && (u = m);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${l.operator}`);
        }
      }), u && (!a || r(a, u)) && (a = u);
    }
    return a && i.test(a) ? a : null;
  }, As;
}
var Is, Jo;
function Yh() {
  if (Jo) return Is;
  Jo = 1;
  const t = Me();
  return Is = (r, n) => {
    try {
      return new t(r, n).range || "*";
    } catch {
      return null;
    }
  }, Is;
}
var js, Xo;
function bi() {
  if (Xo) return js;
  Xo = 1;
  const t = Re(), e = Sn(), { ANY: r } = e, n = Me(), i = Rn(), s = $n(), a = vi(), o = wi(), c = _i();
  return js = (l, m, d, h) => {
    l = new t(l, h), m = new n(m, h);
    let v, w, p, _, f;
    switch (d) {
      case ">":
        v = s, w = o, p = a, _ = ">", f = ">=";
        break;
      case "<":
        v = a, w = c, p = s, _ = "<", f = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (i(l, m, h))
      return !1;
    for (let g = 0; g < m.set.length; ++g) {
      const S = m.set[g];
      let b = null, $ = null;
      if (S.forEach((T) => {
        T.semver === r && (T = new e(">=0.0.0")), b = b || T, $ = $ || T, v(T.semver, b.semver, h) ? b = T : p(T.semver, $.semver, h) && ($ = T);
      }), b.operator === _ || b.operator === f || (!$.operator || $.operator === _) && w(l, $.semver))
        return !1;
      if ($.operator === f && p(l, $.semver))
        return !1;
    }
    return !0;
  }, js;
}
var Ns, Yo;
function Qh() {
  if (Yo) return Ns;
  Yo = 1;
  const t = bi();
  return Ns = (r, n, i) => t(r, n, ">", i), Ns;
}
var Cs, Qo;
function Zh() {
  if (Qo) return Cs;
  Qo = 1;
  const t = bi();
  return Cs = (r, n, i) => t(r, n, "<", i), Cs;
}
var Ds, Zo;
function ef() {
  if (Zo) return Ds;
  Zo = 1;
  const t = Me();
  return Ds = (r, n, i) => (r = new t(r, i), n = new t(n, i), r.intersects(n, i)), Ds;
}
var Ls, ec;
function tf() {
  if (ec) return Ls;
  ec = 1;
  const t = Rn(), e = Ue();
  return Ls = (r, n, i) => {
    const s = [];
    let a = null, o = null;
    const c = r.sort((d, h) => e(d, h, i));
    for (const d of c)
      t(d, n, i) ? (o = d, a || (a = d)) : (o && s.push([a, o]), o = null, a = null);
    a && s.push([a, null]);
    const u = [];
    for (const [d, h] of s)
      d === h ? u.push(d) : !h && d === c[0] ? u.push("*") : h ? d === c[0] ? u.push(`<=${h}`) : u.push(`${d} - ${h}`) : u.push(`>=${d}`);
    const l = u.join(" || "), m = typeof n.raw == "string" ? n.raw : String(n);
    return l.length < m.length ? l : n;
  }, Ls;
}
var qs, tc;
function rf() {
  if (tc) return qs;
  tc = 1;
  const t = Me(), e = Sn(), { ANY: r } = e, n = Rn(), i = Ue(), s = (m, d, h = {}) => {
    if (m === d)
      return !0;
    m = new t(m, h), d = new t(d, h);
    let v = !1;
    e: for (const w of m.set) {
      for (const p of d.set) {
        const _ = c(w, p, h);
        if (v = v || _ !== null, _)
          continue e;
      }
      if (v)
        return !1;
    }
    return !0;
  }, a = [new e(">=0.0.0-0")], o = [new e(">=0.0.0")], c = (m, d, h) => {
    if (m === d)
      return !0;
    if (m.length === 1 && m[0].semver === r) {
      if (d.length === 1 && d[0].semver === r)
        return !0;
      h.includePrerelease ? m = a : m = o;
    }
    if (d.length === 1 && d[0].semver === r) {
      if (h.includePrerelease)
        return !0;
      d = o;
    }
    const v = /* @__PURE__ */ new Set();
    let w, p;
    for (const I of m)
      I.operator === ">" || I.operator === ">=" ? w = u(w, I, h) : I.operator === "<" || I.operator === "<=" ? p = l(p, I, h) : v.add(I.semver);
    if (v.size > 1)
      return null;
    let _;
    if (w && p) {
      if (_ = i(w.semver, p.semver, h), _ > 0)
        return null;
      if (_ === 0 && (w.operator !== ">=" || p.operator !== "<="))
        return null;
    }
    for (const I of v) {
      if (w && !n(I, String(w), h) || p && !n(I, String(p), h))
        return null;
      for (const x of d)
        if (!n(I, String(x), h))
          return !1;
      return !0;
    }
    let f, g, S, b, $ = p && !h.includePrerelease && p.semver.prerelease.length ? p.semver : !1, T = w && !h.includePrerelease && w.semver.prerelease.length ? w.semver : !1;
    $ && $.prerelease.length === 1 && p.operator === "<" && $.prerelease[0] === 0 && ($ = !1);
    for (const I of d) {
      if (b = b || I.operator === ">" || I.operator === ">=", S = S || I.operator === "<" || I.operator === "<=", w) {
        if (T && I.semver.prerelease && I.semver.prerelease.length && I.semver.major === T.major && I.semver.minor === T.minor && I.semver.patch === T.patch && (T = !1), I.operator === ">" || I.operator === ">=") {
          if (f = u(w, I, h), f === I && f !== w)
            return !1;
        } else if (w.operator === ">=" && !n(w.semver, String(I), h))
          return !1;
      }
      if (p) {
        if ($ && I.semver.prerelease && I.semver.prerelease.length && I.semver.major === $.major && I.semver.minor === $.minor && I.semver.patch === $.patch && ($ = !1), I.operator === "<" || I.operator === "<=") {
          if (g = l(p, I, h), g === I && g !== p)
            return !1;
        } else if (p.operator === "<=" && !n(p.semver, String(I), h))
          return !1;
      }
      if (!I.operator && (p || w) && _ !== 0)
        return !1;
    }
    return !(w && S && !p && _ !== 0 || p && b && !w && _ !== 0 || T || $);
  }, u = (m, d, h) => {
    if (!m)
      return d;
    const v = i(m.semver, d.semver, h);
    return v > 0 ? m : v < 0 || d.operator === ">" && m.operator === ">=" ? d : m;
  }, l = (m, d, h) => {
    if (!m)
      return d;
    const v = i(m.semver, d.semver, h);
    return v < 0 ? m : v > 0 || d.operator === "<" && m.operator === "<=" ? d : m;
  };
  return qs = s, qs;
}
var Us, rc;
function nf() {
  if (rc) return Us;
  rc = 1;
  const t = Xt(), e = bn(), r = Re(), n = ru(), i = It(), s = Nh(), a = Ch(), o = Dh(), c = Lh(), u = qh(), l = Uh(), m = Mh(), d = xh(), h = Ue(), v = Fh(), w = Vh(), p = gi(), _ = zh(), f = Bh(), g = $n(), S = vi(), b = nu(), $ = su(), T = _i(), I = wi(), x = iu(), G = Kh(), q = Sn(), z = Me(), H = Rn(), D = Hh(), U = Wh(), J = Jh(), F = Xh(), B = Yh(), W = bi(), C = Qh(), A = Zh(), O = ef(), R = tf(), y = rf();
  return Us = {
    parse: i,
    valid: s,
    clean: a,
    inc: o,
    diff: c,
    major: u,
    minor: l,
    patch: m,
    prerelease: d,
    compare: h,
    rcompare: v,
    compareLoose: w,
    compareBuild: p,
    sort: _,
    rsort: f,
    gt: g,
    lt: S,
    eq: b,
    neq: $,
    gte: T,
    lte: I,
    cmp: x,
    coerce: G,
    Comparator: q,
    Range: z,
    satisfies: H,
    toComparators: D,
    maxSatisfying: U,
    minSatisfying: J,
    minVersion: F,
    validRange: B,
    outside: W,
    gtr: C,
    ltr: A,
    intersects: O,
    simplifyRange: R,
    subset: y,
    SemVer: r,
    re: t.re,
    src: t.src,
    tokens: t.t,
    SEMVER_SPEC_VERSION: e.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: e.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, Us;
}
var sf = nf();
const gt = /* @__PURE__ */ hi(sf), af = Object.prototype.toString, of = "[object Uint8Array]", cf = "[object ArrayBuffer]";
function au(t, e, r) {
  return t ? t.constructor === e ? !0 : af.call(t) === r : !1;
}
function ou(t) {
  return au(t, Uint8Array, of);
}
function uf(t) {
  return au(t, ArrayBuffer, cf);
}
function lf(t) {
  return ou(t) || uf(t);
}
function df(t) {
  if (!ou(t))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof t}\``);
}
function hf(t) {
  if (!lf(t))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof t}\``);
}
function Ms(t, e) {
  if (t.length === 0)
    return new Uint8Array(0);
  e ??= t.reduce((i, s) => i + s.length, 0);
  const r = new Uint8Array(e);
  let n = 0;
  for (const i of t)
    df(i), r.set(i, n), n += i.length;
  return r;
}
const nc = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Zr(t, e = "utf8") {
  return hf(t), nc[e] ??= new globalThis.TextDecoder(e), nc[e].decode(t);
}
function ff(t) {
  if (typeof t != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof t}\``);
}
const pf = new globalThis.TextEncoder();
function en(t) {
  return ff(t), pf.encode(t);
}
Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
const xs = "aes-256-cbc", Xe = () => /* @__PURE__ */ Object.create(null), sc = (t) => t !== void 0, Fs = (t, e) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof e;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${t}\` is not allowed as it's not supported by JSON`);
}, Ye = "__internal__", Vs = `${Ye}.migrations.version`;
class mf {
  path;
  events;
  #s;
  #r;
  #e;
  #t = {};
  #i = !1;
  #a;
  #o;
  #n;
  constructor(e = {}) {
    const r = this.#c(e);
    this.#e = r, this.#u(r), this.#d(r), this.#h(r), this.events = new EventTarget(), this.#r = r.encryptionKey, this.path = this.#f(r), this.#p(r), r.watch && this._watch();
  }
  get(e, r) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(e, r);
    const { store: n } = this;
    return e in n ? n[e] : r;
  }
  set(e, r) {
    if (typeof e != "string" && typeof e != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof e}`);
    if (typeof e != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(e))
      throw new TypeError(`Please don't use the ${Ye} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, i = (s, a) => {
      if (Fs(s, a), this.#e.accessPropertiesByDotNotation)
        Qt(n, s, a);
      else {
        if (s === "__proto__" || s === "constructor" || s === "prototype")
          return;
        n[s] = a;
      }
    };
    if (typeof e == "object") {
      const s = e;
      for (const [a, o] of Object.entries(s))
        i(a, o);
    } else
      i(e, r);
    this.store = n;
  }
  has(e) {
    return this.#e.accessPropertiesByDotNotation ? Dn(this.store, e) : e in this.store;
  }
  appendToArray(e, r) {
    Fs(e, r);
    const n = this.#e.accessPropertiesByDotNotation ? this._get(e, []) : e in this.store ? this.store[e] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${e}\` is already set to a non-array value`);
    this.set(e, [...n, r]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...e) {
    for (const r of e)
      sc(this.#t[r]) && this.set(r, this.#t[r]);
  }
  delete(e) {
    const { store: r } = this;
    this.#e.accessPropertiesByDotNotation ? Au(r, e) : delete r[e], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const e = Xe();
    for (const r of Object.keys(this.#t))
      sc(this.#t[r]) && (Fs(r, this.#t[r]), this.#e.accessPropertiesByDotNotation ? Qt(e, r, this.#t[r]) : e[r] = this.#t[r]);
    this.store = e;
  }
  onDidChange(e, r) {
    if (typeof e != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof e}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleValueChange(() => this.get(e), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(e) {
    if (typeof e != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof e}`);
    return this._handleStoreChange(e);
  }
  get size() {
    return Object.keys(this.store).filter((r) => !this._isReservedKeyPath(r)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const e = ne.readFileSync(this.path, this.#r ? null : "utf8"), r = this._decryptData(e), n = this._deserialize(r);
      return this.#i || this._validate(n), Object.assign(Xe(), n);
    } catch (e) {
      if (e?.code === "ENOENT")
        return this._ensureDirectory(), Xe();
      if (this.#e.clearInvalidConfig) {
        const r = e;
        if (r.name === "SyntaxError" || r.message?.startsWith("Config schema violation:"))
          return Xe();
      }
      throw e;
    }
  }
  set store(e) {
    if (this._ensureDirectory(), !Dn(e, Ye))
      try {
        const r = ne.readFileSync(this.path, this.#r ? null : "utf8"), n = this._decryptData(r), i = this._deserialize(n);
        Dn(i, Ye) && Qt(e, Ye, Pi(i, Ye));
      } catch {
      }
    this.#i || this._validate(e), this._write(e), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [e, r] of Object.entries(this.store))
      this._isReservedKeyPath(e) || (yield [e, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    this.#a && (this.#a.close(), this.#a = void 0), this.#o && (ne.unwatchFile(this.path), this.#o = !1), this.#n = void 0;
  }
  _decryptData(e) {
    if (!this.#r)
      return typeof e == "string" ? e : Zr(e);
    try {
      const r = e.slice(0, 16), n = tt.pbkdf2Sync(this.#r, r, 1e4, 32, "sha512"), i = tt.createDecipheriv(xs, n, r), s = e.slice(17), a = typeof s == "string" ? en(s) : s;
      return Zr(Ms([i.update(a), i.final()]));
    } catch {
      try {
        const r = e.slice(0, 16), n = tt.pbkdf2Sync(this.#r, r.toString(), 1e4, 32, "sha512"), i = tt.createDecipheriv(xs, n, r), s = e.slice(17), a = typeof s == "string" ? en(s) : s;
        return Zr(Ms([i.update(a), i.final()]));
      } catch {
      }
    }
    return typeof e == "string" ? e : Zr(e);
  }
  _handleStoreChange(e) {
    let r = this.store;
    const n = () => {
      const i = r, s = this.store;
      Oi(s, i) || (r = s, e.call(this, s, i));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(e, r) {
    let n = e();
    const i = () => {
      const s = n, a = e();
      Oi(a, s) || (n = a, r.call(this, a, s));
    };
    return this.events.addEventListener("change", i), () => {
      this.events.removeEventListener("change", i);
    };
  }
  _deserialize = (e) => JSON.parse(e);
  _serialize = (e) => JSON.stringify(e, void 0, "	");
  _validate(e) {
    if (!this.#s || this.#s(e) || !this.#s.errors)
      return;
    const n = this.#s.errors.map(({ instancePath: i, message: s = "" }) => `\`${i.slice(1)}\` ${s}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    ne.mkdirSync(ae.dirname(this.path), { recursive: !0 });
  }
  _write(e) {
    let r = this._serialize(e);
    if (this.#r) {
      const n = tt.randomBytes(16), i = tt.pbkdf2Sync(this.#r, n, 1e4, 32, "sha512"), s = tt.createCipheriv(xs, i, n);
      r = Ms([n, en(":"), s.update(en(r)), s.final()]);
    }
    if (le.env.SNAP)
      ne.writeFileSync(this.path, r, { mode: this.#e.configFileMode });
    else
      try {
        Mc(this.path, r, { mode: this.#e.configFileMode });
      } catch (n) {
        if (n?.code === "EXDEV") {
          ne.writeFileSync(this.path, r, { mode: this.#e.configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    if (this._ensureDirectory(), ne.existsSync(this.path) || this._write(Xe()), le.platform === "win32" || le.platform === "darwin") {
      this.#n ??= lo(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 });
      const e = ae.dirname(this.path), r = ae.basename(this.path);
      this.#a = ne.watch(e, { persistent: !1, encoding: "utf8" }, (n, i) => {
        i && i !== r || typeof this.#n == "function" && this.#n();
      });
    } else
      this.#n ??= lo(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 }), ne.watchFile(this.path, { persistent: !1 }, (e, r) => {
        typeof this.#n == "function" && this.#n();
      }), this.#o = !0;
  }
  _migrate(e, r, n) {
    let i = this._get(Vs, "0.0.0");
    const s = Object.keys(e).filter((o) => this._shouldPerformMigration(o, i, r));
    let a = structuredClone(this.store);
    for (const o of s)
      try {
        n && n(this, {
          fromVersion: i,
          toVersion: o,
          finalVersion: r,
          versions: s
        });
        const c = e[o];
        c?.(this), this._set(Vs, o), i = o, a = structuredClone(this.store);
      } catch (c) {
        this.store = a;
        try {
          this._write(a);
        } catch {
        }
        const u = c instanceof Error ? c.message : String(c);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(i) || !gt.eq(i, r)) && this._set(Vs, r);
  }
  _containsReservedKey(e) {
    return typeof e == "string" ? this._isReservedKeyPath(e) : !e || typeof e != "object" ? !1 : this._objectContainsReservedKey(e);
  }
  _objectContainsReservedKey(e) {
    if (!e || typeof e != "object")
      return !1;
    for (const [r, n] of Object.entries(e))
      if (this._isReservedKeyPath(r) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(e) {
    return e === Ye || e.startsWith(`${Ye}.`);
  }
  _isVersionInRangeFormat(e) {
    return gt.clean(e) === null;
  }
  _shouldPerformMigration(e, r, n) {
    return this._isVersionInRangeFormat(e) ? r !== "0.0.0" && gt.satisfies(r, e) ? !1 : gt.satisfies(n, e) : !(gt.lte(e, r) || gt.gt(e, n));
  }
  _get(e, r) {
    return Pi(this.store, e, r);
  }
  _set(e, r) {
    const { store: n } = this;
    Qt(n, e, r), this.store = n;
  }
  #c(e) {
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...e
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Cu(r.projectName, { suffix: r.projectSuffix }).config;
    }
    return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
  }
  #u(e) {
    if (!(e.schema ?? e.ajvOptions ?? e.rootSchema))
      return;
    if (e.schema && typeof e.schema != "object")
      throw new TypeError("The `schema` option must be an object.");
    const r = Sh.default, n = new lh.Ajv2020({
      allErrors: !0,
      useDefaults: !0,
      ...e.ajvOptions
    });
    r(n);
    const i = {
      ...e.rootSchema,
      type: "object",
      properties: e.schema
    };
    this.#s = n.compile(i), this.#l(e.schema);
  }
  #l(e) {
    const r = Object.entries(e ?? {});
    for (const [n, i] of r) {
      if (!i || typeof i != "object" || !Object.hasOwn(i, "default"))
        continue;
      const { default: s } = i;
      s !== void 0 && (this.#t[n] = s);
    }
  }
  #d(e) {
    e.defaults && Object.assign(this.#t, e.defaults);
  }
  #h(e) {
    e.serialize && (this._serialize = e.serialize), e.deserialize && (this._deserialize = e.deserialize);
  }
  #f(e) {
    const r = typeof e.fileExtension == "string" ? e.fileExtension : void 0, n = r ? `.${r}` : "";
    return ae.resolve(e.cwd, `${e.configName ?? "config"}${n}`);
  }
  #p(e) {
    if (e.migrations) {
      this.#m(e), this._validate(this.store);
      return;
    }
    const r = this.store, n = Object.assign(Xe(), e.defaults ?? {}, r);
    this._validate(n);
    try {
      Ti.deepEqual(r, n);
    } catch {
      this.store = n;
    }
  }
  #m(e) {
    const { migrations: r, projectVersion: n } = e;
    if (r) {
      if (!n)
        throw new Error("Please specify the `projectVersion` option.");
      this.#i = !0;
      try {
        const i = this.store, s = Object.assign(Xe(), e.defaults ?? {}, i);
        try {
          Ti.deepEqual(i, s);
        } catch {
          this._write(s);
        }
        this._migrate(r, n, e.beforeEachMigration);
      } finally {
        this.#i = !1;
      }
    }
  }
}
const { app: un, ipcMain: Zs, shell: yf } = Nc;
let ic = !1;
const ac = () => {
  if (!Zs || !un)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const t = {
    defaultCwd: un.getPath("userData"),
    appVersion: un.getVersion()
  };
  return ic || (Zs.on("electron-store-get-data", (e) => {
    e.returnValue = t;
  }), ic = !0), t;
};
class gf extends mf {
  constructor(e) {
    let r, n;
    if (le.type === "renderer") {
      const i = Nc.ipcRenderer.sendSync("electron-store-get-data");
      if (!i)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = i);
    } else Zs && un && ({ defaultCwd: r, appVersion: n } = ac());
    e = {
      name: "config",
      ...e
    }, e.projectVersion ||= n, e.cwd ? e.cwd = ae.isAbsolute(e.cwd) ? e.cwd : ae.join(r, e.cwd) : e.cwd = r, e.configName = e.name, delete e.name, super(e);
  }
  static initRenderer() {
    ac();
  }
  async openInEditor() {
    const e = await yf.openPath(this.path);
    if (e)
      throw new Error(e);
  }
}
var zs = { exports: {} }, oc;
function vf() {
  return oc || (oc = 1, (function(t) {
    var e, r, n, i, s, a, o, c, u, l, m, d, h, v, w, p, _, f, g, S, b, $, T, I, x, G, q, z, H, D, U, J;
    (function(F) {
      var B = typeof ji == "object" ? ji : typeof self == "object" ? self : typeof this == "object" ? this : {};
      F(W(B, W(t.exports)));
      function W(C, A) {
        return C !== B && (typeof Object.create == "function" ? Object.defineProperty(C, "__esModule", { value: !0 }) : C.__esModule = !0), function(O, R) {
          return C[O] = A ? A(O, R) : R;
        };
      }
    })(function(F) {
      var B = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(O, R) {
        O.__proto__ = R;
      } || function(O, R) {
        for (var y in R) Object.prototype.hasOwnProperty.call(R, y) && (O[y] = R[y]);
      };
      e = function(O, R) {
        if (typeof R != "function" && R !== null)
          throw new TypeError("Class extends value " + String(R) + " is not a constructor or null");
        B(O, R);
        function y() {
          this.constructor = O;
        }
        O.prototype = R === null ? Object.create(R) : (y.prototype = R.prototype, new y());
      }, r = Object.assign || function(O) {
        for (var R, y = 1, E = arguments.length; y < E; y++) {
          R = arguments[y];
          for (var k in R) Object.prototype.hasOwnProperty.call(R, k) && (O[k] = R[k]);
        }
        return O;
      }, n = function(O, R) {
        var y = {};
        for (var E in O) Object.prototype.hasOwnProperty.call(O, E) && R.indexOf(E) < 0 && (y[E] = O[E]);
        if (O != null && typeof Object.getOwnPropertySymbols == "function")
          for (var k = 0, E = Object.getOwnPropertySymbols(O); k < E.length; k++)
            R.indexOf(E[k]) < 0 && Object.prototype.propertyIsEnumerable.call(O, E[k]) && (y[E[k]] = O[E[k]]);
        return y;
      }, i = function(O, R, y, E) {
        var k = arguments.length, N = k < 3 ? R : E === null ? E = Object.getOwnPropertyDescriptor(R, y) : E, M;
        if (typeof Reflect == "object" && typeof Reflect.decorate == "function") N = Reflect.decorate(O, R, y, E);
        else for (var X = O.length - 1; X >= 0; X--) (M = O[X]) && (N = (k < 3 ? M(N) : k > 3 ? M(R, y, N) : M(R, y)) || N);
        return k > 3 && N && Object.defineProperty(R, y, N), N;
      }, s = function(O, R) {
        return function(y, E) {
          R(y, E, O);
        };
      }, a = function(O, R, y, E, k, N) {
        function M(de) {
          if (de !== void 0 && typeof de != "function") throw new TypeError("Function expected");
          return de;
        }
        for (var X = E.kind, Z = X === "getter" ? "get" : X === "setter" ? "set" : "value", P = !R && O ? E.static ? O : O.prototype : null, j = R || (P ? Object.getOwnPropertyDescriptor(P, E.name) : {}), L, V = !1, K = y.length - 1; K >= 0; K--) {
          var Q = {};
          for (var oe in E) Q[oe] = oe === "access" ? {} : E[oe];
          for (var oe in E.access) Q.access[oe] = E.access[oe];
          Q.addInitializer = function(de) {
            if (V) throw new TypeError("Cannot add initializers after decoration has completed");
            N.push(M(de || null));
          };
          var fe = (0, y[K])(X === "accessor" ? { get: j.get, set: j.set } : j[Z], Q);
          if (X === "accessor") {
            if (fe === void 0) continue;
            if (fe === null || typeof fe != "object") throw new TypeError("Object expected");
            (L = M(fe.get)) && (j.get = L), (L = M(fe.set)) && (j.set = L), (L = M(fe.init)) && k.unshift(L);
          } else (L = M(fe)) && (X === "field" ? k.unshift(L) : j[Z] = L);
        }
        P && Object.defineProperty(P, E.name, j), V = !0;
      }, o = function(O, R, y) {
        for (var E = arguments.length > 2, k = 0; k < R.length; k++)
          y = E ? R[k].call(O, y) : R[k].call(O);
        return E ? y : void 0;
      }, c = function(O) {
        return typeof O == "symbol" ? O : "".concat(O);
      }, u = function(O, R, y) {
        return typeof R == "symbol" && (R = R.description ? "[".concat(R.description, "]") : ""), Object.defineProperty(O, "name", { configurable: !0, value: y ? "".concat(y, " ", R) : R });
      }, l = function(O, R) {
        if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(O, R);
      }, m = function(O, R, y, E) {
        function k(N) {
          return N instanceof y ? N : new y(function(M) {
            M(N);
          });
        }
        return new (y || (y = Promise))(function(N, M) {
          function X(j) {
            try {
              P(E.next(j));
            } catch (L) {
              M(L);
            }
          }
          function Z(j) {
            try {
              P(E.throw(j));
            } catch (L) {
              M(L);
            }
          }
          function P(j) {
            j.done ? N(j.value) : k(j.value).then(X, Z);
          }
          P((E = E.apply(O, R || [])).next());
        });
      }, d = function(O, R) {
        var y = { label: 0, sent: function() {
          if (N[0] & 1) throw N[1];
          return N[1];
        }, trys: [], ops: [] }, E, k, N, M = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
        return M.next = X(0), M.throw = X(1), M.return = X(2), typeof Symbol == "function" && (M[Symbol.iterator] = function() {
          return this;
        }), M;
        function X(P) {
          return function(j) {
            return Z([P, j]);
          };
        }
        function Z(P) {
          if (E) throw new TypeError("Generator is already executing.");
          for (; M && (M = 0, P[0] && (y = 0)), y; ) try {
            if (E = 1, k && (N = P[0] & 2 ? k.return : P[0] ? k.throw || ((N = k.return) && N.call(k), 0) : k.next) && !(N = N.call(k, P[1])).done) return N;
            switch (k = 0, N && (P = [P[0] & 2, N.value]), P[0]) {
              case 0:
              case 1:
                N = P;
                break;
              case 4:
                return y.label++, { value: P[1], done: !1 };
              case 5:
                y.label++, k = P[1], P = [0];
                continue;
              case 7:
                P = y.ops.pop(), y.trys.pop();
                continue;
              default:
                if (N = y.trys, !(N = N.length > 0 && N[N.length - 1]) && (P[0] === 6 || P[0] === 2)) {
                  y = 0;
                  continue;
                }
                if (P[0] === 3 && (!N || P[1] > N[0] && P[1] < N[3])) {
                  y.label = P[1];
                  break;
                }
                if (P[0] === 6 && y.label < N[1]) {
                  y.label = N[1], N = P;
                  break;
                }
                if (N && y.label < N[2]) {
                  y.label = N[2], y.ops.push(P);
                  break;
                }
                N[2] && y.ops.pop(), y.trys.pop();
                continue;
            }
            P = R.call(O, y);
          } catch (j) {
            P = [6, j], k = 0;
          } finally {
            E = N = 0;
          }
          if (P[0] & 5) throw P[1];
          return { value: P[0] ? P[1] : void 0, done: !0 };
        }
      }, h = function(O, R) {
        for (var y in O) y !== "default" && !Object.prototype.hasOwnProperty.call(R, y) && H(R, O, y);
      }, H = Object.create ? (function(O, R, y, E) {
        E === void 0 && (E = y);
        var k = Object.getOwnPropertyDescriptor(R, y);
        (!k || ("get" in k ? !R.__esModule : k.writable || k.configurable)) && (k = { enumerable: !0, get: function() {
          return R[y];
        } }), Object.defineProperty(O, E, k);
      }) : (function(O, R, y, E) {
        E === void 0 && (E = y), O[E] = R[y];
      }), v = function(O) {
        var R = typeof Symbol == "function" && Symbol.iterator, y = R && O[R], E = 0;
        if (y) return y.call(O);
        if (O && typeof O.length == "number") return {
          next: function() {
            return O && E >= O.length && (O = void 0), { value: O && O[E++], done: !O };
          }
        };
        throw new TypeError(R ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }, w = function(O, R) {
        var y = typeof Symbol == "function" && O[Symbol.iterator];
        if (!y) return O;
        var E = y.call(O), k, N = [], M;
        try {
          for (; (R === void 0 || R-- > 0) && !(k = E.next()).done; ) N.push(k.value);
        } catch (X) {
          M = { error: X };
        } finally {
          try {
            k && !k.done && (y = E.return) && y.call(E);
          } finally {
            if (M) throw M.error;
          }
        }
        return N;
      }, p = function() {
        for (var O = [], R = 0; R < arguments.length; R++)
          O = O.concat(w(arguments[R]));
        return O;
      }, _ = function() {
        for (var O = 0, R = 0, y = arguments.length; R < y; R++) O += arguments[R].length;
        for (var E = Array(O), k = 0, R = 0; R < y; R++)
          for (var N = arguments[R], M = 0, X = N.length; M < X; M++, k++)
            E[k] = N[M];
        return E;
      }, f = function(O, R, y) {
        if (y || arguments.length === 2) for (var E = 0, k = R.length, N; E < k; E++)
          (N || !(E in R)) && (N || (N = Array.prototype.slice.call(R, 0, E)), N[E] = R[E]);
        return O.concat(N || Array.prototype.slice.call(R));
      }, g = function(O) {
        return this instanceof g ? (this.v = O, this) : new g(O);
      }, S = function(O, R, y) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var E = y.apply(O, R || []), k, N = [];
        return k = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), X("next"), X("throw"), X("return", M), k[Symbol.asyncIterator] = function() {
          return this;
        }, k;
        function M(K) {
          return function(Q) {
            return Promise.resolve(Q).then(K, L);
          };
        }
        function X(K, Q) {
          E[K] && (k[K] = function(oe) {
            return new Promise(function(fe, de) {
              N.push([K, oe, fe, de]) > 1 || Z(K, oe);
            });
          }, Q && (k[K] = Q(k[K])));
        }
        function Z(K, Q) {
          try {
            P(E[K](Q));
          } catch (oe) {
            V(N[0][3], oe);
          }
        }
        function P(K) {
          K.value instanceof g ? Promise.resolve(K.value.v).then(j, L) : V(N[0][2], K);
        }
        function j(K) {
          Z("next", K);
        }
        function L(K) {
          Z("throw", K);
        }
        function V(K, Q) {
          K(Q), N.shift(), N.length && Z(N[0][0], N[0][1]);
        }
      }, b = function(O) {
        var R, y;
        return R = {}, E("next"), E("throw", function(k) {
          throw k;
        }), E("return"), R[Symbol.iterator] = function() {
          return this;
        }, R;
        function E(k, N) {
          R[k] = O[k] ? function(M) {
            return (y = !y) ? { value: g(O[k](M)), done: !1 } : N ? N(M) : M;
          } : N;
        }
      }, $ = function(O) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var R = O[Symbol.asyncIterator], y;
        return R ? R.call(O) : (O = typeof v == "function" ? v(O) : O[Symbol.iterator](), y = {}, E("next"), E("throw"), E("return"), y[Symbol.asyncIterator] = function() {
          return this;
        }, y);
        function E(N) {
          y[N] = O[N] && function(M) {
            return new Promise(function(X, Z) {
              M = O[N](M), k(X, Z, M.done, M.value);
            });
          };
        }
        function k(N, M, X, Z) {
          Promise.resolve(Z).then(function(P) {
            N({ value: P, done: X });
          }, M);
        }
      }, T = function(O, R) {
        return Object.defineProperty ? Object.defineProperty(O, "raw", { value: R }) : O.raw = R, O;
      };
      var W = Object.create ? (function(O, R) {
        Object.defineProperty(O, "default", { enumerable: !0, value: R });
      }) : function(O, R) {
        O.default = R;
      }, C = function(O) {
        return C = Object.getOwnPropertyNames || function(R) {
          var y = [];
          for (var E in R) Object.prototype.hasOwnProperty.call(R, E) && (y[y.length] = E);
          return y;
        }, C(O);
      };
      I = function(O) {
        if (O && O.__esModule) return O;
        var R = {};
        if (O != null) for (var y = C(O), E = 0; E < y.length; E++) y[E] !== "default" && H(R, O, y[E]);
        return W(R, O), R;
      }, x = function(O) {
        return O && O.__esModule ? O : { default: O };
      }, G = function(O, R, y, E) {
        if (y === "a" && !E) throw new TypeError("Private accessor was defined without a getter");
        if (typeof R == "function" ? O !== R || !E : !R.has(O)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return y === "m" ? E : y === "a" ? E.call(O) : E ? E.value : R.get(O);
      }, q = function(O, R, y, E, k) {
        if (E === "m") throw new TypeError("Private method is not writable");
        if (E === "a" && !k) throw new TypeError("Private accessor was defined without a setter");
        if (typeof R == "function" ? O !== R || !k : !R.has(O)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return E === "a" ? k.call(O, y) : k ? k.value = y : R.set(O, y), y;
      }, z = function(O, R) {
        if (R === null || typeof R != "object" && typeof R != "function") throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof O == "function" ? R === O : O.has(R);
      }, D = function(O, R, y) {
        if (R != null) {
          if (typeof R != "object" && typeof R != "function") throw new TypeError("Object expected.");
          var E, k;
          if (y) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            E = R[Symbol.asyncDispose];
          }
          if (E === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            E = R[Symbol.dispose], y && (k = E);
          }
          if (typeof E != "function") throw new TypeError("Object not disposable.");
          k && (E = function() {
            try {
              k.call(this);
            } catch (N) {
              return Promise.reject(N);
            }
          }), O.stack.push({ value: R, dispose: E, async: y });
        } else y && O.stack.push({ async: !0 });
        return R;
      };
      var A = typeof SuppressedError == "function" ? SuppressedError : function(O, R, y) {
        var E = new Error(y);
        return E.name = "SuppressedError", E.error = O, E.suppressed = R, E;
      };
      U = function(O) {
        function R(N) {
          O.error = O.hasError ? new A(N, O.error, "An error was suppressed during disposal.") : N, O.hasError = !0;
        }
        var y, E = 0;
        function k() {
          for (; y = O.stack.pop(); )
            try {
              if (!y.async && E === 1) return E = 0, O.stack.push(y), Promise.resolve().then(k);
              if (y.dispose) {
                var N = y.dispose.call(y.value);
                if (y.async) return E |= 2, Promise.resolve(N).then(k, function(M) {
                  return R(M), k();
                });
              } else E |= 1;
            } catch (M) {
              R(M);
            }
          if (E === 1) return O.hasError ? Promise.reject(O.error) : Promise.resolve();
          if (O.hasError) throw O.error;
        }
        return k();
      }, J = function(O, R) {
        return typeof O == "string" && /^\.\.?\//.test(O) ? O.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(y, E, k, N, M) {
          return E ? R ? ".jsx" : ".js" : k && (!N || !M) ? y : k + N + "." + M.toLowerCase() + "js";
        }) : O;
      }, F("__extends", e), F("__assign", r), F("__rest", n), F("__decorate", i), F("__param", s), F("__esDecorate", a), F("__runInitializers", o), F("__propKey", c), F("__setFunctionName", u), F("__metadata", l), F("__awaiter", m), F("__generator", d), F("__exportStar", h), F("__createBinding", H), F("__values", v), F("__read", w), F("__spread", p), F("__spreadArrays", _), F("__spreadArray", f), F("__await", g), F("__asyncGenerator", S), F("__asyncDelegator", b), F("__asyncValues", $), F("__makeTemplateObject", T), F("__importStar", I), F("__importDefault", x), F("__classPrivateFieldGet", G), F("__classPrivateFieldSet", q), F("__classPrivateFieldIn", z), F("__addDisposableResource", D), F("__disposeResources", U), F("__rewriteRelativeImportExtension", J);
    });
  })(zs)), zs.exports;
}
var _f = /* @__PURE__ */ vf();
const wf = /* @__PURE__ */ hi(_f), {
  __extends: ly,
  __assign: dy,
  __rest: On,
  __decorate: hy,
  __param: fy,
  __esDecorate: py,
  __runInitializers: my,
  __propKey: yy,
  __setFunctionName: gy,
  __metadata: vy,
  __awaiter: bf,
  __generator: _y,
  __exportStar: wy,
  __createBinding: by,
  __values: Ey,
  __read: $y,
  __spread: Sy,
  __spreadArrays: Ry,
  __spreadArray: Oy,
  __await: Ty,
  __asyncGenerator: Py,
  __asyncDelegator: ky,
  __asyncValues: Ay,
  __makeTemplateObject: Iy,
  __importStar: jy,
  __importDefault: Ny,
  __classPrivateFieldGet: Cy,
  __classPrivateFieldSet: Dy,
  __classPrivateFieldIn: Ly,
  __addDisposableResource: qy,
  __disposeResources: Uy,
  __rewriteRelativeImportExtension: My
} = wf, Ef = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e);
class Ei extends Error {
  constructor(e, r = "FunctionsError", n) {
    super(e), this.name = r, this.context = n;
  }
}
class $f extends Ei {
  constructor(e) {
    super("Failed to send a request to the Edge Function", "FunctionsFetchError", e);
  }
}
class cc extends Ei {
  constructor(e) {
    super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
  }
}
class uc extends Ei {
  constructor(e) {
    super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e);
  }
}
var ei;
(function(t) {
  t.Any = "any", t.ApNortheast1 = "ap-northeast-1", t.ApNortheast2 = "ap-northeast-2", t.ApSouth1 = "ap-south-1", t.ApSoutheast1 = "ap-southeast-1", t.ApSoutheast2 = "ap-southeast-2", t.CaCentral1 = "ca-central-1", t.EuCentral1 = "eu-central-1", t.EuWest1 = "eu-west-1", t.EuWest2 = "eu-west-2", t.EuWest3 = "eu-west-3", t.SaEast1 = "sa-east-1", t.UsEast1 = "us-east-1", t.UsWest1 = "us-west-1", t.UsWest2 = "us-west-2";
})(ei || (ei = {}));
class Sf {
  /**
   * Creates a new Functions client bound to an Edge Functions URL.
   *
   * @example
   * ```ts
   * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
   *
   * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
   *   headers: { apikey: 'public-anon-key' },
   *   region: FunctionRegion.UsEast1,
   * })
   * ```
   */
  constructor(e, { headers: r = {}, customFetch: n, region: i = ei.Any } = {}) {
    this.url = e, this.headers = r, this.region = i, this.fetch = Ef(n);
  }
  /**
   * Updates the authorization header
   * @param token - the new jwt token sent in the authorisation header
   * @example
   * ```ts
   * functions.setAuth(session.access_token)
   * ```
   */
  setAuth(e) {
    this.headers.Authorization = `Bearer ${e}`;
  }
  /**
   * Invokes a function
   * @param functionName - The name of the Function to invoke.
   * @param options - Options for invoking the Function.
   * @example
   * ```ts
   * const { data, error } = await functions.invoke('hello-world', {
   *   body: { name: 'Ada' },
   * })
   * ```
   */
  invoke(e) {
    return bf(this, arguments, void 0, function* (r, n = {}) {
      var i;
      let s, a;
      try {
        const { headers: o, method: c, body: u, signal: l, timeout: m } = n;
        let d = {}, { region: h } = n;
        h || (h = this.region);
        const v = new URL(`${this.url}/${r}`);
        h && h !== "any" && (d["x-region"] = h, v.searchParams.set("forceFunctionRegion", h));
        let w;
        u && (o && !Object.prototype.hasOwnProperty.call(o, "Content-Type") || !o) ? typeof Blob < "u" && u instanceof Blob || u instanceof ArrayBuffer ? (d["Content-Type"] = "application/octet-stream", w = u) : typeof u == "string" ? (d["Content-Type"] = "text/plain", w = u) : typeof FormData < "u" && u instanceof FormData ? w = u : (d["Content-Type"] = "application/json", w = JSON.stringify(u)) : u && typeof u != "string" && !(typeof Blob < "u" && u instanceof Blob) && !(u instanceof ArrayBuffer) && !(typeof FormData < "u" && u instanceof FormData) ? w = JSON.stringify(u) : w = u;
        let p = l;
        m && (a = new AbortController(), s = setTimeout(() => a.abort(), m), l ? (p = a.signal, l.addEventListener("abort", () => a.abort())) : p = a.signal);
        const _ = yield this.fetch(v.toString(), {
          method: c || "POST",
          // headers priority is (high to low):
          // 1. invoke-level headers
          // 2. client-level headers
          // 3. default Content-Type header
          headers: Object.assign(Object.assign(Object.assign({}, d), this.headers), o),
          body: w,
          signal: p
        }).catch((b) => {
          throw new $f(b);
        }), f = _.headers.get("x-relay-error");
        if (f && f === "true")
          throw new cc(_);
        if (!_.ok)
          throw new uc(_);
        let g = ((i = _.headers.get("Content-Type")) !== null && i !== void 0 ? i : "text/plain").split(";")[0].trim(), S;
        return g === "application/json" ? S = yield _.json() : g === "application/octet-stream" || g === "application/pdf" ? S = yield _.blob() : g === "text/event-stream" ? S = _ : g === "multipart/form-data" ? S = yield _.formData() : S = yield _.text(), { data: S, error: null, response: _ };
      } catch (o) {
        return {
          data: null,
          error: o,
          response: o instanceof uc || o instanceof cc ? o.context : void 0
        };
      } finally {
        s && clearTimeout(s);
      }
    });
  }
}
var Rf = class extends Error {
  /**
  * @example
  * ```ts
  * import PostgrestError from '@supabase/postgrest-js'
  *
  * throw new PostgrestError({
  *   message: 'Row level security prevented the request',
  *   details: 'RLS denied the insert',
  *   hint: 'Check your policies',
  *   code: 'PGRST301',
  * })
  * ```
  */
  constructor(t) {
    super(t.message), this.name = "PostgrestError", this.details = t.details, this.hint = t.hint, this.code = t.code;
  }
}, Of = class {
  /**
  * Creates a builder configured for a specific PostgREST request.
  *
  * @example
  * ```ts
  * import PostgrestQueryBuilder from '@supabase/postgrest-js'
  *
  * const builder = new PostgrestQueryBuilder(
  *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
  *   { headers: new Headers({ apikey: 'public-anon-key' }) }
  * )
  * ```
  */
  constructor(t) {
    var e, r, n;
    this.shouldThrowOnError = !1, this.method = t.method, this.url = t.url, this.headers = new Headers(t.headers), this.schema = t.schema, this.body = t.body, this.shouldThrowOnError = (e = t.shouldThrowOnError) !== null && e !== void 0 ? e : !1, this.signal = t.signal, this.isMaybeSingle = (r = t.isMaybeSingle) !== null && r !== void 0 ? r : !1, this.urlLengthLimit = (n = t.urlLengthLimit) !== null && n !== void 0 ? n : 8e3, t.fetch ? this.fetch = t.fetch : this.fetch = fetch;
  }
  /**
  * If there's an error with the query, throwOnError will reject the promise by
  * throwing the error instead of returning it as part of a successful response.
  *
  * {@link https://github.com/supabase/supabase-js/issues/92}
  */
  throwOnError() {
    return this.shouldThrowOnError = !0, this;
  }
  /**
  * Set an HTTP header for the request.
  */
  setHeader(t, e) {
    return this.headers = new Headers(this.headers), this.headers.set(t, e), this;
  }
  then(t, e) {
    var r = this;
    this.schema === void 0 || (["GET", "HEAD"].includes(this.method) ? this.headers.set("Accept-Profile", this.schema) : this.headers.set("Content-Profile", this.schema)), this.method !== "GET" && this.method !== "HEAD" && this.headers.set("Content-Type", "application/json");
    const n = this.fetch;
    let i = n(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal
    }).then(async (s) => {
      let a = null, o = null, c = null, u = s.status, l = s.statusText;
      if (s.ok) {
        var m, d;
        if (r.method !== "HEAD") {
          var h;
          const _ = await s.text();
          _ === "" || (r.headers.get("Accept") === "text/csv" || r.headers.get("Accept") && (!((h = r.headers.get("Accept")) === null || h === void 0) && h.includes("application/vnd.pgrst.plan+text")) ? o = _ : o = JSON.parse(_));
        }
        const w = (m = r.headers.get("Prefer")) === null || m === void 0 ? void 0 : m.match(/count=(exact|planned|estimated)/), p = (d = s.headers.get("content-range")) === null || d === void 0 ? void 0 : d.split("/");
        w && p && p.length > 1 && (c = parseInt(p[1])), r.isMaybeSingle && r.method === "GET" && Array.isArray(o) && (o.length > 1 ? (a = {
          code: "PGRST116",
          details: `Results contain ${o.length} rows, application/vnd.pgrst.object+json requires 1 row`,
          hint: null,
          message: "JSON object requested, multiple (or no) rows returned"
        }, o = null, c = null, u = 406, l = "Not Acceptable") : o.length === 1 ? o = o[0] : o = null);
      } else {
        var v;
        const w = await s.text();
        try {
          a = JSON.parse(w), Array.isArray(a) && s.status === 404 && (o = [], a = null, u = 200, l = "OK");
        } catch {
          s.status === 404 && w === "" ? (u = 204, l = "No Content") : a = { message: w };
        }
        if (a && r.isMaybeSingle && (!(a == null || (v = a.details) === null || v === void 0) && v.includes("0 rows")) && (a = null, u = 200, l = "OK"), a && r.shouldThrowOnError) throw new Rf(a);
      }
      return {
        error: a,
        data: o,
        count: c,
        status: u,
        statusText: l
      };
    });
    return this.shouldThrowOnError || (i = i.catch((s) => {
      var a;
      let o = "", c = "", u = "";
      const l = s?.cause;
      if (l) {
        var m, d, h, v;
        const _ = (m = l?.message) !== null && m !== void 0 ? m : "", f = (d = l?.code) !== null && d !== void 0 ? d : "";
        o = `${(h = s?.name) !== null && h !== void 0 ? h : "FetchError"}: ${s?.message}`, o += `

Caused by: ${(v = l?.name) !== null && v !== void 0 ? v : "Error"}: ${_}`, f && (o += ` (${f})`), l?.stack && (o += `
${l.stack}`);
      } else {
        var w;
        o = (w = s?.stack) !== null && w !== void 0 ? w : "";
      }
      const p = this.url.toString().length;
      return s?.name === "AbortError" || s?.code === "ABORT_ERR" ? (u = "", c = "Request was aborted (timeout or manual cancellation)", p > this.urlLengthLimit && (c += `. Note: Your request URL is ${p} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`)) : (l?.name === "HeadersOverflowError" || l?.code === "UND_ERR_HEADERS_OVERFLOW") && (u = "", c = "HTTP headers exceeded server limits (typically 16KB)", p > this.urlLengthLimit && (c += `. Your request URL is ${p} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`)), {
        error: {
          message: `${(a = s?.name) !== null && a !== void 0 ? a : "FetchError"}: ${s?.message}`,
          details: o,
          hint: c,
          code: u
        },
        data: null,
        count: null,
        status: 0,
        statusText: ""
      };
    })), i.then(t, e);
  }
  /**
  * Override the type of the returned `data`.
  *
  * @typeParam NewResult - The new result type to override with
  * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
  */
  returns() {
    return this;
  }
  /**
  * Override the type of the returned `data` field in the response.
  *
  * @typeParam NewResult - The new type to cast the response data to
  * @typeParam Options - Optional type configuration (defaults to { merge: true })
  * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
  * @example
  * ```typescript
  * // Merge with existing types (default behavior)
  * const query = supabase
  *   .from('users')
  *   .select()
  *   .overrideTypes<{ custom_field: string }>()
  *
  * // Replace existing types completely
  * const replaceQuery = supabase
  *   .from('users')
  *   .select()
  *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
  * ```
  * @returns A PostgrestBuilder instance with the new type
  */
  overrideTypes() {
    return this;
  }
}, Tf = class extends Of {
  /**
  * Perform a SELECT on the query result.
  *
  * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
  * return modified rows. By calling this method, modified rows are returned in
  * `data`.
  *
  * @param columns - The columns to retrieve, separated by commas
  */
  select(t) {
    let e = !1;
    const r = (t ?? "*").split("").map((n) => /\s/.test(n) && !e ? "" : (n === '"' && (e = !e), n)).join("");
    return this.url.searchParams.set("select", r), this.headers.append("Prefer", "return=representation"), this;
  }
  /**
  * Order the query result by `column`.
  *
  * You can call this method multiple times to order by multiple columns.
  *
  * You can order referenced tables, but it only affects the ordering of the
  * parent table if you use `!inner` in the query.
  *
  * @param column - The column to order by
  * @param options - Named parameters
  * @param options.ascending - If `true`, the result will be in ascending order
  * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
  * `null`s appear last.
  * @param options.referencedTable - Set this to order a referenced table by
  * its columns
  * @param options.foreignTable - Deprecated, use `options.referencedTable`
  * instead
  */
  order(t, { ascending: e = !0, nullsFirst: r, foreignTable: n, referencedTable: i = n } = {}) {
    const s = i ? `${i}.order` : "order", a = this.url.searchParams.get(s);
    return this.url.searchParams.set(s, `${a ? `${a},` : ""}${t}.${e ? "asc" : "desc"}${r === void 0 ? "" : r ? ".nullsfirst" : ".nullslast"}`), this;
  }
  /**
  * Limit the query result by `count`.
  *
  * @param count - The maximum number of rows to return
  * @param options - Named parameters
  * @param options.referencedTable - Set this to limit rows of referenced
  * tables instead of the parent table
  * @param options.foreignTable - Deprecated, use `options.referencedTable`
  * instead
  */
  limit(t, { foreignTable: e, referencedTable: r = e } = {}) {
    const n = typeof r > "u" ? "limit" : `${r}.limit`;
    return this.url.searchParams.set(n, `${t}`), this;
  }
  /**
  * Limit the query result by starting at an offset `from` and ending at the offset `to`.
  * Only records within this range are returned.
  * This respects the query order and if there is no order clause the range could behave unexpectedly.
  * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
  * and fourth rows of the query.
  *
  * @param from - The starting index from which to limit the result
  * @param to - The last index to which to limit the result
  * @param options - Named parameters
  * @param options.referencedTable - Set this to limit rows of referenced
  * tables instead of the parent table
  * @param options.foreignTable - Deprecated, use `options.referencedTable`
  * instead
  */
  range(t, e, { foreignTable: r, referencedTable: n = r } = {}) {
    const i = typeof n > "u" ? "offset" : `${n}.offset`, s = typeof n > "u" ? "limit" : `${n}.limit`;
    return this.url.searchParams.set(i, `${t}`), this.url.searchParams.set(s, `${e - t + 1}`), this;
  }
  /**
  * Set the AbortSignal for the fetch request.
  *
  * @param signal - The AbortSignal to use for the fetch request
  */
  abortSignal(t) {
    return this.signal = t, this;
  }
  /**
  * Return `data` as a single object instead of an array of objects.
  *
  * Query result must be one row (e.g. using `.limit(1)`), otherwise this
  * returns an error.
  */
  single() {
    return this.headers.set("Accept", "application/vnd.pgrst.object+json"), this;
  }
  /**
  * Return `data` as a single object instead of an array of objects.
  *
  * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
  * this returns an error.
  */
  maybeSingle() {
    return this.method === "GET" ? this.headers.set("Accept", "application/json") : this.headers.set("Accept", "application/vnd.pgrst.object+json"), this.isMaybeSingle = !0, this;
  }
  /**
  * Return `data` as a string in CSV format.
  */
  csv() {
    return this.headers.set("Accept", "text/csv"), this;
  }
  /**
  * Return `data` as an object in [GeoJSON](https://geojson.org) format.
  */
  geojson() {
    return this.headers.set("Accept", "application/geo+json"), this;
  }
  /**
  * Return `data` as the EXPLAIN plan for the query.
  *
  * You need to enable the
  * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
  * setting before using this method.
  *
  * @param options - Named parameters
  *
  * @param options.analyze - If `true`, the query will be executed and the
  * actual run time will be returned
  *
  * @param options.verbose - If `true`, the query identifier will be returned
  * and `data` will include the output columns of the query
  *
  * @param options.settings - If `true`, include information on configuration
  * parameters that affect query planning
  *
  * @param options.buffers - If `true`, include information on buffer usage
  *
  * @param options.wal - If `true`, include information on WAL record generation
  *
  * @param options.format - The format of the output, can be `"text"` (default)
  * or `"json"`
  */
  explain({ analyze: t = !1, verbose: e = !1, settings: r = !1, buffers: n = !1, wal: i = !1, format: s = "text" } = {}) {
    var a;
    const o = [
      t ? "analyze" : null,
      e ? "verbose" : null,
      r ? "settings" : null,
      n ? "buffers" : null,
      i ? "wal" : null
    ].filter(Boolean).join("|"), c = (a = this.headers.get("Accept")) !== null && a !== void 0 ? a : "application/json";
    return this.headers.set("Accept", `application/vnd.pgrst.plan+${s}; for="${c}"; options=${o};`), s === "json" ? this : this;
  }
  /**
  * Rollback the query.
  *
  * `data` will still be returned, but the query is not committed.
  */
  rollback() {
    return this.headers.append("Prefer", "tx=rollback"), this;
  }
  /**
  * Override the type of the returned `data`.
  *
  * @typeParam NewResult - The new result type to override with
  * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
  */
  returns() {
    return this;
  }
  /**
  * Set the maximum number of rows that can be affected by the query.
  * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
  *
  * @param value - The maximum number of rows that can be affected
  */
  maxAffected(t) {
    return this.headers.append("Prefer", "handling=strict"), this.headers.append("Prefer", `max-affected=${t}`), this;
  }
};
const lc = /* @__PURE__ */ new RegExp("[,()]");
var St = class extends Tf {
  /**
  * Match only rows where `column` is equal to `value`.
  *
  * To check if the value of `column` is NULL, you should use `.is()` instead.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  eq(t, e) {
    return this.url.searchParams.append(t, `eq.${e}`), this;
  }
  /**
  * Match only rows where `column` is not equal to `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  neq(t, e) {
    return this.url.searchParams.append(t, `neq.${e}`), this;
  }
  /**
  * Match only rows where `column` is greater than `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  gt(t, e) {
    return this.url.searchParams.append(t, `gt.${e}`), this;
  }
  /**
  * Match only rows where `column` is greater than or equal to `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  gte(t, e) {
    return this.url.searchParams.append(t, `gte.${e}`), this;
  }
  /**
  * Match only rows where `column` is less than `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  lt(t, e) {
    return this.url.searchParams.append(t, `lt.${e}`), this;
  }
  /**
  * Match only rows where `column` is less than or equal to `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  lte(t, e) {
    return this.url.searchParams.append(t, `lte.${e}`), this;
  }
  /**
  * Match only rows where `column` matches `pattern` case-sensitively.
  *
  * @param column - The column to filter on
  * @param pattern - The pattern to match with
  */
  like(t, e) {
    return this.url.searchParams.append(t, `like.${e}`), this;
  }
  /**
  * Match only rows where `column` matches all of `patterns` case-sensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  likeAllOf(t, e) {
    return this.url.searchParams.append(t, `like(all).{${e.join(",")}}`), this;
  }
  /**
  * Match only rows where `column` matches any of `patterns` case-sensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  likeAnyOf(t, e) {
    return this.url.searchParams.append(t, `like(any).{${e.join(",")}}`), this;
  }
  /**
  * Match only rows where `column` matches `pattern` case-insensitively.
  *
  * @param column - The column to filter on
  * @param pattern - The pattern to match with
  */
  ilike(t, e) {
    return this.url.searchParams.append(t, `ilike.${e}`), this;
  }
  /**
  * Match only rows where `column` matches all of `patterns` case-insensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  ilikeAllOf(t, e) {
    return this.url.searchParams.append(t, `ilike(all).{${e.join(",")}}`), this;
  }
  /**
  * Match only rows where `column` matches any of `patterns` case-insensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  ilikeAnyOf(t, e) {
    return this.url.searchParams.append(t, `ilike(any).{${e.join(",")}}`), this;
  }
  /**
  * Match only rows where `column` matches the PostgreSQL regex `pattern`
  * case-sensitively (using the `~` operator).
  *
  * @param column - The column to filter on
  * @param pattern - The PostgreSQL regular expression pattern to match with
  */
  regexMatch(t, e) {
    return this.url.searchParams.append(t, `match.${e}`), this;
  }
  /**
  * Match only rows where `column` matches the PostgreSQL regex `pattern`
  * case-insensitively (using the `~*` operator).
  *
  * @param column - The column to filter on
  * @param pattern - The PostgreSQL regular expression pattern to match with
  */
  regexIMatch(t, e) {
    return this.url.searchParams.append(t, `imatch.${e}`), this;
  }
  /**
  * Match only rows where `column` IS `value`.
  *
  * For non-boolean columns, this is only relevant for checking if the value of
  * `column` is NULL by setting `value` to `null`.
  *
  * For boolean columns, you can also set `value` to `true` or `false` and it
  * will behave the same way as `.eq()`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  is(t, e) {
    return this.url.searchParams.append(t, `is.${e}`), this;
  }
  /**
  * Match only rows where `column` IS DISTINCT FROM `value`.
  *
  * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
  * are considered equal (not distinct), and comparing `NULL` with any non-NULL
  * value returns true (distinct).
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  isDistinct(t, e) {
    return this.url.searchParams.append(t, `isdistinct.${e}`), this;
  }
  /**
  * Match only rows where `column` is included in the `values` array.
  *
  * @param column - The column to filter on
  * @param values - The values array to filter with
  */
  in(t, e) {
    const r = Array.from(new Set(e)).map((n) => typeof n == "string" && lc.test(n) ? `"${n}"` : `${n}`).join(",");
    return this.url.searchParams.append(t, `in.(${r})`), this;
  }
  /**
  * Match only rows where `column` is NOT included in the `values` array.
  *
  * @param column - The column to filter on
  * @param values - The values array to filter with
  */
  notIn(t, e) {
    const r = Array.from(new Set(e)).map((n) => typeof n == "string" && lc.test(n) ? `"${n}"` : `${n}`).join(",");
    return this.url.searchParams.append(t, `not.in.(${r})`), this;
  }
  /**
  * Only relevant for jsonb, array, and range columns. Match only rows where
  * `column` contains every element appearing in `value`.
  *
  * @param column - The jsonb, array, or range column to filter on
  * @param value - The jsonb, array, or range value to filter with
  */
  contains(t, e) {
    return typeof e == "string" ? this.url.searchParams.append(t, `cs.${e}`) : Array.isArray(e) ? this.url.searchParams.append(t, `cs.{${e.join(",")}}`) : this.url.searchParams.append(t, `cs.${JSON.stringify(e)}`), this;
  }
  /**
  * Only relevant for jsonb, array, and range columns. Match only rows where
  * every element appearing in `column` is contained by `value`.
  *
  * @param column - The jsonb, array, or range column to filter on
  * @param value - The jsonb, array, or range value to filter with
  */
  containedBy(t, e) {
    return typeof e == "string" ? this.url.searchParams.append(t, `cd.${e}`) : Array.isArray(e) ? this.url.searchParams.append(t, `cd.{${e.join(",")}}`) : this.url.searchParams.append(t, `cd.${JSON.stringify(e)}`), this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is greater than any element in `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeGt(t, e) {
    return this.url.searchParams.append(t, `sr.${e}`), this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is either contained in `range` or greater than any element in
  * `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeGte(t, e) {
    return this.url.searchParams.append(t, `nxl.${e}`), this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is less than any element in `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeLt(t, e) {
    return this.url.searchParams.append(t, `sl.${e}`), this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is either contained in `range` or less than any element in
  * `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeLte(t, e) {
    return this.url.searchParams.append(t, `nxr.${e}`), this;
  }
  /**
  * Only relevant for range columns. Match only rows where `column` is
  * mutually exclusive to `range` and there can be no element between the two
  * ranges.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeAdjacent(t, e) {
    return this.url.searchParams.append(t, `adj.${e}`), this;
  }
  /**
  * Only relevant for array and range columns. Match only rows where
  * `column` and `value` have an element in common.
  *
  * @param column - The array or range column to filter on
  * @param value - The array or range value to filter with
  */
  overlaps(t, e) {
    return typeof e == "string" ? this.url.searchParams.append(t, `ov.${e}`) : this.url.searchParams.append(t, `ov.{${e.join(",")}}`), this;
  }
  /**
  * Only relevant for text and tsvector columns. Match only rows where
  * `column` matches the query string in `query`.
  *
  * @param column - The text or tsvector column to filter on
  * @param query - The query text to match with
  * @param options - Named parameters
  * @param options.config - The text search configuration to use
  * @param options.type - Change how the `query` text is interpreted
  */
  textSearch(t, e, { config: r, type: n } = {}) {
    let i = "";
    n === "plain" ? i = "pl" : n === "phrase" ? i = "ph" : n === "websearch" && (i = "w");
    const s = r === void 0 ? "" : `(${r})`;
    return this.url.searchParams.append(t, `${i}fts${s}.${e}`), this;
  }
  /**
  * Match only rows where each column in `query` keys is equal to its
  * associated value. Shorthand for multiple `.eq()`s.
  *
  * @param query - The object to filter with, with column names as keys mapped
  * to their filter values
  */
  match(t) {
    return Object.entries(t).forEach(([e, r]) => {
      this.url.searchParams.append(e, `eq.${r}`);
    }), this;
  }
  /**
  * Match only rows which doesn't satisfy the filter.
  *
  * Unlike most filters, `opearator` and `value` are used as-is and need to
  * follow [PostgREST
  * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  * to make sure they are properly sanitized.
  *
  * @param column - The column to filter on
  * @param operator - The operator to be negated to filter with, following
  * PostgREST syntax
  * @param value - The value to filter with, following PostgREST syntax
  */
  not(t, e, r) {
    return this.url.searchParams.append(t, `not.${e}.${r}`), this;
  }
  /**
  * Match only rows which satisfy at least one of the filters.
  *
  * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
  * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  * to make sure it's properly sanitized.
  *
  * It's currently not possible to do an `.or()` filter across multiple tables.
  *
  * @param filters - The filters to use, following PostgREST syntax
  * @param options - Named parameters
  * @param options.referencedTable - Set this to filter on referenced tables
  * instead of the parent table
  * @param options.foreignTable - Deprecated, use `referencedTable` instead
  */
  or(t, { foreignTable: e, referencedTable: r = e } = {}) {
    const n = r ? `${r}.or` : "or";
    return this.url.searchParams.append(n, `(${t})`), this;
  }
  /**
  * Match only rows which satisfy the filter. This is an escape hatch - you
  * should use the specific filter methods wherever possible.
  *
  * Unlike most filters, `opearator` and `value` are used as-is and need to
  * follow [PostgREST
  * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  * to make sure they are properly sanitized.
  *
  * @param column - The column to filter on
  * @param operator - The operator to filter with, following PostgREST syntax
  * @param value - The value to filter with, following PostgREST syntax
  */
  filter(t, e, r) {
    return this.url.searchParams.append(t, `${e}.${r}`), this;
  }
}, Pf = class {
  /**
  * Creates a query builder scoped to a Postgres table or view.
  *
  * @example
  * ```ts
  * import PostgrestQueryBuilder from '@supabase/postgrest-js'
  *
  * const query = new PostgrestQueryBuilder(
  *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
  *   { headers: { apikey: 'public-anon-key' } }
  * )
  * ```
  */
  constructor(t, { headers: e = {}, schema: r, fetch: n, urlLengthLimit: i = 8e3 }) {
    this.url = t, this.headers = new Headers(e), this.schema = r, this.fetch = n, this.urlLengthLimit = i;
  }
  /**
  * Clone URL and headers to prevent shared state between operations.
  */
  cloneRequestState() {
    return {
      url: new URL(this.url.toString()),
      headers: new Headers(this.headers)
    };
  }
  /**
  * Perform a SELECT query on the table or view.
  *
  * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
  *
  * @param options - Named parameters
  *
  * @param options.head - When set to `true`, `data` will not be returned.
  * Useful if you only need the count.
  *
  * @param options.count - Count algorithm to use to count rows in the table or view.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @remarks
  * When using `count` with `.range()` or `.limit()`, the returned `count` is the total number of rows
  * that match your filters, not the number of rows in the current page. Use this to build pagination UI.
  */
  select(t, e) {
    const { head: r = !1, count: n } = e ?? {}, i = r ? "HEAD" : "GET";
    let s = !1;
    const a = (t ?? "*").split("").map((u) => /\s/.test(u) && !s ? "" : (u === '"' && (s = !s), u)).join(""), { url: o, headers: c } = this.cloneRequestState();
    return o.searchParams.set("select", a), n && c.append("Prefer", `count=${n}`), new St({
      method: i,
      url: o,
      headers: c,
      schema: this.schema,
      fetch: this.fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform an INSERT into the table or view.
  *
  * By default, inserted rows are not returned. To return it, chain the call
  * with `.select()`.
  *
  * @param values - The values to insert. Pass an object to insert a single row
  * or an array to insert multiple rows.
  *
  * @param options - Named parameters
  *
  * @param options.count - Count algorithm to use to count inserted rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @param options.defaultToNull - Make missing fields default to `null`.
  * Otherwise, use the default value for the column. Only applies for bulk
  * inserts.
  */
  insert(t, { count: e, defaultToNull: r = !0 } = {}) {
    var n;
    const i = "POST", { url: s, headers: a } = this.cloneRequestState();
    if (e && a.append("Prefer", `count=${e}`), r || a.append("Prefer", "missing=default"), Array.isArray(t)) {
      const o = t.reduce((c, u) => c.concat(Object.keys(u)), []);
      if (o.length > 0) {
        const c = [...new Set(o)].map((u) => `"${u}"`);
        s.searchParams.set("columns", c.join(","));
      }
    }
    return new St({
      method: i,
      url: s,
      headers: a,
      schema: this.schema,
      body: t,
      fetch: (n = this.fetch) !== null && n !== void 0 ? n : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform an UPSERT on the table or view. Depending on the column(s) passed
  * to `onConflict`, `.upsert()` allows you to perform the equivalent of
  * `.insert()` if a row with the corresponding `onConflict` columns doesn't
  * exist, or if it does exist, perform an alternative action depending on
  * `ignoreDuplicates`.
  *
  * By default, upserted rows are not returned. To return it, chain the call
  * with `.select()`.
  *
  * @param values - The values to upsert with. Pass an object to upsert a
  * single row or an array to upsert multiple rows.
  *
  * @param options - Named parameters
  *
  * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
  * duplicate rows are determined. Two rows are duplicates if all the
  * `onConflict` columns are equal.
  *
  * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
  * `false`, duplicate rows are merged with existing rows.
  *
  * @param options.count - Count algorithm to use to count upserted rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @param options.defaultToNull - Make missing fields default to `null`.
  * Otherwise, use the default value for the column. This only applies when
  * inserting new rows, not when merging with existing rows under
  * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
  *
  * @example Upsert a single row using a unique key
  * ```ts
  * // Upserting a single row, overwriting based on the 'username' unique column
  * const { data, error } = await supabase
  *   .from('users')
  *   .upsert({ username: 'supabot' }, { onConflict: 'username' })
  *
  * // Example response:
  * // {
  * //   data: [
  * //     { id: 4, message: 'bar', username: 'supabot' }
  * //   ],
  * //   error: null
  * // }
  * ```
  *
  * @example Upsert with conflict resolution and exact row counting
  * ```ts
  * // Upserting and returning exact count
  * const { data, error, count } = await supabase
  *   .from('users')
  *   .upsert(
  *     {
  *       id: 3,
  *       message: 'foo',
  *       username: 'supabot'
  *     },
  *     {
  *       onConflict: 'username',
  *       count: 'exact'
  *     }
  *   )
  *
  * // Example response:
  * // {
  * //   data: [
  * //     {
  * //       id: 42,
  * //       handle: "saoirse",
  * //       display_name: "Saoirse"
  * //     }
  * //   ],
  * //   count: 1,
  * //   error: null
  * // }
  * ```
  */
  upsert(t, { onConflict: e, ignoreDuplicates: r = !1, count: n, defaultToNull: i = !0 } = {}) {
    var s;
    const a = "POST", { url: o, headers: c } = this.cloneRequestState();
    if (c.append("Prefer", `resolution=${r ? "ignore" : "merge"}-duplicates`), e !== void 0 && o.searchParams.set("on_conflict", e), n && c.append("Prefer", `count=${n}`), i || c.append("Prefer", "missing=default"), Array.isArray(t)) {
      const u = t.reduce((l, m) => l.concat(Object.keys(m)), []);
      if (u.length > 0) {
        const l = [...new Set(u)].map((m) => `"${m}"`);
        o.searchParams.set("columns", l.join(","));
      }
    }
    return new St({
      method: a,
      url: o,
      headers: c,
      schema: this.schema,
      body: t,
      fetch: (s = this.fetch) !== null && s !== void 0 ? s : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform an UPDATE on the table or view.
  *
  * By default, updated rows are not returned. To return it, chain the call
  * with `.select()` after filters.
  *
  * @param values - The values to update with
  *
  * @param options - Named parameters
  *
  * @param options.count - Count algorithm to use to count updated rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  */
  update(t, { count: e } = {}) {
    var r;
    const n = "PATCH", { url: i, headers: s } = this.cloneRequestState();
    return e && s.append("Prefer", `count=${e}`), new St({
      method: n,
      url: i,
      headers: s,
      schema: this.schema,
      body: t,
      fetch: (r = this.fetch) !== null && r !== void 0 ? r : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform a DELETE on the table or view.
  *
  * By default, deleted rows are not returned. To return it, chain the call
  * with `.select()` after filters.
  *
  * @param options - Named parameters
  *
  * @param options.count - Count algorithm to use to count deleted rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  */
  delete({ count: t } = {}) {
    var e;
    const r = "DELETE", { url: n, headers: i } = this.cloneRequestState();
    return t && i.append("Prefer", `count=${t}`), new St({
      method: r,
      url: n,
      headers: i,
      schema: this.schema,
      fetch: (e = this.fetch) !== null && e !== void 0 ? e : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
};
function Ft(t) {
  "@babel/helpers - typeof";
  return Ft = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ft(t);
}
function kf(t, e) {
  if (Ft(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Ft(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Af(t) {
  var e = kf(t, "string");
  return Ft(e) == "symbol" ? e : e + "";
}
function If(t, e, r) {
  return (e = Af(e)) in t ? Object.defineProperty(t, e, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = r, t;
}
function dc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function tn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? dc(Object(r), !0).forEach(function(n) {
      If(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : dc(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
var jf = class cu {
  /**
  * Creates a PostgREST client.
  *
  * @param url - URL of the PostgREST endpoint
  * @param options - Named parameters
  * @param options.headers - Custom headers
  * @param options.schema - Postgres schema to switch to
  * @param options.fetch - Custom fetch
  * @param options.timeout - Optional timeout in milliseconds for all requests. When set, requests will automatically abort after this duration to prevent indefinite hangs.
  * @param options.urlLengthLimit - Maximum URL length in characters before warnings/errors are triggered. Defaults to 8000.
  * @example
  * ```ts
  * import PostgrestClient from '@supabase/postgrest-js'
  *
  * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
  *   headers: { apikey: 'public-anon-key' },
  *   schema: 'public',
  *   timeout: 30000, // 30 second timeout
  * })
  * ```
  */
  constructor(e, { headers: r = {}, schema: n, fetch: i, timeout: s, urlLengthLimit: a = 8e3 } = {}) {
    this.url = e, this.headers = new Headers(r), this.schemaName = n, this.urlLengthLimit = a;
    const o = i ?? globalThis.fetch;
    s !== void 0 && s > 0 ? this.fetch = (c, u) => {
      const l = new AbortController(), m = setTimeout(() => l.abort(), s), d = u?.signal;
      if (d) {
        if (d.aborted)
          return clearTimeout(m), o(c, u);
        const h = () => {
          clearTimeout(m), l.abort();
        };
        return d.addEventListener("abort", h, { once: !0 }), o(c, tn(tn({}, u), {}, { signal: l.signal })).finally(() => {
          clearTimeout(m), d.removeEventListener("abort", h);
        });
      }
      return o(c, tn(tn({}, u), {}, { signal: l.signal })).finally(() => clearTimeout(m));
    } : this.fetch = o;
  }
  /**
  * Perform a query on a table or a view.
  *
  * @param relation - The table or view name to query
  */
  from(e) {
    if (!e || typeof e != "string" || e.trim() === "") throw new Error("Invalid relation name: relation must be a non-empty string.");
    return new Pf(new URL(`${this.url}/${e}`), {
      headers: new Headers(this.headers),
      schema: this.schemaName,
      fetch: this.fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Select a schema to query or perform an function (rpc) call.
  *
  * The schema needs to be on the list of exposed schemas inside Supabase.
  *
  * @param schema - The schema to query
  */
  schema(e) {
    return new cu(this.url, {
      headers: this.headers,
      schema: e,
      fetch: this.fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform a function call.
  *
  * @param fn - The function name to call
  * @param args - The arguments to pass to the function call
  * @param options - Named parameters
  * @param options.head - When set to `true`, `data` will not be returned.
  * Useful if you only need the count.
  * @param options.get - When set to `true`, the function will be called with
  * read-only access mode.
  * @param options.count - Count algorithm to use to count rows returned by the
  * function. Only applicable for [set-returning
  * functions](https://www.postgresql.org/docs/current/functions-srf.html).
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @example
  * ```ts
  * // For cross-schema functions where type inference fails, use overrideTypes:
  * const { data } = await supabase
  *   .schema('schema_b')
  *   .rpc('function_a', {})
  *   .overrideTypes<{ id: string; user_id: string }[]>()
  * ```
  */
  rpc(e, r = {}, { head: n = !1, get: i = !1, count: s } = {}) {
    var a;
    let o;
    const c = new URL(`${this.url}/rpc/${e}`);
    let u;
    const l = (h) => h !== null && typeof h == "object" && (!Array.isArray(h) || h.some(l)), m = n && Object.values(r).some(l);
    m ? (o = "POST", u = r) : n || i ? (o = n ? "HEAD" : "GET", Object.entries(r).filter(([h, v]) => v !== void 0).map(([h, v]) => [h, Array.isArray(v) ? `{${v.join(",")}}` : `${v}`]).forEach(([h, v]) => {
      c.searchParams.append(h, v);
    })) : (o = "POST", u = r);
    const d = new Headers(this.headers);
    return m ? d.set("Prefer", s ? `count=${s},return=minimal` : "return=minimal") : s && d.set("Prefer", `count=${s}`), new St({
      method: o,
      url: c,
      headers: d,
      schema: this.schemaName,
      body: u,
      fetch: (a = this.fetch) !== null && a !== void 0 ? a : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
};
class Nf {
  /**
   * Static-only utility – prevent instantiation.
   */
  constructor() {
  }
  static detectEnvironment() {
    var e;
    if (typeof WebSocket < "u")
      return { type: "native", constructor: WebSocket };
    if (typeof globalThis < "u" && typeof globalThis.WebSocket < "u")
      return { type: "native", constructor: globalThis.WebSocket };
    if (typeof global < "u" && typeof global.WebSocket < "u")
      return { type: "native", constructor: global.WebSocket };
    if (typeof globalThis < "u" && typeof globalThis.WebSocketPair < "u" && typeof globalThis.WebSocket > "u")
      return {
        type: "cloudflare",
        error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
        workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
      };
    if (typeof globalThis < "u" && globalThis.EdgeRuntime || typeof navigator < "u" && (!((e = navigator.userAgent) === null || e === void 0) && e.includes("Vercel-Edge")))
      return {
        type: "unsupported",
        error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
        workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
      };
    const r = globalThis.process;
    if (r) {
      const n = r.versions;
      if (n && n.node) {
        const i = n.node, s = parseInt(i.replace(/^v/, "").split(".")[0]);
        return s >= 22 ? typeof globalThis.WebSocket < "u" ? { type: "native", constructor: globalThis.WebSocket } : {
          type: "unsupported",
          error: `Node.js ${s} detected but native WebSocket not found.`,
          workaround: "Provide a WebSocket implementation via the transport option."
        } : {
          type: "unsupported",
          error: `Node.js ${s} detected without native WebSocket support.`,
          workaround: `For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })`
        };
      }
    }
    return {
      type: "unsupported",
      error: "Unknown JavaScript runtime without WebSocket support.",
      workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
    };
  }
  /**
   * Returns the best available WebSocket constructor for the current runtime.
   *
   * @example
   * ```ts
   * const WS = WebSocketFactory.getWebSocketConstructor()
   * const socket = new WS('wss://realtime.supabase.co/socket')
   * ```
   */
  static getWebSocketConstructor() {
    const e = this.detectEnvironment();
    if (e.constructor)
      return e.constructor;
    let r = e.error || "WebSocket not supported in this environment.";
    throw e.workaround && (r += `

Suggested solution: ${e.workaround}`), new Error(r);
  }
  /**
   * Creates a WebSocket using the detected constructor.
   *
   * @example
   * ```ts
   * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
   * ```
   */
  static createWebSocket(e, r) {
    const n = this.getWebSocketConstructor();
    return new n(e, r);
  }
  /**
   * Detects whether the runtime can establish WebSocket connections.
   *
   * @example
   * ```ts
   * if (!WebSocketFactory.isWebSocketSupported()) {
   *   console.warn('Falling back to long polling')
   * }
   * ```
   */
  static isWebSocketSupported() {
    try {
      const e = this.detectEnvironment();
      return e.type === "native" || e.type === "ws";
    } catch {
      return !1;
    }
  }
}
const Cf = "2.94.0", Df = `realtime-js/${Cf}`, Lf = "1.0.0", uu = "2.0.0", hc = uu, ti = 1e4, qf = 1e3, Uf = 100;
var Qe;
(function(t) {
  t[t.connecting = 0] = "connecting", t[t.open = 1] = "open", t[t.closing = 2] = "closing", t[t.closed = 3] = "closed";
})(Qe || (Qe = {}));
var me;
(function(t) {
  t.closed = "closed", t.errored = "errored", t.joined = "joined", t.joining = "joining", t.leaving = "leaving";
})(me || (me = {}));
var De;
(function(t) {
  t.close = "phx_close", t.error = "phx_error", t.join = "phx_join", t.reply = "phx_reply", t.leave = "phx_leave", t.access_token = "access_token";
})(De || (De = {}));
var ri;
(function(t) {
  t.websocket = "websocket";
})(ri || (ri = {}));
var ct;
(function(t) {
  t.Connecting = "connecting", t.Open = "open", t.Closing = "closing", t.Closed = "closed";
})(ct || (ct = {}));
class Mf {
  constructor(e) {
    this.HEADER_LENGTH = 1, this.USER_BROADCAST_PUSH_META_LENGTH = 6, this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 }, this.BINARY_ENCODING = 0, this.JSON_ENCODING = 1, this.BROADCAST_EVENT = "broadcast", this.allowedMetadataKeys = [], this.allowedMetadataKeys = e ?? [];
  }
  encode(e, r) {
    if (e.event === this.BROADCAST_EVENT && !(e.payload instanceof ArrayBuffer) && typeof e.payload.event == "string")
      return r(this._binaryEncodeUserBroadcastPush(e));
    let n = [e.join_ref, e.ref, e.topic, e.event, e.payload];
    return r(JSON.stringify(n));
  }
  _binaryEncodeUserBroadcastPush(e) {
    var r;
    return this._isArrayBuffer((r = e.payload) === null || r === void 0 ? void 0 : r.payload) ? this._encodeBinaryUserBroadcastPush(e) : this._encodeJsonUserBroadcastPush(e);
  }
  _encodeBinaryUserBroadcastPush(e) {
    var r, n;
    const i = (n = (r = e.payload) === null || r === void 0 ? void 0 : r.payload) !== null && n !== void 0 ? n : new ArrayBuffer(0);
    return this._encodeUserBroadcastPush(e, this.BINARY_ENCODING, i);
  }
  _encodeJsonUserBroadcastPush(e) {
    var r, n;
    const i = (n = (r = e.payload) === null || r === void 0 ? void 0 : r.payload) !== null && n !== void 0 ? n : {}, a = new TextEncoder().encode(JSON.stringify(i)).buffer;
    return this._encodeUserBroadcastPush(e, this.JSON_ENCODING, a);
  }
  _encodeUserBroadcastPush(e, r, n) {
    var i, s;
    const a = e.topic, o = (i = e.ref) !== null && i !== void 0 ? i : "", c = (s = e.join_ref) !== null && s !== void 0 ? s : "", u = e.payload.event, l = this.allowedMetadataKeys ? this._pick(e.payload, this.allowedMetadataKeys) : {}, m = Object.keys(l).length === 0 ? "" : JSON.stringify(l);
    if (c.length > 255)
      throw new Error(`joinRef length ${c.length} exceeds maximum of 255`);
    if (o.length > 255)
      throw new Error(`ref length ${o.length} exceeds maximum of 255`);
    if (a.length > 255)
      throw new Error(`topic length ${a.length} exceeds maximum of 255`);
    if (u.length > 255)
      throw new Error(`userEvent length ${u.length} exceeds maximum of 255`);
    if (m.length > 255)
      throw new Error(`metadata length ${m.length} exceeds maximum of 255`);
    const d = this.USER_BROADCAST_PUSH_META_LENGTH + c.length + o.length + a.length + u.length + m.length, h = new ArrayBuffer(this.HEADER_LENGTH + d);
    let v = new DataView(h), w = 0;
    v.setUint8(w++, this.KINDS.userBroadcastPush), v.setUint8(w++, c.length), v.setUint8(w++, o.length), v.setUint8(w++, a.length), v.setUint8(w++, u.length), v.setUint8(w++, m.length), v.setUint8(w++, r), Array.from(c, (_) => v.setUint8(w++, _.charCodeAt(0))), Array.from(o, (_) => v.setUint8(w++, _.charCodeAt(0))), Array.from(a, (_) => v.setUint8(w++, _.charCodeAt(0))), Array.from(u, (_) => v.setUint8(w++, _.charCodeAt(0))), Array.from(m, (_) => v.setUint8(w++, _.charCodeAt(0)));
    var p = new Uint8Array(h.byteLength + n.byteLength);
    return p.set(new Uint8Array(h), 0), p.set(new Uint8Array(n), h.byteLength), p.buffer;
  }
  decode(e, r) {
    if (this._isArrayBuffer(e)) {
      let n = this._binaryDecode(e);
      return r(n);
    }
    if (typeof e == "string") {
      const n = JSON.parse(e), [i, s, a, o, c] = n;
      return r({ join_ref: i, ref: s, topic: a, event: o, payload: c });
    }
    return r({});
  }
  _binaryDecode(e) {
    const r = new DataView(e), n = r.getUint8(0), i = new TextDecoder();
    if (n === this.KINDS.userBroadcast)
      return this._decodeUserBroadcast(e, r, i);
  }
  _decodeUserBroadcast(e, r, n) {
    const i = r.getUint8(1), s = r.getUint8(2), a = r.getUint8(3), o = r.getUint8(4);
    let c = this.HEADER_LENGTH + 4;
    const u = n.decode(e.slice(c, c + i));
    c = c + i;
    const l = n.decode(e.slice(c, c + s));
    c = c + s;
    const m = n.decode(e.slice(c, c + a));
    c = c + a;
    const d = e.slice(c, e.byteLength), h = o === this.JSON_ENCODING ? JSON.parse(n.decode(d)) : d, v = {
      type: this.BROADCAST_EVENT,
      event: l,
      payload: h
    };
    return a > 0 && (v.meta = JSON.parse(m)), { join_ref: null, ref: null, topic: u, event: this.BROADCAST_EVENT, payload: v };
  }
  _isArrayBuffer(e) {
    var r;
    return e instanceof ArrayBuffer || ((r = e?.constructor) === null || r === void 0 ? void 0 : r.name) === "ArrayBuffer";
  }
  _pick(e, r) {
    return !e || typeof e != "object" ? {} : Object.fromEntries(Object.entries(e).filter(([n]) => r.includes(n)));
  }
}
class lu {
  constructor(e, r) {
    this.callback = e, this.timerCalc = r, this.timer = void 0, this.tries = 0, this.callback = e, this.timerCalc = r;
  }
  reset() {
    this.tries = 0, clearTimeout(this.timer), this.timer = void 0;
  }
  // Cancels any previous scheduleTimeout and schedules callback
  scheduleTimeout() {
    clearTimeout(this.timer), this.timer = setTimeout(() => {
      this.tries = this.tries + 1, this.callback();
    }, this.timerCalc(this.tries + 1));
  }
}
var ue;
(function(t) {
  t.abstime = "abstime", t.bool = "bool", t.date = "date", t.daterange = "daterange", t.float4 = "float4", t.float8 = "float8", t.int2 = "int2", t.int4 = "int4", t.int4range = "int4range", t.int8 = "int8", t.int8range = "int8range", t.json = "json", t.jsonb = "jsonb", t.money = "money", t.numeric = "numeric", t.oid = "oid", t.reltime = "reltime", t.text = "text", t.time = "time", t.timestamp = "timestamp", t.timestamptz = "timestamptz", t.timetz = "timetz", t.tsrange = "tsrange", t.tstzrange = "tstzrange";
})(ue || (ue = {}));
const fc = (t, e, r = {}) => {
  var n;
  const i = (n = r.skipTypes) !== null && n !== void 0 ? n : [];
  return e ? Object.keys(e).reduce((s, a) => (s[a] = xf(a, t, e, i), s), {}) : {};
}, xf = (t, e, r, n) => {
  const i = e.find((o) => o.name === t), s = i?.type, a = r[t];
  return s && !n.includes(s) ? du(s, a) : ni(a);
}, du = (t, e) => {
  if (t.charAt(0) === "_") {
    const r = t.slice(1, t.length);
    return Bf(e, r);
  }
  switch (t) {
    case ue.bool:
      return Ff(e);
    case ue.float4:
    case ue.float8:
    case ue.int2:
    case ue.int4:
    case ue.int8:
    case ue.numeric:
    case ue.oid:
      return Vf(e);
    case ue.json:
    case ue.jsonb:
      return zf(e);
    case ue.timestamp:
      return Kf(e);
    // Format to be consistent with PostgREST
    case ue.abstime:
    // To allow users to cast it based on Timezone
    case ue.date:
    // To allow users to cast it based on Timezone
    case ue.daterange:
    case ue.int4range:
    case ue.int8range:
    case ue.money:
    case ue.reltime:
    // To allow users to cast it based on Timezone
    case ue.text:
    case ue.time:
    // To allow users to cast it based on Timezone
    case ue.timestamptz:
    // To allow users to cast it based on Timezone
    case ue.timetz:
    // To allow users to cast it based on Timezone
    case ue.tsrange:
    case ue.tstzrange:
      return ni(e);
    default:
      return ni(e);
  }
}, ni = (t) => t, Ff = (t) => {
  switch (t) {
    case "t":
      return !0;
    case "f":
      return !1;
    default:
      return t;
  }
}, Vf = (t) => {
  if (typeof t == "string") {
    const e = parseFloat(t);
    if (!Number.isNaN(e))
      return e;
  }
  return t;
}, zf = (t) => {
  if (typeof t == "string")
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  return t;
}, Bf = (t, e) => {
  if (typeof t != "string")
    return t;
  const r = t.length - 1, n = t[r];
  if (t[0] === "{" && n === "}") {
    let s;
    const a = t.slice(1, r);
    try {
      s = JSON.parse("[" + a + "]");
    } catch {
      s = a ? a.split(",") : [];
    }
    return s.map((o) => du(e, o));
  }
  return t;
}, Kf = (t) => typeof t == "string" ? t.replace(" ", "T") : t, hu = (t) => {
  const e = new URL(t);
  return e.protocol = e.protocol.replace(/^ws/i, "http"), e.pathname = e.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, ""), e.pathname === "" || e.pathname === "/" ? e.pathname = "/api/broadcast" : e.pathname = e.pathname + "/api/broadcast", e.href;
};
class Bs {
  /**
   * Initializes the Push
   *
   * @param channel The Channel
   * @param event The event, for example `"phx_join"`
   * @param payload The payload, for example `{user_id: 123}`
   * @param timeout The push timeout in milliseconds
   */
  constructor(e, r, n = {}, i = ti) {
    this.channel = e, this.event = r, this.payload = n, this.timeout = i, this.sent = !1, this.timeoutTimer = void 0, this.ref = "", this.receivedResp = null, this.recHooks = [], this.refEvent = null;
  }
  resend(e) {
    this.timeout = e, this._cancelRefEvent(), this.ref = "", this.refEvent = null, this.receivedResp = null, this.sent = !1, this.send();
  }
  send() {
    this._hasReceived("timeout") || (this.startTimeout(), this.sent = !0, this.channel.socket.push({
      topic: this.channel.topic,
      event: this.event,
      payload: this.payload,
      ref: this.ref,
      join_ref: this.channel._joinRef()
    }));
  }
  updatePayload(e) {
    this.payload = Object.assign(Object.assign({}, this.payload), e);
  }
  receive(e, r) {
    var n;
    return this._hasReceived(e) && r((n = this.receivedResp) === null || n === void 0 ? void 0 : n.response), this.recHooks.push({ status: e, callback: r }), this;
  }
  startTimeout() {
    if (this.timeoutTimer)
      return;
    this.ref = this.channel.socket._makeRef(), this.refEvent = this.channel._replyEventName(this.ref);
    const e = (r) => {
      this._cancelRefEvent(), this._cancelTimeout(), this.receivedResp = r, this._matchReceive(r);
    };
    this.channel._on(this.refEvent, {}, e), this.timeoutTimer = setTimeout(() => {
      this.trigger("timeout", {});
    }, this.timeout);
  }
  trigger(e, r) {
    this.refEvent && this.channel._trigger(this.refEvent, { status: e, response: r });
  }
  destroy() {
    this._cancelRefEvent(), this._cancelTimeout();
  }
  _cancelRefEvent() {
    this.refEvent && this.channel._off(this.refEvent, {});
  }
  _cancelTimeout() {
    clearTimeout(this.timeoutTimer), this.timeoutTimer = void 0;
  }
  _matchReceive({ status: e, response: r }) {
    this.recHooks.filter((n) => n.status === e).forEach((n) => n.callback(r));
  }
  _hasReceived(e) {
    return this.receivedResp && this.receivedResp.status === e;
  }
}
var pc;
(function(t) {
  t.SYNC = "sync", t.JOIN = "join", t.LEAVE = "leave";
})(pc || (pc = {}));
class Mt {
  /**
   * Creates a Presence helper that keeps the local presence state in sync with the server.
   *
   * @param channel - The realtime channel to bind to.
   * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
   *
   * @example
   * ```ts
   * const presence = new RealtimePresence(channel)
   *
   * channel.on('presence', ({ event, key }) => {
   *   console.log(`Presence ${event} on ${key}`)
   * })
   * ```
   */
  constructor(e, r) {
    this.channel = e, this.state = {}, this.pendingDiffs = [], this.joinRef = null, this.enabled = !1, this.caller = {
      onJoin: () => {
      },
      onLeave: () => {
      },
      onSync: () => {
      }
    };
    const n = r?.events || {
      state: "presence_state",
      diff: "presence_diff"
    };
    this.channel._on(n.state, {}, (i) => {
      const { onJoin: s, onLeave: a, onSync: o } = this.caller;
      this.joinRef = this.channel._joinRef(), this.state = Mt.syncState(this.state, i, s, a), this.pendingDiffs.forEach((c) => {
        this.state = Mt.syncDiff(this.state, c, s, a);
      }), this.pendingDiffs = [], o();
    }), this.channel._on(n.diff, {}, (i) => {
      const { onJoin: s, onLeave: a, onSync: o } = this.caller;
      this.inPendingSyncState() ? this.pendingDiffs.push(i) : (this.state = Mt.syncDiff(this.state, i, s, a), o());
    }), this.onJoin((i, s, a) => {
      this.channel._trigger("presence", {
        event: "join",
        key: i,
        currentPresences: s,
        newPresences: a
      });
    }), this.onLeave((i, s, a) => {
      this.channel._trigger("presence", {
        event: "leave",
        key: i,
        currentPresences: s,
        leftPresences: a
      });
    }), this.onSync(() => {
      this.channel._trigger("presence", { event: "sync" });
    });
  }
  /**
   * Used to sync the list of presences on the server with the
   * client's state.
   *
   * An optional `onJoin` and `onLeave` callback can be provided to
   * react to changes in the client's local presences across
   * disconnects and reconnects with the server.
   *
   * @internal
   */
  static syncState(e, r, n, i) {
    const s = this.cloneDeep(e), a = this.transformState(r), o = {}, c = {};
    return this.map(s, (u, l) => {
      a[u] || (c[u] = l);
    }), this.map(a, (u, l) => {
      const m = s[u];
      if (m) {
        const d = l.map((p) => p.presence_ref), h = m.map((p) => p.presence_ref), v = l.filter((p) => h.indexOf(p.presence_ref) < 0), w = m.filter((p) => d.indexOf(p.presence_ref) < 0);
        v.length > 0 && (o[u] = v), w.length > 0 && (c[u] = w);
      } else
        o[u] = l;
    }), this.syncDiff(s, { joins: o, leaves: c }, n, i);
  }
  /**
   * Used to sync a diff of presence join and leave events from the
   * server, as they happen.
   *
   * Like `syncState`, `syncDiff` accepts optional `onJoin` and
   * `onLeave` callbacks to react to a user joining or leaving from a
   * device.
   *
   * @internal
   */
  static syncDiff(e, r, n, i) {
    const { joins: s, leaves: a } = {
      joins: this.transformState(r.joins),
      leaves: this.transformState(r.leaves)
    };
    return n || (n = () => {
    }), i || (i = () => {
    }), this.map(s, (o, c) => {
      var u;
      const l = (u = e[o]) !== null && u !== void 0 ? u : [];
      if (e[o] = this.cloneDeep(c), l.length > 0) {
        const m = e[o].map((h) => h.presence_ref), d = l.filter((h) => m.indexOf(h.presence_ref) < 0);
        e[o].unshift(...d);
      }
      n(o, l, c);
    }), this.map(a, (o, c) => {
      let u = e[o];
      if (!u)
        return;
      const l = c.map((m) => m.presence_ref);
      u = u.filter((m) => l.indexOf(m.presence_ref) < 0), e[o] = u, i(o, u, c), u.length === 0 && delete e[o];
    }), e;
  }
  /** @internal */
  static map(e, r) {
    return Object.getOwnPropertyNames(e).map((n) => r(n, e[n]));
  }
  /**
   * Remove 'metas' key
   * Change 'phx_ref' to 'presence_ref'
   * Remove 'phx_ref' and 'phx_ref_prev'
   *
   * @example
   * // returns {
   *  abc123: [
   *    { presence_ref: '2', user_id: 1 },
   *    { presence_ref: '3', user_id: 2 }
   *  ]
   * }
   * RealtimePresence.transformState({
   *  abc123: {
   *    metas: [
   *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
   *      { phx_ref: '3', user_id: 2 }
   *    ]
   *  }
   * })
   *
   * @internal
   */
  static transformState(e) {
    return e = this.cloneDeep(e), Object.getOwnPropertyNames(e).reduce((r, n) => {
      const i = e[n];
      return "metas" in i ? r[n] = i.metas.map((s) => (s.presence_ref = s.phx_ref, delete s.phx_ref, delete s.phx_ref_prev, s)) : r[n] = i, r;
    }, {});
  }
  /** @internal */
  static cloneDeep(e) {
    return JSON.parse(JSON.stringify(e));
  }
  /** @internal */
  onJoin(e) {
    this.caller.onJoin = e;
  }
  /** @internal */
  onLeave(e) {
    this.caller.onLeave = e;
  }
  /** @internal */
  onSync(e) {
    this.caller.onSync = e;
  }
  /** @internal */
  inPendingSyncState() {
    return !this.joinRef || this.joinRef !== this.channel._joinRef();
  }
}
var mc;
(function(t) {
  t.ALL = "*", t.INSERT = "INSERT", t.UPDATE = "UPDATE", t.DELETE = "DELETE";
})(mc || (mc = {}));
var xt;
(function(t) {
  t.BROADCAST = "broadcast", t.PRESENCE = "presence", t.POSTGRES_CHANGES = "postgres_changes", t.SYSTEM = "system";
})(xt || (xt = {}));
var Be;
(function(t) {
  t.SUBSCRIBED = "SUBSCRIBED", t.TIMED_OUT = "TIMED_OUT", t.CLOSED = "CLOSED", t.CHANNEL_ERROR = "CHANNEL_ERROR";
})(Be || (Be = {}));
class kt {
  /**
   * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
   *
   * The topic determines which realtime stream you are subscribing to. Config options let you
   * enable acknowledgement for broadcasts, presence tracking, or private channels.
   *
   * @example
   * ```ts
   * import RealtimeClient from '@supabase/realtime-js'
   *
   * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
   *   params: { apikey: 'public-anon-key' },
   * })
   * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
   * ```
   */
  constructor(e, r = { config: {} }, n) {
    var i, s;
    if (this.topic = e, this.params = r, this.socket = n, this.bindings = {}, this.state = me.closed, this.joinedOnce = !1, this.pushBuffer = [], this.subTopic = e.replace(/^realtime:/i, ""), this.params.config = Object.assign({
      broadcast: { ack: !1, self: !1 },
      presence: { key: "", enabled: !1 },
      private: !1
    }, r.config), this.timeout = this.socket.timeout, this.joinPush = new Bs(this, De.join, this.params, this.timeout), this.rejoinTimer = new lu(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs), this.joinPush.receive("ok", () => {
      this.state = me.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((a) => a.send()), this.pushBuffer = [];
    }), this._onClose(() => {
      this.rejoinTimer.reset(), this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`), this.state = me.closed, this.socket._remove(this);
    }), this._onError((a) => {
      this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, a), this.state = me.errored, this.rejoinTimer.scheduleTimeout());
    }), this.joinPush.receive("timeout", () => {
      this._isJoining() && (this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), this.state = me.errored, this.rejoinTimer.scheduleTimeout());
    }), this.joinPush.receive("error", (a) => {
      this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, a), this.state = me.errored, this.rejoinTimer.scheduleTimeout());
    }), this._on(De.reply, {}, (a, o) => {
      this._trigger(this._replyEventName(o), a);
    }), this.presence = new Mt(this), this.broadcastEndpointURL = hu(this.socket.endPoint), this.private = this.params.config.private || !1, !this.private && (!((s = (i = this.params.config) === null || i === void 0 ? void 0 : i.broadcast) === null || s === void 0) && s.replay))
      throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
  }
  /** Subscribe registers your client with the server */
  subscribe(e, r = this.timeout) {
    var n, i, s;
    if (this.socket.isConnected() || this.socket.connect(), this.state == me.closed) {
      const { config: { broadcast: a, presence: o, private: c } } = this.params, u = (i = (n = this.bindings.postgres_changes) === null || n === void 0 ? void 0 : n.map((h) => h.filter)) !== null && i !== void 0 ? i : [], l = !!this.bindings[xt.PRESENCE] && this.bindings[xt.PRESENCE].length > 0 || ((s = this.params.config.presence) === null || s === void 0 ? void 0 : s.enabled) === !0, m = {}, d = {
        broadcast: a,
        presence: Object.assign(Object.assign({}, o), { enabled: l }),
        postgres_changes: u,
        private: c
      };
      this.socket.accessTokenValue && (m.access_token = this.socket.accessTokenValue), this._onError((h) => e?.(Be.CHANNEL_ERROR, h)), this._onClose(() => e?.(Be.CLOSED)), this.updateJoinPayload(Object.assign({ config: d }, m)), this.joinedOnce = !0, this._rejoin(r), this.joinPush.receive("ok", async ({ postgres_changes: h }) => {
        var v;
        if (this.socket._isManualToken() || this.socket.setAuth(), h === void 0) {
          e?.(Be.SUBSCRIBED);
          return;
        } else {
          const w = this.bindings.postgres_changes, p = (v = w?.length) !== null && v !== void 0 ? v : 0, _ = [];
          for (let f = 0; f < p; f++) {
            const g = w[f], { filter: { event: S, schema: b, table: $, filter: T } } = g, I = h && h[f];
            if (I && I.event === S && kt.isFilterValueEqual(I.schema, b) && kt.isFilterValueEqual(I.table, $) && kt.isFilterValueEqual(I.filter, T))
              _.push(Object.assign(Object.assign({}, g), { id: I.id }));
            else {
              this.unsubscribe(), this.state = me.errored, e?.(Be.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
              return;
            }
          }
          this.bindings.postgres_changes = _, e && e(Be.SUBSCRIBED);
          return;
        }
      }).receive("error", (h) => {
        this.state = me.errored, e?.(Be.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(h).join(", ") || "error")));
      }).receive("timeout", () => {
        e?.(Be.TIMED_OUT);
      });
    }
    return this;
  }
  /**
   * Returns the current presence state for this channel.
   *
   * The shape is a map keyed by presence key (for example a user id) where each entry contains the
   * tracked metadata for that user.
   */
  presenceState() {
    return this.presence.state;
  }
  /**
   * Sends the supplied payload to the presence tracker so other subscribers can see that this
   * client is online. Use `untrack` to stop broadcasting presence for the same key.
   */
  async track(e, r = {}) {
    return await this.send({
      type: "presence",
      event: "track",
      payload: e
    }, r.timeout || this.timeout);
  }
  /**
   * Removes the current presence state for this client.
   */
  async untrack(e = {}) {
    return await this.send({
      type: "presence",
      event: "untrack"
    }, e);
  }
  on(e, r, n) {
    return this.state === me.joined && e === xt.PRESENCE && (this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`), this.unsubscribe().then(async () => await this.subscribe())), this._on(e, r, n);
  }
  /**
   * Sends a broadcast message explicitly via REST API.
   *
   * This method always uses the REST API endpoint regardless of WebSocket connection state.
   * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
   *
   * @param event The name of the broadcast event
   * @param payload Payload to be sent (required)
   * @param opts Options including timeout
   * @returns Promise resolving to object with success status, and error details if failed
   */
  async httpSend(e, r, n = {}) {
    var i;
    if (r == null)
      return Promise.reject("Payload is required for httpSend()");
    const s = {
      apikey: this.socket.apiKey ? this.socket.apiKey : "",
      "Content-Type": "application/json"
    };
    this.socket.accessTokenValue && (s.Authorization = `Bearer ${this.socket.accessTokenValue}`);
    const a = {
      method: "POST",
      headers: s,
      body: JSON.stringify({
        messages: [
          {
            topic: this.subTopic,
            event: e,
            payload: r,
            private: this.private
          }
        ]
      })
    }, o = await this._fetchWithTimeout(this.broadcastEndpointURL, a, (i = n.timeout) !== null && i !== void 0 ? i : this.timeout);
    if (o.status === 202)
      return { success: !0 };
    let c = o.statusText;
    try {
      const u = await o.json();
      c = u.error || u.message || c;
    } catch {
    }
    return Promise.reject(new Error(c));
  }
  /**
   * Sends a message into the channel.
   *
   * @param args Arguments to send to channel
   * @param args.type The type of event to send
   * @param args.event The name of the event being sent
   * @param args.payload Payload to be sent
   * @param opts Options to be used during the send process
   */
  async send(e, r = {}) {
    var n, i;
    if (!this._canPush() && e.type === "broadcast") {
      console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
      const { event: s, payload: a } = e, o = {
        apikey: this.socket.apiKey ? this.socket.apiKey : "",
        "Content-Type": "application/json"
      };
      this.socket.accessTokenValue && (o.Authorization = `Bearer ${this.socket.accessTokenValue}`);
      const c = {
        method: "POST",
        headers: o,
        body: JSON.stringify({
          messages: [
            {
              topic: this.subTopic,
              event: s,
              payload: a,
              private: this.private
            }
          ]
        })
      };
      try {
        const u = await this._fetchWithTimeout(this.broadcastEndpointURL, c, (n = r.timeout) !== null && n !== void 0 ? n : this.timeout);
        return await ((i = u.body) === null || i === void 0 ? void 0 : i.cancel()), u.ok ? "ok" : "error";
      } catch (u) {
        return u.name === "AbortError" ? "timed out" : "error";
      }
    } else
      return new Promise((s) => {
        var a, o, c;
        const u = this._push(e.type, e, r.timeout || this.timeout);
        e.type === "broadcast" && !(!((c = (o = (a = this.params) === null || a === void 0 ? void 0 : a.config) === null || o === void 0 ? void 0 : o.broadcast) === null || c === void 0) && c.ack) && s("ok"), u.receive("ok", () => s("ok")), u.receive("error", () => s("error")), u.receive("timeout", () => s("timed out"));
      });
  }
  /**
   * Updates the payload that will be sent the next time the channel joins (reconnects).
   * Useful for rotating access tokens or updating config without re-creating the channel.
   */
  updateJoinPayload(e) {
    this.joinPush.updatePayload(e);
  }
  /**
   * Leaves the channel.
   *
   * Unsubscribes from server events, and instructs channel to terminate on server.
   * Triggers onClose() hooks.
   *
   * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
   * channel.unsubscribe().receive("ok", () => alert("left!") )
   */
  unsubscribe(e = this.timeout) {
    this.state = me.leaving;
    const r = () => {
      this.socket.log("channel", `leave ${this.topic}`), this._trigger(De.close, "leave", this._joinRef());
    };
    this.joinPush.destroy();
    let n = null;
    return new Promise((i) => {
      n = new Bs(this, De.leave, {}, e), n.receive("ok", () => {
        r(), i("ok");
      }).receive("timeout", () => {
        r(), i("timed out");
      }).receive("error", () => {
        i("error");
      }), n.send(), this._canPush() || n.trigger("ok", {});
    }).finally(() => {
      n?.destroy();
    });
  }
  /**
   * Teardown the channel.
   *
   * Destroys and stops related timers.
   */
  teardown() {
    this.pushBuffer.forEach((e) => e.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = me.closed, this.bindings = {};
  }
  /** @internal */
  async _fetchWithTimeout(e, r, n) {
    const i = new AbortController(), s = setTimeout(() => i.abort(), n), a = await this.socket.fetch(e, Object.assign(Object.assign({}, r), { signal: i.signal }));
    return clearTimeout(s), a;
  }
  /** @internal */
  _push(e, r, n = this.timeout) {
    if (!this.joinedOnce)
      throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
    let i = new Bs(this, e, r, n);
    return this._canPush() ? i.send() : this._addToPushBuffer(i), i;
  }
  /** @internal */
  _addToPushBuffer(e) {
    if (e.startTimeout(), this.pushBuffer.push(e), this.pushBuffer.length > Uf) {
      const r = this.pushBuffer.shift();
      r && (r.destroy(), this.socket.log("channel", `discarded push due to buffer overflow: ${r.event}`, r.payload));
    }
  }
  /**
   * Overridable message hook
   *
   * Receives all events for specialized message handling before dispatching to the channel callbacks.
   * Must return the payload, modified or unmodified.
   *
   * @internal
   */
  _onMessage(e, r, n) {
    return r;
  }
  /** @internal */
  _isMember(e) {
    return this.topic === e;
  }
  /** @internal */
  _joinRef() {
    return this.joinPush.ref;
  }
  /** @internal */
  _trigger(e, r, n) {
    var i, s;
    const a = e.toLocaleLowerCase(), { close: o, error: c, leave: u, join: l } = De;
    if (n && [o, c, u, l].indexOf(a) >= 0 && n !== this._joinRef())
      return;
    let d = this._onMessage(a, r, n);
    if (r && !d)
      throw "channel onMessage callbacks must return the payload, modified or unmodified";
    ["insert", "update", "delete"].includes(a) ? (i = this.bindings.postgres_changes) === null || i === void 0 || i.filter((h) => {
      var v, w, p;
      return ((v = h.filter) === null || v === void 0 ? void 0 : v.event) === "*" || ((p = (w = h.filter) === null || w === void 0 ? void 0 : w.event) === null || p === void 0 ? void 0 : p.toLocaleLowerCase()) === a;
    }).map((h) => h.callback(d, n)) : (s = this.bindings[a]) === null || s === void 0 || s.filter((h) => {
      var v, w, p, _, f, g;
      if (["broadcast", "presence", "postgres_changes"].includes(a))
        if ("id" in h) {
          const S = h.id, b = (v = h.filter) === null || v === void 0 ? void 0 : v.event;
          return S && ((w = r.ids) === null || w === void 0 ? void 0 : w.includes(S)) && (b === "*" || b?.toLocaleLowerCase() === ((p = r.data) === null || p === void 0 ? void 0 : p.type.toLocaleLowerCase()));
        } else {
          const S = (f = (_ = h?.filter) === null || _ === void 0 ? void 0 : _.event) === null || f === void 0 ? void 0 : f.toLocaleLowerCase();
          return S === "*" || S === ((g = r?.event) === null || g === void 0 ? void 0 : g.toLocaleLowerCase());
        }
      else
        return h.type.toLocaleLowerCase() === a;
    }).map((h) => {
      if (typeof d == "object" && "ids" in d) {
        const v = d.data, { schema: w, table: p, commit_timestamp: _, type: f, errors: g } = v;
        d = Object.assign(Object.assign({}, {
          schema: w,
          table: p,
          commit_timestamp: _,
          eventType: f,
          new: {},
          old: {},
          errors: g
        }), this._getPayloadRecords(v));
      }
      h.callback(d, n);
    });
  }
  /** @internal */
  _isClosed() {
    return this.state === me.closed;
  }
  /** @internal */
  _isJoined() {
    return this.state === me.joined;
  }
  /** @internal */
  _isJoining() {
    return this.state === me.joining;
  }
  /** @internal */
  _isLeaving() {
    return this.state === me.leaving;
  }
  /** @internal */
  _replyEventName(e) {
    return `chan_reply_${e}`;
  }
  /** @internal */
  _on(e, r, n) {
    const i = e.toLocaleLowerCase(), s = {
      type: i,
      filter: r,
      callback: n
    };
    return this.bindings[i] ? this.bindings[i].push(s) : this.bindings[i] = [s], this;
  }
  /** @internal */
  _off(e, r) {
    const n = e.toLocaleLowerCase();
    return this.bindings[n] && (this.bindings[n] = this.bindings[n].filter((i) => {
      var s;
      return !(((s = i.type) === null || s === void 0 ? void 0 : s.toLocaleLowerCase()) === n && kt.isEqual(i.filter, r));
    })), this;
  }
  /** @internal */
  static isEqual(e, r) {
    if (Object.keys(e).length !== Object.keys(r).length)
      return !1;
    for (const n in e)
      if (e[n] !== r[n])
        return !1;
    return !0;
  }
  /**
   * Compares two optional filter values for equality.
   * Treats undefined, null, and empty string as equivalent empty values.
   * @internal
   */
  static isFilterValueEqual(e, r) {
    return (e ?? void 0) === (r ?? void 0);
  }
  /** @internal */
  _rejoinUntilConnected() {
    this.rejoinTimer.scheduleTimeout(), this.socket.isConnected() && this._rejoin();
  }
  /**
   * Registers a callback that will be executed when the channel closes.
   *
   * @internal
   */
  _onClose(e) {
    this._on(De.close, {}, e);
  }
  /**
   * Registers a callback that will be executed when the channel encounteres an error.
   *
   * @internal
   */
  _onError(e) {
    this._on(De.error, {}, (r) => e(r));
  }
  /**
   * Returns `true` if the socket is connected and the channel has been joined.
   *
   * @internal
   */
  _canPush() {
    return this.socket.isConnected() && this._isJoined();
  }
  /** @internal */
  _rejoin(e = this.timeout) {
    this._isLeaving() || (this.socket._leaveOpenTopic(this.topic), this.state = me.joining, this.joinPush.resend(e));
  }
  /** @internal */
  _getPayloadRecords(e) {
    const r = {
      new: {},
      old: {}
    };
    return (e.type === "INSERT" || e.type === "UPDATE") && (r.new = fc(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (r.old = fc(e.columns, e.old_record)), r;
  }
}
const Ks = () => {
}, rn = {
  HEARTBEAT_INTERVAL: 25e3,
  RECONNECT_DELAY: 10,
  HEARTBEAT_TIMEOUT_FALLBACK: 100
}, Gf = [1e3, 2e3, 5e3, 1e4], Hf = 1e4, Wf = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class Jf {
  /**
   * Initializes the Socket.
   *
   * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
   * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
   * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
   * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
   * @param options.params The optional params to pass when connecting.
   * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
   * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
   * @param options.heartbeatCallback The optional function to handle heartbeat status and latency.
   * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
   * @param options.logLevel Sets the log level for Realtime
   * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
   * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
   * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
   * @param options.worker Use Web Worker to set a side flow. Defaults to false.
   * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
   * @param options.vsn The protocol version to use when connecting. Supported versions are "1.0.0" and "2.0.0". Defaults to "2.0.0".
   * @example
   * ```ts
   * import RealtimeClient from '@supabase/realtime-js'
   *
   * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
   *   params: { apikey: 'public-anon-key' },
   * })
   * client.connect()
   * ```
   */
  constructor(e, r) {
    var n;
    if (this.accessTokenValue = null, this.apiKey = null, this._manuallySetToken = !1, this.channels = new Array(), this.endPoint = "", this.httpEndpoint = "", this.headers = {}, this.params = {}, this.timeout = ti, this.transport = null, this.heartbeatIntervalMs = rn.HEARTBEAT_INTERVAL, this.heartbeatTimer = void 0, this.pendingHeartbeatRef = null, this.heartbeatCallback = Ks, this.ref = 0, this.reconnectTimer = null, this.vsn = hc, this.logger = Ks, this.conn = null, this.sendBuffer = [], this.serializer = new Mf(), this.stateChangeCallbacks = {
      open: [],
      close: [],
      error: [],
      message: []
    }, this.accessToken = null, this._connectionState = "disconnected", this._wasManualDisconnect = !1, this._authPromise = null, this._heartbeatSentAt = null, this._resolveFetch = (i) => i ? (...s) => i(...s) : (...s) => fetch(...s), !(!((n = r?.params) === null || n === void 0) && n.apikey))
      throw new Error("API key is required to connect to Realtime");
    this.apiKey = r.params.apikey, this.endPoint = `${e}/${ri.websocket}`, this.httpEndpoint = hu(e), this._initializeOptions(r), this._setupReconnectionTimer(), this.fetch = this._resolveFetch(r?.fetch);
  }
  /**
   * Connects the socket, unless already connected.
   */
  connect() {
    if (!(this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected())) {
      if (this._setConnectionState("connecting"), this.accessToken && !this._authPromise && this._setAuthSafely("connect"), this.transport)
        this.conn = new this.transport(this.endpointURL());
      else
        try {
          this.conn = Nf.createWebSocket(this.endpointURL());
        } catch (e) {
          this._setConnectionState("disconnected");
          const r = e.message;
          throw r.includes("Node.js") ? new Error(`${r}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`) : new Error(`WebSocket not available: ${r}`);
        }
      this._setupConnectionHandlers();
    }
  }
  /**
   * Returns the URL of the websocket.
   * @returns string The URL of the websocket.
   */
  endpointURL() {
    return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: this.vsn }));
  }
  /**
   * Disconnects the socket.
   *
   * @param code A numeric status code to send on disconnect.
   * @param reason A custom reason for the disconnect.
   */
  disconnect(e, r) {
    if (!this.isDisconnecting())
      if (this._setConnectionState("disconnecting", !0), this.conn) {
        const n = setTimeout(() => {
          this._setConnectionState("disconnected");
        }, 100);
        this.conn.onclose = () => {
          clearTimeout(n), this._setConnectionState("disconnected");
        }, typeof this.conn.close == "function" && (e ? this.conn.close(e, r ?? "") : this.conn.close()), this._teardownConnection();
      } else
        this._setConnectionState("disconnected");
  }
  /**
   * Returns all created channels
   */
  getChannels() {
    return this.channels;
  }
  /**
   * Unsubscribes and removes a single channel
   * @param channel A RealtimeChannel instance
   */
  async removeChannel(e) {
    const r = await e.unsubscribe();
    return this.channels.length === 0 && this.disconnect(), r;
  }
  /**
   * Unsubscribes and removes all channels
   */
  async removeAllChannels() {
    const e = await Promise.all(this.channels.map((r) => r.unsubscribe()));
    return this.channels = [], this.disconnect(), e;
  }
  /**
   * Logs the message.
   *
   * For customized logging, `this.logger` can be overridden.
   */
  log(e, r, n) {
    this.logger(e, r, n);
  }
  /**
   * Returns the current state of the socket.
   */
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case Qe.connecting:
        return ct.Connecting;
      case Qe.open:
        return ct.Open;
      case Qe.closing:
        return ct.Closing;
      default:
        return ct.Closed;
    }
  }
  /**
   * Returns `true` is the connection is open.
   */
  isConnected() {
    return this.connectionState() === ct.Open;
  }
  /**
   * Returns `true` if the connection is currently connecting.
   */
  isConnecting() {
    return this._connectionState === "connecting";
  }
  /**
   * Returns `true` if the connection is currently disconnecting.
   */
  isDisconnecting() {
    return this._connectionState === "disconnecting";
  }
  /**
   * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
   *
   * Topics are automatically prefixed with `realtime:` to match the Realtime service.
   * If a channel with the same topic already exists it will be returned instead of creating
   * a duplicate connection.
   */
  channel(e, r = { config: {} }) {
    const n = `realtime:${e}`, i = this.getChannels().find((s) => s.topic === n);
    if (i)
      return i;
    {
      const s = new kt(`realtime:${e}`, r, this);
      return this.channels.push(s), s;
    }
  }
  /**
   * Push out a message if the socket is connected.
   *
   * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
   */
  push(e) {
    const { topic: r, event: n, payload: i, ref: s } = e, a = () => {
      this.encode(e, (o) => {
        var c;
        (c = this.conn) === null || c === void 0 || c.send(o);
      });
    };
    this.log("push", `${r} ${n} (${s})`, i), this.isConnected() ? a() : this.sendBuffer.push(a);
  }
  /**
   * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
   *
   * If param is null it will use the `accessToken` callback function or the token set on the client.
   *
   * On callback used, it will set the value of the token internal to the client.
   *
   * When a token is explicitly provided, it will be preserved across channel operations
   * (including removeChannel and resubscribe). The `accessToken` callback will not be
   * invoked until `setAuth()` is called without arguments.
   *
   * @param token A JWT string to override the token set on the client.
   *
   * @example
   * // Use a manual token (preserved across resubscribes, ignores accessToken callback)
   * client.realtime.setAuth('my-custom-jwt')
   *
   * // Switch back to using the accessToken callback
   * client.realtime.setAuth()
   */
  async setAuth(e = null) {
    this._authPromise = this._performAuth(e);
    try {
      await this._authPromise;
    } finally {
      this._authPromise = null;
    }
  }
  /**
   * Returns true if the current access token was explicitly set via setAuth(token),
   * false if it was obtained via the accessToken callback.
   * @internal
   */
  _isManualToken() {
    return this._manuallySetToken;
  }
  /**
   * Sends a heartbeat message if the socket is connected.
   */
  async sendHeartbeat() {
    var e;
    if (!this.isConnected()) {
      try {
        this.heartbeatCallback("disconnected");
      } catch (r) {
        this.log("error", "error in heartbeat callback", r);
      }
      return;
    }
    if (this.pendingHeartbeatRef) {
      this.pendingHeartbeatRef = null, this._heartbeatSentAt = null, this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
      try {
        this.heartbeatCallback("timeout");
      } catch (r) {
        this.log("error", "error in heartbeat callback", r);
      }
      this._wasManualDisconnect = !1, (e = this.conn) === null || e === void 0 || e.close(qf, "heartbeat timeout"), setTimeout(() => {
        var r;
        this.isConnected() || (r = this.reconnectTimer) === null || r === void 0 || r.scheduleTimeout();
      }, rn.HEARTBEAT_TIMEOUT_FALLBACK);
      return;
    }
    this._heartbeatSentAt = Date.now(), this.pendingHeartbeatRef = this._makeRef(), this.push({
      topic: "phoenix",
      event: "heartbeat",
      payload: {},
      ref: this.pendingHeartbeatRef
    });
    try {
      this.heartbeatCallback("sent");
    } catch (r) {
      this.log("error", "error in heartbeat callback", r);
    }
    this._setAuthSafely("heartbeat");
  }
  /**
   * Sets a callback that receives lifecycle events for internal heartbeat messages.
   * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
   */
  onHeartbeat(e) {
    this.heartbeatCallback = e;
  }
  /**
   * Flushes send buffer
   */
  flushSendBuffer() {
    this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((e) => e()), this.sendBuffer = []);
  }
  /**
   * Return the next message ref, accounting for overflows
   *
   * @internal
   */
  _makeRef() {
    let e = this.ref + 1;
    return e === this.ref ? this.ref = 0 : this.ref = e, this.ref.toString();
  }
  /**
   * Unsubscribe from channels with the specified topic.
   *
   * @internal
   */
  _leaveOpenTopic(e) {
    let r = this.channels.find((n) => n.topic === e && (n._isJoined() || n._isJoining()));
    r && (this.log("transport", `leaving duplicate topic "${e}"`), r.unsubscribe());
  }
  /**
   * Removes a subscription from the socket.
   *
   * @param channel An open subscription.
   *
   * @internal
   */
  _remove(e) {
    this.channels = this.channels.filter((r) => r.topic !== e.topic);
  }
  /** @internal */
  _onConnMessage(e) {
    this.decode(e.data, (r) => {
      if (r.topic === "phoenix" && r.event === "phx_reply" && r.ref && r.ref === this.pendingHeartbeatRef) {
        const u = this._heartbeatSentAt ? Date.now() - this._heartbeatSentAt : void 0;
        try {
          this.heartbeatCallback(r.payload.status === "ok" ? "ok" : "error", u);
        } catch (l) {
          this.log("error", "error in heartbeat callback", l);
        }
        this._heartbeatSentAt = null, this.pendingHeartbeatRef = null;
      }
      const { topic: n, event: i, payload: s, ref: a } = r, o = a ? `(${a})` : "", c = s.status || "";
      this.log("receive", `${c} ${n} ${i} ${o}`.trim(), s), this.channels.filter((u) => u._isMember(n)).forEach((u) => u._trigger(i, s, a)), this._triggerStateCallbacks("message", r);
    });
  }
  /**
   * Clear specific timer
   * @internal
   */
  _clearTimer(e) {
    var r;
    e === "heartbeat" && this.heartbeatTimer ? (clearInterval(this.heartbeatTimer), this.heartbeatTimer = void 0) : e === "reconnect" && ((r = this.reconnectTimer) === null || r === void 0 || r.reset());
  }
  /**
   * Clear all timers
   * @internal
   */
  _clearAllTimers() {
    this._clearTimer("heartbeat"), this._clearTimer("reconnect");
  }
  /**
   * Setup connection handlers for WebSocket events
   * @internal
   */
  _setupConnectionHandlers() {
    this.conn && ("binaryType" in this.conn && (this.conn.binaryType = "arraybuffer"), this.conn.onopen = () => this._onConnOpen(), this.conn.onerror = (e) => this._onConnError(e), this.conn.onmessage = (e) => this._onConnMessage(e), this.conn.onclose = (e) => this._onConnClose(e), this.conn.readyState === Qe.open && this._onConnOpen());
  }
  /**
   * Teardown connection and cleanup resources
   * @internal
   */
  _teardownConnection() {
    if (this.conn) {
      if (this.conn.readyState === Qe.open || this.conn.readyState === Qe.connecting)
        try {
          this.conn.close();
        } catch (e) {
          this.log("error", "Error closing connection", e);
        }
      this.conn.onopen = null, this.conn.onerror = null, this.conn.onmessage = null, this.conn.onclose = null, this.conn = null;
    }
    this._clearAllTimers(), this._terminateWorker(), this.channels.forEach((e) => e.teardown());
  }
  /** @internal */
  _onConnOpen() {
    this._setConnectionState("connected"), this.log("transport", `connected to ${this.endpointURL()}`), (this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve())).then(() => {
      this.flushSendBuffer();
    }).catch((r) => {
      this.log("error", "error waiting for auth on connect", r), this.flushSendBuffer();
    }), this._clearTimer("reconnect"), this.worker ? this.workerRef || this._startWorkerHeartbeat() : this._startHeartbeat(), this._triggerStateCallbacks("open");
  }
  /** @internal */
  _startHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
  }
  /** @internal */
  _startWorkerHeartbeat() {
    this.workerUrl ? this.log("worker", `starting worker for from ${this.workerUrl}`) : this.log("worker", "starting default worker");
    const e = this._workerObjectUrl(this.workerUrl);
    this.workerRef = new Worker(e), this.workerRef.onerror = (r) => {
      this.log("worker", "worker error", r.message), this._terminateWorker();
    }, this.workerRef.onmessage = (r) => {
      r.data.event === "keepAlive" && this.sendHeartbeat();
    }, this.workerRef.postMessage({
      event: "start",
      interval: this.heartbeatIntervalMs
    });
  }
  /**
   * Terminate the Web Worker and clear the reference
   * @internal
   */
  _terminateWorker() {
    this.workerRef && (this.log("worker", "terminating worker"), this.workerRef.terminate(), this.workerRef = void 0);
  }
  /** @internal */
  _onConnClose(e) {
    var r;
    this._setConnectionState("disconnected"), this.log("transport", "close", e), this._triggerChanError(), this._clearTimer("heartbeat"), this._wasManualDisconnect || (r = this.reconnectTimer) === null || r === void 0 || r.scheduleTimeout(), this._triggerStateCallbacks("close", e);
  }
  /** @internal */
  _onConnError(e) {
    this._setConnectionState("disconnected"), this.log("transport", `${e}`), this._triggerChanError(), this._triggerStateCallbacks("error", e);
    try {
      this.heartbeatCallback("error");
    } catch (r) {
      this.log("error", "error in heartbeat callback", r);
    }
  }
  /** @internal */
  _triggerChanError() {
    this.channels.forEach((e) => e._trigger(De.error));
  }
  /** @internal */
  _appendParams(e, r) {
    if (Object.keys(r).length === 0)
      return e;
    const n = e.match(/\?/) ? "&" : "?", i = new URLSearchParams(r);
    return `${e}${n}${i}`;
  }
  _workerObjectUrl(e) {
    let r;
    if (e)
      r = e;
    else {
      const n = new Blob([Wf], { type: "application/javascript" });
      r = URL.createObjectURL(n);
    }
    return r;
  }
  /**
   * Set connection state with proper state management
   * @internal
   */
  _setConnectionState(e, r = !1) {
    this._connectionState = e, e === "connecting" ? this._wasManualDisconnect = !1 : e === "disconnecting" && (this._wasManualDisconnect = r);
  }
  /**
   * Perform the actual auth operation
   * @internal
   */
  async _performAuth(e = null) {
    let r, n = !1;
    if (e)
      r = e, n = !0;
    else if (this.accessToken)
      try {
        r = await this.accessToken();
      } catch (i) {
        this.log("error", "Error fetching access token from callback", i), r = this.accessTokenValue;
      }
    else
      r = this.accessTokenValue;
    n ? this._manuallySetToken = !0 : this.accessToken && (this._manuallySetToken = !1), this.accessTokenValue != r && (this.accessTokenValue = r, this.channels.forEach((i) => {
      const s = {
        access_token: r,
        version: Df
      };
      r && i.updateJoinPayload(s), i.joinedOnce && i._isJoined() && i._push(De.access_token, {
        access_token: r
      });
    }));
  }
  /**
   * Wait for any in-flight auth operations to complete
   * @internal
   */
  async _waitForAuthIfNeeded() {
    this._authPromise && await this._authPromise;
  }
  /**
   * Safely call setAuth with standardized error handling
   * @internal
   */
  _setAuthSafely(e = "general") {
    this._isManualToken() || this.setAuth().catch((r) => {
      this.log("error", `Error setting auth in ${e}`, r);
    });
  }
  /**
   * Trigger state change callbacks with proper error handling
   * @internal
   */
  _triggerStateCallbacks(e, r) {
    try {
      this.stateChangeCallbacks[e].forEach((n) => {
        try {
          n(r);
        } catch (i) {
          this.log("error", `error in ${e} callback`, i);
        }
      });
    } catch (n) {
      this.log("error", `error triggering ${e} callbacks`, n);
    }
  }
  /**
   * Setup reconnection timer with proper configuration
   * @internal
   */
  _setupReconnectionTimer() {
    this.reconnectTimer = new lu(async () => {
      setTimeout(async () => {
        await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
      }, rn.RECONNECT_DELAY);
    }, this.reconnectAfterMs);
  }
  /**
   * Initialize client options with defaults
   * @internal
   */
  _initializeOptions(e) {
    var r, n, i, s, a, o, c, u, l, m, d, h;
    switch (this.transport = (r = e?.transport) !== null && r !== void 0 ? r : null, this.timeout = (n = e?.timeout) !== null && n !== void 0 ? n : ti, this.heartbeatIntervalMs = (i = e?.heartbeatIntervalMs) !== null && i !== void 0 ? i : rn.HEARTBEAT_INTERVAL, this.worker = (s = e?.worker) !== null && s !== void 0 ? s : !1, this.accessToken = (a = e?.accessToken) !== null && a !== void 0 ? a : null, this.heartbeatCallback = (o = e?.heartbeatCallback) !== null && o !== void 0 ? o : Ks, this.vsn = (c = e?.vsn) !== null && c !== void 0 ? c : hc, e?.params && (this.params = e.params), e?.logger && (this.logger = e.logger), (e?.logLevel || e?.log_level) && (this.logLevel = e.logLevel || e.log_level, this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel })), this.reconnectAfterMs = (u = e?.reconnectAfterMs) !== null && u !== void 0 ? u : ((v) => Gf[v - 1] || Hf), this.vsn) {
      case Lf:
        this.encode = (l = e?.encode) !== null && l !== void 0 ? l : ((v, w) => w(JSON.stringify(v))), this.decode = (m = e?.decode) !== null && m !== void 0 ? m : ((v, w) => w(JSON.parse(v)));
        break;
      case uu:
        this.encode = (d = e?.encode) !== null && d !== void 0 ? d : this.serializer.encode.bind(this.serializer), this.decode = (h = e?.decode) !== null && h !== void 0 ? h : this.serializer.decode.bind(this.serializer);
        break;
      default:
        throw new Error(`Unsupported serializer version: ${this.vsn}`);
    }
    if (this.worker) {
      if (typeof window < "u" && !window.Worker)
        throw new Error("Web Worker is not supported");
      this.workerUrl = e?.workerUrl;
    }
  }
}
var Vt = class extends Error {
  constructor(t, e) {
    super(t), this.name = "IcebergError", this.status = e.status, this.icebergType = e.icebergType, this.icebergCode = e.icebergCode, this.details = e.details, this.isCommitStateUnknown = e.icebergType === "CommitStateUnknownException" || [500, 502, 504].includes(e.status) && e.icebergType?.includes("CommitState") === !0;
  }
  /**
   * Returns true if the error is a 404 Not Found error.
   */
  isNotFound() {
    return this.status === 404;
  }
  /**
   * Returns true if the error is a 409 Conflict error.
   */
  isConflict() {
    return this.status === 409;
  }
  /**
   * Returns true if the error is a 419 Authentication Timeout error.
   */
  isAuthenticationTimeout() {
    return this.status === 419;
  }
};
function Xf(t, e, r) {
  const n = new URL(e, t);
  if (r)
    for (const [i, s] of Object.entries(r))
      s !== void 0 && n.searchParams.set(i, s);
  return n.toString();
}
async function Yf(t) {
  return !t || t.type === "none" ? {} : t.type === "bearer" ? { Authorization: `Bearer ${t.token}` } : t.type === "header" ? { [t.name]: t.value } : t.type === "custom" ? await t.getHeaders() : {};
}
function Qf(t) {
  const e = t.fetchImpl ?? globalThis.fetch;
  return {
    async request({
      method: r,
      path: n,
      query: i,
      body: s,
      headers: a
    }) {
      const o = Xf(t.baseUrl, n, i), c = await Yf(t.auth), u = await e(o, {
        method: r,
        headers: {
          ...s ? { "Content-Type": "application/json" } : {},
          ...c,
          ...a
        },
        body: s ? JSON.stringify(s) : void 0
      }), l = await u.text(), m = (u.headers.get("content-type") || "").includes("application/json"), d = m && l ? JSON.parse(l) : l;
      if (!u.ok) {
        const h = m ? d : void 0, v = h?.error;
        throw new Vt(
          v?.message ?? `Request failed with status ${u.status}`,
          {
            status: u.status,
            icebergType: v?.type,
            icebergCode: v?.code,
            details: h
          }
        );
      }
      return { status: u.status, headers: u.headers, data: d };
    }
  };
}
function nn(t) {
  return t.join("");
}
var Zf = class {
  constructor(t, e = "") {
    this.client = t, this.prefix = e;
  }
  async listNamespaces(t) {
    const e = t ? { parent: nn(t.namespace) } : void 0;
    return (await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces`,
      query: e
    })).data.namespaces.map((n) => ({ namespace: n }));
  }
  async createNamespace(t, e) {
    const r = {
      namespace: t.namespace,
      properties: e?.properties
    };
    return (await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces`,
      body: r
    })).data;
  }
  async dropNamespace(t) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${nn(t.namespace)}`
    });
  }
  async loadNamespaceMetadata(t) {
    return {
      properties: (await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${nn(t.namespace)}`
      })).data.properties
    };
  }
  async namespaceExists(t) {
    try {
      return await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${nn(t.namespace)}`
      }), !0;
    } catch (e) {
      if (e instanceof Vt && e.status === 404)
        return !1;
      throw e;
    }
  }
  async createNamespaceIfNotExists(t, e) {
    try {
      return await this.createNamespace(t, e);
    } catch (r) {
      if (r instanceof Vt && r.status === 409)
        return;
      throw r;
    }
  }
};
function vt(t) {
  return t.join("");
}
var ep = class {
  constructor(t, e = "", r) {
    this.client = t, this.prefix = e, this.accessDelegation = r;
  }
  async listTables(t) {
    return (await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${vt(t.namespace)}/tables`
    })).data.identifiers;
  }
  async createTable(t, e) {
    const r = {};
    return this.accessDelegation && (r["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${vt(t.namespace)}/tables`,
      body: e,
      headers: r
    })).data.metadata;
  }
  async updateTable(t, e) {
    const r = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${vt(t.namespace)}/tables/${t.name}`,
      body: e
    });
    return {
      "metadata-location": r.data["metadata-location"],
      metadata: r.data.metadata
    };
  }
  async dropTable(t, e) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${vt(t.namespace)}/tables/${t.name}`,
      query: { purgeRequested: String(e?.purge ?? !1) }
    });
  }
  async loadTable(t) {
    const e = {};
    return this.accessDelegation && (e["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${vt(t.namespace)}/tables/${t.name}`,
      headers: e
    })).data.metadata;
  }
  async tableExists(t) {
    const e = {};
    this.accessDelegation && (e["X-Iceberg-Access-Delegation"] = this.accessDelegation);
    try {
      return await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${vt(t.namespace)}/tables/${t.name}`,
        headers: e
      }), !0;
    } catch (r) {
      if (r instanceof Vt && r.status === 404)
        return !1;
      throw r;
    }
  }
  async createTableIfNotExists(t, e) {
    try {
      return await this.createTable(t, e);
    } catch (r) {
      if (r instanceof Vt && r.status === 409)
        return await this.loadTable({ namespace: t.namespace, name: e.name });
      throw r;
    }
  }
}, tp = class {
  /**
   * Creates a new Iceberg REST Catalog client.
   *
   * @param options - Configuration options for the catalog client
   */
  constructor(t) {
    let e = "v1";
    t.catalogName && (e += `/${t.catalogName}`);
    const r = t.baseUrl.endsWith("/") ? t.baseUrl : `${t.baseUrl}/`;
    this.client = Qf({
      baseUrl: r,
      auth: t.auth,
      fetchImpl: t.fetch
    }), this.accessDelegation = t.accessDelegation?.join(","), this.namespaceOps = new Zf(this.client, e), this.tableOps = new ep(this.client, e, this.accessDelegation);
  }
  /**
   * Lists all namespaces in the catalog.
   *
   * @param parent - Optional parent namespace to list children under
   * @returns Array of namespace identifiers
   *
   * @example
   * ```typescript
   * // List all top-level namespaces
   * const namespaces = await catalog.listNamespaces();
   *
   * // List namespaces under a parent
   * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
   * ```
   */
  async listNamespaces(t) {
    return this.namespaceOps.listNamespaces(t);
  }
  /**
   * Creates a new namespace in the catalog.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespace(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * console.log(response.namespace); // ['analytics']
   * console.log(response.properties); // { owner: 'data-team', ... }
   * ```
   */
  async createNamespace(t, e) {
    return this.namespaceOps.createNamespace(t, e);
  }
  /**
   * Drops a namespace from the catalog.
   *
   * The namespace must be empty (contain no tables) before it can be dropped.
   *
   * @param id - Namespace identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropNamespace({ namespace: ['analytics'] });
   * ```
   */
  async dropNamespace(t) {
    await this.namespaceOps.dropNamespace(t);
  }
  /**
   * Loads metadata for a namespace.
   *
   * @param id - Namespace identifier to load
   * @returns Namespace metadata including properties
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
   * console.log(metadata.properties);
   * ```
   */
  async loadNamespaceMetadata(t) {
    return this.namespaceOps.loadNamespaceMetadata(t);
  }
  /**
   * Lists all tables in a namespace.
   *
   * @param namespace - Namespace identifier to list tables from
   * @returns Array of table identifiers
   *
   * @example
   * ```typescript
   * const tables = await catalog.listTables({ namespace: ['analytics'] });
   * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
   * ```
   */
  async listTables(t) {
    return this.tableOps.listTables(t);
  }
  /**
   * Creates a new table in the catalog.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTable(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: [
   *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
   *       ]
   *     }
   *   }
   * );
   * ```
   */
  async createTable(t, e) {
    return this.tableOps.createTable(t, e);
  }
  /**
   * Updates an existing table's metadata.
   *
   * Can update the schema, partition spec, or properties of a table.
   *
   * @param id - Table identifier to update
   * @param request - Update request with fields to modify
   * @returns Response containing the metadata location and updated table metadata
   *
   * @example
   * ```typescript
   * const response = await catalog.updateTable(
   *   { namespace: ['analytics'], name: 'events' },
   *   {
   *     properties: { 'read.split.target-size': '134217728' }
   *   }
   * );
   * console.log(response['metadata-location']); // s3://...
   * console.log(response.metadata); // TableMetadata object
   * ```
   */
  async updateTable(t, e) {
    return this.tableOps.updateTable(t, e);
  }
  /**
   * Drops a table from the catalog.
   *
   * @param id - Table identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
   * ```
   */
  async dropTable(t, e) {
    await this.tableOps.dropTable(t, e);
  }
  /**
   * Loads metadata for a table.
   *
   * @param id - Table identifier to load
   * @returns Table metadata including schema, partition spec, location, etc.
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
   * console.log(metadata.schema);
   * console.log(metadata.location);
   * ```
   */
  async loadTable(t) {
    return this.tableOps.loadTable(t);
  }
  /**
   * Checks if a namespace exists in the catalog.
   *
   * @param id - Namespace identifier to check
   * @returns True if the namespace exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
   * console.log(exists); // true or false
   * ```
   */
  async namespaceExists(t) {
    return this.namespaceOps.namespaceExists(t);
  }
  /**
   * Checks if a table exists in the catalog.
   *
   * @param id - Table identifier to check
   * @returns True if the table exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
   * console.log(exists); // true or false
   * ```
   */
  async tableExists(t) {
    return this.tableOps.tableExists(t);
  }
  /**
   * Creates a namespace if it does not exist.
   *
   * If the namespace already exists, returns void. If created, returns the response.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties, or void if it already exists
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespaceIfNotExists(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * if (response) {
   *   console.log('Created:', response.namespace);
   * } else {
   *   console.log('Already exists');
   * }
   * ```
   */
  async createNamespaceIfNotExists(t, e) {
    return this.namespaceOps.createNamespaceIfNotExists(t, e);
  }
  /**
   * Creates a table if it does not exist.
   *
   * If the table already exists, returns its metadata instead.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created or existing table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTableIfNotExists(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     }
   *   }
   * );
   * ```
   */
  async createTableIfNotExists(t, e) {
    return this.tableOps.createTableIfNotExists(t, e);
  }
}, Tn = class extends Error {
  constructor(t, e = "storage", r, n) {
    super(t), this.__isStorageError = !0, this.namespace = e, this.name = e === "vectors" ? "StorageVectorsError" : "StorageError", this.status = r, this.statusCode = n;
  }
};
function Pn(t) {
  return typeof t == "object" && t !== null && "__isStorageError" in t;
}
var sn = class extends Tn {
  constructor(t, e, r, n = "storage") {
    super(t, n, e, r), this.name = n === "vectors" ? "StorageVectorsApiError" : "StorageApiError", this.status = e, this.statusCode = r;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode
    };
  }
}, fu = class extends Tn {
  constructor(t, e, r = "storage") {
    super(t, r), this.name = r === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError", this.originalError = e;
  }
};
const rp = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e), np = (t) => {
  if (typeof t != "object" || t === null) return !1;
  const e = Object.getPrototypeOf(t);
  return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(Symbol.toStringTag in t) && !(Symbol.iterator in t);
}, si = (t) => {
  if (Array.isArray(t)) return t.map((r) => si(r));
  if (typeof t == "function" || t !== Object(t)) return t;
  const e = {};
  return Object.entries(t).forEach(([r, n]) => {
    const i = r.replace(/([-_][a-z])/gi, (s) => s.toUpperCase().replace(/[-_]/g, ""));
    e[i] = si(n);
  }), e;
}, sp = (t) => !t || typeof t != "string" || t.length === 0 || t.length > 100 || t.trim() !== t || t.includes("/") || t.includes("\\") ? !1 : /^[\w!.\*'() &$@=;:+,?-]+$/.test(t);
function zt(t) {
  "@babel/helpers - typeof";
  return zt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, zt(t);
}
function ip(t, e) {
  if (zt(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (zt(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function ap(t) {
  var e = ip(t, "string");
  return zt(e) == "symbol" ? e : e + "";
}
function op(t, e, r) {
  return (e = ap(e)) in t ? Object.defineProperty(t, e, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = r, t;
}
function yc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function te(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? yc(Object(r), !0).forEach(function(n) {
      op(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : yc(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
const gc = (t) => {
  var e;
  return t.msg || t.message || t.error_description || (typeof t.error == "string" ? t.error : (e = t.error) === null || e === void 0 ? void 0 : e.message) || JSON.stringify(t);
}, cp = async (t, e, r, n) => {
  if (t && typeof t == "object" && "status" in t && "ok" in t && typeof t.status == "number" && !r?.noResolveJson) {
    const i = t, s = i.status || 500;
    if (typeof i.json == "function") i.json().then((a) => {
      const o = a?.statusCode || a?.code || s + "";
      e(new sn(gc(a), s, o, n));
    }).catch(() => {
      if (n === "vectors") {
        const a = s + "";
        e(new sn(i.statusText || `HTTP ${s} error`, s, a, n));
      } else {
        const a = s + "";
        e(new sn(i.statusText || `HTTP ${s} error`, s, a, n));
      }
    });
    else {
      const a = s + "";
      e(new sn(i.statusText || `HTTP ${s} error`, s, a, n));
    }
  } else e(new fu(gc(t), t, n));
}, up = (t, e, r, n) => {
  const i = {
    method: t,
    headers: e?.headers || {}
  };
  return t === "GET" || t === "HEAD" || !n ? te(te({}, i), r) : (np(n) ? (i.headers = te({ "Content-Type": "application/json" }, e?.headers), i.body = JSON.stringify(n)) : i.body = n, e?.duplex && (i.duplex = e.duplex), te(te({}, i), r));
};
async function qt(t, e, r, n, i, s, a) {
  return new Promise((o, c) => {
    t(r, up(e, n, i, s)).then((u) => {
      if (!u.ok) throw u;
      if (n?.noResolveJson) return u;
      if (a === "vectors") {
        const l = u.headers.get("content-type");
        if (u.headers.get("content-length") === "0" || u.status === 204) return {};
        if (!l || !l.includes("application/json")) return {};
      }
      return u.json();
    }).then((u) => o(u)).catch((u) => cp(u, c, n, a));
  });
}
function pu(t = "storage") {
  return {
    get: async (e, r, n, i) => qt(e, "GET", r, n, i, void 0, t),
    post: async (e, r, n, i, s) => qt(e, "POST", r, i, s, n, t),
    put: async (e, r, n, i, s) => qt(e, "PUT", r, i, s, n, t),
    head: async (e, r, n, i) => qt(e, "HEAD", r, te(te({}, n), {}, { noResolveJson: !0 }), i, void 0, t),
    remove: async (e, r, n, i, s) => qt(e, "DELETE", r, i, s, n, t)
  };
}
const lp = pu("storage"), { get: Bt, post: Ce, put: ii, head: dp, remove: $i } = lp, Ae = pu("vectors");
var jt = class {
  /**
  * Creates a new BaseApiClient instance
  * @param url - Base URL for API requests
  * @param headers - Default headers for API requests
  * @param fetch - Optional custom fetch implementation
  * @param namespace - Error namespace ('storage' or 'vectors')
  */
  constructor(t, e = {}, r, n = "storage") {
    this.shouldThrowOnError = !1, this.url = t, this.headers = e, this.fetch = rp(r), this.namespace = n;
  }
  /**
  * Enable throwing errors instead of returning them.
  * When enabled, errors are thrown instead of returned in { data, error } format.
  *
  * @returns this - For method chaining
  */
  throwOnError() {
    return this.shouldThrowOnError = !0, this;
  }
  /**
  * Handles API operation with standardized error handling
  * Eliminates repetitive try-catch blocks across all API methods
  *
  * This wrapper:
  * 1. Executes the operation
  * 2. Returns { data, error: null } on success
  * 3. Returns { data: null, error } on failure (if shouldThrowOnError is false)
  * 4. Throws error on failure (if shouldThrowOnError is true)
  *
  * @typeParam T - The expected data type from the operation
  * @param operation - Async function that performs the API call
  * @returns Promise with { data, error } tuple
  *
  * @example
  * ```typescript
  * async listBuckets() {
  *   return this.handleOperation(async () => {
  *     return await get(this.fetch, `${this.url}/bucket`, {
  *       headers: this.headers,
  *     })
  *   })
  * }
  * ```
  */
  async handleOperation(t) {
    var e = this;
    try {
      return {
        data: await t(),
        error: null
      };
    } catch (r) {
      if (e.shouldThrowOnError) throw r;
      if (Pn(r)) return {
        data: null,
        error: r
      };
      throw r;
    }
  }
}, hp = class {
  constructor(t, e) {
    this.downloadFn = t, this.shouldThrowOnError = e;
  }
  then(t, e) {
    return this.execute().then(t, e);
  }
  async execute() {
    var t = this;
    try {
      return {
        data: (await t.downloadFn()).body,
        error: null
      };
    } catch (e) {
      if (t.shouldThrowOnError) throw e;
      if (Pn(e)) return {
        data: null,
        error: e
      };
      throw e;
    }
  }
};
let mu;
mu = Symbol.toStringTag;
var fp = class {
  constructor(t, e) {
    this.downloadFn = t, this.shouldThrowOnError = e, this[mu] = "BlobDownloadBuilder", this.promise = null;
  }
  asStream() {
    return new hp(this.downloadFn, this.shouldThrowOnError);
  }
  then(t, e) {
    return this.getPromise().then(t, e);
  }
  catch(t) {
    return this.getPromise().catch(t);
  }
  finally(t) {
    return this.getPromise().finally(t);
  }
  getPromise() {
    return this.promise || (this.promise = this.execute()), this.promise;
  }
  async execute() {
    var t = this;
    try {
      return {
        data: await (await t.downloadFn()).blob(),
        error: null
      };
    } catch (e) {
      if (t.shouldThrowOnError) throw e;
      if (Pn(e)) return {
        data: null,
        error: e
      };
      throw e;
    }
  }
};
const pp = {
  limit: 100,
  offset: 0,
  sortBy: {
    column: "name",
    order: "asc"
  }
}, vc = {
  cacheControl: "3600",
  contentType: "text/plain;charset=UTF-8",
  upsert: !1
};
var mp = class extends jt {
  constructor(t, e = {}, r, n) {
    super(t, e, n, "storage"), this.bucketId = r;
  }
  /**
  * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
  *
  * @param method HTTP method.
  * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
  * @param fileBody The body of the file to be stored in the bucket.
  */
  async uploadOrUpdate(t, e, r, n) {
    var i = this;
    return i.handleOperation(async () => {
      let s;
      const a = te(te({}, vc), n);
      let o = te(te({}, i.headers), t === "POST" && { "x-upsert": String(a.upsert) });
      const c = a.metadata;
      typeof Blob < "u" && r instanceof Blob ? (s = new FormData(), s.append("cacheControl", a.cacheControl), c && s.append("metadata", i.encodeMetadata(c)), s.append("", r)) : typeof FormData < "u" && r instanceof FormData ? (s = r, s.has("cacheControl") || s.append("cacheControl", a.cacheControl), c && !s.has("metadata") && s.append("metadata", i.encodeMetadata(c))) : (s = r, o["cache-control"] = `max-age=${a.cacheControl}`, o["content-type"] = a.contentType, c && (o["x-metadata"] = i.toBase64(i.encodeMetadata(c))), (typeof ReadableStream < "u" && s instanceof ReadableStream || s && typeof s == "object" && "pipe" in s && typeof s.pipe == "function") && !a.duplex && (a.duplex = "half")), n?.headers && (o = te(te({}, o), n.headers));
      const u = i._removeEmptyFolders(e), l = i._getFinalPath(u), m = await (t == "PUT" ? ii : Ce)(i.fetch, `${i.url}/object/${l}`, s, te({ headers: o }, a?.duplex ? { duplex: a.duplex } : {}));
      return {
        path: u,
        id: m.Id,
        fullPath: m.Key
      };
    });
  }
  /**
  * Uploads a file to an existing bucket.
  *
  * @category File Buckets
  * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
  * @param fileBody The body of the file to be stored in the bucket.
  * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
  * @returns Promise with response containing file path, id, and fullPath or error
  *
  * @example Upload file
  * ```js
  * const avatarFile = event.target.files[0]
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .upload('public/avatar1.png', avatarFile, {
  *     cacheControl: '3600',
  *     upsert: false
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "public/avatar1.png",
  *     "fullPath": "avatars/public/avatar1.png"
  *   },
  *   "error": null
  * }
  * ```
  *
  * @example Upload file using `ArrayBuffer` from base64 file data
  * ```js
  * import { decode } from 'base64-arraybuffer'
  *
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .upload('public/avatar1.png', decode('base64FileData'), {
  *     contentType: 'image/png'
  *   })
  * ```
  */
  async upload(t, e, r) {
    return this.uploadOrUpdate("POST", t, e, r);
  }
  /**
  * Upload a file with a token generated from `createSignedUploadUrl`.
  *
  * @category File Buckets
  * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
  * @param token The token generated from `createSignedUploadUrl`
  * @param fileBody The body of the file to be stored in the bucket.
  * @param fileOptions HTTP headers (cacheControl, contentType, etc.).
  * **Note:** The `upsert` option has no effect here. To enable upsert behavior,
  * pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
  * @returns Promise with response containing file path and fullPath or error
  *
  * @example Upload to a signed URL
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "folder/cat.jpg",
  *     "fullPath": "avatars/folder/cat.jpg"
  *   },
  *   "error": null
  * }
  * ```
  */
  async uploadToSignedUrl(t, e, r, n) {
    var i = this;
    const s = i._removeEmptyFolders(t), a = i._getFinalPath(s), o = new URL(i.url + `/object/upload/sign/${a}`);
    return o.searchParams.set("token", e), i.handleOperation(async () => {
      let c;
      const u = te({ upsert: vc.upsert }, n), l = te(te({}, i.headers), { "x-upsert": String(u.upsert) });
      return typeof Blob < "u" && r instanceof Blob ? (c = new FormData(), c.append("cacheControl", u.cacheControl), c.append("", r)) : typeof FormData < "u" && r instanceof FormData ? (c = r, c.append("cacheControl", u.cacheControl)) : (c = r, l["cache-control"] = `max-age=${u.cacheControl}`, l["content-type"] = u.contentType), {
        path: s,
        fullPath: (await ii(i.fetch, o.toString(), c, { headers: l })).Key
      };
    });
  }
  /**
  * Creates a signed upload URL.
  * Signed upload URLs can be used to upload files to the bucket without further authentication.
  * They are valid for 2 hours.
  *
  * @category File Buckets
  * @param path The file path, including the current file name. For example `folder/image.png`.
  * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
  * @returns Promise with response containing signed upload URL, token, and path or error
  *
  * @example Create Signed Upload URL
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUploadUrl('folder/cat.jpg')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
  *     "path": "folder/cat.jpg",
  *     "token": "<TOKEN>"
  *   },
  *   "error": null
  * }
  * ```
  */
  async createSignedUploadUrl(t, e) {
    var r = this;
    return r.handleOperation(async () => {
      let n = r._getFinalPath(t);
      const i = te({}, r.headers);
      e?.upsert && (i["x-upsert"] = "true");
      const s = await Ce(r.fetch, `${r.url}/object/upload/sign/${n}`, {}, { headers: i }), a = new URL(r.url + s.url), o = a.searchParams.get("token");
      if (!o) throw new Tn("No token returned by API");
      return {
        signedUrl: a.toString(),
        path: t,
        token: o
      };
    });
  }
  /**
  * Replaces an existing file at the specified path with a new one.
  *
  * @category File Buckets
  * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
  * @param fileBody The body of the file to be stored in the bucket.
  * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
  * @returns Promise with response containing file path, id, and fullPath or error
  *
  * @example Update file
  * ```js
  * const avatarFile = event.target.files[0]
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .update('public/avatar1.png', avatarFile, {
  *     cacheControl: '3600',
  *     upsert: true
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "public/avatar1.png",
  *     "fullPath": "avatars/public/avatar1.png"
  *   },
  *   "error": null
  * }
  * ```
  *
  * @example Update file using `ArrayBuffer` from base64 file data
  * ```js
  * import {decode} from 'base64-arraybuffer'
  *
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .update('public/avatar1.png', decode('base64FileData'), {
  *     contentType: 'image/png'
  *   })
  * ```
  */
  async update(t, e, r) {
    return this.uploadOrUpdate("PUT", t, e, r);
  }
  /**
  * Moves an existing file to a new path in the same bucket.
  *
  * @category File Buckets
  * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
  * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
  * @param options The destination options.
  * @returns Promise with response containing success message or error
  *
  * @example Move file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .move('public/avatar1.png', 'private/avatar2.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully moved"
  *   },
  *   "error": null
  * }
  * ```
  */
  async move(t, e, r) {
    var n = this;
    return n.handleOperation(async () => await Ce(n.fetch, `${n.url}/object/move`, {
      bucketId: n.bucketId,
      sourceKey: t,
      destinationKey: e,
      destinationBucket: r?.destinationBucket
    }, { headers: n.headers }));
  }
  /**
  * Copies an existing file to a new path in the same bucket.
  *
  * @category File Buckets
  * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
  * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
  * @param options The destination options.
  * @returns Promise with response containing copied file path or error
  *
  * @example Copy file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .copy('public/avatar1.png', 'private/avatar2.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "avatars/private/avatar2.png"
  *   },
  *   "error": null
  * }
  * ```
  */
  async copy(t, e, r) {
    var n = this;
    return n.handleOperation(async () => ({ path: (await Ce(n.fetch, `${n.url}/object/copy`, {
      bucketId: n.bucketId,
      sourceKey: t,
      destinationKey: e,
      destinationBucket: r?.destinationBucket
    }, { headers: n.headers })).Key }));
  }
  /**
  * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
  *
  * @category File Buckets
  * @param path The file path, including the current file name. For example `folder/image.png`.
  * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
  * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
  * @param options.transform Transform the asset before serving it to the client.
  * @returns Promise with response containing signed URL or error
  *
  * @example Create Signed URL
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrl('folder/avatar1.png', 60)
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
  *   },
  *   "error": null
  * }
  * ```
  *
  * @example Create a signed URL for an asset with transformations
  * ```js
  * const { data } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrl('folder/avatar1.png', 60, {
  *     transform: {
  *       width: 100,
  *       height: 100,
  *     }
  *   })
  * ```
  *
  * @example Create a signed URL which triggers the download of the asset
  * ```js
  * const { data } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrl('folder/avatar1.png', 60, {
  *     download: true,
  *   })
  * ```
  */
  async createSignedUrl(t, e, r) {
    var n = this;
    return n.handleOperation(async () => {
      let i = n._getFinalPath(t), s = await Ce(n.fetch, `${n.url}/object/sign/${i}`, te({ expiresIn: e }, r?.transform ? { transform: r.transform } : {}), { headers: n.headers });
      const a = r?.download ? `&download=${r.download === !0 ? "" : r.download}` : "";
      return { signedUrl: encodeURI(`${n.url}${s.signedURL}${a}`) };
    });
  }
  /**
  * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
  *
  * @category File Buckets
  * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
  * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
  * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
  * @returns Promise with response containing array of objects with signedUrl, path, and error or error
  *
  * @example Create Signed URLs
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [
  *     {
  *       "error": null,
  *       "path": "folder/avatar1.png",
  *       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
  *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
  *     },
  *     {
  *       "error": null,
  *       "path": "folder/avatar2.png",
  *       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
  *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
  *     }
  *   ],
  *   "error": null
  * }
  * ```
  */
  async createSignedUrls(t, e, r) {
    var n = this;
    return n.handleOperation(async () => {
      const i = await Ce(n.fetch, `${n.url}/object/sign/${n.bucketId}`, {
        expiresIn: e,
        paths: t
      }, { headers: n.headers }), s = r?.download ? `&download=${r.download === !0 ? "" : r.download}` : "";
      return i.map((a) => te(te({}, a), {}, { signedUrl: a.signedURL ? encodeURI(`${n.url}${a.signedURL}${s}`) : null }));
    });
  }
  /**
  * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
  *
  * @category File Buckets
  * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
  * @param options.transform Transform the asset before serving it to the client.
  * @returns BlobDownloadBuilder instance for downloading the file
  *
  * @example Download file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .download('folder/avatar1.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": <BLOB>,
  *   "error": null
  * }
  * ```
  *
  * @example Download file with transformations
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .download('folder/avatar1.png', {
  *     transform: {
  *       width: 100,
  *       height: 100,
  *       quality: 80
  *     }
  *   })
  * ```
  */
  download(t, e) {
    const r = typeof e?.transform < "u" ? "render/image/authenticated" : "object", n = this.transformOptsToQueryString(e?.transform || {}), i = n ? `?${n}` : "", s = this._getFinalPath(t), a = () => Bt(this.fetch, `${this.url}/${r}/${s}${i}`, {
      headers: this.headers,
      noResolveJson: !0
    });
    return new fp(a, this.shouldThrowOnError);
  }
  /**
  * Retrieves the details of an existing file.
  *
  * @category File Buckets
  * @param path The file path, including the file name. For example `folder/image.png`.
  * @returns Promise with response containing file metadata or error
  *
  * @example Get file info
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .info('folder/avatar1.png')
  * ```
  */
  async info(t) {
    var e = this;
    const r = e._getFinalPath(t);
    return e.handleOperation(async () => si(await Bt(e.fetch, `${e.url}/object/info/${r}`, { headers: e.headers })));
  }
  /**
  * Checks the existence of a file.
  *
  * @category File Buckets
  * @param path The file path, including the file name. For example `folder/image.png`.
  * @returns Promise with response containing boolean indicating file existence or error
  *
  * @example Check file existence
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .exists('folder/avatar1.png')
  * ```
  */
  async exists(t) {
    var e = this;
    const r = e._getFinalPath(t);
    try {
      return await dp(e.fetch, `${e.url}/object/${r}`, { headers: e.headers }), {
        data: !0,
        error: null
      };
    } catch (n) {
      if (e.shouldThrowOnError) throw n;
      if (Pn(n) && n instanceof fu) {
        const i = n.originalError;
        if ([400, 404].includes(i?.status)) return {
          data: !1,
          error: n
        };
      }
      throw n;
    }
  }
  /**
  * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
  * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
  *
  * @category File Buckets
  * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
  * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
  * @param options.transform Transform the asset before serving it to the client.
  * @returns Object with public URL
  *
  * @example Returns the URL for an asset in a public bucket
  * ```js
  * const { data } = supabase
  *   .storage
  *   .from('public-bucket')
  *   .getPublicUrl('folder/avatar1.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
  *   }
  * }
  * ```
  *
  * @example Returns the URL for an asset in a public bucket with transformations
  * ```js
  * const { data } = supabase
  *   .storage
  *   .from('public-bucket')
  *   .getPublicUrl('folder/avatar1.png', {
  *     transform: {
  *       width: 100,
  *       height: 100,
  *     }
  *   })
  * ```
  *
  * @example Returns the URL which triggers the download of an asset in a public bucket
  * ```js
  * const { data } = supabase
  *   .storage
  *   .from('public-bucket')
  *   .getPublicUrl('folder/avatar1.png', {
  *     download: true,
  *   })
  * ```
  */
  getPublicUrl(t, e) {
    const r = this._getFinalPath(t), n = [], i = e?.download ? `download=${e.download === !0 ? "" : e.download}` : "";
    i !== "" && n.push(i);
    const s = typeof e?.transform < "u" ? "render/image" : "object", a = this.transformOptsToQueryString(e?.transform || {});
    a !== "" && n.push(a);
    let o = n.join("&");
    return o !== "" && (o = `?${o}`), { data: { publicUrl: encodeURI(`${this.url}/${s}/public/${r}${o}`) } };
  }
  /**
  * Deletes files within the same bucket
  *
  * @category File Buckets
  * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
  * @returns Promise with response containing array of deleted file objects or error
  *
  * @example Delete file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .remove(['folder/avatar1.png'])
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [],
  *   "error": null
  * }
  * ```
  */
  async remove(t) {
    var e = this;
    return e.handleOperation(async () => await $i(e.fetch, `${e.url}/object/${e.bucketId}`, { prefixes: t }, { headers: e.headers }));
  }
  /**
  * Get file metadata
  * @param id the file id to retrieve metadata
  */
  /**
  * Update file metadata
  * @param id the file id to update metadata
  * @param meta the new file metadata
  */
  /**
  * Lists all the files and folders within a path of the bucket.
  *
  * @category File Buckets
  * @param path The folder path.
  * @param options Search options including limit (defaults to 100), offset, sortBy, and search
  * @param parameters Optional fetch parameters including signal for cancellation
  * @returns Promise with response containing array of files or error
  *
  * @example List files in a bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .list('folder', {
  *     limit: 100,
  *     offset: 0,
  *     sortBy: { column: 'name', order: 'asc' },
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [
  *     {
  *       "name": "avatar1.png",
  *       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
  *       "updated_at": "2024-05-22T23:06:05.580Z",
  *       "created_at": "2024-05-22T23:04:34.443Z",
  *       "last_accessed_at": "2024-05-22T23:04:34.443Z",
  *       "metadata": {
  *         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
  *         "size": 32175,
  *         "mimetype": "image/png",
  *         "cacheControl": "max-age=3600",
  *         "lastModified": "2024-05-22T23:06:05.574Z",
  *         "contentLength": 32175,
  *         "httpStatusCode": 200
  *       }
  *     }
  *   ],
  *   "error": null
  * }
  * ```
  *
  * @example Search files in a bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .list('folder', {
  *     limit: 100,
  *     offset: 0,
  *     sortBy: { column: 'name', order: 'asc' },
  *     search: 'jon'
  *   })
  * ```
  */
  async list(t, e, r) {
    var n = this;
    return n.handleOperation(async () => {
      const i = te(te(te({}, pp), e), {}, { prefix: t || "" });
      return await Ce(n.fetch, `${n.url}/object/list/${n.bucketId}`, i, { headers: n.headers }, r);
    });
  }
  /**
  * @experimental this method signature might change in the future
  *
  * @category File Buckets
  * @param options search options
  * @param parameters
  */
  async listV2(t, e) {
    var r = this;
    return r.handleOperation(async () => {
      const n = te({}, t);
      return await Ce(r.fetch, `${r.url}/object/list-v2/${r.bucketId}`, n, { headers: r.headers }, e);
    });
  }
  encodeMetadata(t) {
    return JSON.stringify(t);
  }
  toBase64(t) {
    return typeof Buffer < "u" ? Buffer.from(t).toString("base64") : btoa(t);
  }
  _getFinalPath(t) {
    return `${this.bucketId}/${t.replace(/^\/+/, "")}`;
  }
  _removeEmptyFolders(t) {
    return t.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
  }
  transformOptsToQueryString(t) {
    const e = [];
    return t.width && e.push(`width=${t.width}`), t.height && e.push(`height=${t.height}`), t.resize && e.push(`resize=${t.resize}`), t.format && e.push(`format=${t.format}`), t.quality && e.push(`quality=${t.quality}`), e.join("&");
  }
};
const yp = "2.94.0", Yt = { "X-Client-Info": `storage-js/${yp}` };
var gp = class extends jt {
  constructor(t, e = {}, r, n) {
    const i = new URL(t);
    n?.useNewHostname && /supabase\.(co|in|red)$/.test(i.hostname) && !i.hostname.includes("storage.supabase.") && (i.hostname = i.hostname.replace("supabase.", "storage.supabase."));
    const s = i.href.replace(/\/$/, ""), a = te(te({}, Yt), e);
    super(s, a, r, "storage");
  }
  /**
  * Retrieves the details of all Storage buckets within an existing project.
  *
  * @category File Buckets
  * @param options Query parameters for listing buckets
  * @param options.limit Maximum number of buckets to return
  * @param options.offset Number of buckets to skip
  * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
  * @param options.sortOrder Sort order ('asc' or 'desc')
  * @param options.search Search term to filter bucket names
  * @returns Promise with response containing array of buckets or error
  *
  * @example List buckets
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .listBuckets()
  * ```
  *
  * @example List buckets with options
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .listBuckets({
  *     limit: 10,
  *     offset: 0,
  *     sortColumn: 'created_at',
  *     sortOrder: 'desc',
  *     search: 'prod'
  *   })
  * ```
  */
  async listBuckets(t) {
    var e = this;
    return e.handleOperation(async () => {
      const r = e.listBucketOptionsToQueryString(t);
      return await Bt(e.fetch, `${e.url}/bucket${r}`, { headers: e.headers });
    });
  }
  /**
  * Retrieves the details of an existing Storage bucket.
  *
  * @category File Buckets
  * @param id The unique identifier of the bucket you would like to retrieve.
  * @returns Promise with response containing bucket details or error
  *
  * @example Get bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .getBucket('avatars')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "id": "avatars",
  *     "name": "avatars",
  *     "owner": "",
  *     "public": false,
  *     "file_size_limit": 1024,
  *     "allowed_mime_types": [
  *       "image/png"
  *     ],
  *     "created_at": "2024-05-22T22:26:05.100Z",
  *     "updated_at": "2024-05-22T22:26:05.100Z"
  *   },
  *   "error": null
  * }
  * ```
  */
  async getBucket(t) {
    var e = this;
    return e.handleOperation(async () => await Bt(e.fetch, `${e.url}/bucket/${t}`, { headers: e.headers }));
  }
  /**
  * Creates a new Storage bucket
  *
  * @category File Buckets
  * @param id A unique identifier for the bucket you are creating.
  * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
  * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
  * The global file size limit takes precedence over this value.
  * The default value is null, which doesn't set a per bucket file size limit.
  * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
  * The default value is null, which allows files with all mime types to be uploaded.
  * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
  * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
  *   - default bucket type is `STANDARD`
  * @returns Promise with response containing newly created bucket name or error
  *
  * @example Create bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .createBucket('avatars', {
  *     public: false,
  *     allowedMimeTypes: ['image/png'],
  *     fileSizeLimit: 1024
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "name": "avatars"
  *   },
  *   "error": null
  * }
  * ```
  */
  async createBucket(t, e = { public: !1 }) {
    var r = this;
    return r.handleOperation(async () => await Ce(r.fetch, `${r.url}/bucket`, {
      id: t,
      name: t,
      type: e.type,
      public: e.public,
      file_size_limit: e.fileSizeLimit,
      allowed_mime_types: e.allowedMimeTypes
    }, { headers: r.headers }));
  }
  /**
  * Updates a Storage bucket
  *
  * @category File Buckets
  * @param id A unique identifier for the bucket you are updating.
  * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
  * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
  * The global file size limit takes precedence over this value.
  * The default value is null, which doesn't set a per bucket file size limit.
  * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
  * The default value is null, which allows files with all mime types to be uploaded.
  * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
  * @returns Promise with response containing success message or error
  *
  * @example Update bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .updateBucket('avatars', {
  *     public: false,
  *     allowedMimeTypes: ['image/png'],
  *     fileSizeLimit: 1024
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully updated"
  *   },
  *   "error": null
  * }
  * ```
  */
  async updateBucket(t, e) {
    var r = this;
    return r.handleOperation(async () => await ii(r.fetch, `${r.url}/bucket/${t}`, {
      id: t,
      name: t,
      public: e.public,
      file_size_limit: e.fileSizeLimit,
      allowed_mime_types: e.allowedMimeTypes
    }, { headers: r.headers }));
  }
  /**
  * Removes all objects inside a single bucket.
  *
  * @category File Buckets
  * @param id The unique identifier of the bucket you would like to empty.
  * @returns Promise with success message or error
  *
  * @example Empty bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .emptyBucket('avatars')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully emptied"
  *   },
  *   "error": null
  * }
  * ```
  */
  async emptyBucket(t) {
    var e = this;
    return e.handleOperation(async () => await Ce(e.fetch, `${e.url}/bucket/${t}/empty`, {}, { headers: e.headers }));
  }
  /**
  * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
  * You must first `empty()` the bucket.
  *
  * @category File Buckets
  * @param id The unique identifier of the bucket you would like to delete.
  * @returns Promise with success message or error
  *
  * @example Delete bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .deleteBucket('avatars')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully deleted"
  *   },
  *   "error": null
  * }
  * ```
  */
  async deleteBucket(t) {
    var e = this;
    return e.handleOperation(async () => await $i(e.fetch, `${e.url}/bucket/${t}`, {}, { headers: e.headers }));
  }
  listBucketOptionsToQueryString(t) {
    const e = {};
    return t && ("limit" in t && (e.limit = String(t.limit)), "offset" in t && (e.offset = String(t.offset)), t.search && (e.search = t.search), t.sortColumn && (e.sortColumn = t.sortColumn), t.sortOrder && (e.sortOrder = t.sortOrder)), Object.keys(e).length > 0 ? "?" + new URLSearchParams(e).toString() : "";
  }
}, vp = class extends jt {
  /**
  * @alpha
  *
  * Creates a new StorageAnalyticsClient instance
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param url - The base URL for the storage API
  * @param headers - HTTP headers to include in requests
  * @param fetch - Optional custom fetch implementation
  *
  * @example
  * ```typescript
  * const client = new StorageAnalyticsClient(url, headers)
  * ```
  */
  constructor(t, e = {}, r) {
    const n = t.replace(/\/$/, ""), i = te(te({}, Yt), e);
    super(n, i, r, "storage");
  }
  /**
  * @alpha
  *
  * Creates a new analytics bucket using Iceberg tables
  * Analytics buckets are optimized for analytical queries and data processing
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param name A unique name for the bucket you are creating
  * @returns Promise with response containing newly created analytics bucket or error
  *
  * @example Create analytics bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .analytics
  *   .createBucket('analytics-data')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "name": "analytics-data",
  *     "type": "ANALYTICS",
  *     "format": "iceberg",
  *     "created_at": "2024-05-22T22:26:05.100Z",
  *     "updated_at": "2024-05-22T22:26:05.100Z"
  *   },
  *   "error": null
  * }
  * ```
  */
  async createBucket(t) {
    var e = this;
    return e.handleOperation(async () => await Ce(e.fetch, `${e.url}/bucket`, { name: t }, { headers: e.headers }));
  }
  /**
  * @alpha
  *
  * Retrieves the details of all Analytics Storage buckets within an existing project
  * Only returns buckets of type 'ANALYTICS'
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param options Query parameters for listing buckets
  * @param options.limit Maximum number of buckets to return
  * @param options.offset Number of buckets to skip
  * @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
  * @param options.sortOrder Sort order ('asc' or 'desc')
  * @param options.search Search term to filter bucket names
  * @returns Promise with response containing array of analytics buckets or error
  *
  * @example List analytics buckets
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .analytics
  *   .listBuckets({
  *     limit: 10,
  *     offset: 0,
  *     sortColumn: 'created_at',
  *     sortOrder: 'desc'
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [
  *     {
  *       "name": "analytics-data",
  *       "type": "ANALYTICS",
  *       "format": "iceberg",
  *       "created_at": "2024-05-22T22:26:05.100Z",
  *       "updated_at": "2024-05-22T22:26:05.100Z"
  *     }
  *   ],
  *   "error": null
  * }
  * ```
  */
  async listBuckets(t) {
    var e = this;
    return e.handleOperation(async () => {
      const r = new URLSearchParams();
      t?.limit !== void 0 && r.set("limit", t.limit.toString()), t?.offset !== void 0 && r.set("offset", t.offset.toString()), t?.sortColumn && r.set("sortColumn", t.sortColumn), t?.sortOrder && r.set("sortOrder", t.sortOrder), t?.search && r.set("search", t.search);
      const n = r.toString(), i = n ? `${e.url}/bucket?${n}` : `${e.url}/bucket`;
      return await Bt(e.fetch, i, { headers: e.headers });
    });
  }
  /**
  * @alpha
  *
  * Deletes an existing analytics bucket
  * A bucket can't be deleted with existing objects inside it
  * You must first empty the bucket before deletion
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param bucketName The unique identifier of the bucket you would like to delete
  * @returns Promise with response containing success message or error
  *
  * @example Delete analytics bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .analytics
  *   .deleteBucket('analytics-data')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully deleted"
  *   },
  *   "error": null
  * }
  * ```
  */
  async deleteBucket(t) {
    var e = this;
    return e.handleOperation(async () => await $i(e.fetch, `${e.url}/bucket/${t}`, {}, { headers: e.headers }));
  }
  /**
  * @alpha
  *
  * Get an Iceberg REST Catalog client configured for a specific analytics bucket
  * Use this to perform advanced table and namespace operations within the bucket
  * The returned client provides full access to the Apache Iceberg REST Catalog API
  * with the Supabase `{ data, error }` pattern for consistent error handling on all operations.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param bucketName - The name of the analytics bucket (warehouse) to connect to
  * @returns The wrapped Iceberg catalog client
  * @throws {StorageError} If the bucket name is invalid
  *
  * @example Get catalog and create table
  * ```js
  * // First, create an analytics bucket
  * const { data: bucket, error: bucketError } = await supabase
  *   .storage
  *   .analytics
  *   .createBucket('analytics-data')
  *
  * // Get the Iceberg catalog for that bucket
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // Create a namespace
  * const { error: nsError } = await catalog.createNamespace({ namespace: ['default'] })
  *
  * // Create a table with schema
  * const { data: tableMetadata, error: tableError } = await catalog.createTable(
  *   { namespace: ['default'] },
  *   {
  *     name: 'events',
  *     schema: {
  *       type: 'struct',
  *       fields: [
  *         { id: 1, name: 'id', type: 'long', required: true },
  *         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
  *         { id: 3, name: 'user_id', type: 'string', required: false }
  *       ],
  *       'schema-id': 0,
  *       'identifier-field-ids': [1]
  *     },
  *     'partition-spec': {
  *       'spec-id': 0,
  *       fields: []
  *     },
  *     'write-order': {
  *       'order-id': 0,
  *       fields: []
  *     },
  *     properties: {
  *       'write.format.default': 'parquet'
  *     }
  *   }
  * )
  * ```
  *
  * @example List tables in namespace
  * ```js
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // List all tables in the default namespace
  * const { data: tables, error: listError } = await catalog.listTables({ namespace: ['default'] })
  * if (listError) {
  *   if (listError.isNotFound()) {
  *     console.log('Namespace not found')
  *   }
  *   return
  * }
  * console.log(tables) // [{ namespace: ['default'], name: 'events' }]
  * ```
  *
  * @example Working with namespaces
  * ```js
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // List all namespaces
  * const { data: namespaces } = await catalog.listNamespaces()
  *
  * // Create namespace with properties
  * await catalog.createNamespace(
  *   { namespace: ['production'] },
  *   { properties: { owner: 'data-team', env: 'prod' } }
  * )
  * ```
  *
  * @example Cleanup operations
  * ```js
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // Drop table with purge option (removes all data)
  * const { error: dropError } = await catalog.dropTable(
  *   { namespace: ['default'], name: 'events' },
  *   { purge: true }
  * )
  *
  * if (dropError?.isNotFound()) {
  *   console.log('Table does not exist')
  * }
  *
  * // Drop namespace (must be empty)
  * await catalog.dropNamespace({ namespace: ['default'] })
  * ```
  *
  * @remarks
  * This method provides a bridge between Supabase's bucket management and the standard
  * Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
  * All authentication and configuration is handled automatically using your Supabase credentials.
  *
  * **Error Handling**: Invalid bucket names throw immediately. All catalog
  * operations return `{ data, error }` where errors are `IcebergError` instances from iceberg-js.
  * Use helper methods like `error.isNotFound()` or check `error.status` for specific error handling.
  * Use `.throwOnError()` on the analytics client if you prefer exceptions for catalog operations.
  *
  * **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
  * deletes all table data. Without it, the table is marked as deleted but data remains.
  *
  * **Library Dependency**: The returned catalog wraps `IcebergRestCatalog` from iceberg-js.
  * For complete API documentation and advanced usage, refer to the
  * [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
  */
  from(t) {
    var e = this;
    if (!sp(t)) throw new Tn("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
    const r = new tp({
      baseUrl: this.url,
      catalogName: t,
      auth: {
        type: "custom",
        getHeaders: async () => e.headers
      },
      fetch: this.fetch
    }), n = this.shouldThrowOnError;
    return new Proxy(r, { get(i, s) {
      const a = i[s];
      return typeof a != "function" ? a : async (...o) => {
        try {
          return {
            data: await a.apply(i, o),
            error: null
          };
        } catch (c) {
          if (n) throw c;
          return {
            data: null,
            error: c
          };
        }
      };
    } });
  }
}, _p = class extends jt {
  /** Creates a new VectorIndexApi instance */
  constructor(t, e = {}, r) {
    const n = t.replace(/\/$/, ""), i = te(te({}, Yt), {}, { "Content-Type": "application/json" }, e);
    super(n, i, r, "vectors");
  }
  /** Creates a new vector index within a bucket */
  async createIndex(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/CreateIndex`, t, { headers: e.headers }) || {});
  }
  /** Retrieves metadata for a specific vector index */
  async getIndex(t, e) {
    var r = this;
    return r.handleOperation(async () => await Ae.post(r.fetch, `${r.url}/GetIndex`, {
      vectorBucketName: t,
      indexName: e
    }, { headers: r.headers }));
  }
  /** Lists vector indexes within a bucket with optional filtering and pagination */
  async listIndexes(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/ListIndexes`, t, { headers: e.headers }));
  }
  /** Deletes a vector index and all its data */
  async deleteIndex(t, e) {
    var r = this;
    return r.handleOperation(async () => await Ae.post(r.fetch, `${r.url}/DeleteIndex`, {
      vectorBucketName: t,
      indexName: e
    }, { headers: r.headers }) || {});
  }
}, wp = class extends jt {
  /** Creates a new VectorDataApi instance */
  constructor(t, e = {}, r) {
    const n = t.replace(/\/$/, ""), i = te(te({}, Yt), {}, { "Content-Type": "application/json" }, e);
    super(n, i, r, "vectors");
  }
  /** Inserts or updates vectors in batch (1-500 per request) */
  async putVectors(t) {
    var e = this;
    if (t.vectors.length < 1 || t.vectors.length > 500) throw new Error("Vector batch size must be between 1 and 500 items");
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/PutVectors`, t, { headers: e.headers }) || {});
  }
  /** Retrieves vectors by their keys in batch */
  async getVectors(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/GetVectors`, t, { headers: e.headers }));
  }
  /** Lists vectors in an index with pagination */
  async listVectors(t) {
    var e = this;
    if (t.segmentCount !== void 0) {
      if (t.segmentCount < 1 || t.segmentCount > 16) throw new Error("segmentCount must be between 1 and 16");
      if (t.segmentIndex !== void 0 && (t.segmentIndex < 0 || t.segmentIndex >= t.segmentCount))
        throw new Error(`segmentIndex must be between 0 and ${t.segmentCount - 1}`);
    }
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/ListVectors`, t, { headers: e.headers }));
  }
  /** Queries for similar vectors using approximate nearest neighbor search */
  async queryVectors(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/QueryVectors`, t, { headers: e.headers }));
  }
  /** Deletes vectors by their keys in batch (1-500 per request) */
  async deleteVectors(t) {
    var e = this;
    if (t.keys.length < 1 || t.keys.length > 500) throw new Error("Keys batch size must be between 1 and 500 items");
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/DeleteVectors`, t, { headers: e.headers }) || {});
  }
}, bp = class extends jt {
  /** Creates a new VectorBucketApi instance */
  constructor(t, e = {}, r) {
    const n = t.replace(/\/$/, ""), i = te(te({}, Yt), {}, { "Content-Type": "application/json" }, e);
    super(n, i, r, "vectors");
  }
  /** Creates a new vector bucket */
  async createBucket(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/CreateVectorBucket`, { vectorBucketName: t }, { headers: e.headers }) || {});
  }
  /** Retrieves metadata for a specific vector bucket */
  async getBucket(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/GetVectorBucket`, { vectorBucketName: t }, { headers: e.headers }));
  }
  /** Lists vector buckets with optional filtering and pagination */
  async listBuckets(t = {}) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/ListVectorBuckets`, t, { headers: e.headers }));
  }
  /** Deletes a vector bucket (must be empty first) */
  async deleteBucket(t) {
    var e = this;
    return e.handleOperation(async () => await Ae.post(e.fetch, `${e.url}/DeleteVectorBucket`, { vectorBucketName: t }, { headers: e.headers }) || {});
  }
}, Ep = class extends bp {
  /**
  * @alpha
  *
  * Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param url - Base URL of the Storage Vectors REST API.
  * @param options.headers - Optional headers (for example `Authorization`) applied to every request.
  * @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
  *
  * @example
  * ```typescript
  * const client = new StorageVectorsClient(url, options)
  * ```
  */
  constructor(t, e = {}) {
    super(t, e.headers || {}, e.fetch);
  }
  /**
  *
  * @alpha
  *
  * Access operations for a specific vector bucket
  * Returns a scoped client for index and vector operations within the bucket
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Name of the vector bucket
  * @returns Bucket-scoped client with index and vector operations
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * ```
  */
  from(t) {
    return new $p(this.url, this.headers, t, this.fetch);
  }
  /**
  *
  * @alpha
  *
  * Creates a new vector bucket
  * Vector buckets are containers for vector indexes and their data
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Unique name for the vector bucket
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .createBucket('embeddings-prod')
  * ```
  */
  async createBucket(t) {
    var e = () => super.createBucket, r = this;
    return e().call(r, t);
  }
  /**
  *
  * @alpha
  *
  * Retrieves metadata for a specific vector bucket
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Name of the vector bucket
  * @returns Promise with bucket metadata or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .getBucket('embeddings-prod')
  *
  * console.log('Bucket created:', data?.vectorBucket.creationTime)
  * ```
  */
  async getBucket(t) {
    var e = () => super.getBucket, r = this;
    return e().call(r, t);
  }
  /**
  *
  * @alpha
  *
  * Lists all vector buckets with optional filtering and pagination
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Optional filters (prefix, maxResults, nextToken)
  * @returns Promise with list of buckets or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .listBuckets({ prefix: 'embeddings-' })
  *
  * data?.vectorBuckets.forEach(bucket => {
  *   console.log(bucket.vectorBucketName)
  * })
  * ```
  */
  async listBuckets(t = {}) {
    var e = () => super.listBuckets, r = this;
    return e().call(r, t);
  }
  /**
  *
  * @alpha
  *
  * Deletes a vector bucket (bucket must be empty)
  * All indexes must be deleted before deleting the bucket
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Name of the vector bucket to delete
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .deleteBucket('embeddings-old')
  * ```
  */
  async deleteBucket(t) {
    var e = () => super.deleteBucket, r = this;
    return e().call(r, t);
  }
}, $p = class extends _p {
  /**
  * @alpha
  *
  * Creates a helper that automatically scopes all index operations to the provided bucket.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * ```
  */
  constructor(t, e, r, n) {
    super(t, e, n), this.vectorBucketName = r;
  }
  /**
  *
  * @alpha
  *
  * Creates a new vector index in this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Index configuration (vectorBucketName is automatically set)
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * await bucket.createIndex({
  *   indexName: 'documents-openai',
  *   dataType: 'float32',
  *   dimension: 1536,
  *   distanceMetric: 'cosine',
  *   metadataConfiguration: {
  *     nonFilterableMetadataKeys: ['raw_text']
  *   }
  * })
  * ```
  */
  async createIndex(t) {
    var e = () => super.createIndex, r = this;
    return e().call(r, te(te({}, t), {}, { vectorBucketName: r.vectorBucketName }));
  }
  /**
  *
  * @alpha
  *
  * Lists indexes in this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Listing options (vectorBucketName is automatically set)
  * @returns Promise with response containing indexes array and pagination token or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * const { data } = await bucket.listIndexes({ prefix: 'documents-' })
  * ```
  */
  async listIndexes(t = {}) {
    var e = () => super.listIndexes, r = this;
    return e().call(r, te(te({}, t), {}, { vectorBucketName: r.vectorBucketName }));
  }
  /**
  *
  * @alpha
  *
  * Retrieves metadata for a specific index in this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param indexName - Name of the index to retrieve
  * @returns Promise with index metadata or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * const { data } = await bucket.getIndex('documents-openai')
  * console.log('Dimension:', data?.index.dimension)
  * ```
  */
  async getIndex(t) {
    var e = () => super.getIndex, r = this;
    return e().call(r, r.vectorBucketName, t);
  }
  /**
  *
  * @alpha
  *
  * Deletes an index from this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param indexName - Name of the index to delete
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * await bucket.deleteIndex('old-index')
  * ```
  */
  async deleteIndex(t) {
    var e = () => super.deleteIndex, r = this;
    return e().call(r, r.vectorBucketName, t);
  }
  /**
  *
  * @alpha
  *
  * Access operations for a specific index within this bucket
  * Returns a scoped client for vector data operations
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param indexName - Name of the index
  * @returns Index-scoped client with vector data operations
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  *
  * // Insert vectors
  * await index.putVectors({
  *   vectors: [
  *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
  *   ]
  * })
  *
  * // Query similar vectors
  * const { data } = await index.queryVectors({
  *   queryVector: { float32: [...] },
  *   topK: 5
  * })
  * ```
  */
  index(t) {
    return new Sp(this.url, this.headers, this.vectorBucketName, t, this.fetch);
  }
}, Sp = class extends wp {
  /**
  *
  * @alpha
  *
  * Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * ```
  */
  constructor(t, e, r, n, i) {
    super(t, e, i), this.vectorBucketName = r, this.indexName = n;
  }
  /**
  *
  * @alpha
  *
  * Inserts or updates vectors in this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Vector insertion options (bucket and index names automatically set)
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * await index.putVectors({
  *   vectors: [
  *     {
  *       key: 'doc-1',
  *       data: { float32: [0.1, 0.2, ...] },
  *       metadata: { title: 'Introduction', page: 1 }
  *     }
  *   ]
  * })
  * ```
  */
  async putVectors(t) {
    var e = () => super.putVectors, r = this;
    return e().call(r, te(te({}, t), {}, {
      vectorBucketName: r.vectorBucketName,
      indexName: r.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Retrieves vectors by keys from this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Vector retrieval options (bucket and index names automatically set)
  * @returns Promise with response containing vectors array or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * const { data } = await index.getVectors({
  *   keys: ['doc-1', 'doc-2'],
  *   returnMetadata: true
  * })
  * ```
  */
  async getVectors(t) {
    var e = () => super.getVectors, r = this;
    return e().call(r, te(te({}, t), {}, {
      vectorBucketName: r.vectorBucketName,
      indexName: r.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Lists vectors in this index with pagination
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Listing options (bucket and index names automatically set)
  * @returns Promise with response containing vectors array and pagination token or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * const { data } = await index.listVectors({
  *   maxResults: 500,
  *   returnMetadata: true
  * })
  * ```
  */
  async listVectors(t = {}) {
    var e = () => super.listVectors, r = this;
    return e().call(r, te(te({}, t), {}, {
      vectorBucketName: r.vectorBucketName,
      indexName: r.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Queries for similar vectors in this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Query options (bucket and index names automatically set)
  * @returns Promise with response containing matches array of similar vectors ordered by distance or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * const { data } = await index.queryVectors({
  *   queryVector: { float32: [0.1, 0.2, ...] },
  *   topK: 5,
  *   filter: { category: 'technical' },
  *   returnDistance: true,
  *   returnMetadata: true
  * })
  * ```
  */
  async queryVectors(t) {
    var e = () => super.queryVectors, r = this;
    return e().call(r, te(te({}, t), {}, {
      vectorBucketName: r.vectorBucketName,
      indexName: r.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Deletes vectors by keys from this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Deletion options (bucket and index names automatically set)
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * await index.deleteVectors({
  *   keys: ['doc-1', 'doc-2', 'doc-3']
  * })
  * ```
  */
  async deleteVectors(t) {
    var e = () => super.deleteVectors, r = this;
    return e().call(r, te(te({}, t), {}, {
      vectorBucketName: r.vectorBucketName,
      indexName: r.indexName
    }));
  }
}, Rp = class extends gp {
  /**
  * Creates a client for Storage buckets, files, analytics, and vectors.
  *
  * @category File Buckets
  * @example
  * ```ts
  * import { StorageClient } from '@supabase/storage-js'
  *
  * const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
  *   apikey: 'public-anon-key',
  * })
  * const avatars = storage.from('avatars')
  * ```
  */
  constructor(t, e = {}, r, n) {
    super(t, e, r, n);
  }
  /**
  * Perform file operation in a bucket.
  *
  * @category File Buckets
  * @param id The bucket id to operate on.
  *
  * @example
  * ```typescript
  * const avatars = supabase.storage.from('avatars')
  * ```
  */
  from(t) {
    return new mp(this.url, this.headers, t, this.fetch);
  }
  /**
  *
  * @alpha
  *
  * Access vector storage operations.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @returns A StorageVectorsClient instance configured with the current storage settings.
  */
  get vectors() {
    return new Ep(this.url + "/vector", {
      headers: this.headers,
      fetch: this.fetch
    });
  }
  /**
  *
  * @alpha
  *
  * Access analytics storage operations using Iceberg tables.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @returns A StorageAnalyticsClient instance configured with the current storage settings.
  */
  get analytics() {
    return new vp(this.url + "/iceberg", this.headers, this.fetch);
  }
};
const yu = "2.94.0", Rt = 30 * 1e3, ai = 3, Gs = ai * Rt, Op = "http://localhost:9999", Tp = "supabase.auth.token", Pp = { "X-Client-Info": `gotrue-js/${yu}` }, oi = "X-Supabase-Api-Version", gu = {
  "2024-01-01": {
    timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
    name: "2024-01-01"
  }
}, kp = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, Ap = 600 * 1e3;
class Kt extends Error {
  constructor(e, r, n) {
    super(e), this.__isAuthError = !0, this.name = "AuthError", this.status = r, this.code = n;
  }
}
function Y(t) {
  return typeof t == "object" && t !== null && "__isAuthError" in t;
}
class Ip extends Kt {
  constructor(e, r, n) {
    super(e, r, n), this.name = "AuthApiError", this.status = r, this.code = n;
  }
}
function jp(t) {
  return Y(t) && t.name === "AuthApiError";
}
class ut extends Kt {
  constructor(e, r) {
    super(e), this.name = "AuthUnknownError", this.originalError = r;
  }
}
class Ke extends Kt {
  constructor(e, r, n, i) {
    super(e, n, i), this.name = r, this.status = n;
  }
}
class ke extends Ke {
  constructor() {
    super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
  }
}
function Hs(t) {
  return Y(t) && t.name === "AuthSessionMissingError";
}
class _t extends Ke {
  constructor() {
    super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
  }
}
class an extends Ke {
  constructor(e) {
    super(e, "AuthInvalidCredentialsError", 400, void 0);
  }
}
class on extends Ke {
  constructor(e, r = null) {
    super(e, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = r;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
}
function Np(t) {
  return Y(t) && t.name === "AuthImplicitGrantRedirectError";
}
class _c extends Ke {
  constructor(e, r = null) {
    super(e, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = r;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
}
class Cp extends Ke {
  constructor() {
    super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
  }
}
class ci extends Ke {
  constructor(e, r) {
    super(e, "AuthRetryableFetchError", r, void 0);
  }
}
function Ws(t) {
  return Y(t) && t.name === "AuthRetryableFetchError";
}
class wc extends Ke {
  constructor(e, r, n) {
    super(e, "AuthWeakPasswordError", r, "weak_password"), this.reasons = n;
  }
}
class ui extends Ke {
  constructor(e) {
    super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
  }
}
const hn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), bc = ` 	
\r=`.split(""), Dp = (() => {
  const t = new Array(128);
  for (let e = 0; e < t.length; e += 1)
    t[e] = -1;
  for (let e = 0; e < bc.length; e += 1)
    t[bc[e].charCodeAt(0)] = -2;
  for (let e = 0; e < hn.length; e += 1)
    t[hn[e].charCodeAt(0)] = e;
  return t;
})();
function Ec(t, e, r) {
  if (t !== null)
    for (e.queue = e.queue << 8 | t, e.queuedBits += 8; e.queuedBits >= 6; ) {
      const n = e.queue >> e.queuedBits - 6 & 63;
      r(hn[n]), e.queuedBits -= 6;
    }
  else if (e.queuedBits > 0)
    for (e.queue = e.queue << 6 - e.queuedBits, e.queuedBits = 6; e.queuedBits >= 6; ) {
      const n = e.queue >> e.queuedBits - 6 & 63;
      r(hn[n]), e.queuedBits -= 6;
    }
}
function vu(t, e, r) {
  const n = Dp[t];
  if (n > -1)
    for (e.queue = e.queue << 6 | n, e.queuedBits += 6; e.queuedBits >= 8; )
      r(e.queue >> e.queuedBits - 8 & 255), e.queuedBits -= 8;
  else {
    if (n === -2)
      return;
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(t)}"`);
  }
}
function $c(t) {
  const e = [], r = (a) => {
    e.push(String.fromCodePoint(a));
  }, n = {
    utf8seq: 0,
    codepoint: 0
  }, i = { queue: 0, queuedBits: 0 }, s = (a) => {
    Up(a, n, r);
  };
  for (let a = 0; a < t.length; a += 1)
    vu(t.charCodeAt(a), i, s);
  return e.join("");
}
function Lp(t, e) {
  if (t <= 127) {
    e(t);
    return;
  } else if (t <= 2047) {
    e(192 | t >> 6), e(128 | t & 63);
    return;
  } else if (t <= 65535) {
    e(224 | t >> 12), e(128 | t >> 6 & 63), e(128 | t & 63);
    return;
  } else if (t <= 1114111) {
    e(240 | t >> 18), e(128 | t >> 12 & 63), e(128 | t >> 6 & 63), e(128 | t & 63);
    return;
  }
  throw new Error(`Unrecognized Unicode codepoint: ${t.toString(16)}`);
}
function qp(t, e) {
  for (let r = 0; r < t.length; r += 1) {
    let n = t.charCodeAt(r);
    if (n > 55295 && n <= 56319) {
      const i = (n - 55296) * 1024 & 65535;
      n = (t.charCodeAt(r + 1) - 56320 & 65535 | i) + 65536, r += 1;
    }
    Lp(n, e);
  }
}
function Up(t, e, r) {
  if (e.utf8seq === 0) {
    if (t <= 127) {
      r(t);
      return;
    }
    for (let n = 1; n < 6; n += 1)
      if ((t >> 7 - n & 1) === 0) {
        e.utf8seq = n;
        break;
      }
    if (e.utf8seq === 2)
      e.codepoint = t & 31;
    else if (e.utf8seq === 3)
      e.codepoint = t & 15;
    else if (e.utf8seq === 4)
      e.codepoint = t & 7;
    else
      throw new Error("Invalid UTF-8 sequence");
    e.utf8seq -= 1;
  } else if (e.utf8seq > 0) {
    if (t <= 127)
      throw new Error("Invalid UTF-8 sequence");
    e.codepoint = e.codepoint << 6 | t & 63, e.utf8seq -= 1, e.utf8seq === 0 && r(e.codepoint);
  }
}
function At(t) {
  const e = [], r = { queue: 0, queuedBits: 0 }, n = (i) => {
    e.push(i);
  };
  for (let i = 0; i < t.length; i += 1)
    vu(t.charCodeAt(i), r, n);
  return new Uint8Array(e);
}
function Mp(t) {
  const e = [];
  return qp(t, (r) => e.push(r)), new Uint8Array(e);
}
function lt(t) {
  const e = [], r = { queue: 0, queuedBits: 0 }, n = (i) => {
    e.push(i);
  };
  return t.forEach((i) => Ec(i, r, n)), Ec(null, r, n), e.join("");
}
function xp(t) {
  return Math.round(Date.now() / 1e3) + t;
}
function Fp() {
  return /* @__PURE__ */ Symbol("auth-callback");
}
const _e = () => typeof window < "u" && typeof document < "u", it = {
  tested: !1,
  writable: !1
}, _u = () => {
  if (!_e())
    return !1;
  try {
    if (typeof globalThis.localStorage != "object")
      return !1;
  } catch {
    return !1;
  }
  if (it.tested)
    return it.writable;
  const t = `lswt-${Math.random()}${Math.random()}`;
  try {
    globalThis.localStorage.setItem(t, t), globalThis.localStorage.removeItem(t), it.tested = !0, it.writable = !0;
  } catch {
    it.tested = !0, it.writable = !1;
  }
  return it.writable;
};
function Vp(t) {
  const e = {}, r = new URL(t);
  if (r.hash && r.hash[0] === "#")
    try {
      new URLSearchParams(r.hash.substring(1)).forEach((i, s) => {
        e[s] = i;
      });
    } catch {
    }
  return r.searchParams.forEach((n, i) => {
    e[i] = n;
  }), e;
}
const wu = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e), zp = (t) => typeof t == "object" && t !== null && "status" in t && "ok" in t && "json" in t && typeof t.json == "function", Ot = async (t, e, r) => {
  await t.setItem(e, JSON.stringify(r));
}, at = async (t, e) => {
  const r = await t.getItem(e);
  if (!r)
    return null;
  try {
    return JSON.parse(r);
  } catch {
    return r;
  }
}, ve = async (t, e) => {
  await t.removeItem(e);
};
class kn {
  constructor() {
    this.promise = new kn.promiseConstructor((e, r) => {
      this.resolve = e, this.reject = r;
    });
  }
}
kn.promiseConstructor = Promise;
function cn(t) {
  const e = t.split(".");
  if (e.length !== 3)
    throw new ui("Invalid JWT structure");
  for (let n = 0; n < e.length; n++)
    if (!kp.test(e[n]))
      throw new ui("JWT not in base64url format");
  return {
    // using base64url lib
    header: JSON.parse($c(e[0])),
    payload: JSON.parse($c(e[1])),
    signature: At(e[2]),
    raw: {
      header: e[0],
      payload: e[1]
    }
  };
}
async function Bp(t) {
  return await new Promise((e) => {
    setTimeout(() => e(null), t);
  });
}
function Kp(t, e) {
  return new Promise((n, i) => {
    (async () => {
      for (let s = 0; s < 1 / 0; s++)
        try {
          const a = await t(s);
          if (!e(s, null, a)) {
            n(a);
            return;
          }
        } catch (a) {
          if (!e(s, a)) {
            i(a);
            return;
          }
        }
    })();
  });
}
function Gp(t) {
  return ("0" + t.toString(16)).substr(-2);
}
function Hp() {
  const e = new Uint32Array(56);
  if (typeof crypto > "u") {
    const r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", n = r.length;
    let i = "";
    for (let s = 0; s < 56; s++)
      i += r.charAt(Math.floor(Math.random() * n));
    return i;
  }
  return crypto.getRandomValues(e), Array.from(e, Gp).join("");
}
async function Wp(t) {
  const r = new TextEncoder().encode(t), n = await crypto.subtle.digest("SHA-256", r), i = new Uint8Array(n);
  return Array.from(i).map((s) => String.fromCharCode(s)).join("");
}
async function Jp(t) {
  if (!(typeof crypto < "u" && typeof crypto.subtle < "u" && typeof TextEncoder < "u"))
    return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), t;
  const r = await Wp(t);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function wt(t, e, r = !1) {
  const n = Hp();
  let i = n;
  r && (i += "/PASSWORD_RECOVERY"), await Ot(t, `${e}-code-verifier`, i);
  const s = await Jp(n);
  return [s, n === s ? "plain" : "s256"];
}
const Xp = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function Yp(t) {
  const e = t.headers.get(oi);
  if (!e || !e.match(Xp))
    return null;
  try {
    return /* @__PURE__ */ new Date(`${e}T00:00:00.0Z`);
  } catch {
    return null;
  }
}
function Qp(t) {
  if (!t)
    throw new Error("Missing exp claim");
  const e = Math.floor(Date.now() / 1e3);
  if (t <= e)
    throw new Error("JWT has expired");
}
function Zp(t) {
  switch (t) {
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" }
      };
    case "ES256":
      return {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: { name: "SHA-256" }
      };
    default:
      throw new Error("Invalid alg claim");
  }
}
const em = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function bt(t) {
  if (!em.test(t))
    throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
}
function Js() {
  const t = {};
  return new Proxy(t, {
    get: (e, r) => {
      if (r === "__isUserNotAvailableProxy")
        return !0;
      if (typeof r == "symbol") {
        const n = r.toString();
        if (n === "Symbol(Symbol.toPrimitive)" || n === "Symbol(Symbol.toStringTag)" || n === "Symbol(util.inspect.custom)")
          return;
      }
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${r}" property of the session object is not supported. Please use getUser() instead.`);
    },
    set: (e, r) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${r}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    },
    deleteProperty: (e, r) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${r}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    }
  });
}
function tm(t, e) {
  return new Proxy(t, {
    get: (r, n, i) => {
      if (n === "__isInsecureUserWarningProxy")
        return !0;
      if (typeof n == "symbol") {
        const s = n.toString();
        if (s === "Symbol(Symbol.toPrimitive)" || s === "Symbol(Symbol.toStringTag)" || s === "Symbol(util.inspect.custom)" || s === "Symbol(nodejs.util.inspect.custom)")
          return Reflect.get(r, n, i);
      }
      return !e.value && typeof n == "string" && (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), e.value = !0), Reflect.get(r, n, i);
    }
  });
}
function Sc(t) {
  return JSON.parse(JSON.stringify(t));
}
const ot = (t) => t.msg || t.message || t.error_description || t.error || JSON.stringify(t), rm = [502, 503, 504];
async function Rc(t) {
  var e;
  if (!zp(t))
    throw new ci(ot(t), 0);
  if (rm.includes(t.status))
    throw new ci(ot(t), t.status);
  let r;
  try {
    r = await t.json();
  } catch (s) {
    throw new ut(ot(s), s);
  }
  let n;
  const i = Yp(t);
  if (i && i.getTime() >= gu["2024-01-01"].timestamp && typeof r == "object" && r && typeof r.code == "string" ? n = r.code : typeof r == "object" && r && typeof r.error_code == "string" && (n = r.error_code), n) {
    if (n === "weak_password")
      throw new wc(ot(r), t.status, ((e = r.weak_password) === null || e === void 0 ? void 0 : e.reasons) || []);
    if (n === "session_not_found")
      throw new ke();
  } else if (typeof r == "object" && r && typeof r.weak_password == "object" && r.weak_password && Array.isArray(r.weak_password.reasons) && r.weak_password.reasons.length && r.weak_password.reasons.reduce((s, a) => s && typeof a == "string", !0))
    throw new wc(ot(r), t.status, r.weak_password.reasons);
  throw new Ip(ot(r), t.status || 500, n);
}
const nm = (t, e, r, n) => {
  const i = { method: t, headers: e?.headers || {} };
  return t === "GET" ? i : (i.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, e?.headers), i.body = JSON.stringify(n), Object.assign(Object.assign({}, i), r));
};
async function ee(t, e, r, n) {
  var i;
  const s = Object.assign({}, n?.headers);
  s[oi] || (s[oi] = gu["2024-01-01"].name), n?.jwt && (s.Authorization = `Bearer ${n.jwt}`);
  const a = (i = n?.query) !== null && i !== void 0 ? i : {};
  n?.redirectTo && (a.redirect_to = n.redirectTo);
  const o = Object.keys(a).length ? "?" + new URLSearchParams(a).toString() : "", c = await sm(t, e, r + o, {
    headers: s,
    noResolveJson: n?.noResolveJson
  }, {}, n?.body);
  return n?.xform ? n?.xform(c) : { data: Object.assign({}, c), error: null };
}
async function sm(t, e, r, n, i, s) {
  const a = nm(e, n, i, s);
  let o;
  try {
    o = await t(r, Object.assign({}, a));
  } catch (c) {
    throw console.error(c), new ci(ot(c), 0);
  }
  if (o.ok || await Rc(o), n?.noResolveJson)
    return o;
  try {
    return await o.json();
  } catch (c) {
    await Rc(c);
  }
}
function Ne(t) {
  var e;
  let r = null;
  om(t) && (r = Object.assign({}, t), t.expires_at || (r.expires_at = xp(t.expires_in)));
  const n = (e = t.user) !== null && e !== void 0 ? e : t;
  return { data: { session: r, user: n }, error: null };
}
function Oc(t) {
  const e = Ne(t);
  return !e.error && t.weak_password && typeof t.weak_password == "object" && Array.isArray(t.weak_password.reasons) && t.weak_password.reasons.length && t.weak_password.message && typeof t.weak_password.message == "string" && t.weak_password.reasons.reduce((r, n) => r && typeof n == "string", !0) && (e.data.weak_password = t.weak_password), e;
}
function et(t) {
  var e;
  return { data: { user: (e = t.user) !== null && e !== void 0 ? e : t }, error: null };
}
function im(t) {
  return { data: t, error: null };
}
function am(t) {
  const { action_link: e, email_otp: r, hashed_token: n, redirect_to: i, verification_type: s } = t, a = On(t, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]), o = {
    action_link: e,
    email_otp: r,
    hashed_token: n,
    redirect_to: i,
    verification_type: s
  }, c = Object.assign({}, a);
  return {
    data: {
      properties: o,
      user: c
    },
    error: null
  };
}
function Tc(t) {
  return t;
}
function om(t) {
  return t.access_token && t.refresh_token && t.expires_in;
}
const Xs = ["global", "local", "others"];
class cm {
  /**
   * Creates an admin API client that can be used to manage users and OAuth clients.
   *
   * @example
   * ```ts
   * import { GoTrueAdminApi } from '@supabase/auth-js'
   *
   * const admin = new GoTrueAdminApi({
   *   url: 'https://xyzcompany.supabase.co/auth/v1',
   *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
   * })
   * ```
   */
  constructor({ url: e = "", headers: r = {}, fetch: n }) {
    this.url = e, this.headers = r, this.fetch = wu(n), this.mfa = {
      listFactors: this._listFactors.bind(this),
      deleteFactor: this._deleteFactor.bind(this)
    }, this.oauth = {
      listClients: this._listOAuthClients.bind(this),
      createClient: this._createOAuthClient.bind(this),
      getClient: this._getOAuthClient.bind(this),
      updateClient: this._updateOAuthClient.bind(this),
      deleteClient: this._deleteOAuthClient.bind(this),
      regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
    };
  }
  /**
   * Removes a logged-in session.
   * @param jwt A valid, logged-in JWT.
   * @param scope The logout sope.
   */
  async signOut(e, r = Xs[0]) {
    if (Xs.indexOf(r) < 0)
      throw new Error(`@supabase/auth-js: Parameter scope must be one of ${Xs.join(", ")}`);
    try {
      return await ee(this.fetch, "POST", `${this.url}/logout?scope=${r}`, {
        headers: this.headers,
        jwt: e,
        noResolveJson: !0
      }), { data: null, error: null };
    } catch (n) {
      if (Y(n))
        return { data: null, error: n };
      throw n;
    }
  }
  /**
   * Sends an invite link to an email address.
   * @param email The email address of the user.
   * @param options Additional options to be included when inviting.
   */
  async inviteUserByEmail(e, r = {}) {
    try {
      return await ee(this.fetch, "POST", `${this.url}/invite`, {
        body: { email: e, data: r.data },
        headers: this.headers,
        redirectTo: r.redirectTo,
        xform: et
      });
    } catch (n) {
      if (Y(n))
        return { data: { user: null }, error: n };
      throw n;
    }
  }
  /**
   * Generates email links and OTPs to be sent via a custom email provider.
   * @param email The user's email.
   * @param options.password User password. For signup only.
   * @param options.data Optional user metadata. For signup only.
   * @param options.redirectTo The redirect url which should be appended to the generated link
   */
  async generateLink(e) {
    try {
      const { options: r } = e, n = On(e, ["options"]), i = Object.assign(Object.assign({}, n), r);
      return "newEmail" in n && (i.new_email = n?.newEmail, delete i.newEmail), await ee(this.fetch, "POST", `${this.url}/admin/generate_link`, {
        body: i,
        headers: this.headers,
        xform: am,
        redirectTo: r?.redirectTo
      });
    } catch (r) {
      if (Y(r))
        return {
          data: {
            properties: null,
            user: null
          },
          error: r
        };
      throw r;
    }
  }
  // User Admin API
  /**
   * Creates a new user.
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async createUser(e) {
    try {
      return await ee(this.fetch, "POST", `${this.url}/admin/users`, {
        body: e,
        headers: this.headers,
        xform: et
      });
    } catch (r) {
      if (Y(r))
        return { data: { user: null }, error: r };
      throw r;
    }
  }
  /**
   * Get a list of users.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
   */
  async listUsers(e) {
    var r, n, i, s, a, o, c;
    try {
      const u = { nextPage: null, lastPage: 0, total: 0 }, l = await ee(this.fetch, "GET", `${this.url}/admin/users`, {
        headers: this.headers,
        noResolveJson: !0,
        query: {
          page: (n = (r = e?.page) === null || r === void 0 ? void 0 : r.toString()) !== null && n !== void 0 ? n : "",
          per_page: (s = (i = e?.perPage) === null || i === void 0 ? void 0 : i.toString()) !== null && s !== void 0 ? s : ""
        },
        xform: Tc
      });
      if (l.error)
        throw l.error;
      const m = await l.json(), d = (a = l.headers.get("x-total-count")) !== null && a !== void 0 ? a : 0, h = (c = (o = l.headers.get("link")) === null || o === void 0 ? void 0 : o.split(",")) !== null && c !== void 0 ? c : [];
      return h.length > 0 && (h.forEach((v) => {
        const w = parseInt(v.split(";")[0].split("=")[1].substring(0, 1)), p = JSON.parse(v.split(";")[1].split("=")[1]);
        u[`${p}Page`] = w;
      }), u.total = parseInt(d)), { data: Object.assign(Object.assign({}, m), u), error: null };
    } catch (u) {
      if (Y(u))
        return { data: { users: [] }, error: u };
      throw u;
    }
  }
  /**
   * Get user by id.
   *
   * @param uid The user's unique identifier
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async getUserById(e) {
    bt(e);
    try {
      return await ee(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        xform: et
      });
    } catch (r) {
      if (Y(r))
        return { data: { user: null }, error: r };
      throw r;
    }
  }
  /**
   * Updates the user data. Changes are applied directly without confirmation flows.
   *
   * @param attributes The data you want to update.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async updateUserById(e, r) {
    bt(e);
    try {
      return await ee(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
        body: r,
        headers: this.headers,
        xform: et
      });
    } catch (n) {
      if (Y(n))
        return { data: { user: null }, error: n };
      throw n;
    }
  }
  /**
   * Delete a user. Requires a `service_role` key.
   *
   * @param id The user id you want to remove.
   * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
   * Defaults to false for backward compatibility.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async deleteUser(e, r = !1) {
    bt(e);
    try {
      return await ee(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        body: {
          should_soft_delete: r
        },
        xform: et
      });
    } catch (n) {
      if (Y(n))
        return { data: { user: null }, error: n };
      throw n;
    }
  }
  async _listFactors(e) {
    bt(e.userId);
    try {
      const { data: r, error: n } = await ee(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, {
        headers: this.headers,
        xform: (i) => ({ data: { factors: i }, error: null })
      });
      return { data: r, error: n };
    } catch (r) {
      if (Y(r))
        return { data: null, error: r };
      throw r;
    }
  }
  async _deleteFactor(e) {
    bt(e.userId), bt(e.id);
    try {
      return { data: await ee(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, {
        headers: this.headers
      }), error: null };
    } catch (r) {
      if (Y(r))
        return { data: null, error: r };
      throw r;
    }
  }
  /**
   * Lists all OAuth clients with optional pagination.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _listOAuthClients(e) {
    var r, n, i, s, a, o, c;
    try {
      const u = { nextPage: null, lastPage: 0, total: 0 }, l = await ee(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
        headers: this.headers,
        noResolveJson: !0,
        query: {
          page: (n = (r = e?.page) === null || r === void 0 ? void 0 : r.toString()) !== null && n !== void 0 ? n : "",
          per_page: (s = (i = e?.perPage) === null || i === void 0 ? void 0 : i.toString()) !== null && s !== void 0 ? s : ""
        },
        xform: Tc
      });
      if (l.error)
        throw l.error;
      const m = await l.json(), d = (a = l.headers.get("x-total-count")) !== null && a !== void 0 ? a : 0, h = (c = (o = l.headers.get("link")) === null || o === void 0 ? void 0 : o.split(",")) !== null && c !== void 0 ? c : [];
      return h.length > 0 && (h.forEach((v) => {
        const w = parseInt(v.split(";")[0].split("=")[1].substring(0, 1)), p = JSON.parse(v.split(";")[1].split("=")[1]);
        u[`${p}Page`] = w;
      }), u.total = parseInt(d)), { data: Object.assign(Object.assign({}, m), u), error: null };
    } catch (u) {
      if (Y(u))
        return { data: { clients: [] }, error: u };
      throw u;
    }
  }
  /**
   * Creates a new OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _createOAuthClient(e) {
    try {
      return await ee(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
        body: e,
        headers: this.headers,
        xform: (r) => ({ data: r, error: null })
      });
    } catch (r) {
      if (Y(r))
        return { data: null, error: r };
      throw r;
    }
  }
  /**
   * Gets details of a specific OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _getOAuthClient(e) {
    try {
      return await ee(this.fetch, "GET", `${this.url}/admin/oauth/clients/${e}`, {
        headers: this.headers,
        xform: (r) => ({ data: r, error: null })
      });
    } catch (r) {
      if (Y(r))
        return { data: null, error: r };
      throw r;
    }
  }
  /**
   * Updates an existing OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _updateOAuthClient(e, r) {
    try {
      return await ee(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${e}`, {
        body: r,
        headers: this.headers,
        xform: (n) => ({ data: n, error: null })
      });
    } catch (n) {
      if (Y(n))
        return { data: null, error: n };
      throw n;
    }
  }
  /**
   * Deletes an OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _deleteOAuthClient(e) {
    try {
      return await ee(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${e}`, {
        headers: this.headers,
        noResolveJson: !0
      }), { data: null, error: null };
    } catch (r) {
      if (Y(r))
        return { data: null, error: r };
      throw r;
    }
  }
  /**
   * Regenerates the secret for an OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _regenerateOAuthClientSecret(e) {
    try {
      return await ee(this.fetch, "POST", `${this.url}/admin/oauth/clients/${e}/regenerate_secret`, {
        headers: this.headers,
        xform: (r) => ({ data: r, error: null })
      });
    } catch (r) {
      if (Y(r))
        return { data: null, error: r };
      throw r;
    }
  }
}
function Pc(t = {}) {
  return {
    getItem: (e) => t[e] || null,
    setItem: (e, r) => {
      t[e] = r;
    },
    removeItem: (e) => {
      delete t[e];
    }
  };
}
const Et = {
  /**
   * @experimental
   */
  debug: !!(globalThis && _u() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
};
class bu extends Error {
  constructor(e) {
    super(e), this.isAcquireTimeout = !0;
  }
}
class um extends bu {
}
async function lm(t, e, r) {
  Et.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", t, e);
  const n = new globalThis.AbortController();
  return e > 0 && setTimeout(() => {
    n.abort(), Et.debug && console.log("@supabase/gotrue-js: navigatorLock acquire timed out", t);
  }, e), await Promise.resolve().then(() => globalThis.navigator.locks.request(t, e === 0 ? {
    mode: "exclusive",
    ifAvailable: !0
  } : {
    mode: "exclusive",
    signal: n.signal
  }, async (i) => {
    if (i) {
      Et.debug && console.log("@supabase/gotrue-js: navigatorLock: acquired", t, i.name);
      try {
        return await r();
      } finally {
        Et.debug && console.log("@supabase/gotrue-js: navigatorLock: released", t, i.name);
      }
    } else {
      if (e === 0)
        throw Et.debug && console.log("@supabase/gotrue-js: navigatorLock: not immediately available", t), new um(`Acquiring an exclusive Navigator LockManager lock "${t}" immediately failed`);
      if (Et.debug)
        try {
          const s = await globalThis.navigator.locks.query();
          console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(s, null, "  "));
        } catch (s) {
          console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", s);
        }
      return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"), await r();
    }
  }));
}
function dm() {
  if (typeof globalThis != "object")
    try {
      Object.defineProperty(Object.prototype, "__magic__", {
        get: function() {
          return this;
        },
        configurable: !0
      }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
    } catch {
      typeof self < "u" && (self.globalThis = self);
    }
}
function Eu(t) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(t))
    throw new Error(`@supabase/auth-js: Address "${t}" is invalid.`);
  return t.toLowerCase();
}
function hm(t) {
  return parseInt(t, 16);
}
function fm(t) {
  const e = new TextEncoder().encode(t);
  return "0x" + Array.from(e, (n) => n.toString(16).padStart(2, "0")).join("");
}
function pm(t) {
  var e;
  const { chainId: r, domain: n, expirationTime: i, issuedAt: s = /* @__PURE__ */ new Date(), nonce: a, notBefore: o, requestId: c, resources: u, scheme: l, uri: m, version: d } = t;
  {
    if (!Number.isInteger(r))
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${r}`);
    if (!n)
      throw new Error('@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.');
    if (a && a.length < 8)
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${a}`);
    if (!m)
      throw new Error('@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.');
    if (d !== "1")
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${d}`);
    if (!((e = t.statement) === null || e === void 0) && e.includes(`
`))
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${t.statement}`);
  }
  const h = Eu(t.address), v = l ? `${l}://${n}` : n, w = t.statement ? `${t.statement}
` : "", p = `${v} wants you to sign in with your Ethereum account:
${h}

${w}`;
  let _ = `URI: ${m}
Version: ${d}
Chain ID: ${r}${a ? `
Nonce: ${a}` : ""}
Issued At: ${s.toISOString()}`;
  if (i && (_ += `
Expiration Time: ${i.toISOString()}`), o && (_ += `
Not Before: ${o.toISOString()}`), c && (_ += `
Request ID: ${c}`), u) {
    let f = `
Resources:`;
    for (const g of u) {
      if (!g || typeof g != "string")
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${g}`);
      f += `
- ${g}`;
    }
    _ += f;
  }
  return `${p}
${_}`;
}
class pe extends Error {
  constructor({ message: e, code: r, cause: n, name: i }) {
    var s;
    super(e, { cause: n }), this.__isWebAuthnError = !0, this.name = (s = i ?? (n instanceof Error ? n.name : void 0)) !== null && s !== void 0 ? s : "Unknown Error", this.code = r;
  }
}
class fn extends pe {
  constructor(e, r) {
    super({
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: r,
      message: e
    }), this.name = "WebAuthnUnknownError", this.originalError = r;
  }
}
function mm({ error: t, options: e }) {
  var r, n, i;
  const { publicKey: s } = e;
  if (!s)
    throw Error("options was missing required publicKey property");
  if (t.name === "AbortError") {
    if (e.signal instanceof AbortSignal)
      return new pe({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: t
      });
  } else if (t.name === "ConstraintError") {
    if (((r = s.authenticatorSelection) === null || r === void 0 ? void 0 : r.requireResidentKey) === !0)
      return new pe({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: t
      });
    if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      e.mediation === "conditional" && ((n = s.authenticatorSelection) === null || n === void 0 ? void 0 : n.userVerification) === "required"
    )
      return new pe({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: t
      });
    if (((i = s.authenticatorSelection) === null || i === void 0 ? void 0 : i.userVerification) === "required")
      return new pe({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: t
      });
  } else {
    if (t.name === "InvalidStateError")
      return new pe({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: t
      });
    if (t.name === "NotAllowedError")
      return new pe({
        message: t.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: t
      });
    if (t.name === "NotSupportedError")
      return s.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new pe({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: t
      }) : new pe({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: t
      });
    if (t.name === "SecurityError") {
      const a = window.location.hostname;
      if ($u(a)) {
        if (s.rp.id !== a)
          return new pe({
            message: `The RP ID "${s.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: t
          });
      } else return new pe({
        message: `${window.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: t
      });
    } else if (t.name === "TypeError") {
      if (s.user.id.byteLength < 1 || s.user.id.byteLength > 64)
        return new pe({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: t
        });
    } else if (t.name === "UnknownError")
      return new pe({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: t
      });
  }
  return new pe({
    message: "a Non-Webauthn related error has occurred",
    code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
    cause: t
  });
}
function ym({ error: t, options: e }) {
  const { publicKey: r } = e;
  if (!r)
    throw Error("options was missing required publicKey property");
  if (t.name === "AbortError") {
    if (e.signal instanceof AbortSignal)
      return new pe({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: t
      });
  } else {
    if (t.name === "NotAllowedError")
      return new pe({
        message: t.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: t
      });
    if (t.name === "SecurityError") {
      const n = window.location.hostname;
      if ($u(n)) {
        if (r.rpId !== n)
          return new pe({
            message: `The RP ID "${r.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: t
          });
      } else return new pe({
        message: `${window.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: t
      });
    } else if (t.name === "UnknownError")
      return new pe({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: t
      });
  }
  return new pe({
    message: "a Non-Webauthn related error has occurred",
    code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
    cause: t
  });
}
class gm {
  /**
   * Create an abort signal for a new WebAuthn operation.
   * Automatically cancels any existing operation.
   *
   * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
   */
  createNewAbortSignal() {
    if (this.controller) {
      const r = new Error("Cancelling existing WebAuthn API call for new one");
      r.name = "AbortError", this.controller.abort(r);
    }
    const e = new AbortController();
    return this.controller = e, e.signal;
  }
  /**
   * Manually cancel the current WebAuthn operation.
   * Useful for cleaning up when user cancels or navigates away.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
   */
  cancelCeremony() {
    if (this.controller) {
      const e = new Error("Manually cancelling existing WebAuthn API call");
      e.name = "AbortError", this.controller.abort(e), this.controller = void 0;
    }
  }
}
const vm = new gm();
function _m(t) {
  if (!t)
    throw new Error("Credential creation options are required");
  if (typeof PublicKeyCredential < "u" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON == "function")
    return PublicKeyCredential.parseCreationOptionsFromJSON(
      /** we assert the options here as typescript still doesn't know about future webauthn types */
      t
    );
  const { challenge: e, user: r, excludeCredentials: n } = t, i = On(
    t,
    ["challenge", "user", "excludeCredentials"]
  ), s = At(e).buffer, a = Object.assign(Object.assign({}, r), { id: At(r.id).buffer }), o = Object.assign(Object.assign({}, i), {
    challenge: s,
    user: a
  });
  if (n && n.length > 0) {
    o.excludeCredentials = new Array(n.length);
    for (let c = 0; c < n.length; c++) {
      const u = n[c];
      o.excludeCredentials[c] = Object.assign(Object.assign({}, u), {
        id: At(u.id).buffer,
        type: u.type || "public-key",
        // Cast transports to handle future transport types like "cable"
        transports: u.transports
      });
    }
  }
  return o;
}
function wm(t) {
  if (!t)
    throw new Error("Credential request options are required");
  if (typeof PublicKeyCredential < "u" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON == "function")
    return PublicKeyCredential.parseRequestOptionsFromJSON(t);
  const { challenge: e, allowCredentials: r } = t, n = On(
    t,
    ["challenge", "allowCredentials"]
  ), i = At(e).buffer, s = Object.assign(Object.assign({}, n), { challenge: i });
  if (r && r.length > 0) {
    s.allowCredentials = new Array(r.length);
    for (let a = 0; a < r.length; a++) {
      const o = r[a];
      s.allowCredentials[a] = Object.assign(Object.assign({}, o), {
        id: At(o.id).buffer,
        type: o.type || "public-key",
        // Cast transports to handle future transport types like "cable"
        transports: o.transports
      });
    }
  }
  return s;
}
function bm(t) {
  var e;
  if ("toJSON" in t && typeof t.toJSON == "function")
    return t.toJSON();
  const r = t;
  return {
    id: t.id,
    rawId: t.id,
    response: {
      attestationObject: lt(new Uint8Array(t.response.attestationObject)),
      clientDataJSON: lt(new Uint8Array(t.response.clientDataJSON))
    },
    type: "public-key",
    clientExtensionResults: t.getClientExtensionResults(),
    // Convert null to undefined and cast to AuthenticatorAttachment type
    authenticatorAttachment: (e = r.authenticatorAttachment) !== null && e !== void 0 ? e : void 0
  };
}
function Em(t) {
  var e;
  if ("toJSON" in t && typeof t.toJSON == "function")
    return t.toJSON();
  const r = t, n = t.getClientExtensionResults(), i = t.response;
  return {
    id: t.id,
    rawId: t.id,
    // W3C spec expects rawId to match id for JSON format
    response: {
      authenticatorData: lt(new Uint8Array(i.authenticatorData)),
      clientDataJSON: lt(new Uint8Array(i.clientDataJSON)),
      signature: lt(new Uint8Array(i.signature)),
      userHandle: i.userHandle ? lt(new Uint8Array(i.userHandle)) : void 0
    },
    type: "public-key",
    clientExtensionResults: n,
    // Convert null to undefined and cast to AuthenticatorAttachment type
    authenticatorAttachment: (e = r.authenticatorAttachment) !== null && e !== void 0 ? e : void 0
  };
}
function $u(t) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    t === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(t)
  );
}
function kc() {
  var t, e;
  return !!(_e() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof ((t = navigator?.credentials) === null || t === void 0 ? void 0 : t.create) == "function" && typeof ((e = navigator?.credentials) === null || e === void 0 ? void 0 : e.get) == "function");
}
async function $m(t) {
  try {
    const e = await navigator.credentials.create(
      /** we assert the type here until typescript types are updated */
      t
    );
    return e ? e instanceof PublicKeyCredential ? { data: e, error: null } : {
      data: null,
      error: new fn("Browser returned unexpected credential type", e)
    } : {
      data: null,
      error: new fn("Empty credential response", e)
    };
  } catch (e) {
    return {
      data: null,
      error: mm({
        error: e,
        options: t
      })
    };
  }
}
async function Sm(t) {
  try {
    const e = await navigator.credentials.get(
      /** we assert the type here until typescript types are updated */
      t
    );
    return e ? e instanceof PublicKeyCredential ? { data: e, error: null } : {
      data: null,
      error: new fn("Browser returned unexpected credential type", e)
    } : {
      data: null,
      error: new fn("Empty credential response", e)
    };
  } catch (e) {
    return {
      data: null,
      error: ym({
        error: e,
        options: t
      })
    };
  }
}
const Rm = {
  hints: ["security-key"],
  authenticatorSelection: {
    authenticatorAttachment: "cross-platform",
    requireResidentKey: !1,
    /** set to preferred because older yubikeys don't have PIN/Biometric */
    userVerification: "preferred",
    residentKey: "discouraged"
  },
  attestation: "direct"
}, Om = {
  /** set to preferred because older yubikeys don't have PIN/Biometric */
  userVerification: "preferred",
  hints: ["security-key"],
  attestation: "direct"
};
function pn(...t) {
  const e = (i) => i !== null && typeof i == "object" && !Array.isArray(i), r = (i) => i instanceof ArrayBuffer || ArrayBuffer.isView(i), n = {};
  for (const i of t)
    if (i)
      for (const s in i) {
        const a = i[s];
        if (a !== void 0)
          if (Array.isArray(a))
            n[s] = a;
          else if (r(a))
            n[s] = a;
          else if (e(a)) {
            const o = n[s];
            e(o) ? n[s] = pn(o, a) : n[s] = pn(a);
          } else
            n[s] = a;
      }
  return n;
}
function Tm(t, e) {
  return pn(Rm, t, e || {});
}
function Pm(t, e) {
  return pn(Om, t, e || {});
}
class km {
  constructor(e) {
    this.client = e, this.enroll = this._enroll.bind(this), this.challenge = this._challenge.bind(this), this.verify = this._verify.bind(this), this.authenticate = this._authenticate.bind(this), this.register = this._register.bind(this);
  }
  /**
   * Enroll a new WebAuthn factor.
   * Creates an unverified WebAuthn factor that must be verified with a credential.
   *
   * @experimental This method is experimental and may change in future releases
   * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
   * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
   * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
   */
  async _enroll(e) {
    return this.client.mfa.enroll(Object.assign(Object.assign({}, e), { factorType: "webauthn" }));
  }
  /**
   * Challenge for WebAuthn credential creation or authentication.
   * Combines server challenge with browser credential operations.
   * Handles both registration (create) and authentication (request) flows.
   *
   * @experimental This method is experimental and may change in future releases
   * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
   * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
   * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
   * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
   * @returns {Promise<RequestResult>} Challenge response with credential or error
   * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
   * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
   */
  async _challenge({ factorId: e, webauthn: r, friendlyName: n, signal: i }, s) {
    var a;
    try {
      const { data: o, error: c } = await this.client.mfa.challenge({
        factorId: e,
        webauthn: r
      });
      if (!o)
        return { data: null, error: c };
      const u = i ?? vm.createNewAbortSignal();
      if (o.webauthn.type === "create") {
        const { user: l } = o.webauthn.credential_options.publicKey;
        if (!l.name) {
          const m = n;
          if (m)
            l.name = `${l.id}:${m}`;
          else {
            const h = (await this.client.getUser()).data.user, v = ((a = h?.user_metadata) === null || a === void 0 ? void 0 : a.name) || h?.email || h?.id || "User";
            l.name = `${l.id}:${v}`;
          }
        }
        l.displayName || (l.displayName = l.name);
      }
      switch (o.webauthn.type) {
        case "create": {
          const l = Tm(o.webauthn.credential_options.publicKey, s?.create), { data: m, error: d } = await $m({
            publicKey: l,
            signal: u
          });
          return m ? {
            data: {
              factorId: e,
              challengeId: o.id,
              webauthn: {
                type: o.webauthn.type,
                credential_response: m
              }
            },
            error: null
          } : { data: null, error: d };
        }
        case "request": {
          const l = Pm(o.webauthn.credential_options.publicKey, s?.request), { data: m, error: d } = await Sm(Object.assign(Object.assign({}, o.webauthn.credential_options), { publicKey: l, signal: u }));
          return m ? {
            data: {
              factorId: e,
              challengeId: o.id,
              webauthn: {
                type: o.webauthn.type,
                credential_response: m
              }
            },
            error: null
          } : { data: null, error: d };
        }
      }
    } catch (o) {
      return Y(o) ? { data: null, error: o } : {
        data: null,
        error: new ut("Unexpected error in challenge", o)
      };
    }
  }
  /**
   * Verify a WebAuthn credential with the server.
   * Completes the WebAuthn ceremony by sending the credential to the server for verification.
   *
   * @experimental This method is experimental and may change in future releases
   * @param {Object} params - Verification parameters
   * @param {string} params.challengeId - ID of the challenge being verified
   * @param {string} params.factorId - ID of the WebAuthn factor
   * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
   * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
   * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
   * */
  async _verify({ challengeId: e, factorId: r, webauthn: n }) {
    return this.client.mfa.verify({
      factorId: r,
      challengeId: e,
      webauthn: n
    });
  }
  /**
   * Complete WebAuthn authentication flow.
   * Performs challenge and verification in a single operation for existing credentials.
   *
   * @experimental This method is experimental and may change in future releases
   * @param {Object} params - Authentication parameters
   * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
   * @param {Object} params.webauthn - WebAuthn configuration
   * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
   * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
   * @param {AbortSignal} params.webauthn.signal - Optional abort signal
   * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
   * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
   * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
   */
  async _authenticate({ factorId: e, webauthn: { rpId: r = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: n = typeof window < "u" ? [window.location.origin] : void 0, signal: i } = {} }, s) {
    if (!r)
      return {
        data: null,
        error: new Kt("rpId is required for WebAuthn authentication")
      };
    try {
      if (!kc())
        return {
          data: null,
          error: new ut("Browser does not support WebAuthn", null)
        };
      const { data: a, error: o } = await this.challenge({
        factorId: e,
        webauthn: { rpId: r, rpOrigins: n },
        signal: i
      }, { request: s });
      if (!a)
        return { data: null, error: o };
      const { webauthn: c } = a;
      return this._verify({
        factorId: e,
        challengeId: a.challengeId,
        webauthn: {
          type: c.type,
          rpId: r,
          rpOrigins: n,
          credential_response: c.credential_response
        }
      });
    } catch (a) {
      return Y(a) ? { data: null, error: a } : {
        data: null,
        error: new ut("Unexpected error in authenticate", a)
      };
    }
  }
  /**
   * Complete WebAuthn registration flow.
   * Performs enrollment, challenge, and verification in a single operation for new credentials.
   *
   * @experimental This method is experimental and may change in future releases
   * @param {Object} params - Registration parameters
   * @param {string} params.friendlyName - User-friendly name for the credential
   * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
   * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
   * @param {AbortSignal} params.signal - Optional abort signal
   * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
   * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
   * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
   */
  async _register({ friendlyName: e, webauthn: { rpId: r = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: n = typeof window < "u" ? [window.location.origin] : void 0, signal: i } = {} }, s) {
    if (!r)
      return {
        data: null,
        error: new Kt("rpId is required for WebAuthn registration")
      };
    try {
      if (!kc())
        return {
          data: null,
          error: new ut("Browser does not support WebAuthn", null)
        };
      const { data: a, error: o } = await this._enroll({
        friendlyName: e
      });
      if (!a)
        return await this.client.mfa.listFactors().then((l) => {
          var m;
          return (m = l.data) === null || m === void 0 ? void 0 : m.all.find((d) => d.factor_type === "webauthn" && d.friendly_name === e && d.status !== "unverified");
        }).then((l) => l ? this.client.mfa.unenroll({ factorId: l?.id }) : void 0), { data: null, error: o };
      const { data: c, error: u } = await this._challenge({
        factorId: a.id,
        friendlyName: a.friendly_name,
        webauthn: { rpId: r, rpOrigins: n },
        signal: i
      }, {
        create: s
      });
      return c ? this._verify({
        factorId: a.id,
        challengeId: c.challengeId,
        webauthn: {
          rpId: r,
          rpOrigins: n,
          type: c.webauthn.type,
          credential_response: c.webauthn.credential_response
        }
      }) : { data: null, error: u };
    } catch (a) {
      return Y(a) ? { data: null, error: a } : {
        data: null,
        error: new ut("Unexpected error in register", a)
      };
    }
  }
}
dm();
const Am = {
  url: Op,
  storageKey: Tp,
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  headers: Pp,
  flowType: "implicit",
  debug: !1,
  hasCustomAuthorizationHeader: !1,
  throwOnError: !1,
  lockAcquireTimeout: 1e4
  // 10 seconds
};
async function Ac(t, e, r) {
  return await r();
}
const $t = {};
class Gt {
  /**
   * The JWKS used for verifying asymmetric JWTs
   */
  get jwks() {
    var e, r;
    return (r = (e = $t[this.storageKey]) === null || e === void 0 ? void 0 : e.jwks) !== null && r !== void 0 ? r : { keys: [] };
  }
  set jwks(e) {
    $t[this.storageKey] = Object.assign(Object.assign({}, $t[this.storageKey]), { jwks: e });
  }
  get jwks_cached_at() {
    var e, r;
    return (r = (e = $t[this.storageKey]) === null || e === void 0 ? void 0 : e.cachedAt) !== null && r !== void 0 ? r : Number.MIN_SAFE_INTEGER;
  }
  set jwks_cached_at(e) {
    $t[this.storageKey] = Object.assign(Object.assign({}, $t[this.storageKey]), { cachedAt: e });
  }
  /**
   * Create a new client for use in the browser.
   *
   * @example
   * ```ts
   * import { GoTrueClient } from '@supabase/auth-js'
   *
   * const auth = new GoTrueClient({
   *   url: 'https://xyzcompany.supabase.co/auth/v1',
   *   headers: { apikey: 'public-anon-key' },
   *   storageKey: 'supabase-auth',
   * })
   * ```
   */
  constructor(e) {
    var r, n, i;
    this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.autoRefreshTickTimeout = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = !0, this.hasCustomAuthorizationHeader = !1, this.suppressGetSessionWarning = !1, this.lockAcquired = !1, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log;
    const s = Object.assign(Object.assign({}, Am), e);
    if (this.storageKey = s.storageKey, this.instanceID = (r = Gt.nextInstanceID[this.storageKey]) !== null && r !== void 0 ? r : 0, Gt.nextInstanceID[this.storageKey] = this.instanceID + 1, this.logDebugMessages = !!s.debug, typeof s.debug == "function" && (this.logger = s.debug), this.instanceID > 0 && _e()) {
      const a = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
      console.warn(a), this.logDebugMessages && console.trace(a);
    }
    if (this.persistSession = s.persistSession, this.autoRefreshToken = s.autoRefreshToken, this.admin = new cm({
      url: s.url,
      headers: s.headers,
      fetch: s.fetch
    }), this.url = s.url, this.headers = s.headers, this.fetch = wu(s.fetch), this.lock = s.lock || Ac, this.detectSessionInUrl = s.detectSessionInUrl, this.flowType = s.flowType, this.hasCustomAuthorizationHeader = s.hasCustomAuthorizationHeader, this.throwOnError = s.throwOnError, this.lockAcquireTimeout = s.lockAcquireTimeout, s.lock ? this.lock = s.lock : this.persistSession && _e() && (!((n = globalThis?.navigator) === null || n === void 0) && n.locks) ? this.lock = lm : this.lock = Ac, this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = {
      verify: this._verify.bind(this),
      enroll: this._enroll.bind(this),
      unenroll: this._unenroll.bind(this),
      challenge: this._challenge.bind(this),
      listFactors: this._listFactors.bind(this),
      challengeAndVerify: this._challengeAndVerify.bind(this),
      getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
      webauthn: new km(this)
    }, this.oauth = {
      getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
      approveAuthorization: this._approveAuthorization.bind(this),
      denyAuthorization: this._denyAuthorization.bind(this),
      listGrants: this._listOAuthGrants.bind(this),
      revokeGrant: this._revokeOAuthGrant.bind(this)
    }, this.persistSession ? (s.storage ? this.storage = s.storage : _u() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = Pc(this.memoryStorage)), s.userStorage && (this.userStorage = s.userStorage)) : (this.memoryStorage = {}, this.storage = Pc(this.memoryStorage)), _e() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
      try {
        this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
      } catch (a) {
        console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", a);
      }
      (i = this.broadcastChannel) === null || i === void 0 || i.addEventListener("message", async (a) => {
        this._debug("received broadcast notification from other tab or client", a);
        try {
          await this._notifyAllSubscribers(a.data.event, a.data.session, !1);
        } catch (o) {
          this._debug("#broadcastChannel", "error", o);
        }
      });
    }
    this.initialize().catch((a) => {
      this._debug("#initialize()", "error", a);
    });
  }
  /**
   * Returns whether error throwing mode is enabled for this client.
   */
  isThrowOnErrorEnabled() {
    return this.throwOnError;
  }
  /**
   * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
   * and the provided result contains a non-nullish error, the error is thrown instead of
   * being returned. This ensures consistent behavior across all public API methods.
   */
  _returnResult(e) {
    if (this.throwOnError && e && e.error)
      throw e.error;
    return e;
  }
  _logPrefix() {
    return `GoTrueClient@${this.storageKey}:${this.instanceID} (${yu}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
  }
  _debug(...e) {
    return this.logDebugMessages && this.logger(this._logPrefix(), ...e), this;
  }
  /**
   * Initializes the client session either from the url or from storage.
   * This method is automatically called when instantiating the client, but should also be called
   * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
   */
  async initialize() {
    return this.initializePromise ? await this.initializePromise : (this.initializePromise = (async () => await this._acquireLock(this.lockAcquireTimeout, async () => await this._initialize()))(), await this.initializePromise);
  }
  /**
   * IMPORTANT:
   * 1. Never throw in this method, as it is called from the constructor
   * 2. Never return a session from this method as it would be cached over
   *    the whole lifetime of the client
   */
  async _initialize() {
    var e;
    try {
      let r = {}, n = "none";
      if (_e() && (r = Vp(window.location.href), this._isImplicitGrantCallback(r) ? n = "implicit" : await this._isPKCECallback(r) && (n = "pkce")), _e() && this.detectSessionInUrl && n !== "none") {
        const { data: i, error: s } = await this._getSessionFromURL(r, n);
        if (s) {
          if (this._debug("#_initialize()", "error detecting session from URL", s), Np(s)) {
            const c = (e = s.details) === null || e === void 0 ? void 0 : e.code;
            if (c === "identity_already_exists" || c === "identity_not_found" || c === "single_identity_not_deletable")
              return { error: s };
          }
          return { error: s };
        }
        const { session: a, redirectType: o } = i;
        return this._debug("#_initialize()", "detected session in URL", a, "redirect type", o), await this._saveSession(a), setTimeout(async () => {
          o === "recovery" ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", a) : await this._notifyAllSubscribers("SIGNED_IN", a);
        }, 0), { error: null };
      }
      return await this._recoverAndRefresh(), { error: null };
    } catch (r) {
      return Y(r) ? this._returnResult({ error: r }) : this._returnResult({
        error: new ut("Unexpected error during initialization", r)
      });
    } finally {
      await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
    }
  }
  /**
   * Creates a new anonymous user.
   *
   * @returns A session where the is_anonymous claim in the access token JWT set to true
   */
  async signInAnonymously(e) {
    var r, n, i;
    try {
      const s = await ee(this.fetch, "POST", `${this.url}/signup`, {
        headers: this.headers,
        body: {
          data: (n = (r = e?.options) === null || r === void 0 ? void 0 : r.data) !== null && n !== void 0 ? n : {},
          gotrue_meta_security: { captcha_token: (i = e?.options) === null || i === void 0 ? void 0 : i.captchaToken }
        },
        xform: Ne
      }), { data: a, error: o } = s;
      if (o || !a)
        return this._returnResult({ data: { user: null, session: null }, error: o });
      const c = a.session, u = a.user;
      return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers("SIGNED_IN", c)), this._returnResult({ data: { user: u, session: c }, error: null });
    } catch (s) {
      if (Y(s))
        return this._returnResult({ data: { user: null, session: null }, error: s });
      throw s;
    }
  }
  /**
   * Creates a new user.
   *
   * Be aware that if a user account exists in the system you may get back an
   * error message that attempts to hide this information from the user.
   * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
   *
   * @returns A logged-in session if the server has "autoconfirm" ON
   * @returns A user if the server has "autoconfirm" OFF
   */
  async signUp(e) {
    var r, n, i;
    try {
      let s;
      if ("email" in e) {
        const { email: l, password: m, options: d } = e;
        let h = null, v = null;
        this.flowType === "pkce" && ([h, v] = await wt(this.storage, this.storageKey)), s = await ee(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          redirectTo: d?.emailRedirectTo,
          body: {
            email: l,
            password: m,
            data: (r = d?.data) !== null && r !== void 0 ? r : {},
            gotrue_meta_security: { captcha_token: d?.captchaToken },
            code_challenge: h,
            code_challenge_method: v
          },
          xform: Ne
        });
      } else if ("phone" in e) {
        const { phone: l, password: m, options: d } = e;
        s = await ee(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            phone: l,
            password: m,
            data: (n = d?.data) !== null && n !== void 0 ? n : {},
            channel: (i = d?.channel) !== null && i !== void 0 ? i : "sms",
            gotrue_meta_security: { captcha_token: d?.captchaToken }
          },
          xform: Ne
        });
      } else
        throw new an("You must provide either an email or phone number and a password");
      const { data: a, error: o } = s;
      if (o || !a)
        return await ve(this.storage, `${this.storageKey}-code-verifier`), this._returnResult({ data: { user: null, session: null }, error: o });
      const c = a.session, u = a.user;
      return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers("SIGNED_IN", c)), this._returnResult({ data: { user: u, session: c }, error: null });
    } catch (s) {
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(s))
        return this._returnResult({ data: { user: null, session: null }, error: s });
      throw s;
    }
  }
  /**
   * Log in an existing user with an email and password or phone and password.
   *
   * Be aware that you may get back an error message that will not distinguish
   * between the cases where the account does not exist or that the
   * email/phone and password combination is wrong or that the account can only
   * be accessed via social login.
   */
  async signInWithPassword(e) {
    try {
      let r;
      if ("email" in e) {
        const { email: s, password: a, options: o } = e;
        r = await ee(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
          headers: this.headers,
          body: {
            email: s,
            password: a,
            gotrue_meta_security: { captcha_token: o?.captchaToken }
          },
          xform: Oc
        });
      } else if ("phone" in e) {
        const { phone: s, password: a, options: o } = e;
        r = await ee(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
          headers: this.headers,
          body: {
            phone: s,
            password: a,
            gotrue_meta_security: { captcha_token: o?.captchaToken }
          },
          xform: Oc
        });
      } else
        throw new an("You must provide either an email or phone number and a password");
      const { data: n, error: i } = r;
      if (i)
        return this._returnResult({ data: { user: null, session: null }, error: i });
      if (!n || !n.session || !n.user) {
        const s = new _t();
        return this._returnResult({ data: { user: null, session: null }, error: s });
      }
      return n.session && (await this._saveSession(n.session), await this._notifyAllSubscribers("SIGNED_IN", n.session)), this._returnResult({
        data: Object.assign({ user: n.user, session: n.session }, n.weak_password ? { weakPassword: n.weak_password } : null),
        error: i
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: { user: null, session: null }, error: r });
      throw r;
    }
  }
  /**
   * Log in an existing user via a third-party provider.
   * This method supports the PKCE flow.
   */
  async signInWithOAuth(e) {
    var r, n, i, s;
    return await this._handleProviderSignIn(e.provider, {
      redirectTo: (r = e.options) === null || r === void 0 ? void 0 : r.redirectTo,
      scopes: (n = e.options) === null || n === void 0 ? void 0 : n.scopes,
      queryParams: (i = e.options) === null || i === void 0 ? void 0 : i.queryParams,
      skipBrowserRedirect: (s = e.options) === null || s === void 0 ? void 0 : s.skipBrowserRedirect
    });
  }
  /**
   * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
   */
  async exchangeCodeForSession(e) {
    return await this.initializePromise, this._acquireLock(this.lockAcquireTimeout, async () => this._exchangeCodeForSession(e));
  }
  /**
   * Signs in a user by verifying a message signed by the user's private key.
   * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
   * both of which derive from the EIP-4361 standard
   * With slight variation on Solana's side.
   * @reference https://eips.ethereum.org/EIPS/eip-4361
   */
  async signInWithWeb3(e) {
    const { chain: r } = e;
    switch (r) {
      case "ethereum":
        return await this.signInWithEthereum(e);
      case "solana":
        return await this.signInWithSolana(e);
      default:
        throw new Error(`@supabase/auth-js: Unsupported chain "${r}"`);
    }
  }
  async signInWithEthereum(e) {
    var r, n, i, s, a, o, c, u, l, m, d;
    let h, v;
    if ("message" in e)
      h = e.message, v = e.signature;
    else {
      const { chain: w, wallet: p, statement: _, options: f } = e;
      let g;
      if (_e())
        if (typeof p == "object")
          g = p;
        else {
          const x = window;
          if ("ethereum" in x && typeof x.ethereum == "object" && "request" in x.ethereum && typeof x.ethereum.request == "function")
            g = x.ethereum;
          else
            throw new Error("@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.");
        }
      else {
        if (typeof p != "object" || !f?.url)
          throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
        g = p;
      }
      const S = new URL((r = f?.url) !== null && r !== void 0 ? r : window.location.href), b = await g.request({
        method: "eth_requestAccounts"
      }).then((x) => x).catch(() => {
        throw new Error("@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid");
      });
      if (!b || b.length === 0)
        throw new Error("@supabase/auth-js: No accounts available. Please ensure the wallet is connected.");
      const $ = Eu(b[0]);
      let T = (n = f?.signInWithEthereum) === null || n === void 0 ? void 0 : n.chainId;
      if (!T) {
        const x = await g.request({
          method: "eth_chainId"
        });
        T = hm(x);
      }
      const I = {
        domain: S.host,
        address: $,
        statement: _,
        uri: S.href,
        version: "1",
        chainId: T,
        nonce: (i = f?.signInWithEthereum) === null || i === void 0 ? void 0 : i.nonce,
        issuedAt: (a = (s = f?.signInWithEthereum) === null || s === void 0 ? void 0 : s.issuedAt) !== null && a !== void 0 ? a : /* @__PURE__ */ new Date(),
        expirationTime: (o = f?.signInWithEthereum) === null || o === void 0 ? void 0 : o.expirationTime,
        notBefore: (c = f?.signInWithEthereum) === null || c === void 0 ? void 0 : c.notBefore,
        requestId: (u = f?.signInWithEthereum) === null || u === void 0 ? void 0 : u.requestId,
        resources: (l = f?.signInWithEthereum) === null || l === void 0 ? void 0 : l.resources
      };
      h = pm(I), v = await g.request({
        method: "personal_sign",
        params: [fm(h), $]
      });
    }
    try {
      const { data: w, error: p } = await ee(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
        headers: this.headers,
        body: Object.assign({
          chain: "ethereum",
          message: h,
          signature: v
        }, !((m = e.options) === null || m === void 0) && m.captchaToken ? { gotrue_meta_security: { captcha_token: (d = e.options) === null || d === void 0 ? void 0 : d.captchaToken } } : null),
        xform: Ne
      });
      if (p)
        throw p;
      if (!w || !w.session || !w.user) {
        const _ = new _t();
        return this._returnResult({ data: { user: null, session: null }, error: _ });
      }
      return w.session && (await this._saveSession(w.session), await this._notifyAllSubscribers("SIGNED_IN", w.session)), this._returnResult({ data: Object.assign({}, w), error: p });
    } catch (w) {
      if (Y(w))
        return this._returnResult({ data: { user: null, session: null }, error: w });
      throw w;
    }
  }
  async signInWithSolana(e) {
    var r, n, i, s, a, o, c, u, l, m, d, h;
    let v, w;
    if ("message" in e)
      v = e.message, w = e.signature;
    else {
      const { chain: p, wallet: _, statement: f, options: g } = e;
      let S;
      if (_e())
        if (typeof _ == "object")
          S = _;
        else {
          const $ = window;
          if ("solana" in $ && typeof $.solana == "object" && ("signIn" in $.solana && typeof $.solana.signIn == "function" || "signMessage" in $.solana && typeof $.solana.signMessage == "function"))
            S = $.solana;
          else
            throw new Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
        }
      else {
        if (typeof _ != "object" || !g?.url)
          throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
        S = _;
      }
      const b = new URL((r = g?.url) !== null && r !== void 0 ? r : window.location.href);
      if ("signIn" in S && S.signIn) {
        const $ = await S.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, g?.signInWithSolana), {
          // non-overridable properties
          version: "1",
          domain: b.host,
          uri: b.href
        }), f ? { statement: f } : null));
        let T;
        if (Array.isArray($) && $[0] && typeof $[0] == "object")
          T = $[0];
        else if ($ && typeof $ == "object" && "signedMessage" in $ && "signature" in $)
          T = $;
        else
          throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
        if ("signedMessage" in T && "signature" in T && (typeof T.signedMessage == "string" || T.signedMessage instanceof Uint8Array) && T.signature instanceof Uint8Array)
          v = typeof T.signedMessage == "string" ? T.signedMessage : new TextDecoder().decode(T.signedMessage), w = T.signature;
        else
          throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
      } else {
        if (!("signMessage" in S) || typeof S.signMessage != "function" || !("publicKey" in S) || typeof S != "object" || !S.publicKey || !("toBase58" in S.publicKey) || typeof S.publicKey.toBase58 != "function")
          throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
        v = [
          `${b.host} wants you to sign in with your Solana account:`,
          S.publicKey.toBase58(),
          ...f ? ["", f, ""] : [""],
          "Version: 1",
          `URI: ${b.href}`,
          `Issued At: ${(i = (n = g?.signInWithSolana) === null || n === void 0 ? void 0 : n.issuedAt) !== null && i !== void 0 ? i : (/* @__PURE__ */ new Date()).toISOString()}`,
          ...!((s = g?.signInWithSolana) === null || s === void 0) && s.notBefore ? [`Not Before: ${g.signInWithSolana.notBefore}`] : [],
          ...!((a = g?.signInWithSolana) === null || a === void 0) && a.expirationTime ? [`Expiration Time: ${g.signInWithSolana.expirationTime}`] : [],
          ...!((o = g?.signInWithSolana) === null || o === void 0) && o.chainId ? [`Chain ID: ${g.signInWithSolana.chainId}`] : [],
          ...!((c = g?.signInWithSolana) === null || c === void 0) && c.nonce ? [`Nonce: ${g.signInWithSolana.nonce}`] : [],
          ...!((u = g?.signInWithSolana) === null || u === void 0) && u.requestId ? [`Request ID: ${g.signInWithSolana.requestId}`] : [],
          ...!((m = (l = g?.signInWithSolana) === null || l === void 0 ? void 0 : l.resources) === null || m === void 0) && m.length ? [
            "Resources",
            ...g.signInWithSolana.resources.map((T) => `- ${T}`)
          ] : []
        ].join(`
`);
        const $ = await S.signMessage(new TextEncoder().encode(v), "utf8");
        if (!$ || !($ instanceof Uint8Array))
          throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
        w = $;
      }
    }
    try {
      const { data: p, error: _ } = await ee(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
        headers: this.headers,
        body: Object.assign({ chain: "solana", message: v, signature: lt(w) }, !((d = e.options) === null || d === void 0) && d.captchaToken ? { gotrue_meta_security: { captcha_token: (h = e.options) === null || h === void 0 ? void 0 : h.captchaToken } } : null),
        xform: Ne
      });
      if (_)
        throw _;
      if (!p || !p.session || !p.user) {
        const f = new _t();
        return this._returnResult({ data: { user: null, session: null }, error: f });
      }
      return p.session && (await this._saveSession(p.session), await this._notifyAllSubscribers("SIGNED_IN", p.session)), this._returnResult({ data: Object.assign({}, p), error: _ });
    } catch (p) {
      if (Y(p))
        return this._returnResult({ data: { user: null, session: null }, error: p });
      throw p;
    }
  }
  async _exchangeCodeForSession(e) {
    const r = await at(this.storage, `${this.storageKey}-code-verifier`), [n, i] = (r ?? "").split("/");
    try {
      if (!n && this.flowType === "pkce")
        throw new Cp();
      const { data: s, error: a } = await ee(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
        headers: this.headers,
        body: {
          auth_code: e,
          code_verifier: n
        },
        xform: Ne
      });
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), a)
        throw a;
      if (!s || !s.session || !s.user) {
        const o = new _t();
        return this._returnResult({
          data: { user: null, session: null, redirectType: null },
          error: o
        });
      }
      return s.session && (await this._saveSession(s.session), await this._notifyAllSubscribers("SIGNED_IN", s.session)), this._returnResult({ data: Object.assign(Object.assign({}, s), { redirectType: i ?? null }), error: a });
    } catch (s) {
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(s))
        return this._returnResult({
          data: { user: null, session: null, redirectType: null },
          error: s
        });
      throw s;
    }
  }
  /**
   * Allows signing in with an OIDC ID token. The authentication provider used
   * should be enabled and configured.
   */
  async signInWithIdToken(e) {
    try {
      const { options: r, provider: n, token: i, access_token: s, nonce: a } = e, o = await ee(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
        headers: this.headers,
        body: {
          provider: n,
          id_token: i,
          access_token: s,
          nonce: a,
          gotrue_meta_security: { captcha_token: r?.captchaToken }
        },
        xform: Ne
      }), { data: c, error: u } = o;
      if (u)
        return this._returnResult({ data: { user: null, session: null }, error: u });
      if (!c || !c.session || !c.user) {
        const l = new _t();
        return this._returnResult({ data: { user: null, session: null }, error: l });
      }
      return c.session && (await this._saveSession(c.session), await this._notifyAllSubscribers("SIGNED_IN", c.session)), this._returnResult({ data: c, error: u });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: { user: null, session: null }, error: r });
      throw r;
    }
  }
  /**
   * Log in a user using magiclink or a one-time password (OTP).
   *
   * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
   * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
   * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
   *
   * Be aware that you may get back an error message that will not distinguish
   * between the cases where the account does not exist or, that the account
   * can only be accessed via social login.
   *
   * Do note that you will need to configure a Whatsapp sender on Twilio
   * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
   * channel is not supported on other providers
   * at this time.
   * This method supports PKCE when an email is passed.
   */
  async signInWithOtp(e) {
    var r, n, i, s, a;
    try {
      if ("email" in e) {
        const { email: o, options: c } = e;
        let u = null, l = null;
        this.flowType === "pkce" && ([u, l] = await wt(this.storage, this.storageKey));
        const { error: m } = await ee(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            email: o,
            data: (r = c?.data) !== null && r !== void 0 ? r : {},
            create_user: (n = c?.shouldCreateUser) !== null && n !== void 0 ? n : !0,
            gotrue_meta_security: { captcha_token: c?.captchaToken },
            code_challenge: u,
            code_challenge_method: l
          },
          redirectTo: c?.emailRedirectTo
        });
        return this._returnResult({ data: { user: null, session: null }, error: m });
      }
      if ("phone" in e) {
        const { phone: o, options: c } = e, { data: u, error: l } = await ee(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            phone: o,
            data: (i = c?.data) !== null && i !== void 0 ? i : {},
            create_user: (s = c?.shouldCreateUser) !== null && s !== void 0 ? s : !0,
            gotrue_meta_security: { captcha_token: c?.captchaToken },
            channel: (a = c?.channel) !== null && a !== void 0 ? a : "sms"
          }
        });
        return this._returnResult({
          data: { user: null, session: null, messageId: u?.message_id },
          error: l
        });
      }
      throw new an("You must provide either an email or phone number.");
    } catch (o) {
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(o))
        return this._returnResult({ data: { user: null, session: null }, error: o });
      throw o;
    }
  }
  /**
   * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
   */
  async verifyOtp(e) {
    var r, n;
    try {
      let i, s;
      "options" in e && (i = (r = e.options) === null || r === void 0 ? void 0 : r.redirectTo, s = (n = e.options) === null || n === void 0 ? void 0 : n.captchaToken);
      const { data: a, error: o } = await ee(this.fetch, "POST", `${this.url}/verify`, {
        headers: this.headers,
        body: Object.assign(Object.assign({}, e), { gotrue_meta_security: { captcha_token: s } }),
        redirectTo: i,
        xform: Ne
      });
      if (o)
        throw o;
      if (!a)
        throw new Error("An error occurred on token verification.");
      const c = a.session, u = a.user;
      return c?.access_token && (await this._saveSession(c), await this._notifyAllSubscribers(e.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", c)), this._returnResult({ data: { user: u, session: c }, error: null });
    } catch (i) {
      if (Y(i))
        return this._returnResult({ data: { user: null, session: null }, error: i });
      throw i;
    }
  }
  /**
   * Attempts a single-sign on using an enterprise Identity Provider. A
   * successful SSO attempt will redirect the current page to the identity
   * provider authorization page. The redirect URL is implementation and SSO
   * protocol specific.
   *
   * You can use it by providing a SSO domain. Typically you can extract this
   * domain by asking users for their email address. If this domain is
   * registered on the Auth instance the redirect will use that organization's
   * currently active SSO Identity Provider for the login.
   *
   * If you have built an organization-specific login page, you can use the
   * organization's SSO Identity Provider UUID directly instead.
   */
  async signInWithSSO(e) {
    var r, n, i, s, a;
    try {
      let o = null, c = null;
      this.flowType === "pkce" && ([o, c] = await wt(this.storage, this.storageKey));
      const u = await ee(this.fetch, "POST", `${this.url}/sso`, {
        body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? { provider_id: e.providerId } : null), "domain" in e ? { domain: e.domain } : null), { redirect_to: (n = (r = e.options) === null || r === void 0 ? void 0 : r.redirectTo) !== null && n !== void 0 ? n : void 0 }), !((i = e?.options) === null || i === void 0) && i.captchaToken ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } } : null), { skip_http_redirect: !0, code_challenge: o, code_challenge_method: c }),
        headers: this.headers,
        xform: im
      });
      return !((s = u.data) === null || s === void 0) && s.url && _e() && !(!((a = e.options) === null || a === void 0) && a.skipBrowserRedirect) && window.location.assign(u.data.url), this._returnResult(u);
    } catch (o) {
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(o))
        return this._returnResult({ data: null, error: o });
      throw o;
    }
  }
  /**
   * Sends a reauthentication OTP to the user's email or phone number.
   * Requires the user to be signed-in.
   */
  async reauthenticate() {
    return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._reauthenticate());
  }
  async _reauthenticate() {
    try {
      return await this._useSession(async (e) => {
        const { data: { session: r }, error: n } = e;
        if (n)
          throw n;
        if (!r)
          throw new ke();
        const { error: i } = await ee(this.fetch, "GET", `${this.url}/reauthenticate`, {
          headers: this.headers,
          jwt: r.access_token
        });
        return this._returnResult({ data: { user: null, session: null }, error: i });
      });
    } catch (e) {
      if (Y(e))
        return this._returnResult({ data: { user: null, session: null }, error: e });
      throw e;
    }
  }
  /**
   * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
   */
  async resend(e) {
    try {
      const r = `${this.url}/resend`;
      if ("email" in e) {
        const { email: n, type: i, options: s } = e, { error: a } = await ee(this.fetch, "POST", r, {
          headers: this.headers,
          body: {
            email: n,
            type: i,
            gotrue_meta_security: { captcha_token: s?.captchaToken }
          },
          redirectTo: s?.emailRedirectTo
        });
        return this._returnResult({ data: { user: null, session: null }, error: a });
      } else if ("phone" in e) {
        const { phone: n, type: i, options: s } = e, { data: a, error: o } = await ee(this.fetch, "POST", r, {
          headers: this.headers,
          body: {
            phone: n,
            type: i,
            gotrue_meta_security: { captcha_token: s?.captchaToken }
          }
        });
        return this._returnResult({
          data: { user: null, session: null, messageId: a?.message_id },
          error: o
        });
      }
      throw new an("You must provide either an email or phone number and a type");
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: { user: null, session: null }, error: r });
      throw r;
    }
  }
  /**
   * Returns the session, refreshing it if necessary.
   *
   * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
   *
   * **IMPORTANT:** This method loads values directly from the storage attached
   * to the client. If that storage is based on request cookies for example,
   * the values in it may not be authentic and therefore it's strongly advised
   * against using this method and its results in such circumstances. A warning
   * will be emitted if this is detected. Use {@link #getUser()} instead.
   */
  async getSession() {
    return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => this._useSession(async (r) => r));
  }
  /**
   * Acquires a global lock based on the storage key.
   */
  async _acquireLock(e, r) {
    this._debug("#_acquireLock", "begin", e);
    try {
      if (this.lockAcquired) {
        const n = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), i = (async () => (await n, await r()))();
        return this.pendingInLock.push((async () => {
          try {
            await i;
          } catch {
          }
        })()), i;
      }
      return await this.lock(`lock:${this.storageKey}`, e, async () => {
        this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
        try {
          this.lockAcquired = !0;
          const n = r();
          for (this.pendingInLock.push((async () => {
            try {
              await n;
            } catch {
            }
          })()), await n; this.pendingInLock.length; ) {
            const i = [...this.pendingInLock];
            await Promise.all(i), this.pendingInLock.splice(0, i.length);
          }
          return await n;
        } finally {
          this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = !1;
        }
      });
    } finally {
      this._debug("#_acquireLock", "end");
    }
  }
  /**
   * Use instead of {@link #getSession} inside the library. It is
   * semantically usually what you want, as getting a session involves some
   * processing afterwards that requires only one client operating on the
   * session at once across multiple tabs or processes.
   */
  async _useSession(e) {
    this._debug("#_useSession", "begin");
    try {
      const r = await this.__loadSession();
      return await e(r);
    } finally {
      this._debug("#_useSession", "end");
    }
  }
  /**
   * NEVER USE DIRECTLY!
   *
   * Always use {@link #_useSession}.
   */
  async __loadSession() {
    this._debug("#__loadSession()", "begin"), this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
    try {
      let e = null;
      const r = await at(this.storage, this.storageKey);
      if (this._debug("#getSession()", "session from storage", r), r !== null && (this._isValidSession(r) ? e = r : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e)
        return { data: { session: null }, error: null };
      const n = e.expires_at ? e.expires_at * 1e3 - Date.now() < Gs : !1;
      if (this._debug("#__loadSession()", `session has${n ? "" : " not"} expired`, "expires_at", e.expires_at), !n) {
        if (this.userStorage) {
          const a = await at(this.userStorage, this.storageKey + "-user");
          a?.user ? e.user = a.user : e.user = Js();
        }
        if (this.storage.isServer && e.user && !e.user.__isUserNotAvailableProxy) {
          const a = { value: this.suppressGetSessionWarning };
          e.user = tm(e.user, a), a.value && (this.suppressGetSessionWarning = !0);
        }
        return { data: { session: e }, error: null };
      }
      const { data: i, error: s } = await this._callRefreshToken(e.refresh_token);
      return s ? this._returnResult({ data: { session: null }, error: s }) : this._returnResult({ data: { session: i }, error: null });
    } finally {
      this._debug("#__loadSession()", "end");
    }
  }
  /**
   * Gets the current user details if there is an existing session. This method
   * performs a network request to the Supabase Auth server, so the returned
   * value is authentic and can be used to base authorization rules on.
   *
   * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
   */
  async getUser(e) {
    if (e)
      return await this._getUser(e);
    await this.initializePromise;
    const r = await this._acquireLock(this.lockAcquireTimeout, async () => await this._getUser());
    return r.data.user && (this.suppressGetSessionWarning = !0), r;
  }
  async _getUser(e) {
    try {
      return e ? await ee(this.fetch, "GET", `${this.url}/user`, {
        headers: this.headers,
        jwt: e,
        xform: et
      }) : await this._useSession(async (r) => {
        var n, i, s;
        const { data: a, error: o } = r;
        if (o)
          throw o;
        return !(!((n = a.session) === null || n === void 0) && n.access_token) && !this.hasCustomAuthorizationHeader ? { data: { user: null }, error: new ke() } : await ee(this.fetch, "GET", `${this.url}/user`, {
          headers: this.headers,
          jwt: (s = (i = a.session) === null || i === void 0 ? void 0 : i.access_token) !== null && s !== void 0 ? s : void 0,
          xform: et
        });
      });
    } catch (r) {
      if (Y(r))
        return Hs(r) && (await this._removeSession(), await ve(this.storage, `${this.storageKey}-code-verifier`)), this._returnResult({ data: { user: null }, error: r });
      throw r;
    }
  }
  /**
   * Updates user data for a logged in user.
   */
  async updateUser(e, r = {}) {
    return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._updateUser(e, r));
  }
  async _updateUser(e, r = {}) {
    try {
      return await this._useSession(async (n) => {
        const { data: i, error: s } = n;
        if (s)
          throw s;
        if (!i.session)
          throw new ke();
        const a = i.session;
        let o = null, c = null;
        this.flowType === "pkce" && e.email != null && ([o, c] = await wt(this.storage, this.storageKey));
        const { data: u, error: l } = await ee(this.fetch, "PUT", `${this.url}/user`, {
          headers: this.headers,
          redirectTo: r?.emailRedirectTo,
          body: Object.assign(Object.assign({}, e), { code_challenge: o, code_challenge_method: c }),
          jwt: a.access_token,
          xform: et
        });
        if (l)
          throw l;
        return a.user = u.user, await this._saveSession(a), await this._notifyAllSubscribers("USER_UPDATED", a), this._returnResult({ data: { user: a.user }, error: null });
      });
    } catch (n) {
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(n))
        return this._returnResult({ data: { user: null }, error: n });
      throw n;
    }
  }
  /**
   * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
   * If the refresh token or access token in the current session is invalid, an error will be thrown.
   * @param currentSession The current session that minimally contains an access token and refresh token.
   */
  async setSession(e) {
    return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._setSession(e));
  }
  async _setSession(e) {
    try {
      if (!e.access_token || !e.refresh_token)
        throw new ke();
      const r = Date.now() / 1e3;
      let n = r, i = !0, s = null;
      const { payload: a } = cn(e.access_token);
      if (a.exp && (n = a.exp, i = n <= r), i) {
        const { data: o, error: c } = await this._callRefreshToken(e.refresh_token);
        if (c)
          return this._returnResult({ data: { user: null, session: null }, error: c });
        if (!o)
          return { data: { user: null, session: null }, error: null };
        s = o;
      } else {
        const { data: o, error: c } = await this._getUser(e.access_token);
        if (c)
          return this._returnResult({ data: { user: null, session: null }, error: c });
        s = {
          access_token: e.access_token,
          refresh_token: e.refresh_token,
          user: o.user,
          token_type: "bearer",
          expires_in: n - r,
          expires_at: n
        }, await this._saveSession(s), await this._notifyAllSubscribers("SIGNED_IN", s);
      }
      return this._returnResult({ data: { user: s.user, session: s }, error: null });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: { session: null, user: null }, error: r });
      throw r;
    }
  }
  /**
   * Returns a new session, regardless of expiry status.
   * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
   * If the current session's refresh token is invalid, an error will be thrown.
   * @param currentSession The current session. If passed in, it must contain a refresh token.
   */
  async refreshSession(e) {
    return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._refreshSession(e));
  }
  async _refreshSession(e) {
    try {
      return await this._useSession(async (r) => {
        var n;
        if (!e) {
          const { data: a, error: o } = r;
          if (o)
            throw o;
          e = (n = a.session) !== null && n !== void 0 ? n : void 0;
        }
        if (!e?.refresh_token)
          throw new ke();
        const { data: i, error: s } = await this._callRefreshToken(e.refresh_token);
        return s ? this._returnResult({ data: { user: null, session: null }, error: s }) : i ? this._returnResult({ data: { user: i.user, session: i }, error: null }) : this._returnResult({ data: { user: null, session: null }, error: null });
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: { user: null, session: null }, error: r });
      throw r;
    }
  }
  /**
   * Gets the session data from a URL string
   */
  async _getSessionFromURL(e, r) {
    try {
      if (!_e())
        throw new on("No browser detected.");
      if (e.error || e.error_description || e.error_code)
        throw new on(e.error_description || "Error in URL with unspecified error_description", {
          error: e.error || "unspecified_error",
          code: e.error_code || "unspecified_code"
        });
      switch (r) {
        case "implicit":
          if (this.flowType === "pkce")
            throw new _c("Not a valid PKCE flow url.");
          break;
        case "pkce":
          if (this.flowType === "implicit")
            throw new on("Not a valid implicit grant flow url.");
          break;
        default:
      }
      if (r === "pkce") {
        if (this._debug("#_initialize()", "begin", "is PKCE flow", !0), !e.code)
          throw new _c("No code detected.");
        const { data: f, error: g } = await this._exchangeCodeForSession(e.code);
        if (g)
          throw g;
        const S = new URL(window.location.href);
        return S.searchParams.delete("code"), window.history.replaceState(window.history.state, "", S.toString()), { data: { session: f.session, redirectType: null }, error: null };
      }
      const { provider_token: n, provider_refresh_token: i, access_token: s, refresh_token: a, expires_in: o, expires_at: c, token_type: u } = e;
      if (!s || !o || !a || !u)
        throw new on("No session defined in URL");
      const l = Math.round(Date.now() / 1e3), m = parseInt(o);
      let d = l + m;
      c && (d = parseInt(c));
      const h = d - l;
      h * 1e3 <= Rt && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${h}s, should have been closer to ${m}s`);
      const v = d - m;
      l - v >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", v, d, l) : l - v < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", v, d, l);
      const { data: w, error: p } = await this._getUser(s);
      if (p)
        throw p;
      const _ = {
        provider_token: n,
        provider_refresh_token: i,
        access_token: s,
        expires_in: m,
        expires_at: d,
        refresh_token: a,
        token_type: u,
        user: w.user
      };
      return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), this._returnResult({ data: { session: _, redirectType: e.type }, error: null });
    } catch (n) {
      if (Y(n))
        return this._returnResult({ data: { session: null, redirectType: null }, error: n });
      throw n;
    }
  }
  /**
   * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
   *
   * If `detectSessionInUrl` is a function, it will be called with the URL and params to determine
   * if the URL should be processed as a Supabase auth callback. This allows users to exclude
   * URLs from other OAuth providers (e.g., Facebook Login) that also return access_token in the fragment.
   */
  _isImplicitGrantCallback(e) {
    return typeof this.detectSessionInUrl == "function" ? this.detectSessionInUrl(new URL(window.location.href), e) : !!(e.access_token || e.error_description);
  }
  /**
   * Checks if the current URL and backing storage contain parameters given by a PKCE flow
   */
  async _isPKCECallback(e) {
    const r = await at(this.storage, `${this.storageKey}-code-verifier`);
    return !!(e.code && r);
  }
  /**
   * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
   *
   * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
   * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
   *
   * If using `others` scope, no `SIGNED_OUT` event is fired!
   */
  async signOut(e = { scope: "global" }) {
    return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._signOut(e));
  }
  async _signOut({ scope: e } = { scope: "global" }) {
    return await this._useSession(async (r) => {
      var n;
      const { data: i, error: s } = r;
      if (s && !Hs(s))
        return this._returnResult({ error: s });
      const a = (n = i.session) === null || n === void 0 ? void 0 : n.access_token;
      if (a) {
        const { error: o } = await this.admin.signOut(a, e);
        if (o && !(jp(o) && (o.status === 404 || o.status === 401 || o.status === 403) || Hs(o)))
          return this._returnResult({ error: o });
      }
      return e !== "others" && (await this._removeSession(), await ve(this.storage, `${this.storageKey}-code-verifier`)), this._returnResult({ error: null });
    });
  }
  onAuthStateChange(e) {
    const r = Fp(), n = {
      id: r,
      callback: e,
      unsubscribe: () => {
        this._debug("#unsubscribe()", "state change callback with id removed", r), this.stateChangeEmitters.delete(r);
      }
    };
    return this._debug("#onAuthStateChange()", "registered callback with id", r), this.stateChangeEmitters.set(r, n), (async () => (await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => {
      this._emitInitialSession(r);
    })))(), { data: { subscription: n } };
  }
  async _emitInitialSession(e) {
    return await this._useSession(async (r) => {
      var n, i;
      try {
        const { data: { session: s }, error: a } = r;
        if (a)
          throw a;
        await ((n = this.stateChangeEmitters.get(e)) === null || n === void 0 ? void 0 : n.callback("INITIAL_SESSION", s)), this._debug("INITIAL_SESSION", "callback id", e, "session", s);
      } catch (s) {
        await ((i = this.stateChangeEmitters.get(e)) === null || i === void 0 ? void 0 : i.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", e, "error", s), console.error(s);
      }
    });
  }
  /**
   * Sends a password reset request to an email address. This method supports the PKCE flow.
   *
   * @param email The email address of the user.
   * @param options.redirectTo The URL to send the user to after they click the password reset link.
   * @param options.captchaToken Verification token received when the user completes the captcha on the site.
   */
  async resetPasswordForEmail(e, r = {}) {
    let n = null, i = null;
    this.flowType === "pkce" && ([n, i] = await wt(
      this.storage,
      this.storageKey,
      !0
      // isPasswordRecovery
    ));
    try {
      return await ee(this.fetch, "POST", `${this.url}/recover`, {
        body: {
          email: e,
          code_challenge: n,
          code_challenge_method: i,
          gotrue_meta_security: { captcha_token: r.captchaToken }
        },
        headers: this.headers,
        redirectTo: r.redirectTo
      });
    } catch (s) {
      if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(s))
        return this._returnResult({ data: null, error: s });
      throw s;
    }
  }
  /**
   * Gets all the identities linked to a user.
   */
  async getUserIdentities() {
    var e;
    try {
      const { data: r, error: n } = await this.getUser();
      if (n)
        throw n;
      return this._returnResult({ data: { identities: (e = r.user.identities) !== null && e !== void 0 ? e : [] }, error: null });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: null, error: r });
      throw r;
    }
  }
  async linkIdentity(e) {
    return "token" in e ? this.linkIdentityIdToken(e) : this.linkIdentityOAuth(e);
  }
  async linkIdentityOAuth(e) {
    var r;
    try {
      const { data: n, error: i } = await this._useSession(async (s) => {
        var a, o, c, u, l;
        const { data: m, error: d } = s;
        if (d)
          throw d;
        const h = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, e.provider, {
          redirectTo: (a = e.options) === null || a === void 0 ? void 0 : a.redirectTo,
          scopes: (o = e.options) === null || o === void 0 ? void 0 : o.scopes,
          queryParams: (c = e.options) === null || c === void 0 ? void 0 : c.queryParams,
          skipBrowserRedirect: !0
        });
        return await ee(this.fetch, "GET", h, {
          headers: this.headers,
          jwt: (l = (u = m.session) === null || u === void 0 ? void 0 : u.access_token) !== null && l !== void 0 ? l : void 0
        });
      });
      if (i)
        throw i;
      return _e() && !(!((r = e.options) === null || r === void 0) && r.skipBrowserRedirect) && window.location.assign(n?.url), this._returnResult({
        data: { provider: e.provider, url: n?.url },
        error: null
      });
    } catch (n) {
      if (Y(n))
        return this._returnResult({ data: { provider: e.provider, url: null }, error: n });
      throw n;
    }
  }
  async linkIdentityIdToken(e) {
    return await this._useSession(async (r) => {
      var n;
      try {
        const { error: i, data: { session: s } } = r;
        if (i)
          throw i;
        const { options: a, provider: o, token: c, access_token: u, nonce: l } = e, m = await ee(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
          headers: this.headers,
          jwt: (n = s?.access_token) !== null && n !== void 0 ? n : void 0,
          body: {
            provider: o,
            id_token: c,
            access_token: u,
            nonce: l,
            link_identity: !0,
            gotrue_meta_security: { captcha_token: a?.captchaToken }
          },
          xform: Ne
        }), { data: d, error: h } = m;
        return h ? this._returnResult({ data: { user: null, session: null }, error: h }) : !d || !d.session || !d.user ? this._returnResult({
          data: { user: null, session: null },
          error: new _t()
        }) : (d.session && (await this._saveSession(d.session), await this._notifyAllSubscribers("USER_UPDATED", d.session)), this._returnResult({ data: d, error: h }));
      } catch (i) {
        if (await ve(this.storage, `${this.storageKey}-code-verifier`), Y(i))
          return this._returnResult({ data: { user: null, session: null }, error: i });
        throw i;
      }
    });
  }
  /**
   * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
   */
  async unlinkIdentity(e) {
    try {
      return await this._useSession(async (r) => {
        var n, i;
        const { data: s, error: a } = r;
        if (a)
          throw a;
        return await ee(this.fetch, "DELETE", `${this.url}/user/identities/${e.identity_id}`, {
          headers: this.headers,
          jwt: (i = (n = s.session) === null || n === void 0 ? void 0 : n.access_token) !== null && i !== void 0 ? i : void 0
        });
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: null, error: r });
      throw r;
    }
  }
  /**
   * Generates a new JWT.
   * @param refreshToken A valid refresh token that was returned on login.
   */
  async _refreshAccessToken(e) {
    const r = `#_refreshAccessToken(${e.substring(0, 5)}...)`;
    this._debug(r, "begin");
    try {
      const n = Date.now();
      return await Kp(async (i) => (i > 0 && await Bp(200 * Math.pow(2, i - 1)), this._debug(r, "refreshing attempt", i), await ee(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
        body: { refresh_token: e },
        headers: this.headers,
        xform: Ne
      })), (i, s) => {
        const a = 200 * Math.pow(2, i);
        return s && Ws(s) && // retryable only if the request can be sent before the backoff overflows the tick duration
        Date.now() + a - n < Rt;
      });
    } catch (n) {
      if (this._debug(r, "error", n), Y(n))
        return this._returnResult({ data: { session: null, user: null }, error: n });
      throw n;
    } finally {
      this._debug(r, "end");
    }
  }
  _isValidSession(e) {
    return typeof e == "object" && e !== null && "access_token" in e && "refresh_token" in e && "expires_at" in e;
  }
  async _handleProviderSignIn(e, r) {
    const n = await this._getUrlForProvider(`${this.url}/authorize`, e, {
      redirectTo: r.redirectTo,
      scopes: r.scopes,
      queryParams: r.queryParams
    });
    return this._debug("#_handleProviderSignIn()", "provider", e, "options", r, "url", n), _e() && !r.skipBrowserRedirect && window.location.assign(n), { data: { provider: e, url: n }, error: null };
  }
  /**
   * Recovers the session from LocalStorage and refreshes the token
   * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
   */
  async _recoverAndRefresh() {
    var e, r;
    const n = "#_recoverAndRefresh()";
    this._debug(n, "begin");
    try {
      const i = await at(this.storage, this.storageKey);
      if (i && this.userStorage) {
        let a = await at(this.userStorage, this.storageKey + "-user");
        !this.storage.isServer && Object.is(this.storage, this.userStorage) && !a && (a = { user: i.user }, await Ot(this.userStorage, this.storageKey + "-user", a)), i.user = (e = a?.user) !== null && e !== void 0 ? e : Js();
      } else if (i && !i.user && !i.user) {
        const a = await at(this.storage, this.storageKey + "-user");
        a && a?.user ? (i.user = a.user, await ve(this.storage, this.storageKey + "-user"), await Ot(this.storage, this.storageKey, i)) : i.user = Js();
      }
      if (this._debug(n, "session from storage", i), !this._isValidSession(i)) {
        this._debug(n, "session is not valid"), i !== null && await this._removeSession();
        return;
      }
      const s = ((r = i.expires_at) !== null && r !== void 0 ? r : 1 / 0) * 1e3 - Date.now() < Gs;
      if (this._debug(n, `session has${s ? "" : " not"} expired with margin of ${Gs}s`), s) {
        if (this.autoRefreshToken && i.refresh_token) {
          const { error: a } = await this._callRefreshToken(i.refresh_token);
          a && (console.error(a), Ws(a) || (this._debug(n, "refresh failed with a non-retryable error, removing the session", a), await this._removeSession()));
        }
      } else if (i.user && i.user.__isUserNotAvailableProxy === !0)
        try {
          const { data: a, error: o } = await this._getUser(i.access_token);
          !o && a?.user ? (i.user = a.user, await this._saveSession(i), await this._notifyAllSubscribers("SIGNED_IN", i)) : this._debug(n, "could not get user data, skipping SIGNED_IN notification");
        } catch (a) {
          console.error("Error getting user data:", a), this._debug(n, "error getting user data, skipping SIGNED_IN notification", a);
        }
      else
        await this._notifyAllSubscribers("SIGNED_IN", i);
    } catch (i) {
      this._debug(n, "error", i), console.error(i);
      return;
    } finally {
      this._debug(n, "end");
    }
  }
  async _callRefreshToken(e) {
    var r, n;
    if (!e)
      throw new ke();
    if (this.refreshingDeferred)
      return this.refreshingDeferred.promise;
    const i = `#_callRefreshToken(${e.substring(0, 5)}...)`;
    this._debug(i, "begin");
    try {
      this.refreshingDeferred = new kn();
      const { data: s, error: a } = await this._refreshAccessToken(e);
      if (a)
        throw a;
      if (!s.session)
        throw new ke();
      await this._saveSession(s.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", s.session);
      const o = { data: s.session, error: null };
      return this.refreshingDeferred.resolve(o), o;
    } catch (s) {
      if (this._debug(i, "error", s), Y(s)) {
        const a = { data: null, error: s };
        return Ws(s) || await this._removeSession(), (r = this.refreshingDeferred) === null || r === void 0 || r.resolve(a), a;
      }
      throw (n = this.refreshingDeferred) === null || n === void 0 || n.reject(s), s;
    } finally {
      this.refreshingDeferred = null, this._debug(i, "end");
    }
  }
  async _notifyAllSubscribers(e, r, n = !0) {
    const i = `#_notifyAllSubscribers(${e})`;
    this._debug(i, "begin", r, `broadcast = ${n}`);
    try {
      this.broadcastChannel && n && this.broadcastChannel.postMessage({ event: e, session: r });
      const s = [], a = Array.from(this.stateChangeEmitters.values()).map(async (o) => {
        try {
          await o.callback(e, r);
        } catch (c) {
          s.push(c);
        }
      });
      if (await Promise.all(a), s.length > 0) {
        for (let o = 0; o < s.length; o += 1)
          console.error(s[o]);
        throw s[0];
      }
    } finally {
      this._debug(i, "end");
    }
  }
  /**
   * set currentSession and currentUser
   * process to _startAutoRefreshToken if possible
   */
  async _saveSession(e) {
    this._debug("#_saveSession()", e), this.suppressGetSessionWarning = !0, await ve(this.storage, `${this.storageKey}-code-verifier`);
    const r = Object.assign({}, e), n = r.user && r.user.__isUserNotAvailableProxy === !0;
    if (this.userStorage) {
      !n && r.user && await Ot(this.userStorage, this.storageKey + "-user", {
        user: r.user
      });
      const i = Object.assign({}, r);
      delete i.user;
      const s = Sc(i);
      await Ot(this.storage, this.storageKey, s);
    } else {
      const i = Sc(r);
      await Ot(this.storage, this.storageKey, i);
    }
  }
  async _removeSession() {
    this._debug("#_removeSession()"), this.suppressGetSessionWarning = !1, await ve(this.storage, this.storageKey), await ve(this.storage, this.storageKey + "-code-verifier"), await ve(this.storage, this.storageKey + "-user"), this.userStorage && await ve(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
  }
  /**
   * Removes any registered visibilitychange callback.
   *
   * {@see #startAutoRefresh}
   * {@see #stopAutoRefresh}
   */
  _removeVisibilityChangedCallback() {
    this._debug("#_removeVisibilityChangedCallback()");
    const e = this.visibilityChangedCallback;
    this.visibilityChangedCallback = null;
    try {
      e && _e() && window?.removeEventListener && window.removeEventListener("visibilitychange", e);
    } catch (r) {
      console.error("removing visibilitychange callback failed", r);
    }
  }
  /**
   * This is the private implementation of {@link #startAutoRefresh}. Use this
   * within the library.
   */
  async _startAutoRefresh() {
    await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
    const e = setInterval(() => this._autoRefreshTokenTick(), Rt);
    this.autoRefreshTicker = e, e && typeof e == "object" && typeof e.unref == "function" ? e.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(e);
    const r = setTimeout(async () => {
      await this.initializePromise, await this._autoRefreshTokenTick();
    }, 0);
    this.autoRefreshTickTimeout = r, r && typeof r == "object" && typeof r.unref == "function" ? r.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(r);
  }
  /**
   * This is the private implementation of {@link #stopAutoRefresh}. Use this
   * within the library.
   */
  async _stopAutoRefresh() {
    this._debug("#_stopAutoRefresh()");
    const e = this.autoRefreshTicker;
    this.autoRefreshTicker = null, e && clearInterval(e);
    const r = this.autoRefreshTickTimeout;
    this.autoRefreshTickTimeout = null, r && clearTimeout(r);
  }
  /**
   * Starts an auto-refresh process in the background. The session is checked
   * every few seconds. Close to the time of expiration a process is started to
   * refresh the session. If refreshing fails it will be retried for as long as
   * necessary.
   *
   * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
   * to call this function, it will be called for you.
   *
   * On browsers the refresh process works only when the tab/window is in the
   * foreground to conserve resources as well as prevent race conditions and
   * flooding auth with requests. If you call this method any managed
   * visibility change callback will be removed and you must manage visibility
   * changes on your own.
   *
   * On non-browser platforms the refresh process works *continuously* in the
   * background, which may not be desirable. You should hook into your
   * platform's foreground indication mechanism and call these methods
   * appropriately to conserve resources.
   *
   * {@see #stopAutoRefresh}
   */
  async startAutoRefresh() {
    this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
  }
  /**
   * Stops an active auto refresh process running in the background (if any).
   *
   * If you call this method any managed visibility change callback will be
   * removed and you must manage visibility changes on your own.
   *
   * See {@link #startAutoRefresh} for more details.
   */
  async stopAutoRefresh() {
    this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
  }
  /**
   * Runs the auto refresh token tick.
   */
  async _autoRefreshTokenTick() {
    this._debug("#_autoRefreshTokenTick()", "begin");
    try {
      await this._acquireLock(0, async () => {
        try {
          const e = Date.now();
          try {
            return await this._useSession(async (r) => {
              const { data: { session: n } } = r;
              if (!n || !n.refresh_token || !n.expires_at) {
                this._debug("#_autoRefreshTokenTick()", "no session");
                return;
              }
              const i = Math.floor((n.expires_at * 1e3 - e) / Rt);
              this._debug("#_autoRefreshTokenTick()", `access token expires in ${i} ticks, a tick lasts ${Rt}ms, refresh threshold is ${ai} ticks`), i <= ai && await this._callRefreshToken(n.refresh_token);
            });
          } catch (r) {
            console.error("Auto refresh tick failed with error. This is likely a transient error.", r);
          }
        } finally {
          this._debug("#_autoRefreshTokenTick()", "end");
        }
      });
    } catch (e) {
      if (e.isAcquireTimeout || e instanceof bu)
        this._debug("auto refresh token tick lock not available");
      else
        throw e;
    }
  }
  /**
   * Registers callbacks on the browser / platform, which in-turn run
   * algorithms when the browser window/tab are in foreground. On non-browser
   * platforms it assumes always foreground.
   */
  async _handleVisibilityChange() {
    if (this._debug("#_handleVisibilityChange()"), !_e() || !window?.addEventListener)
      return this.autoRefreshToken && this.startAutoRefresh(), !1;
    try {
      this.visibilityChangedCallback = async () => {
        try {
          await this._onVisibilityChanged(!1);
        } catch (e) {
          this._debug("#visibilityChangedCallback", "error", e);
        }
      }, window?.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(!0);
    } catch (e) {
      console.error("_handleVisibilityChange", e);
    }
  }
  /**
   * Callback registered with `window.addEventListener('visibilitychange')`.
   */
  async _onVisibilityChanged(e) {
    const r = `#_onVisibilityChanged(${e})`;
    this._debug(r, "visibilityState", document.visibilityState), document.visibilityState === "visible" ? (this.autoRefreshToken && this._startAutoRefresh(), e || (await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => {
      if (document.visibilityState !== "visible") {
        this._debug(r, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
        return;
      }
      await this._recoverAndRefresh();
    }))) : document.visibilityState === "hidden" && this.autoRefreshToken && this._stopAutoRefresh();
  }
  /**
   * Generates the relevant login URL for a third-party provider.
   * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
   * @param options.scopes A space-separated list of scopes granted to the OAuth application.
   * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
   */
  async _getUrlForProvider(e, r, n) {
    const i = [`provider=${encodeURIComponent(r)}`];
    if (n?.redirectTo && i.push(`redirect_to=${encodeURIComponent(n.redirectTo)}`), n?.scopes && i.push(`scopes=${encodeURIComponent(n.scopes)}`), this.flowType === "pkce") {
      const [s, a] = await wt(this.storage, this.storageKey), o = new URLSearchParams({
        code_challenge: `${encodeURIComponent(s)}`,
        code_challenge_method: `${encodeURIComponent(a)}`
      });
      i.push(o.toString());
    }
    if (n?.queryParams) {
      const s = new URLSearchParams(n.queryParams);
      i.push(s.toString());
    }
    return n?.skipBrowserRedirect && i.push(`skip_http_redirect=${n.skipBrowserRedirect}`), `${e}?${i.join("&")}`;
  }
  async _unenroll(e) {
    try {
      return await this._useSession(async (r) => {
        var n;
        const { data: i, error: s } = r;
        return s ? this._returnResult({ data: null, error: s }) : await ee(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, {
          headers: this.headers,
          jwt: (n = i?.session) === null || n === void 0 ? void 0 : n.access_token
        });
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: null, error: r });
      throw r;
    }
  }
  async _enroll(e) {
    try {
      return await this._useSession(async (r) => {
        var n, i;
        const { data: s, error: a } = r;
        if (a)
          return this._returnResult({ data: null, error: a });
        const o = Object.assign({ friendly_name: e.friendlyName, factor_type: e.factorType }, e.factorType === "phone" ? { phone: e.phone } : e.factorType === "totp" ? { issuer: e.issuer } : {}), { data: c, error: u } = await ee(this.fetch, "POST", `${this.url}/factors`, {
          body: o,
          headers: this.headers,
          jwt: (n = s?.session) === null || n === void 0 ? void 0 : n.access_token
        });
        return u ? this._returnResult({ data: null, error: u }) : (e.factorType === "totp" && c.type === "totp" && (!((i = c?.totp) === null || i === void 0) && i.qr_code) && (c.totp.qr_code = `data:image/svg+xml;utf-8,${c.totp.qr_code}`), this._returnResult({ data: c, error: null }));
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: null, error: r });
      throw r;
    }
  }
  async _verify(e) {
    return this._acquireLock(this.lockAcquireTimeout, async () => {
      try {
        return await this._useSession(async (r) => {
          var n;
          const { data: i, error: s } = r;
          if (s)
            return this._returnResult({ data: null, error: s });
          const a = Object.assign({ challenge_id: e.challengeId }, "webauthn" in e ? {
            webauthn: Object.assign(Object.assign({}, e.webauthn), { credential_response: e.webauthn.type === "create" ? bm(e.webauthn.credential_response) : Em(e.webauthn.credential_response) })
          } : { code: e.code }), { data: o, error: c } = await ee(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, {
            body: a,
            headers: this.headers,
            jwt: (n = i?.session) === null || n === void 0 ? void 0 : n.access_token
          });
          return c ? this._returnResult({ data: null, error: c }) : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + o.expires_in }, o)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", o), this._returnResult({ data: o, error: c }));
        });
      } catch (r) {
        if (Y(r))
          return this._returnResult({ data: null, error: r });
        throw r;
      }
    });
  }
  async _challenge(e) {
    return this._acquireLock(this.lockAcquireTimeout, async () => {
      try {
        return await this._useSession(async (r) => {
          var n;
          const { data: i, error: s } = r;
          if (s)
            return this._returnResult({ data: null, error: s });
          const a = await ee(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, {
            body: e,
            headers: this.headers,
            jwt: (n = i?.session) === null || n === void 0 ? void 0 : n.access_token
          });
          if (a.error)
            return a;
          const { data: o } = a;
          if (o.type !== "webauthn")
            return { data: o, error: null };
          switch (o.webauthn.type) {
            case "create":
              return {
                data: Object.assign(Object.assign({}, o), { webauthn: Object.assign(Object.assign({}, o.webauthn), { credential_options: Object.assign(Object.assign({}, o.webauthn.credential_options), { publicKey: _m(o.webauthn.credential_options.publicKey) }) }) }),
                error: null
              };
            case "request":
              return {
                data: Object.assign(Object.assign({}, o), { webauthn: Object.assign(Object.assign({}, o.webauthn), { credential_options: Object.assign(Object.assign({}, o.webauthn.credential_options), { publicKey: wm(o.webauthn.credential_options.publicKey) }) }) }),
                error: null
              };
          }
        });
      } catch (r) {
        if (Y(r))
          return this._returnResult({ data: null, error: r });
        throw r;
      }
    });
  }
  /**
   * {@see GoTrueMFAApi#challengeAndVerify}
   */
  async _challengeAndVerify(e) {
    const { data: r, error: n } = await this._challenge({
      factorId: e.factorId
    });
    return n ? this._returnResult({ data: null, error: n }) : await this._verify({
      factorId: e.factorId,
      challengeId: r.id,
      code: e.code
    });
  }
  /**
   * {@see GoTrueMFAApi#listFactors}
   */
  async _listFactors() {
    var e;
    const { data: { user: r }, error: n } = await this.getUser();
    if (n)
      return { data: null, error: n };
    const i = {
      all: [],
      phone: [],
      totp: [],
      webauthn: []
    };
    for (const s of (e = r?.factors) !== null && e !== void 0 ? e : [])
      i.all.push(s), s.status === "verified" && i[s.factor_type].push(s);
    return {
      data: i,
      error: null
    };
  }
  /**
   * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
   */
  async _getAuthenticatorAssuranceLevel(e) {
    var r, n, i, s;
    if (e)
      try {
        const { payload: h } = cn(e);
        let v = null;
        h.aal && (v = h.aal);
        let w = v;
        const { data: { user: p }, error: _ } = await this.getUser(e);
        if (_)
          return this._returnResult({ data: null, error: _ });
        ((n = (r = p?.factors) === null || r === void 0 ? void 0 : r.filter((S) => S.status === "verified")) !== null && n !== void 0 ? n : []).length > 0 && (w = "aal2");
        const g = h.amr || [];
        return { data: { currentLevel: v, nextLevel: w, currentAuthenticationMethods: g }, error: null };
      } catch (h) {
        if (Y(h))
          return this._returnResult({ data: null, error: h });
        throw h;
      }
    const { data: { session: a }, error: o } = await this.getSession();
    if (o)
      return this._returnResult({ data: null, error: o });
    if (!a)
      return {
        data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
        error: null
      };
    const { payload: c } = cn(a.access_token);
    let u = null;
    c.aal && (u = c.aal);
    let l = u;
    ((s = (i = a.user.factors) === null || i === void 0 ? void 0 : i.filter((h) => h.status === "verified")) !== null && s !== void 0 ? s : []).length > 0 && (l = "aal2");
    const d = c.amr || [];
    return { data: { currentLevel: u, nextLevel: l, currentAuthenticationMethods: d }, error: null };
  }
  /**
   * Retrieves details about an OAuth authorization request.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * Returns authorization details including client info, scopes, and user information.
   * If the API returns a redirect_uri, it means consent was already given - the caller
   * should handle the redirect manually if needed.
   */
  async _getAuthorizationDetails(e) {
    try {
      return await this._useSession(async (r) => {
        const { data: { session: n }, error: i } = r;
        return i ? this._returnResult({ data: null, error: i }) : n ? await ee(this.fetch, "GET", `${this.url}/oauth/authorizations/${e}`, {
          headers: this.headers,
          jwt: n.access_token,
          xform: (s) => ({ data: s, error: null })
        }) : this._returnResult({ data: null, error: new ke() });
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: null, error: r });
      throw r;
    }
  }
  /**
   * Approves an OAuth authorization request.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   */
  async _approveAuthorization(e, r) {
    try {
      return await this._useSession(async (n) => {
        const { data: { session: i }, error: s } = n;
        if (s)
          return this._returnResult({ data: null, error: s });
        if (!i)
          return this._returnResult({ data: null, error: new ke() });
        const a = await ee(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, {
          headers: this.headers,
          jwt: i.access_token,
          body: { action: "approve" },
          xform: (o) => ({ data: o, error: null })
        });
        return a.data && a.data.redirect_url && _e() && !r?.skipBrowserRedirect && window.location.assign(a.data.redirect_url), a;
      });
    } catch (n) {
      if (Y(n))
        return this._returnResult({ data: null, error: n });
      throw n;
    }
  }
  /**
   * Denies an OAuth authorization request.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   */
  async _denyAuthorization(e, r) {
    try {
      return await this._useSession(async (n) => {
        const { data: { session: i }, error: s } = n;
        if (s)
          return this._returnResult({ data: null, error: s });
        if (!i)
          return this._returnResult({ data: null, error: new ke() });
        const a = await ee(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, {
          headers: this.headers,
          jwt: i.access_token,
          body: { action: "deny" },
          xform: (o) => ({ data: o, error: null })
        });
        return a.data && a.data.redirect_url && _e() && !r?.skipBrowserRedirect && window.location.assign(a.data.redirect_url), a;
      });
    } catch (n) {
      if (Y(n))
        return this._returnResult({ data: null, error: n });
      throw n;
    }
  }
  /**
   * Lists all OAuth grants that the authenticated user has authorized.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   */
  async _listOAuthGrants() {
    try {
      return await this._useSession(async (e) => {
        const { data: { session: r }, error: n } = e;
        return n ? this._returnResult({ data: null, error: n }) : r ? await ee(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
          headers: this.headers,
          jwt: r.access_token,
          xform: (i) => ({ data: i, error: null })
        }) : this._returnResult({ data: null, error: new ke() });
      });
    } catch (e) {
      if (Y(e))
        return this._returnResult({ data: null, error: e });
      throw e;
    }
  }
  /**
   * Revokes a user's OAuth grant for a specific client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   */
  async _revokeOAuthGrant(e) {
    try {
      return await this._useSession(async (r) => {
        const { data: { session: n }, error: i } = r;
        return i ? this._returnResult({ data: null, error: i }) : n ? (await ee(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
          headers: this.headers,
          jwt: n.access_token,
          query: { client_id: e.clientId },
          noResolveJson: !0
        }), { data: {}, error: null }) : this._returnResult({ data: null, error: new ke() });
      });
    } catch (r) {
      if (Y(r))
        return this._returnResult({ data: null, error: r });
      throw r;
    }
  }
  async fetchJwk(e, r = { keys: [] }) {
    let n = r.keys.find((o) => o.kid === e);
    if (n)
      return n;
    const i = Date.now();
    if (n = this.jwks.keys.find((o) => o.kid === e), n && this.jwks_cached_at + Ap > i)
      return n;
    const { data: s, error: a } = await ee(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
      headers: this.headers
    });
    if (a)
      throw a;
    return !s.keys || s.keys.length === 0 || (this.jwks = s, this.jwks_cached_at = i, n = s.keys.find((o) => o.kid === e), !n) ? null : n;
  }
  /**
   * Extracts the JWT claims present in the access token by first verifying the
   * JWT against the server's JSON Web Key Set endpoint
   * `/.well-known/jwks.json` which is often cached, resulting in significantly
   * faster responses. Prefer this method over {@link #getUser} which always
   * sends a request to the Auth server for each JWT.
   *
   * If the project is not using an asymmetric JWT signing key (like ECC or
   * RSA) it always sends a request to the Auth server (similar to {@link
   * #getUser}) to verify the JWT.
   *
   * @param jwt An optional specific JWT you wish to verify, not the one you
   *            can obtain from {@link #getSession}.
   * @param options Various additional options that allow you to customize the
   *                behavior of this method.
   */
  async getClaims(e, r = {}) {
    try {
      let n = e;
      if (!n) {
        const { data: h, error: v } = await this.getSession();
        if (v || !h.session)
          return this._returnResult({ data: null, error: v });
        n = h.session.access_token;
      }
      const { header: i, payload: s, signature: a, raw: { header: o, payload: c } } = cn(n);
      r?.allowExpired || Qp(s.exp);
      const u = !i.alg || i.alg.startsWith("HS") || !i.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(i.kid, r?.keys ? { keys: r.keys } : r?.jwks);
      if (!u) {
        const { error: h } = await this.getUser(n);
        if (h)
          throw h;
        return {
          data: {
            claims: s,
            header: i,
            signature: a
          },
          error: null
        };
      }
      const l = Zp(i.alg), m = await crypto.subtle.importKey("jwk", u, l, !0, [
        "verify"
      ]);
      if (!await crypto.subtle.verify(l, m, a, Mp(`${o}.${c}`)))
        throw new ui("Invalid JWT signature");
      return {
        data: {
          claims: s,
          header: i,
          signature: a
        },
        error: null
      };
    } catch (n) {
      if (Y(n))
        return this._returnResult({ data: null, error: n });
      throw n;
    }
  }
}
Gt.nextInstanceID = {};
const Im = Gt, jm = "2.94.0";
let Ut = "";
typeof Deno < "u" ? Ut = "deno" : typeof document < "u" ? Ut = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? Ut = "react-native" : Ut = "node";
const Nm = { "X-Client-Info": `supabase-js-${Ut}/${jm}` }, Cm = { headers: Nm }, Dm = { schema: "public" }, Lm = {
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  flowType: "implicit"
}, qm = {};
function Ht(t) {
  "@babel/helpers - typeof";
  return Ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ht(t);
}
function Um(t, e) {
  if (Ht(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Ht(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Mm(t) {
  var e = Um(t, "string");
  return Ht(e) == "symbol" ? e : e + "";
}
function xm(t, e, r) {
  return (e = Mm(e)) in t ? Object.defineProperty(t, e, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = r, t;
}
function Ic(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function he(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ic(Object(r), !0).forEach(function(n) {
      xm(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : Ic(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
const Fm = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e), Vm = () => Headers, zm = (t, e, r) => {
  const n = Fm(r), i = Vm();
  return async (s, a) => {
    var o;
    const c = (o = await e()) !== null && o !== void 0 ? o : t;
    let u = new i(a?.headers);
    return u.has("apikey") || u.set("apikey", t), u.has("Authorization") || u.set("Authorization", `Bearer ${c}`), n(s, he(he({}, a), {}, { headers: u }));
  };
};
function Bm(t) {
  return t.endsWith("/") ? t : t + "/";
}
function Km(t, e) {
  var r, n;
  const { db: i, auth: s, realtime: a, global: o } = t, { db: c, auth: u, realtime: l, global: m } = e, d = {
    db: he(he({}, c), i),
    auth: he(he({}, u), s),
    realtime: he(he({}, l), a),
    storage: {},
    global: he(he(he({}, m), o), {}, { headers: he(he({}, (r = m?.headers) !== null && r !== void 0 ? r : {}), (n = o?.headers) !== null && n !== void 0 ? n : {}) }),
    accessToken: async () => ""
  };
  return t.accessToken ? d.accessToken = t.accessToken : delete d.accessToken, d;
}
function Gm(t) {
  const e = t?.trim();
  if (!e) throw new Error("supabaseUrl is required.");
  if (!e.match(/^https?:\/\//i)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
  try {
    return new URL(Bm(e));
  } catch {
    throw Error("Invalid supabaseUrl: Provided URL is malformed.");
  }
}
var Hm = class extends Im {
  constructor(t) {
    super(t);
  }
}, Wm = class {
  /**
  * Create a new client for use in the browser.
  * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
  * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
  * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
  * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
  * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
  * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
  * @param options.realtime Options passed along to realtime-js constructor.
  * @param options.storage Options passed along to the storage-js constructor.
  * @param options.global.fetch A custom fetch implementation.
  * @param options.global.headers Any additional headers to send with each network request.
  * @example
  * ```ts
  * import { createClient } from '@supabase/supabase-js'
  *
  * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
  * const { data } = await supabase.from('profiles').select('*')
  * ```
  */
  constructor(t, e, r) {
    var n, i;
    this.supabaseUrl = t, this.supabaseKey = e;
    const s = Gm(t);
    if (!e) throw new Error("supabaseKey is required.");
    this.realtimeUrl = new URL("realtime/v1", s), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", s), this.storageUrl = new URL("storage/v1", s), this.functionsUrl = new URL("functions/v1", s);
    const a = `sb-${s.hostname.split(".")[0]}-auth-token`, o = {
      db: Dm,
      realtime: qm,
      auth: he(he({}, Lm), {}, { storageKey: a }),
      global: Cm
    }, c = Km(r ?? {}, o);
    if (this.storageKey = (n = c.auth.storageKey) !== null && n !== void 0 ? n : "", this.headers = (i = c.global.headers) !== null && i !== void 0 ? i : {}, c.accessToken)
      this.accessToken = c.accessToken, this.auth = new Proxy({}, { get: (l, m) => {
        throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(m)} is not possible`);
      } });
    else {
      var u;
      this.auth = this._initSupabaseAuthClient((u = c.auth) !== null && u !== void 0 ? u : {}, this.headers, c.global.fetch);
    }
    this.fetch = zm(e, this._getAccessToken.bind(this), c.global.fetch), this.realtime = this._initRealtimeClient(he({
      headers: this.headers,
      accessToken: this._getAccessToken.bind(this)
    }, c.realtime)), this.accessToken && Promise.resolve(this.accessToken()).then((l) => this.realtime.setAuth(l)).catch((l) => console.warn("Failed to set initial Realtime auth token:", l)), this.rest = new jf(new URL("rest/v1", s).href, {
      headers: this.headers,
      schema: c.db.schema,
      fetch: this.fetch,
      timeout: c.db.timeout,
      urlLengthLimit: c.db.urlLengthLimit
    }), this.storage = new Rp(this.storageUrl.href, this.headers, this.fetch, r?.storage), c.accessToken || this._listenForAuthEvents();
  }
  /**
  * Supabase Functions allows you to deploy and invoke edge functions.
  */
  get functions() {
    return new Sf(this.functionsUrl.href, {
      headers: this.headers,
      customFetch: this.fetch
    });
  }
  /**
  * Perform a query on a table or a view.
  *
  * @param relation - The table or view name to query
  */
  from(t) {
    return this.rest.from(t);
  }
  /**
  * Select a schema to query or perform an function (rpc) call.
  *
  * The schema needs to be on the list of exposed schemas inside Supabase.
  *
  * @param schema - The schema to query
  */
  schema(t) {
    return this.rest.schema(t);
  }
  /**
  * Perform a function call.
  *
  * @param fn - The function name to call
  * @param args - The arguments to pass to the function call
  * @param options - Named parameters
  * @param options.head - When set to `true`, `data` will not be returned.
  * Useful if you only need the count.
  * @param options.get - When set to `true`, the function will be called with
  * read-only access mode.
  * @param options.count - Count algorithm to use to count rows returned by the
  * function. Only applicable for [set-returning
  * functions](https://www.postgresql.org/docs/current/functions-srf.html).
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  */
  rpc(t, e = {}, r = {
    head: !1,
    get: !1,
    count: void 0
  }) {
    return this.rest.rpc(t, e, r);
  }
  /**
  * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
  *
  * @param {string} name - The name of the Realtime channel.
  * @param {Object} opts - The options to pass to the Realtime channel.
  *
  */
  channel(t, e = { config: {} }) {
    return this.realtime.channel(t, e);
  }
  /**
  * Returns all Realtime channels.
  */
  getChannels() {
    return this.realtime.getChannels();
  }
  /**
  * Unsubscribes and removes Realtime channel from Realtime client.
  *
  * @param {RealtimeChannel} channel - The name of the Realtime channel.
  *
  */
  removeChannel(t) {
    return this.realtime.removeChannel(t);
  }
  /**
  * Unsubscribes and removes all Realtime channels from Realtime client.
  */
  removeAllChannels() {
    return this.realtime.removeAllChannels();
  }
  async _getAccessToken() {
    var t = this, e, r;
    if (t.accessToken) return await t.accessToken();
    const { data: n } = await t.auth.getSession();
    return (e = (r = n.session) === null || r === void 0 ? void 0 : r.access_token) !== null && e !== void 0 ? e : t.supabaseKey;
  }
  _initSupabaseAuthClient({ autoRefreshToken: t, persistSession: e, detectSessionInUrl: r, storage: n, userStorage: i, storageKey: s, flowType: a, lock: o, debug: c, throwOnError: u }, l, m) {
    const d = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`
    };
    return new Hm({
      url: this.authUrl.href,
      headers: he(he({}, d), l),
      storageKey: s,
      autoRefreshToken: t,
      persistSession: e,
      detectSessionInUrl: r,
      storage: n,
      userStorage: i,
      flowType: a,
      lock: o,
      debug: c,
      throwOnError: u,
      fetch: m,
      hasCustomAuthorizationHeader: Object.keys(this.headers).some((h) => h.toLowerCase() === "authorization")
    });
  }
  _initRealtimeClient(t) {
    return new Jf(this.realtimeUrl.href, he(he({}, t), {}, { params: he(he({}, { apikey: this.supabaseKey }), t?.params) }));
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((t, e) => {
      this._handleTokenChanged(t, "CLIENT", e?.access_token);
    });
  }
  _handleTokenChanged(t, e, r) {
    (t === "TOKEN_REFRESHED" || t === "SIGNED_IN") && this.changedAccessToken !== r ? (this.changedAccessToken = r, this.realtime.setAuth(r)) : t === "SIGNED_OUT" && (this.realtime.setAuth(), e == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
  }
};
const Jm = (t, e, r) => new Wm(t, e, r);
function Xm() {
  if (typeof window < "u") return !1;
  const t = globalThis.process;
  if (!t) return !1;
  const e = t.version;
  if (e == null) return !1;
  const r = e.match(/^v(\d+)\./);
  return r ? parseInt(r[1], 10) <= 18 : !1;
}
Xm() && console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");
const jc = Qs.dirname(Tu(import.meta.url)), An = new gf();
function Ym() {
  const { width: t, height: e } = Ru.getPrimaryDisplay().workAreaSize, r = 350, n = 120, i = new Ou({
    width: r,
    height: n,
    x: t - r - 20,
    y: e - n - 20,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    resizable: !1,
    webPreferences: {
      preload: Qs.join(jc, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  });
  process.env.VITE_DEV_SERVER_URL ? i.loadURL(process.env.VITE_DEV_SERVER_URL) : i.loadFile(Qs.join(jc, "../dist/index.html"));
}
mn.handle("get-secrets", () => An.get("secrets", {}));
mn.handle("save-secrets", (t, e) => (An.set("secrets", e), { success: !0 }));
mn.handle("supabase-sync", async () => {
  const t = An.get("secrets", {});
  if (!t.supabaseUrl || !t.supabaseKey) return { success: !1, message: "Missing URL/Key" };
  try {
    const e = Jm(t.supabaseUrl, t.supabaseKey), { data: r, error: n } = await e.from("test").select("count", { count: "exact", head: !0 });
    if (n) throw n;
    return { success: !0, message: "Connected to Supabase" };
  } catch (e) {
    return { success: !1, message: e.message || "Supabase Error" };
  }
});
mn.handle("cloudflare-sync", async () => {
  const t = An.get("secrets", {});
  if (!t.cfAccountId || !t.cfApiToken || !t.cfKvNamespace) return { success: !1, message: "Missing CF Credentials" };
  try {
    const e = await fetch(`https://api.cloudflare.com/client/v4/accounts/${t.cfAccountId}/storage/kv/namespaces/${t.cfKvNamespace}/keys`, {
      headers: { Authorization: `Bearer ${t.cfApiToken}` }
    }), r = await e.json();
    if (!e.ok) throw new Error(r.errors?.[0]?.message || "CF API Error");
    return { success: !0, message: `CF OK: ${r.result?.length || 0} keys` };
  } catch (e) {
    return { success: !1, message: e.message };
  }
});
Ys.whenReady().then(Ym);
Ys.on("window-all-closed", () => {
  process.platform !== "darwin" && Ys.quit();
});
