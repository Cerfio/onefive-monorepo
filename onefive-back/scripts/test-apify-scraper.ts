/**
 * Script de test pour l'API Apify - LinkedIn Profile Scraper
 * 
 * Usage: 
 * 1. Créer un fichier .env.test à la racine avec APIFY_API_TOKEN=votre_token
 * 2. Exécuter: npx ts-node scripts/test-apify-scraper.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.test' });

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'harvestapi~linkedin-profile-scraper';
const LINKEDIN_URL = 'https://www.linkedin.com/in/yannis-coulibaly/';

async function testApifyLinkedInScraper() {
  if (!APIFY_TOKEN) {
    console.error('❌ APIFY_API_TOKEN n\'est pas défini dans .env.test');
    process.exit(1);
  }

  console.log('🚀 Démarrage du test de scraping LinkedIn via Apify...');
  console.log(`📍 URL cible: ${LINKEDIN_URL}`);
  console.log(`🎭 Actor ID: ${ACTOR_ID}`);
  console.log('');

  const startTime = Date.now();

  try {
    console.log('⏳ Lancement du scraping (cela peut prendre 1-2 minutes)...');
    
    const response = await axios.post(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
      {
        profileScraperMode: 'Profile details no email ($4 per 1k)',
        queries: [LINKEDIN_URL],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${APIFY_TOKEN}`,
        },
        params: {
          token: APIFY_TOKEN,
        },
        timeout: 180000, // 3 minutes timeout
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Scraping terminé avec succès ! (${duration}s)`);
    console.log(`📊 Nombre de profils récupérés: ${response.data.length}`);
    console.log('');

    if (response.data.length > 0) {
      const profile = response.data[0];
      
      console.log('👤 === DONNÉES DU PROFIL ===');
      console.log(`Nom: ${profile.firstName} ${profile.lastName}`);
      console.log(`Headline: ${profile.headline}`);
      console.log(`LinkedIn URL: ${profile.linkedinUrl}`);
      console.log(`Public ID: ${profile.publicIdentifier}`);
      console.log(`Location: ${profile.location?.linkedinText || 'N/A'}`);
      console.log(`Connexions: ${profile.connectionsCount || 'N/A'}`);
      console.log(`Followers: ${profile.followerCount || 'N/A'}`);
      console.log(`Vérifié: ${profile.verified ? '✓' : '✗'}`);
      console.log('');

      console.log(`💼 Expériences: ${profile.experience?.length || 0}`);
      if (profile.experience && profile.experience.length > 0) {
        profile.experience.slice(0, 3).forEach((exp: any, index: number) => {
          console.log(`  ${index + 1}. ${exp.position} @ ${exp.companyName}`);
          console.log(`     ${exp.startDate?.text || ''} - ${exp.endDate?.text || 'Present'}`);
        });
      }
      console.log('');

      console.log(`🎓 Formations: ${profile.education?.length || 0}`);
      if (profile.education && profile.education.length > 0) {
        profile.education.slice(0, 3).forEach((edu: any, index: number) => {
          console.log(`  ${index + 1}. ${edu.schoolName}`);
          console.log(`     ${edu.degree || ''} ${edu.fieldOfStudy || ''}`);
        });
      }
      console.log('');

      console.log(`🎯 Compétences: ${profile.skills?.length || 0}`);
      if (profile.skills && profile.skills.length > 0) {
        const skillNames = profile.skills.slice(0, 10).map((s: any) => s.name).join(', ');
        console.log(`  ${skillNames}${profile.skills.length > 10 ? '...' : ''}`);
      }
      console.log('');

      console.log('📸 Images:');
      console.log(`  Avatar: ${profile.photo ? '✓' : '✗'}`);
      console.log(`  Cover: ${profile.coverPicture?.url ? '✓' : '✗'}`);
      console.log('');

      console.log('📝 Bio:');
      console.log(`  ${profile.about?.substring(0, 150) || 'N/A'}${profile.about?.length > 150 ? '...' : ''}`);
      console.log('');

      // Sauvegarder le JSON complet
      console.log('💾 Sauvegarde du JSON complet dans ./test-output.json...');
      const fs = require('fs');
      fs.writeFileSync('./test-output.json', JSON.stringify(response.data, null, 2));
      console.log('✅ JSON sauvegardé !');
      console.log('');
    }

    console.log('🎉 Test terminé avec succès !');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('  1. Vérifier les données dans test-output.json');
    console.log('  2. Adapter les schemas Zod si nécessaire');
    console.log('  3. Tester avec différents profils LinkedIn');
    console.log('');

  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n❌ Erreur lors du scraping (${duration}s)`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.error?.message || error.response.statusText}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('');
    console.log('🔍 Vérifications à faire:');
    console.log('  1. APIFY_API_TOKEN est valide');
    console.log('  2. Le profil LinkedIn est public');
    console.log('  3. L\'URL LinkedIn est correcte');
    console.log('  4. Le compte Apify a des crédits');
    console.log('');
    
    process.exit(1);
  }
}

// Lancer le test
testApifyLinkedInScraper();







