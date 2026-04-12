type Notification = {
  id: string;
  content: {
    fr: string;
    en: string;
  };
};

const notifications: Notification[] = [
  {
    id: "notification_1",
    content: {
      en: "🚀 <b>Elon Musk</b> reposted your post.",
      fr: "🚀 <b>Elon Musk</b> a repartagé votre publication.",
    },
  },
  {
    id: "notification_2",
    content: {
      en: "👍 Your post received <b>3 likes</b>.",
      fr: "👍 Votre publication a reçu <b>3 j'aime</b>.",
    },
  },
  {
    id: "notification_3",
    content: {
      en: "🙌 <b>Mark Zuckerberg</b> thanked you for your contribution.",
      fr: "🙌 <b>Mark Zuckerberg</b> vous a remercié pour votre contribution.",
    },
  },
  {
    id: "notification_4",
    content: {
      en: "🤝 You have a new <b>collaboration proposal</b>.",
      fr: "🤝 Vous avez une nouvelle <b>proposition de collaboration</b>.",
    },
  },
  {
    id: "notification_5",
    content: {
      en: "🎉 <b>Steve Jobs</b> joined your project team.",
      fr: "🎉 <b>Steve Jobs</b> a rejoint votre équipe projet.",
    },
  },
  {
    id: "notification_6",
    content: {
      en: "💬 <b>Jeff Bezos</b> sent you a message.",
      fr: "💬 <b>Jeff Bezos</b> vous a envoyé un message.",
    },
  },
  {
    id: "notification_7",
    content: {
      en: "🔔 <b>Bill Gates</b> mentioned you in a comment.",
      fr: "🔔 <b>Bill Gates</b> vous a mentionné dans un commentaire.",
    },
  },
  {
    id: "notification_8",
    content: {
      en: "✨ <b>Sara Blakely</b> followed you.",
      fr: "✨ <b>Sara Blakely</b> vous suit désormais.",
    },
  },
  {
    id: "notification_9",
    content: {
      en: "📢 <b>Richard Branson</b> shared your startup story.",
      fr: "📢 <b>Richard Branson</b> a partagé l'histoire de votre startup.",
    },
  },
  {
    id: "notification_10",
    content: {
      en: '💡 <b>Larry Page</b> commented: "Great idea!"',
      fr: '💡 <b>Larry Page</b> a commenté : "Super idée !"',
    },
  },
  {
    id: "notification_11",
    content: {
      en: "👏 <b>Sam Altman</b> applauded your pitch.",
      fr: "👏 <b>Sam Altman</b> a applaudi votre pitch.",
    },
  },
  {
    id: "notification_12",
    content: {
      en: "🔥 Your post is <b>trending</b> in <b>#StartupLife</b>!",
      fr: "🔥 Votre publication est <b>tendance</b> dans <b>#StartupLife</b> !",
    },
  },
  {
    id: "notification_13",
    content: {
      en: "💼 <b>Whitney Wolfe Herd</b> invited you to join her <b>startup board</b>.",
      fr: "💼 <b>Whitney Wolfe Herd</b> vous a invité à rejoindre son <b>conseil d'administration</b>.",
    },
  },
  {
    id: "notification_14",
    content: {
      en: "✍️ <b>Reed Hastings</b> replied to your discussion post.",
      fr: "✍️ <b>Reed Hastings</b> a répondu à votre discussion.",
    },
  },
  {
    id: "notification_15",
    content: {
      en: "🌟 <b>Brian Chesky</b> liked your project update.",
      fr: "🌟 <b>Brian Chesky</b> a aimé la mise à jour de votre projet.",
    },
  },
  {
    id: "notification_16",
    content: {
      en: '📨 You received an invite to the "<b>Tech Innovators</b>" group.',
      fr: '📨 Vous avez reçu une invitation au groupe "<b>Tech Innovators</b>".',
    },
  },
  {
    id: "notification_17",
    content: {
      en: "📈 Your <b>startup page</b> gained <b>10 new followers</b>!",
      fr: "📈 La page de votre <b>startup</b> a gagné <b>10 nouveaux abonnés</b> !",
    },
  },
  {
    id: "notification_18",
    content: {
      en: '📅 <b>Jack Dorsey</b> invited you to an event: "<b>Pitch Night 2024</b>".',
      fr: '📅 <b>Jack Dorsey</b> vous a invité à un événement : "<b>Soirée Pitch 2024</b>".',
    },
  },
  {
    id: "notification_19",
    content: {
      en: "🏆 <b>Anne Wojcicki</b> voted for your project in the competition.",
      fr: "🏆 <b>Anne Wojcicki</b> a voté pour votre projet dans la compétition.",
    },
  },
  {
    id: "notification_20",
    content: {
      en: "💎 <b>Marc Andreessen</b> endorsed your skills in <b>fundraising</b>.",
      fr: "💎 <b>Marc Andreessen</b> a recommandé vos compétences en <b>levée de fonds</b>.",
    },
  },
  {
    id: "notification_21",
    content: {
      en: "🤩 <b>Sergey Brin</b> shared your success story!",
      fr: "🤩 <b>Sergey Brin</b> a partagé votre histoire de réussite !",
    },
  },
  {
    id: "notification_22",
    content: {
      en: "🔗 <b>Jack Ma</b> tagged you in a resource post.",
      fr: "🔗 <b>Jack Ma</b> vous a mentionné dans une publication de ressources.",
    },
  },
  {
    id: "notification_23",
    content: {
      en: "🌍 You connected with an entrepreneur from <b>Japan</b>!",
      fr: "🌍 Vous vous êtes connecté avec un entrepreneur du <b>Japon</b> !",
    },
  },
  {
    id: "notification_24",
    content: {
      en: '🎓 <b>Peter Thiel</b> commented: "I learned so much from your post!"',
      fr: '🎓 <b>Peter Thiel</b> a commenté : "J\'ai beaucoup appris de votre publication !"',
    },
  },
  {
    id: "notification_25",
    content: {
      en: "📥 You received a <b>partnership request</b> from <b>Innovative Labs</b>.",
      fr: "📥 Vous avez reçu une <b>demande de partenariat</b> de <b>Innovative Labs</b>.",
    },
  },
  {
    id: "notification_26",
    content: {
      en: "📝 <b>Melanie Perkins</b> replied to your blog post.",
      fr: "📝 <b>Melanie Perkins</b> a répondu à votre article de blog.",
    },
  },
  {
    id: "notification_27",
    content: {
      en: '✨ <b>Daniel Ek</b> reacted: "This is inspiring!"',
      fr: '✨ <b>Daniel Ek</b> a réagi : "C\'est inspirant !"',
    },
  },
  {
    id: "notification_28",
    content: {
      en: "🌐 <b>Reid Hoffman</b> invited you to collaborate on his <b>global project</b>.",
      fr: "🌐 <b>Reid Hoffman</b> vous a invité à collaborer sur son <b>projet mondial</b>.",
    },
  },
  {
    id: "notification_29",
    content: {
      en: "💡 <b>Drew Houston</b> shared a resource on your discussion thread.",
      fr: "💡 <b>Drew Houston</b> a partagé une ressource sur votre fil de discussion.",
    },
  },
  {
    id: "notification_30",
    content: {
      en: "💌 You received a thank-you message from <b>Evan Spiegel</b>.",
      fr: "💌 Vous avez reçu un message de remerciement de <b>Evan Spiegel</b>.",
    },
  },
  {
    id: "notification_31",
    content: {
      en: "🥳 Your team reached <b>100 members</b>!",
      fr: "🥳 Votre équipe a atteint <b>100 membres</b> !",
    },
  },
  {
    id: "notification_32",
    content: {
      en: "🔄 <b>Kevin Systrom</b> reposted your milestone update.",
      fr: "🔄 <b>Kevin Systrom</b> a repartagé la mise à jour de votre étape clé.",
    },
  },
  {
    id: "notification_33",
    content: {
      en: "📣 <b>Stewart Butterfield</b> announced your project on his feed.",
      fr: "📣 <b>Stewart Butterfield</b> a annoncé votre projet sur son fil d'actualité.",
    },
  },
  {
    id: "notification_34",
    content: {
      en: "🎯 <b>Patrick Collison</b> congratulated you on reaching your <b>funding goal</b>.",
      fr: "🎯 <b>Patrick Collison</b> vous a félicité pour avoir atteint votre <b>objectif de financement</b>.",
    },
  },
  {
    id: "notification_35",
    content: {
      en: "🚀 Your idea gained <b>15 upvotes</b> in the community forum!",
      fr: "🚀 Votre idée a gagné <b>15 votes positifs</b> dans le forum communautaire !",
    },
  },
  {
    id: "notification_36",
    content: {
      en: "📊 <b>Tobias Lütke</b> reviewed your <b>startup pitch deck</b>.",
      fr: "📊 <b>Tobias Lütke</b> a examiné votre <b>présentation startup</b>.",
    },
  },
  {
    id: "notification_37",
    content: {
      en: "🌟 <b>Ben Silbermann</b> added you as a <b>co-founder</b> on his project page.",
      fr: "🌟 <b>Ben Silbermann</b> vous a ajouté comme <b>co-fondateur</b> sur sa page de projet.",
    },
  },
  {
    id: "notification_38",
    content: {
      en: "📞 <b>Eric Yuan</b> invited you to a <b>virtual coffee chat</b>.",
      fr: "📞 <b>Eric Yuan</b> vous a invité à un <b>café virtuel</b>.",
    },
  },
  {
    id: "notification_39",
    content: {
      en: "💸 You received a <b>funding inquiry</b> from <b>Sequoia Capital</b>.",
      fr: "💸 Vous avez reçu une <b>demande de financement</b> de <b>Sequoia Capital</b>.",
    },
  },
  {
    id: "notification_40",
    content: {
      en: "🎥 <b>Naval Ravikant</b> tagged you in a video about your industry.",
      fr: "🎥 <b>Naval Ravikant</b> vous a mentionné dans une vidéo sur votre secteur.",
    },
  },
  {
    id: "notification_41",
    content: {
      en: "📩 A <b>mentor</b> responded to your startup question.",
      fr: "📩 Un <b>mentor</b> a répondu à votre question sur les startups.",
    },
  },
  {
    id: "notification_42",
    content: {
      en: "🛠️ <b>Paul Graham</b> recommended tools for your project.",
      fr: "🛠️ <b>Paul Graham</b> a recommandé des outils pour votre projet.",
    },
  },
  {
    id: "notification_43",
    content: {
      en: "📢 Your event was shared by <b>10 members</b>!",
      fr: "📢 Votre événement a été partagé par <b>10 membres</b> !",
    },
  },
  {
    id: "notification_44",
    content: {
      en: '💡 <b>Jessica Livingston</b> commented: "Can\'t wait to see this in action!"',
      fr: '💡 <b>Jessica Livingston</b> a commenté : "J\'ai hâte de voir ça en action !"',
    },
  },
  {
    id: "notification_45",
    content: {
      en: "🗓️ You were invited to a <b>private investor meeting</b>.",
      fr: "🗓️ Vous avez été invité à une <b>réunion privée d'investisseurs</b>.",
    },
  },
  {
    id: "notification_46",
    content: {
      en: "🤝 You matched with <b>Marc Benioff</b> for a networking session.",
      fr: "🤝 Vous avez été mis en relation avec <b>Marc Benioff</b> pour une session de networking.",
    },
  },
  {
    id: "notification_47",
    content: {
      en: '🏅 Your startup ranked <b>#1</b> in the "<b>Emerging Tech</b>" category.',
      fr: '🏅 Votre startup est classée <b>#1</b> dans la catégorie "<b>Technologies Émergentes</b>".',
    },
  },
  {
    id: "notification_48",
    content: {
      en: "📚 <b>Guy Kawasaki</b> recommended a book for your startup journey.",
      fr: "📚 <b>Guy Kawasaki</b> a recommandé un livre pour votre parcours entrepreneurial.",
    },
  },
  {
    id: "notification_49",
    content: {
      en: '💭 <b>Tony Hsieh</b> replied to your poll with "Great insights!"',
      fr: '💭 <b>Tony Hsieh</b> a répondu à votre sondage avec "Excellentes idées !"',
    },
  },
  {
    id: "notification_50",
    content: {
      en: "🎈 Your <b>Onefive profile</b> was viewed by <b>20 new users</b> today!",
      fr: "🎈 Votre <b>profil Onefive</b> a été consulté par <b>20 nouveaux utilisateurs</b> aujourd'hui !",
    },
  },
  {
    id: "notification_51",
    content: {
      en: "💬 <b>Katrina Lake</b> started a discussion in your group.",
      fr: "💬 <b>Katrina Lake</b> a démarré une discussion dans votre groupe.",
    },
  },
  {
    id: "notification_52",
    content: {
      en: "👍 <b>Travis Kalanick</b> liked your comment on <b>#Entrepreneurship</b>.",
      fr: "👍 <b>Travis Kalanick</b> a aimé votre commentaire sur <b>#Entrepreneuriat</b>.",
    },
  },
  {
    id: "notification_53",
    content: {
      en: "🤩 <b>Brian Armstrong</b> shared your funding story on his feed.",
      fr: "🤩 <b>Brian Armstrong</b> a partagé l'histoire de votre financement sur son fil d'actualité.",
    },
  },
  {
    id: "notification_54",
    content: {
      en: '🚀 Your pitch was added to "<b>Top 10 Startups to Watch</b>".',
      fr: '🚀 Votre pitch a été ajouté aux "<b>10 meilleures startups à suivre</b>".',
    },
  },
  {
    id: "notification_55",
    content: {
      en: "🎯 You received a <b>direct message</b> from a potential investor.",
      fr: "🎯 Vous avez reçu un <b>message direct</b> d'un investisseur potentiel.",
    },
  },
  {
    id: "notification_56",
    content: {
      en: "🏅 <b>Chamath Palihapitiya</b> recommended you as a <b>keynote speaker</b>.",
      fr: "🏅 <b>Chamath Palihapitiya</b> vous a recommandé comme <b>conférencier principal</b>.",
    },
  },
  {
    id: "notification_57",
    content: {
      en: "🌟 <b>Kevin Rose</b> followed your <b>startup page</b>.",
      fr: "🌟 <b>Kevin Rose</b> suit désormais la page de votre <b>startup</b>.",
    },
  },
  {
    id: "notification_58",
    content: {
      en: "🛠️ Your question about <b>tech stacks</b> got <b>8 answers</b>.",
      fr: "🛠️ Votre question sur les <b>stacks technologiques</b> a reçu <b>8 réponses</b>.",
    },
  },
  {
    id: "notification_59",
    content: {
      en: "🎉 <b>Aaron Levie</b> congratulated you on your latest milestone.",
      fr: "🎉 <b>Aaron Levie</b> vous a félicité pour votre dernière étape franchie.",
    },
  },
  {
    id: "notification_60",
    content: {
      en: "🔗 <b>Max Levchin</b> tagged you in a helpful resource.",
      fr: "🔗 <b>Max Levchin</b> vous a mentionné dans une ressource utile.",
    },
  },
  {
    id: "notification_61",
    content: {
      en: "📈 Your <b>startup dashboard</b> gained <b>50 new views</b> today.",
      fr: "📈 Le <b>tableau de bord</b> de votre startup a gagné <b>50 nouvelles vues</b> aujourd'hui.",
    },
  },
  {
    id: "notification_62",
    content: {
      en: '🏆 <b>John Doerr</b> awarded your team the "<b>Innovator Badge</b>".',
      fr: '🏆 <b>John Doerr</b> a décerné à votre équipe le "<b>Badge Innovateur</b>".',
    },
  },
  {
    id: "notification_63",
    content: {
      en: "✨ <b>Gary Vaynerchuk</b> endorsed your skills in <b>business strategy</b>.",
      fr: "✨ <b>Gary Vaynerchuk</b> a recommandé vos compétences en <b>stratégie commerciale</b>.",
    },
  },
  {
    id: "notification_64",
    content: {
      en: "💼 You received a <b>connection request</b> from <b>Tim Ferriss</b>.",
      fr: "💼 Vous avez reçu une <b>demande de connexion</b> de <b>Tim Ferriss</b>.",
    },
  },
  {
    id: "notification_65",
    content: {
      en: '📨 <b>David Marcus</b> invited you to join "<b>Innovators United</b>".',
      fr: '📨 <b>David Marcus</b> vous a invité à rejoindre "<b>Innovateurs Unis</b>".',
    },
  },
  {
    id: "notification_66",
    content: {
      en: "🔥 Your post is <b>trending</b> in <b>#FutureTech</b>!",
      fr: "🔥 Votre publication est <b>tendance</b> dans <b>#TechnologieFuture</b> !",
    },
  },
  {
    id: "notification_67",
    content: {
      en: '💡 <b>Kevin Lin</b> commented: "This is exactly what I needed!"',
      fr: "💡 <b>Kevin Lin</b> a commenté : \"C'est exactement ce dont j'avais besoin !\"",
    },
  },
  {
    id: "notification_68",
    content: {
      en: '📅 You were added to the panel for "<b>Startup Stories 2024</b>".',
      fr: '📅 Vous avez été ajouté au panel pour "<b>Histoires de Startups 2024</b>".',
    },
  },
  {
    id: "notification_69",
    content: {
      en: "📢 Your latest project was featured in the <b>Spotlight section</b>.",
      fr: "📢 Votre dernier projet a été mis en avant dans la <b>section Spotlight</b>.",
    },
  },
  {
    id: "notification_70",
    content: {
      en: "🌍 You connected with a <b>mentor</b> based in <b>Berlin</b>!",
      fr: "🌍 Vous vous êtes connecté avec un <b>mentor</b> basé à <b>Berlin</b> !",
    },
  },
  {
    id: "notification_71",
    content: {
      en: "🎥 <b>Justin Kan</b> invited you to a <b>live webinar</b>.",
      fr: "🎥 <b>Justin Kan</b> vous a invité à un <b>webinaire en direct</b>.",
    },
  },
  {
    id: "notification_72",
    content: {
      en: "📩 You received a <b>collaboration request</b> from <b>Y Combinator</b>.",
      fr: "📩 Vous avez reçu une <b>demande de collaboration</b> de <b>Y Combinator</b>.",
    },
  },
  {
    id: "notification_73",
    content: {
      en: "🙌 <b>Andrew Chen</b> cheered for your new launch.",
      fr: "🙌 <b>Andrew Chen</b> a applaudi votre nouveau lancement.",
    },
  },
  {
    id: "notification_74",
    content: {
      en: "💸 Your <b>funding goal</b> just hit <b>25%</b>!",
      fr: "💸 Votre <b>objectif de financement</b> vient d'atteindre <b>25%</b> !",
    },
  },
  {
    id: "notification_75",
    content: {
      en: "📝 <b>Michael Seibel</b> left a review on your <b>startup page</b>.",
      fr: "📝 <b>Michael Seibel</b> a laissé un avis sur la page de votre <b>startup</b>.",
    },
  },
  {
    id: "notification_76",
    content: {
      en: "🌟 <b>Alexis Ohanian</b> shared your blog post with his followers.",
      fr: "🌟 <b>Alexis Ohanian</b> a partagé votre article de blog avec ses abonnés.",
    },
  },
  {
    id: "notification_77",
    content: {
      en: "🤝 You joined a new <b>mastermind group</b> for tech founders.",
      fr: "🤝 Vous avez rejoint un nouveau <b>groupe mastermind</b> pour fondateurs tech.",
    },
  },
  {
    id: "notification_78",
    content: {
      en: "📖 <b>Jason Fried</b> sent you a guide on <b>scaling startups</b>.",
      fr: "📖 <b>Jason Fried</b> vous a envoyé un guide sur <b>le scaling des startups</b>.",
    },
  },
  {
    id: "notification_79",
    content: {
      en: "🚀 Your startup gained <b>10 new followers</b> overnight!",
      fr: "🚀 Votre startup a gagné <b>10 nouveaux abonnés</b> pendant la nuit !",
    },
  },
  {
    id: "notification_80",
    content: {
      en: '🎉 <b>David Heinemeier Hansson</b> reacted: "Amazing progress!"',
      fr: '🎉 <b>David Heinemeier Hansson</b> a réagi : "Progrès incroyables !"',
    },
  },
  {
    id: "notification_81",
    content: {
      en: "🛠️ Your <b>tool recommendation</b> was upvoted by <b>12 members</b>.",
      fr: "🛠️ Votre <b>recommandation d'outil</b> a été votée par <b>12 membres</b>.",
    },
  },
  {
    id: "notification_82",
    content: {
      en: "📊 <b>Fred Wilson</b> shared feedback on your <b>pitch deck</b>.",
      fr: "📊 <b>Fred Wilson</b> a partagé ses commentaires sur votre <b>pitch deck</b>.",
    },
  },
  {
    id: "notification_83",
    content: {
      en: "🌟 <b>Chris Dixon</b> suggested your project to a <b>VC firm</b>.",
      fr: "🌟 <b>Chris Dixon</b> a suggéré votre projet à une <b>société de capital-risque</b>.",
    },
  },
  {
    id: "notification_84",
    content: {
      en: "📣 Your <b>testimonial</b> was featured in the community newsletter.",
      fr: "📣 Votre <b>témoignage</b> a été présenté dans la newsletter communautaire.",
    },
  },
  {
    id: "notification_85",
    content: {
      en: "🔄 <b>Sam Altman</b> reposted your resource on <b>team management</b>.",
      fr: "🔄 <b>Sam Altman</b> a repartagé votre ressource sur la <b>gestion d'équipe</b>.",
    },
  },
  {
    id: "notification_86",
    content: {
      en: "🛡️ You were <b>verified</b> as a <b>Onefive Certified Startup</b>.",
      fr: "🛡️ Vous avez été <b>vérifié</b> en tant que <b>Startup Certifiée Onefive</b>.",
    },
  },
  {
    id: "notification_87",
    content: {
      en: "🧑‍🏫 <b>Paul Buchheit</b> offered to mentor you for your upcoming pitch.",
      fr: "🧑‍🏫 <b>Paul Buchheit</b> a proposé de vous mentorer pour votre prochain pitch.",
    },
  },
  {
    id: "notification_88",
    content: {
      en: "📈 Your <b>event registration</b> reached <b>100 attendees</b>!",
      fr: "📈 Les inscriptions à votre <b>événement</b> ont atteint <b>100 participants</b> !",
    },
  },
  {
    id: "notification_89",
    content: {
      en: "✍️ <b>David Sacks</b> invited you to co-author a <b>startup guide</b>.",
      fr: "✍️ <b>David Sacks</b> vous a invité à co-écrire un <b>guide pour startups</b>.",
    },
  },
  {
    id: "notification_90",
    content: {
      en: "🛠️ Your request for <b>feedback</b> got responses from <b>3 experts</b>.",
      fr: "🛠️ Votre demande de <b>feedback</b> a reçu des réponses de <b>3 experts</b>.",
    },
  },
  {
    id: "notification_91",
    content: {
      en: '💬 <b>Keith Rabois</b> started a poll: "<b>Best fundraising tips?</b>"',
      fr: '💬 <b>Keith Rabois</b> a lancé un sondage : "<b>Meilleurs conseils pour lever des fonds ?</b>"',
    },
  },
  {
    id: "notification_92",
    content: {
      en: "📩 You were tagged in a <b>success story</b> by <b>Robert Herjavec</b>.",
      fr: "📩 Vous avez été mentionné dans une <b>histoire de réussite</b> par <b>Robert Herjavec</b>.",
    },
  },
  {
    id: "notification_93",
    content: {
      en: "🎥 <b>Mark Cuban</b> invited you to a <b>panel on startup trends</b>.",
      fr: "🎥 <b>Mark Cuban</b> vous a invité à un <b>panel sur les tendances des startups</b>.",
    },
  },
  {
    id: "notification_94",
    content: {
      en: "🥳 Your team reached <b>200 members</b> this week!",
      fr: "🥳 Votre équipe a atteint <b>200 membres</b> cette semaine !",
    },
  },
  {
    id: "notification_95",
    content: {
      en: "💌 You received a heartfelt thank-you message from <b>Daymond John</b>.",
      fr: "💌 Vous avez reçu un message de remerciement sincère de <b>Daymond John</b>.",
    },
  },
  {
    id: "notification_96",
    content: {
      en: "🌐 <b>Kevin O'Leary</b> matched with you for a <b>virtual coffee session</b>.",
      fr: "🌐 <b>Kevin O'Leary</b> a été mis en relation avec vous pour une <b>session de café virtuel</b>.",
    },
  },
  {
    id: "notification_97",
    content: {
      en: "🔔 <b>Barbara Corcoran</b> mentioned your <b>startup</b> in her latest post.",
      fr: "🔔 <b>Barbara Corcoran</b> a mentionné votre <b>startup</b> dans sa dernière publication.",
    },
  },
  {
    id: "notification_98",
    content: {
      en: "🎓 You unlocked a new <b>resource</b> in <b>Onefive Academy</b>.",
      fr: "🎓 Vous avez débloqué une nouvelle <b>ressource</b> dans <b>Onefive Academy</b>.",
    },
  },
  {
    id: "notification_99",
    content: {
      en: "🌟 Your project was featured on the <b>homepage</b> today!",
      fr: "🌟 Votre projet a été mis en avant sur la <b>page d'accueil</b> aujourd'hui !",
    },
  },
  {
    id: "notification_100",
    content: {
      en: '🤩 <b>Lori Greiner</b> reacted: "This is groundbreaking!"',
      fr: '🤩 <b>Lori Greiner</b> a réagi : "C\'est révolutionnaire !"',
    },
  },
];

export default notifications;
