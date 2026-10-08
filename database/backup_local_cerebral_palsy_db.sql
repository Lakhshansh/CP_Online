-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: cerebral_palsy_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `fk_appointment_patient` (`patient_id`),
  KEY `fk_appointment_doctor` (`doctor_id`),
  KEY `fk_appointments_user` (`user_id`),
  CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_appointments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,1,'2026-09-05','10:00:00',NULL,'Scheduled',NULL,'2026-10-05 11:30:37',NULL),(2,2,2,'2026-09-06','11:30:00',NULL,'Scheduled',NULL,'2026-10-05 11:30:37',NULL),(3,3,3,'2026-09-07','02:00:00',NULL,'Completed',NULL,'2026-10-05 11:30:37',NULL),(4,1,1,'2026-09-05','10:00:00',NULL,'Scheduled',NULL,'2026-10-05 11:32:11',NULL),(5,2,2,'2026-09-06','11:30:00',NULL,'Scheduled',NULL,'2026-10-05 11:32:11',NULL),(6,3,3,'2026-09-07','02:00:00',NULL,'Completed',NULL,'2026-10-05 11:32:11',NULL),(7,17,17,'2026-09-30','01:45:00',NULL,'Completed',NULL,'2026-10-05 18:13:27',5);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caregivers`
--

DROP TABLE IF EXISTS `caregivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `caregivers` (
  `caregiver_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) DEFAULT NULL,
  `caregiver_name` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `relationship` varchar(100) DEFAULT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `emergency_contact` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`caregiver_id`),
  KEY `fk_caregiver_patient` (`patient_id`),
  KEY `fk_caregivers_user` (`user_id`),
  CONSTRAINT `fk_caregiver_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_caregivers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caregivers`
--

LOCK TABLES `caregivers` WRITE;
/*!40000 ALTER TABLE `caregivers` DISABLE KEYS */;
INSERT INTO `caregivers` VALUES (1,1,'Sunita Sharma','','Mother','9876510001','9876510001',NULL,NULL,'2026-10-05 11:47:40',NULL),(2,2,'Rajesh Verma','','Father','9876510002','9876510002',NULL,NULL,'2026-10-05 11:47:40',NULL),(3,3,'Meena Singh','','Mother','9876510003','9876510003',NULL,NULL,'2026-10-05 11:47:40',NULL),(4,1,'Sunita Sharma','','Mother','9876510001','9876510001',NULL,NULL,'2026-10-05 11:49:54',NULL),(5,2,'Rajesh Verma','','Father','9876510002','9876510002',NULL,NULL,'2026-10-05 11:49:54',NULL),(6,3,'Meena Singh','','Mother','9876510003','9876510003',NULL,NULL,'2026-10-05 11:49:54',NULL),(7,17,'raja','','monthr','9468650893','9988855555',NULL,NULL,'2026-10-05 19:00:24',5);
/*!40000 ALTER TABLE `caregivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctors` (
  `doctor_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `otp_verified` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`doctor_id`),
  KEY `fk_doctors_user` (`user_id`),
  CONSTRAINT `fk_doctors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,'Dr. Rajesh Kumar','Neurology','9876500001','rajesh@gmail.com',NULL,'2026-10-05 11:23:08',0),(2,'Dr. Priya Sharma','Physiotherapy','9876500002','priya@gmail.com',NULL,'2026-10-05 11:23:08',0),(3,'Dr. Amit Singh','Pediatrics','9876500003','amit@gmail.com',NULL,'2026-10-05 11:23:08',0),(4,'Dr. Rajesh Kumar','Neurology','9876500001','rajesh@gmail.com',NULL,'2026-10-05 11:25:56',0),(5,'Dr. Priya Sharma','Physiotherapy','9876500002','priya@gmail.com',NULL,'2026-10-05 11:25:56',0),(6,'Dr. Amit Singh','Pediatrics','9876500003','amit@gmail.com',NULL,'2026-10-05 11:25:56',0),(7,'Dr. Rajesh Kumar','Neurology','9876500001','rajesh@gmail.com',NULL,'2026-10-05 11:26:09',0),(8,'Dr. Priya Sharma','Physiotherapy','9876500002','priya@gmail.com',NULL,'2026-10-05 11:26:09',0),(9,'Dr. Amit Singh','Pediatrics','9876500003','amit@gmail.com',NULL,'2026-10-05 11:26:09',0),(10,'Dr. Rajesh Kumar','Neurology','9876500001','rajesh@gmail.com',NULL,'2026-10-05 11:30:37',0),(11,'Dr. Priya Sharma','Physiotherapy','9876500002','priya@gmail.com',NULL,'2026-10-05 11:30:37',0),(12,'Dr. Amit Singh','Pediatrics','9876500003','amit@gmail.com',NULL,'2026-10-05 11:30:37',0),(13,'Dr. Rajesh Kumar','Neurology','9876500001','rajesh@gmail.com',NULL,'2026-10-05 11:31:07',0),(14,'Dr. Priya Sharma','Physiotherapy','9876500002','priya@gmail.com',NULL,'2026-10-05 11:31:07',0),(15,'Dr. Amit Singh','Pediatrics','9876500003','amit@gmail.com',NULL,'2026-10-05 11:31:07',0),(17,'lucky','Speech Therapy','9468650893','joshilakhshansh@gmail.com',5,'2026-10-05 18:04:16',1);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercises` (
  `exercise_id` int(11) NOT NULL AUTO_INCREMENT,
  `exercise_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `therapy_type` varchar(100) DEFAULT NULL,
  `difficulty_level` varchar(50) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `repetitions` int(11) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`exercise_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercises`
--

LOCK TABLES `exercises` WRITE;
/*!40000 ALTER TABLE `exercises` DISABLE KEYS */;
INSERT INTO `exercises` VALUES (1,'Stretching Exercise','Basic stretching exercises for flexibility','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:40'),(2,'Balance Training','Exercises to improve body balance','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:40'),(3,'Hand Movement Exercise','Exercises to improve hand movement','Occupational Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:40'),(4,'Speech Practice','Practice exercises for speech improvement','Speech Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:40'),(5,'Stretching Exercise','Basic stretching exercises for flexibility','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:44'),(6,'Balance Training','Exercises to improve body balance','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:44'),(7,'Hand Movement Exercise','Exercises to improve hand movement','Occupational Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:44'),(8,'Speech Practice','Practice exercises for speech improvement','Speech Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:29:44'),(9,'Stretching Exercise','Basic stretching exercises for flexibility','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:30:37'),(10,'Balance Training','Exercises to improve body balance','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:30:37'),(11,'Hand Movement Exercise','Exercises to improve hand movement','Occupational Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:30:37'),(12,'Speech Practice','Practice exercises for speech improvement','Speech Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:30:37'),(13,'Stretching Exercise','Basic stretching exercises for flexibility','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:33:22'),(14,'Balance Training','Exercises to improve body balance','Physical Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:33:22'),(15,'Hand Movement Exercise','Exercises to improve hand movement','Occupational Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:33:22'),(16,'Speech Practice','Practice exercises for speech improvement','Speech Therapy',NULL,NULL,NULL,NULL,'2026-10-05 11:33:22');
/*!40000 ALTER TABLE `exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `patient_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `otp_verified` tinyint(1) NOT NULL DEFAULT 0,
  `address` varchar(500) DEFAULT NULL,
  `disability_details` text DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`patient_id`),
  KEY `fk_patients_user` (`user_id`),
  CONSTRAINT `fk_patients_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'Aarav Sharma',12,'Male','9876543210',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:23:08'),(2,'Ananya Verma',10,'Female','9876543211',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:23:08'),(3,'Rohan Singh',15,'Male','9876543212',NULL,0,'Delhi','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:23:08'),(4,'Aarav Sharma',12,'Male','9876543210',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:25:56'),(5,'Ananya Verma',10,'Female','9876543211',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:25:56'),(6,'Rohan Singh',15,'Male','9876543212',NULL,0,'Delhi','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:25:56'),(7,'Aarav Sharma',12,'Male','9876543210',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:26:09'),(8,'Ananya Verma',10,'Female','9876543211',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:26:09'),(9,'Rohan Singh',15,'Male','9876543212',NULL,0,'Delhi','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:26:09'),(10,'Aarav Sharma',12,'Male','9876543210',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:30:37'),(11,'Ananya Verma',10,'Female','9876543211',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:30:37'),(12,'Rohan Singh',15,'Male','9876543212',NULL,0,'Delhi','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:30:37'),(13,'Aarav Sharma',12,'Male','9876543210',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:31:07'),(14,'Ananya Verma',10,'Female','9876543211',NULL,0,'Jaipur','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:31:07'),(15,'Rohan Singh',15,'Male','9876543212',NULL,0,'Delhi','Cerebral Palsy','2026-09-02',NULL,'2026-10-05 11:31:07'),(17,'Lakhshansh joshi',8,'Male','9468650893','joshilakhshansh@gmail.com',1,'1','cp','2026-08-05',5,'2026-10-05 18:01:28');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress_reports`
--

DROP TABLE IF EXISTS `progress_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progress_reports` (
  `report_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `report_date` date DEFAULT NULL,
  `mobility_score` decimal(5,2) DEFAULT NULL,
  `improvement_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `fk_progress_patient` (`patient_id`),
  KEY `fk_progress_reports_user` (`user_id`),
  CONSTRAINT `fk_progress_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_progress_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress_reports`
--

LOCK TABLES `progress_reports` WRITE;
/*!40000 ALTER TABLE `progress_reports` DISABLE KEYS */;
INSERT INTO `progress_reports` VALUES (1,17,'2026-09-28',3.00,'yr','2026-10-05 18:15:37',5);
/*!40000 ALTER TABLE `progress_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapist_exercise_assignments`
--

DROP TABLE IF EXISTS `therapist_exercise_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `therapist_exercise_assignments` (
  `assignment_id` int(11) NOT NULL AUTO_INCREMENT,
  `therapist_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `assigned_date` date DEFAULT NULL,
  `repetitions` int(11) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Assigned',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `difficulty` enum('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  `target_type` enum('repetitions','duration') NOT NULL DEFAULT 'repetitions',
  `target_value` int(11) NOT NULL DEFAULT 10,
  `frequency` varchar(50) NOT NULL DEFAULT 'Daily',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `fk_assignment_therapist` (`therapist_id`),
  KEY `fk_assignment_exercise` (`exercise_id`),
  KEY `fk_assignment_patient` (`patient_id`),
  KEY `fk_therapist_exercise_assignments_user` (`user_id`),
  CONSTRAINT `fk_assignment_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`exercise_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignment_therapist` FOREIGN KEY (`therapist_id`) REFERENCES `therapists` (`therapist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_therapist_exercise_assignments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapist_exercise_assignments`
--

LOCK TABLES `therapist_exercise_assignments` WRITE;
/*!40000 ALTER TABLE `therapist_exercise_assignments` DISABLE KEYS */;
INSERT INTO `therapist_exercise_assignments` VALUES (1,20,16,17,NULL,NULL,NULL,'7u','Assigned','2026-10-05 18:55:17',5,'Medium','repetitions',10,'Daily','2026-10-23','2026-10-31');
/*!40000 ALTER TABLE `therapist_exercise_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapists`
--

DROP TABLE IF EXISTS `therapists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `therapists` (
  `therapist_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`therapist_id`),
  KEY `fk_therapists_user` (`user_id`),
  CONSTRAINT `fk_therapists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapists`
--

LOCK TABLES `therapists` WRITE;
/*!40000 ALTER TABLE `therapists` DISABLE KEYS */;
INSERT INTO `therapists` VALUES (1,'Rahul Mehta','Physical Therapy','9876500011',NULL,NULL,'2026-10-05 11:23:08'),(2,'Sneha Gupta','Occupational Therapy','9876500012',NULL,NULL,'2026-10-05 11:23:08'),(3,'Vikram Joshi','Speech Therapy','9876500013',NULL,NULL,'2026-10-05 11:23:08'),(4,'Rahul Mehta','Physical Therapy','9876500011',NULL,NULL,'2026-10-05 11:25:56'),(5,'Sneha Gupta','Occupational Therapy','9876500012',NULL,NULL,'2026-10-05 11:25:56'),(6,'Vikram Joshi','Speech Therapy','9876500013',NULL,NULL,'2026-10-05 11:25:56'),(7,'Rahul Mehta','Physical Therapy','9876500011',NULL,NULL,'2026-10-05 11:26:09'),(8,'Sneha Gupta','Occupational Therapy','9876500012',NULL,NULL,'2026-10-05 11:26:09'),(9,'Vikram Joshi','Speech Therapy','9876500013',NULL,NULL,'2026-10-05 11:26:09'),(10,'Rahul Mehta','Physical Therapy','9876500011',NULL,NULL,'2026-10-05 11:30:37'),(11,'Sneha Gupta','Occupational Therapy','9876500012',NULL,NULL,'2026-10-05 11:30:37'),(12,'Vikram Joshi','Speech Therapy','9876500013',NULL,NULL,'2026-10-05 11:30:37'),(13,'Rahul Mehta','Physical Therapy','9876500011',NULL,NULL,'2026-10-05 11:31:07'),(14,'Sneha Gupta','Occupational Therapy','9876500012',NULL,NULL,'2026-10-05 11:31:07'),(15,'Vikram Joshi','Speech Therapy','9876500013',NULL,NULL,'2026-10-05 11:31:07'),(16,'Rahul Mehta','Physical Therapy','9876500011',NULL,NULL,'2026-10-05 11:33:45'),(17,'Sneha Gupta','Occupational Therapy','9876500012',NULL,NULL,'2026-10-05 11:33:45'),(18,'Vikram Joshi','Speech Therapy','9876500013',NULL,NULL,'2026-10-05 11:33:45'),(19,'lucky','Occupational Therapy','9468650893',NULL,2,'2026-10-05 12:54:24'),(20,'lucky','Physical Therapy','9468650893',NULL,5,'2026-10-05 18:12:47');
/*!40000 ALTER TABLE `therapists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapy_sessions`
--

DROP TABLE IF EXISTS `therapy_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `therapy_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `therapist_id` int(11) DEFAULT NULL,
  `exercise_id` int(11) DEFAULT NULL,
  `session_date` date DEFAULT NULL,
  `session_time` time DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `session_type` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `progress_notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `fk_therapy_patient` (`patient_id`),
  KEY `fk_therapy_therapist` (`therapist_id`),
  KEY `fk_therapy_sessions_user` (`user_id`),
  CONSTRAINT `fk_therapy_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_therapy_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_therapy_therapist` FOREIGN KEY (`therapist_id`) REFERENCES `therapists` (`therapist_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapy_sessions`
--

LOCK TABLES `therapy_sessions` WRITE;
/*!40000 ALTER TABLE `therapy_sessions` DISABLE KEYS */;
INSERT INTO `therapy_sessions` VALUES (1,1,1,1,'2026-10-05','10:00:00',45,'Physical Therapy','Stretching and mobility exercises','Patient completed basic stretching exercises','Completed','2026-10-05 12:15:38',NULL),(2,2,2,3,'2026-10-05','11:00:00',45,'Occupational Therapy','Hand movement and coordination exercises','Improvement observed in hand movement','Completed','2026-10-05 12:15:38',NULL),(3,3,3,4,'2026-10-05','12:00:00',30,'Speech Therapy','Speech practice exercises','Patient participated in speech practice','Scheduled','2026-10-05 12:15:38',NULL),(4,17,20,7,'2026-10-07',NULL,1,NULL,'jmn',NULL,'Completed','2026-10-05 18:29:35',5);
/*!40000 ALTER TABLE `therapy_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(30) DEFAULT 'User',
  `hospital_name` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `hospital_address` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `doctor_specialization` varchar(255) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `document_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','scrypt:32768:8:1$ouZSiWH84AC97HTC$c22f3db272aa8fff760801a67d1179757824d3f717c908c214e2cdfb43dfdc5059ed6a4106cc71dba9b0816ffc4e3023e16bae353c9457f21a39f0e384f875e6','Admin',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02 18:16:58'),(2,'doctor1','scrypt:32768:8:1$CjYiU1M2LvKS37Yr$4547504edbd6a6385d9c9495d1998d5be29b1d738bc495708bc228ee5a7d1eb44d0f794827ec7dd757de6af418991a495251563b4d17600018eb02dc81bf72d8','Doctor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'user_2_1791204650.jpg',NULL,'2026-10-02 18:16:58'),(3,'therapist1','therapy123','Therapist',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02 18:16:58'),(4,'caregiver1','care123','Caregiver',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02 18:16:58'),(5,'raj123','scrypt:32768:8:1$uj659aV2kl6Iejrh$1a058b377c78d6878a92b417faf62bc2313daeddae4e830a0e99ed00d04946aa1fd20033fabcb55a3cceefb56fafe73603a7b07e68d430c917c8d9afecca99ea','Admin','SMS HOSPTL','9468650893','lakhshanshj@gmail.com',NULL,NULL,NULL,NULL,'JAYESH','Neurologist','user_5_1791223907.png','doc_1791206870_6063.pdf','2026-10-05 13:30:27');
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

-- Dump completed on 2026-10-07 20:14:46
