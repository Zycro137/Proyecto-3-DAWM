import pandas as pd
import json

# 1. Leer el CSV limpio
df = pd.read_csv(
    "ventas_limpias.csv",
    sep=";",
    decimal=",",
    dtype={
        "InvoiceNo": "string",
        "StockCode": "string",
        "Description": "string",
        "Country": "string",
    },
)

# 2. Recuperar los tipos de datos correctos
df["InvoiceDate"] = pd.to_datetime(
    df["InvoiceDate"],
    errors="coerce"
)

df["Quantity"] = pd.to_numeric(
    df["Quantity"], errors="coerce"
).astype("Int64")

df["UnitPrice"] = pd.to_numeric(
    df["UnitPrice"], errors="coerce"
)

df["CustomerID"] = pd.to_numeric(
    df["CustomerID"], errors="coerce"
).astype("Int64")

df["TotalPrice"] = pd.to_numeric(
    df["TotalPrice"], errors="coerce"
)

# 3. Convertir a JSON (minificado para mantener el peso < 100 MB)
df.to_json(
    "ventas.json",
    orient="records",
    date_format="iso",
    force_ascii=False
)

print("Archivo ventas.json generado correctamente.")

# 4. Validar el archivo JSON
with open("ventas.json", "r", encoding="utf-8") as archivo:
    datos = json.load(archivo)

# 5. Comprobar estructura y cantidad de registros
print("\n=== VALIDACIÓN DEL JSON ===")

print("JSON válido:", isinstance(datos, list))
print("Registros en CSV:", len(df))
print("Registros en JSON:", len(datos))
print("Cantidad de registros coincide:", len(df) == len(datos))

# 6. Mostrar estructura de un registro
if datos:
    print("\n=== EJEMPLO DE REGISTRO ===")
    print(json.dumps(datos[0], indent=2, ensure_ascii=False))

# 7. Comprobar valores faltantes
print("\n=== VALORES NULOS EN JSON ===")

nulos = {
    columna: sum(
        1 for registro in datos
        if registro[columna] is None
    )
    for columna in df.columns
}

for columna, cantidad in nulos.items():
    print(f"{columna}: {cantidad}")

# 8. Validar tipos de datos del primer registro
if datos:
    print("\n=== TIPOS DE DATOS ===")

    for columna, valor in datos[0].items():
        print(f"{columna}: {type(valor).__name__}")