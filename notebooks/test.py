import numpy as np
import pandas as pd
import geopandas as gpd
import altair as alt
alt.data_transformers.enable("vegafusion")

df = pd.read_csv('../data/meta.csv')
df = df.drop(columns=['illiterate', 'education', 'employed', 'unemployed', 'men', 'women', 'water', 'internet'])

population = df[[f'pop{year}' for year in range(2007, 2020)]].values
population = np.where(population == 0, np.nan, population)
cases = df[[f'cases{year}' for year in range(2007, 2020)]].values

incident = pd.DataFrame(cases / population * 100_000)
incident.columns = [f'incident_{year}' for year in range(2007, 2020)]

gdf = gpd.read_file('../data/geo.geojson')

# temps and prec
temps = pd.read_csv('../data/temperatures.csv')
prec = pd.read_csv('../data/precipitation.csv')

combined = pd.concat([
    df[['id', 'name']],
    incident
], axis=1)

# combining with the dataset we've been working on
combined = combined.merge(temps, how='left', on='id')
combined = combined.merge(prec, how='left', on='id')

combined = combined.merge(gdf[['id', 'geometry']], how='left', on='id')

combined = gpd.GeoDataFrame(combined)

# incidence rate, temperatures, and precipitation
all_without_2019 = combined.loc[:, ~combined.columns.str.contains('2019')]
# all_without_2019.to_file('../data/all_without_2019.geojson', driver='GeoJSON')

# incident rate per 100,000 people
# combined.to_file('../data/incident.geojson', driver='GeoJSON')

# combined_melted = combined.melt(
#     id_vars=["id", "name", "geometry"], 
#     var_name="year", 
#     value_name="incident",
#     value_vars=[f"incident_{y}" for y in range(2007, 2020)]
# )
# combined_melted["year"] = combined_melted["year"].str.extract(r'(\d+)').astype(int)
# combined_melted = combined_melted[['id', 'name', 'year', 'incident', 'geometry']]
# combined_melted = gpd.GeoDataFrame(combined_melted)


# VISUAL TESTING

# (
#     alt.Chart(combined)
#     .mark_geoshape()
#     .encode(
#         tooltip=["name:N", 'temp_2018:Q'],
#         color=alt.Color(
#             "temp_2018:Q",
#             scale=alt.Scale(type="log", scheme="reds"))
#     )
#     .project(type="mercator")
#     .properties(width=600, height=600)
# )

# (
#     alt.Chart(combined)
#     .mark_geoshape()
#     .encode(
#         tooltip=["name:N", 'prec_2018:Q'],
#         color=alt.Color(
#             "prec_2018:Q",
#             scale=alt.Scale(type="log", scheme="blues"))
#     )
#     .project(type="mercator")
#     .properties(width=600, height=600)
# )