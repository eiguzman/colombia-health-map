import numpy as np
import pandas as pd
import geopandas as gpd
import altair as alt
alt.data_transformers.enable("vegafusion")

df = pd.read_csv('../data/meta.csv')
df = df.drop(columns=['illiterate', 'education', 'employed', 'unemployed', 'men', 'women', 'water', 'internet'])

population = df[[f'pop{year}' for year in range(2007, 2020)]].values
cases = df[[f'cases{year}' for year in range(2007, 2020)]].values

incident = pd.DataFrame(cases / population * 100_000)
incident.columns = [f'incident{year}' for year in range(2007, 2020)]

gdf = gpd.read_file('../data/geo.geojson')

test = pd.concat([
    df[['id', 'name']],
    incident
], axis=1)

test = test.merge(gdf, how='left', on='id')
# test = test[['id', 'name', 'incident2019', 'geometry']]
test = gpd.GeoDataFrame(test)

(
    alt.Chart(test)
    .mark_geoshape()
    .encode(
        tooltip=["name:N", 'incident2007:Q'],
        color=alt.Color("incident2007:Q", scale=alt.Scale(type="log", scheme="reds", domain=[0,15000]))
    )
    .project(type="mercator")
    .properties(width=600, height=600)
)

# Replace zeroes with 1 (log(1) = 0)
test["incident2007"] = test["incident2007"].replace(0, 1)
test["incident2008"] = test["incident2008"].replace(0, 1)
test["incident2009"] = test["incident2009"].replace(0, 1)
test["incident2010"] = test["incident2010"].replace(0, 1)

chart = (
    alt.Chart(test)
    .mark_geoshape()
    .encode(
        tooltip=["name:N", "incident2009:Q"],
        color=alt.Color(
            "incident2009:Q",
            scale=alt.Scale(type="log", scheme="reds", domainMin=1, domainMax=15000),
        ),
    )
    .project(type="mercator")
    .properties(width=600, height=600)
)

chart
