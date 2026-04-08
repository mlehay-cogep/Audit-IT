// ============================================================
//  AUDIT_DATA — Référentiel de l'audit informatique
//  Fichier indépendant : modifiez-le sans toucher à index.html
//  Structure : chapitres > questions > options > paragraphes
//
//  "Non applicable" est présent sur chaque question.
//  Quand l'auditeur le sélectionne, un champ libre s'affiche
//  pour saisir la raison — le paragraphe stocké ici reste vide.
// ============================================================

const AUDIT_DATA = [

  // ──────────────────────────────────────────────────────────
  // 1. POLITIQUE DE SÉCURITÉ ET GOUVERNANCE
  // ──────────────────────────────────────────────────────────
  {
    id: 101, name: "Politique de sécurité et gouvernance",
    questions: [
      {
        id: 1001,
        text: "L'organisation dispose-t-elle d'une politique de sécurité des systèmes d'information (PSSI) formalisée et approuvée ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Une politique de sécurité des systèmes d'information (PSSI) est en place, formalisée et validée par la direction. Elle couvre les grands domaines de la sécurité (accès, données, réseaux, incidents) et est connue des équipes concernées. Ce document constitue le socle de la démarche de sécurité de l'organisation.",
          "Non": "Aucune politique de sécurité des systèmes d'information (PSSI) formalisée n'a été identifiée. L'absence de ce document de référence expose l'organisation à des incohérences dans les pratiques de sécurité, à des angles morts dans la protection des actifs, et à une difficulté accrue en cas d'audit réglementaire ou d'incident. La rédaction et l'approbation d'une PSSI par la direction est une action prioritaire.",
          "Partiel": "Des éléments de politique de sécurité existent (chartes, procédures isolées) mais ne constituent pas une PSSI complète et cohérente. Il manque une vision globale, une validation formelle par la direction, ou une diffusion suffisante auprès des collaborateurs. Une consolidation de ces éléments en un document de référence unique est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1002,
        text: "Un responsable de la sécurité des systèmes d'information (RSSI) ou équivalent est-il désigné ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un RSSI (ou équivalent) est clairement identifié, avec des missions et une autorité définies. Ce rôle garantit un pilotage cohérent de la sécurité, une veille sur les menaces et une interface privilégiée en cas d'incident ou d'audit.",
          "Non": "Aucun référent sécurité n'est formellement désigné. La sécurité informatique est traitée de manière fragmentée, souvent par défaut par les équipes techniques, sans vision stratégique ni responsabilité clairement établie. La désignation d'un RSSI ou d'un référent sécurité, même à temps partiel, est fortement recommandée.",
          "Partiel": "La fonction de référent sécurité existe de fait (portée par un responsable informatique ou un prestataire) mais n'est pas formalisée dans un organigramme ou une fiche de poste. Le périmètre, les missions et le niveau d'autorité de cette fonction méritent d'être précisés et documentés.",
          "Non applicable": ""
        }
      },
      {
        id: 1003,
        text: "La politique de sécurité est-elle révisée au moins une fois par an ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "La politique de sécurité fait l'objet d'une révision annuelle formalisée, permettant de l'adapter aux évolutions du contexte réglementaire, technologique et des menaces. Cette pratique démontre une maturité dans la démarche de gouvernance sécurité.",
          "Non": "La politique de sécurité n'est pas révisée régulièrement. Un document non mis à jour devient rapidement obsolète face à l'évolution des menaces, des technologies et des obligations réglementaires. Une révision annuelle minimum, avec validation par la direction, doit être planifiée.",
          "Partiel": "Des mises à jour ponctuelles ont lieu mais sans processus formalisé ni calendrier fixe. Il est recommandé d'instaurer un cycle de révision annuel avec un responsable désigné et une validation par la direction.",
          "Non applicable": ""
        }
      },
      {
        id: 1004,
        text: "Les collaborateurs sont-ils sensibilisés à la politique de sécurité et aux bonnes pratiques informatiques ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un programme de sensibilisation à la sécurité informatique est en place : formations régulières, communications internes, tests de phishing simulés ou e-learning. Les collaborateurs connaissent les règles essentielles et les réflexes à adopter en cas d'incident.",
          "Non": "Aucune action de sensibilisation à la sécurité informatique n'est menée auprès des collaborateurs. Or, l'erreur humaine est impliquée dans plus de 80 % des incidents de sécurité. Des actions de sensibilisation régulières (formations, guides de bonnes pratiques, simulations de phishing) sont indispensables pour réduire ce risque.",
          "Partiel": "Des actions de sensibilisation ont été réalisées ponctuellement mais ne s'inscrivent pas dans un programme structuré et récurrent. Il est recommandé de mettre en place un plan de sensibilisation annuel, adapté aux différents profils de collaborateurs.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 2. GESTION DES ACCÈS ET DES IDENTITÉS
  // ──────────────────────────────────────────────────────────
  {
    id: 102, name: "Gestion des accès et des identités",
    questions: [
      {
        id: 1010,
        text: "Les mots de passe respectent-ils une politique de robustesse définie (longueur, complexité) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Une politique de mots de passe robuste est en vigueur et appliquée techniquement : longueur minimale de 12 caractères, combinaison de majuscules, minuscules, chiffres et caractères spéciaux, et blocage des mots de passe trop simples ou déjà compromis. Cette mesure constitue un rempart efficace contre les attaques par force brute et les compromissions de comptes.",
          "Non": "Aucune politique de robustesse des mots de passe n'est définie ou appliquée. Des mots de passe simples ou identiques entre plusieurs services exposent l'organisation aux attaques par force brute, par dictionnaire et au credential stuffing. Il est recommandé d'imposer des règles de complexité via les outils techniques (Active Directory, etc.) et d'accompagner les utilisateurs avec un gestionnaire de mots de passe.",
          "Partiel": "Une politique de mots de passe existe mais n'est pas appliquée uniformément : certains systèmes ou comptes de service n'y sont pas soumis. Une harmonisation sur l'ensemble du périmètre est nécessaire.",
          "Non applicable": ""
        }
      },
      {
        id: 1011,
        text: "L'authentification multifacteur (MFA) est-elle mise en place sur les accès sensibles ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "L'authentification multifacteur (MFA) est déployée sur les accès sensibles : VPN, messagerie, outils d'administration, applications cloud. Cette mesure réduit drastiquement le risque de compromission de compte, même en cas de vol de mot de passe.",
          "Non": "Aucune authentification multifacteur n'est en place. Le mot de passe seul ne constitue plus une protection suffisante : en cas de vol ou de fuite, l'accès aux systèmes est immédiatement compromis. Le déploiement du MFA sur au moins les accès à distance, les boîtes mail et les outils d'administration est une priorité.",
          "Partiel": "Le MFA est déployé sur certains accès (ex : VPN ou messagerie) mais pas sur l'ensemble des périmètres sensibles. Il est recommandé d'étendre le MFA à tous les accès exposés à Internet et aux comptes à privilèges.",
          "Non applicable": ""
        }
      },
      {
        id: 1012,
        text: "Le principe du moindre privilège est-il appliqué (chaque utilisateur n'a accès qu'à ce dont il a besoin) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Le principe du moindre privilège est correctement mis en œuvre : les droits d'accès sont attribués en fonction du rôle de chaque utilisateur et limités au strict nécessaire. Cette approche réduit la surface d'attaque et limite l'impact d'une compromission de compte.",
          "Non": "Le principe du moindre privilège n'est pas respecté : de nombreux utilisateurs disposent de droits excessifs (accès administrateur, accès à des données sans rapport avec leur fonction). En cas de compromission d'un compte, l'attaquant bénéficie de ces droits étendus pour se propager latéralement. Une revue et une restriction des droits d'accès sont nécessaires.",
          "Partiel": "Le principe est partiellement appliqué : des profils de droits existent mais certains comptes (notamment des comptes de service ou des comptes historiques) disposent de privilèges excessifs. Un audit complet des droits et un nettoyage sont recommandés.",
          "Non applicable": ""
        }
      },
      {
        id: 1013,
        text: "Les comptes des collaborateurs quittant l'organisation sont-ils désactivés sans délai ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un processus de déprovisionnement est en place : lors du départ d'un collaborateur, ses accès sont désactivés le jour même ou dès la notification RH. Ce processus est formalisé et inclut tous les systèmes (AD, messagerie, applications métier, VPN).",
          "Non": "Les comptes des collaborateurs partants ne sont pas désactivés systématiquement et rapidement. Des comptes orphelins actifs représentent un risque majeur : ils peuvent être utilisés par d'anciens employés malveillants ou exploités par des attaquants. Un processus de déprovisionnement immédiat, déclenché par les RH, doit être mis en place.",
          "Partiel": "Des actions de désactivation sont réalisées mais avec des délais variables ou de manière incomplète (certains systèmes ou applications métier sont oubliés). Un processus exhaustif et systématique, couvrant tous les accès, est nécessaire.",
          "Non applicable": ""
        }
      },
      {
        id: 1014,
        text: "Une revue régulière des droits d'accès des utilisateurs est-elle réalisée ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Des revues périodiques des droits d'accès (au moins annuelles) sont réalisées et documentées. Elles permettent d'identifier les comptes dormants, les droits excessifs ou inappropriés, et d'ajuster les autorisations en fonction des évolutions de poste.",
          "Non": "Aucune revue des droits d'accès n'est réalisée. Les droits s'accumulent au fil du temps sans nettoyage, créant une dérive des privilèges qui multiplie les risques. Une revue au moins annuelle, validée par les responsables métier, doit être instaurée.",
          "Partiel": "Des revues ponctuelles ont lieu mais sans régularité ni formalisme suffisant. Il est recommandé de planifier des revues périodiques (annuelles a minima), avec un processus documenté et une validation managériale.",
          "Non applicable": ""
        }
      },
      {
        id: 1015,
        text: "Les comptes administrateurs sont-ils distincts des comptes utilisateurs courants ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les comptes à privilèges (administrateurs systèmes, bases de données, réseau) sont distincts des comptes utilisateurs courants. Les administrateurs utilisent leurs comptes personnels pour les tâches quotidiennes et des comptes dédiés uniquement pour les opérations d'administration, réduisant ainsi la surface d'exposition.",
          "Non": "Les comptes administrateurs ne sont pas séparés des comptes courants : certains utilisateurs naviguent sur Internet ou consultent leur messagerie avec des droits d'administration. En cas de compromission, l'attaquant obtient immédiatement des droits maximaux sur le système. La séparation stricte des comptes est indispensable.",
          "Partiel": "La séparation est réalisée pour certains systèmes ou certains administrateurs, mais pas de manière exhaustive. Une standardisation de cette pratique sur l'ensemble du périmètre est recommandée.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 3. SÉCURITÉ DES POSTES DE TRAVAIL
  // ──────────────────────────────────────────────────────────
  {
    id: 103, name: "Sécurité des postes de travail",
    questions: [
      {
        id: 1020,
        text: "Un antivirus / EDR est-il installé et à jour sur l'ensemble des postes ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un antivirus ou une solution EDR (Endpoint Detection and Response) est déployé sur l'ensemble des postes de travail et serveurs. Les signatures et moteurs de détection sont mis à jour automatiquement et régulièrement vérifiés.",
          "Non": "Aucun antivirus ni solution de protection des terminaux n'est déployé ou maintenu à jour. L'ensemble du parc informatique est exposé aux malwares, aux ransomwares et aux exploits. Le déploiement immédiat d'une solution de protection des terminaux est une action urgente.",
          "Partiel": "Une solution antivirus est présente sur une partie du parc, mais certains postes en sont dépourvus ou les mises à jour ne sont pas systématiques. Une couverture complète et une politique de mise à jour automatique doivent être mises en place.",
          "Non applicable": ""
        }
      },
      {
        id: 1021,
        text: "Les mises à jour de sécurité des systèmes d'exploitation et des logiciels sont-elles appliquées rapidement ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un processus de gestion des correctifs (patch management) est en place : les mises à jour de sécurité critiques sont appliquées dans des délais maîtrisés (sous 30 jours pour les correctifs critiques), sur l'ensemble des systèmes.",
          "Non": "Les mises à jour de sécurité ne sont pas appliquées de manière systématique et rapide. Les vulnérabilités connues et non corrigées sont la première cause d'exploitation réussie par des attaquants. Un plan de patch management, avec des délais d'application définis selon la criticité, doit être mis en place d'urgence.",
          "Partiel": "Les mises à jour sont appliquées mais avec des délais importants ou de manière incohérente selon les postes. Certains logiciels tiers sont souvent négligés. Une politique de patch management formalisée est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1022,
        text: "Le chiffrement des disques durs est-il activé sur les postes nomades (laptops) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Le chiffrement des disques durs est activé sur l'ensemble des postes nomades (BitLocker, FileVault ou équivalent). En cas de perte ou de vol d'un ordinateur portable, les données restent inaccessibles sans les clés de déchiffrement.",
          "Non": "Les disques durs des postes nomades ne sont pas chiffrés. La perte ou le vol d'un ordinateur portable expose directement les données de l'organisation. L'activation du chiffrement complet des disques est une mesure indispensable et simple à déployer.",
          "Partiel": "Le chiffrement est activé sur une partie des postes nomades, mais pas sur l'ensemble du parc. Une politique systématique, appliquée dès la configuration initiale de chaque poste, est nécessaire.",
          "Non applicable": ""
        }
      },
      {
        id: 1023,
        text: "Les postes de travail sont-ils configurés pour se verrouiller automatiquement après une période d'inactivité ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les postes de travail sont configurés pour se verrouiller automatiquement après une période d'inactivité courte (5 à 10 minutes), exigeant une ré-authentification. Cette mesure prévient les accès non autorisés aux sessions ouvertes en cas d'absence.",
          "Non": "Aucun verrouillage automatique n'est configuré. Une session laissée ouverte permet à toute personne physiquement présente d'accéder aux données et systèmes sans authentification. La configuration d'un verrouillage automatique doit être appliquée par GPO sur l'ensemble du parc.",
          "Partiel": "Le verrouillage automatique est configuré sur certains postes mais pas tous, ou les délais sont trop longs. Une politique uniforme appliquée par GPO est recommandée.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 4. SÉCURITÉ DU RÉSEAU
  // ──────────────────────────────────────────────────────────
  {
    id: 104, name: "Sécurité du réseau",
    questions: [
      {
        id: 1030,
        text: "Un pare-feu (firewall) est-il en place et correctement configuré ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un ou plusieurs pare-feux sont en place aux points d'entrée et de sortie du réseau. Les règles de filtrage sont documentées, revues régulièrement et respectent le principe du moindre accès. Les journaux de connexion sont activés et analysés.",
          "Non": "Aucun pare-feu n'est en place ou celui existant n'est pas correctement configuré. L'absence de filtrage du trafic réseau expose directement les systèmes internes aux attaques depuis Internet. La mise en place et la configuration d'un pare-feu est une mesure de base indispensable.",
          "Partiel": "Un pare-feu est présent mais sa configuration est insuffisante : règles trop permissives, règles non documentées ou absence de revue régulière. Un durcissement de la configuration est nécessaire.",
          "Non applicable": ""
        }
      },
      {
        id: 1031,
        text: "Le réseau est-il segmenté (séparation des réseaux utilisateurs, serveurs, IoT, invités) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Le réseau est segmenté en zones distinctes (VLAN utilisateurs, VLAN serveurs, réseau invité, réseau IoT). Cette architecture limite la propagation des attaques : la compromission d'un poste utilisateur ne donne pas accès direct aux serveurs sensibles.",
          "Non": "Le réseau est plat : tous les équipements sont sur le même segment réseau. En cas de compromission d'un seul équipement, l'attaquant peut atteindre l'ensemble du parc sans obstacle. Une segmentation par VLAN est fortement recommandée.",
          "Partiel": "Une segmentation partielle existe mais elle ne couvre pas tous les types d'équipements ou toutes les zones sensibles. Une architecture de segmentation plus complète est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1032,
        text: "Les accès distants (télétravail, VPN) sont-ils sécurisés ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les accès distants sont sécurisés via un VPN avec authentification forte (MFA). Les flux sont chiffrés, les journaux de connexion sont conservés. Les postes distants sont soumis aux mêmes politiques de sécurité que les postes en local.",
          "Non": "Les accès distants ne sont pas sécurisés de manière satisfaisante : absence de VPN, protocoles non chiffrés ou absence d'authentification renforcée. Ces points d'accès constituent des portes d'entrée privilégiées pour les attaquants. Une sécurisation urgente est nécessaire.",
          "Partiel": "Un VPN est en place mais sans MFA, ou certains accès distants utilisent encore des protocoles non sécurisés. Il est recommandé de centraliser tous les accès distants via le VPN et d'y imposer le MFA.",
          "Non applicable": ""
        }
      },
      {
        id: 1033,
        text: "Le Wi-Fi est-il sécurisé (protocole WPA2/WPA3, réseau invité séparé) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Le réseau Wi-Fi professionnel utilise le protocole WPA2-Enterprise ou WPA3 avec une authentification par certificat ou identifiants nominatifs. Un réseau Wi-Fi invité isolé est disponible pour les visiteurs, sans accès au réseau interne.",
          "Non": "Le réseau Wi-Fi n'est pas correctement sécurisé : protocole obsolète, clé partagée trop simple, ou absence de réseau invité séparé. Un Wi-Fi mal sécurisé peut permettre l'interception des communications ou l'accès au réseau interne. Une mise à niveau urgente est recommandée.",
          "Partiel": "Le Wi-Fi utilise WPA2 mais avec une clé pré-partagée commune à tous les utilisateurs, ou le réseau invité n'est pas correctement isolé. Une migration vers WPA2/WPA3-Enterprise est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1034,
        text: "Des tests d'intrusion (pentest) ou audits de vulnérabilités sont-ils réalisés régulièrement ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Des tests d'intrusion ou des audits de vulnérabilités sont réalisés régulièrement (au moins une fois par an) par des prestataires spécialisés. Les résultats font l'objet d'un plan de remédiation suivi.",
          "Non": "Aucun test d'intrusion ni audit de vulnérabilités n'est réalisé. L'organisation ne dispose d'aucune visibilité objective sur les failles exploitables de son infrastructure. La réalisation d'un premier audit est fortement recommandée.",
          "Partiel": "Des scans de vulnérabilités automatisés sont réalisés mais sans tests d'intrusion manuels approfondis, ou les actions de remédiation ne sont pas suivies. Un programme de tests réguliers est recommandé.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 5. PROTECTION DES DONNÉES
  // ──────────────────────────────────────────────────────────
  {
    id: 105, name: "Protection des données",
    questions: [
      {
        id: 1040,
        text: "Les données sensibles sont-elles identifiées et classifiées ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un inventaire et une classification des données sensibles (données personnelles, données confidentielles, données métier critiques) sont en place. Cette cartographie permet d'appliquer des mesures de protection proportionnées et de répondre aux exigences réglementaires (RGPD notamment).",
          "Non": "Aucune classification des données n'est réalisée : l'organisation ne sait pas précisément quelles données sont sensibles, où elles sont stockées et qui y a accès. Un exercice de cartographie et de classification des données est une étape prioritaire.",
          "Partiel": "Une classification partielle existe (données RGPD identifiées, par exemple) mais elle ne couvre pas l'ensemble des données de l'organisation. Une extension à l'ensemble du patrimoine informationnel est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1041,
        text: "Le RGPD est-il pris en compte dans les pratiques de l'organisation (registre des traitements, DPO, gestion des droits des personnes) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "L'organisation est en conformité avec le RGPD : un registre des traitements est tenu à jour, un DPO (ou référent RGPD) est désigné, les mentions légales et politiques de confidentialité sont à jour, et les procédures de gestion des droits des personnes sont opérationnelles.",
          "Non": "La conformité RGPD n'est pas assurée : absence de registre des traitements, pas de DPO ni de référent RGPD. L'organisation s'expose à des sanctions de la CNIL pouvant atteindre 4 % du chiffre d'affaires mondial ou 20 millions d'euros. Une mise en conformité urgente est nécessaire.",
          "Partiel": "Des actions RGPD ont été engagées mais la démarche n'est pas complète ou n'est pas maintenue dans le temps. Une revue de conformité complète et la désignation d'un référent RGPD sont recommandées.",
          "Non applicable": ""
        }
      },
      {
        id: 1042,
        text: "Les données sensibles stockées et transmises sont-elles chiffrées ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les données sensibles sont chiffrées aussi bien au repos (disques, bases de données) qu'en transit (HTTPS, TLS, VPN). Les algorithmes de chiffrement utilisés sont conformes aux recommandations actuelles de l'ANSSI.",
          "Non": "Les données sensibles ne sont pas chiffrées, ni au repos ni en transit. Des données stockées en clair ou transmises sans chiffrement peuvent être interceptées et exploitées facilement. La mise en place du chiffrement des données sensibles est une priorité.",
          "Partiel": "Le chiffrement est appliqué en transit (HTTPS) mais pas au repos, ou inversement. Une couverture complète du chiffrement est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1043,
        text: "L'utilisation de supports amovibles (clés USB, disques externes) est-elle encadrée ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "L'utilisation des supports amovibles est encadrée par une politique claire : seuls les supports chiffrés et référencés sont autorisés, les ports USB peuvent être désactivés sur les postes non autorisés, et l'utilisation est tracée.",
          "Non": "L'utilisation des supports amovibles n'est pas encadrée. Ce vecteur est régulièrement utilisé pour introduire des malwares ou exfiltrer des données sensibles. Une politique d'encadrement, avec désactivation des ports USB non nécessaires, est recommandée.",
          "Partiel": "Une politique existe sur le papier mais n'est pas appliquée techniquement. Une application technique des règles, via GPO ou solution de DLP, est nécessaire.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 6. SAUVEGARDE ET CONTINUITÉ D'ACTIVITÉ
  // ──────────────────────────────────────────────────────────
  {
    id: 106, name: "Sauvegarde et continuité d'activité",
    questions: [
      {
        id: 1050,
        text: "Des sauvegardes régulières de l'ensemble des données critiques sont-elles réalisées ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Des sauvegardes régulières (quotidiennes pour les données critiques) sont en place et couvrent l'ensemble des systèmes importants : serveurs de fichiers, bases de données, messagerie, configurations systèmes. Le calendrier et le périmètre sont documentés.",
          "Non": "Aucune sauvegarde fiable et régulière n'est en place. En cas de sinistre (ransomware, défaillance matérielle, erreur humaine), la perte de données pourrait être totale et définitive. La mise en place immédiate d'un plan de sauvegarde est urgente et prioritaire.",
          "Partiel": "Des sauvegardes existent pour certains systèmes mais pas tous, ou leur fréquence est insuffisante pour des données critiques. Un plan de sauvegarde exhaustif est nécessaire.",
          "Non applicable": ""
        }
      },
      {
        id: 1051,
        text: "Les sauvegardes sont-elles stockées hors site ou dans un cloud séparé de la production ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les sauvegardes respectent la règle 3-2-1 : 3 copies des données, sur 2 supports différents, dont 1 hors site. En cas de sinistre affectant le site principal, les sauvegardes hors site permettent une restauration complète.",
          "Non": "Les sauvegardes sont stockées au même endroit que les données de production. Un ransomware, un incendie ou une inondation peut détruire simultanément les données et leurs sauvegardes. La mise en place d'une copie hors site est indispensable.",
          "Partiel": "Une copie hors site existe mais n'est pas systématique ou n'est pas suffisamment isolée. La stratégie de sauvegarde doit garantir une isolation stricte entre données de production et sauvegardes.",
          "Non applicable": ""
        }
      },
      {
        id: 1052,
        text: "Les procédures de restauration sont-elles testées régulièrement ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Des tests de restauration sont réalisés régulièrement (au moins une fois par an) et documentés. Ces tests permettent de vérifier l'intégrité des sauvegardes et la maîtrise des procédures par les équipes.",
          "Non": "Les procédures de restauration ne sont jamais testées. Une sauvegarde non testée est une sauvegarde dont on ne peut pas garantir le fonctionnement au moment critique. Des tests réguliers de restauration sont indispensables.",
          "Partiel": "Des tests de restauration ont été réalisés ponctuellement mais sans planification régulière ni documentation. Il est recommandé de planifier des tests au moins annuels.",
          "Non applicable": ""
        }
      },
      {
        id: 1053,
        text: "Un Plan de Reprise d'Activité (PRA) ou Plan de Continuité d'Activité (PCA) est-il formalisé ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un PRA/PCA est formalisé, documenté et connu des équipes concernées. Il définit les objectifs de reprise (RTO, RPO), les procédures à suivre en cas d'incident majeur et les responsabilités de chacun. Il est testé périodiquement.",
          "Non": "Aucun PRA ni PCA n'est en place. En cas d'incident majeur, l'organisation improvise sa réponse, ce qui prolonge les délais de reprise et aggrave les impacts. La formalisation d'un PRA/PCA est fortement recommandée.",
          "Partiel": "Un document de continuité existe mais il est incomplet, non testé ou non connu des équipes opérationnelles. Une révision et une mise à jour, suivies d'un exercice de simulation, sont nécessaires.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 7. GESTION DES INCIDENTS DE SÉCURITÉ
  // ──────────────────────────────────────────────────────────
  {
    id: 107, name: "Gestion des incidents de sécurité",
    questions: [
      {
        id: 1060,
        text: "Une procédure de gestion des incidents de sécurité est-elle définie et connue des équipes ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Une procédure de gestion des incidents est formalisée et communiquée aux équipes : elle décrit les étapes de détection, qualification, confinement, éradication et retour à la normale. Des contacts d'urgence sont documentés et accessibles.",
          "Non": "Aucune procédure de gestion des incidents n'est définie. En cas d'incident, les équipes ne savent pas comment réagir, ce qui favorise la propagation de l'attaque et aggrave les dommages. La mise en place d'un processus de réponse aux incidents est essentielle.",
          "Partiel": "Une procédure existe sur le papier mais n'est pas connue de l'ensemble des équipes, ou elle est incomplète. Une révision et une diffusion de cette procédure sont nécessaires.",
          "Non applicable": ""
        }
      },
      {
        id: 1061,
        text: "Les incidents de sécurité sont-ils enregistrés et analysés (retours d'expérience) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les incidents de sécurité (même mineurs) sont enregistrés dans un registre dédié et font l'objet d'une analyse post-incident. Ces retours d'expérience permettent d'améliorer les dispositifs de protection pour éviter la récurrence.",
          "Non": "Les incidents de sécurité ne sont pas tracés ni analysés. Sans mémoire des incidents passés, l'organisation reproduit les mêmes erreurs. La mise en place d'un registre des incidents et d'un processus de retour d'expérience est recommandée.",
          "Partiel": "Les incidents majeurs sont enregistrés mais pas les incidents mineurs, ou les analyses post-incident ne sont pas systématiques. Une approche exhaustive couvrant tous les incidents est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1062,
        text: "L'organisation a-t-elle souscrit à une cyberassurance ?",
        options: ["Oui", "Non", "En cours", "Non applicable"],
        paragraphs: {
          "Oui": "Une cyberassurance est en place. Elle couvre les frais de gestion de crise en cas d'incident cyber (frais de réponse, frais juridiques, pertes d'exploitation, notifications). Le contrat a été relu récemment et les conditions sont comprises par la direction.",
          "Non": "Aucune cyberassurance n'est souscrite. En cas d'incident majeur, les coûts peuvent être très significatifs. L'évaluation et la souscription d'une cyberassurance adaptée est recommandée.",
          "En cours": "Une démarche de souscription est en cours. Il est important de s'assurer que les prérequis techniques demandés par l'assureur (MFA, sauvegardes hors site, etc.) sont bien mis en place avant la finalisation du contrat.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 8. SÉCURITÉ DES APPLICATIONS ET DU DÉVELOPPEMENT
  // ──────────────────────────────────────────────────────────
  {
    id: 108, name: "Sécurité des applications et du développement",
    questions: [
      {
        id: 1070,
        text: "Les applications développées en interne intègrent-elles des pratiques de sécurité dès la conception (Security by Design) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les pratiques de développement sécurisé sont intégrées au cycle de développement : revue de code, tests de sécurité (SAST/DAST), gestion des dépendances, et formation des développeurs à l'OWASP Top 10. La sécurité est traitée dès la conception.",
          "Non": "La sécurité n'est pas intégrée dans le processus de développement. Les applications produites sont potentiellement vulnérables aux failles classiques (injections SQL, XSS, etc.). L'adoption des bonnes pratiques de développement sécurisé et la formation des équipes sont recommandées.",
          "Partiel": "Certaines pratiques de sécurité sont appliquées mais pas de manière systématique. Une intégration continue de la sécurité dans le pipeline de développement (DevSecOps) est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1071,
        text: "Les applications et services tiers (SaaS, cloud) font-ils l'objet d'une évaluation de sécurité avant adoption ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un processus d'évaluation de la sécurité des solutions tierces est en place avant leur adoption : analyse des certifications (ISO 27001, SOC 2), revue des conditions générales d'utilisation, et vérification de la conformité RGPD.",
          "Non": "Les applications et services tiers sont adoptés sans évaluation de leur niveau de sécurité. Des solutions insuffisamment sécurisées peuvent exposer les données de l'organisation. Un processus d'homologation des solutions tierces doit être mis en place.",
          "Partiel": "Une évaluation est réalisée pour les applications les plus critiques mais pas pour l'ensemble des services SaaS utilisés. Un inventaire complet et une évaluation pour chacun sont recommandés.",
          "Non applicable": ""
        }
      },
      {
        id: 1072,
        text: "Les licences logicielles sont-elles gérées et à jour ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Un inventaire des licences logicielles est tenu à jour. L'organisation utilise uniquement des logiciels dûment licenciés et à jour. Les logiciels en fin de support ont été identifiés et font l'objet d'un plan de migration.",
          "Non": "La gestion des licences logicielles est insuffisante : logiciels non licenciés ou en fin de support toujours en production. Les logiciels non maintenus ne reçoivent plus de correctifs de sécurité. Un audit des licences et un plan de mise à jour sont nécessaires.",
          "Partiel": "La plupart des logiciels sont licenciés et à jour, mais certains systèmes anciens restent en dehors du processus de gestion. Une couverture complète est recommandée.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 9. MESSAGERIE ET PROTECTION CONTRE LE PHISHING
  // ──────────────────────────────────────────────────────────
  {
    id: 109, name: "Messagerie et protection contre le phishing",
    questions: [
      {
        id: 1080,
        text: "Des filtres anti-spam et anti-phishing sont-ils en place sur la messagerie ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Des solutions de filtrage des emails (anti-spam, anti-phishing, anti-malware sur pièces jointes) sont en place et maintenues à jour. Les enregistrements DNS (SPF, DKIM, DMARC) sont correctement configurés pour limiter l'usurpation d'identité.",
          "Non": "Aucun filtrage efficace des emails n'est en place. La messagerie est le premier vecteur d'attaque. La mise en place d'une solution de protection et la configuration des enregistrements SPF, DKIM et DMARC sont des actions prioritaires.",
          "Partiel": "Des filtres existent mais sont insuffisants ou mal configurés. Les enregistrements DNS ne sont pas tous en place ou DMARC est en mode monitoring sans rejet. Un renforcement de la protection est recommandé.",
          "Non applicable": ""
        }
      },
      {
        id: 1081,
        text: "Les utilisateurs sont-ils formés à reconnaître et signaler les tentatives de phishing ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Des sessions de sensibilisation au phishing sont organisées régulièrement. Des simulations sont réalisées pour tester la vigilance des utilisateurs. Un processus de signalement des emails suspects est en place et connu des utilisateurs.",
          "Non": "Aucune formation au phishing n'est dispensée. Les utilisateurs constituent la dernière ligne de défense face aux attaques par ingénierie sociale. Des campagnes de sensibilisation et de simulation doivent être organisées.",
          "Partiel": "Des actions de sensibilisation ont été réalisées ponctuellement mais sans programme structuré ni simulation pratique. Un programme récurrent incluant des tests réguliers est recommandé.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 10. JOURNALISATION ET SUPERVISION
  // ──────────────────────────────────────────────────────────
  {
    id: 110, name: "Journalisation et supervision",
    questions: [
      {
        id: 1090,
        text: "Les journaux d'événements (logs) des systèmes critiques sont-ils activés et conservés ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "La journalisation est activée sur l'ensemble des systèmes critiques. Les journaux sont centralisés, conservés pendant une durée suffisante (a minima 1 an selon les recommandations ANSSI) et protégés contre toute modification.",
          "Non": "La journalisation des événements n'est pas activée ou les journaux ne sont pas conservés. En cas d'incident, il sera impossible de retracer les actions des attaquants. L'activation et la centralisation des journaux sont des mesures indispensables.",
          "Partiel": "Des journaux existent sur certains systèmes mais pas tous, leur conservation est insuffisante, ou ils ne sont pas centralisés. Une centralisation via un SIEM ou un serveur de logs dédié est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1091,
        text: "Les journaux sont-ils analysés et des alertes sont-elles configurées en cas d'événement suspect ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les journaux font l'objet d'une analyse régulière, manuelle ou automatisée. Des règles de détection et des alertes sont configurées pour les événements suspects. Un responsable est désigné pour traiter ces alertes.",
          "Non": "Les journaux existent mais ne sont jamais analysés. Des journaux non analysés n'apportent aucune valeur de détection. La mise en place d'alertes automatiques sur les événements critiques est indispensable.",
          "Partiel": "Quelques alertes sont configurées mais la couverture est insuffisante ou les alertes ne sont pas systématiquement traitées. Une revue des règles de détection et un processus de traitement doivent être mis en place.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 11. GESTION DES TIERS ET PRESTATAIRES
  // ──────────────────────────────────────────────────────────
  {
    id: 111, name: "Gestion des tiers et prestataires",
    questions: [
      {
        id: 1100,
        text: "Les accès des prestataires et sous-traitants au système d'information sont-ils encadrés et limités ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les accès des prestataires sont strictement encadrés : accès nominatifs, limités dans le temps et aux périmètres nécessaires, tracés et révocables à tout moment. Des clauses contractuelles de sécurité sont intégrées dans les contrats.",
          "Non": "Les accès des prestataires ne sont pas correctement encadrés : comptes génériques partagés, accès permanents non révisés, absence de traçabilité. Les prestataires constituent un vecteur d'attaque de plus en plus utilisé. Un encadrement strict est nécessaire.",
          "Partiel": "Des mesures existent pour certains prestataires mais pas tous, ou les accès ne sont pas systématiquement révoqués en fin de mission. Une politique de gestion des accès tiers, appliquée uniformément, est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1101,
        text: "Les contrats avec les prestataires traitant des données sensibles incluent-ils des clauses de sécurité et de confidentialité ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les contrats incluent des clauses de sécurité (obligations de moyens, droit d'audit, notification d'incident) et des accords de confidentialité. Pour les sous-traitants RGPD, des DPA (Data Processing Agreements) sont en place.",
          "Non": "Les contrats ne comportent pas de clauses de sécurité ni de confidentialité. En cas d'incident impliquant un prestataire, la responsabilité juridique peut être difficile à établir. Une révision des contrats pour y intégrer ces clauses est recommandée.",
          "Partiel": "Certains contrats incluent des clauses de sécurité mais pas tous. Une revue systématique et la mise à jour des contrats les plus anciens sont recommandées.",
          "Non applicable": ""
        }
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // 12. SÉCURITÉ PHYSIQUE
  // ──────────────────────────────────────────────────────────
  {
    id: 112, name: "Sécurité physique",
    questions: [
      {
        id: 1110,
        text: "L'accès aux locaux informatiques sensibles (salle serveur, baies réseau) est-il contrôlé et réservé aux personnes autorisées ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les locaux informatiques sensibles sont sécurisés par un contrôle d'accès physique (badge, code, clé). L'accès est réservé aux personnes autorisées, la liste est tenue à jour et les accès sont tracés.",
          "Non": "Les locaux informatiques ne sont pas correctement sécurisés. Un accès physique non contrôlé aux équipements permet de contourner l'ensemble des mesures de sécurité logique. Des mesures de contrôle d'accès physique doivent être mises en place en priorité.",
          "Partiel": "Des contrôles d'accès existent pour la salle serveur principale mais certains équipements réseau sont installés dans des zones non sécurisées. Une sécurisation de l'ensemble des équipements critiques est recommandée.",
          "Non applicable": ""
        }
      },
      {
        id: 1111,
        text: "Les équipements informatiques sont-ils protégés contre les risques environnementaux (incendie, inondation, coupure électrique) ?",
        options: ["Oui", "Non", "Partiel", "Non applicable"],
        paragraphs: {
          "Oui": "Les équipements critiques sont protégés contre les risques environnementaux : onduleur (UPS), détection et extinction incendie, capteurs de température et d'humidité, protections contre les dégâts des eaux. Des contrats de maintenance préventive sont en place.",
          "Non": "Les équipements informatiques ne sont pas protégés contre les risques environnementaux. Une coupure électrique, un incendie ou une inondation peut provoquer une interruption totale de l'activité. La mise en place d'un onduleur et d'une détection incendie est nécessaire.",
          "Partiel": "Des protections partielles existent mais la couverture n'est pas complète. Un bilan des risques environnementaux et une mise à niveau des protections sont recommandés.",
          "Non applicable": ""
        }
      }
    ]
  }

];
