CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `password` varchar(256) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE (`username`)
);

CREATE TABLE IF NOT EXISTS `user_blocking` (
  `blocker_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  PRIMARY KEY (`blocker_id`, `blocked_id`)
);

CREATE TABLE IF NOT EXISTS `user_friendship_request` (
  `requester_id` int(11) NOT NULL,
  `requested_id` int(11) NOT NULL,
  PRIMARY KEY (`requester_id`, `requested_id`),
  CONSTRAINT `requester` FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`),
  CONSTRAINT `requested` FOREIGN KEY (`requested_id`) REFERENCES `user`(`id`)
);

SET FOREIGN_KEY_CHECKS=0; DROP TABLE `user`; SET FOREIGN_KEY_CHECKS=1;
