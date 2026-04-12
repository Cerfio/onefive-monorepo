#!/bin/bash

echo "🔧 Activation de PostGIS sur la base locale..."

psql -d onefive -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -d onefive -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;"

echo "✅ PostGIS activé !"
psql -d onefive -c "SELECT PostGIS_Version();"
