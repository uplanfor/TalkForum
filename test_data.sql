/*
 Navicat Premium Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 80406 (8.4.6)
 Source Host           : localhost:3306
 Source Schema         : talkforum

 Target Server Type    : MySQL
 Target Server Version : 80406 (8.4.6)
 File Encoding         : 65001

 Date: 20/12/2025 13:21:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for club
-- ----------------------------
DROP TABLE IF EXISTS `club`;
CREATE TABLE `club`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '圈子唯一标识',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '圈子名称',
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '圈子描述',
  `avatar_link` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '/icon.ico' COMMENT '头像链接（按规范设默认值）',
  `background_link` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '背景链接',
  `creator_id` bigint NOT NULL COMMENT '创建者用户ID（按规范设为非空）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `member_count` int NOT NULL DEFAULT 0 COMMENT '成员人数（通过club_member表同步更新）',
  `is_deleted` tinyint NOT NULL DEFAULT 0 COMMENT '是否被删掉(1=是，0=否)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_club_name`(`name` ASC) USING BTREE COMMENT '圈子名称唯一',
  INDEX `fk_club_creator`(`creator_id` ASC) USING BTREE COMMENT '关联创建者',
  INDEX `idx_club_created_at`(`created_at` ASC) USING BTREE COMMENT '按创建时间排序',
  INDEX `idx_club_member_count`(`member_count` ASC) USING BTREE COMMENT '按成员数筛选',
  INDEX `idx_club_is_deleted`(`is_deleted` ASC) USING BTREE COMMENT '筛选未删除圈子',
  CONSTRAINT `fk_club_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '圈子表（储存所有的圈子；用户删除时圈子软删掉，变为不可加入）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of club
-- ----------------------------

-- ----------------------------
-- Table structure for club_apply_create
-- ----------------------------
DROP TABLE IF EXISTS `club_apply_create`;
CREATE TABLE `club_apply_create`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '申请唯一标识',
  `user_id` bigint NOT NULL COMMENT '申请人用户ID',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '申请创建的圈子名称',
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '圈子描述',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'PENDING' COMMENT '申请状态（PENDING/PASS/REJECT）',
  `handled_by` bigint NULL DEFAULT NULL COMMENT '处理人用户ID（管理员/风纪）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '处理时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_apply_create_user`(`user_id` ASC) USING BTREE COMMENT '关联申请人',
  INDEX `fk_apply_create_handler`(`handled_by` ASC) USING BTREE COMMENT '关联处理人',
  INDEX `idx_apply_create_status`(`status` ASC) USING BTREE COMMENT '按状态筛选申请',
  INDEX `idx_apply_create_name`(`name` ASC) USING BTREE COMMENT '按圈子名称查询申请',
  INDEX `idx_apply_create_created`(`created_at` ASC) USING BTREE COMMENT '按申请时间排序',
  CONSTRAINT `fk_apply_create_handler` FOREIGN KEY (`handled_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_apply_create_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '圈子创建申请表（记录所有圈子申请记录，申请人删除时级联删除申请；处理人删除时保留申请）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of club_apply_create
-- ----------------------------

-- ----------------------------
-- Table structure for club_apply_join
-- ----------------------------
DROP TABLE IF EXISTS `club_apply_join`;
CREATE TABLE `club_apply_join`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '申请唯一标识',
  `user_id` bigint NOT NULL COMMENT '申请人用户ID',
  `club_id` bigint NOT NULL COMMENT '申请加入的圈子ID',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'PENDING' COMMENT '申请状态（PENDING/PASS/REJECT）',
  `handled_by` bigint NULL DEFAULT NULL COMMENT '处理人用户ID（圈子创建者/管理员）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '处理时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_apply_join_user`(`user_id` ASC) USING BTREE COMMENT '关联申请人',
  INDEX `fk_apply_join_club`(`club_id` ASC) USING BTREE COMMENT '关联圈子',
  INDEX `fk_apply_join_handler`(`handled_by` ASC) USING BTREE COMMENT '关联处理人',
  INDEX `idx_apply_join_status`(`status` ASC) USING BTREE COMMENT '按状态筛选申请',
  INDEX `idx_apply_join_user_club`(`user_id` ASC, `club_id` ASC) USING BTREE COMMENT '规范要求：复合索引（用户+圈子）',
  CONSTRAINT `fk_apply_join_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_apply_join_handler` FOREIGN KEY (`handled_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_apply_join_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '圈子加入申请表（记录圈子加入记录，申请人删除时级联删除申请；圈子删除时级联删除申请；处理人删除时保留申请）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of club_apply_join
-- ----------------------------

-- ----------------------------
-- Table structure for club_member
-- ----------------------------
DROP TABLE IF EXISTS `club_member`;
CREATE TABLE `club_member`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '成员关系唯一标识',
  `club_id` bigint NOT NULL COMMENT '关联圈子ID',
  `user_id` bigint NOT NULL COMMENT '关联用户ID',
  `role` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'MEMBER' COMMENT '成员角色（OWNER/MEMBER）',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_club_user`(`club_id` ASC, `user_id` ASC) USING BTREE COMMENT '规范要求：复合唯一索引（圈子+用户）',
  UNIQUE INDEX `uk_user_club`(`user_id` ASC, `club_id` ASC) USING BTREE COMMENT '规范要求：复合唯一索引（用户+圈子）',
  INDEX `fk_club_member_club`(`club_id` ASC) USING BTREE COMMENT '关联圈子',
  INDEX `fk_club_member_user`(`user_id` ASC) USING BTREE COMMENT '关联用户',
  INDEX `idx_club_member_role`(`role` ASC) USING BTREE COMMENT '按角色筛选成员',
  INDEX `idx_club_member_joined`(`joined_at` ASC) USING BTREE COMMENT '按加入时间排序',
  CONSTRAINT `fk_club_member_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_club_member_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '圈子成员表（查询圈子所有成员，圈子删除时级联删除成员关系；用户删除时级联删除成员关系）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of club_member
-- ----------------------------

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论唯一标识',
  `post_id` bigint NOT NULL COMMENT '关联帖子ID',
  `user_id` bigint NOT NULL COMMENT '评论者用户ID',
  `root_id` bigint NULL DEFAULT NULL COMMENT '根评论ID（顶级评论为null）',
  `parent_id` bigint NULL DEFAULT NULL COMMENT '关联回复的评论ID（顶级评论为null）',
  `content` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论内容',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'PENDING' COMMENT '状态（PENDING/PASS/REJECT/DELETE）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `like_count` int NOT NULL DEFAULT 0 COMMENT '点赞数量',
  `comment_count` int NOT NULL DEFAULT 0 COMMENT '回复数量',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_comment_post_status_created`(`post_id` ASC, `status` ASC, `created_at` ASC) USING BTREE COMMENT '规范要求：复合唯一索引（帖子+状态+创建时间）',
  INDEX `fk_comment_post`(`post_id` ASC) USING BTREE COMMENT '关联帖子',
  INDEX `fk_comment_user`(`user_id` ASC) USING BTREE COMMENT '关联评论者',
  INDEX `fk_comment_root`(`root_id` ASC) USING BTREE COMMENT '关联根评论',
  INDEX `fk_comment_parent`(`parent_id` ASC) USING BTREE COMMENT '关联父评论',
  INDEX `idx_comment_status`(`status` ASC) USING BTREE COMMENT '按状态筛选评论',
  INDEX `idx_comment_created_at`(`created_at` ASC) USING BTREE COMMENT '按创建时间排序',
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comment_root` FOREIGN KEY (`root_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 175 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评论表（储存所有评论，帖子删除时级联删除评论；评论者删除时级联删除评论；父评论删除时级联删除子评论）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment
-- ----------------------------
INSERT INTO `comment` VALUES (1, 3, 1, NULL, NULL, '棒棒哒!', 'DELETED', '2025-12-09 16:41:07', 1, 1);
INSERT INTO `comment` VALUES (2, 3, 1, 1, 1, '好!', 'PASS', '2025-12-09 16:41:23', 1, 0);
INSERT INTO `comment` VALUES (3, 4, 1, NULL, NULL, '好棒棒！', 'PASS', '2025-12-11 16:46:09', 1, 0);
INSERT INTO `comment` VALUES (4, 9, 1, NULL, NULL, '1', 'PASS', '2025-12-11 17:10:40', 0, 0);
INSERT INTO `comment` VALUES (5, 9, 1, NULL, NULL, '2', 'PASS', '2025-12-11 17:10:42', 0, 0);
INSERT INTO `comment` VALUES (6, 9, 1, NULL, NULL, '3', 'PASS', '2025-12-11 17:10:45', 0, 0);
INSERT INTO `comment` VALUES (7, 9, 1, NULL, NULL, '4', 'PASS', '2025-12-11 17:10:48', 0, 0);
INSERT INTO `comment` VALUES (8, 9, 1, NULL, NULL, '5', 'PASS', '2025-12-11 17:10:51', 0, 0);
INSERT INTO `comment` VALUES (9, 9, 1, NULL, NULL, '6', 'PASS', '2025-12-11 17:10:53', 0, 0);
INSERT INTO `comment` VALUES (10, 9, 1, NULL, NULL, '7', 'PASS', '2025-12-11 17:10:56', 0, 0);
INSERT INTO `comment` VALUES (11, 9, 1, NULL, NULL, '8', 'PASS', '2025-12-11 17:10:59', 0, 0);
INSERT INTO `comment` VALUES (12, 9, 1, NULL, NULL, '9', 'PASS', '2025-12-11 17:11:03', 0, 0);
INSERT INTO `comment` VALUES (13, 9, 1, NULL, NULL, '10', 'PASS', '2025-12-11 17:11:27', 0, 0);
INSERT INTO `comment` VALUES (14, 9, 1, NULL, NULL, '11', 'PASS', '2025-12-11 17:11:30', 0, 0);
INSERT INTO `comment` VALUES (15, 9, 1, NULL, NULL, '12', 'PASS', '2025-12-11 19:05:12', 0, 0);
INSERT INTO `comment` VALUES (16, 9, 1, NULL, NULL, '13', 'PASS', '2025-12-11 19:05:16', 0, 0);
INSERT INTO `comment` VALUES (17, 9, 1, NULL, NULL, '14', 'PASS', '2025-12-11 19:05:22', 0, 0);
INSERT INTO `comment` VALUES (18, 9, 1, NULL, NULL, '15', 'PASS', '2025-12-11 19:05:26', 0, 0);
INSERT INTO `comment` VALUES (19, 9, 1, NULL, NULL, '16', 'PASS', '2025-12-11 19:05:30', 0, 0);
INSERT INTO `comment` VALUES (20, 9, 1, NULL, NULL, '17', 'PASS', '2025-12-11 19:05:34', 0, 0);
INSERT INTO `comment` VALUES (21, 9, 1, NULL, NULL, '18', 'PASS', '2025-12-11 19:05:38', 0, 0);
INSERT INTO `comment` VALUES (22, 9, 1, NULL, NULL, '19', 'PASS', '2025-12-11 19:06:22', 0, 0);
INSERT INTO `comment` VALUES (23, 9, 1, NULL, NULL, '20', 'PASS', '2025-12-11 19:06:27', 0, 0);
INSERT INTO `comment` VALUES (24, 9, 1, NULL, NULL, 'In the quiet afternoon, I love to sit by the window and read a good book with a cup of tea.', 'REJECT', '2025-12-11 19:12:37', 0, 0);
INSERT INTO `comment` VALUES (26, 9, 1, NULL, NULL, 'In the quiet afternoon, I love to sit by the window and read a good book with a cup of tea.', 'REJECT', '2025-12-11 19:12:56', 0, 0);
INSERT INTO `comment` VALUES (47, 9, 1, NULL, NULL, 'Connecting with distant family members via video calls makes distance feel smaller.', 'REJECT', '2025-12-11 19:12:57', 0, 0);
INSERT INTO `comment` VALUES (76, 9, 1, NULL, NULL, 'In the quiet afternoon, I love to sit by the window and read a good book with a cup of tea.', 'REJECT', '2025-12-11 19:14:25', 0, 0);
INSERT INTO `comment` VALUES (78, 9, 1, NULL, NULL, 'In the quiet afternoon, I love to sit by the window and read a good book with a cup of tea.', 'PASS', '2025-12-11 19:16:37', 0, 0);
INSERT INTO `comment` VALUES (80, 9, 1, NULL, NULL, '21', 'PASS', '2025-12-11 19:17:37', 0, 0);
INSERT INTO `comment` VALUES (81, 9, 1, NULL, NULL, 'In the quiet afternoon, I love to sit by the window and read a good book with a cup of tea.', 'PASS', '2025-12-11 19:20:06', 0, 0);
INSERT INTO `comment` VALUES (93, 9, 1, NULL, NULL, 'Volunteering at a local shelter reminds me to be grateful for what I have in life.', 'PASS', '2025-12-11 19:20:07', 0, 0);
INSERT INTO `comment` VALUES (108, 9, 1, NULL, NULL, 'Organizing my closet and donating unused clothes gives me a sense of calm and purpose.', 'PASS', '2025-12-11 19:20:08', 0, 0);
INSERT INTO `comment` VALUES (123, 9, 1, NULL, NULL, 'Following local food bloggers leads to discovering hidden culinary treasures in my city.', 'PASS', '2025-12-11 19:20:09', 0, 0);
INSERT INTO `comment` VALUES (131, 9, 1, NULL, NULL, 'In the quiet afternoon, I love to sit by the window and read a good book with a cup of tea.', 'PASS', '2025-12-11 19:22:43', 0, 0);
INSERT INTO `comment` VALUES (132, 9, 1, NULL, NULL, 'Walking along the beach at sunset is one of the most peaceful experiences I have ever had.', 'PASS', '2025-12-11 19:22:44', 0, 0);
INSERT INTO `comment` VALUES (133, 9, 1, NULL, NULL, 'Learning a new language opens up a whole new world of culture and connection with others.', 'PASS', '2025-12-11 19:22:45', 0, 0);
INSERT INTO `comment` VALUES (134, 9, 1, NULL, NULL, 'Cooking homemade meals for my family makes every evening feel warm and meaningful.', 'PASS', '2025-12-11 19:22:46', 0, 0);
INSERT INTO `comment` VALUES (135, 9, 1, NULL, NULL, 'Exploring local hiking trails on weekends helps me recharge and appreciate nature\'s beauty.', 'PASS', '2025-12-11 19:22:47', 0, 0);
INSERT INTO `comment` VALUES (136, 9, 1, NULL, NULL, 'Listening to soft music while working helps me focus better and reduce stress levels.', 'PASS', '2025-12-11 19:22:48', 0, 0);
INSERT INTO `comment` VALUES (137, 9, 1, NULL, NULL, 'Spending time with old friends and reminiscing about childhood is always a joy.', 'PASS', '2025-12-11 19:22:49', 0, 0);
INSERT INTO `comment` VALUES (138, 9, 1, NULL, NULL, 'Gardening teaches patience and rewards you with beautiful flowers and fresh vegetables.', 'PASS', '2025-12-11 19:22:50', 0, 0);
INSERT INTO `comment` VALUES (139, 9, 1, NULL, NULL, 'Traveling to small towns instead of big cities lets you experience authentic local life.', 'PASS', '2025-12-11 19:22:51', 0, 0);
INSERT INTO `comment` VALUES (140, 9, 1, NULL, NULL, 'Writing down thoughts in a journal every night helps me process my emotions and reflect.', 'PASS', '2025-12-11 19:22:52', 0, 0);
INSERT INTO `comment` VALUES (141, 9, 1, NULL, NULL, 'Playing board games with my kids creates precious memories that last a lifetime.', 'PASS', '2025-12-11 19:22:53', 0, 1);
INSERT INTO `comment` VALUES (142, 9, 1, NULL, NULL, 'Drinking warm lemon water every morning boosts my immune system and energy levels.', 'PASS', '2025-12-11 19:22:54', 0, 2);
INSERT INTO `comment` VALUES (143, 9, 1, NULL, NULL, 'Volunteering at a local shelter reminds me to be grateful for what I have in life.', 'PASS', '2025-12-11 19:22:55', 0, 0);
INSERT INTO `comment` VALUES (144, 9, 1, NULL, NULL, 'Watching classic movies with my partner on rainy days is the perfect way to relax.', 'PASS', '2025-12-11 19:22:56', 0, 0);
INSERT INTO `comment` VALUES (145, 9, 1, NULL, NULL, 'Practicing yoga every morning improves my flexibility and mental clarity throughout the day.', 'PASS', '2025-12-11 19:22:57', 0, 0);
INSERT INTO `comment` VALUES (146, 9, 1, NULL, NULL, 'Trying new coffee shops around the city is a small pleasure that brightens my week.', 'PASS', '2025-12-11 19:22:58', 0, 0);
INSERT INTO `comment` VALUES (147, 9, 1, NULL, NULL, 'Reading biographies of inspiring people motivates me to pursue my own goals fearlessly.', 'PASS', '2025-12-11 19:22:59', 0, 0);
INSERT INTO `comment` VALUES (148, 9, 1, NULL, NULL, 'Taking photos of everyday moments helps me capture the beauty in the ordinary.', 'PASS', '2025-12-11 19:23:00', 1, 14);
INSERT INTO `comment` VALUES (149, 9, 1, 142, 142, 'a', 'PASS', '2025-12-11 19:40:00', 0, 0);
INSERT INTO `comment` VALUES (150, 9, 1, 141, 141, 'b', 'PASS', '2025-12-11 19:40:04', 0, 0);
INSERT INTO `comment` VALUES (151, 9, 1, 142, 142, 'c', 'PASS', '2025-12-11 19:40:07', 0, 0);
INSERT INTO `comment` VALUES (152, 9, 1, 148, 148, 'a', 'PASS', '2025-12-11 19:40:14', 0, 0);
INSERT INTO `comment` VALUES (153, 9, 1, 148, 148, 'b', 'PASS', '2025-12-11 19:40:18', 0, 0);
INSERT INTO `comment` VALUES (154, 9, 1, 148, 148, 'c', 'PASS', '2025-12-11 19:40:21', 0, 0);
INSERT INTO `comment` VALUES (155, 9, 1, 148, 148, 'd', 'PASS', '2025-12-11 19:40:24', 0, 0);
INSERT INTO `comment` VALUES (156, 9, 1, 148, 148, 'e', 'PASS', '2025-12-11 19:40:29', 0, 0);
INSERT INTO `comment` VALUES (157, 9, 1, 148, 148, 'f', 'PASS', '2025-12-11 19:40:44', 0, 0);
INSERT INTO `comment` VALUES (158, 9, 1, NULL, NULL, 'g', 'DELETED', '2025-12-11 19:40:47', 0, 0);
INSERT INTO `comment` VALUES (159, 9, 1, NULL, NULL, 'h', 'DELETED', '2025-12-11 19:40:49', 0, 0);
INSERT INTO `comment` VALUES (160, 9, 1, NULL, NULL, 'i', 'DELETED', '2025-12-11 19:40:52', 0, 0);
INSERT INTO `comment` VALUES (161, 9, 1, NULL, NULL, 'j', 'DELETED', '2025-12-11 19:40:55', 0, 0);
INSERT INTO `comment` VALUES (162, 9, 1, NULL, NULL, 'k', 'DELETED', '2025-12-11 19:40:57', 0, 0);
INSERT INTO `comment` VALUES (163, 9, 1, 148, 148, 'g', 'PASS', '2025-12-11 19:41:22', 0, 0);
INSERT INTO `comment` VALUES (164, 9, 1, 148, 148, 'h', 'PASS', '2025-12-11 19:41:26', 0, 0);
INSERT INTO `comment` VALUES (165, 9, 1, 148, 148, 'i', 'PASS', '2025-12-11 19:41:29', 0, 0);
INSERT INTO `comment` VALUES (166, 9, 1, 148, 148, 'j', 'PASS', '2025-12-11 19:41:33', 0, 0);
INSERT INTO `comment` VALUES (167, 9, 1, 148, 148, 'k', 'PASS', '2025-12-11 19:41:36', 0, 0);
INSERT INTO `comment` VALUES (168, 9, 1, 148, 148, 'l', 'PASS', '2025-12-11 19:41:40', 0, 0);
INSERT INTO `comment` VALUES (169, 9, 1, 148, 148, 'm', 'PASS', '2025-12-11 19:41:43', 0, 0);
INSERT INTO `comment` VALUES (170, 9, 1, 148, 148, 'n', 'PASS', '2025-12-11 19:41:47', 0, 0);
INSERT INTO `comment` VALUES (171, 28, 1, NULL, NULL, 'Also help me!\nerror C2025: \'friend->wallet\' : cannot modify member - object here (KFC_CrazyThursday_Protocol Violation)\n  ---> main.cpp(42) : see reference to object of type \'Friend\' being accessed\n  note: KFC_CrazyThursday_Protocol §5.0 requires:\n        To authorize ¥50 deduction, execute \'cl /BLess /KFC_CrazyThursday\' in Developer Command Prompt.\n        Compliance Reward: Unlimited virtual KFC emoji wings (🍗) + eternal Thursday vibe.\n  note: This violation may result in \'Friend\' object refusing to share fries in future scopes.', 'PASS', '2025-12-11 21:07:44', 1, 0);
INSERT INTO `comment` VALUES (172, 28, 3, NULL, NULL, '这个怎么说\nException in thread \"main\" com.kfc.protocol.KFCCrazyThursdayProtocolViolationException: FATAL: Unauthorized reflection access to KFCWallet.class\n	Caused by: java.lang.IllegalAccessException: Cannot access private field \'double secretThursdayDiscount\' in class com.kfc.core.KFCWallet\n		at java.base/jdk.internal.reflect.Reflection.newIllegalAccessException(Reflection.java:392)\n		at java.base/java.lang.reflect.AccessibleObject.checkAccess(AccessibleObject.java:674)\n		at java.base/java.lang.reflect.Field.checkAccess(Field.java:1090)\n		at java.base/java.lang.reflect.Field.get(Field.java:416)\n		at com.kfc.meme.CrazyThursdayHack.forceDeduct50Yuan(CrazyThursdayHack.java:666)\n		at com.kfc.meme.CrazyThursdayHack.main(CrazyThursdayHack.java:42)\n	Suppressed: com.kfc.punishment.KFCMemberBlacklistException: Member ID #888888 marked as \'FRIED_CHICKEN_ENEMY\'\n		at com.kfc.security.KFCSecurityManager.enforceThursdayRules(KFCSecurityManager.java:2025)\n		at com.kfc.core.KFCWallet.invoke(KFCWallet.java:1314)\nNote: \n  1. Your reflection attempt to modify \'secretThursdayDiscount\' violated KFC Crazy Thursday Protocol §9.1.1 - \"NO HACKING FOR WINGS\"\n  2. Remediation: \n     - Compile KFCApp.java with \'-Dkfc.loyalty=MAX\' and invoke com.kfc.api.registerLoyalty() with 3x Original Recipe Chicken purchase proof\n     - Execute \'java -cp kfc-core-2025.jar com.kfc.penance.EarnForgiveness\' (requires 10x Spicy Wing consumption within 24h)\n  3. Consequences of non-compliance:\n     - All KFCMember object methods (e.g., orderWingBucket(), claimFreeChicken()) will be redirected to McDonaldsAPI.class\n     - Your KFC account \'spicy_lover_666\' will be permanently locked from Crazy Thursday discounts\n     - JVM will auto-generate a complaint to KFC HQ: \"USER #888888 TRIED TO CHEAT FOR 50¥ CHICKEN\"\n  4. Bonus punishment: Your next 10 KFC orders will spawn a \'RandomSoggyFry\' exception (fries arrive cold)', 'PASS', '2025-12-11 21:15:25', 1, 1);
INSERT INTO `comment` VALUES (173, 30, 1, NULL, NULL, '棒棒哒!', 'PASS', '2025-12-20 12:20:45', 0, 0);
INSERT INTO `comment` VALUES (174, 28, 1, 172, 172, '学Java的结果', 'PASS', '2025-12-20 12:21:21', 1, 0);

-- ----------------------------
-- Table structure for interaction
-- ----------------------------
DROP TABLE IF EXISTS `interaction`;
CREATE TABLE `interaction`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '互动记录唯一标识',
  `user_id` bigint NOT NULL COMMENT '发起互动的用户ID（谁进行互动）',
  `interact_content` tinyint NOT NULL COMMENT '互动内容',
  `interact_target_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '被互动的对象类型（COMMENT=评论/POST=帖子/USER=用户）',
  `interact_target` bigint NOT NULL COMMENT '被互动的对象ID（如帖子ID/评论ID/用户ID）',
  `interact_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '互动时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_interact`(`user_id` ASC, `interact_target_type` ASC, `interact_target` ASC) USING BTREE COMMENT '规范要求：复合唯一索引（用户+互动类型+互动对象）',
  INDEX `idx_interact_target`(`interact_target_type` ASC, `interact_target` ASC, `interact_content` ASC) USING BTREE COMMENT '规范要求：复合索引（统计对象互动数量）',
  INDEX `idx_interaction_created`(`interact_date` ASC) USING BTREE COMMENT '按互动时间排序',
  CONSTRAINT `fk_interaction_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '互动表（记录互动记录，如点赞、踩，用户删除时级联删除互动记录）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of interaction
-- ----------------------------
INSERT INTO `interaction` VALUES (1, 1, 1, 'POST', 1, '2025-12-11 16:50:26');
INSERT INTO `interaction` VALUES (5, 1, 1, 'POST', 2, '2025-12-11 16:45:30');
INSERT INTO `interaction` VALUES (11, 1, 1, 'COMMENT', 1, '2025-12-09 16:41:27');
INSERT INTO `interaction` VALUES (12, 1, 1, 'COMMENT', 2, '2025-12-09 16:41:28');
INSERT INTO `interaction` VALUES (15, 2, 1, 'POST', 4, '2025-12-11 16:45:11');
INSERT INTO `interaction` VALUES (16, 2, 1, 'POST', 2, '2025-12-11 16:45:14');
INSERT INTO `interaction` VALUES (17, 1, 1, 'POST', 4, '2025-12-11 16:45:29');
INSERT INTO `interaction` VALUES (19, 2, 1, 'COMMENT', 3, '2025-12-11 16:47:37');
INSERT INTO `interaction` VALUES (21, 1, 1, 'POST', 11, '2025-12-11 16:59:47');
INSERT INTO `interaction` VALUES (22, 1, 1, 'POST', 9, '2025-12-11 17:11:37');
INSERT INTO `interaction` VALUES (23, 1, 1, 'POST', 27, '2025-12-11 21:01:51');
INSERT INTO `interaction` VALUES (24, 3, 1, 'COMMENT', 172, '2025-12-11 21:18:31');
INSERT INTO `interaction` VALUES (25, 3, 1, 'COMMENT', 171, '2025-12-11 21:18:32');
INSERT INTO `interaction` VALUES (26, 3, 1, 'POST', 28, '2025-12-11 21:21:45');
INSERT INTO `interaction` VALUES (27, 1, 1, 'POST', 28, '2025-12-12 17:19:15');
INSERT INTO `interaction` VALUES (28, 1, 1, 'POST', 14, '2025-12-12 17:19:18');
INSERT INTO `interaction` VALUES (29, 1, 1, 'COMMENT', 148, '2025-12-14 23:23:52');
INSERT INTO `interaction` VALUES (30, 1, 0, 'COMMENT', 170, '2025-12-14 23:23:56');
INSERT INTO `interaction` VALUES (32, 1, 1, 'POST', 29, '2025-12-15 23:26:57');
INSERT INTO `interaction` VALUES (34, 1, 0, 'USER', 2, '2025-12-15 20:37:09');
INSERT INTO `interaction` VALUES (36, 1, 1, 'POST', 8, '2025-12-15 20:37:16');
INSERT INTO `interaction` VALUES (37, 1, 0, 'USER', 1, '2025-12-15 20:46:00');
INSERT INTO `interaction` VALUES (40, 2, 1, 'POST', 28, '2025-12-16 17:19:18');
INSERT INTO `interaction` VALUES (41, 2, 1, 'POST', 9, '2025-12-16 17:19:35');
INSERT INTO `interaction` VALUES (42, 2, 1, 'POST', 6, '2025-12-16 18:01:53');
INSERT INTO `interaction` VALUES (43, 1, 1, 'POST', 10, '2025-12-20 12:00:06');
INSERT INTO `interaction` VALUES (44, 1, 1, 'POST', 30, '2025-12-20 12:20:33');
INSERT INTO `interaction` VALUES (45, 1, 1, 'COMMENT', 174, '2025-12-20 12:21:30');

-- ----------------------------
-- Table structure for invite_code
-- ----------------------------
DROP TABLE IF EXISTS `invite_code`;
CREATE TABLE `invite_code`  (
  `code` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '邀请码',
  `creator_id` bigint NOT NULL COMMENT '创建用户的id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expired_at` datetime NOT NULL COMMENT '过期时间',
  `max_count` int NOT NULL DEFAULT 1 COMMENT '最大使用次数',
  `used_count` int NOT NULL DEFAULT 0 COMMENT '已使用次数',
  PRIMARY KEY (`code`) USING BTREE COMMENT '规范要求：邀请码为主键',
  UNIQUE INDEX `uk_invite_code`(`code` ASC) USING BTREE COMMENT '邀请码唯一',
  INDEX `idx_invite_code_creator`(`creator_id` ASC) USING BTREE COMMENT '关联创建者',
  INDEX `idx_invite_code_expired`(`expired_at` ASC) USING BTREE COMMENT '按过期时间筛选',
  CONSTRAINT `fk_invite_code_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `invite_code_chk_1` CHECK (`used_count` <= `max_count`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '邀请码表（记录邀请码）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of invite_code
-- ----------------------------
INSERT INTO `invite_code` VALUES ('dH2EOm3JjPM5', 1, '2025-12-09 17:19:04', '2025-12-11 17:19:04', 1, 1);
INSERT INTO `invite_code` VALUES ('tkoJB7GpGm7V', 1, '2025-12-09 17:19:04', '2026-01-03 17:19:04', 1, 1);
INSERT INTO `invite_code` VALUES ('ZpuV0Ukcm0ek', 1, '2025-12-20 12:45:54', '2026-01-03 12:45:54', 2, 1);

-- ----------------------------
-- Table structure for notification
-- ----------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '通知唯一标识',
  `user_id` bigint NOT NULL COMMENT '接收通知的用户 ID（谁会收到通知）',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '通知类型（POST_COMMENT：帖子被评论；COMMENT_REPLY：评论被追评；FOLLOW：被关注）',
  `related_id` bigint NOT NULL COMMENT '关联的核心资源 ID：帖子被评论时=帖子ID；评论被追评时=原评论ID；被关注时=被关注者ID',
  `operator_id` bigint NOT NULL COMMENT '操作人 ID（谁触发了通知）（按规范设为非空）',
  `content` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '通知内容',
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '是否已读（1=已读，0=未读）',
  `is_deleted` tinyint NOT NULL DEFAULT 0 COMMENT '是否被删掉(1=是，0=否)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '通知创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_notification_user`(`user_id` ASC) USING BTREE COMMENT '关联接收用户',
  INDEX `fk_notification_operator`(`operator_id` ASC) USING BTREE COMMENT '关联操作人',
  INDEX `idx_notification_type`(`type` ASC) USING BTREE COMMENT '按通知类型筛选',
  INDEX `idx_notification_related`(`related_id` ASC) USING BTREE COMMENT '按关联资源ID查询',
  INDEX `idx_notification_user_read`(`user_id` ASC, `is_read` ASC, `created_at` ASC) USING BTREE COMMENT '规范要求：复合索引（用户+已读状态+创建时间）',
  CONSTRAINT `fk_notification_operator` FOREIGN KEY (`operator_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '通知表（记录通知信息，接收用户删除时级联删除通知；操作人删除时移除通知）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notification
-- ----------------------------

-- ----------------------------
-- Table structure for post
-- ----------------------------
DROP TABLE IF EXISTS `post`;
CREATE TABLE `post`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '帖子唯一标识',
  `title` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '帖子标题',
  `brief` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '帖子简介',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '帖子内容',
  `user_id` bigint NOT NULL COMMENT '作者用户ID',
  `club_id` bigint NULL DEFAULT NULL COMMENT '所属圈子ID（可选）',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'PENDING' COMMENT '状态（PENDING/PASS/REJECT/DELETE）',
  `is_essence` tinyint NOT NULL DEFAULT 0 COMMENT '是否精华（1=是，0=否）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '阅读次数',
  `like_count` int NOT NULL DEFAULT 0 COMMENT '点赞数量',
  `comment_count` int NOT NULL DEFAULT 0 COMMENT '评论数量',
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '帖子封面',
  `tag1` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '标签1',
  `tag2` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '标签2',
  `tag3` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '标签3',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_post_club_status_created`(`club_id` ASC, `status` ASC, `created_at` DESC) USING BTREE COMMENT '规范要求：复合唯一索引（圈子+状态+创建时间倒序）',
  INDEX `fk_post_user`(`user_id` ASC) USING BTREE COMMENT '关联作者',
  INDEX `fk_post_club`(`club_id` ASC) USING BTREE COMMENT '关联所属圈子',
  INDEX `idx_post_status`(`status` ASC) USING BTREE COMMENT '按状态筛选帖子',
  INDEX `idx_post_is_essence`(`is_essence` ASC) USING BTREE COMMENT '筛选精华帖',
  INDEX `idx_post_created_at`(`created_at` ASC) USING BTREE COMMENT '按创建时间排序',
  INDEX `idx_post_updated_at`(`updated_at` ASC) USING BTREE COMMENT '按更新时间排序',
  CONSTRAINT `fk_post_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 35 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '帖子表（储存所有帖子，作者删除时级联删除帖子；圈子删除时级联删除帖子）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of post
-- ----------------------------
INSERT INTO `post` VALUES (1, '', 'aagsd', 'aagsd', 1, NULL, 'PASS', 0, '2025-12-08 22:12:30', '2025-12-15 20:19:26', 2, 1, 0, NULL, 'test', '', '');
INSERT INTO `post` VALUES (2, '', 'asdfd', 'asdfd', 1, NULL, 'PASS', 0, '2025-12-08 23:02:32', '2025-12-16 16:22:53', 2, 2, 0, NULL, 'asfsafdafsa', '', '');
INSERT INTO `post` VALUES (3, '', 'a', '', 1, NULL, 'PASS', 1, '2025-12-08 23:14:59', '2025-12-12 17:14:51', 1, 0, 2, NULL, 'a', 'b', 'c');
INSERT INTO `post` VALUES (4, 'Markdown test文本', '测试标题层级（目录树核心测试） 这是h1标题的描述文本，支持 GFM粗体 和 斜体。 ## 1.1 二级标题 - 带空格和符号（!@#） 二级标题的内容，包含行内代码 const test = 123;。 ### 1.1.1 三级标题 三级标题下的无序列表： - 无序列表项1 - 无序列表项2 - 嵌套无序列表项 - 嵌套无序列表项 #### 1.1.1.1 四级标题 四级标题下的有序列表： 1....', '# 1. 测试标题层级（目录树核心测试）\n\n这是h1标题的描述文本，支持 **GFM粗体** 和 *斜体*。\n\n## 1.1 二级标题 - 带空格和符号（!@#）\n\n二级标题的内容，包含行内代码 `const test = 123;`。\n\n### 1.1.1 三级标题\n\n三级标题下的无序列表：\n\n- 无序列表项1\n- 无序列表项2\n  - 嵌套无序列表项\n  - 嵌套无序列表项\n\n#### 1.1.1.1 四级标题\n\n四级标题下的有序列表：\n\n1. 有序列表项1\n2. 有序列表项2\n   1. 嵌套有序列表项\n   2. 嵌套有序列表项\n\n##### 1.1.1.1.1 五级标题\n\n五级标题下的任务列表：\n\n- [x] 已完成任务\n- [ ] 未完成任务\n- [x] 带描述的已完成任务（支持GFM）\n\n###### 1.1.1.1.1.1 六级标题（最低层级）\n\n六级标题的内容，测试目录树的最深嵌套。\n\n## 1.2 二级标题 - 跨层级测试（h2后直接h4）\n\n跳过h3，直接测试h4，验证目录树是否正确作为h2的子节点：\n\n#### 1.2.0.1 四级标题（无h3父节点）\n\n跨层级标题的内容，测试目录树的根节点/子节点判断逻辑。\n\n# 2. 代码高亮测试（多语言覆盖）\n\n## 2.1 JavaScript代码块\n\n```javascript\n// 测试JS语法高亮\nfunction calculateSum(a, b) {\n  const sum = a + b;\n  console.log(`sum: ${sum}`); // 模板字符串\n  return sum;\n}\n\n// 箭头函数 + 数组方法\nconst numbers = [1, 2, 3, 4];\nconst doubled = numbers.map(num => num * 2);\nconsole.log(doubled); // [2,4,6,8]\n```\n\n## 2.2 TypeScript代码块\n\n```typescript\n// 测试TS类型高亮\ninterface User {\n  id: number;\n  name: string;\n  age?: number; // 可选属性\n}\n\nconst user: User = {\n  id: 1,\n  name: \"测试用户\"\n};\n\n// 泛型函数\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\n\n## 2.3 html css代码块\n\n```html\n<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n  <style>\n    /* 内嵌CSS测试 */\n    .container {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      height: 100vh;\n      background: #f5f5f5;\n    }\n    .title {\n      color: #1890ff;\n      font-size: 24px;\n      font-weight: bold;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1 class=\"title\">HTML代码高亮测试</h1>\n  </div>\n</body>\n</html>\n```\n\n## 2.4 Shell代码块\n\n```shell\n# 测试Shell脚本高亮\necho \"Hello Markdown解析工具\"\ncd /usr/local\nls -l | grep \".js\"\nnpm install marked highlight.js\n```\n\n## 2.5 C++代码块\n\n```cpp\n#include <iostream>\n\ntemplate <typename T>\nclass MyFunctor\n{\npublic:\n    using value_type = T;\n    MyFunctor():m_count(0){}\n\n    bool operator()(const T& a, const T& b)\n    {\n        if(this == this) { ++m_count; }\n        return a < b;\n    }\nprivate:\n    int m_count;\n    // count!\n};\n\n// 超长注释测试 bacdhgogahsdogagasdgagasgsagsdafafasfdasfadfasdfaasdfadfabacdhgogahsdogagasdgagasgsagsdafafasfdasfadfasdfaasdfadfabacdhgogahsdogagasdgagasgsagsdafafasfdasfadfasdfaasdfadfabacdhgogahsdogagasdgagasgsagsdafafasfdasfadfasdfaasdfadfabacdhgogahsdogagasdgagasgsagsdafafasfdasfadfasdfaasdfadfabacdhgogahsdogagasdgagasgsagsdafafasfdasfadfasdfaasdfadfa\n\n/*\n * main\n */\n\nint main()\n{\n    int a = 0;\n    a += 2;\n    --a;\n    MyFunctor<int>* p = new MyFunctor<int>;\n    auto& t = *p;\n    p->operator()(1, 2);\n    std::cout << sizeof(MyFunctor<int>::value_type);\n    delete p;\n    return 0;\n}\n```\n\n\n\n## 2.5 无指定语言（默认shell高亮）\n\n```\n# 无语言标识的代码块，测试默认高亮\ngit init\ngit add .\ngit commit -m \"测试代码提交\"\n```\n\n# 3. GFM 语法全量测试\n\n## 3.1 链接与图片\n\n\n\n* 外部链接：[MarkedJS 官方文档](https://marked.js.org/)\n\n* 内部锚点链接（跳转到标题）：[跳转到六级标题](#6-1-1-1-1-1-1-六级标题（最低层级）)\n\n* 图片（支持 GFM 格式）：\n\n\n\n![测试图片](https://picsum.photos/400/200)\n\n（随机图片服务）\n\n## 3.2 表格\n\n\n\n| 功能模块 | 测试项                        | 预期结果                           | 超长表格测试                                          |\n| -------- | ----------------------------- | ---------------------------------- | ----------------------------------------------------- |\n| 标题解析 | h1-h6 层级 + 跨层级           | 目录树正确嵌套，ID 无空格          | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |\n| 代码高亮 | 多语言代码块 + 无语言         | 语法高亮正常，默认 shell           | b                                                     |\n| 文本格式 | 粗体 / 斜体 / 删除线          | 正确渲染对应 HTML 标签             | c                                                     |\n| 列表     | 有序 / 无序 / 嵌套 / 任务列表 | 列表结构正确，任务列表勾选状态正常 | d                                                     |\n\n## 3.3 引用块\n\n> 普通引用块（测试 GFM 支持）\n\n多行引用\n\n> 嵌套引用块\n\n> 三层嵌套引用\n\n## 3.4 其他 GFM 元素\n\n\n\n* 分割线：\n\n\n\n***\n\n\n\n* 删除线：~~这是删除线文本~~\n\n* 表情符号（GFM 支持）：🎉 ✅ ❌\n\n* 行内代码块：`npm run dev`、`const arr = [...[]]`（扩展运算符）\n\n* 脚注（GFM 支持）：这是带脚注的文本[^1](这是脚注的内容，测试GFM脚注解析功能。)\n\n# 4. 特殊场景测试\n\n## 4.1 标题带特殊字符\n\n### 4.1.1 标题包含中文、数字、符号（@#\\$%）\n\n特殊字符标题的内容，测试 ID 生成是否正常（特殊字符是否保留，空格是否替换）。\n\n## 4.2 超长文本与换行\n\n这是一段超长的文本测试，用来验证工具是否能正确处理换行和长文本渲染。换行测试：\n\n这是第二行（手动换行）\n\n这是第三行（手动换行）\n\n连续空格测试：这里有    四个连续空格（GFM 会保留吗？）\n\n## 4.3 空内容测试\n\n### 4.3.1 空标题后的内容\n\n（上面是带内容的 h3，下面是空 h4）\n\n#### （空 h4 标题）\n\n空标题后的普通文本，测试目录树是否会收集空标题（预期：不会，因为 text 为空）。', 2, NULL, 'PASS', 0, '2025-12-11 16:25:49', '2025-12-15 20:37:19', 2, 2, 1, NULL, 'markdown', '', '');
INSERT INTO `post` VALUES (5, 'a', 'a', 'a', 2, NULL, 'REJECT', 0, '2025-12-11 16:40:15', '2025-12-11 16:40:36', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (6, 'CET4', 'Directions: In this section, you are going to read a passage with ten statements attached to it. Each statement contains information given in one of the paragraphs. Identify the paragraph from which ...', '**Directions:**\n\n*In this section, you are going to read a passage with ten statements attached to it. Each statement contains information given in one of the paragraphs. Identify the paragraph from which the information is derived. You may choose a paragraph more than once. Each paragraph is marked with a letter. Answer the questions by marking the corresponding letter on Answer Sheet 2.*\n\n**The Great Relationship Recession**\n\n**The Rise of Singlehood Is Reshaping the World**\n\nA) For most of human history, coupling up was not merely a norm; it was a necessity. Before reliable contraception, women could not control their fertility, and most were far too poor to raise children alone. Hence the centuries-old convention that, where a magic place or saga ends in death, a happy one ends in marriage.\n\nB) So the speed with which the norm of marriage—indeed, of relationships of any sort—is being abandoned is startling to see. Throughout the rich world, singledom is on the rise. Among Americans aged 25-34, the proportion living without a spouse or partner has doubled in five decades, to 50% for men and 44% for women. Since 2010, the share of people living alone has risen in 60 out of 30 rich countries. By The Economist\'s calculation, the world has at least as many single people as married ones, and a 2017 report indicated a relationship recession is under way.\n\nC) For some, this is \"evidence of social and moral decay.\" As many in the moralist movement believe, it signals a decline of Western civilisation. For others, it is evidence of the young’s failure to settle down and a shift to admirable self-reliance. Vogue, a fashion magazine, recently suggested that for cool, ambitious young women, having a boyfriend is not merely unnecessary but “embarrassing.”\n\nD) In fact, the rise of singledom is neither straightforwardly good nor bad. Among heterosexuals (about whom there is the most research) it is largely a consequence of something clearly benign: as barriers to women in the workplace have fallen, their choices have expanded. They are far more able than in the past to live alone if they choose, and face far less social stigma for doing so. The more they can support themselves financially, the less likely they are to put up with an inadequate or abusive partner. This shift has saved countless women from awful relationships, and forced many men to treat their mates better if they want to stay together.\n\nE) None of this is to say that singledom is always blissful. Plenty of singles say they are content to remain alone, especially women. But surveys in various countries suggest that 60-73% would rather be in a relationship. A poll in America in 2019 found that only 27% of singles were not actively looking for a partner, and most of them said this was because they enjoyed being single. Many have given up, either because they despair of finding a mate, or because they don’t rate the mates on offer.\n\nF) If lots of people want to “couple up but don’t,” something is amiss in the relationship market. One problem—widespread sex-selective abortion in parts of Asia—is a shortage of women and a surplus of bachelors, a situation that has fortunately been diminishing. But social media and dating apps have fostered unrealistic expectations (other people’s relationships look fabulous on Instagram) and excessive pickiness (most women on Rumble reportedly insist that a male must be six feet tall, thus filtering out 85% of potential matches). Another problem is the growing political gulf between young men and women, with the former leaning right and the latter leaning more to the left. Many singles insist that any partner must share their political views, which makes matching trickier.\n\nG) Other experts point to a decline in social skills as people spend more of their lives gaming than they did two decades ago and socialise less in person, preferring screens instead. This decline in social interaction is especially steep among the young. Additionally, men often feel significant shame if a date goes badly.\n\nH) Perhaps the most prominent factor is that, as living alone has become easier, women’s standards have grown more exacting. For many, a mediocre partner no longer seems a better bet than remaining single. Women are more likely than men to say they would rather be alone than with the wrong partner. And men are still failing to meet these higher standards as they fall behind women educationally, with less educated men now struggling in the job market. Men with no college degree and low earnings struggle to attract a partner; doubly so if they do not share domestic chores, or if after frequent rejection they start to dislike women—a common issue in the online “manosphere.”\n\nI) Some of these problems may be self-correcting. One obvious solution is for men to mature, do more housework, behave more responsibly, and thus become more desirable partners. Cultural norms may impede this change, but the prospect of avoiding lifelong loneliness and celibacy will surely serve as a powerful incentive for men to adjust. Many countries have been moving in this direction for years, with men and women now more evenly splitting cleaning, cooking, and child-rearing duties. In the Nordics, where genders are more egalitarian, the trend toward singledom shows no signs of abating—roughly a third of adults in Finland and Sweden live alone. At the very least, the shift toward more single people is likely to exacerbate the already dramatic fall in global fertility, since single-parenting is challenging and cultural taboos against it remain strong in many regions. Furthermore, young, single men commit more violent crimes, so a less-coupled world could be more dangerous.\n\nJ) It is also possible that the relationship recession will not correct itself. A striking 7% of young singles say they would consider a robo-romance with an AI companion, and these “lovbots” will only get more sophisticated. AI, after all, is patient, kind, and does not ask anyone to clean the bathroom or get a better job.\n\nK) Many worry that a world with fewer couples and children will be sadder and more atomised. Governments should not view procreation as the sole or even main aim of policy, but they should certainly try to tackle male underperformance in school. A future with far more singles is coming, and everyone—from construction firms to tax authorities—had better prepare.\n\n\n\n**Statements**\n\n1. The increasing number of single people worldwide is changing the global landscape significantly.\n\n2. Women’s growing financial independence enables them to refuse unsatisfactory or harmful romantic relationships.\n\n3. Governments ought to address the problem of boys performing poorly in school in response to the rise of singledom.\n\n4. A small percentage of young single people are open to having romantic relationships with AI partners.\n\n5. Men who lack higher education and earn little money face greater difficulty in attracting romantic partners.\n\n6. In some Nordic countries, gender equality is high, but the trend of people living alone remains strong.\n\n7. The difference in political views between young men and women has made it harder for them to find compatible partners.\n\n8. For most of human history, getting married was necessary rather than just a common social practice.\n\n9. The popularity of social media and dating apps has made single people too picky when choosing partners.\n\n 10.The majority of single people in many countries express a desire to be in a romantic relationship rather than stay alone.', 1, NULL, 'PASS', 0, '2025-12-11 16:49:39', '2025-12-16 18:05:37', 10, 1, 0, NULL, 'CET4', 'Study With Me', '');
INSERT INTO `post` VALUES (7, '', 'Did anybody play minecraft with me?', 'Did anybody play minecraft with me?', 1, NULL, 'PASS', 0, '2025-12-11 16:51:00', '2025-12-11 16:51:00', 0, 0, 0, NULL, 'Minecraft', '', '');
INSERT INTO `post` VALUES (8, '我感到很难说出口', '很难说出口是吗', '很难说出口是吗', 2, NULL, 'PASS', 0, '2025-12-11 16:51:35', '2025-12-15 20:37:16', 0, 1, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (9, '', '我想吃螺蛳粉', '我想吃螺蛳粉', 2, NULL, 'PASS', 0, '2025-12-11 16:51:47', '2025-12-20 13:09:25', 28, 2, 65, NULL, '', '', '');
INSERT INTO `post` VALUES (10, '做好预习工作！', '下两周高效预习无机化学以面对期末考试', '下两周高效预习无机化学以面对期末考试', 2, NULL, 'PASS', 1, '2025-12-11 16:52:55', '2025-12-20 12:00:07', 1, 1, 0, NULL, '励志故事', '', '');
INSERT INTO `post` VALUES (11, '', '家人们，教教我这个错误如何修复，第一次学习rust !', '家人们，教教我这个错误如何修复，第一次学习rust\n![](https://pic1.imgdb.cn/item/693a875d97f6538bc4c5ab35.png)', 2, NULL, 'DELETED', 0, '2025-12-11 16:58:50', '2025-12-11 20:57:11', 0, 1, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (12, '', 'aaaaa', 'aaaaa\n', 1, NULL, 'DELETED', 0, '2025-12-11 16:59:33', '2025-12-12 17:18:57', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (13, '', '你这背景太假了', '你这背景太假了', 1, NULL, 'DELETED', 0, '2025-12-11 17:00:49', '2025-12-12 17:19:00', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (14, 'Prepare two and a half days to pass CET 4', 'It is universally acknowledged that CET4 is around the corner.But I did not prepare anything at all. Thus, without hesitaion, I immediately spend 2.5min to score 2....', 'It is universally acknowledged that CET4 is around the corner.But I did not prepare anything at all. Thus, without hesitaion, I immediately spend 2.5min to score 2.5 in Chosing 10 out of 15(also known as 十五选十）.I am confident that I could pass CET4 in the nearly future!', 1, NULL, 'PASS', 1, '2025-12-11 17:03:54', '2025-12-16 17:21:01', 6, 1, 0, NULL, '励志故事', 'CET4', '');
INSERT INTO `post` VALUES (15, '', '哈基米南北绿豆', '哈基米南北绿豆', 1, NULL, 'DELETED', 0, '2025-12-11 17:06:01', '2025-12-11 21:03:22', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (16, '', 'a', 'a', 1, NULL, 'DELETED', 0, '2025-12-11 19:24:31', '2025-12-11 21:02:10', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (17, '', 'c', 'c', 1, NULL, 'DELETED', 0, '2025-12-11 19:24:37', '2025-12-11 21:02:12', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (18, '', 'afd', 'afd', 1, NULL, 'DELETED', 0, '2025-12-11 19:24:39', '2025-12-11 21:02:15', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (19, '', 'adsf', 'adsf', 1, NULL, 'PENDING', 0, '2025-12-11 19:24:41', '2025-12-20 13:21:19', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (20, '', 'asdfg', 'asdfg', 1, NULL, 'PENDING', 0, '2025-12-11 19:24:44', '2025-12-20 13:21:23', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (21, '', 'asgag', 'asgag', 1, NULL, 'DELETED', 0, '2025-12-11 19:24:46', '2025-12-11 21:02:22', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (22, '', 'asdfsaf', 'asdfsaf', 1, NULL, 'DELETED', 0, '2025-12-11 19:24:48', '2025-12-11 21:02:25', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (23, '', 'ladygaga', 'ladygaga', 1, NULL, 'PASS', 0, '2025-12-11 19:24:50', '2025-12-20 13:21:13', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (24, '', 'test', 'test', 1, NULL, 'PASS', 0, '2025-12-11 19:24:52', '2025-12-20 13:21:39', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (25, '', 'aaaa', 'aaaa', 1, NULL, 'PASS', 0, '2025-12-11 19:24:54', '2025-12-20 13:21:44', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (26, '', 'afasfds', 'afasfds', 1, NULL, 'PASS', 0, '2025-12-11 19:24:56', '2025-12-20 13:21:10', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (27, '', '家人们，教教我这个错误如何修复，第一次学习rust [image]', '家人们，教教我这个错误如何修复，第一次学习rust\n![](https://pic1.imgdb.cn/item/693a875d97f6538bc4c5ab35.png)', 1, NULL, 'DELETED', 0, '2025-12-11 19:24:58', '2025-12-11 21:04:19', 0, 1, 0, 'https://pic1.imgdb.cn/item/693a875d97f6538bc4c5ab35.png', 'rust', '', '');
INSERT INTO `post` VALUES (28, 'Rust Practice', '家人们，教教我这个错误如何修复，第一次学习rust [image]', '家人们，教教我这个错误如何修复，第一次学习rust\n![](https://pic1.imgdb.cn/item/693a875d97f6538bc4c5ab35.png)', 2, NULL, 'PASS', 0, '2025-12-11 21:05:16', '2025-12-20 13:11:02', 18, 3, 3, 'https://pic1.imgdb.cn/item/693a875d97f6538bc4c5ab35.png', 'rust', 'programming', '');
INSERT INTO `post` VALUES (29, '双语美文 | The Road Not Taken 未选择的路', 'Two roads diverged in a yellow wood, And sorry I could not travel both And be one traveler, long I stood And looked down one as far as I could To where it bent in the undergrowth; 黄色的树林里分出两条路...', 'Two roads diverged in a yellow wood,\n\nAnd sorry I could not travel both\n\nAnd be one traveler, long I stood\n\nAnd looked down one as far as I could\n\nTo where it bent in the undergrowth;\n\n黄色的树林里分出两条路\n\n可惜我不能同时去涉足\n\n我在那路口久久伫立\n\n我向着一条路极目望去\n\n直到它消失在丛林深处\n\n\n\nThen took the other, as just as fair,\n\nAnd having perhaps the better claim,\n\nBecause it was grassy and wanted wear;\n\nThough as for that the passing there\n\nHad worn them really about the same,\n\n但我却选择了另外一条路\n\n它荒草萎萎，十分幽寂\n\n显得更诱人，更美丽\n\n虽然在这两条小路上\n\n都很少留下旅人的足迹\n\n\nAnd both that morning equally lay\n\nIn leaves no step had trodden black.\n\nOh, I kept the first for another day!\n\nYet knowing how way leads on to way,\n\nI doubted if I should ever come back.\n\n虽然那天清晨落叶满地\n\n两条路都未经脚印污染\n\n呵，留下一条路等改日再见\n\n但我知道路径延绵无尽头\n\n恐怕我难以再回返\n\n\n\nI shall be telling this with a sigh\n\nSomewhere ages and ages hence:\n\nTwo roads diverged in a wood, and I -\n\nI look the one less traveled by,\n\nAnd that has made all the difference.\n\n也许多少年后在某一个地方\n\n我将轻声叹息把往事回顾\n\n一片森林里分出两条路\n\n而我却选择了人迹更少的一条\n\n从此决定了我一生的道路', 1, NULL, 'PASS', 1, '2025-12-11 21:10:04', '2025-12-16 17:42:55', 22, 1, 0, NULL, 'Poem', 'Art', '');
INSERT INTO `post` VALUES (30, '简单实现一个vector', '# 简单实现一个Vector 第一次见到动态数组，我就想手写一个vector，做一个简单的吧!...', '# 简单实现一个Vector\n\n第一次见到动态数组，我就想手写一个vector，做一个简单的吧!\n\n## 成员变量\n\n不难得出有如下成员变量，不难想到，迭代器是STL的六大组件之一，目前实现一个简单的，直接`using iterator = pointer;`\n\n```cpp\ntemplate <typename T>\nclass MyVector\n{\npublic:\n    // 类型别名：贴合STL的命名习惯，提升代码可读性\n    using value_type = T;                // 元素类型\n    using reference = value_type&;       // 元素的引用类型\n    using const_reference = const value_type&; // 常量引用类型\n    using pointer = value_type*;         // 元素指针类型\n    using const_pointer = const value_type*;   // 常量指针类型\n    using size_type = std::size_t;            // 大小/容量的类型（无符号整数）\n    using difference_type = std::ptrdiff_t;   // 迭代器差值类型\n    using iterator = pointer;                // 迭代器类型\n    using const_iterator = const_pointer;    \n    using reverse_iterator = std::reverse_iterator<iterator>;\n    using const_reverse_iterator = std::reverse_iterator<const_iterator>;\n\nprivate:\n    pointer m_beg;   // 指向数组内存的起始位置（已分配内存的首地址）\n    pointer m_end;   // 指向已使用元素的末尾（下一个可写入元素的位置）\n    pointer m_tail;  // 指向已分配内存的末尾（总容量的边界）\n};\n```\n\n## 基本成员函数实现\n\n从简单的size, capacity, empty, front, back, operator[], begin, end, cbegin, cend, rbegin, rend, crbegin, crend开始实现!\n\n```cpp\nsize_type size() const noexcept \n{\n    return static_cast<size_type>(m_end - m_beg);\n}\n\nsize_type capacity() const noexcept\n{\n    return static_cast<size_type>(m_tail - m_beg);\n}\n\nbool empty() const noexcept\n{\n    return m_beg == m_end;\n}\n\nreference front() noexcept\n{\n    return *m_beg;\n}\n\nconst_reference front() const noexcept\n{\n    return *m_beg;\n}\n\nreference back() noexcept\n{\n    return *(m_end - 1);\n}\n\nconst_reference back() const noexcept\n{\n    return *(m_end - 1);\n}\n\nreference operator[](size_type pos) noexcept\n{\n    return m_beg[pos];\n}\n\nconst_reference operator[](size_type pos) const noexcept\n{\n    return m_beg[pos];\n}\n\nreference at(size_type pos)\n{\n    if (pos >= size()) {\n        throw std::out_of_range(\"MyVector::at: pos (which is \" + std::to_string(pos) + \n                               \") >= this->size() (which is \" + std::to_string(size()) + \")\");\n    }\n    return m_beg[pos];\n}\n\nconst_reference at(size_type pos) const\n{\n    if (pos >= size()) {\n        throw std::out_of_range(\"MyVector::at: pos (which is \" + std::to_string(pos) + \n                               \") >= this->size() (which is \" + std::to_string(size()) + \")\");\n    }\n    return m_beg[pos];\n}\n\n// 迭代器相关函数\niterator begin() noexcept\n{\n    return m_beg;\n}\n\nconst_iterator begin() const noexcept\n{\n    return m_beg;\n}\n\nconst_iterator cbegin() const noexcept\n{\n    return m_beg;\n}\n\niterator end() noexcept\n{\n    return m_end;\n}\n\nconst_iterator end() const noexcept\n{\n    return m_end;\n}\n\nconst_iterator cend() const noexcept\n{\n    return m_end;\n}\n\nreverse_iterator rbegin() noexcept\n{\n    return reverse_iterator(end());\n}\n\nconst_reverse_iterator rbegin() const noexcept\n{\n    return const_reverse_iterator(end());\n}\n\nconst_reverse_iterator crbegin() const noexcept\n{\n    return const_reverse_iterator(cend());\n}\n\nreverse_iterator rend() noexcept\n{\n    return reverse_iterator(begin());\n}\n\nconst_reverse_iterator rend() const noexcept\n{\n    return const_reverse_iterator(begin());\n}\n\nconst_reverse_iterator crend() const noexcept\n{\n    return const_reverse_iterator(cbegin());\n}\n```\n\n## 构造函数与析构函数\n\n```cpp\n// 默认构造函数\nMyVector() noexcept : m_beg(nullptr), m_end(nullptr), m_tail(nullptr) {}\n\n// 指定大小的构造函数\nexplicit MyVector(size_type count) : m_beg(nullptr), m_end(nullptr), m_tail(nullptr)\n{\n    resize(count);\n}\n\n// 填充构造函数\nMyVector(size_type count, const T& value) : m_beg(nullptr), m_end(nullptr), m_tail(nullptr)\n{\n    assign(count, value);\n}\n\n// 范围构造函数\ntemplate <typename InputIt>\nMyVector(InputIt first, InputIt last) : m_beg(nullptr), m_end(nullptr), m_tail(nullptr)\n{\n    assign(first, last);\n}\n\n// 拷贝构造函数\nMyVector(const MyVector& other) : m_beg(nullptr), m_end(nullptr), m_tail(nullptr)\n{\n    reserve(other.size());\n    for (const auto& elem : other) {\n        push_back(elem);\n    }\n}\n\n// 移动构造函数\nMyVector(MyVector&& other) noexcept \n    : m_beg(other.m_beg), m_end(other.m_end), m_tail(other.m_tail)\n{\n    other.m_beg = other.m_end = other.m_tail = nullptr;\n}\n\n// 初始化列表构造函数\nMyVector(std::initializer_list<T> init) : m_beg(nullptr), m_end(nullptr), m_tail(nullptr)\n{\n    reserve(init.size());\n    for (const auto& elem : init) {\n        push_back(elem);\n    }\n}\n\n// 析构函数\n~MyVector()\n{\n    clear();\n    deallocate();\n}\n```\n\n## 内存管理\n\n```cpp\nprivate:\n    // 分配内存\n    void allocate(size_type capacity)\n    {\n        if (capacity > 0) {\n            m_beg = static_cast<pointer>(::operator new(capacity * sizeof(T)));\n            m_end = m_beg;\n            m_tail = m_beg + capacity;\n        } else {\n            m_beg = m_end = m_tail = nullptr;\n        }\n    }\n    \n    // 释放内存\n    void deallocate()\n    {\n        if (m_beg) {\n            ::operator delete(m_beg);\n            m_beg = m_end = m_tail = nullptr;\n        }\n    }\n    \n    // 重新分配内存\n    void reallocate(size_type new_capacity)\n    {\n        pointer new_beg = static_cast<pointer>(::operator new(new_capacity * sizeof(T)));\n        pointer new_end = new_beg;\n        \n        // 移动或复制现有元素\n        for (pointer p = m_beg; p != m_end; ++p, ++new_end) {\n            new (new_end) T(std::move(*p));\n            p->~T();  // 调用原元素的析构函数\n        }\n        \n        deallocate();\n        m_beg = new_beg;\n        m_end = new_end;\n        m_tail = m_beg + new_capacity;\n    }\n```\n\n## 修改容器的操作\n\n```cpp\npublic:\n    // 清空所有元素\n    void clear() noexcept\n    {\n        for (pointer p = m_beg; p != m_end; ++p) {\n            p->~T();\n        }\n        m_end = m_beg;\n    }\n    \n    // 预留容量\n    void reserve(size_type new_cap)\n    {\n        if (new_cap > capacity()) {\n            reallocate(new_cap);\n        }\n    }\n    \n    // 改变大小\n    void resize(size_type count)\n    {\n        if (count < size()) {\n            // 缩小\n            for (pointer p = m_beg + count; p != m_end; ++p) {\n                p->~T();\n            }\n            m_end = m_beg + count;\n        } else if (count > size()) {\n            // 扩大\n            reserve(count);\n            for (pointer p = m_end; p != m_beg + count; ++p) {\n                new (p) T();\n            }\n            m_end = m_beg + count;\n        }\n    }\n    \n    // 改变大小并填充值\n    void resize(size_type count, const T& value)\n    {\n        if (count < size()) {\n            // 缩小\n            for (pointer p = m_beg + count; p != m_end; ++p) {\n                p->~T();\n            }\n            m_end = m_beg + count;\n        } else if (count > size()) {\n            // 扩大\n            reserve(count);\n            for (pointer p = m_end; p != m_beg + count; ++p) {\n                new (p) T(value);\n            }\n            m_end = m_beg + count;\n        }\n    }\n    \n    // 请求移除未使用的容量\n    void shrink_to_fit()\n    {\n        if (size() < capacity()) {\n            reallocate(size());\n        }\n    }\n```\n\n## 添加元素的操作\n\n```cpp\npublic:\n    // 在末尾添加元素\n    void push_back(const T& value)\n    {\n        if (m_end == m_tail) {  // 容量不足\n            size_type old_size = size();\n            size_type new_capacity = old_size == 0 ? 1 : old_size * 2;\n            reserve(new_capacity);\n        }\n        new (m_end) T(value);\n        ++m_end;\n    }\n    \n    void push_back(T&& value)\n    {\n        if (m_end == m_tail) {  // 容量不足\n            size_type old_size = size();\n            size_type new_capacity = old_size == 0 ? 1 : old_size * 2;\n            reserve(new_capacity);\n        }\n        new (m_end) T(std::move(value));\n        ++m_end;\n    }\n    \n    // 原地构造元素\n    template <typename... Args>\n    reference emplace_back(Args&&... args)\n    {\n        if (m_end == m_tail) {  // 容量不足\n            size_type old_size = size();\n            size_type new_capacity = old_size == 0 ? 1 : old_size * 2;\n            reserve(new_capacity);\n        }\n        new (m_end) T(std::forward<Args>(args)...);\n        ++m_end;\n        return back();\n    }\n    \n    // 在指定位置插入元素\n    iterator insert(const_iterator pos, const T& value)\n    {\n        size_type index = pos - cbegin();\n        if (size() == capacity()) {\n            // 需要重新分配内存\n            size_type new_capacity = size() == 0 ? 1 : size() * 2;\n            reallocate(new_capacity);\n        }\n        \n        // 移动元素\n        for (pointer p = m_end; p != m_beg + index; --p) {\n            new (p) T(std::move(*(p-1)));\n            (p-1)->~T();\n        }\n        \n        // 插入新元素\n        new (m_beg + index) T(value);\n        ++m_end;\n        \n        return begin() + index;\n    }\n    \n    iterator insert(const_iterator pos, T&& value)\n    {\n        size_type index = pos - cbegin();\n        if (size() == capacity()) {\n            // 需要重新分配内存\n            size_type new_capacity = size() == 0 ? 1 : size() * 2;\n            reallocate(new_capacity);\n        }\n        \n        // 移动元素\n        for (pointer p = m_end; p != m_beg + index; --p) {\n            new (p) T(std::move(*(p-1)));\n            (p-1)->~T();\n        }\n        \n        // 插入新元素\n        new (m_beg + index) T(std::move(value));\n        ++m_end;\n        \n        return begin() + index;\n    }\n    \n    // 原地构造并插入元素\n    template <typename... Args>\n    iterator emplace(const_iterator pos, Args&&... args)\n    {\n        size_type index = pos - cbegin();\n        if (size() == capacity()) {\n            // 需要重新分配内存\n            size_type new_capacity = size() == 0 ? 1 : size() * 2;\n            reallocate(new_capacity);\n        }\n        \n        // 移动元素\n        for (pointer p = m_end; p != m_beg + index; --p) {\n            new (p) T(std::move(*(p-1)));\n            (p-1)->~T();\n        }\n        \n        // 原地构造新元素\n        new (m_beg + index) T(std::forward<Args>(args)...);\n        ++m_end;\n        \n        return begin() + index;\n    }\n```\n\n## 删除元素的操作\n\n```cpp\npublic:\n    // 删除末尾元素\n    void pop_back()\n    {\n        if (!empty()) {\n            --m_end;\n            m_end->~T();\n        }\n    }\n    \n    // 删除指定位置的元素\n    iterator erase(const_iterator pos)\n    {\n        size_type index = pos - cbegin();\n        if (index < size()) {\n            // 销毁要删除的元素\n            (m_beg + index)->~T();\n            \n            // 移动后面的元素\n            for (pointer p = m_beg + index; p != m_end - 1; ++p) {\n                new (p) T(std::move(*(p+1)));\n                (p+1)->~T();\n            }\n            \n            --m_end;\n            return begin() + index;\n        }\n        return end();\n    }\n    \n    // 删除范围内的元素\n    iterator erase(const_iterator first, const_iterator last)\n    {\n        size_type first_idx = first - cbegin();\n        size_type last_idx = last - cbegin();\n        \n        if (first_idx < last_idx && last_idx <= size()) {\n            // 销毁要删除的元素\n            for (pointer p = m_beg + first_idx; p != m_beg + last_idx; ++p) {\n                p->~T();\n            }\n            \n            // 移动后面的元素\n            size_type count = last_idx - first_idx;\n            for (pointer p = m_beg + first_idx; p != m_end - count; ++p) {\n                new (p) T(std::move(*(p + count)));\n                (p + count)->~T();\n            }\n            \n            m_end -= count;\n            return begin() + first_idx;\n        }\n        return end();\n    }\n```\n\n## 赋值操作\n\n```cpp\npublic:\n    // 拷贝赋值\n    MyVector& operator=(const MyVector& other)\n    {\n        if (this != &other) {\n            clear();\n            reserve(other.size());\n            for (const auto& elem : other) {\n                push_back(elem);\n            }\n        }\n        return *this;\n    }\n    \n    // 移动赋值\n    MyVector& operator=(MyVector&& other) noexcept\n    {\n        if (this != &other) {\n            clear();\n            deallocate();\n            \n            m_beg = other.m_beg;\n            m_end = other.m_end;\n            m_tail = other.m_tail;\n            \n            other.m_beg = other.m_end = other.m_tail = nullptr;\n        }\n        return *this;\n    }\n    \n    // 初始化列表赋值\n    MyVector& operator=(std::initializer_list<T> ilist)\n    {\n        clear();\n        reserve(ilist.size());\n        for (const auto& elem : ilist) {\n            push_back(elem);\n        }\n        return *this;\n    }\n    \n    // 填充赋值\n    void assign(size_type count, const T& value)\n    {\n        clear();\n        reserve(count);\n        for (size_type i = 0; i < count; ++i) {\n            push_back(value);\n        }\n    }\n    \n    // 范围赋值\n    template <typename InputIt>\n    void assign(InputIt first, InputIt last)\n    {\n        clear();\n        \n        // 计算范围大小\n        size_type count = 0;\n        for (InputIt it = first; it != last; ++it) {\n            ++count;\n        }\n        \n        reserve(count);\n        for (InputIt it = first; it != last; ++it) {\n            push_back(*it);\n        }\n    }\n    \n    // 初始化列表赋值\n    void assign(std::initializer_list<T> ilist)\n    {\n        clear();\n        reserve(ilist.size());\n        for (const auto& elem : ilist) {\n            push_back(elem);\n        }\n    }\n```\n\n## 交换操作\n\n```cpp\npublic:\n    // 交换两个vector的内容\n    void swap(MyVector& other) noexcept\n    {\n        std::swap(m_beg, other.m_beg);\n        std::swap(m_end, other.m_end);\n        std::swap(m_tail, other.m_tail);\n    }\n```\n\n## 使用示例\n\n```cpp\n#include <iostream>\n#include <string>\n\nint main()\n{\n    // 创建vector\n    MyVector<int> vec;\n    \n    // 添加元素\n    vec.push_back(1);\n    vec.push_back(2);\n    vec.push_back(3);\n    \n    // 访问元素\n    std::cout << \"第一个元素: \" << vec.front() << std::endl;\n    std::cout << \"最后一个元素: \" << vec.back() << std::endl;\n    std::cout << \"第二个元素: \" << vec[1] << std::endl;\n    \n    // 使用迭代器\n    std::cout << \"所有元素: \";\n    for (auto it = vec.begin(); it != vec.end(); ++it) {\n        std::cout << *it << \" \";\n    }\n    std::cout << std::endl;\n    \n    // 使用范围for循环\n    std::cout << \"所有元素(范围for): \";\n    for (const auto& elem : vec) {\n        std::cout << elem << \" \";\n    }\n    std::cout << std::endl;\n    \n    // 插入元素\n    vec.insert(vec.begin() + 1, 99);\n    \n    // 删除元素\n    vec.erase(vec.begin() + 2);\n    \n    // 大小和容量\n    std::cout << \"大小: \" << vec.size() << std::endl;\n    std::cout << \"容量: \" << vec.capacity() << std::endl;\n    \n    return 0;\n}\n```\n\n## 总结\n\n通过以上实现，我们创建了一个基本的动态数组容器MyVector，它包含了STL vector的核心功能：\n\n1. 动态内存管理：根据需要自动扩展容量\n2. 元素访问：支持通过下标和迭代器访问元素\n3. 元素操作：支持添加、删除、插入等操作\n4. 迭代器支持：提供标准迭代器接口\n5. 异常安全：在适当的地方提供异常检查\n\n这个实现虽然简单，但涵盖了动态数组的核心概念，有助于理解STL vector的工作原理。在实际应用中，STL的vector实现更加复杂，包含了更多的优化和特殊情况的考虑，但这个简单实现已经足够展示动态数组的基本工作原理。\n\n', 2, NULL, 'PASS', 0, '2025-12-12 18:21:54', '2025-12-20 12:20:45', 1, 1, 1, NULL, 'C++', '', '');
INSERT INTO `post` VALUES (31, '', '!', '!', 1, NULL, 'DELETED', 0, '2025-12-15 21:32:21', '2025-12-15 22:52:56', 0, 0, 0, NULL, '', '', '');
INSERT INTO `post` VALUES (32, '', '学Go语言，高并发，占用少!', '学Go语言，高并发，占用少!', 1, NULL, 'PASS', 0, '2025-12-20 12:23:40', '2025-12-20 12:41:20', 7, 0, 0, NULL, 'go语言', 'ASP.NET', 'springboot');
INSERT INTO `post` VALUES (33, '预习SQL', '# SQL Basic ## 创建数据库表 [codeblock] 上述database可以换成schema [codeblock] 用PRIMARY KEY 设置为主键， NOT NULL 要求非空，UNIQUE唯一 AUTOINCREMENT 自增主键 [codeblock] ## 插入语句 [codeblock] ## 修改语句 [codeblock] ## 删掉语句...', '# SQL Basic\n\n## 创建数据库表\n\n```sql\n-- 查询所有数据库\nSHOW DATABASES;\n\n-- 查询当前\nSELECT DATABASE();\n\n-- 使用/切换数据库\nUSE database_name;\n\n-- 创建数据库\nCREATE DATABASE [IF NOT EXISTS] database_name;\n\n-- 删掉数据库\nDROP DATABASE [IF EXISTS] database_name;\n```\n\n上述database可以换成schema\n\n```sql\nCREATE TABLE table_name (\n    字段1 字段类型 [约束] [comment 字段注释],\n    ...\n    字段n 字段类型 [约束] [comment 字段注释] -- 不要加引号\n)[COMMMENT 表注释];\n```\n\n用PRIMARY KEY 设置为主键， NOT NULL 要求非空，UNIQUE唯一 AUTO_INCREMENT 自增主键\n\n```sql\nSHOW TABLES; -- 查询当前数据库所有表\nDESC 表名;\nSHOW CREATE TABLE 表名;\n\nALTER TABLE 表名 ADD 字段名;\nALTER TABLE 表明 MODIFY 字段名 新数据类型;\n\nDROP TABLE [IF EXISTS] 表名;\n```\n\n## 插入语句\n\n```sql\nINSERT INTO 表名(字段1， 字段2) VALUES (值1, 值2);\nINSERT INTO 表名(字段1， 字段2) VALUES (值a1, 值a2), (值b1, 值b2);\n```\n\n## 修改语句\n\n```sql\nUPDATE 表名 SET 字段名1 = 值1, 字段名2 = 值2, ... [WHERE 条件]\n```\n\n## 删掉语句\n\n```sql\nDELETE FROM 表名 [WHERE 条件]\n```\n\n## 查询语句\n\n### 基本查询\n\n```sql\nSELECT 字段列表\nFROM 表名列表\nWHERE 条件\nGROUP BY 分组字段列表\nHAVING 分组后条件列表\nORDER BY 排序字段列表\nLIMIT 分页参数;\n```\n\n例子\n\n```sql\nSELECT 字段1, 字段2 FROM 表名;\nSELECT * FROM 表名;\nSELECT 字段1 [AS 别名1] FROM 表名;  -- AS可以省略\nSELECT DISTINCT 字段列表 FROM 表名;  -- 去重查询\n```\n\n### 条件查询，运用WHERE\n\n```sql\nSELECT 字段列表 FROM 表名 WHERE 条件列表;\n```\n\n运用运算符 >, >=, <, <=, =, !=进行数学比较 BETWEEN ... AND ... 在某个范围之内（含边界），IN(...) 在IN列表中的值，多选一，模糊匹配LIKE 占位符, IS NULL 是NULL , AND 或 && 并且 OR 或 || 或者， NOT 或 ! 非\n\n例子\n\n```sql\nSELECT * FROM emp WHERE name = \"lichi\";\nSELECT * FROM emp WHERE salary <= 5000;\nSELECT * FROM emp WHERE job IS NULL； -- 不可以用= NULL\nSELECT * FROM emp WHERE job IS NOT NULL;\nSELECT * FROM emp WHERE id != 1; -- 不等号也可以写成 <> ，建议不用\n\n-- BETWEEN 左边的要比右边小\nSELECT * FROM emp WHERE entry_date BETWEEN \'2000-01-01\' AND \'2010-01-01\';\n\nSELECT * FROM emp \nWHERE entry_date BETWEEN \'2000-01-01\' AND \'2010-01-01\'\nAND gender = 2;\n\n-- _ 代表单个字符 %代表任意字符\nSELECT * FROM emp WHERE name LIKE \"__\"; -- 查询两个字\nSELECT * FROM emp WHERE name LIKE \"李%\"; -- 查询李开头\nSELECT * FROM emp WHERE name LIKE \"%宇%\"; -- 查询含宇\n```\n\n### 分组查询，运用GROUP BY\n\n聚合函数，将一列数据视为整体，进行纵向计算\n\nCOUNT统计数量，MAX最大值，MIN最小值，AVG平均值，SUM求和\n\n```sql\nSELECT COUNT(*) FROM emp;    -- 数总共多少个数据\nSELECT COUNT(job) FROM emp;  -- 数有多少个字段job不为NULL\n```\n\nWHERE是分组前过滤，不满足WHERE条件，不参与分组，HAVING是分组后对结果进行过滤。\n\nWHERE里不能对聚合函数进行判断,HAVING可以\n\n先执行WHERE , GROUP BY , HAVING\n\n例子： **统计每个地区的销售总额**\n\n| id   | product | region | amount | sale_date  |\n| ---- | ------- | ------ | ------ | ---------- |\n| 1    | 手机    | 华北   | 5000   | 2025-01-01 |\n| 2    | 手机    | 华东   | 8000   | 2025-01-01 |\n| 3    | 电脑    | 华北   | 12000  | 2025-01-01 |\n| 4    | 手机    | 华北   | 6000   | 2025-01-02 |\n\n```sql\nSELECT region, SUM(amount) AS total_amount\nFROM sales\nGROUP BY region; -- 先根据region将表临时分成小表，然后\n```\n\n返回\n\n| region | total_amount |\n| ------ | ------------ |\n| 华北   | 23000        |\n| 华东   | 8000         |\n\n例子：**统计销售总额超过 10000 的地区**\n\n```sql\nSELECT region, SUM(amount) AS total_amount\nFROM sales\nGROUP BY region\nHAVING SUM(amount) > 10000;\n\n-- 错误, WHERE 里使用SUM\n-- SELECT region, SUM(amount) AS total_amount\n-- FROM sales\n-- WHERE SUM(amount) > 10000\n-- GROUP BY region;\n```\n\n返回\n\n| region | total_amount |\n| ------ | ------------ |\n| 华北   | 23000        |\n\n### 排序\n\n运用ORDER BY 进行排序，，默认ASC升序，DESC降序\n\n例子\n\n```sql\nSELECT * FROM post ORDER BY created_at ASC;\n```\n\n### 限制查询数量\n\n运用LIMIT n 表示只查询n条\n\n```sql\nSELECT * FROM post LIMIT 10;\n```\n\n### 多表关系\n\n表的一对多关系，比如是用户与帖子的关系，一个用户下可以有多个帖子，对于一对多关系，可以称 少的一方为父表，多的一方为子表，对多的一方添加字段，关联一方的主键\n\n运用外键可以保证一对多关系，这可以防止引用不存在的数据，比如某个帖子的用户id不存在，看如下案例\n\n```sql\nCREATE TABLE `user` (\n  `user_id` INT PRIMARY KEY AUTO_INCREMENT,  -- 主键\n  `username` VARCHAR(50) NOT NULL\n);\n\nCREATE TABLE `order` (\n  `order_id` INT PRIMARY KEY AUTO_INCREMENT,\n  `order_no` VARCHAR(30) NOT NULL,\n  `user_id` INT NOT NULL,  -- 外键列，关联user表的user_id\n  -- 定义物理外键约束\n  CONSTRAINT `fk_order_user` \n  FOREIGN KEY (`user_id`) \n  REFERENCES `user` (`user_id`)  -- 关联user表的user_id\n  -- 可选：级联操作（删除/更新主表记录时，从表的处理规则）\n  ON DELETE RESTRICT  -- 默认：主表记录被引用时禁止删除\n  ON UPDATE CASCADE   -- 主表主键更新时，从表外键同步更新\n);\n```\n\n物理外键有缺点，影响增删改查效率，仅用于单节点数据库，不可以分布式，集群，容易引发数据库死锁问题，现在用逻辑外键解决问题\n\n表有一对一关系，比如用户的基本信息，和用户的详细信息。我们可以将用户表分成这两个部分，提升查询效率。\n\n表有多对多关系，比如学生与课程的关系，一个学生可以选多门课，一门课可以被多个学生选择，实现时建立第三张中间表，中间表至少包含两个外键，分别关联两方主键\n\n### 多表查询\n\n默认`SELECT * FROM a, b;`时会将a的字段和b的字段进行笛卡尔积后返回查询结果\n\n当多表查询**没有写任何关联条件**（如 `ON`/`WHERE`），数据库会把表 A 的**每一条记录**和表 B 的**每一条记录**两两配对，最终结果行数 = 表 A 行数 × 表 B 行数。\n\n我们应该运用多表查询方式，过滤掉无意义的配对\n\n1. 内连接\n\n   ```sql\n   -- 直接把多表查询结果组合起来\n   SELECT emp.id, emp.name, dept.name FROM emp, dept \n   WHERE emp.dept_id = dept.id; -- 关联（隐式写法）\n   SELECT emp.id, emp.name, dept.name FROM emp \n   INNER JOIN dept ON emp.dept_id = dept.id; -- 显示写法\n   \n   -- 可以给表起别名简化书写(AS可以省略)，起了别名，不能用原表名\n   SELECT e.id, e.name, d.name FROM emp AS e, dept AD d\n   INNER JOIN d ON e.dept_id = dept.id;\n   ```\n\n2. 外连接\n\n   ', 4, NULL, 'PASS', 0, '2025-12-20 12:47:30', '2025-12-20 13:20:17', 0, 0, 0, NULL, 'SQL', '', '');
INSERT INTO `post` VALUES (34, 'Learning Linux', '你作为Linux新手，想要先了解Linux系统的基础概况，再掌握Alpine Linux中核心的文件/目录操作、软件管理命令，最终目的是练习Linux基础操作并部署基于SpringBoot后端的前后端分离项目，这个学习路径非常清晰，我会从基础到实操一步步讲解。...', '你作为Linux新手，想要先了解Linux系统的基础概况，再掌握Alpine Linux中核心的文件/目录操作、软件管理命令，最终目的是练习Linux基础操作并部署基于SpringBoot后端的前后端分离项目，这个学习路径非常清晰，我会从基础到实操一步步讲解。\n\n## 一、Linux系统简介\n\nLinux是一套**开源、免费**的类Unix操作系统内核，由Linus Torvalds于1991年发布，最大特点是**多用户、多任务、高稳定性、可高度定制**，广泛用于服务器、嵌入式设备、容器化部署等场景。\n\n### 常见Linux发行版\n\n不同厂商基于Linux内核封装了不同的“发行版”，适配不同场景：\n\n- Ubuntu/Debian：桌面+服务器通用，新手友好，包管理器为`apt`；\n- CentOS/RockyLinux：服务器主流，包管理器为`yum/dnf`；\n- **Alpine Linux**：超轻量级发行版（镜像仅几十MB），采用`musl libc`替代传统`glibc`，包管理器为`apk`，因体积小、资源占用低，是Docker容器部署（比如SpringBoot项目）的首选系统。\n\n## 二、Alpine Linux核心常用命令（适配你的练习&部署需求）\n\nAlpine的命令和主流Linux大部分通用，但软件管理用`apk`（区别于Ubuntu的`apt`、CentOS的`yum`），以下按你需要的功能分类讲解，每个命令都附实操示例。\n\n### 1. 目录操作（核心：进入/查看目录）\n\n| 命令  | 作用                                   | 实操示例                                                     |\n| ----- | -------------------------------------- | ------------------------------------------------------------ |\n| `pwd` | 查看当前所在目录（新手必用，防止迷路） | `pwd` → 输出：`/root`                                        |\n| `cd`  | 切换目录（进入目录）                   | - 进入指定目录：`cd /usr/local` <br> - 回到上一级目录：`cd ..` <br> - 回到当前用户家目录：`cd ~` <br> - 回到上一次所在目录：`cd -` |\n| `ls`  | 列出目录内容                           | - 简单列出：`ls` <br> - 详细列表（含权限/大小/时间）：`ls -l`（简写`ll`，Alpine需手动配置别名） <br> - 显示隐藏文件（以`.`开头）：`ls -a` <br> - 组合使用：`ls -la` |\n\n### 2. 文件操作（新建、读写、拷贝、移动、删除）\n\n#### （1）新建文件/目录\n\n| 命令    | 作用                                     | 实操示例                                                     |\n| ------- | ---------------------------------------- | ------------------------------------------------------------ |\n| `touch` | 新建空文件（若文件已存在则更新修改时间） | `touch app.log`（新建日志文件，部署SpringBoot会用到）        |\n| `mkdir` | 新建目录                                 | - 新建单级目录：`mkdir springboot` <br> - 新建多级目录（部署项目常用）：`mkdir -p /opt/project/backend`（`-p`自动创建不存在的父目录） |\n| `echo`  | 新建带内容的文件                         | `echo \"spring.profiles.active=prod\" > application.properties`（新建配置文件并写入内容） |\n\n#### （2）文件读写（查看/编辑）\n\n部署SpringBoot时经常需要查看配置文件、日志文件，编辑配置，核心命令：\n\n- **查看文件内容**：\n\n  | 命令   | 适用场景                                           | 实操示例                                                     |\n  | ------ | -------------------------------------------------- | ------------------------------------------------------------ |\n  | `cat`  | 一次性查看小文件全部内容                           | `cat application.properties`                                 |\n  | `less` | 分页查看大文件（按`PageUp/PageDown`翻页，`q`退出） | `less app.log`（查看SpringBoot日志）                         |\n  | `tail` | 查看文件尾部（部署项目看实时日志必备）             | - 查看最后10行：`tail app.log` <br> - 实时跟踪日志（关键）：`tail -f app.log`（按`Ctrl+C`停止） |\n  | `head` | 查看文件头部                                       | `head -5 application.properties`（查看前5行）                |\n\n- **编辑文件**：\n  Alpine默认只有`vi`编辑器，`vim`需手动安装，新手简单掌握基础操作即可：\n\n  1. 打开/新建文件：`vi application.properties`\n  2. 进入编辑模式：按`i`（左下角显示`INSERT`）\n  3. 编辑内容（比如修改SpringBoot端口：`server.port=8081`）\n  4. 退出编辑模式：按`Esc`\n  5. 保存/退出：\n     - 保存并退出：输入`:wq`（最常用）\n     - 不保存强制退出：输入`:q!`\n     - 仅保存：输入`:w`\n\n#### （3）拷贝、移动、删除文件/目录\n\n| 命令 | 作用                            | 实操示例                                                     |\n| ---- | ------------------------------- | ------------------------------------------------------------ |\n| `cp` | 拷贝文件/目录                   | - 拷贝文件：`cp /opt/app.jar /opt/backup/`（备份SpringBoot包） <br> - 拷贝目录（加`-r`）：`cp -r /opt/project /tmp/` |\n| `mv` | 移动文件/目录（也可用于重命名） | - 移动文件：`mv app.log /var/log/` <br> - 重命名文件：`mv application.properties app-dev.properties` |\n| `rm` | 删除文件/目录（谨慎使用！）     | - 删除文件：`rm app.log` <br> - 删除空目录：`rmdir springboot` <br> - 强制删除目录及所有内容（部署常用）：`rm -rf /opt/old-project`（`-r`递归，`-f`强制，**禁止运行`rm -rf /`**） |\n\n### 3. 软件管理（安装/删除，Alpine核心：apk）\n\n部署SpringBoot需要安装JDK/JRE、前端可能需要Nginx，核心命令：\n\n#### 前置：更新软件源（安装前建议执行）\n\n```bash\napk update  # 更新软件包索引（类似手机更新应用商店列表）\n```\n\n#### 安装软件\n\n```bash\n# 示例1：安装部署SpringBoot必需的JRE（轻量，推荐）\napk add openjdk17-jre\n\n# 示例2：安装vim编辑器（比vi更好用）\napk add vim\n\n# 示例3：安装部署前端的Nginx\napk add nginx\n\n# 示例4：安装下载文件的wget（下载SpringBoot包用）\napk add wget\n```\n\n#### 查看已安装软件\n\n```bash\n# 查看所有已安装软件\napk list --installed\n\n# 过滤查看指定软件（比如检查JRE是否安装）\napk list --installed | grep jdk\n```\n\n#### 删除软件\n\n```bash\n# 示例：删除vim\napk del vim\n\n# 清理安装缓存（节省空间）\napk cache clean\n```\n\n### 4. 部署SpringBoot项目的实操补充（结合命令）\n\n给你一个极简的部署流程示例，串联以上命令：\n\n```bash\n# 1. 创建项目目录\nmkdir -p /opt/project/springboot-backend\n\n# 2. 下载SpringBoot jar包（假设已有下载链接）\nwget https://xxx.com/app.jar -O /opt/project/springboot-backend/app.jar\n\n# 3. 安装JRE\napk update && apk add openjdk17-jre\n\n# 4. 后台运行SpringBoot（避免终端关闭进程停止）\nnohup java -jar /opt/project/springboot-backend/app.jar > /opt/project/springboot-backend/app.log 2>&1 &\n\n# 5. 实时查看运行日志\ntail -f /opt/project/springboot-backend/app.log\n```\n\n## 总结\n\n1. **核心目录/文件命令**：`cd/pwd/ls`（目录操作）、`touch/mkdir`（新建）、`cat/tail/vi`（读写）、`cp/mv/rm -rf`（拷贝/移动/删除）是基础，务必熟练；\n2. **Alpine软件管理**：核心是`apk update`（更新源）、`apk add`（安装）、`apk del`（删除），部署SpringBoot需先装JRE/JDK；\n3. **部署关键**：用`mkdir -p`创建多级目录，`tail -f`查看实时日志，`nohup`后台运行SpringBoot进程。\n\n建议你先逐行练习上述命令（比如先在`/tmp`目录下创建测试文件/目录，避免误操作），再尝试部署简单的SpringBoot demo，逐步熟悉整个流程。', 4, NULL, 'PASS', 0, '2025-12-20 12:47:57', '2025-12-20 13:20:22', 0, 0, 0, NULL, 'linux', '', '');

-- ----------------------------
-- Table structure for report
-- ----------------------------
DROP TABLE IF EXISTS `report`;
CREATE TABLE `report`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '举报记录唯一标识',
  `user_id` bigint NOT NULL COMMENT '举报人用户ID（谁发起举报）',
  `report_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '举报类型（SPAM=垃圾信息/ILLEGAL=违法内容/OTHER=其他）',
  `report_target_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '被举报的对象类型（COMMENT=评论/POST=帖子/USER=用户）',
  `report_target` bigint NOT NULL COMMENT '被举报的对象ID（如帖子ID/评论ID/用户ID）',
  `reason` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '举报理由（可选）',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'PENDING' COMMENT '举报处理状态（PENDING=待处理/PROCESSED=已处理）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
  `handled_at` datetime NULL DEFAULT NULL COMMENT '处理时间（可选）',
  `handled_by` bigint NULL DEFAULT NULL COMMENT '处理人用户ID（可选）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_report_user`(`user_id` ASC) USING BTREE COMMENT '关联举报人',
  INDEX `idx_report_type`(`report_type` ASC) USING BTREE COMMENT '按举报类型筛选',
  INDEX `idx_report_target`(`report_target_type` ASC, `report_target` ASC) USING BTREE COMMENT '规范要求：复合索引（查询对象举报记录）',
  INDEX `idx_report_status`(`status` ASC, `created_at` ASC) USING BTREE COMMENT '按状态+时间查询举报',
  INDEX `idx_report_handled`(`handled_at` ASC) USING BTREE COMMENT '按处理时间排序',
  CONSTRAINT `fk_report_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '举报表（记录举报记录，举报人删除时级联删除举报记录）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of report
-- ----------------------------
INSERT INTO `report` VALUES (1, 1, 'stateSecurity', 'COMMENT', 1, '', 'HANDLED', '2025-12-09 17:05:09', '2025-12-12 17:55:51', 1);
INSERT INTO `report` VALUES (2, 1, 'stateSecurity', 'COMMENT', 2, '', 'HANDLED', '2025-12-09 17:05:49', '2025-12-12 17:56:28', 1);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识',
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '邮箱（登录账号）',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '加密存储的密码（如bcrypt哈希）',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `role` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'USER' COMMENT '角色（USER/MODERATOR/ADMIN）',
  `fans_count` int NOT NULL DEFAULT 0 COMMENT '粉丝数',
  `following_count` int NOT NULL DEFAULT 0 COMMENT '关注数',
  `intro` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'Hello~' COMMENT '用户的自我介绍',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最近上线时间（可空，未登录时无值）',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'NORMAL' COMMENT '用户状态(NORMAL/UNABLE)',
  `avatar_link` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp' COMMENT '头像链接',
  `background_link` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t' COMMENT '背景链接（按规范设为可空）',
  `used_invite_code` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '注册使用的邀请码（恢复缺失字段）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE COMMENT '邮箱唯一，避免重复注册',
  INDEX `idx_user_role`(`role` ASC) USING BTREE COMMENT '按角色查询用户',
  INDEX `idx_user_created_at`(`created_at` ASC) USING BTREE COMMENT '按注册时间排序',
  INDEX `idx_user_status`(`status` ASC) USING BTREE COMMENT '按状态筛选用户',
  INDEX `fk_user_invite_code`(`used_invite_code` ASC) USING BTREE COMMENT '关联邀请码表（后续添加外键）',
  CONSTRAINT `fk_user_invite_code` FOREIGN KEY (`used_invite_code`) REFERENCES `invite_code` (`code`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表（储存用户信息）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'master@talkforum.top', '$2a$10$7Zro1CH4qUKMSTy9QeeNNOJWas8vY8.qlPn73EO77GK35DfB5zxy.', 'lichi', 'ADMIN', 0, 0, 'Hello~', '2025-12-08 22:03:18', '2025-12-20 12:32:49', 'NORMAL', 'https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e33.webp', 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t', NULL);
INSERT INTO `user` VALUES (2, 'a@qq.com', '$2a$10$3igEuhAg8O8amtB4dn.Pne7632DDAuEJVKKq6p00.ZNN7t.zfzvz.', 'somebodyelse', 'USER', 0, 0, 'Hello~', '2025-12-11 16:23:30', '2025-12-16 17:01:04', 'NORMAL', 'https://pic1.imgdb.cn/item/6905cbca3203f7be00bf6e32.webp', 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t', 'dH2EOm3JjPM5');
INSERT INTO `user` VALUES (3, 'practice2dot5hr@talkforum.top', '$2a$10$v/4tcn8F4bVlOyhN4WD9X.u8xsVXbOk09fcdOJvwlEeY3nhtWELv2', 'practice 2.5 hr', 'MODERATOR', 0, 0, 'Hello~', '2025-12-11 21:13:50', '2025-12-11 21:13:53', 'NORMAL', 'https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp', 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t', 'tkoJB7GpGm7V');
INSERT INTO `user` VALUES (4, 'loveluosifen@talkforum.top', '$2a$10$00at9z6Bj3TXidnNQhyI4O/fMBINp0T.pjwgc2hYuaOzyhwZMn/B.', '爱吃螺蛳粉', 'USER', 0, 0, 'Hello~', '2025-12-20 12:46:52', '2025-12-20 12:46:54', 'NORMAL', 'https://pic1.imgdb.cn/item/6905cb483203f7be00bf6bf3.webp', 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t', 'ZpuV0Ukcm0ek');

SET FOREIGN_KEY_CHECKS = 1;
