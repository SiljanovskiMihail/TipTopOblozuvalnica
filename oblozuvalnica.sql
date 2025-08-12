-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: oblozuvalnica
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id_str` varchar(20) NOT NULL,
  `sport_display_name` varchar(50) NOT NULL,
  `team1` varchar(100) NOT NULL,
  `team2` varchar(100) NOT NULL,
  `match_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `match_id_str` (`match_id_str`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` VALUES (1,'match_0001','Фудбал','Wolfs','Everton','2025-06-21 21:00:00'),(2,'match_0002','Кошарка','Vardar','Pelister','2025-06-21 22:30:00'),(3,'match_0008','Ракомет','Germany','France','2025-06-22 22:00:00'),(4,'match_0006','Еспорт','Fnatic','G2 Esports','2025-06-23 13:00:00'),(6,'match_1000','Фудбал','RFS','Levadia','2025-07-18 18:45:00'),(8,'match_1001','Фудбал','Ajax','PSV','2025-07-21 15:15:00'),(13,'match_0010','Еспорт','NAVI','B8','2025-07-30 00:00:00');
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `odds`
--

DROP TABLE IF EXISTS `odds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `odds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id_str` varchar(20) NOT NULL,
  `odd_type` varchar(20) NOT NULL,
  `odd_value` decimal(8,2) NOT NULL,
  `is_main_odd` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `match_id_str` (`match_id_str`),
  CONSTRAINT `odds_ibfk_1` FOREIGN KEY (`match_id_str`) REFERENCES `matches` (`match_id_str`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `odds`
--

LOCK TABLES `odds` WRITE;
/*!40000 ALTER TABLE `odds` DISABLE KEYS */;
INSERT INTO `odds` VALUES (1,'match_0001','1',2.50,1),(2,'match_0001','X',3.40,1),(3,'match_0001','2',2.80,1),(4,'match_0001','1-1',3.50,0),(5,'match_0001','2-2',3.80,0),(6,'match_0001','3+',1.80,0),(7,'match_0001','4+',2.50,0),(8,'match_0001','2+I',2.20,0),(9,'match_0001','2+II',2.10,0),(10,'match_0002','1',4.65,1),(11,'match_0002','X',16.00,1),(12,'match_0002','2',1.10,1),(13,'match_0002','>60.5',1.70,0),(14,'match_0002','<60.5',2.00,0),(15,'match_0002','1-1',8.40,0),(16,'match_0002','2-2',1.45,0),(17,'match_0002','I > II',1.90,0),(18,'match_0002','II > I',1.90,0),(19,'match_0008','1',2.15,1),(20,'match_0008','X',6.00,1),(21,'match_0008','2',1.90,1),(22,'match_0008','1-1',2.80,0),(23,'match_0008','2-2',2.50,0),(24,'match_0008','>60.5',1.85,0),(25,'match_0008','<60.5',1.95,0),(26,'match_0008','I > II',1.70,0),(27,'match_0008','II > I',2.10,0),(28,'match_0006','1',1.80,1),(29,'match_0006','X',7.00,1),(30,'match_0006','2',1.95,1),(31,'match_0006','>2.5',1.60,0),(32,'match_0006','<2.5',2.20,0),(33,'match_0006','2:0',2.80,0),(34,'match_0006','0:2',3.00,0),(35,'match_0006','1:2',2.50,0),(36,'match_0006','2:1',2.40,0),(55,'match_1000','1',1.44,1),(56,'match_1000','X',4.75,1),(57,'match_1000','2',5.25,1),(58,'match_1000','2+I',2.45,0),(59,'match_1000','2+II',2.20,0),(60,'match_1000','3+',1.60,0),(61,'match_1000','4+',2.25,0),(62,'match_1000','1-1',1.90,0),(63,'match_1000','2+I/2+II',1.70,0),(64,'match_1001','1',2.50,1),(65,'match_1001','X',4.00,1),(66,'match_1001','2',2.50,1),(67,'match_1001','3+',1.40,0),(68,'match_1001','4+',1.80,0),(69,'match_1001','2+I',1.95,0),(70,'match_1001','2+II',1.85,0),(71,'match_1001','2-1',35.00,0),(72,'match_1001','1-2',35.00,0),(101,'match_0010','1',1.25,1),(102,'match_0010','X',16.00,1),(103,'match_0010','2',3.85,1),(104,'match_0010','<2.5',1.90,0),(105,'match_0010','>2.5',1.90,0),(106,'match_0010','0:2',9.65,0),(107,'match_0010','1:2',6.55,0),(108,'match_0010','2:0',1.80,0),(109,'match_0010','2:1',1.45,0);
/*!40000 ALTER TABLE `odds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poraki`
--

DROP TABLE IF EXISTS `poraki`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poraki` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imePrezime` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `poraka` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poraki`
--

LOCK TABLES `poraki` WRITE;
/*!40000 ALTER TABLE `poraki` DISABLE KEYS */;
INSERT INTO `poraki` VALUES (1,'Test Eden','testeden@example.com','Test 1'),(2,'Test Dva','testeden@example.com','Test Dva'),(3,'Test tri','testeden@example.com','Test 3'),(4,'Test Eden','testeden@example.com','test'),(5,'Test Pet','testpet@example.com','Test 5'),(6,'test shest','testeden@example.com','Test 6'),(7,'test sedum','testsedum@example.com','Test 7'),(8,'test osum','testsedum@example.com','Test 8'),(9,'test devet','testeden@example.com','Test 9'),(10,'test deset','testsedum@example.com','test 10'),(11,'test 11','testsedum@example.com','Test 11'),(12,'test dvanaeset','test12@example.com','Test12'),(13,'Test petnaeset','testeden@example.com','Test 15'),(14,'testshestaeset','testeden@example.com','Test 16'),(15,'Clifford Smith','csgo20@example.com','123 test');
/*!40000 ALTER TABLE `poraki` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_matches`
--

DROP TABLE IF EXISTS `ticket_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int DEFAULT NULL,
  `match_id` varchar(255) NOT NULL,
  `team1` varchar(255) NOT NULL,
  `team2` varchar(255) NOT NULL,
  `match_date` date NOT NULL,
  `bet_type` varchar(50) NOT NULL,
  `odd_value` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_matches_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_matches`
--

LOCK TABLES `ticket_matches` WRITE;
/*!40000 ALTER TABLE `ticket_matches` DISABLE KEYS */;
INSERT INTO `ticket_matches` VALUES (1,3,'match_match_0002','Vardar','Pelister','2025-08-11','1',4.65),(2,3,'match_match_0008','Germany','France','2025-08-11','1',2.15),(3,4,'match_match_0008','Germany','France','2025-08-12','1',2.15),(4,4,'match_match_0006','Fnatic','G2 Esports','2025-08-12','1',1.80),(5,5,'match_0001','Wolfs','Everton','2025-08-12','1',2.50),(6,5,'match_0002','Vardar','Pelister','2025-08-12','2',1.10),(7,6,'match_0001','Wolfs','Everton','2025-08-12','2',2.80),(8,14,'match_0002','Vardar','Pelister','2025-08-12','2',1.10),(9,15,'match_0001','Wolfs','Everton','2025-08-12','1-1',3.50),(10,15,'match_0002','Vardar','Pelister','2025-08-12','I > II',1.90),(11,15,'match_1000','RFS','Levadia','2025-08-12','3+',1.60),(12,15,'match_0010','NAVI','B8','2025-08-12','>2.5',1.90),(13,16,'match_0002','Vardar','Pelister','2025-08-12','1',4.65),(14,17,'match_0001','Wolfs','Everton','2025-08-12','X',3.40);
/*!40000 ALTER TABLE `ticket_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(9) NOT NULL,
  `user_id` int DEFAULT NULL,
  `num_matches` int NOT NULL,
  `total_odds` decimal(10,2) NOT NULL,
  `stake` decimal(10,2) NOT NULL,
  `payout` decimal(10,2) NOT NULL,
  `payout_after_tax` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (3,'0OUDJWZ2S',15,2,10.00,100.00,999.75,864.79,'2025-08-11 23:57:56'),(4,'175974443',15,2,3.87,500.00,1935.00,1719.75,'2025-08-12 00:25:59'),(5,'818511840',NULL,2,2.75,50.00,137.50,124.38,'2025-08-12 00:29:46'),(6,'633242571',NULL,1,2.80,1000.00,2800.00,2530.00,'2025-08-12 00:37:57'),(7,'949985503',NULL,1,16.00,20.00,320.00,275.00,'2025-08-12 12:41:02'),(8,'417112217',NULL,1,16.00,20.00,320.00,275.00,'2025-08-12 12:41:45'),(9,'235604609',NULL,1,16.00,22.00,352.00,302.50,'2025-08-12 12:42:44'),(10,'926686425',NULL,2,33.25,33.00,1097.25,937.61,'2025-08-12 12:46:12'),(14,'037833656',NULL,1,1.10,1000.00,1100.00,1085.00,'2025-08-12 13:04:15'),(15,'685126918',15,4,20.22,50.00,1010.80,866.68,'2025-08-12 13:06:19'),(16,'417557417',15,1,4.65,20.00,93.00,82.05,'2025-08-12 13:38:54'),(17,'823075541',15,1,3.40,10.00,34.00,30.40,'2025-08-12 13:43:13');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_private_id` varchar(255) NOT NULL,
  `id_photo_path` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `user_private_id` (`user_private_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'ADMIN','$2b$10$seQ1kStAGjV0VwXOR.o6g.hB..TpuSZDYb6kZOeAGvRzYqbTEyYjO','$2b$10$tuGpR6oJfkB3wGlPeZUzJeL0v2EY16NoBdRXWhGIjT8paM0JGQWPK','',1),(14,'jovana','$2b$10$jQQJLYBUWgGJgZLDNcL0vubzhF6hFUL9ilqwRmFaD6eKRddFQOm3C','$2b$10$RJkd7xT2SefznB7n898QY.F1j4UbqkRVGuWoU5py6flw6H0Eqi9mC','uploads\\ids\\id-photo-1753277432728-250891756.jpg',1),(15,'mihail','$2b$10$U7ROIL/aha9vjmHoojGNZuT5iKh0/VF.7Ew6UToZrAJ9bK0g4ONaq','$2b$10$eNgnJvCYIQkBHZDQFu50d.4WEiY4nI1Sml2.ngAR4bQZDqtZUiaHe','uploads\\ids\\id-photo-1753361571965-890272960.jpg',1),(16,'mihail1','$2b$10$BFWQSRNpw5ZewqWTTHC6nerKr/VpW0V3UuRHQ/Ulf1PIUeZAmYiF6','$2b$10$csMJT/sB8KB.Z7/5mlttF.8yyeaRYx4RDvasQIQ3OfWhvEYtQMZO.','uploads\\ids\\id-photo-1753363460224-414950927.jpg',1),(21,'test1','$2b$10$hrSoObeG2U6NU4m85KKXA.TAHYdCBlJb5rOR9NiQSR020xgQiYGQO','$2b$10$e23jlGKxyJWOAEnshB10aOgxjjozdDD9UPn09Y2rhVFi7B4a4.gK.','id-photo-1753667306920-496000926.png',1),(22,'test2','$2b$10$zRGFcHoF2dL2x5SbkcPdde52JWcpv5vb0wLpc/NEJ2vK318Ph7gsm','$2b$10$WvZK7yT2Q7N6TZ.8xW5DOeQjhUVmQoaXxeymXbtMks2RP7sAiBD.W','id-photo-1753667328034-470294469.png',1),(31,'test3','$2b$10$QJNNKgpaA1s.KJhvjqaR7uDaZOJ/b0fVkEGdtvWdPcQ.ZQSjuca7C','$2b$10$si/eXhtNkgSYOo84DCh6GeEbSG2Bj04afhksxtGERJhhBD385s0Qu','id-photo-1754571099591-567451043.png',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'oblozuvalnica'
--
/*!50003 DROP PROCEDURE IF EXISTS `InsertPoraka` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertPoraka`(
    IN _imePrezime VARCHAR(255),
    IN _email VARCHAR(255),
    IN _poraka VARCHAR(255)
)
BEGIN
    INSERT INTO poraki (imePrezime, email, poraka)
    VALUES (_imePrezime, _email, _poraka);
    SELECT LAST_INSERT_ID() AS id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertTicket` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertTicket`(
    IN p_ticket_id VARCHAR(255),
    IN p_user_id INT,
    IN p_num_matches INT,
    IN p_total_odds DECIMAL(10, 2),
    IN p_stake DECIMAL(10, 2),
    IN p_payout DECIMAL(10, 2),
    IN p_payout_after_tax DECIMAL(10, 2)
)
BEGIN
    INSERT INTO tickets (ticket_id, user_id, num_matches, total_odds, stake, payout, payout_after_tax)
    VALUES (p_ticket_id, p_user_id, p_num_matches, p_total_odds, p_stake, p_payout, p_payout_after_tax);
    
    SELECT LAST_INSERT_ID() AS insertId;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertTicketMatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertTicketMatch`(
    IN p_ticket_id INT,
    IN p_match_id VARCHAR(255),
    IN p_team1 VARCHAR(255),
    IN p_team2 VARCHAR(255),
    IN p_match_date DATETIME,
    IN p_bet_type VARCHAR(255),
    IN p_odd_value DECIMAL(10, 2)
)
BEGIN
    INSERT INTO ticket_matches (ticket_id, match_id, team1, team2, match_date, bet_type, odd_value)
    VALUES (p_ticket_id, p_match_id, p_team1, p_team2, p_match_date, p_bet_type, p_odd_value);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RegisterUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `RegisterUser`(
    IN p_username VARCHAR(255),
    IN p_hashedPassword VARCHAR(255),
    IN p_hashedMatichen VARCHAR(255),
    IN p_id_photo_path VARCHAR(255) -- New parameter for the photo path
)
BEGIN
    INSERT INTO users (username, password, user_private_id, id_photo_path, is_verified)
    VALUES (p_username, p_hashedPassword, p_hashedMatichen, p_id_photo_path, 0); -- Set is_verified to 0
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_AddMatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddMatch`(
    IN p_match_id_num VARCHAR(4),
    IN p_sport_display_name VARCHAR(50),
    IN p_team1 VARCHAR(100),
    IN p_team2 VARCHAR(100),
    IN p_match_time DATETIME,
    IN p_odds_json TEXT
)
BEGIN
    -- v_match_id_str will now correctly concatenate 'match_' with the VARCHAR ID (e.g., '0001')
    DECLARE v_match_id_str VARCHAR(20); 
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_odd_count INT;
    DECLARE v_odd_type VARCHAR(20);
    DECLARE v_odd_value DECIMAL(8, 2);
    DECLARE v_is_main_odd BOOLEAN;

    SET v_match_id_str = CONCAT('match_', p_match_id_num); -- This will now produce 'match_0001'

    -- Insert into matches table
    INSERT INTO matches (match_id_str, sport_display_name, team1, team2, match_time)
    VALUES (v_match_id_str, p_sport_display_name, p_team1, p_team2, p_match_time);

    -- Process and insert odds
    IF p_odds_json IS NOT NULL AND JSON_VALID(p_odds_json) AND JSON_TYPE(p_odds_json) = 'ARRAY' THEN
        SET v_odd_count = JSON_LENGTH(p_odds_json);

        WHILE v_index < v_odd_count DO
            SET v_odd_type = JSON_UNQUOTE(JSON_EXTRACT(p_odds_json, CONCAT('$[', v_index, '].odd_type')));
            SET v_odd_value = JSON_EXTRACT(p_odds_json, CONCAT('$[', v_index, '].odd_value'));
            SET v_is_main_odd = JSON_EXTRACT(p_odds_json, CONCAT('$[', v_index, '].is_main_odd'));

            INSERT INTO odds (match_id_str, odd_type, odd_value, is_main_odd)
            VALUES (v_match_id_str, v_odd_type, v_odd_value, v_is_main_odd);

            SET v_index = v_index + 1;
        END WHILE;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_DeleteMatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_DeleteMatch`(
    IN p_match_id_str VARCHAR(20)
)
BEGIN
    DELETE FROM odds WHERE match_id_str = p_match_id_str;
    DELETE FROM matches WHERE match_id_str = p_match_id_str;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UpdateMatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateMatch`(
    IN p_match_id_str VARCHAR(20),
    IN p_sport_display_name VARCHAR(50),
    IN p_team1 VARCHAR(100),
    IN p_team2 VARCHAR(100),
    IN p_match_time DATETIME,
    IN p_odds_json TEXT
)
BEGIN
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_odd_count INT;
    DECLARE v_odd_type VARCHAR(20);
    DECLARE v_odd_value DECIMAL(8, 2);
    DECLARE v_is_main_odd BOOLEAN;
    
    UPDATE matches
    SET sport_display_name = p_sport_display_name,
        team1 = p_team1,
        team2 = p_team2,
        match_time = p_match_time
    WHERE match_id_str = p_match_id_str;

    DELETE FROM odds WHERE match_id_str = p_match_id_str;

    IF p_odds_json IS NOT NULL AND JSON_VALID(p_odds_json) AND JSON_TYPE(p_odds_json) = 'ARRAY' THEN
        SET v_odd_count = JSON_LENGTH(p_odds_json);
        WHILE v_index < v_odd_count DO
            SET v_odd_type = JSON_UNQUOTE(JSON_EXTRACT(p_odds_json, CONCAT('$[', v_index, '].odd_type')));
            SET v_odd_value = JSON_EXTRACT(p_odds_json, CONCAT('$[', v_index, '].odd_value'));
            SET v_is_main_odd = JSON_EXTRACT(p_odds_json, CONCAT('$[', v_index, '].is_main_odd'));

            INSERT INTO odds (match_id_str, odd_type, odd_value, is_main_odd)
            VALUES (p_match_id_str, v_odd_type, v_odd_value, v_is_main_odd);

            SET v_index = v_index + 1;
        END WHILE;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-12 15:49:46
