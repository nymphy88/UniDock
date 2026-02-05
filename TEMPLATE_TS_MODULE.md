# Adding a new TypeScript app/module to UNIDOCK

1. Create folder `apps/<your-app>` with a `package.json` and `src/` folder.
2. Make `package.json` scripts consistent: `dev` (vite), `build` (tsc -b && vite build), `typecheck` (tsc --noEmit), `lint`, `format`.
3. Add a `tsconfig.json` that extends from `../../tsconfig.base.json` and includes `src`.

Example `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "noEmit": true
  },
  "include": ["src"]
}
```

4. To use imports from other apps use path alias `@unidock/<app>/...`.
5. Run `pnpm -w install` and use `pnpm -C apps/<your-app> dev` to run.
