import geopandas as gpd
import pandas as pd
import numpy as np

# Load your base GeoJSON
gdf = gpd.read_file('data/us_concerts2.geojson')

# Loop through each year and join the CSV data
for year in range(1990, 1993):
    col = f'show_count_{year}'
    gdf[col] = gdf[col].replace('NA', np.nan).fillna(0).astype(int)
# Save as GeoJSON for your map
gdf.to_file('us_concerts3.geojson', driver='GeoJSON')