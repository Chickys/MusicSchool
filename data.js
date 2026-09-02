
const ORACLE_DATA = [
    {
        id: "platon",
        nom: "PLATON",
        dates: "428 — 348 av. J.-C.",
        ecole: "Idéalisme",
        emoji: "🏛️",
        couleur: "#c9a84c",
        image: "PHILOSOPHES/Platon.jpg",
        resume: "Père de la philosophie occidentale. Théorie des Idées, justice, amour, âme.",
        notions: [
            {
                nom: "Vérité",
                citations: [
                    { citation: "L'opinion est entre la science et l'ignorance.", oeuvre: "La République", date: "~380 av. J.-C.", explication: "Pour Platon, l'opinion (doxa) n'est pas la vraie connaissance — elle porte sur le monde sensible qui change. La vraie science (épistémè) porte sur les Idées immuables.", bac: "Utile pour : La vérité est-elle accessible ? Peut-on se contenter de l'opinion ?", adversaire: "Protagoras", antithese: "Protagoras répond : 'L'homme est la mesure de toutes choses' — il n'y a pas de vérité absolue, seulement des opinions relatives à chaque individu." },
                    { citation: "Nul n'est méchant volontairement.", oeuvre: "Protagoras / Ménon", date: "~380 av. J.-C.", explication: "Platon pense que le mal vient de l'ignorance — qui connaît vraiment le Bien ne peut pas faire le mal. La connaissance mène nécessairement à la vertu.", bac: "Utile pour : La connaissance rend-elle meilleur ? Le mal est-il volontaire ?", adversaire: "Sartre", antithese: "Sartre conteste : l'homme est condamné à être libre et pleinement responsable de ses actes — on ne peut pas se réfugier derrière l'ignorance." },
                    { citation: "La philosophie est un apprentissage de la mort.", oeuvre: "Phédon", date: "~380 av. J.-C.", explication: "Philosopher c'est apprendre à se détacher du corps et des sens pour accéder aux Idées pures. La mort libère l'âme du corps — le philosophe s'y prépare toute sa vie.", bac: "Utile pour : À quoi sert la philosophie ? Qu'est-ce que la sagesse ?", adversaire: "Épicure", antithese: "Épicure répond : 'La mort n'est rien pour nous' — inutile de s'y préparer, elle n'existe pas pour celui qui meurt." }
                ]
            },
            {
                nom: "Justice",
                citations: [
                    { citation: "La justice est la santé de l'âme.", oeuvre: "La République", date: "~380 av. J.-C.", explication: "Comme la santé est l'harmonie du corps, la justice est l'harmonie de l'âme — chaque partie (raison, courage, désirs) remplit son rôle. Une cité juste reflète une âme juste.", bac: "Utile pour : Qu'est-ce que la justice ? Justice individuelle et collective.", adversaire: "Thrasymarque", antithese: "Thrasymarque réplique : la justice n'est que l'intérêt du plus fort — ce que les puissants appellent 'juste' sert leurs intérêts." },
                    { citation: "Chacun doit faire ce à quoi sa nature le destine.", oeuvre: "La République", date: "~380 av. J.-C.", explication: "Dans la République idéale, les philosophes gouvernent, les guerriers défendent, les artisans produisent. La justice = chacun à sa place selon sa nature.", bac: "Utile pour : La justice est-elle naturelle ou conventionnelle ?", adversaire: "Sartre", antithese: "Sartre s'oppose : 'L'existence précède l'essence' — l'homme n'a pas de nature fixée, il se définit librement par ses choix." }
                ]
            },
            {
                nom: "Amour & Désir",
                citations: [
                    { citation: "L'amour est le désir d'engendrer dans le beau.", oeuvre: "Le Banquet", date: "~385 av. J.-C.", explication: "Dans Le Banquet, Diotime explique à Socrate que l'amour vise la beauté pour engendrer — d'abord des enfants, puis des œuvres, puis des idées, puis la Beauté absolue.", bac: "Utile pour : Qu'est-ce que l'amour ? Le désir est-il manque ?", adversaire: "Schopenhauer", antithese: "Schopenhauer démystifie : l'amour romantique est une ruse de la nature pour assurer la reproduction — derrière le beau, c'est le Vouloir-vivre aveugle qui parle." },
                    { citation: "Le désir est enfant de Pénia (pauvreté) et de Poros (ressource).", oeuvre: "Le Banquet", date: "~385 av. J.-C.", explication: "Éros est né d'un père riche et d'une mère pauvre — il est donc entre manque et abondance. Le désir philosophique aspire toujours à ce qu'il n'a pas encore.", bac: "Utile pour : Le désir est-il toujours manque ? Nature du désir.", adversaire: "Spinoza", antithese: "Spinoza renverse : le désir n'est pas manque mais puissance — le conatus est l'effort positif de persévérer dans son être, pas une quête de ce qu'on n'a pas." }
                ]
            },
            {
                nom: "Art",
                citations: [
                    { citation: "Les poètes sont les interprètes des dieux, non les maîtres de la vérité.", oeuvre: "Ion / La République", date: "~380 av. J.-C.", explication: "Platon se méfie des artistes et poètes : ils imitent la réalité (qui elle-même imite les Idées). Copie de copie — l'art éloigne de la vérité.", bac: "Utile pour : L'art révèle-t-il la vérité ? Peut-on faire confiance aux artistes ?", adversaire: "Hegel", antithese: "Hegel réhabilite l'art : c'est la première manifestation sensible de l'Esprit absolu — avant la religion et la philosophie, l'art dit le vrai." }
                ]
            }
        ]
    },
    {
        id: "aristote",
        nom: "ARISTOTE",
        dates: "384 — 322 av. J.-C.",
        ecole: "Réalisme",
        emoji: "⚖️",
        couleur: "#e67e22",
        image: "PHILOSOPHES/Aristote.jpg",
        resume: "Élève de Platon. Père de la logique, de la biologie, de la politique.",
        notions: [
            {
                nom: "Bonheur",
                citations: [
                    { citation: "Le bonheur est une activité de l'âme en accord avec la vertu.", oeuvre: "Éthique à Nicomaque", date: "~335 av. J.-C.", explication: "Le bonheur (eudaimonia) n'est pas un état passif mais une activité — vivre et agir selon l'excellence propre à l'homme. Ce n'est pas le plaisir ni la richesse.", bac: "Utile pour : En quoi consiste le bonheur ? Le bonheur est-il le but de la vie ?", adversaire: "Épicure", antithese: "Épicure s'oppose : le bonheur c'est l'ataraxie (absence de trouble) — pas l'activité vertueuse mais la paix intérieure." },
                    { citation: "L'homme est un animal politique.", oeuvre: "Politique", date: "~335 av. J.-C.", explication: "L'homme est naturellement fait pour vivre en cité (polis). Seul un dieu ou une bête peut vivre sans la société. Le langage (logos) nous permet de délibérer ensemble sur le juste et l'injuste.", bac: "Utile pour : L'homme est-il naturellement social ? La politique est-elle naturelle ?", adversaire: "Rousseau", antithese: "Rousseau conteste : l'homme naturel est solitaire et bon — c'est la société qui l'a corrompu. La politisation est une dégradation, pas un accomplissement." },
                    { citation: "La vertu est un juste milieu entre deux excès.", oeuvre: "Éthique à Nicomaque", date: "~335 av. J.-C.", explication: "Le courage est le juste milieu entre la lâcheté et la témérité. La générosité entre l'avarice et la prodigalité. La vertu se trouve toujours entre deux vices opposés.", bac: "Utile pour : Qu'est-ce que la vertu ? Peut-on apprendre à être vertueux ?", adversaire: "Nietzsche", antithese: "Nietzsche critique : le juste milieu c'est la médiocrité — le surhomme dépasse les limites, il crée ses propres valeurs au-delà du bien et du mal." }
                ]
            },
            {
                nom: "Justice",
                citations: [
                    { citation: "La justice est la vertu complète envers autrui.", oeuvre: "Éthique à Nicomaque", date: "~335 av. J.-C.", explication: "Aristote distingue justice distributive (à chacun selon son mérite) et justice corrective (rétablir l'égalité rompue). La justice est l'égalité proportionnelle, pas l'égalité arithmétique.", bac: "Utile pour : Égalité et équité. La justice est-elle naturelle ?", adversaire: "Calliclès", antithese: "Calliclès réplique : la vraie justice selon la nature, c'est que le plus fort domine le plus faible — l'égalité est une invention des faibles." },
                    { citation: "L'équité est la rectification de la loi là où la loi est insuffisante.", oeuvre: "Éthique à Nicomaque", date: "~335 av. J.-C.", explication: "La loi est générale — elle ne peut pas prévoir tous les cas particuliers. L'équité corrige la loi pour rendre justice dans les situations que la loi n'a pas prévues.", bac: "Utile pour : Légalité et légitimité. La loi est-elle toujours juste ?", adversaire: "Hobbes", antithese: "Hobbes répond : la loi positive doit être appliquée strictement — laisser des juges l'interpréter ouvre la porte à l'arbitraire et au désordre." }
                ]
            },
            {
                nom: "Art & Technique",
                citations: [
                    { citation: "La technique imite la nature ou achève ce que la nature a laissé inachevé.", oeuvre: "Physique", date: "~350 av. J.-C.", explication: "La technique (technè) prolonge la nature — elle produit ce que la nature ne peut pas faire seule. C'est une forme d'intelligence pratique (poïesis).", bac: "Utile pour : La technique est-elle contre nature ? Qu'est-ce que la technique ?", adversaire: "Heidegger", antithese: "Heidegger s'oppose : la technique moderne ne prolonge pas la nature, elle la détruit — elle la transforme en fonds exploitable, perdant tout rapport authentique." },
                    { citation: "La tragédie produit par la pitié et la terreur la catharsis des passions.", oeuvre: "Poétique", date: "~335 av. J.-C.", explication: "L'art tragique purge nos émotions en les éveillant dans un cadre fictif. La catharsis = purification émotionnelle — l'art nous libère en faisant circuler nos passions.", bac: "Utile pour : À quoi sert l'art ? L'art est-il utile ?", adversaire: "Platon", antithese: "Platon rejette : l'art tragique renforce les passions au lieu de les purger — il est dangereux pour l'âme et doit être banni de la cité idéale." }
                ]
            }
        ]
    },
    {
        id: "descartes",
        nom: "DESCARTES",
        dates: "1596 — 1650",
        ecole: "Rationalisme",
        emoji: "🔭",
        couleur: "#3498db",
        image: "PHILOSOPHES/Descartes.jpg",
        resume: "Père de la philosophie moderne. Cogito, doute méthodique, dualisme.",
        notions: [
            {
                nom: "Vérité & Raison",
                citations: [
                    { citation: "Je pense, donc je suis.", oeuvre: "Discours de la méthode", date: "1637", explication: "Après le doute hyperbolique (douter de tout), seule certitude : je doute, donc je pense, donc j'existe. Le Cogito est le point de départ absolu de toute philosophie.", bac: "Utile pour : La vérité est-elle accessible ? Peut-on tout remettre en doute ?", adversaire: "Hume", antithese: "Hume critique : le 'je' qui pense n'est qu'un faisceau de perceptions, pas une substance permanente — on ne perçoit jamais un 'moi' stable, seulement des impressions." },
                    { citation: "Le bon sens est la chose du monde la mieux partagée.", oeuvre: "Discours de la méthode", date: "1637", explication: "Ouverture du Discours de la méthode — la raison est universelle et égale chez tous les hommes. La différence vient de la méthode, pas de l'intelligence naturelle.", bac: "Utile pour : La raison est-elle universelle ? Qu'est-ce que la méthode ?", adversaire: "Nietzsche", antithese: "Nietzsche ironise : ce qu'on appelle 'bon sens' n'est que la morale du troupeau — les valeurs de la majorité qui nivelent vers le bas." },
                    { citation: "Diviser chacune des difficultés en autant de parcelles qu'il se pourrait.", oeuvre: "Discours de la méthode", date: "1637", explication: "Deuxième règle de la méthode cartésienne : analyser. Décomposer les problèmes complexes en éléments simples pour les résoudre un par un.", bac: "Utile pour : Qu'est-ce que la méthode scientifique ? La raison comme outil.", adversaire: "Bergson", antithese: "Bergson s'oppose : découper la réalité en parties c'est trahir son flux continu — la durée et la vie ne se laissent pas analyser en éléments séparables." }
                ]
            },
            {
                nom: "Liberté",
                citations: [
                    { citation: "Le libre arbitre est ce qui me rend semblable à Dieu.", oeuvre: "Méditations métaphysiques", date: "1641", explication: "Pour Descartes, la volonté humaine est infinie comme celle de Dieu — c'est elle qui nous rend à l'image divine. L'erreur vient quand la volonté dépasse l'entendement.", bac: "Utile pour : Qu'est-ce que la liberté ? Libre arbitre et déterminisme.", adversaire: "Spinoza", antithese: "Spinoza réfute : les hommes se croient libres parce qu'ils ignorent les causes qui les déterminent — le libre arbitre est une illusion née de l'ignorance." },
                    { citation: "Il faut changer ses désirs plutôt que l'ordre du monde.", oeuvre: "Discours de la méthode", date: "1637", explication: "La maîtrise de soi par la raison — si on ne peut pas changer la réalité, on peut changer son rapport à elle. La liberté intérieure contre les contraintes extérieures.", bac: "Utile pour : Liberté intérieure. Peut-on être libre face au déterminisme ?", adversaire: "Marx", antithese: "Marx s'indigne : cette résignation sert les oppresseurs — les philosophes n'ont fait qu'interpréter le monde, il s'agit de le transformer." }
                ]
            },
            {
                nom: "Technique & Nature",
                citations: [
                    { citation: "Nous rendre comme maîtres et possesseurs de la nature.", oeuvre: "Discours de la méthode", date: "1637", explication: "La science et la technique permettent à l'homme de dominer la nature pour améliorer sa vie (santé, confort). C'est le programme de la modernité : progrès technique au service de l'homme.", bac: "Utile pour : La technique libère-t-elle l'homme ? Rapport homme/nature.", adversaire: "Heidegger", antithese: "Heidegger alerte : vouloir dominer la nature conduit au nihilisme technique — tout devient ressource exploitable, l'homme perd son rapport authentique au monde." }
                ]
            }
        ]
    },
    {
        id: "kant",
        nom: "KANT",
        dates: "1724 — 1804",
        ecole: "Idéalisme critique",
        emoji: "⚡",
        couleur: "#9b59b6",
        image: "PHILOSOPHES/Kant.jpg",
        resume: "La raison a des limites. Morale du devoir. Révolution copernicienne en philosophie.",
        notions: [
            {
                nom: "Morale & Devoir",
                citations: [
                    { citation: "Agis de telle sorte que ta maxime puisse être érigée en loi universelle.", oeuvre: "Fondements de la métaphysique des mœurs", date: "1785", explication: "L'impératif catégorique : avant d'agir, demande-toi si tu voudrais que tout le monde agisse comme toi. Si oui, ton action est morale. La morale est universelle et inconditionnelle.", bac: "Utile pour : Qu'est-ce que la morale ? Le devoir moral. La liberté morale.", adversaire: "Mill", antithese: "Mill (utilitarisme) s'oppose : ce qui est moral c'est ce qui produit le plus de bonheur pour le plus grand nombre — pas une règle abstraite universelle." },
                    { citation: "Agis de façon à traiter l'humanité toujours comme une fin, jamais seulement comme un moyen.", oeuvre: "Fondements de la métaphysique des mœurs", date: "1785", explication: "Deuxième formulation de l'impératif catégorique — respecter la dignité de chaque être humain. Ne jamais utiliser autrui comme simple outil.", bac: "Utile pour : Qu'est-ce que la dignité humaine ? Les droits de l'homme.", adversaire: "Machiavel", antithese: "Machiavel conteste : en politique, traiter les autres comme des moyens est parfois nécessaire pour assurer la stabilité de l'État — l'efficacité prime sur la morale." },
                    { citation: "L'autonomie est le principe de la dignité de la nature humaine.", oeuvre: "Fondements de la métaphysique des mœurs", date: "1785", explication: "L'autonomie = se donner sa propre loi (autos = soi, nomos = loi). L'homme moral obéit à la loi qu'il s'est lui-même donnée par la raison — pas aux désirs ou à l'autorité extérieure.", bac: "Utile pour : Liberté et morale. Autonomie vs hétéronomie.", adversaire: "Freud", antithese: "Freud démystifie : l'autonomie morale est une illusion — nos choix sont déterminés par l'inconscient, le Ça et le Surmoi, pas par une raison libre." }
                ]
            },
            {
                nom: "Liberté",
                citations: [
                    { citation: "La liberté est l'indépendance à l'égard de tout ce qui est empirique.", oeuvre: "Critique de la raison pratique", date: "1788", explication: "La vraie liberté n'est pas faire ce qu'on veut (arbitraire) mais obéir à la loi morale que la raison se donne à elle-même. Liberté = autonomie de la raison pratique.", bac: "Utile pour : Liberté et déterminisme. Qu'est-ce que la vraie liberté ?", adversaire: "Sartre", antithese: "Sartre nuance : la liberté n'est pas l'abstraction de la raison — elle est concrète, situationnelle, engagée dans le monde réel." },
                    { citation: "Sapere aude ! Aie le courage de te servir de ton propre entendement.", oeuvre: "Qu'est-ce que les Lumières ?", date: "1784", explication: "Devise des Lumières — Kant appelle chacun à penser par soi-même, sans tutelle. La minorité intellectuelle est une paresse et une lâcheté — l'émancipation passe par la raison.", bac: "Utile pour : Qu'est-ce que les Lumières ? La liberté de penser.", adversaire: "Nietzsche", antithese: "Nietzsche va plus loin : les Lumières ont remplacé Dieu par la Raison — une nouvelle idole. Il faut dépasser même la raison pour créer de nouvelles valeurs." }
                ]
            },
            {
                nom: "Art & Beau",
                citations: [
                    { citation: "Est beau ce qui plaît universellement sans concept.", oeuvre: "Critique de la faculté de juger", date: "1790", explication: "Le jugement esthétique est subjectif (je ressens) mais prétend à l'universalité (tous devraient ressentir). Ce n'est ni un jugement logique ni un simple goût personnel.", bac: "Utile pour : Qu'est-ce que le beau ? La beauté est-elle objective ?", adversaire: "Hume", antithese: "Hume s'oppose : la beauté n'est pas universelle — 'la beauté est dans l'œil de celui qui regarde.' Le jugement esthétique est purement subjectif et culturel." },
                    { citation: "Le sublime est ce qui est grand absolument.", oeuvre: "Critique de la faculté de juger", date: "1790", explication: "Le sublime dépasse la beauté — il nous écrase (une tempête, une montagne) mais révèle en même temps notre grandeur morale. L'homme est petit physiquement mais grand moralement.", bac: "Utile pour : Art et nature. Beau et sublime.", adversaire: "Burke", antithese: "Burke précède Kant : le sublime est lié à la terreur et à la douleur — c'est une expérience physique et émotionnelle, pas une révélation de notre grandeur morale." }
                ]
            }
        ]
    },
    {
        id: "nietzsche",
        nom: "NIETZSCHE",
        dates: "1844 — 1900",
        ecole: "Philosophie de la vie",
        emoji: "⚡",
        couleur: "#e74c3c",
        image: "PHILOSOPHES/Nietzsche.jpg",
        resume: "Dieu est mort. Volonté de puissance. Transvaluation des valeurs. Éternel retour.",
        notions: [
            {
                nom: "Vérité & Langage",
                citations: [
                    { citation: "Il n'y a pas de faits, seulement des interprétations.", oeuvre: "Fragments posthumes", date: "1886-1887", explication: "Il n'existe pas de vérité objective — toute vérité est une interprétation liée à une perspective, une volonté de puissance. Ce qu'on appelle vérité n'est qu'un point de vue parmi d'autres.", bac: "Utile pour : La vérité est-elle relative ? Vérité et perspective.", adversaire: "Descartes", antithese: "Descartes s'oppose : le Cogito est une certitude absolue — il existe au moins un fait irréfutable : je pense, donc je suis." },
                    { citation: "Les vérités sont des illusions dont on a oublié qu'elles sont des illusions.", oeuvre: "Vérité et mensonge au sens extra-moral", date: "1873", explication: "Les concepts et les vérités sont des métaphores usées — on a oublié qu'elles étaient des créations humaines. Ce qu'on prend pour réel n'est qu'une convention.", bac: "Utile pour : Langage et vérité. Les mots disent-ils la vérité ?", adversaire: "Bachelard", antithese: "Bachelard répond : la vérité scientifique n'est pas une illusion — elle se construit par ruptures épistémologiques, elle progresse réellement vers la réalité." }
                ]
            },
            {
                nom: "Morale & Valeurs",
                citations: [
                    { citation: "Dieu est mort. Et c'est nous qui l'avons tué.", oeuvre: "Le Gai Savoir", date: "1882", explication: "Ce n'est pas une déclaration d'athéisme mais un constat culturel — la modernité a détruit les fondements absolus des valeurs. Sans Dieu, les anciennes valeurs s'effondrent — il faut en créer de nouvelles.", bac: "Utile pour : La mort de Dieu et ses conséquences. Le nihilisme. Les valeurs.", adversaire: "Kierkegaard", antithese: "Kierkegaard répond par le saut dans la foi : la mort de Dieu pour la raison n'empêche pas le croyant de choisir Dieu subjectivement — la foi transcende la raison." },
                    { citation: "Deviens ce que tu es.", oeuvre: "Ainsi parlait Zarathoustra", date: "1883", explication: "Injonction du Surhomme — ne pas suivre les valeurs du troupeau mais créer ses propres valeurs en accord avec sa nature profonde. L'auto-dépassement perpétuel.", bac: "Utile pour : La liberté de créer ses valeurs. Le dépassement de soi.", adversaire: "Kant", antithese: "Kant s'oppose : on ne devient pas ce qu'on est — on choisit d'obéir à la loi morale universelle, indépendamment de sa nature particulière." }
                ]
            },
            {
                nom: "Art",
                citations: [
                    { citation: "L'art est la grande tâche et la véritable activité métaphysique de cette vie.", oeuvre: "La Naissance de la tragédie", date: "1872", explication: "L'art est supérieur à la science et à la morale — il affirme la vie dans toute sa puissance, y compris la souffrance. C'est par l'art que l'homme supporte et célèbre l'existence.", bac: "Utile pour : Quelle est la valeur de l'art ? Art et vérité.", adversaire: "Platon", antithese: "Platon s'oppose : l'art est au contraire ce qui nous éloigne de la vérité — imitation de l'imitation, il nourrit les parties inférieures de l'âme." },
                    { citation: "Nous avons l'art pour ne pas mourir de la vérité.", oeuvre: "Fragments posthumes", date: "1888", explication: "La vérité nue sur l'existence (sa violence, son absurdité) serait insupportable. L'art nous permet de la regarder en face sans être détruits — il transfigure la réalité.", bac: "Utile pour : L'art comme nécessité vitale. Art et illusion.", adversaire: "Hegel", antithese: "Hegel répond : l'art ne cache pas la vérité, il la révèle — c'est la première manifestation sensible de l'Esprit absolu, pas un voile sur le réel." }
                ]
            }
        ]
    },
    {
        id: "sartre",
        nom: "SARTRE",
        dates: "1905 — 1980",
        ecole: "Existentialisme",
        emoji: "✊",
        couleur: "#1abc9c",
        image: "PHILOSOPHES/Sartre.jpg",
        resume: "L'existence précède l'essence. Liberté absolue. Responsabilité totale.",
        notions: [
            {
                nom: "Liberté & Existence",
                citations: [
                    { citation: "L'existence précède l'essence.", oeuvre: "L'Existentialisme est un humanisme", date: "1946", explication: "Contrairement aux choses (une table est conçue avant d'exister), l'homme existe d'abord puis se définit par ses choix. Il n'y a pas de nature humaine fixée — on se crée.", bac: "Utile pour : Qu'est-ce que la liberté ? Y a-t-il une nature humaine ?", adversaire: "Aristote", antithese: "Aristote s'oppose : chaque être a une nature (essence) qui précède et détermine son existence — le gland est déjà chêne en puissance avant de pousser." },
                    { citation: "L'homme est condamné à être libre.", oeuvre: "L'Être et le Néant", date: "1943", explication: "On ne choisit pas d'être libre — on l'est nécessairement. Même ne pas choisir est un choix. La liberté est un fardeau car elle implique une responsabilité totale.", bac: "Utile pour : Liberté et responsabilité. Peut-on fuir sa liberté ?", adversaire: "Freud", antithese: "Freud conteste : l'homme est déterminé par son inconscient — ses choix sont commandés par des forces psychiques qu'il ne contrôle pas." },
                    { citation: "Je suis mes choix.", oeuvre: "L'Être et le Néant", date: "1943", explication: "L'homme se définit entièrement par ses actes et ses choix — pas par ses intentions, ses rêves ou sa nature. On n'est pas ce qu'on pense être mais ce qu'on fait.", bac: "Utile pour : Liberté et acte. L'identité personnelle.", adversaire: "Marx", antithese: "Marx répond : nos choix sont déterminés par nos conditions matérielles — ce n'est pas la conscience qui détermine la vie, c'est la vie qui détermine la conscience." }
                ]
            },
            {
                nom: "Autrui",
                citations: [
                    { citation: "L'enfer c'est les autres.", oeuvre: "Huis Clos", date: "1944", explication: "Non pas que les autres sont mauvais, mais que leur regard nous fige dans une image de nous-mêmes dont on ne peut pas s'échapper. Autrui me transforme en objet par son regard.", bac: "Utile pour : Autrui comme obstacle. Le regard d'autrui. Liberté et société.", adversaire: "Hegel", antithese: "Hegel s'oppose : autrui est indispensable — la conscience de soi ne peut naître que dans le regard de l'autre. Sans autrui, pas de conscience de moi-même." },
                    { citation: "Autrui est le médiateur indispensable entre moi et moi-même.", oeuvre: "L'Être et le Néant", date: "1943", explication: "Paradoxe : autrui m'oppresse (regard) mais il est aussi nécessaire pour que je me découvre. Je ne peux me connaître qu'à travers le regard de l'autre.", bac: "Utile pour : Autrui comme nécessité. Conscience de soi.", adversaire: "Descartes", antithese: "Descartes n'a pas besoin d'autrui pour se connaître — le Cogito est une certitude solitaire. Je pense, donc je suis : la certitude de soi est intérieure." }
                ]
            },
            {
                nom: "Mauvaise foi",
                citations: [
                    { citation: "La mauvaise foi est une tentative de fuir la liberté.", oeuvre: "L'Être et le Néant", date: "1943", explication: "Se dire 'je n'ai pas le choix', 'c'est comme ça', 'je suis comme ça' — c'est de la mauvaise foi. On ment à soi-même pour éviter l'angoisse de la liberté et de la responsabilité.", bac: "Utile pour : Liberté et responsabilité. L'inconscient existe-t-il ?", adversaire: "Freud", antithese: "Freud répond : ce que Sartre appelle 'mauvaise foi' est en réalité le travail de l'inconscient — on ne fuit pas sa liberté, on est sincèrement ignorant de ses vraies motivations." }
                ]
            }
        ]
    },
    {
        id: "rousseau",
        nom: "ROUSSEAU",
        dates: "1712 — 1778",
        ecole: "Philosophie politique",
        emoji: "🌿",
        couleur: "#27ae60",
        image: "PHILOSOPHES/Rousseau.jpg",
        resume: "L'homme est naturellement bon. La société corrompt. Contrat social.",
        notions: [
            {
                nom: "Nature & Société",
                citations: [
                    { citation: "L'homme est né libre, et partout il est dans les fers.", oeuvre: "Du Contrat social", date: "1762", explication: "Ouverture du Contrat social — l'homme naturel est libre, mais la société l'a enchaîné. Ces chaînes peuvent devenir légitimes si elles reposent sur un contrat librement consenti.", bac: "Utile pour : L'homme est-il naturellement libre ? État de nature et société.", adversaire: "Hobbes", antithese: "Hobbes s'oppose : à l'état de nature, l'homme n'est pas libre mais en guerre permanente — c'est la société et l'État qui apportent la paix et la vraie liberté." },
                    { citation: "L'homme naturel est bon — c'est la société qui le corrompt.", oeuvre: "Discours sur l'inégalité", date: "1755", explication: "Contre Hobbes : l'état de nature n'est pas la guerre mais la paix. La propriété, les inégalités, la vanité — tout ce qui corrompt l'homme vient de la société.", bac: "Utile pour : L'homme est-il bon par nature ? Société et corruption.", adversaire: "Hobbes", antithese: "Hobbes affirme l'inverse : l'homme naturel est un loup (Homo homini lupus) — violent et égoïste. La société n'est pas ce qui corrompt mais ce qui civilise." }
                ]
            },
            {
                nom: "Politique & Justice",
                citations: [
                    { citation: "La volonté générale est toujours droite et tend toujours à l'utilité publique.", oeuvre: "Du Contrat social", date: "1762", explication: "La volonté générale (ce qui est bon pour tous) diffère de la volonté de tous (somme des intérêts particuliers). Le souverain légitime exprime la volonté générale — base de la démocratie.", bac: "Utile pour : Qu'est-ce que la démocratie ? Volonté générale et loi.", adversaire: "Tocqueville", antithese: "Tocqueville alerte : la volonté générale peut devenir tyrannie de la majorité — une démocratie peut opprimer les minorités au nom du bien commun." },
                    { citation: "Nos âmes se sont corrompues à mesure que nos sciences et nos arts se sont perfectionnés.", oeuvre: "Discours sur les sciences et les arts", date: "1750", explication: "Premier Discours (1750) — le progrès des arts et sciences n'a pas rendu les hommes meilleurs moralement. La civilisation corrompt plus qu'elle n'élève.", bac: "Utile pour : Le progrès est-il un bien ? Sciences, arts et morale.", adversaire: "Condorcet", antithese: "Condorcet s'oppose : le progrès des sciences et des arts est indissociable du progrès moral — les Lumières élèvent l'homme en même temps qu'elles l'instruisent." }
                ]
            }
        ]
    },
    {
        id: "marx",
        nom: "MARX",
        dates: "1818 — 1883",
        ecole: "Matérialisme historique",
        emoji: "✊",
        couleur: "#c0392b",
        image: "PHILOSOPHES/Marx.jpg",
        resume: "Lutte des classes. Aliénation. Matérialisme historique. Communisme.",
        notions: [
            {
                nom: "Travail & Aliénation",
                citations: [
                    { citation: "Ce n'est pas la conscience qui détermine la vie, c'est la vie qui détermine la conscience.", oeuvre: "L'Idéologie allemande", date: "1846", explication: "Contre l'idéalisme — ce ne sont pas les idées qui font l'histoire mais les conditions matérielles (économie, modes de production). La conscience est un reflet de la base économique.", bac: "Utile pour : Conscience et société. Le travail forme-t-il l'homme ?", adversaire: "Hegel", antithese: "Hegel s'oppose (Marx le renverse) : c'est l'Esprit (la conscience) qui détermine la réalité matérielle — Marx 'remet Hegel sur ses pieds'." },
                    { citation: "Le travail aliéné arrache à l'homme l'objet de sa production.", oeuvre: "Manuscrits de 1844", date: "1844", explication: "Dans le capitalisme, l'ouvrier ne possède pas ce qu'il produit — le produit lui devient étranger. Il s'aliène dans le travail au lieu de s'y réaliser.", bac: "Utile pour : Le travail libère-t-il ? Aliénation et émancipation.", adversaire: "Hegel", antithese: "Hegel valorise le travail : c'est par lui que l'esclave se libère et développe sa conscience — le travail est humanisation, pas aliénation." },
                    { citation: "Les philosophes n'ont fait qu'interpréter le monde — il s'agit de le transformer.", oeuvre: "Thèses sur Feuerbach", date: "1845", explication: "11e thèse sur Feuerbach — la philosophie doit être pratique et révolutionnaire. La théorie sans pratique est vide.", bac: "Utile pour : À quoi sert la philosophie ? Théorie et pratique.", adversaire: "Platon", antithese: "Platon répond : la contemplation philosophique est la forme la plus haute d'existence — transformer le monde sans le comprendre conduit au chaos." }
                ]
            },
            {
                nom: "Société & Histoire",
                citations: [
                    { citation: "L'histoire de toute société jusqu'à nos jours est l'histoire de la lutte des classes.", oeuvre: "Manifeste du Parti communiste", date: "1848", explication: "Ouverture du Manifeste — toute l'histoire humaine est structurée par le conflit entre classes (maîtres/esclaves, seigneurs/serfs, bourgeois/prolétaires).", bac: "Utile pour : Qu'est-ce qui fait l'histoire ? Justice sociale.", adversaire: "Hegel", antithese: "Hegel voit l'histoire différemment : c'est le déploiement de l'Esprit vers la liberté — pas une lutte de classes mais une dialectique de la conscience." },
                    { citation: "La religion est l'opium du peuple.", oeuvre: "Contribution à la critique de la philosophie du droit de Hegel", date: "1844", explication: "La religion console les opprimés de leur misère réelle en promettant une récompense dans l'au-delà — elle détourne de la révolution. C'est une idéologie de domination.", bac: "Utile pour : Religion et politique. La religion est-elle aliénante ?", adversaire: "Tocqueville", antithese: "Tocqueville s'oppose : la religion est essentielle à la démocratie — elle fournit des valeurs morales communes et empêche le despotisme de la majorité." }
                ]
            }
        ]
    },

    {
        id: "hegel",
        nom: "HEGEL",
        dates: "1770 — 1831",
        ecole: "Idéalisme absolu",
        emoji: "🌀",
        couleur: "#8e44ad",
        image: "PHILOSOPHES/Hegel.jpg",
        resume: "La réalité est un processus dialectique. L'Esprit absolu se réalise dans l'Histoire.",
        notions: [
            {
                nom: "Histoire & Dialectique",
                citations: [
                    { citation: "Tout ce qui est réel est rationnel, tout ce qui est rationnel est réel.", oeuvre: "Principes de la philosophie du droit", date: "1820", explication: "La réalité n'est pas chaotique — elle suit une logique. L'Histoire a un sens : le déploiement de la Raison (l'Esprit) vers la liberté. Ce qui existe a une raison d'être.", bac: "Utile pour : L'histoire a-t-elle un sens ? La raison dans l'histoire.", adversaire: "Schopenhauer", antithese: "Schopenhauer s'indigne : la réalité est dominée par le Vouloir-vivre aveugle et irrationnel — croire que le réel est rationnel est une illusion consolatrice." },
                    { citation: "L'histoire universelle est le progrès de la conscience de la liberté.", oeuvre: "Leçons sur la philosophie de l'histoire", date: "1837", explication: "L'Histoire n'est pas une série d'événements aléatoires — c'est le chemin par lequel l'Esprit prend conscience de lui-même et de sa liberté. Chaque époque est une étape nécessaire.", bac: "Utile pour : Le sens de l'histoire. Liberté et histoire.", adversaire: "Nietzsche", antithese: "Nietzsche refuse : l'histoire n'a pas de sens téléologique — elle est éternel retour, répétition. L'idée de progrès est un mensonge." }
                ]
            },
            {
                nom: "Autrui & Reconnaissance",
                citations: [
                    { citation: "La conscience de soi n'existe qu'en étant reconnue.", oeuvre: "Phénoménologie de l'Esprit", date: "1807", explication: "La dialectique du maître et de l'esclave : je ne peux prendre conscience de moi qu'en m'opposant à une autre conscience. Autrui est nécessaire à ma propre identité.", bac: "Utile pour : Autrui est-il nécessaire ? La conscience de soi.", adversaire: "Descartes", antithese: "Descartes s'oppose : la conscience de soi est solitaire et immédiate — le Cogito ne nécessite pas l'autre, c'est une certitude intérieure." },
                    { citation: "Le maître dépend de l'esclave pour sa reconnaissance.", oeuvre: "Phénoménologie de l'Esprit", date: "1807", explication: "Paradoxe : le maître qui veut être reconnu ne peut l'être que par l'esclave qu'il méprise. C'est l'esclave qui, par le travail, se libère et devient maître de la nature.", bac: "Utile pour : Travail et liberté. La reconnaissance.", adversaire: "Nietzsche", antithese: "Nietzsche interprète différemment : la morale de l'esclave est un ressentiment — l'esclave se venge symboliquement en inversant les valeurs du maître." }
                ]
            },
            {
                nom: "Art",
                citations: [
                    { citation: "L'art est la manifestation sensible de l'Idée.", oeuvre: "Cours d'esthétique", date: "1835", explication: "L'art exprime l'Absolu sous forme sensible — avant la religion (représentation) et la philosophie (concept). C'est la première forme par laquelle l'Esprit se manifeste.", bac: "Utile pour : Qu'est-ce que l'art ? Art et vérité.", adversaire: "Nietzsche", antithese: "Nietzsche s'oppose : l'art n'exprime pas l'Idée — il est affirmation de la vie dans sa puissance brute, tension entre Apollon et Dionysos." }
                ]
            }
        ]
    },
    {
        id: "spinoza",
        nom: "SPINOZA",
        dates: "1632 — 1677",
        ecole: "Rationalisme",
        emoji: "♾️",
        couleur: "#16a085",
        image: "PHILOSOPHES/Spinoza.jpg",
        resume: "Dieu = Nature. Le désir est l'essence de l'homme. La liberté par la connaissance.",
        notions: [
            {
                nom: "Liberté & Déterminisme",
                citations: [
                    { citation: "Les hommes se croient libres parce qu'ils ignorent les causes qui les déterminent.", oeuvre: "Éthique", date: "1677", explication: "La liberté est une illusion née de l'ignorance. Tout est déterminé par des causes nécessaires. La vraie liberté n'est pas l'absence de causes mais la compréhension de ces causes.", bac: "Utile pour : Libre arbitre et déterminisme. La liberté est-elle illusion ?", adversaire: "Descartes", antithese: "Descartes s'oppose : le libre arbitre est réel — c'est la faculté de la volonté qui dépasse l'entendement et nous rend semblables à Dieu." },
                    { citation: "La liberté est une nécessité comprise.", oeuvre: "Éthique", date: "1677", explication: "L'homme libre n'échappe pas au déterminisme — il agit selon sa propre nature profonde, guidé par la raison. Être libre = être cause de soi-même (causa sui).", bac: "Utile pour : Qu'est-ce que la liberté ? Liberté et nécessité.", adversaire: "Sartre", antithese: "Sartre s'oppose : la liberté n'est pas la compréhension du déterminisme — elle est radicale, inconditionnelle. L'homme est condamné à être libre." }
                ]
            },
            {
                nom: "Désir & Bonheur",
                citations: [
                    { citation: "Le désir est l'essence même de l'homme.", oeuvre: "Éthique", date: "1677", explication: "Le conatus — l'effort pour persévérer dans son être — est le fondement de toute vie psychique. Le désir n'est pas un manque (Platon) mais une puissance positive et vitale.", bac: "Utile pour : Le désir est-il manque ou puissance ? Nature du désir.", adversaire: "Platon", antithese: "Platon s'oppose : le désir est source de trouble — la sagesse consiste à le maîtriser par la raison. Le désir nous éloigne des Idées pures." },
                    { citation: "La béatitude n'est pas la récompense de la vertu — elle est la vertu elle-même.", oeuvre: "Éthique", date: "1677", explication: "Le bonheur ne vient pas après l'effort moral — il EST l'effort moral. Vivre selon la raison et comprendre le monde EST la joie, pas un moyen pour l'atteindre.", bac: "Utile pour : Vertu et bonheur. En quoi consiste la vie heureuse ?", adversaire: "Kant", antithese: "Kant sépare bonheur et vertu : la morale ne vise pas le bonheur — on doit agir par devoir, que cela rende heureux ou non." }
                ]
            },
            {
                nom: "Religion & Dieu",
                citations: [
                    { citation: "Dieu, c'est-à-dire la Nature.", oeuvre: "Éthique", date: "1677", explication: "Deus sive Natura — Dieu et la Nature sont une seule et même substance infinie. Pas un Dieu personnel qui intervient — mais la totalité de ce qui existe, régi par des lois nécessaires.", bac: "Utile pour : Existence de Dieu. Religion et raison.", adversaire: "Descartes", antithese: "Descartes maintient la distinction : Dieu est une substance infinie créatrice, la Nature est une substance étendue créée — ils ne sont pas identiques." }
                ]
            }
        ]
    },
    {
        id: "freud",
        nom: "FREUD",
        dates: "1856 — 1939",
        ecole: "Psychanalyse",
        emoji: "🧠",
        couleur: "#2980b9",
        image: "PHILOSOPHES/Freud.jpg",
        resume: "L'inconscient gouverne l'homme. Le Moi n'est pas maître chez lui. Pulsions et refoulement.",
        notions: [
            {
                nom: "Inconscient & Conscience",
                citations: [
                    { citation: "Le moi n'est pas maître dans sa propre maison.", oeuvre: "Introduction à la psychanalyse", date: "1917", explication: "La psychanalyse a montré que la conscience n'est que la partie émergée de l'iceberg. L'inconscient — avec ses désirs refoulés, ses pulsions — gouverne nos actes à notre insu.", bac: "Utile pour : La conscience est-elle maîtresse d'elle-même ? L'inconscient existe-t-il ?", adversaire: "Sartre", antithese: "Sartre s'oppose : l'inconscient est une 'mauvaise foi' — une façon de fuir sa responsabilité. L'homme est toujours conscient de ses actes au fond." },
                    { citation: "Les rêves sont la voie royale vers l'inconscient.", oeuvre: "L'Interprétation des rêves", date: "1900", explication: "Pendant le sommeil, la censure se relâche et les désirs refoulés s'expriment de façon déguisée. Analyser les rêves permet d'accéder à l'inconscient.", bac: "Utile pour : Conscience et inconscient. La connaissance de soi.", adversaire: "Popper", antithese: "Popper critique : la psychanalyse n'est pas une science — elle ne peut pas être réfutée. L'interprétation des rêves est une herméneutique, pas une vérité." }
                ]
            },
            {
                nom: "Désir & Pulsions",
                citations: [
                    { citation: "L'homme n'est pas maître de ses désirs — il en est l'esclave.", oeuvre: "Introduction à la psychanalyse", date: "1917", explication: "Le Ça (réservoir des pulsions) agit en dehors de notre contrôle conscient. Nos choix, nos actes, nos erreurs sont souvent commandés par des forces psychiques que nous ne connaissons pas.", bac: "Utile pour : La liberté humaine. Le désir nous domine-t-il ?", adversaire: "Épictète", antithese: "Épictète s'oppose : il ne dépend que de nous de maîtriser nos représentations et désirs — la liberté intérieure est toujours possible par la raison." },
                    { citation: "Là où était le Ça, le Moi doit advenir.", oeuvre: "Nouvelles conférences de psychanalyse", date: "1933", explication: "But de la psychanalyse : élargir la conscience aux dépens de l'inconscient. Pas supprimer le Ça mais le comprendre pour ne plus en être l'esclave aveugle.", bac: "Utile pour : La liberté par la connaissance de soi. Psychanalyse et liberté.", adversaire: "Nietzsche", antithese: "Nietzsche s'oppose à la domestication des pulsions : le Ça (les instincts vitaux) est la source de la créativité — le réprimer c'est appauvrir la vie." }
                ]
            },
            {
                nom: "Société & Civilisation",
                citations: [
                    { citation: "La civilisation est construite sur le renoncement aux pulsions.", oeuvre: "Malaise dans la civilisation", date: "1930", explication: "Pour vivre ensemble, les hommes doivent renoncer à la satisfaction immédiate de leurs pulsions (violence, sexualité). La culture naît de ce refoulement — mais génère aussi névrose et malaise.", bac: "Utile pour : Nature et culture. La société réprime-t-elle l'homme ?", adversaire: "Rousseau", antithese: "Rousseau s'oppose : c'est la civilisation qui corrompt, pas la nature — la répression des instincts naturels crée le malheur, pas la culture." }
                ]
            }
        ]
    },
    {
        id: "hume",
        nom: "HUME",
        dates: "1711 — 1776",
        ecole: "Empirisme",
        emoji: "🔬",
        couleur: "#d35400",
        image: "PHILOSOPHES/Hume.jpg",
        resume: "Toute connaissance vient de l'expérience. La raison est esclave des passions. Scepticisme.",
        notions: [
            {
                nom: "Connaissance & Vérité",
                citations: [
                    { citation: "La raison est et ne peut qu'être l'esclave des passions.", oeuvre: "Traité de la nature humaine", date: "1739", explication: "Contre le rationalisme — la raison seule ne motive aucune action. Ce sont les passions et les désirs qui nous poussent à agir. La raison ne fait que trouver les moyens d'atteindre nos fins.", bac: "Utile pour : Raison et passion. La raison gouverne-t-elle nos actions ?", adversaire: "Kant", antithese: "Kant s'oppose radicalement : la raison pratique est autonome et commande les passions — la morale naît de la raison pure, pas des désirs." },
                    { citation: "Nos certitudes ne sont que des habitudes mentales.", oeuvre: "Traité de la nature humaine", date: "1739", explication: "On croit que le soleil se lèvera demain parce qu'il l'a toujours fait — mais c'est une habitude, pas une nécessité logique. L'induction ne peut jamais produire une certitude absolue.", bac: "Utile pour : La vérité est-elle certaine ? Connaissance et expérience.", adversaire: "Descartes", antithese: "Descartes s'oppose : le Cogito est une certitude absolue qui ne repose pas sur l'habitude mais sur l'intuition intellectuelle pure." }
                ]
            },
            {
                nom: "Causalité & Expérience",
                citations: [
                    { citation: "La causalité n'est qu'une habitude de l'esprit.", oeuvre: "Traité de la nature humaine", date: "1739", explication: "On ne perçoit jamais directement la nécessité entre cause et effet — on voit A suivi de B, et on crée mentalement un lien nécessaire. C'est une projection de l'esprit, pas une réalité objective.", bac: "Utile pour : Qu'est-ce que la science ? La causalité existe-t-elle vraiment ?", adversaire: "Kant", antithese: "Kant répond : la causalité est une catégorie a priori de l'entendement — elle structure nécessairement toute expérience possible, pas une simple habitude." },
                    { citation: "Toute connaissance dérive de l'expérience sensible.", oeuvre: "Traité de la nature humaine", date: "1739", explication: "L'empirisme radical : à la naissance, l'esprit est une table rase. Toutes nos idées viennent des impressions sensibles. Pas d'idées innées, pas de connaissance a priori.", bac: "Utile pour : Origine de la connaissance. Empirisme vs rationalisme.", adversaire: "Descartes", antithese: "Descartes s'oppose : certaines idées sont innées (Dieu, l'étendue, la pensée) — la raison peut connaître sans recourir à l'expérience." }
                ]
            }
        ]
    },
    {
        id: "epicure",
        nom: "ÉPICURE",
        dates: "341 — 270 av. J.-C.",
        ecole: "Épicurisme",
        emoji: "🌸",
        couleur: "#27ae60",
        image: "PHILOSOPHES/Epicure.jpg",
        resume: "Le bonheur est l'absence de douleur. Maîtriser ses désirs pour atteindre l'ataraxie.",
        notions: [
            {
                nom: "Bonheur & Plaisir",
                citations: [
                    { citation: "Le plaisir est le commencement et la fin de la vie heureuse.", oeuvre: "Lettre à Ménécée", date: "~300 av. J.-C.", explication: "Le bonheur est hédoniste — mais Épicure distingue les plaisirs en mouvement (actifs, instables) et les plaisirs en repos (ataraxie = absence de trouble). Le vrai bonheur est la paix de l'âme.", bac: "Utile pour : En quoi consiste le bonheur ? Le plaisir mène-t-il au bonheur ?", adversaire: "Kant", antithese: "Kant s'oppose : le bonheur ne peut pas être le fondement de la morale — seul le devoir accompli pour lui-même a une valeur morale." },
                    { citation: "Il est impossible de vivre heureux sans vivre sagement, honnêtement et justement.", oeuvre: "Maximes capitales", date: "~300 av. J.-C.", explication: "Le bonheur épicurien n'est pas le libertinage — il faut la sagesse, l'amitié et la vertu. L'excès de plaisir mène à la souffrance.", bac: "Utile pour : Bonheur et vertu. La sagesse est-elle condition du bonheur ?", adversaire: "Calliclès", antithese: "Calliclès s'oppose : le bonheur c'est satisfaire tous ses désirs sans limite — la sagesse et la justice sont des inventions des faibles." }
                ]
            },
            {
                nom: "Désir & Sagesse",
                citations: [
                    { citation: "Parmi les désirs, certains sont naturels et nécessaires, d'autres naturels et non nécessaires, d'autres vains.", oeuvre: "Lettre à Ménécée", date: "~300 av. J.-C.", explication: "Classification des désirs : naturels/nécessaires (manger, dormir) → à satisfaire. Naturels/non nécessaires (luxe) → à maîtriser. Vains (gloire, richesse) → à supprimer. La sagesse est dans ce tri.", bac: "Utile pour : Faut-il satisfaire tous ses désirs ? Désir et bonheur.", adversaire: "Nietzsche", antithese: "Nietzsche s'oppose : classifier et limiter ses désirs c'est nier la vie — il faut au contraire les affirmer tous dans leur puissance." },
                    { citation: "La mort n'est rien pour nous.", oeuvre: "Lettre à Ménécée", date: "~300 av. J.-C.", explication: "Quand nous sommes, la mort n'est pas là. Quand la mort est là, nous ne sommes plus. La peur de la mort est irrationnelle — elle ne nous concerne pas directement.", bac: "Utile pour : La mort est-elle un mal ? L'angoisse de la mort.", adversaire: "Heidegger", antithese: "Heidegger s'oppose : la mort est ce qui donne sens à l'existence — l'être-vers-la-mort est la structure fondamentale du Dasein, pas quelque chose à ignorer." }
                ]
            }
        ]
    },
    {
        id: "schopenhauer",
        nom: "SCHOPENHAUER",
        dates: "1788 — 1860",
        ecole: "Pessimisme",
        emoji: "🌑",
        couleur: "#7f8c8d",
        image: "PHILOSOPHES/Schopenhauer.jpg",
        resume: "Le Vouloir-vivre est source de souffrance. L'art et l'ascèse comme voies de libération.",
        notions: [
            {
                nom: "Désir & Souffrance",
                citations: [
                    { citation: "La vie oscille comme un pendule entre la souffrance et l'ennui.", oeuvre: "Le Monde comme volonté et comme représentation", date: "1818", explication: "Quand on désire, on souffre du manque. Quand on obtient, on s'ennuie. Il n'y a pas d'issue dans la satisfaction des désirs — le Vouloir-vivre est insatiable.", bac: "Utile pour : Le désir mène-t-il au bonheur ? La souffrance est-elle inévitable ?", adversaire: "Aristote", antithese: "Aristote s'oppose : le bonheur est possible — c'est l'activité de l'âme en accord avec la vertu. La vie n'est pas condamnée à osciller entre deux maux." },
                    { citation: "Tout désir naît d'un manque, d'un état qui nous fait souffrir.", oeuvre: "Le Monde comme volonté et comme représentation", date: "1818", explication: "Le désir est par nature douloureux — il naît d'une privation. La satisfaction n'apporte qu'un soulagement momentané avant qu'un nouveau désir ne surgisse.", bac: "Utile pour : Nature du désir. Peut-on être heureux ?", adversaire: "Spinoza", antithese: "Spinoza s'oppose : le désir (conatus) n'est pas manque mais puissance — c'est l'effort positif de persévérer dans son être, source de joie." }
                ]
            },
            {
                nom: "Art & Libération",
                citations: [
                    { citation: "L'art nous libère momentanément de la servitude du vouloir.", oeuvre: "Le Monde comme volonté et comme représentation", date: "1818", explication: "Dans la contemplation esthétique, le sujet oublie ses désirs et souffrances — il devient pur sujet connaissant. C'est un repos temporaire du Vouloir-vivre. La musique est l'art suprême.", bac: "Utile pour : Valeur de l'art. L'art nous libère-t-il ?", adversaire: "Nietzsche", antithese: "Nietzsche s'oppose : l'art n'est pas une fuite du Vouloir-vivre — il en est l'affirmation la plus haute. L'art dit oui à la vie dans toute sa puissance." },
                    { citation: "La musique est la copie directe de la Volonté elle-même.", oeuvre: "Le Monde comme volonté et comme représentation", date: "1818", explication: "Contrairement aux autres arts qui représentent des idées, la musique exprime directement le Vouloir-vivre — ses tensions, ses apaisements, ses élans. C'est pourquoi elle nous touche si profondément.", bac: "Utile pour : Spécificité de la musique. Art et émotion.", adversaire: "Hegel", antithese: "Hegel s'oppose : la musique exprime le mouvement de l'âme subjective — elle ne touche pas directement la Volonté métaphysique mais les états intérieurs." }
                ]
            }
        ]
    },
    {
        id: "bergson",
        nom: "BERGSON",
        dates: "1859 — 1941",
        ecole: "Philosophie de la vie",
        emoji: "⏳",
        couleur: "#1abc9c",
        image: "PHILOSOPHES/Bergson.jpg",
        resume: "La durée, l'intuition, l'élan vital. Le temps vécu contre le temps des horloges.",
        notions: [
            {
                nom: "Temps & Durée",
                citations: [
                    { citation: "Le temps est invention ou il n'est rien du tout.", oeuvre: "L'Évolution créatrice", date: "1907", explication: "Le vrai temps n'est pas le temps des horloges (quantitatif, homogène) mais la durée — le flux continu de la conscience. Chaque moment est création, nouveauté irréductible.", bac: "Utile pour : Qu'est-ce que le temps ? Temps objectif et temps vécu.", adversaire: "Aristote", antithese: "Aristote s'oppose : le temps est la mesure du mouvement selon l'avant et l'après — c'est une réalité objective qui existe indépendamment de la conscience." },
                    { citation: "La durée est le tissu même de notre vie intérieure.", oeuvre: "Essai sur les données immédiates de la conscience", date: "1889", explication: "Notre vie psychique est un flux continu — nos états se fondent les uns dans les autres. On ne peut pas les découper en moments séparés sans trahir la réalité de la conscience.", bac: "Utile pour : Conscience et temps. La mémoire.", adversaire: "Descartes", antithese: "Descartes s'oppose : la vie intérieure c'est la pensée claire et distincte — pas un flux continu mais des idées précises et analysables." }
                ]
            },
            {
                nom: "Langage & Intuition",
                citations: [
                    { citation: "Le langage échoue à saisir la singularité de chaque expérience.", oeuvre: "Essai sur les données immédiates de la conscience", date: "1889", explication: "Les mots sont des étiquettes générales — ils ratent ce qui est unique et vivant dans chaque expérience. Le langage adapté à l'action pratique est inadapté à saisir la vérité de la vie intérieure.", bac: "Utile pour : Langage et vérité. L'ineffable. Limites du langage.", adversaire: "Wittgenstein", antithese: "Wittgenstein s'oppose : les limites de mon langage sont les limites de mon monde — ce qui ne peut pas être dit n'existe pas pour la pensée." },
                    { citation: "L'artiste est celui qui voit plus que nous, parce qu'il regarde la réalité directement.", oeuvre: "Le Rire", date: "1900", explication: "Nous percevons le monde à travers le voile de l'habitude et du langage. L'artiste enlève ce voile et nous fait voir les choses telles qu'elles sont vraiment.", bac: "Utile pour : Rôle de l'art. L'art révèle-t-il la réalité ?", adversaire: "Platon", antithese: "Platon s'oppose : l'artiste ne voit pas la réalité directement — il imite les apparences, s'éloignant encore plus des Idées pures." }
                ]
            },
            {
                nom: "Liberté & Déterminisme",
                citations: [
                    { citation: "Nous sommes libres quand nos actes émanent de notre personnalité entière.", oeuvre: "Essai sur les données immédiates de la conscience", date: "1889", explication: "La vraie liberté n'est pas le libre arbitre abstrait — c'est quand l'acte exprime toute notre personnalité profonde, notre durée intérieure. L'acte libre est créateur.", bac: "Utile pour : Qu'est-ce que la liberté ? Liberté et déterminisme.", adversaire: "Kant", antithese: "Kant s'oppose : la liberté n'est pas l'expression de sa personnalité — c'est l'obéissance à la loi morale universelle, indépendante de nos désirs particuliers." }
                ]
            }
        ]
    },
    {
        id: "camus",
        nom: "CAMUS",
        dates: "1913 — 1960",
        ecole: "Philosophie de l'absurde",
        emoji: "🌊",
        couleur: "#e74c3c",
        image: "PHILOSOPHES/Camus.jpg",
        resume: "L'absurde naît du silence du monde. La révolte comme réponse. Il faut imaginer Sisyphe heureux.",
        notions: [
            {
                nom: "Absurde & Existence",
                citations: [
                    { citation: "Il n'y a qu'un problème philosophique vraiment sérieux : c'est le suicide.", oeuvre: "Le Mythe de Sisyphe", date: "1942", explication: "Face à l'absurde (la confrontation entre notre besoin de sens et le silence du monde), la question fondamentale est : vaut-il la peine de vivre ? La réponse de Camus est oui — par la révolte.", bac: "Utile pour : Le sens de la vie. L'absurde. Peut-on vivre sans espoir ?", adversaire: "Sartre", antithese: "Sartre s'oppose : le vrai problème n'est pas de mourir mais d'agir — l'homme est condamné à être libre et à choisir comment il vit." },
                    { citation: "L'absurde naît de la confrontation entre l'appel humain et le silence déraisonnable du monde.", oeuvre: "Le Mythe de Sisyphe", date: "1942", explication: "L'absurde n'est ni dans l'homme ni dans le monde — il naît de leur confrontation. L'homme cherche un sens, le monde est muet. C'est de ce divorce que naît l'absurde.", bac: "Utile pour : L'absurde. Le sens de la vie. Bonheur et absurde.", adversaire: "Hegel", antithese: "Hegel s'oppose : le monde n'est pas silencieux — il est rationnel. 'Tout ce qui est réel est rationnel.' L'absurde n'existe pas pour qui comprend la dialectique." }
                ]
            },
            {
                nom: "Révolte & Liberté",
                citations: [
                    { citation: "Il faut imaginer Sisyphe heureux.", oeuvre: "Le Mythe de Sisyphe", date: "1942", explication: "Sisyphe, condamné à rouler éternellement son rocher, est l'image de l'homme absurde. Mais il peut être heureux s'il assume lucidement sa condition sans espoir ni désespoir — la révolte comme dignité.", bac: "Utile pour : Bonheur et condition humaine. La révolte face à l'absurde.", adversaire: "Schopenhauer", antithese: "Schopenhauer s'oppose : Sisyphe est l'image parfaite de la condition humaine — mais on ne peut pas être heureux dans cet esclavage. Seule la négation du vouloir libère." },
                    { citation: "Je me révolte, donc nous sommes.", oeuvre: "L'Homme révolté", date: "1951", explication: "La révolte n'est pas individuelle — elle crée une solidarité humaine. En disant non à l'injustice, je me reconnais lié aux autres. La révolte fonde la communauté des hommes.", bac: "Utile pour : La révolte. Justice et engagement. L'individu et la société.", adversaire: "Sartre", antithese: "Sartre s'oppose : 'je me révolte' peut rester individuel — l'engagement politique nécessite un choix conscient, pas une solidarité automatique." }
                ]
            }
        ]
    }
];
