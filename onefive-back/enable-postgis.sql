-- Activer l'extension PostGIS dans PostgreSQL
-- Exécutez cette commande dans votre base de données PostgreSQL

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Vérifier que PostGIS est bien activé
SELECT PostGIS_Version();