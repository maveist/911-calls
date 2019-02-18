# 911 Calls

**911 Calls** est un workshop permettant de manipuler le même jeu de données dans plusieurs bases NoSQL différentes.

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>

<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">911-calls</span> par <a xmlns:cc="http://creativecommons.org/ns#" href="https://github.com/nosql-bootcamp/911-calls" property="cc:attributionName" rel="cc:attributionURL">Chris WOODROW, Sébastien PRUNIER et Benjamin CAVY</a> est distribué sous les termes de la licence <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons - Attribution - NonCommercial - ShareAlike</a>.

## Docker 

'''
docker-compose up
'''

## Pré requis

Nous considérons que vous avez déjà réalisé les workshops suivants :

* [elasticsearch-101](https://github.com/nosql-bootcamp/elasticsearch-101)
* [elasticsearch-102](https://github.com/nosql-bootcamp/elasticsearch-102)
* [mongodb-101](https://github.com/nosql-bootcamp/mongodb-101)
* [mongodb-102](https://github.com/nosql-bootcamp/mongodb-102)

Vous allez également avoir besoin de [Node.js](https://nodejs.org). Si ce n'est pas déjà fait, [installez `node` et `npm`](https://nodejs.org/en/download/) sur votre machine.

Vérifiez les versions installées de `node` (minimum `v8.x`) et `npm` (minimum `v5.x`) :

```bash
node -v
v8.9.3
```

```bash
npm -v
5.5.1
```

## Jeu de données

Le jeu de données utilisé pour ce workshop est une liste d'appels au numéro d'urgence 911 dans le [Comté de Montgomery](https://www.google.fr/maps/place/Comt%C3%A9+de+Montgomery,+Pennsylvanie,+%C3%89tats-Unis/data=!4m2!3m1!1s0x89c69c3956b226eb:0x4b0baa22f9505dbd?sa=X&ved=0ahUKEwiMt6HWp8fRAhUG0xoKHfyWCvsQ8gEIdDAO) en Pennsylvanie.

Le fichier CSV des appels est disponible sur le site [Kaggle](https://www.kaggle.com/datasets) : https://www.kaggle.com/mchirico/montcoalert. La version utilisée ici est la version 30 (https://www.kaggle.com/mchirico/montcoalert/version/30) et une copie des données est disponible à la racine du repository (`911.csv`).

Extrait du jeu de données :

| lat | lng | desc | zip | title | timeStamp | twp | addr | e   |
| --- | --- | ---- | --- | ----- | --------- | --- | ---- | --- |
| 40.2978759 | -75.5812935 | REINDEER CT & DEAD END;  NEW HANOVER; Station 332; 2015-12-10 @ 17:10:52; | 19525 | EMS: BACK PAINS/INJURY | 2015-12-10 17:10:52 | NEW HANOVER | REINDEER CT & DEAD END | 1 |
| 40.2580614 | -75.2646799 | BRIAR PATH & WHITEMARSH LN;  HATFIELD TOWNSHIP; Station 345; 2015-12-10 @ 17:29:21; | 19446 | EMS: DIABETIC EMERGENCY | 2015-12-10 17:29:21 | HATFIELD TOWNSHIP | BRIAR PATH & WHITEMARSH LN | 1 |
| 40.1211818 | -75.3519752 | HAWS AVE; NORRISTOWN; 2015-12-10 @ 14:39:21-Station:STA27; | 19401 | Fire: GAS-ODOR/LEAK | 2015-12-10 14:39:21 | NORRISTOWN | HAWS AVE | 1 |

Analyse de la première ligne :

| Colonne   | Valeur                                               | Description               |
| --------- | ---------------------------------------------------- | ------------------------- |
| lat       | 40.2978759                                           | Latitude                  |
| lng       | -75.5812935                                          | Longitude                 |
| desc      | REINDEER CT & DEAD END; (...) 2015-12-10 @ 17:10:52; | Description               |
| zip       | 19525                                                | Code postal               |
| title     | EMS: BACK PAINS/INJURY                               | Titre                     |
| timeStamp | 2015-12-10 17:10:52                                  | Date et heure             |
| twp       | NEW HANOVER                                          | Quartier                  |
| addr      | REINDEER CT & DEAD END                               | Adresse                   |
| e         | 1                                                    | ? (inutile, toujours à 1) |

La donnée `titre` est particulière, elle débute toujours par un identifiant permettant de catégoriser l'appel. Trois valeurs sont possibles :

* `EMS` : appel lié à un problème médical (Emergency Medical Services).
* `Fire` : appel lié à un incendie.
* `Traffic` : appel lié à un problème de circulation (accident, panne...)


## Objectif

L'objectif est d'importer les données dans [ElasticSearch](./elasticsearch) et dans [MongoDB](./mongodb) et de construire un certain nombre de requêtes pour répondre à différents besoins listés ci-après.

### Compter le nombre d'appels autour de Lansdale dans un rayon de 500 mètres

Coordonnées GPS du quartier de *Lansdale, PA, USA* :

* Latitude : 40.241493
* Longitude : -75.283783

Le résultat attendu est **717**.

### Compter le nombre d'appels par catégorie

Le résultat attendu est :

| EMS   | Fire  | Traffic |
| ----- | ----- | ------- |
| 75589 | 23056 | 54549   |

### Trouver les 3 mois ayant comptabilisés le plus d'appels

Le résultat attendu est :

| 01/2016 | 10/2016 | 12/2016 |
| ------- | ------- | ------- |
| 13096   | 12502   | 12162   |

### Trouver le top 3 des villes avec le plus d'appels pour overdose

Le résultat attendu est :

| POTTSTOWN | NORRISTOWN | UPPER MORELAND |
| --------- | ---------- | -------------- |
| 203       | 180        | 110            |
