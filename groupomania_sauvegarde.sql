-- MySQL dump 10.13  Distrib 8.0.21, for Win64 (x86_64)
--
-- Host: localhost    Database: groupomania
-- ------------------------------------------------------
-- Server version	8.0.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `numero` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint unsigned NOT NULL,
  `post_id` int unsigned NOT NULL,
  `comment` text,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`numero`),
  KEY `fk_comment_user_id` (`user_id`),
  KEY `fk_post_id` (`post_id`),
  CONSTRAINT `fk_comment_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`numero`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,2,14,'C\'est vrai que ce post n\'était pas très utile...','2020-10-26 11:29:21'),(3,6,14,'Mais ils sont nuls tes commentaires Vador !','2020-10-26 12:20:39'),(6,3,14,'Faire la paix entre vous vous devez !','2020-10-26 12:31:12'),(7,3,14,'Et puis comment êtes-vous devenus aussi grands en mangeant cette nourriture ?','2020-10-26 12:34:37'),(18,2,8,'Parfois il faut savoir être sévère !','2020-10-26 15:37:33'),(19,2,8,'Mais c\'est pour son bien','2020-10-26 15:45:43'),(24,2,5,'Il est pourri ce post !','2020-10-27 17:16:00'),(25,2,3,'Ça a l\'air sympa je vais venir te voir :)','2020-10-27 17:16:56'),(26,3,3,'Euh non merci !','2020-10-27 17:18:07'),(27,3,4,'Quand 900 ans comme moi tu auras, moins de vacances tu prendras','2020-10-27 17:18:52'),(28,3,7,'Félicitations !','2020-10-27 20:10:50'),(29,3,6,'Un peu de respect pour les français svp !','2020-10-27 20:15:41'),(30,3,5,'Beaucoup de sagesse dans ce post !','2020-10-27 20:19:28');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dislikes`
--

DROP TABLE IF EXISTS `dislikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dislikes` (
  `post_id` int unsigned NOT NULL,
  `user_id` smallint unsigned NOT NULL,
  KEY `fk_dislike_user_id` (`user_id`),
  KEY `fk_dislike_post_id` (`post_id`),
  CONSTRAINT `fk_dislike_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`numero`) ON DELETE CASCADE,
  CONSTRAINT `fk_dislike_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dislikes`
--

LOCK TABLES `dislikes` WRITE;
/*!40000 ALTER TABLE `dislikes` DISABLE KEYS */;
INSERT INTO `dislikes` VALUES (14,3),(5,2),(4,3),(6,3),(30,2);
/*!40000 ALTER TABLE `dislikes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `post_id` int unsigned NOT NULL,
  `user_id` smallint unsigned NOT NULL,
  KEY `fk_like_user_id` (`user_id`),
  KEY `fk_like_post_id` (`post_id`),
  CONSTRAINT `fk_like_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`numero`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (14,6),(8,2),(7,2),(3,2),(3,3),(14,2),(7,3),(5,3),(6,2);
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `numero` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint unsigned NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` text,
  `media_url` varchar(100) DEFAULT NULL,
  `link` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`numero`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,2,'Come to the dark side !','',NULL,'','2020-10-22 12:09:48'),(2,2,'I am your father','There is nothing you could do about this...',NULL,'https://www.starwars-universe.com/','2020-10-22 12:21:01'),(3,3,'Paysages de la planète Dagobah','','http://localhost:3000/medias/Waterfall_-_370881603362361092.mp4','','2020-10-22 12:26:01'),(4,6,'Vacances pendant le COVID-19','Idée de destination pas très lointaine grâce à Zoom !','http://localhost:3000/medias/Welcome_to_the_beach1603362759217.mp4','','2020-10-22 12:32:39'),(5,5,'Lorem Ipsum','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt','http://localhost:3000/medias/Lorem_ipsum1603362939107.png','https://www.webfx.com/tools/lorem-ipsum-generator/loremipsum/words','2020-10-22 12:35:39'),(6,4,'Vous ne passerez pas !','','http://localhost:3000/medias/Passerez_pas1603363180264.jpg','','2020-10-22 12:39:40'),(7,5,'Ma victoire sur Sauron','Un grand moment de fête et de convivialité !','http://localhost:3000/medias/Happy1603363345068.gif','','2020-10-22 12:42:25'),(8,2,'Premier bulletin du trimestre pour Luke','Ça va faire mal !','http://localhost:3000/medias/swstri101603451037960.jpg','','2020-10-22 12:43:18'),(14,2,'J\'ai faim !','','','','2020-10-23 13:12:40'),(30,6,'Fat Cat !','','http://localhost:3000/medias/Fat_Cat1604427282998.gif','','2020-11-03 19:14:43');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `password` varchar(70) NOT NULL,
  `pseudo` varchar(30) NOT NULL,
  `avatar_url` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `password` (`password`),
  UNIQUE KEY `pseudo` (`pseudo`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@groupomania.com','$2b$10$Fiy8RL0b9PDKv5DD7hBz6es/zELnhBpTlMs2Ow0vvdY87XjrZSZ7y','SuperAdmin','http://localhost:3000/medias/logo1604049596726.png'),(2,'vador@groupomania.com','$2b$10$yEXAe2yN67HB6u0q18YRhewgDfcd6tT3DVYCl.YaiDUCi0jqm4lhm','Dark Vador','http://localhost:3000/medias/Vador1603902171134.jpg'),(3,'yoda@groupomania.com','$2b$10$fWVB.VayST8W89uyPxJkbumK0993Rl8WmbKJu/eGXtRsOUPL/0Uji','Master Yoda','http://localhost:3000/medias/Yoda1603817119007.jpg'),(4,'gandalf@groupomania.com','$2b$10$vH2OWtmFRdBxJVImgqx3..2DyllqQhpF0jrkFOmq1xHM7R6vOeJqK','Gandalf le blanc','http://localhost:3000/medias/GANDALF1603360015839.jpg'),(5,'aragorn@groupomania.com','$2b$10$FtwTueV1nCWOmkiqbDZuJuIo6jdjA15F534QMqnAf5RgrK45ItONK','Aragorn','http://localhost:3000/medias/Aragorn1603360109012.png'),(6,'damien.maghe@groupomania.com','$2b$10$ZuFZB5EJIzE5M9M7VweEYOkWgq67OPvqAEM68SBybldviofF.Bg/C','Damien','http://localhost:3000/medias/damien1603362678214.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-06 11:35:22
