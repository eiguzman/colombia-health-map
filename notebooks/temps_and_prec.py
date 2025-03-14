import numpy as np
import pandas as pd
import geopandas as gpd
import altair as alt

summer = ['jun','jul','aug','sep']
summer_regex = '|'.join(summer)

alt.data_transformers.enable("vegafusion")

df = pd.read_csv('../data/raw/metadata.csv')
df.columns = df.columns.str.lower()

idd = df[['municipality code']]
idd.columns = ['id']

temp_all = df.loc[:, df.columns.str.contains('temp')]
temp_summ = temp_all.loc[:, temp_all.columns.str.contains(summer_regex, regex= True)]
years = temp_summ.columns.str[-2:].unique().values

avg_temps = [idd['id']]
for year in years:
    avg_temps.append(
        temp_summ.loc[:, temp_summ.columns.str.contains(year)].max(axis=1)
    )

yearly_temps = pd.concat(avg_temps, axis=1)
yearly_temps.columns = ['id'] + [
    f'temp_{year}'
    for year in range(2007, 2019)
]

prec = df.loc[:, df.columns.str.contains('prec')]
avg_precs = [idd['id']]
for year in years:
    avg_precs.append(
        prec.loc[:, prec.columns.str.contains(year)].mean(axis=1)
    )

yearly_prec = pd.concat(avg_precs, axis=1)
yearly_prec.columns = ['id'] + [
    f'prec_{year}'
    for year in range(2007, 2019)
]

yearly_temps.to_csv('../data/temperatures.csv', index=False)
yearly_prec.to_csv('../data/precipitation.csv', index=False)