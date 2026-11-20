
import pandas as pd

# 1. Cargar el CSV
df = pd.read_csv(
    "online_retail.csv",
    sep=";",
    decimal=",",
    dtype={
        "InvoiceNo": "string",
        "StockCode": "string",
        "Description": "string",
        "Country": "string",
    },
    low_memory=False,
)

# Guardar datos iniciales
filas_iniciales = len(df)
nulos_iniciales = df.isna().sum()

# 2. Limpiar strings
str_cols = ["InvoiceNo", "StockCode", "Description", "Country"]
strings_modificados = 0

for col in str_cols:
    antes = df[col].copy()
    limpio = df[col].str.strip()
    limpio = limpio.mask(limpio == "", pd.NA)

    strings_modificados += int(
        (antes.fillna("<NA>") != limpio.fillna("<NA>")).sum()
    )

    df[col] = limpio

# 3. Convertir fechas
fechas_no_nulas_antes = int(df["InvoiceDate"].notna().sum())

df["InvoiceDate"] = pd.to_datetime(
    df["InvoiceDate"],
    format="%d/%m/%Y %H:%M",
    errors="coerce",
)

fechas_invalidas_a_nat = (
    fechas_no_nulas_antes - df["InvoiceDate"].notna().sum()
)

# 4. Convertir variables numéricas
df["Quantity"] = pd.to_numeric(
    df["Quantity"], errors="coerce"
)

df["UnitPrice"] = pd.to_numeric(
    df["UnitPrice"], errors="coerce"
)

# CustomerID a entero nullable
df["CustomerID"] = (
    df["CustomerID"]
    .astype("string")
    .str.strip()
    .str.replace(r"\.0$", "", regex=True)
)

df["CustomerID"] = pd.to_numeric(
    df["CustomerID"], errors="coerce"
).astype("Int64")

# Quantity a entero nullable
df["Quantity"] = df["Quantity"].astype("Int64")

# 5. Eliminar registros incompletos
filas_antes = len(df)

df = df.dropna(subset=["InvoiceDate", "Description"])

eliminadas_sin_fecha_o_desc = filas_antes - len(df)

# 6. Eliminar duplicados
filas_antes = len(df)

df = df.drop_duplicates()

eliminadas_duplicadas = filas_antes - len(df)

# 7. Eliminar cancelaciones
filas_antes = len(df)

df = df[
    ~df["InvoiceNo"].str.startswith("C", na=False)
]

eliminadas_cancelaciones = filas_antes - len(df)

# 8. Eliminar devoluciones y cantidades inválidas
filas_antes = len(df)

df = df[df["Quantity"] > 0]

eliminadas_cantidades_invalidas = filas_antes - len(df)

# 9. Eliminar precios inválidos
filas_antes = len(df)

df = df[df["UnitPrice"] > 0]

eliminadas_precios_invalidos = filas_antes - len(df)

# 10. Crear TotalPrice
df["TotalPrice"] = (
    df["Quantity"].astype("float64") * df["UnitPrice"]
).round(2)

# 11. Guardar resultado limpio
df.to_csv(
    "ventas_limpias.csv",
    sep=";",
    index=False,
    decimal=",",
)

# 12. Resumen final
filas_finales = len(df)
nulos_finales = df.isna().sum()

cambios = []

cambios.append(
    f"- Filas iniciales: {filas_iniciales:,}"
)

cambios.append(
    f"- Filas finales: {filas_finales:,}"
)

cambios.append(
    f"- Total de filas eliminadas: {filas_iniciales - filas_finales:,}"
)

cambios.append(
    f"- Filas eliminadas por fecha o descripción: "
    f"{eliminadas_sin_fecha_o_desc:,}"
)

cambios.append(
    f"- Filas duplicadas eliminadas: {eliminadas_duplicadas:,}"
)

cambios.append(
    f"- Cancelaciones eliminadas: {eliminadas_cancelaciones:,}"
)

cambios.append(
    f"- Devoluciones/cantidades no positivas eliminadas: "
    f"{eliminadas_cantidades_invalidas:,}"
)

cambios.append(
    f"- Precios no positivos o inválidos eliminados: "
    f"{eliminadas_precios_invalidos:,}"
)

cambios.append(
    f"- Celdas de texto normalizadas: {strings_modificados:,}"
)

cambios.append(
    f"- Fechas inválidas convertidas a NaT: {fechas_invalidas_a_nat:,}"
)

cambios.append(
    "- Columna calculada agregada: TotalPrice"
)

print("\n=== RESUMEN DE LIMPIEZA ===")

print("\n".join(cambios))

print("\n=== NULOS FINALES ===")

print(nulos_finales)
