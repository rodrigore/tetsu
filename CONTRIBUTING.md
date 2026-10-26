# Working on Tetsu

Branches:

- `main` is what is published at https://rodrigore.github.io/tetsu/. Every push to it deploys.
- `dev` collects finished features. Nothing is deployed from it.
- `feat/…`, `fix/…`, `chore/…` are short-lived branches, cut from `dev`.

Flow:

1. `git switch dev && git pull`, then `git switch -c feat/short-name`.
2. Commit, push, and open a pull request **into `dev`**. CI runs the tests and the build.
3. Merge into `dev` once CI is green. Several features can pile up there.
4. When `dev` is ready to ship, open a pull request **from `dev` into `main`** and merge it. That deploys.
5. Hotfixes: branch from `main`, pull request into `main`, then merge `main` back into `dev`.

Dependabot opens its pull requests against `dev`.

## Pruebas de pantalla

`npm run test:e2e` construye la app y la revisa en 10 tamaños de pantalla (iPhone SE a 17 Pro Max, Android, iPad y teléfono acostado), con cada layout, en español e inglés y con texto normal y grande. Falla si algo se sale de la pantalla, si hay controles encimados, si el contenido queda tapado por la barra inferior o si hay errores en consola. Guarda capturas en `e2e/out`. No corre en CI porque necesita el navegador de Playwright.
