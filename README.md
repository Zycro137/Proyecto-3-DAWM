# Panel de ventas · Online Retail

Dashboard responsivo construido con React, TypeScript, Vite y Material UI para
explorar las ventas del conjunto de datos Online Retail almacenadas en Firebase
Realtime Database.

## Desarrollo local

```bash
npm ci
npm run dev
```

En local, Vite sirve la aplicación desde la raíz (`/`). Para producción genera
los recursos con la ruta base `/Proyecto-3-DAWM/`, que corresponde a GitHub Pages.

## Despliegue en GitHub Pages

El workflow de GitHub Actions compila la aplicación y publica el directorio
`dist` al hacer push a `main`. En el repositorio, configura **Settings → Pages
→ Build and deployment → Source: GitHub Actions**. Después de guardar el
workflow, puedes revisar el resultado en la pestaña **Actions**.

## Requisitos

- Node.js y npm.
- Proyecto configurado en Firebase Realtime Database con los registros
  importados desde `Scripts/ventas.json`.

