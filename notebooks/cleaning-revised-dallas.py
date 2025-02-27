import pandas as pd
import geopandas as gpd
import altair as alt

# --------------------------
# ---[clean metadata.csv]---
# --------------------------

df = pd.read_csv('../data/raw/metadata.csv')
to_drop_startswith = ('2', 'Build', 'TEMP', 'PREC','Numb', 'Retire', 'Age')
to_drop_exact = {
    'NumberofhospitalsperKm2',
    'Peopledoinghousework(%)',
    'PeoplewithDisabilities(%)',
    'AfrocolombianPopulation(%)',
    'IndianPopulation(%)',
}
df = df.loc[:, ~df.columns.str.startswith(to_drop_startswith)]
df = df.loc[:, ~df.columns.isin(to_drop_exact)]
df = df.rename(columns={
    'Municipality code': 'id',
    'Municipality': 'name',
    'Peoplewhocannotreadorwrite(%)': 'illiterate',
    'Secondary/HigherEducation(%)': 'education',
    'Employedpopulation(%)': 'employed',
    'Unemployedpopulation(%)': 'unemployed',
    'Men(%)': 'men',
    'Women(%)': 'women',
    'Householdswithoutwateraccess(%)': 'water',
    'Householdswithoutinternetaccess(%)': 'internet'
})
df.columns = [
    col.replace("Population", "pop")
    if col.startswith("Population") else col
    for col in df.columns
]
df.columns = df.columns.str.lower()
float_cols = [
    "illiterate", "education", "employed", "unemployed",
    "men", "women", "water", "internet"
]
int_cols = [
    "id", "pop2007", "pop2008", "pop2009", "pop2010",
    "pop2011", "pop2012", "pop2013", "pop2014", "pop2015",
    "pop2016", "pop2017", "pop2018", "pop2019",
    "cases2007", "cases2008", "cases2009", "cases2010",
    "cases2011", "cases2012", "cases2013", "cases2014",
    "cases2015", "cases2016", "cases2017", "cases2018", "cases2019"
]
df[float_cols] = df[float_cols].astype("float64")
df[int_cols] = df[int_cols].astype("int64")

# --------------------------------------
# ---[clean mapa_municipios.topojson]---
# --------------------------------------

gdf = gpd.read_file('../data/raw/mapa_municipios.topojson')
# set to standard web mercator projection
gdf = gdf.set_crs(epsg=4326)
gdf = gdf.drop(columns=['id', 'codigo_municipio_s'])
gdf.columns = ['id', 'geometry']
gdf['id'] = gdf['id'].astype(int)
# set to spherical mercator projection
gdf = gdf.to_crs(epsg=3857)
gdf["area"] = gdf['geometry'].area / 1e6
# set back to standard web mercator projection
gdf = gdf.to_crs(epsg=4326)

# ----------------------------
# ---[combine meta and geo]---
# ----------------------------

merged = gdf.merge(df, on="id", how="left")
columns_order = [
    "id", "name", "illiterate", "education", "employed", "unemployed",
    "water", "internet", "men", "women",
    "pop2007", "pop2008", "pop2009", "pop2010", "pop2011", "pop2012",
    "pop2013", "pop2014", "pop2015", "pop2016", "pop2017", "pop2018", "pop2019",
    "cases2007", "cases2008", "cases2009", "cases2010", "cases2011", "cases2012",
    "cases2013", "cases2014", "cases2015", "cases2016", "cases2017", "cases2018", "cases2019",
    "area", "geometry"
]
merged = merged.reindex(columns=columns_order)

# ----------------
# ---[map test]---
# ----------------

test = merged.copy()
test["pop_density"] = test["pop2019"] / test["area"]
population_density = (
    alt.Chart(test)
    .mark_geoshape()
    .encode(
        tooltip=["name:N", 'area:Q', 'pop2019:Q'],
        color=alt.Color("area:Q", scale=alt.Scale(type="log", scheme="reds"), title='area km²')
    )
    .project(type="mercator")
    .properties(width=600, height=600, title='Colombia 2019 Population Density')
)

# ------------------------------
# ---[exporting cleaned data]---
# ------------------------------

df.to_csv('../data/meta.csv', index=False)
gdf.to_file('../data/geo.geojson', driver='GeoJSON')
merged.to_file('../data/master.geojson', driver='GeoJSON')
