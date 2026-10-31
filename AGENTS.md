# AGENTS.md — magnolias-frontend

Guía de forma de trabajo para cualquier agente (o persona) que haga cambios en este repo. Nuxt 4 SPA (`ssr: false`), desplegado por FTP a Hostinger solo desde `prod`.

## Flujo por tarea

1. **Analiza antes de tocar código.** Confirma en el código real cómo se comporta algo hoy antes de proponer un cambio — varias veces lo que se cree que hace el sistema (ej. un guard de edición) en realidad solo es una condición de UI, no del backend.
2. **Crea la rama desde `dev` antes de editar cualquier archivo**, nunca edites directo sobre `dev`:
   ```
   git checkout dev && git pull
   git checkout -b <tipo>/<slug-descriptivo>
   ```
   `<tipo>`: `feature/`, `fix/`, `chore/`, `docs/`. Esto aplica también a las promociones `dev → staging` y `staging → prod`: la rama de promoción sale de `origin/dev` (o `origin/staging`) directo, **nunca** de `staging`/`prod` haciendo `merge --no-ff` del siguiente ambiente — eso genera conflictos "add/add" falsos contra el historial squasheado de PRs previas.
3. **Implementa**, incluyendo specs nuevos/actualizados para cada caso que cambie — sobre todo los que tocan un componente ya cubierto (un cambio que quita un botón o agrega una etiqueta casi siempre rompe un `expect` existente, revísalos).
4. **Verifica antes de commitear**:
   ```
   npm test -- --run
   npm run build
   ```
   (no hay script `lint` en este repo). Si el cambio quita o agrega una dependencia (`package.json`), corre `npm install` para que `package-lock.json` quede sincronizado antes de commitear.
5. **Commit**: mensaje descriptivo explicando el *por qué* del cambio, terminando con:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```
   Si el mensaje tiene comillas/backticks/saltos de línea, escríbelo a un archivo temporal y usa `git commit -F <archivo>` — pasarlo inline por `-m` en Bash se corrompe fácilmente.
6. **Push + PR** con `gh pr create --base dev --head <rama> --title "..." --body-file <archivo>` (mismo motivo: el cuerpo del PR se escribe a un archivo, no inline). El cuerpo del PR termina con:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```
7. **Auto-merge**: `gh pr merge --auto --squash` inmediatamente después de crear el PR.
8. **Monitorea CI y SonarCloud** (`gh pr checks <n>`) hasta que ambos pasen. El quality gate de SonarCloud exige **≥80% de cobertura en código nuevo** por archivo — si falla por cobertura (es fácil que pase con lógica nueva en un `.vue` grande como `index.vue`), agrega los casos de prueba que falten y vuelve a empujar en vez de forzar el merge. Puedes consultar el detalle por archivo sin abrir el dashboard:
   ```
   curl -s "https://sonarcloud.io/api/measures/component_tree?component=DevCraftersEnterprise_magnolias-frontend&pullRequest=<n>&metricKeys=new_coverage,new_uncovered_lines&qualifiers=FIL"
   ```
9. **Verifica que el PR quedó `MERGED`** (`gh pr view <n> --json state`) antes de dar la tarea por terminada.
10. **Borra la rama**, local y remota:
    ```
    git checkout dev && git pull
    git branch -D <rama>
    git push origin --delete <rama>
    ```

No te saltes pasos para ir "más rápido" — el branch protection de `dev`/`staging`/`prod` es estricto y aplica incluso a administradores, no hay atajo de hotfix.

## Promoción entre ambientes

`dev → staging → prod`, siempre en ese orden, nunca directo a `prod`. Antes de crear la rama de promoción, compara **contenido real**, no historial de commits:
```
git diff --stat origin/staging origin/dev
```
(`git log origin/staging..origin/dev` es engañoso después de que `staging` recibe PRs por squash: lista todos los commits originales como "faltantes" aunque su contenido ya esté ahí). El deploy a producción (FTP a Hostinger, `npm run generate`) solo corre desde `prod` vía GitHub Actions.

## Notas del entorno

- `git autocrlf` está activado — las advertencias de CRLF al hacer `add`/`commit` son normales, ignóralas.
- No hay Python disponible en este entorno; usa Node para scripts puntuales.
- Composables auto-importados (carpeta `app/utils/`, `app/composables/`) no llevan `import` explícito — si Vitest se queja de algo "no definido" que vive ahí, probablemente falte mockearlo, no importarlo.
- `mockNuxtImport` sobre `useRuntimeConfig`/`useCookie` falla en archivos `.ts` planos (no `.vue`) — usar `document.cookie` real y aserciones relajadas en su lugar.
