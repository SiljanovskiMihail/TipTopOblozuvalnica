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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poraki`
--

LOCK TABLES `poraki` WRITE;
/*!40000 ALTER TABLE `poraki` DISABLE KEYS */;
INSERT INTO `poraki` VALUES (1,'Test Eden','testeden@example.com','Test 1'),(2,'Test Dva','testeden@example.com','Test Dva'),(3,'Test tri','testeden@example.com','Test 3'),(4,'Test Eden','testeden@example.com','test'),(5,'Test Pet','testpet@example.com','Test 5'),(6,'test shest','testeden@example.com','Test 6'),(7,'test sedum','testsedum@example.com','Test 7'),(8,'test osum','testsedum@example.com','Test 8'),(9,'test devet','testeden@example.com','Test 9'),(10,'test deset','testsedum@example.com','test 10'),(11,'test 11','testsedum@example.com','Test 11'),(12,'test dvanaeset','test12@example.com','Test12'),(13,'Test petnaeset','testeden@example.com','Test 15'),(14,'testshestaeset','testeden@example.com','Test 16');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'mihail','$2b$10$Smf96HyBK8EH8BJNssuiMu6ZS/IYy7Kb68NdzI.uvk8J/MYdy0kgS','$2b$10$nnEALPsaulESCyKay07yE.ZmRcWohlP415uK4gUvLQT45NYgmKrca'),(2,'mihail1','$2b$10$HsAJseO6ZDJ7Vkd6c2/PPO7W0gsAnC4gpljoQCEbmT4C62SKYd8Zm','$2b$10$qWyuioZjxA6o0rcZgLbL6eHKlj.cwh1n9Y0VKuQ5Coqpipm2wqEOG'),(3,'mihail2','$2b$10$Xj7Dk2fO1S82VjtZZjw.1.L4S1/y37VvuTlGtrZPiCZ1wI9xj6hei','$2b$10$fy.jNhAxCbLHoRgzEHkfqu9ozpQBIE.aabLXJhzcspAij9yQvzsiK'),(4,'mihail3','$2b$10$ehb0B.JNWU6Y0fb7M1IWd.9qo1Gi42i.tbgkY6IP75ksKSGamyZHG','$2b$10$9IZXx92Ef5ZYYILZESLomOpkax321ws60laCAzjhm8UfNpo6AOIe2'),(5,'mihail4','$2b$10$q4hcqN.QPsCbVXRxnIabIufHWKZ73.2HUr7sQh0lKVVGMs8D4OBl6','$2b$10$m2lPe.cZuPJJhpiRcJVQBe/UHT7D4WXVFPpzfYwX4iAVGS1I1kV4O'),(6,'mihail5','$2b$10$FNLRS4dZoWaaOtLY8Qg9F.nxmrjILHWTReOep3hS4.YRxj6K/VcZi','$2b$10$AKfku3RxvXFHSe5YN47IxebqD3cqsBCLxh4YrtHr8d.09FJfPxZM.'),(7,'asfsafsafsafasfas','$2b$10$C5xuNGzvihFD5NZKackhSeOSpLoNZFbj4SuqgLycROE3dplTc/TBq','$2b$10$lQJi9t57fzNXFWGuCu.NDu1L.SNtEbXWQVQ1nF0UMzUQ8JiRVlrZW'),(8,'mihailllll','$2b$10$GXm31eha6mqYNADi3F17E.OFmUpaCBUT.TiE2eLKo.mIM2TjtRf32','$2b$10$Qk01R857zE0o5L8bWeWFWeux/h1U0WR98xfayYV979/ELFINqZD8m'),(9,'mihail12','$2b$10$AdwxsOY3Bh7Dl3AEb4fIvuKS4nWS/jBE5iGCrvtewwA0/eSNrVH6m','$2b$10$dM8zPxRO.bJ0oDpUGw263.9QlDdlGMLBL0hPs0MygOTu4GNu8r7Ey'),(10,'mihail14','$2b$10$ObW6t8ky9fnjXmNoAvMWcOcjQU.x644FdSKHvkkivD.tIJze3fIi6','$2b$10$aEfAxOKuzuFox30krhWMreUeurIVvoQwhocBQ0RLEKH8Yv8LR9442');
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

    -- Optionally, you can return the last inserted ID
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-09 17:53:37
