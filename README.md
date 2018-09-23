# Territoires et énergies

Territoires et énergies est un outil basé sur le web qui permet d'explorer les données air et énergie des communes ayant entre 20 000 et 50 000 habitants, soit 371 collectivités.

## Objectif

La principale ambition de cet outil est d'attirer l'attention sur l'importance des thématiques air et énergie. Pour cela, on structure de façon simple un nombre relativement important de données pour dresser le portrait de chacune des 371 communes.

Eventuellement, les informations présentées peuvent servir de base pour intier la démarche PCAE de la commune visionnée.

Afin d'impliquer davantage l'internaute, une calculette l'invite à vérifier quelle serait la production d'électricité de la commune en cours, si chaque menage disposait un nombre X de m² de panneaux solaires. La calculette propose le pourcentage de l'électricité produite de cette façon par rapport au total consommé, ainsi que la quantité de CO2 économisée.

## Cible

Le travail réalisé s'adresse à un public de non spécialistes et cherche à les intéresser aux problématiques présentées. Pour éviter de les troubler, les visualizations présentées sont relativement simples et facilement intérprétables, bien que certaines ne soient pas très courantes.

## Description

Les composants de l'outil sont les suivantes :

### Recherche :
Dès que les premières lettres sont tapées sur la barre de recherche, une liste de communes est proposée. Au clic sur l'une de communes, on affiche toutes les informations relatives à l'air et à la consommation d'énergie de la commune

### Commune :
Pour donner un contexte à toutes les informations qui vont suivre, on indique les élements suivants : nom de la commune, département, région, EPCI, code Insee, nombre d'habitants, évolution du nombre d'habitants depuis 2010, nombre de ménages, nombre d'établissements actifs, surface en km².

*Données utilisées :*
* Insee, Base comparateur de territoires : https://www.insee.fr/fr/statistiques/2521169
* Nos données : http://www.nosdonnees.fr/wiki/index.php/Fichier:EUCircos_Regions_departements_circonscriptions_communes_gps.csv.gz

### Performance énergétique des logements :
On indique performance moyenne dans la commune, et le nombre de logements avec DPE par rapport au total. Afin de mieux évaluer ces informations, on indique l'année moyenne de construction et la surface moyenne en m².

*Données utilisées :*
* Ademe : https://www.data.gouv.fr/fr/datasets/base-des-diagnostics-de-performance-energetique-dpe/

### Consommation de gaz et d'électricité :
La consommation est présentée avec plusieurs élements allant du général au plus détaillé :
1. La première indication est le total de gaz et d'électricité de la dernière année disponible, 2016.
2. Ensuite, on détaille les consommations de ces deux types d'énergie
3. Puis, on explore la participation de chaque secteur à la consommation totale.avec deux diagrammes sankey,
4. Un streamgraph permet de visualiser l'évolution des différents secteurs
5. Le cas écheant, on présente les différents opérateurs des réseaux chaleur froid avec la production d'énergie par année.

*Données utilisées :*
http://www.statistiques.developpement-durable.gouv.fr/energie-climat/r/toutes-energies-donnees-locales-denergie-2.html


### Qualité de l'air :
Au niveau de la commune les indications relatives à l'air de la commune sont abordées avec l'indication des quantités des polluants - NO2, O3, PM10, PM2.5 - présents dans l'air de la commune.

L'information est completée avec le pourcentage que ces émissions représentent par rapport aux valeurs guides de l'OMS et aussi avec les effets potentiels sur la santé, toujours d'auprès les conseils de l'OMS.

Au niveau du département, on propose les informations suivantes :
1. Un diagramme de bulles qui repésente les substances rejetées dans l'air du département. Au survol de chaque bulle, on a des informations relatives à l'établissement pollueur, son activité, la substance émisse, et la quantité en kg/an.
2. Les émissions de CO2 étant comptabilisées en tonnes/an, on les présente dans un graphique de bulles séparé.
3. Un tableau synthétise tous les établissements, leur activité, le polluant émis et sa quantité.

*Données utilisées :*
http://www.prevair.org
http://georisques.gouv.fr

### Potentiel des énergies renouvelables :
Dans cette dernière partie, on indique la vitesse moyenne du vent dans la région ainsi que le rayonnement solaire moyen régional.

Une calculette du potentiel solaire, utilise ce rayonnement solaire moyen pour estimer quelle partie de la consommation électrique du secteur résidentiel peut être couverte par la production de panneaux solaires. L'utilisateur est invité à saisir un nombre de m² de panneaux solaires par ménage (champ paramétré par défaut à 1) et la caculette fait l'estimation de la production électrique et de la quantité de CO2 économisée.

*Données utilisées :*
* http://reseaux-energies.fr


## Demarche
Les données des 371 communes font plusieurs dizaines de Mo. Les délivrer avec une vitesse de réponse optimum a été une question considérée avec le plus grand soin, au point d'avoir définit complétement l'architecture de l'application !

L'architecture choisie est rapide, modulaire et permet d'étendre éventuellement l'outil à l'ensemble des communes de France : il s'agit simplement d'une question de place dans la base de données.

### Modularité
L'outil a été conçu comme un aggrégat de différentes blocs d'informations. Chaque bloc consulte la base de données de façon autonome ce qui permet de greffer des nouveaux blocs ou de changer leur ordre sans interférer avec l'existant.

La page de base embarque tout le code nécessaire à l'application. Quand l'utilisateur réalise une consulte, chaque bloc d'information communique en arrière-plan avec la base de données et charge les données qui lui concernent.

### Mobile first
L'interface a été conçue pour les terminaux mobiles dès le départ, puis, déclinée en versions grande taille. Cette approche assure que l'expérience des utilisateurs mobiles ne soit pas diluée par rapport aux utilisateurs avec des ordinateurs de bureau.

### Vitesse
La page intiale utilise un peu plus de 200ko de HTML, CSS, JS et d'images, et charger n'importe quelle des 371 communes ne demande en moyenne que 150ko de données.

Avec une structure aussi legère, tout se charge très vite, même sur un petit hébergement mutualisé :
* Avec une connexion fibre : une seconde ou moins.
* Avec une simmulation de connexion 3G : 2 secondes environ pour la page de base et 1,4 secondes pour charger une commune.


## Traitements de données
Chaque bloc d'informations possède un script python dédié qui permet de réaliser l'importation des données ouvertes brutes, leur transformation et l'insertion en base de données.

De ce fait, actualiser des données est une opération très simple : il suffit de vider la table des données à actualiser et de lancer le script sur le nouveau millésime.

Les scripts python sont intégrés dans des jupyter notebooks, ce qui facilité leur prise en main.

## Solutions techniques utilisées
* Web : HTML5, CSS, JavaScript
* Visualisation : framework open source D3JS
* Images : Inkscape, format PNG
* Traitement de données : Python et Pandas avec Jupyter Notebooks
* Programmation serveur : PHP
* Base de données : MySQL
* Editeur de code : Atom
* Vidéo : OpenShot Video Editor, Gtk-recordmydesktop
* Musique : "Raro bueno" par Chuzausen. License : attribution non commercial share alike 3.0
* OS : Ubuntu   

## Navigateurs compatibles
Firefox, Opera, Chrome, Internet Explorer


## Code source
Les codes sources sont disponibles sur Github : https://github.com/VictorVila/territoires-et-energies,

## License
Creative Commons Paternité-Partage des Conditions Initiales à l'Identique 3.0 non transposé (CC BY-SA 3.0 Unported)
