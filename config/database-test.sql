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

; // # SET FOREIGN_KEY_CHECKS=0; DROP TABLE bericht; SET FOREIGN_KEY_CHECKS=1;
