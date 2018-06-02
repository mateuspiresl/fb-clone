CREATE DATABASE IF NOT EXISTS `fb-clone`;
USE `fb-clone`;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `birthdate` TIMESTAMP NOT NULL,
  `photo` varchar(256) NOT NULL,
  `username` varchar(32) NOT NULL,
  `password` varchar(256) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE (`username`)
);

CREATE TABLE IF NOT EXISTS `user_friendship` (
  `user_a_id` int(11) NOT NULL,
  `user_b_id` int(11) NOT NULL,
  PRIMARY KEY (`user_a_id`, `user_b_id`),
  CONSTRAINT `friendship_a` FOREIGN KEY (`user_a_id`) REFERENCES `user`(`id`),
  CONSTRAINT `friendship_b` FOREIGN KEY (`user_b_id`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `user_friendship_request` (
  `requester_id` int(11) NOT NULL,
  `requested_id` int(11) NOT NULL,
  PRIMARY KEY (`requester_id`, `requested_id`),
  CONSTRAINT `requester` FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`),
  CONSTRAINT `requested` FOREIGN KEY (`requested_id`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `user_blocking` (
  `blocker_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  PRIMARY KEY (`blocker_id`, `blocked_id`),
  CONSTRAINT `blocker` FOREIGN KEY (`blocker_id`) REFERENCES `user`(`id`),
  CONSTRAINT `blocked` FOREIGN KEY (`blocked_id`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author_id` int(11) NOT NULL,
  `content` varchar(4096) DEFAULT NULL,
  `photo` varchar(256) DEFAULT NULL,
  `is_public` boolean DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `author` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`),
);

CREATE TABLE IF NOT EXISTS `feed_post` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
);

CREATE TABLE IF NOT EXISTS `group_post` (
  `post_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
);

CREATE TABLE IF NOT EXISTS `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `content` varchar(1024) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `commentator` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  CONSTRAINT `commented` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`)
);

CREATE TABLE IF NOT EXISTS `comment_answer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `content` varchar(1024) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `commentator` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  CONSTRAINT `commented` FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`)
);

CREATE TABLE IF NOT EXISTS `group` (
  `id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `creator` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `group_membership` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `is_admin` boolean DEFAULT 0,
  CONSTRAINT `name` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  CONSTRAINT `name` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`)
);

CREATE TABLE IF NOT EXISTS `group_blocking` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  CONSTRAINT `name` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  CONSTRAINT `name` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`)
);

CREATE TABLE IF NOT EXISTS `group_membership_request` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  CONSTRAINT `name` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  CONSTRAINT `name` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`)
);

