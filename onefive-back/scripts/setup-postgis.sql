-- Script de configuration PostGIS pour la production
-- À exécuter une seule fois lors du déploiement initial

-- 1. Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Vérifier l'installation
SELECT PostGIS_Version();

-- 3. Créer un index spatial sur la table spots (optionnel mais recommandé)
-- Cette commande sera exécutée automatiquement par Prisma lors du push du schéma
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spots_location ON spots USING GIST (ST_GeomFromGeoJSON(location::text));

-- 4. Vérifier que les fonctions PostGIS sont disponibles
SELECT 
    proname as function_name,
    proargnames as arguments
FROM pg_proc 
WHERE proname LIKE 'st_%' 
AND proname IN ('st_dwithin', 'st_distance', 'st_geomfromgeojson')
ORDER BY proname;