-- 删除已存在的数据库（若存在），并重建数据库
DROP DATABASE IF EXISTS TalkForum;
CREATE DATABASE TalkForum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE TalkForum;

-- 1. 用户表（user）- 先创建核心结构（暂不添加invite_code外键）
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识',
  `email` varchar(64) NOT NULL COMMENT '邮箱（登录账号）',
  `password` varchar(128) NOT NULL COMMENT '加密存储的密码（如bcrypt哈希）',
  `name` varchar(32) NOT NULL COMMENT '用户名',
  `role` varchar(16) NOT NULL DEFAULT 'USER' COMMENT '角色（USER/MODERATOR/ADMIN）',
  `fans_count` int NOT NULL DEFAULT 0 COMMENT '粉丝数',
  `following_count` int NOT NULL DEFAULT 0 COMMENT '关注数',
  `intro` varchar(128) NOT NULL DEFAULT 'Hello~' COMMENT '用户的自我介绍',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `last_login_at` datetime DEFAULT NULL COMMENT '最近上线时间（可空，未登录时无值）',
  `status` varchar(16) NOT NULL DEFAULT 'NORMAL' COMMENT '用户状态(NORMAL/UNABLE)',
  `avatar_link` varchar(256) NOT NULL DEFAULT 'https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp' COMMENT '头像链接',
  `background_link` varchar(256) DEFAULT 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t' COMMENT '背景链接（按规范设为可空）',
  `used_invite_code` varchar(16) DEFAULT NULL COMMENT '注册使用的邀请码（恢复缺失字段）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`) COMMENT '邮箱唯一，避免重复注册',
  KEY `idx_user_role` (`role`) COMMENT '按角色查询用户',
  KEY `idx_user_created_at` (`created_at`) COMMENT '按注册时间排序',
  KEY `idx_user_status` (`status`) COMMENT '按状态筛选用户',
  KEY `fk_user_invite_code` (`used_invite_code`) COMMENT '关联邀请码表（后续添加外键）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表（储存用户信息）';

-- 2. 令牌表（auth_token）- 按规范保留（标注暂时废弃）
CREATE TABLE `auth_token` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '令牌唯一标识',
  `user_id` bigint NOT NULL COMMENT '关联用户ID',
  `token` varchar(256) NOT NULL COMMENT '登录态令牌',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `is_valid` tinyint NOT NULL DEFAULT 1 COMMENT '是否合法(1=是，0=否)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`token`) COMMENT '令牌唯一，避免重复登录态',
  KEY `fk_auth_token_user` (`user_id`) COMMENT '关联用户表',
  KEY `idx_auth_token_expire` (`expire_time`) COMMENT '按过期时间筛选令牌',
  CONSTRAINT `fk_auth_token_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='令牌表（储存所有登录令牌，暂时废弃；用户删除时级联删除令牌）';

-- 3. 邀请码表（invite_code）- 提前创建（依赖user表，此时user表已存在）
CREATE TABLE `invite_code` (
  `code` varchar(16) NOT NULL COMMENT '邀请码',
  `creator_id` bigint NOT NULL COMMENT '创建用户的id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expired_at` datetime NOT NULL COMMENT '过期时间',
  `max_count` int NOT NULL DEFAULT 1 COMMENT '最大使用次数',
  `used_count` int NOT NULL DEFAULT 0 COMMENT '已使用次数',
  PRIMARY KEY (`code`) COMMENT '规范要求：邀请码为主键',
  UNIQUE KEY `uk_invite_code` (`code`) COMMENT '邀请码唯一',
  KEY `idx_invite_code_creator` (`creator_id`) COMMENT '关联创建者',
  KEY `idx_invite_code_expired` (`expired_at`) COMMENT '按过期时间筛选',
  -- 规范要求：限制已使用次数不超过最大次数（MySQL 5.7+支持CHECK）
  CHECK (`used_count` <= `max_count`),
  CONSTRAINT `fk_invite_code_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邀请码表（记录邀请码）';

-- 4. 给user表添加used_invite_code外键（此时invite_code表已存在，无引用冲突）
ALTER TABLE `user`
ADD CONSTRAINT `fk_user_invite_code` FOREIGN KEY (`used_invite_code`) 
REFERENCES `invite_code` (`code`) ON DELETE SET NULL;

-- 5. 圈子表（club）- 修正creator_id约束、补充默认值、调整外键策略
CREATE TABLE `club` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '圈子唯一标识',
  `name` varchar(32) NOT NULL COMMENT '圈子名称',
  `description` varchar(512) DEFAULT NULL COMMENT '圈子描述',
  `avatar_link` varchar(256) NOT NULL DEFAULT '/icon.ico' COMMENT '头像链接（按规范设默认值）',
  `background_link` varchar(256) DEFAULT NULL COMMENT '背景链接',
  `creator_id` bigint NOT NULL COMMENT '创建者用户ID（按规范设为非空）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `member_count` int NOT NULL DEFAULT 0 COMMENT '成员人数（通过club_member表同步更新）',
  `is_deleted` tinyint NOT NULL DEFAULT 0 COMMENT '是否被删掉(1=是，0=否)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_club_name` (`name`) COMMENT '圈子名称唯一',
  KEY `fk_club_creator` (`creator_id`) COMMENT '关联创建者',
  KEY `idx_club_created_at` (`created_at`) COMMENT '按创建时间排序',
  KEY `idx_club_member_count` (`member_count`) COMMENT '按成员数筛选',
  KEY `idx_club_is_deleted` (`is_deleted`) COMMENT '筛选未删除圈子',
  -- 按规范：用户删除时圈子软删除（业务层同步更新is_deleted=1），SQL层限制删除（避免creator_id非空矛盾）
  CONSTRAINT `fk_club_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子表（储存所有的圈子；用户删除时圈子软删掉，变为不可加入）';

-- 6. 帖子表（post）- 补充规范要求的复合唯一索引
CREATE TABLE `post` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '帖子唯一标识',
  `title` varchar(64) COMMENT '帖子标题',
  `brief` text NOT NULL COMMENT '帖子简介',
  `content` text NOT NULL COMMENT '帖子内容',
  `user_id` bigint NOT NULL COMMENT '作者用户ID',
  `club_id` bigint DEFAULT NULL COMMENT '所属圈子ID（可选）',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT '状态（PENDING/PASS/REJECT/DELETE）',
  `is_essence` tinyint NOT NULL DEFAULT 0 COMMENT '是否精华（1=是，0=否）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '阅读次数',
  `like_count` int NOT NULL DEFAULT 0 COMMENT '点赞数量',
  `comment_count` int NOT NULL DEFAULT 0 COMMENT '评论数量',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_post_club_status_created` (`club_id`, `status`, `created_at` DESC) COMMENT '规范要求：复合唯一索引（圈子+状态+创建时间倒序）',
  KEY `fk_post_user` (`user_id`) COMMENT '关联作者',
  KEY `fk_post_club` (`club_id`) COMMENT '关联所属圈子',
  KEY `idx_post_status` (`status`) COMMENT '按状态筛选帖子',
  KEY `idx_post_is_essence` (`is_essence`) COMMENT '筛选精华帖',
  KEY `idx_post_created_at` (`created_at`) COMMENT '按创建时间排序',
  KEY `idx_post_updated_at` (`updated_at`) COMMENT '按更新时间排序',
  CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子表（储存所有帖子，作者删除时级联删除帖子；圈子删除时级联删除帖子）';

-- 7. 评论表（comment）- 补充规范要求的复合唯一索引
CREATE TABLE `comment` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论唯一标识',
  `post_id` bigint NOT NULL COMMENT '关联帖子ID',
  `user_id` bigint NOT NULL COMMENT '评论者用户ID',
  `parent_id` bigint DEFAULT NULL COMMENT '关联回复的评论ID（顶级评论为null）',
  `content` varchar(1024) NOT NULL COMMENT '评论内容',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT '状态（PENDING/PASS/REJECT/DELETE）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `like_count` int NOT NULL DEFAULT 0 COMMENT '点赞数量',
  `comment_count` int NOT NULL DEFAULT 0 COMMENT '回复数量',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_comment_post_status_created` (`post_id`, `status`, `created_at`) COMMENT '规范要求：复合唯一索引（帖子+状态+创建时间）',
  KEY `fk_comment_post` (`post_id`) COMMENT '关联帖子',
  KEY `fk_comment_user` (`user_id`) COMMENT '关联评论者',
  KEY `fk_comment_parent` (`parent_id`) COMMENT '关联父评论',
  KEY `idx_comment_status` (`status`) COMMENT '按状态筛选评论',
  KEY `idx_comment_created_at` (`created_at`) COMMENT '按创建时间排序',
  CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表（储存所有评论，帖子删除时级联删除评论；评论者删除时级联删除评论；父评论删除时级联删除子评论）';

-- 8. 圈子成员表（club_member）- 补充规范要求的双复合唯一索引
CREATE TABLE `club_member` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '成员关系唯一标识',
  `club_id` bigint NOT NULL COMMENT '关联圈子ID',
  `user_id` bigint NOT NULL COMMENT '关联用户ID',
  `role` varchar(16) NOT NULL DEFAULT 'MEMBER' COMMENT '成员角色（OWNER/MEMBER）',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_club_user` (`club_id`, `user_id`) COMMENT '规范要求：复合唯一索引（圈子+用户）',
  UNIQUE KEY `uk_user_club` (`user_id`, `club_id`) COMMENT '规范要求：复合唯一索引（用户+圈子）',
  KEY `fk_club_member_club` (`club_id`) COMMENT '关联圈子',
  KEY `fk_club_member_user` (`user_id`) COMMENT '关联用户',
  KEY `idx_club_member_role` (`role`) COMMENT '按角色筛选成员',
  KEY `idx_club_member_joined` (`joined_at`) COMMENT '按加入时间排序',
  CONSTRAINT `fk_club_member_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_club_member_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子成员表（查询圈子所有成员，圈子删除时级联删除成员关系；用户删除时级联删除成员关系）';

-- 9. 圈子创建申请表（club_apply_create）- 按规范保持一致
CREATE TABLE `club_apply_create` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '申请唯一标识',
  `user_id` bigint NOT NULL COMMENT '申请人用户ID',
  `name` varchar(32) NOT NULL COMMENT '申请创建的圈子名称',
  `description` varchar(512) DEFAULT NULL COMMENT '圈子描述',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT '申请状态（PENDING/PASS/REJECT）',
  `handled_by` bigint DEFAULT NULL COMMENT '处理人用户ID（管理员/风纪）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `fk_apply_create_user` (`user_id`) COMMENT '关联申请人',
  KEY `fk_apply_create_handler` (`handled_by`) COMMENT '关联处理人',
  KEY `idx_apply_create_status` (`status`) COMMENT '按状态筛选申请',
  KEY `idx_apply_create_name` (`name`) COMMENT '按圈子名称查询申请',
  KEY `idx_apply_create_created` (`created_at`) COMMENT '按申请时间排序',
  CONSTRAINT `fk_apply_create_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apply_create_handler` FOREIGN KEY (`handled_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子创建申请表（记录所有圈子申请记录，申请人删除时级联删除申请；处理人删除时保留申请）';

-- 10. 圈子加入申请表（club_apply_join）- 按规范保持一致
CREATE TABLE `club_apply_join` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '申请唯一标识',
  `user_id` bigint NOT NULL COMMENT '申请人用户ID',
  `club_id` bigint NOT NULL COMMENT '申请加入的圈子ID',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT '申请状态（PENDING/PASS/REJECT）',
  `handled_by` bigint DEFAULT NULL COMMENT '处理人用户ID（圈子创建者/管理员）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `fk_apply_join_user` (`user_id`) COMMENT '关联申请人',
  KEY `fk_apply_join_club` (`club_id`) COMMENT '关联圈子',
  KEY `fk_apply_join_handler` (`handled_by`) COMMENT '关联处理人',
  KEY `idx_apply_join_status` (`status`) COMMENT '按状态筛选申请',
  KEY `idx_apply_join_user_club` (`user_id`, `club_id`) COMMENT '规范要求：复合索引（用户+圈子）',
  CONSTRAINT `fk_apply_join_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apply_join_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apply_join_handler` FOREIGN KEY (`handled_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='圈子加入申请表（记录圈子加入记录，申请人删除时级联删除申请；圈子删除时级联删除申请；处理人删除时保留申请）';

-- 11. 通知表（notification）- 修正operator_id约束和外键策略
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '通知唯一标识',
  `user_id` bigint NOT NULL COMMENT '接收通知的用户 ID（谁会收到通知）',
  `type` varchar(32) NOT NULL COMMENT '通知类型（POST_COMMENT：帖子被评论；COMMENT_REPLY：评论被追评；FOLLOW：被关注）',
  `related_id` bigint NOT NULL COMMENT '关联的核心资源 ID：帖子被评论时=帖子ID；评论被追评时=原评论ID；被关注时=被关注者ID',
  `operator_id` bigint NOT NULL COMMENT '操作人 ID（谁触发了通知）（按规范设为非空）',
  `content` varchar(1024) NOT NULL COMMENT '通知内容',
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '是否已读（1=已读，0=未读）',
  `is_deleted` tinyint NOT NULL DEFAULT 0 COMMENT '是否被删掉(1=是，0=否)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '通知创建时间',
  PRIMARY KEY (`id`),
  KEY `fk_notification_user` (`user_id`) COMMENT '关联接收用户',
  KEY `fk_notification_operator` (`operator_id`) COMMENT '关联操作人',
  KEY `idx_notification_type` (`type`) COMMENT '按通知类型筛选',
  KEY `idx_notification_related` (`related_id`) COMMENT '按关联资源ID查询',
  KEY `idx_notification_user_read` (`user_id`, `is_read`, `created_at`) COMMENT '规范要求：复合索引（用户+已读状态+创建时间）',
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  -- 按规范：操作人删除时移除通知（级联删除）
  CONSTRAINT `fk_notification_operator` FOREIGN KEY (`operator_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表（记录通知信息，接收用户删除时级联删除通知；操作人删除时移除通知）';

-- 12. 互动表（interaction）- 按规范保持一致
CREATE TABLE `interaction` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '互动记录唯一标识',
  `user_id` bigint NOT NULL COMMENT '发起互动的用户ID（谁进行互动）',
  `interact_type` varchar(16) NOT NULL COMMENT '互动类型（LIKE=点赞/DISLIKE=踩/FOLLOW=关注）',
  `interact_target_type` varchar(16) NOT NULL COMMENT '被互动的对象类型（COMMENT=评论/POST=帖子/USER=用户）',
  `interact_target` bigint NOT NULL COMMENT '被互动的对象ID（如帖子ID/评论ID/用户ID）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '互动时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_interact` (`user_id`, `interact_target_type`, `interact_target`, `interact_type`) COMMENT '规范要求：复合唯一索引（避免重复互动）',
  KEY `idx_interact_target` (`interact_target_type`, `interact_target`, `interact_type`) COMMENT '规范要求：复合索引（统计对象互动数量）',
  KEY `idx_interaction_created` (`created_at`) COMMENT '按互动时间排序',
  CONSTRAINT `fk_interaction_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='互动表（记录互动记录，如点赞、踩，用户删除时级联删除互动记录）';

-- 13. 举报表（report）- 按规范保持一致
CREATE TABLE `report` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '举报记录唯一标识',
  `user_id` bigint NOT NULL COMMENT '举报人用户ID（谁发起举报）',
  `report_type` varchar(16) NOT NULL COMMENT '举报类型（SPAM=垃圾信息/ILLEGAL=违法内容/OTHER=其他）',
  `report_target_type` varchar(16) NOT NULL COMMENT '被举报的对象类型（COMMENT=评论/POST=帖子/USER=用户）',
  `report_target` bigint NOT NULL COMMENT '被举报的对象ID（如帖子ID/评论ID/用户ID）',
  `reason` varchar(256) DEFAULT NULL COMMENT '举报理由（可选）',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT '举报处理状态（PENDING=待处理/PROCESSED=已处理）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
  `handled_at` datetime DEFAULT NULL COMMENT '处理时间（可选）',
  PRIMARY KEY (`id`),
  KEY `fk_report_user` (`user_id`) COMMENT '关联举报人',
  KEY `idx_report_type` (`report_type`) COMMENT '按举报类型筛选',
  KEY `idx_report_target` (`report_target_type`, `report_target`) COMMENT '规范要求：复合索引（查询对象举报记录）',
  KEY `idx_report_status` (`status`, `created_at`) COMMENT '按状态+时间查询举报',
  CONSTRAINT `fk_report_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报表（记录举报记录，举报人删除时级联删除举报记录）';