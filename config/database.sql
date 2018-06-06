CREATE DATABASE IF NOT EXISTS `fb-clone`;
USE `fb-clone`;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `birthdate` varchar(10) DEFAULT NULL, # yyyy-mm-dd
  `photo` varchar(256) DEFAULT NULL,
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
  CONSTRAINT `friendship_a` FOREIGN KEY (`user_a_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `friendship_b` FOREIGN KEY (`user_b_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_friendship_request` (
  `requester_id` int(11) NOT NULL,
  `requested_id` int(11) NOT NULL,
  PRIMARY KEY (`requester_id`, `requested_id`),
  CONSTRAINT `requester` FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `requested` FOREIGN KEY (`requested_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_blocking` (
  `blocker_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  PRIMARY KEY (`blocker_id`, `blocked_id`),
  CONSTRAINT `blocker` FOREIGN KEY (`blocker_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `blocked` FOREIGN KEY (`blocked_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author_id` int(11) NOT NULL,
  `content` varchar(4096) DEFAULT NULL,
  `picture` varchar(256) DEFAULT NULL,
  `is_public` boolean DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `authorship` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `minimum_content` CHECK (
    `content` IS NOT NULL OR `picture` IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS `group_post` (
  `post_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  CONSTRAINT `itself` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  CONSTRAINT `belonging` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `content` varchar(1024) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `commentator` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `commented` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE
);

-- DO NOT INCLUDE THIS TRIGGER !!!
-- The hard approach for deleted user: allows a comment to exist even if the user is deleted.
-- CREATE TRIGGER `unauthored_comment`
-- BEFORE INSERT ON `comment` FOR EACH ROW
-- BEGIN
--   IF (NEW.`user_id` IS NULL) THEN
--     SIGNAL SQLSTATE '99900' SET MESSAGE_TEXT='The comment author can not be NULL';
--   END IF;
-- END;

CREATE TABLE IF NOT EXISTS `comment_answer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `content` varchar(1024) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `commentator` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `commented` FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON DELETE CASCADE
);

-- DO NOT INCLUDE THIS TRIGGER !!!
-- The hard approach for deleted user: allows a comment answer to exist even if the user is deleted.
-- CREATE TRIGGER `unauthored_comment_answer`
-- BEFORE INSERT ON `comment_answer` FOR EACH ROW
-- BEGIN
--   IF (NEW.`user_id` IS NULL) THEN
--     SIGNAL SQLSTATE '99900' SET MESSAGE_TEXT='The comment author can not be NULL';
--   END IF;
-- END;

CREATE TABLE IF NOT EXISTS `group` (
  `id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(512) NOT NULL DEFAULT '',
  `picture` varchar(256),
  PRIMARY KEY (`id`),
  CONSTRAINT `creator` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

-- The hard approach for deleted creator: keep the group but pass ownership to another member
-- inside a trigger on update that sets the creator_id to NULL. The member should be an admin,
-- otherwise the group is deleted.

CREATE TABLE IF NOT EXISTS `group_membership` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `is_admin` boolean DEFAULT 0,
  CONSTRAINT `membership` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `belonging` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `group_blocking` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  CONSTRAINT `blocked` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `from` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `group_membership_request` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  CONSTRAINT `requester` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `on` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE
);

