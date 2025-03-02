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

combined = pd.concat([
    df[['id', 'name']],
    incident
], axis=1)

combined = combined.merge(gdf[['id', 'geometry']], how='left', on='id')

combined = gpd.GeoDataFrame(combined)

# incident rate per 100,000 people
combined.to_file('../data/incident.geojson', driver='GeoJSON')

# combined_melted = combined.melt(
#     id_vars=["id", "name", "geometry"], 
#     var_name="year", 
#     value_name="incident",
#     value_vars=[f"incident_{y}" for y in range(2007, 2020)]
# )
# combined_melted["year"] = combined_melted["year"].str.extract(r'(\d+)').astype(int)
# combined_melted = combined_melted[['id', 'name', 'year', 'incident', 'geometry']]
# combined_melted = gpd.GeoDataFrame(combined_melted)

# (
#     alt.Chart(combined)
#     .mark_geoshape()
#     .encode(
#         tooltip=["name:N", 'incident_2019:Q'],
#         color=alt.Color(
#             "incident_2019:Q",
#             scale=alt.Scale(type="linear", scheme="reds"))
#     )
#     .project(type="mercator")
#     .properties(width=600, height=600)
# )