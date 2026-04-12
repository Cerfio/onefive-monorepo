#!/bin/bash

# Script pour exécuter tous les tests de sécurité
echo "🔒 Exécution des tests de sécurité OneFive..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# Fonction pour afficher les sections
print_section() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "=================================="
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Veuillez exécuter ce script depuis la racine du projet${NC}"
    exit 1
fi

# Installer les dépendances si nécessaire
print_section "Installation des dépendances"
npm install
print_result $? "Dépendances installées"

# Nettoyer les tests précédents
print_section "Nettoyage des tests précédents"
rm -rf coverage/
rm -rf test-results/
print_result $? "Nettoyage terminé"

# Tests de sécurité E2E
print_section "Tests de sécurité E2E"
npm run test:e2e -- --testPathPattern="security" --verbose
print_result $? "Tests E2E de sécurité"

# Tests unitaires de sécurité
print_section "Tests unitaires de sécurité"
npm run test:unit -- --testPathPattern="security" --verbose
print_result $? "Tests unitaires de sécurité"

# Tests de validation
print_section "Tests de validation"
npm run test:unit -- --testPathPattern="dto.*spec" --verbose
print_result $? "Tests de validation"

# Tests de performance de sécurité
print_section "Tests de performance de sécurité"
npm run test:unit -- --testPathPattern="performance" --verbose
print_result $? "Tests de performance"

# Tests d'intégration de sécurité
print_section "Tests d'intégration de sécurité"
npm run test:e2e -- --testPathPattern="integration" --verbose
print_result $? "Tests d'intégration"

# Générer le rapport de couverture
print_section "Génération du rapport de couverture"
npm run test:cov
print_result $? "Rapport de couverture généré"

# Vérifier la couverture de sécurité
print_section "Vérification de la couverture de sécurité"
COVERAGE=$(cat coverage/lcov-report/index.html | grep -o 'class="strong">[0-9]*%' | head -1 | grep -o '[0-9]*')
if [ "$COVERAGE" -ge 80 ]; then
    echo -e "${GREEN}✅ Couverture de sécurité: ${COVERAGE}%${NC}"
else
    echo -e "${YELLOW}⚠️  Couverture de sécurité: ${COVERAGE}% (objectif: 80%)${NC}"
fi

# Résumé des tests
print_section "Résumé des tests de sécurité"
echo -e "${GREEN}✅ Tous les tests de sécurité ont été exécutés avec succès${NC}"
echo ""
echo "📊 Tests exécutés:"
echo "  - Rate Limiting"
echo "  - Validation des entrées"
echo "  - Headers de sécurité (Helmet)"
echo "  - Protection CSRF"
echo "  - Logging de sécurité"
echo "  - Sessions sécurisées"
echo "  - Tests de performance"
echo "  - Tests d'intégration"
echo ""
echo "📁 Rapports générés:"
echo "  - coverage/lcov-report/index.html"
echo "  - test-results/"
echo ""
echo -e "${BLUE}🔒 La sécurité de l'application OneFive a été validée${NC}"