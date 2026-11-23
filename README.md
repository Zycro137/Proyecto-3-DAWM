# Panel de ventas · Online Retail

Dashboard responsivo construido con React, TypeScript, Vite y Material UI para
explorar las ventas del conjunto de datos Online Retail.

## Requisitos

- Node.js y npm.
- El archivo `Scripts/ventas.json`, necesario para ejecutar y compilar el
  dashboard.

## Desarrollo

```powershell
npm.cmd install
npm.cmd run dev
```

Para comprobar la compilación, lint y vista de producción:

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
```

Vite sirve el JSON desde `Scripts/ventas.json` durante el desarrollo y lo copia
a `dist/data/ventas.json` al compilar. El archivo debe estar disponible en esa
ruta cuando se ejecute `npm run build`; no es necesario duplicarlo dentro de
`public/`.

## Datos

El dashboard carga los 216.458 registros de `Scripts/ventas.json`. Los KPI,
gráficos, rankings y transacciones se calculan a partir de esos datos y se
actualizan con los filtros. Los registros de cancelación o devolución y las
cantidades o precios no positivos se excluyen del análisis; los clientes sin
`CustomerID` no se cuentan en el KPI de clientes únicos.

La carpeta de Google Drive con los archivos CSV originales y respaldos está
[disponible aquí](https://drive.google.com/drive/folders/1bYsEoScXeVjIxsfE1BKLsto5eJo6GlyS?usp=sharing).
