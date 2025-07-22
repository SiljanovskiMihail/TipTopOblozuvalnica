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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `user_private_id` (`user_private_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'mihail','$2b$10$Smf96HyBK8EH8BJNssuiMu6ZS/IYy7Kb68NdzI.uvk8J/MYdy0kgS','$2b$10$nnEALPsaulESCyKay07yE.ZmRcWohlP415uK4gUvLQT45NYgmKrca'),(2,'mihail1','$2b$10$HsAJseO6ZDJ7Vkd6c2/PPO7W0gsAnC4gpljoQCEbmT4C62SKYd8Zm','$2b$10$qWyuioZjxA6o0rcZgLbL6eHKlj.cwh1n9Y0VKuQ5Coqpipm2wqEOG'),(3,'mihail2','$2b$10$Xj7Dk2fO1S82VjtZZjw.1.L4S1/y37VvuTlGtrZPiCZ1wI9xj6hei','$2b$10$fy.jNhAxCbLHoRgzEHkfqu9ozpQBIE.aabLXJhzcspAij9yQvzsiK'),(4,'mihail3','$2b$10$ehb0B.JNWU6Y0fb7M1IWd.9qo1Gi42i.tbgkY6IP75ksKSGamyZHG','$2b$10$9IZXx92Ef5ZYYILZESLomOpkax321ws60laCAzjhm8UfNpo6AOIe2'),(5,'mihail4','$2b$10$q4hcqN.QPsCbVXRxnIabIufHWKZ73.2HUr7sQh0lKVVGMs8D4OBl6','$2b$10$m2lPe.cZuPJJhpiRcJVQBe/UHT7D4WXVFPpzfYwX4iAVGS1I1kV4O'),(6,'mihail5','$2b$10$FNLRS4dZoWaaOtLY8Qg9F.nxmrjILHWTReOep3hS4.YRxj6K/VcZi','$2b$10$AKfku3RxvXFHSe5YN47IxebqD3cqsBCLxh4YrtHr8d.09FJfPxZM.'),(7,'asfsafsafsafasfas','$2b$10$C5xuNGzvihFD5NZKackhSeOSpLoNZFbj4SuqgLycROE3dplTc/TBq','$2b$10$lQJi9t57fzNXFWGuCu.NDu1L.SNtEbXWQVQ1nF0UMzUQ8JiRVlrZW'),(8,'mihailllll','$2b$10$GXm31eha6mqYNADi3F17E.OFmUpaCBUT.TiE2eLKo.mIM2TjtRf32','$2b$10$Qk01R857zE0o5L8bWeWFWeux/h1U0WR98xfayYV979/ELFINqZD8m'),(9,'mihail12','$2b$10$AdwxsOY3Bh7Dl3AEb4fIvuKS4nWS/jBE5iGCrvtewwA0/eSNrVH6m','$2b$10$dM8zPxRO.bJ0oDpUGw263.9QlDdlGMLBL0hPs0MygOTu4GNu8r7Ey'),(10,'mihail14','$2b$10$ObW6t8ky9fnjXmNoAvMWcOcjQU.x644FdSKHvkkivD.tIJze3fIi6','$2b$10$aEfAxOKuzuFox30krhWMreUeurIVvoQwhocBQ0RLEKH8Yv8LR9442'),(11,'ADMIN','$2b$10$seQ1kStAGjV0VwXOR.o6g.hB..TpuSZDYb6kZOeAGvRzYqbTEyYjO','$2b$10$tuGpR6oJfkB3wGlPeZUzJeL0v2EY16NoBdRXWhGIjT8paM0JGQWPK');
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
    IN p_hashedMatichen VARCHAR(255) 
)
BEGIN
    INSERT INTO users (username, password, user_private_id)
    VALUES (p_username, p_hashedPassword, p_hashedMatichen);
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

-- Dump completed on 2025-07-22 15:42:45
