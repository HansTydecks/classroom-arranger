import type { Messages } from './de';

export const fr: Messages = {
  'common.name': 'Nom',
  'common.ok': 'OK',
  'common.unknown': '(inconnu)',

  'app.title': 'Générateur de plan de classe',
  'app.subtitle': 'fonctionne entièrement dans le navigateur · aucune donnée transmise',
  'app.className': 'Classe',
  'app.classNamePlaceholder': 'p. ex. 5e B',
  'app.language': 'Langue',
  'app.steps': 'Étapes',
  'app.loading': 'Chargement des données enregistrées …',
  'step.room': 'Salle de classe',
  'step.class': 'Classe',
  'step.wishes': 'Souhaits et règles',
  'step.plan': 'Plan de classe',
  'footer.imprint': 'Mentions légales',
  'footer.privacy': 'Confidentialité',
  'footer.save': 'Sauvegarder les données',
  'footer.load': 'Charger une sauvegarde',
  'footer.demo': 'Charger une classe d’exemple',
  'footer.reset': 'Supprimer toutes les données',
  'demo.loaded': 'Classe d’exemple chargée — {count} élèves avec souhaits et règles.',
  'import.done': 'Données chargées.',
  'import.failed': 'Le fichier n’a pas pu être lu.',
  'import.invalidJson': 'Le fichier n’est pas un fichier JSON valide.',
  'import.noClassData': 'Le fichier ne contient pas de données de classe de cette application.',
  'reset.confirm':
    'Supprimer définitivement toutes les données enregistrées par cette application ?\n\n' +
    'Les noms, souhaits, règles et le plan de classe seront perdus. ' +
    'Si besoin, faites d’abord une sauvegarde avec « Sauvegarder les données ».',
  'reset.done': 'Toutes les données ont été supprimées.',

  'room.title': 'Salle de classe',
  'room.layout': 'Disposition',
  'room.template.rows': 'Rangées face au tableau (tables individuelles)',
  'room.template.doubleRows': 'Rangées de tables doubles (2 places)',
  'room.template.groups4': 'Îlots de 4 places',
  'room.template.groups6': 'Îlots de 6 places',
  'room.template.uShape': 'En U',
  'room.rows': 'Rangées de tables',
  'room.armSeats': 'Places par branche latérale',
  'room.tablesPerRow': 'Tables par rangée',
  'room.backTables': 'Tables au fond',
  'room.seatsPerTable': 'Places par table',
  'room.windowSide': 'Côté des fenêtres',
  'room.window.left': 'gauche',
  'room.window.right': 'droite',
  'room.window.none': 'ne pas tenir compte des fenêtres',
  'room.door': 'Porte',
  'room.doorPos.frontLeft': 'devant à gauche',
  'room.doorPos.frontRight': 'devant à droite',
  'room.doorPos.backLeft': 'au fond à gauche',
  'room.doorPos.backRight': 'au fond à droite',
  'room.hint':
    'Les indications sont données du point de vue des élèves, face au tableau. ' +
    'Une allée sépare les blocs de tables — de part et d’autre d’une allée, les élèves ' +
    'ne comptent pas comme voisins.',
  'room.preview': 'Aperçu',
  'room.seatsOnly': '{seats} places',
  'room.seatsMissing': '{seats} places pour {students} élèves — il en manque {missing}.',
  'room.seatsFull': '{seats} places pour {students} élèves — aucune place ne reste libre.',
  'room.seatsFree': '{seats} places pour {students} élèves — {free} restent libres.',
  'seat.tag.window': 'fenêtre',
  'seat.tag.door': 'porte',
  'seat.tag.aisle': 'allée',
  'seat.tag.front': 'devant',
  'seat.tag.back': 'fond',

  'class.addNames': 'Ajouter des noms',
  'class.onePerLine': 'Un nom par ligne',
  'class.placeholder': 'Amélie Bauer\nBen Cordes\nCharlotte Dietz',
  'class.add': 'Ajouter',
  'class.pasteHint':
    'Vous pouvez aussi coller une liste depuis un tableur — les sauts de ligne, virgules et ' +
    'points-virgules séparent les noms. Le premier mot est le prénom, le reste le nom de famille.',
  'class.displayAs': 'Afficher les noms comme',
  'class.display.full': 'Prénom et nom',
  'class.display.firstName': 'Prénom seulement',
  'class.display.initial': 'Prénom + initiale',
  'class.displayHint':
    'S’applique à l’écran et à l’impression. Pour un affichage dans la classe, le prénom ' +
    'suffit généralement — moins il y a de données personnelles visibles, mieux c’est.',
  'class.heading': 'Classe',
  'class.count_one': '{count} élève, {seats} places',
  'class.count_other': '{count} élèves, {seats} places',
  'class.none': 'Aucun nom saisi pour l’instant.',
  'class.firstName': 'Prénom',
  'class.lastName': 'Nom',
  'class.firstNameOf': 'Prénom de {name}',
  'class.lastNameOf': 'Nom de {name}',
  'class.remove': 'Retirer {name}',
  'class.removeTitle': 'Retirer — supprime aussi tous les souhaits et règles liés à cet élève',

  'wishes.title': 'Souhaits et règles',
  'wishes.heading': 'Souhaits et règles',
  'wishes.empty': 'Saisissez d’abord les noms de la classe.',
  'wishes.intro':
    'Pour chaque élève, vous pouvez saisir jusqu’à trois souhaits de voisin et autant de règles ' +
    'que nécessaire. Les règles s’ajoutent avec le menu « Ajouter une règle », classé par ' +
    'thème : position dans la salle, caractéristiques de la place et relation avec un autre élève.',
  'wishes.hardHint':
    'Une règle est soit « souple » (un souhait que l’algorithme satisfait si possible), soit ' +
    '« stricte » (jamais enfreinte — prévue pour un certificat médical, une mauvaise vue ou un ' +
    'aménagement). Plus il y a de règles strictes, moins il reste de marge pour les autres ' +
    'souhaits. Cliquez sur « souple » ou « stricte » pour basculer.',
  'wishes.rules': 'Règles',
  'wishes.first': '1er souhait',
  'wishes.second': '2e souhait',
  'wishes.third': '3e souhait',
  'wishes.wishOf': '{rank} de {name}',
  'wishes.addRule': '＋ Ajouter une règle …',
  'wishes.addRuleFor': 'Ajouter une règle pour {name}',
  'wishes.removeRule': 'Supprimer la règle « {rule} »',
  'wishes.rowLimit': 'Rangée limite',
  'wishes.rowNumber': 'Rangée {row}',
  'wishes.ruleTarget': 'Autre élève',
  'wishes.soft': 'souple',
  'wishes.hard': 'stricte',
  'wishes.softTitle': 'Souhait souple. Cliquez pour le rendre obligatoire.',
  'wishes.hardTitle': 'Règle stricte — jamais enfreinte. Cliquez pour en faire un souhait.',

  'rule.group.position': 'Position dans la salle',
  'rule.group.features': 'Caractéristiques de la place',
  'rule.group.neighbours': 'Relation avec un autre élève',
  'rule.front.name': 'Devant (première rangée)',
  'rule.front.short': 'devant',
  'rule.notBack.name': 'Pas dans la dernière rangée',
  'rule.notBack.short': 'pas au fond',
  'rule.back.name': 'Au fond (dernière rangée)',
  'rule.back.short': 'au fond',
  'rule.maxRow.name': 'Au plus jusqu’à la rangée …',
  'rule.maxRow.short': 'jusqu’à la rangée',
  'rule.minRow.name': 'À partir de la rangée …',
  'rule.minRow.short': 'à partir de la rangée',
  'rule.leftSide.name': 'Moitié gauche de la salle',
  'rule.leftSide.short': 'à gauche',
  'rule.rightSide.name': 'Moitié droite de la salle',
  'rule.rightSide.short': 'à droite',
  'rule.center.name': 'Milieu de la salle',
  'rule.center.short': 'au milieu',
  'rule.window.name': 'Près de la fenêtre',
  'rule.window.short': 'fenêtre',
  'rule.notWindow.name': 'Pas près de la fenêtre (éblouissement, courant d’air)',
  'rule.notWindow.short': 'pas à la fenêtre',
  'rule.aisle.name': 'Côté allée',
  'rule.aisle.short': 'allée',
  'rule.notAisle.name': 'Pas côté allée',
  'rule.notAisle.short': 'pas côté allée',
  'rule.nearDoor.name': 'Près de la porte',
  'rule.nearDoor.short': 'près de la porte',
  'rule.notDoor.name': 'Pas à côté de la porte',
  'rule.notDoor.short': 'pas près de la porte',
  'rule.notNextTo.name': 'Pas à côté de …',
  'rule.notNextTo.short': 'pas à côté de',
  'rule.notSameTable.name': 'Pas à la même table que …',
  'rule.notSameTable.short': 'pas à la table de',
  'rule.nextTo.name': 'Juste à côté de …',
  'rule.nextTo.short': 'à côté de',
  'rule.sameTable.name': 'À la même table que …',
  'rule.sameTable.short': 'à la table de',

  'plan.calculate': 'Créer le plan de classe',
  'plan.recalculate': 'Recalculer',
  'plan.running': 'Calcul en cours …',
  'plan.optimizeRest': 'Réoptimiser le reste ({count} épinglée(s))',
  'plan.clearPins': 'Détacher toutes les épingles',
  'plan.needNames': 'Saisissez d’abord les noms de la classe.',
  'plan.progress': 'Progression',
  'plan.error': 'Erreur de calcul : {message}',
  'plan.blocked':
    'Tant que les règles strictes se contredisent, aucun plan valide n’existe. ' +
    'Modifiez l’une des règles mentionnées.',
  'plan.stats': '{succeeded} calculs réussis sur {attempted}, {ms} ms.',
  'plan.variant': 'Variante {letter}',
  'plan.score': 'Score {score}',
  'plan.teacherView': 'Vue de l’enseignant',
  'plan.studentView': 'Vue des élèves',
  'plan.mirrorTitle': 'Affiche le plan comme vous le voyez depuis l’avant — gauche et droite inversées',
  'plan.print': 'Imprimer / enregistrer en PDF',
  'plan.edited':
    'Modifié à la main. Épinglez des places avec le symbole d’épingle et choisissez ' +
    '« Réoptimiser le reste » pour que l’algorithme réorganise tout le reste autour.',
  'plan.printTitle': 'Plan de classe {name}',
  'plan.facingBoard': 'Face au tableau',
  'plan.legendFirst': '1er souhait satisfait',
  'plan.legendSecond': '2e souhait satisfait',
  'plan.legendNone': 'aucun souhait satisfait',
  'plan.legendDrag': 'Faites glisser une place sur une autre pour les échanger.',
  'grid.label': 'Plan de classe',
  'grid.board': 'Tableau',
  'grid.viewFromFront': 'vue de l’avant',
  'grid.free': 'libre',
  'grid.pin': 'Épingler la place',
  'grid.unpin': 'Libérer la place',
  'grid.pinTitle': 'Épingler la place — reste en place lors d’un nouveau calcul',
  'grid.unpinTitle': 'Libérer la place — peut être déplacée lors d’un nouveau calcul',

  'report.title': 'Évaluation',
  'report.withWish': 'avec un souhait satisfait ({share} %)',
  'report.firstFulfilled': '1ers souhaits satisfaits',
  'report.secondFulfilled': '2es souhaits satisfaits',
  'report.mutualPairs': 'paires réciproques réunies',
  'report.rulesSatisfied': 'règles respectées',
  'report.separations': 'séparations respectées',
  'report.unfulfilled': 'Sans souhait satisfait :',
  'report.unfulfilledHint':
    '{names}. À examiner de plus près — un simple échange à la main suffit souvent.',
  'report.allFulfilled':
    'Chaque élève ayant exprimé des souhaits est assis à côté d’au moins un élève souhaité.',
  'report.row': 'Rangée',
  'report.wishes': 'Souhaits',
  'report.rules': 'Règles',
  'report.noWishes': 'aucun',
  'report.mutualTitle': 'Le souhait est réciproque',
  'report.hardTitle': 'règle stricte',
  'report.softTitle': 'souhait souple',

  'weights.title': 'Ajuster la pondération',
  'weights.hint':
    'Après avoir déplacé un curseur, il faut recalculer. Le réglage par défaut correspond au ' +
    'profil « équité d’abord ».',
  'weights.fairness.label': 'Équité',
  'weights.fairness.hint':
    'Poids d’un élève dont aucun souhait n’est satisfait. ' +
    'Élevé = personne n’est laissé de côté, quitte à réduire le total.',
  'weights.mutual.label': 'Réciprocité',
  'weights.mutual.hint':
    'Bonus pour les souhaits réciproques. Élevé = les vraies paires d’amis passent avant les souhaits à sens unique.',
  'weights.first.label': '1er souhait',
  'weights.first.hint':
    'Valeur de base d’un premier souhait satisfait. Les 2e et 3e souhaits gardent leur proportion.',
  'weights.rules.label': 'Règles souples',
  'weights.rules.hint':
    'Poids des règles souples (fenêtre, devant, allée, à côté de …) par rapport aux souhaits de voisins.',
  'weights.diminishing.label': 'Deuxième souhait du même élève',
  'weights.diminishing.hint':
    'Part avec laquelle compte un deuxième souhait satisfait du même élève. ' +
    'Faible = la satisfaction est répartie plus équitablement dans la classe.',
  'weights.recalculate': 'Recalculer avec la nouvelle pondération',
  'weights.reset': 'Rétablir les valeurs par défaut',

  'warn.wishUnknown': '{name} : un souhait renvoie à un nom inconnu.',
  'warn.wishSelf': '{name} : un souhait concernant soi-même est ignoré.',
  'warn.wishDuplicate': '{name} : un souhait en double n’est compté qu’une fois.',
  'warn.pinnedMissing': '{name} : la place épinglée n’existe plus dans la salle.',
  'warn.noSeatAllowed': '{name} : les règles strictes n’autorisent aucune place.',
  'warn.separationUnknown': 'Une séparation renvoie à un nom inconnu et est ignorée.',
  'warn.ruleUnknown': '{name} : une règle ne désigne aucun élève valide et est ignorée.',
  'warn.ruleSelf': '{name} : une règle concerne l’élève lui-même et est ignorée.',

  'validation.seatsMissing':
    'La salle compte {seats} places, mais la classe compte {students} élèves. Il manque {missing} places.',
  'validation.allSeatsTaken':
    'Toutes les places sont occupées. Sans place libre, l’algorithme n’a presque aucune marge — ' +
    'une ou deux places supplémentaires améliorent souvent nettement le résultat.',
  'validation.noSeatAllowed': '{name} : les règles strictes excluent toutes les places de la salle.',
  'validation.oversubscribed':
    '{count} élèves ({names}) ont besoin, à cause de règles strictes, de places dont il n’existe ' +
    'que {seats}. Assouplissez l’une des règles ou agrandissez la zone concernée.',
  'validation.cannotSeparate':
    '{a} et {b} ne peuvent pas être séparés : leurs règles strictes ne laissent que des places ' +
    'trop proches l’une de l’autre.',
  'validation.tableClique':
    '{names} doivent tous être assis séparément, mais il n’y a que {tables} tables. ' +
    'Au moins deux d’entre eux devraient partager une table.',
  'validation.togetherConflict':
    '{a} et {b} doivent être assis ensemble et séparés à la fois — les deux règles strictes ' +
    'se contredisent.',
  'validation.togetherImpossible':
    '{a} et {b} doivent être assis ensemble, mais leurs règles strictes ne laissent aucune ' +
    'place assez proche.',
  'validation.nobodyWants':
    'Personne n’a souhaité {names} comme voisin. Le plan essaie quand même de satisfaire leurs ' +
    'propres souhaits — mais un coup d’œil s’impose.',

  'violation.pinned': '{name} n’est pas sur la place épinglée.',
  'violation.hardRule': '{name} : règle stricte non respectée ({rules}).',
  'violation.seatRule': '{name} : règle stricte de place non respectée.',
  'violation.separation': '{a} et {b} sont assis trop près — la séparation n’est pas respectée.',
  'violation.together': '{a} et {b} doivent être assis ensemble mais sont trop éloignés.',

  'imprint.title': 'Mentions légales (Impressum)',
  'imprint.translationNote':
    'Seule la version allemande fait foi. Cette traduction est fournie à titre indicatif.',
  'imprint.legalBasis': 'Informations conformément au § 5 DDG (loi allemande sur les services numériques)',
  'imprint.country': 'Allemagne',
  'imprint.contact': 'Contact',
  'imprint.email': 'E-mail',
  'imprint.form': 'Formulaire de contact',
  'imprint.responsible': 'Responsable du contenu',
  'imprint.responsibleText':
    'Responsable du contenu éditorial conformément au § 18 al. 2 MStV (traité allemand sur les médias) :',
  'imprint.support': 'Soutien',
  'imprint.supportText':
    'Ce projet est gratuit, sans publicité et entretenu pendant mon temps libre. Un lien ' +
    'Buy Me a Coffee pour un soutien volontaire est en préparation et sera activé ici dès qu’il ' +
    'sera disponible.',
  'imprint.liabilityContent': 'Responsabilité quant au contenu',
  'imprint.liabilityContentText':
    'Les contenus de ces pages ont été créés avec le plus grand soin. Aucune garantie ne peut ' +
    'toutefois être donnée quant à leur exactitude, leur exhaustivité et leur actualité. En ' +
    'tant que prestataire de services, je suis responsable de mes propres contenus sur ces ' +
    'pages selon le droit commun conformément au § 7 al. 1 DDG. Selon les §§ 8 à 10 DDG, je ' +
    'ne suis toutefois pas tenu de surveiller les informations de tiers transmises ou ' +
    'stockées ni de rechercher des circonstances révélant une activité illicite. Les ' +
    'obligations de retrait ou de blocage de l’utilisation d’informations selon le droit ' +
    'commun demeurent inchangées. Une responsabilité à ce titre n’est toutefois possible qu’à ' +
    'partir du moment où une violation concrète du droit est connue. Dès que j’aurai ' +
    'connaissance de telles violations, je retirerai immédiatement ces contenus.',
  'imprint.liabilityApp':
    'Les plans de classe générés sont des propositions sans garantie ; la responsabilité ' +
    'pédagogique de la disposition effective des places incombe à l’enseignant.',
  'imprint.liabilityLinks': 'Responsabilité quant aux liens',
  'imprint.liabilityLinksText':
    'Ce site contient des liens vers des sites externes de tiers dont je n’ai aucune ' +
    'influence sur les contenus. Je ne peux donc assumer aucune garantie pour ces contenus ' +
    'externes. Le fournisseur ou l’exploitant respectif des pages liées est toujours ' +
    'responsable de leur contenu. Les pages liées ont été vérifiées au moment de la mise en ' +
    'place du lien quant à d’éventuelles violations du droit ; aucun contenu illicite n’était ' +
    'alors décelable. Un contrôle permanent du contenu des pages liées n’est pas raisonnable ' +
    'sans indices concrets d’une violation. Dès que j’aurai connaissance de violations, ' +
    'je supprimerai immédiatement de tels liens.',
  'imprint.copyright': 'Droit d’auteur',
  'imprint.copyrightText':
    'Les contenus et œuvres que j’ai créés sur ces pages sont soumis au droit d’auteur ' +
    'allemand, sauf indication contraire. Les contributions de tiers ainsi que les matériaux ' +
    'expressément signalés comme librement utilisables ou relevant du domaine public en sont ' +
    'exclus et peuvent être utilisés dans le cadre de la licence indiquée. Les téléchargements ' +
    'et copies de ces pages ne sont autorisés que pour un usage privé et non commercial, sauf ' +
    'indication contraire.',
  'imprint.note': 'Remarque',
  'imprint.noteText': 'Ceci est un site éducatif privé, tenu à titre éditorial.',

  'privacy.title': 'Politique de confidentialité',
  'privacy.firstTitle': 'L’essentiel d’abord',
  'privacy.firstText':
    'Cette application n’a pas de serveur. Tous les noms, souhaits et plans de classe saisis ' +
    'sont traités et enregistrés exclusivement dans la mémoire de votre navigateur. Ils ne ' +
    'sont jamais transmis — ni à l’éditeur de ce site ni à des tiers. Après le chargement de ' +
    'la page, l’application n’établit plus aucune connexion réseau ; vous pouvez le vérifier ' +
    'dans l’onglet Réseau des outils de développement de votre navigateur.',
  'privacy.whereTitle': 'Quelles données sont stockées et où',
  'privacy.dataTitle': 'Noms, souhaits, règles, plans de classe',
  'privacy.dataText':
    'Enregistrés dans l’IndexedDB de votre navigateur, exclusivement sur cet appareil et dans ce ' +
    'profil de navigateur. Aucun autre utilisateur ni appareil n’y a accès.',
  'privacy.langTitle': 'Réglage de la langue',
  'privacy.langText':
    'La langue choisie est conservée dans le stockage local (localStorage) de votre navigateur ' +
    'afin d’être retrouvée à la prochaine visite. Elle ne contient aucune donnée personnelle ' +
    'et n’est pas transmise.',
  'privacy.trackingTitle': 'Cookies, analyse, suivi, polices',
  'privacy.trackingText':
    'Non utilisés. Il n’y a ni pixel de suivi ni mesure d’audience. Les polices utilisées sont ' +
    'fournies avec l’application elle-même et ne sont pas chargées auprès de tiers.',
  'privacy.exportTitle': 'Fichiers d’export',
  'privacy.exportText':
    'Si vous choisissez « Sauvegarder les données », un fichier JSON est créé sur votre ' +
    'ordinateur. L’endroit où ce fichier est conservé ensuite et les personnes qui peuvent y ' +
    'accéder relèvent de votre responsabilité.',
  'privacy.logsTitle': 'Journaux serveur de l’hébergeur',
  'privacy.logsText':
    'Lors de l’accès à la page, votre navigateur transmet des données techniquement nécessaires ' +
    '(adresse IP, heure, fichier demandé, identifiant du navigateur) à l’hébergeur GitHub Pages ' +
    '(GitHub Inc., États-Unis). Ces données sont générées lors de chaque accès à un site web et ' +
    'sont traitées par l’hébergeur pour la diffusion et la sécurité. La base juridique est ' +
    'l’art. 6, par. 1, point f) du RGPD. L’exploitant de cette application n’a aucune ' +
    'influence sur ces journaux.',
  'privacy.controllerTitle': 'Responsabilité et finalité',
  'privacy.controllerText':
    'Aucune donnée n’étant transmise à l’éditeur, celui-ci ne traite aucune donnée personnelle ' +
    'à cet égard et aucun contrat de sous-traitance n’est nécessaire. Vous restez responsable ' +
    'du traitement des données des élèves dans votre navigateur, ou votre établissement ' +
    'selon la réglementation applicable sur la protection des données scolaires.',
  'privacy.minimisationTitle': 'Minimisation des données',
  'privacy.minimisationText':
    'Ne saisissez que ce dont vous avez besoin. Le nom de famille est facultatif ; sous ' +
    '« Classe », vous pouvez choisir de n’afficher que les prénoms à l’écran et à ' +
    'l’impression. Pour un affichage dans la classe, cela suffit en général.',
  'privacy.deletionTitle': 'Suppression',
  'privacy.deletionText':
    'Le bouton « Supprimer toutes les données » du pied de page supprime définitivement toutes ' +
    'les données enregistrées dans le navigateur. Vous obtenez le même résultat avec la ' +
    'fonction de suppression des données de sites de votre navigateur.',
  'privacy.rightsTitle': 'Vos droits',
  'privacy.rightsText':
    'Les droits des personnes concernées selon les art. 15 et suivants du RGPD (accès, ' +
    'rectification, effacement, limitation, opposition, portabilité) s’adressent au responsable ' +
    'du traitement — en usage scolaire, en général l’établissement. Contact pour cette ' +
    'application :',
};
