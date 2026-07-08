/**
 * Support Center Data: FAQ & Guides
 * Complete dataset for the /support page
 */

export type FAQCategory =
  | 'authentification'
  | 'profil'
  | 'réseau'
  | 'dataroom'
  | 'posts'
  | 'discussions'
  | 'startups'
  | 'messagerie'
  | 'notifications'
  | 'référal'
  | 'compte';

export type GuideDifficulty = 'facile' | 'moyen' | 'avancé';
export type GuideCategory =
  | 'démarrage'
  | 'profil'
  | 'réseau'
  | 'dataroom'
  | 'contenu'
  | 'compte';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  tags: string[];
}

export interface GuideSection {
  title: string;
  content: string;
  steps: string[];
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  duration: string;
  difficulty: GuideDifficulty;
  tags: string[];
  sections: GuideSection[];
}

export interface SupportData {
  faq: FAQ[];
  guides: Guide[];
}

export const supportData: SupportData = {
  faq: [
    {
      id: 'faq-auth-inscription-email',
      question: 'Comment créer un compte OneFive avec mon email ?',
      answer:
        "Depuis l'écran d'inscription, renseignez votre prénom, nom, email et mot de passe, puis validez. Ouvrez ensuite l'email de vérification et cliquez sur le lien pour activer votre compte. Sans cette étape, certaines actions restent limitées.",
      category: 'authentification',
      tags: ['inscription', 'email', 'activation'],
    },
    {
      id: 'faq-auth-oauth-linkedin-google',
      question: 'Puis-je me connecter avec LinkedIn ou Google ?',
      answer:
        "Oui, vous pouvez choisir LinkedIn ou Google sur l'écran de connexion. Autorisez OneFive à accéder aux informations demandées pour finaliser la connexion. Si un compte existe déjà avec le même email, la connexion est généralement rapprochée automatiquement.",
      category: 'authentification',
      tags: ['oauth', 'linkedin', 'google', 'connexion'],
    },
    {
      id: 'faq-auth-code-non-recu',
      question: "Je n'ai pas reçu mon code de vérification SMS ou email, que faire ?",
      answer:
        "Vérifiez d'abord vos dossiers spam, promotions et courriers indésirables, puis patientez 1 à 2 minutes. Utilisez ensuite l'option de renvoi du code et confirmez que votre email ou numéro est correct. Si le problème persiste, contactez le support avec l'adresse ou le numéro concerné.",
      category: 'authentification',
      tags: ['verification', 'sms', 'email', 'erreur'],
    },
    {
      id: 'faq-referral-ref-code',
      question: "Comment utiliser un code de parrainage lors de l'inscription ?",
      answer:
        "Inscrivez-vous depuis un lien contenant le paramètre ref, par exemple avec ?ref=CODE. Le parrainage est alors enregistré automatiquement sur votre compte. Retrouvez votre progression dans votre espace parrainage.",
      category: 'référal',
      tags: ['parrainage', 'ref', 'inscription', 'code'],
    },
    {
      id: 'faq-referral-ambassadeur',
      question: 'Quel est le rôle des ambassadeurs ?',
      answer:
        "Les ambassadeurs relaient OneFive à leur réseau via un lien unique. Partagez aussi votre propre lien de parrainage de manière ciblée pour faire grandir la communauté et progresser dans les paliers.",
      category: 'référal',
      tags: ['ambassadeur', 'partage', 'parrainage'],
    },
    {
      id: 'faq-profil-modifier-infos',
      question: 'Comment modifier mon profil (bio, poste, localisation) ?',
      answer:
        "Allez dans votre profil puis cliquez sur modifier. Mettez à jour vos informations principales et enregistrez. Préférez une bio claire orientée impact pour améliorer votre visibilité.",
      category: 'profil',
      tags: ['profil', 'edition', 'bio', 'visibilite'],
    },
    {
      id: 'faq-profil-limites-experience-education',
      question: "Combien d'expériences et d'éducations puis-je ajouter ?",
      answer:
        "Vous pouvez ajouter jusqu'à 10 expériences et 10 éducations. Si vous atteignez la limite, supprimez ou fusionnez les éléments les moins pertinents. Gardez les entrées les plus récentes et les plus impactantes en priorité.",
      category: 'profil',
      tags: ['limites', 'experience', 'education', 'profil'],
    },
    {
      id: 'faq-profil-bio-longueur',
      question: 'Quelle est la longueur maximale de la bio ?',
      answer:
        "La bio est limitée à 2000 caractères. Structurez-la en 2 à 4 blocs courts pour rester lisible. Terminez par ce que vous recherchez actuellement pour faciliter les prises de contact.",
      category: 'profil',
      tags: ['bio', '2000', 'profil', 'optimisation'],
    },
    {
      id: 'faq-reseau-ajouter-connexion',
      question: 'Comment envoyer une invitation de connexion ?',
      answer:
        "Depuis un profil, cliquez sur connecter ou suivre selon le type de relation proposé. Ajoutez un message court et personnalisé pour augmenter le taux d'acceptation. Suivez l'état de vos invitations dans votre section réseau.",
      category: 'réseau',
      tags: ['connexion', 'invitation', 'reseau'],
    },
    {
      id: 'faq-reseau-suggestions',
      question: 'Pourquoi je vois certaines suggestions de profils et startups ?',
      answer:
        "Les suggestions se basent sur votre profil, vos interactions et votre réseau existant. Plus votre profil est complet, plus les recommandations sont pertinentes. Mettez à jour régulièrement vos expériences et objectifs pour améliorer ces résultats.",
      category: 'réseau',
      tags: ['suggestions', 'profils', 'startups', 'decouverte'],
    },
    {
      id: 'faq-dataroom-prerequis',
      question: 'Quels sont les prérequis pour créer une dataroom ?',
      answer:
        "Pour créer une dataroom, vous devez être lié à une startup : soit en créant vous-même une startup, soit en ayant été invité dans une startup existante. Une dataroom est toujours associée à une startup et ne peut pas exister sans elle.",
      category: 'dataroom',
      tags: ['dataroom', 'prerequis', 'startup', 'creation'],
    },
    {
      id: 'faq-dataroom-creer',
      question: 'Comment créer ma première dataroom ?',
      answer:
        "Vous devez d'abord créer une startup ou être invité dans une startup. Une fois lié à une startup, accédez à la section dataroom puis créez un nouvel espace avec un nom explicite. Ajoutez ensuite vos documents dans une structure simple par dossier ou thème. Vérifiez les permissions avant d'inviter des membres.",
      category: 'dataroom',
      tags: ['dataroom', 'creation', 'documents', 'onboarding', 'startup'],
    },
    {
      id: 'faq-dataroom-permissions',
      question: 'Comment gérer les permissions dans une dataroom ?',
      answer:
        "Ouvrez les paramètres de la dataroom et attribuez un niveau d'accès par groupe ou par personne. Donnez uniquement les droits nécessaires selon le rôle du membre. Testez l'accès avec un compte invité avant partage large.",
      category: 'dataroom',
      tags: ['permissions', 'acces', 'groupes', 'securite'],
    },
    {
      id: 'faq-dataroom-analytics',
      question: 'À quoi servent les analytics de consultation de la dataroom ?',
      answer:
        "Les analytics indiquent qui consulte quoi et à quelle fréquence. Utilisez ces signaux pour prioriser vos relances investisseurs ou partenaires. Mettez à jour les documents les plus consultés pour gagner en efficacité.",
      category: 'dataroom',
      tags: ['analytics', 'consultation', 'suivi', 'dataroom'],
    },
    {
      id: 'faq-posts-publier',
      question: 'Comment publier un post sur OneFive ?',
      answer:
        "Dans le feed, cliquez sur créer un post puis rédigez un message clair et concret. Ajoutez du contexte utile pour lancer des échanges pertinents. Publiez et suivez ensuite les réactions et commentaires.",
      category: 'posts',
      tags: ['post', 'feed', 'publication', 'contenu'],
    },
    {
      id: 'faq-posts-bookmarks',
      question: 'Comment enregistrer un post pour le relire plus tard ?',
      answer:
        "Utilisez l'action de bookmark disponible sur le post. Le contenu est ajouté à votre liste d'enregistrements. Revenez-y depuis votre espace dédié pour le consulter quand vous voulez.",
      category: 'posts',
      tags: ['bookmarks', 'enregistrer', 'feed'],
    },
    {
      id: 'faq-discussions-participer',
      question: 'Comment participer aux discussions et Q&A ?',
      answer:
        "Ouvrez une discussion, lisez le contexte puis ajoutez une réponse utile et concise. Appuyez-vous sur des retours d'expérience concrets plutôt que des généralités. Cela améliore la qualité des échanges et votre visibilité.",
      category: 'discussions',
      tags: ['discussions', 'q&a', 'reponses', 'participation'],
    },
    {
      id: 'faq-discussions-upvotes',
      question: 'À quoi servent les votes et upvotes dans les discussions ?',
      answer:
        "Les votes mettent en avant les réponses jugées les plus utiles par la communauté. Utilisez-les pour signaler les contributions de qualité. Ils facilitent aussi la lecture des fils les plus actifs.",
      category: 'discussions',
      tags: ['votes', 'upvotes', 'tri', 'qualite'],
    },
    {
      id: 'faq-startups-creer-profil',
      question: 'Comment créer le profil de ma startup ?',
      answer:
        "Depuis la section startups, démarrez la création du profil et complétez les informations clés. Ajoutez une description claire, votre positionnement et les éléments de crédibilité principaux. Invitez ensuite les membres de l'équipe concernés.",
      category: 'startups',
      tags: ['startup', 'profil', 'creation', 'equipe'],
    },
    {
      id: 'faq-startups-cap-table',
      question: 'Puis-je gérer une cap table sur OneFive ?',
      answer:
        "Oui, la section startup permet de centraliser les informations de cap table selon vos droits d'accès. Assurez-vous que seules les personnes autorisées y accèdent. Mettez à jour les données à chaque évolution significative.",
      category: 'startups',
      tags: ['cap-table', 'startups', 'droits', 'donnees'],
    },
    {
      id: 'faq-messagerie-envoyer',
      question: 'Comment envoyer un message privé à un membre ?',
      answer:
        "Ouvrez la messagerie, sélectionnez un contact puis rédigez votre message. Soyez précis sur l'objectif de la prise de contact pour obtenir une réponse rapide. Vous pouvez ensuite poursuivre l'échange dans le même fil.",
      category: 'messagerie',
      tags: ['messagerie', 'message', 'contact'],
    },
    {
      id: 'faq-messagerie-fichiers',
      question: 'Puis-je joindre des fichiers dans la messagerie ?',
      answer:
        "Oui, utilisez l'option de pièce jointe depuis la conversation. Vérifiez que le fichier est final et correctement nommé avant envoi. Si l'envoi échoue, réessayez avec une version plus légère.",
      category: 'messagerie',
      tags: ['fichiers', 'pieces-jointes', 'messagerie'],
    },
    {
      id: 'faq-notifications-types',
      question: 'Quels types de notifications puis-je recevoir ?',
      answer:
        "Vous pouvez recevoir des notifications liées aux invitations, messages, interactions et activités de contenu. Les types exacts dépendent de vos usages sur la plateforme. Consultez régulièrement votre centre de notifications pour rester à jour.",
      category: 'notifications',
      tags: ['notifications', 'invitations', 'messages', 'activite'],
    },
    {
      id: 'faq-notifications-parametres',
      question: 'Comment modifier mes préférences de notifications ?',
      answer:
        "Allez dans vos paramètres puis ouvrez la section notifications. Activez ou désactivez les catégories selon vos priorités. Conservez au minimum les alertes importantes pour ne pas manquer les actions clés.",
      category: 'notifications',
      tags: ['parametres', 'notifications', 'preferences'],
    },
    {
      id: 'faq-referral-code-trouver',
      question: 'Où trouver mon code de parrainage OneFive ?',
      answer:
        "Votre code est disponible dans l'espace parrainage de votre compte (page Inviter). Copiez le lien personnel associé pour le partager directement. Utilisez de préférence ce lien plutôt qu'un simple code texte.",
      category: 'référal',
      tags: ['referral', 'code', 'lien', 'partage'],
    },
    {
      id: 'faq-referral-founding-members',
      question: 'Comment fonctionnent les founding members via le parrainage ?',
      answer:
        "Le statut founding members est lié aux règles de campagne en cours et à vos actions de parrainage. Vérifiez les critères affichés dans votre espace referral pour connaître les paliers. Suivez votre progression depuis les indicateurs dédiés.",
      category: 'référal',
      tags: ['founding-members', 'parrainage', 'paliers', 'campagne'],
    },
    {
      id: 'faq-compte-securite',
      question: 'Comment sécuriser mon compte OneFive ?',
      answer:
        "Utilisez un mot de passe unique et robuste, puis vérifiez que votre email et votre numéro sont à jour. Évitez de partager vos codes de vérification. En cas d'activité suspecte, changez immédiatement votre mot de passe.",
      category: 'compte',
      tags: ['securite', 'mot-de-passe', 'verification', 'compte'],
    },
    {
      id: 'faq-compte-suppression',
      question: 'Puis-je supprimer mon compte OneFive ?',
      answer:
        "Oui, la suppression se fait depuis les paramètres du compte si l'option est disponible pour votre profil. Vérifiez les conséquences sur vos données et accès avant de confirmer. Si besoin, contactez le support pour un accompagnement.",
      category: 'compte',
      tags: ['suppression', 'compte', 'parametres', 'donnees'],
    },
  ],
  guides: [
    {
      id: 'guide-demarrage-rapide',
      title: "Démarrage rapide OneFive : de l'inscription au premier profil",
      description:
        "Créez votre compte, validez vos vérifications et publiez un profil prêt à être visible.",
      category: 'démarrage',
      duration: '8 min',
      difficulty: 'facile',
      tags: ['inscription', 'verification', 'profil', 'onboarding'],
      sections: [
        {
          title: 'Créer son compte',
          content: "Commencez par une inscription propre pour éviter les blocages de vérification.",
          steps: [
            "1. Ouvrez l'écran d'inscription et choisissez email/mot de passe ou OAuth.",
            '2. Renseignez des informations exactes, notamment votre email principal.',
            "3. Validez l'inscription puis connectez-vous pour passer à la vérification.",
          ],
        },
        {
          title: 'Valider ses vérifications',
          content: "La validation email et, selon les cas, SMS améliore l'accès et la confiance.",
          steps: [
            "1. Ouvrez l'email de vérification et cliquez sur le lien d'activation.",
            '2. Saisissez le code SMS si demandé dans le parcours.',
            "3. En cas de non-réception, utilisez renvoyer puis vérifiez spam et numéro.",
          ],
        },
        {
          title: 'Finaliser un profil minimum utile',
          content: "Un profil clair augmente la qualité des recommandations et des connexions.",
          steps: [
            '1. Ajoutez un titre professionnel explicite et une bio concise.',
            '2. Renseignez vos expériences principales et vos objectifs actuels.',
            '3. Ajoutez une photo de profil pour renforcer la crédibilité.',
          ],
        },
      ],
    },
    {
      id: 'guide-profil-10-min',
      title: 'Créer et optimiser son profil en 10 minutes',
      description: 'Structurez un profil attractif qui facilite les prises de contact pertinentes.',
      category: 'profil',
      duration: '10 min',
      difficulty: 'facile',
      tags: ['profil', 'bio', 'experience', 'education'],
      sections: [
        {
          title: 'Structurer les informations clés',
          content: "Posez une base propre avec vos éléments professionnels essentiels.",
          steps: [
            '1. Renseignez votre rôle actuel, secteur et localisation.',
            '2. Ajoutez une bio orientée valeur en restant sous 2000 caractères.',
            '3. Vérifiez la cohérence globale avant enregistrement.',
          ],
        },
        {
          title: 'Ajouter expériences et éducations',
          content: "Priorisez la clarté et l'impact en respectant les limites de la plateforme.",
          steps: [
            '1. Ajoutez vos expériences les plus récentes et les plus pertinentes.',
            '2. Ajoutez vos éducations utiles à votre positionnement actuel.',
            '3. Restez dans la limite de 10 expériences et 10 éducations.',
          ],
        },
        {
          title: 'Optimiser visibilité et confiance',
          content: "Améliorez votre profil pour convertir les visites en connexions.",
          steps: [
            '1. Ajoutez un avatar professionnel net et une couverture cohérente.',
            '2. Mettez en avant un résultat concret dans votre présentation.',
            '3. Relisez le profil comme si vous étiez un recruteur ou un investisseur.',
          ],
        },
      ],
    },
    {
      id: 'guide-parrainage',
      title: 'Utiliser le parrainage efficacement',
      description:
        "Apprenez à partager votre lien de parrainage et à suivre votre progression dans les paliers.",
      category: 'compte',
      duration: '5 min',
      difficulty: 'facile',
      tags: ['parrainage', 'ref', 'invitation'],
      sections: [
        {
          title: 'Récupérer son lien de parrainage',
          content: "Votre lien personnel est le moyen le plus fiable de tracer vos parrainages.",
          steps: [
            '1. Ouvrez la page Inviter depuis le menu de votre compte.',
            '2. Copiez votre lien contenant le paramètre ref.',
            '3. Vérifiez que votre profil de base est bien complété.',
          ],
        },
        {
          title: 'Partager et suivre sa progression',
          content: "Chaque parrainage accepté vous fait progresser dans les paliers.",
          steps: [
            '1. Partagez votre lien à des contacts réellement intéressés par OneFive.',
            '2. Suivez le nombre de parrainages acceptés dans la page Inviter.',
            '3. Débloquez les paliers (Bronze, Silver, Gold…) au fil des invitations.',
          ],
        },
      ],
    },
    {
      id: 'guide-construire-reseau',
      title: 'Construire son réseau sur OneFive',
      description:
        "Développez un réseau qualifié en envoyant les bonnes invitations et en suivant vos interactions.",
      category: 'réseau',
      duration: '12 min',
      difficulty: 'moyen',
      tags: ['reseau', 'connexions', 'followers', 'invitations'],
      sections: [
        {
          title: 'Identifier les bons profils',
          content: "Concentrez vos efforts sur les personnes utiles à vos objectifs actuels.",
          steps: [
            '1. Définissez 2 à 3 objectifs réseau clairs.',
            '2. Parcourez les suggestions et shortlist 15 profils pertinents.',
            '3. Priorisez ceux avec intérêts ou contextes proches du vôtre.',
          ],
        },
        {
          title: 'Envoyer des invitations efficaces',
          content: "Un message court et contextualisé améliore les taux d'acceptation.",
          steps: [
            '1. Envoyez des invitations personnalisées avec une intention explicite.',
            '2. Évitez les messages génériques ou trop longs.',
            '3. Relancez une seule fois si nécessaire après quelques jours.',
          ],
        },
        {
          title: 'Gérer connexions et followers',
          content: "Un suivi léger mais régulier maintient la qualité de votre réseau.",
          steps: [
            '1. Vérifiez vos nouvelles connexions chaque semaine.',
            '2. Interagissez sur les posts pertinents pour rester visible.',
            '3. Réorganisez vos priorités réseau chaque mois.',
          ],
        },
      ],
    },
    {
      id: 'guide-dataroom-premiere',
      title: 'Créer sa première dataroom',
      description: 'Mettez en place une dataroom claire, partageable et prête pour vos échanges.',
      category: 'dataroom',
      duration: '15 min',
      difficulty: 'moyen',
      tags: ['dataroom', 'documents', 'partage', 'structure', 'startup'],
      sections: [
        {
          title: 'Prérequis : être lié à une startup',
          content:
            "Une dataroom est toujours associée à une startup. Vous devez soit créer une startup, soit avoir été invité dans une startup existante. Sans ce lien, vous ne pourrez pas créer de dataroom.",
          steps: [
            '1. Créez votre startup depuis la section dédiée, ou acceptez une invitation à rejoindre une startup.',
            '2. Vérifiez que vous avez les droits nécessaires sur cette startup.',
            "3. Une fois lié à une startup, vous pourrez créer sa dataroom depuis la page de la startup ou la liste des datarooms.",
          ],
        },
        {
          title: 'Initialiser la dataroom',
          content: "Commencez par une base simple et compréhensible par tous.",
          steps: [
            '1. Créez la dataroom avec un nom explicite et un objectif clair.',
            '2. Organisez les dossiers par thème ou étape de discussion.',
            '3. Chargez les documents prioritaires en premier.',
          ],
        },
        {
          title: 'Préparer un partage propre',
          content: "Un partage maîtrisé réduit les erreurs d'accès et les incompréhensions.",
          steps: [
            '1. Vérifiez les noms de fichiers et leur version finale.',
            "2. Ajoutez un document d'introduction pour orienter la lecture.",
            "3. Contrôlez les droits avant d'envoyer la première invitation.",
          ],
        },
      ],
    },
    {
      id: 'guide-dataroom-permissions-analytics',
      title: 'Gérer permissions et analytics de dataroom',
      description: "Sécurisez l'accès aux documents et exploitez les signaux de consultation.",
      category: 'dataroom',
      duration: '18 min',
      difficulty: 'moyen',
      tags: ['permissions', 'groupes', 'analytics', 'invitations'],
      sections: [
        {
          title: 'Attribuer les permissions',
          content: "Donnez le minimum de droits nécessaire selon le profil du membre.",
          steps: [
            "1. Créez des groupes d'accès selon les rôles concernés.",
            '2. Affectez des droits lecture ou édition de manière stricte.',
            "3. Testez l'accès avec un utilisateur invité avant diffusion large.",
          ],
        },
        {
          title: 'Inviter et suivre les membres',
          content: "Un onboarding clair améliore la qualité des consultations.",
          steps: [
            '1. Envoyez des invitations avec un message de contexte court.',
            "2. Vérifiez rapidement qui a accepté l'accès.",
            "3. Relancez les personnes clés qui n'ont pas encore consulté.",
          ],
        },
        {
          title: 'Analyser la consultation',
          content: "Les analytics aident à prioriser les suites commerciales ou investisseurs.",
          steps: [
            '1. Identifiez les documents les plus consultés.',
            '2. Repérez les comptes très actifs ou inactifs.',
            '3. Ajustez vos prochains envois selon ces signaux.',
          ],
        },
      ],
    },
    {
      id: 'guide-contenu-posts-discussions',
      title: 'Publier son premier post et participer aux discussions',
      description:
        "Créez du contenu utile et engagez la communauté avec des interactions pertinentes.",
      category: 'contenu',
      duration: '9 min',
      difficulty: 'facile',
      tags: ['posts', 'discussions', 'q&a', 'engagement'],
      sections: [
        {
          title: 'Publier un post utile',
          content: 'Un bon post est court, concret et orienté valeur.',
          steps: [
            '1. Choisissez un sujet lié à votre actualité professionnelle.',
            '2. Rédigez un message en 3 parties: contexte, action, question.',
            '3. Publiez puis répondez rapidement aux premiers commentaires.',
          ],
        },
        {
          title: 'Participer aux discussions Q&A',
          content: 'Des réponses précises renforcent votre crédibilité.',
          steps: [
            '1. Sélectionnez 2 discussions alignées avec votre expertise.',
            '2. Apportez une réponse structurée avec un exemple réel.',
            '3. Utilisez les votes pour valoriser les contributions utiles.',
          ],
        },
        {
          title: 'Utiliser bookmarks et feed',
          content: "Créez votre veille en sauvegardant les contenus importants.",
          steps: [
            '1. Enregistrez les posts à forte valeur via bookmark.',
            '2. Revenez sur vos enregistrements chaque semaine.',
            '3. Partagez ou commentez les contenus les plus pertinents.',
          ],
        },
      ],
    },
    {
      id: 'guide-securite-parametres-compte',
      title: 'Configurer la sécurité et les paramètres du compte',
      description:
        "Renforcez la sécurité de votre compte et adaptez les notifications à vos priorités.",
      category: 'compte',
      duration: '16 min',
      difficulty: 'avancé',
      tags: ['compte', 'securite', 'notifications', 'parametres'],
      sections: [
        {
          title: 'Renforcer la sécurité',
          content: "Réduisez les risques d'accès non autorisé avec des réglages simples.",
          steps: [
            '1. Changez votre mot de passe pour une version unique et robuste.',
            '2. Vérifiez que votre email et numéro sont bien à jour.',
            "3. Déconnectez les sessions non reconnues si l'option est disponible.",
          ],
        },
        {
          title: 'Ajuster les notifications',
          content: "Conservez les alertes importantes sans surcharge d'information.",
          steps: [
            '1. Ouvrez les préférences de notifications dans les paramètres.',
            '2. Activez en priorité messages, invitations et actions critiques.',
            '3. Désactivez les alertes secondaires qui interrompent votre focus.',
          ],
        },
        {
          title: 'Préparer la gestion du compte',
          content: "Anticipez les besoins de maintenance et de confidentialité.",
          steps: [
            '1. Relisez les options de confidentialité disponibles.',
            '2. Vérifiez les données visibles sur votre profil public.',
            '3. Notez la procédure de suppression de compte en cas de besoin.',
          ],
        },
      ],
    },
  ],
};
