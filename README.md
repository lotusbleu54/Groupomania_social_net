# OC_Projet7

Projet 7 formation développeur web - Groupomania

Pour installer le projet en local (prérequis - avoir node.js, git et MySQL installés) :

1) Cloner ce répertoire => git clone https://github.com/lotusbleu54/OC_Projet7.git

Pour la partie MySQL :

2) A l'aide du fichier fourni P7_02_Environnement => créer un fichier ".env" dans le dossier backend
3) Se connecter à MySQL avec l'utilisateur root
4) Entrer les commandes suivantes à l'aide des infos DB_USER, DB_HOST, DB_PASS et DB_NAME fournies dans le fichier P7_02_Environnement :

    CREATE USER 'DB_USER'@'DB_HOST' IDENTIFIED BY 'DB_PASS';
    
    GRANT ALL PRIVILEGES ON DB_NAME.* TO 'DB_USER'@'DB_HOST';
5) Se connecter à MySQL avec l'utilisateur DB_USER et le mot de passe DB_PASS, puis entrer la commande suivante :

    CREATE DATABASE DB_NAME
6) Utiliser la sauvegarde de la base (dans le dossier backend > groupomania_sauvegarde.sql) avec la commande suivante : 

    USE DB_NAME SOURCE chemin_fichier_de_sauvegarde.sql

Pour la partie backend (node js):

7) Dans le dossier backend => npm install
8) Lancer le serveur => node server

Pour la partie frontend (projet Vue):

9) Dans le dossier frontend => npm install
10) Lancer le serveur de développement => npm run serve
11) Visualiser le résultat sur le navigateur => http://localhost:8080
