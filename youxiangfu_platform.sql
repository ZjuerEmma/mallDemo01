-- ----------------------------
-- Chat2DB export data , export time: 2025-08-22 17:39:52
-- ----------------------------
SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for table activity
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '活动标题',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `merchant_id` bigint DEFAULT NULL COMMENT '关联商户ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '活动描述',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '活动详细内容',
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图片',
  `images` json DEFAULT NULL COMMENT '活动图片集合',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '活动地址',
  `longitude` decimal(10,7) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,7) DEFAULT NULL COMMENT '纬度',
  `max_participants` int DEFAULT NULL COMMENT '最大参与人数',
  `current_participants` int NOT NULL DEFAULT '0' COMMENT '当前参与人数',
  `tags` json DEFAULT NULL COMMENT '标签集合',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:正常,2:已结束)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  `activity_source` tinyint DEFAULT '0' COMMENT '活动来源（0：商户活动，1：用户拼约）',
  `activity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '活动类型（运动、聚餐、娱乐、学习等）',
  `price` decimal(10,2) DEFAULT '0.00' COMMENT '活动价格',
  `venue_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '场馆名称',
  `signup_fee` decimal(10,2) DEFAULT '0.00' COMMENT '报名费用',
  `creator_id` bigint DEFAULT NULL COMMENT '创建者ID（用户拼约时使用）',
  `creator_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者昵称',
  `creator_avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者头像URL',
  `signup_deadline` datetime DEFAULT NULL COMMENT '报名截止时间',
  `allow_waitlist` tinyint(1) DEFAULT '0' COMMENT '是否允许候补（0：不允许，1：允许）',
  `max_waitlist` int DEFAULT '0' COMMENT '候补人数上限',
  `current_waitlist` int DEFAULT '0' COMMENT '当前候补人数',
  `contact_info` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系方式',
  `requirements` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '特殊要求',
  `popularity_score` int DEFAULT '0' COMMENT '活动热度分数',
  `view_count` int DEFAULT '0' COMMENT '浏览次数',
  `share_count` int DEFAULT '0' COMMENT '分享次数',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_category_id` (`category_id`) USING BTREE,
  KEY `idx_merchant_id` (`merchant_id`) USING BTREE,
  KEY `idx_time_range` (`start_time`,`end_time`) USING BTREE,
  KEY `idx_location` (`longitude`,`latitude`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_activity_source` (`activity_source`),
  KEY `idx_activity_type` (`activity_type`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_signup_deadline` (`signup_deadline`),
  KEY `idx_popularity_score` (`popularity_score`),
  CONSTRAINT `fk_activity_category` FOREIGN KEY (`category_id`) REFERENCES `activity_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_activity_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- ----------------------------
-- Table structure for table activity_category
-- ----------------------------
DROP TABLE IF EXISTS `activity_category`;
CREATE TABLE `activity_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分类图标',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序序号',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_sort_order` (`sort_order`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动分类表';

-- ----------------------------
-- Table structure for table activity_signup
-- ----------------------------
DROP TABLE IF EXISTS `activity_signup`;
CREATE TABLE `activity_signup` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_id` bigint NOT NULL COMMENT '活动ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户昵称',
  `user_avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户头像URL',
  `user_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户手机号',
  `status` tinyint DEFAULT '0' COMMENT '报名状态（0：已报名，1：已确认，2：已取消，3：候补中，4：候补转正）',
  `signup_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `confirm_time` datetime DEFAULT NULL COMMENT '确认时间',
  `cancel_time` datetime DEFAULT NULL COMMENT '取消时间',
  `payment_status` tinyint DEFAULT '0' COMMENT '支付状态（0：未支付，1：已支付，2：已退款）',
  `payment_amount` decimal(10,2) DEFAULT '0.00' COMMENT '支付金额',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报名备注',
  `is_waitlist` tinyint(1) DEFAULT '0' COMMENT '是否是候补（0：正式报名，1：候补）',
  `waitlist_order` int DEFAULT NULL COMMENT '候补排序',
  `checkin_status` tinyint DEFAULT '0' COMMENT '签到状态（0：未签到，1：已签到，2：迟到，3：缺席）',
  `checkin_time` datetime DEFAULT NULL COMMENT '签到时间',
  `rating` tinyint DEFAULT NULL COMMENT '评价分数（1-5分）',
  `review` text COLLATE utf8mb4_unicode_ci COMMENT '评价内容',
  `review_time` datetime DEFAULT NULL COMMENT '评价时间',
  `cancel_reason` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '取消原因',
  `contact_info` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系方式',
  `emergency_contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '紧急联系人',
  `special_requirements` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '特殊需求',
  `source` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'app' COMMENT '报名来源（app、web、miniprogram）',
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户代理',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint DEFAULT '0' COMMENT '是否删除（0：未删除，1：已删除）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_user` (`activity_id`,`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_activity_id` (`activity_id`),
  KEY `idx_status` (`status`),
  KEY `idx_signup_time` (`signup_time`),
  KEY `idx_waitlist` (`is_waitlist`,`waitlist_order`),
  KEY `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名表';

-- ----------------------------
-- Table structure for table coupon
-- ----------------------------
DROP TABLE IF EXISTS `coupon`;
CREATE TABLE `coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `merchant_id` bigint NOT NULL COMMENT '商户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '优惠券名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '优惠券描述',
  `type` tinyint NOT NULL COMMENT '类型(1:满减券,2:折扣券,3:代金券)',
  `discount_amount` decimal(10,2) DEFAULT NULL COMMENT '优惠金额',
  `discount_rate` decimal(5,4) DEFAULT NULL COMMENT '折扣率',
  `min_amount` decimal(10,2) DEFAULT NULL COMMENT '最低消费金额',
  `total_count` int NOT NULL COMMENT '发放总数',
  `used_count` int NOT NULL DEFAULT '0' COMMENT '已使用数量',
  `start_time` datetime NOT NULL COMMENT '有效开始时间',
  `end_time` datetime NOT NULL COMMENT '有效结束时间',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:正常)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_merchant_id` (`merchant_id`) USING BTREE,
  KEY `idx_time_range` (`start_time`,`end_time`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  CONSTRAINT `fk_coupon_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- ----------------------------
-- Table structure for table merchant
-- ----------------------------
DROP TABLE IF EXISTS `merchant`;
CREATE TABLE `merchant` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商户名称',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '商户描述',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商户Logo',
  `images` json DEFAULT NULL COMMENT '商户图片集合',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细地址',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `business_hours` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '营业时间',
  `tags` json DEFAULT NULL COMMENT '标签集合',
  `rating` decimal(3,2) DEFAULT '0.00' COMMENT '评分',
  `review_count` int NOT NULL DEFAULT '0' COMMENT '评价数量',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:正常)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_category_id` (`category_id`) USING BTREE,
  KEY `idx_location` (`longitude`,`latitude`) USING BTREE,
  KEY `idx_name` (`name`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  CONSTRAINT `fk_merchant_category` FOREIGN KEY (`category_id`) REFERENCES `merchant_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户表';

-- ----------------------------
-- Table structure for table merchant_category
-- ----------------------------
DROP TABLE IF EXISTS `merchant_category`;
CREATE TABLE `merchant_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分类图标',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序序号',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_sort_order` (`sort_order`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户分类表';

-- ----------------------------
-- Table structure for table sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置值',
  `config_desc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '配置描述',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_config_key` (`config_key`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ----------------------------
-- Table structure for table sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `gender` tinyint DEFAULT '0' COMMENT '性别(0:未知,1:男,2:女)',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `wechat_openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信OpenID',
  `wechat_unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信UnionID',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:正常)',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后登录IP',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_wechat_openid` (`wechat_openid`) USING BTREE,
  UNIQUE KEY `uk_wechat_unionid` (`wechat_unionid`) USING BTREE,
  KEY `idx_phone` (`phone`) USING BTREE,
  KEY `idx_create_time` (`create_time`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

-- ----------------------------
-- Table structure for table user_coupon
-- ----------------------------
DROP TABLE IF EXISTS `user_coupon`;
CREATE TABLE `user_coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `coupon_id` bigint NOT NULL COMMENT '优惠券ID',
  `coupon_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '优惠券码',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态(1:未使用,2:已使用,3:已过期)',
  `receive_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `use_time` datetime DEFAULT NULL COMMENT '使用时间',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_coupon_code` (`coupon_code`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_coupon_id` (`coupon_id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  CONSTRAINT `fk_user_coupon_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_coupon_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- ----------------------------
-- Table structure for table user_favorite
-- ----------------------------
DROP TABLE IF EXISTS `user_favorite`;
CREATE TABLE `user_favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `target_type` tinyint NOT NULL COMMENT '收藏类型(1:商户,2:活动)',
  `target_id` bigint NOT NULL COMMENT '目标ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_target` (`user_id`,`target_type`,`target_id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_target` (`target_type`,`target_id`) USING BTREE,
  CONSTRAINT `fk_user_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

SET FOREIGN_KEY_CHECKS=1;
-- ----------------------------
-- View structure for view v_activity_detail
-- ----------------------------
DROP VIEW IF EXISTS `v_activity_detail`;
CREATE ALGORITHM=UNDEFINED DEFINER=`youxiangfu`@`%` SQL SECURITY DEFINER VIEW `v_activity_detail` AS select `a`.`id` AS `id`,`a`.`title` AS `title`,`a`.`category_id` AS `category_id`,`a`.`merchant_id` AS `merchant_id`,`a`.`description` AS `description`,`a`.`content` AS `content`,`a`.`cover_image` AS `cover_image`,`a`.`images` AS `images`,`a`.`start_time` AS `start_time`,`a`.`end_time` AS `end_time`,`a`.`address` AS `address`,`a`.`longitude` AS `longitude`,`a`.`latitude` AS `latitude`,`a`.`max_participants` AS `max_participants`,`a`.`current_participants` AS `current_participants`,`a`.`tags` AS `tags`,`a`.`status` AS `status`,`a`.`create_time` AS `create_time`,`a`.`update_time` AS `update_time`,`a`.`is_deleted` AS `is_deleted`,`a`.`activity_source` AS `activity_source`,`a`.`activity_type` AS `activity_type`,`a`.`price` AS `price`,`a`.`venue_name` AS `venue_name`,`a`.`signup_fee` AS `signup_fee`,`a`.`creator_id` AS `creator_id`,`a`.`creator_name` AS `creator_name`,`a`.`creator_avatar` AS `creator_avatar`,`a`.`signup_deadline` AS `signup_deadline`,`a`.`allow_waitlist` AS `allow_waitlist`,`a`.`max_waitlist` AS `max_waitlist`,`a`.`current_waitlist` AS `current_waitlist`,`a`.`contact_info` AS `contact_info`,`a`.`requirements` AS `requirements`,`a`.`popularity_score` AS `popularity_score`,`a`.`view_count` AS `view_count`,`a`.`share_count` AS `share_count`,coalesce(`signup_stats`.`confirmed_count`,0) AS `actual_participants`,coalesce(`signup_stats`.`waitlist_count`,0) AS `actual_waitlist_count`,(case when (`a`.`start_time` > now()) then '未开始' when ((`a`.`end_time` < now()) or (`a`.`status` = 2)) then '已结束' else '进行中' end) AS `activity_status_desc`,(case when (`a`.`activity_source` = 1) then (case when (`a`.`status` <> 1) then '活动已结束' when ((`a`.`signup_deadline` is not null) and (`a`.`signup_deadline` < now())) then '报名已截止' when (`a`.`current_participants` >= `a`.`max_participants`) then (case when ((`a`.`allow_waitlist` = 1) and ((`a`.`max_waitlist` is null) or (`a`.`current_waitlist` < `a`.`max_waitlist`))) then '可候补' else '已满员' end) else '可报名' end) else '商户活动' end) AS `signup_status_desc` from (`activity` `a` left join (select `activity_signup`.`activity_id` AS `activity_id`,count((case when ((`activity_signup`.`status` in (0,1,4)) and (`activity_signup`.`is_waitlist` = 0)) then 1 end)) AS `confirmed_count`,count((case when ((`activity_signup`.`status` = 3) and (`activity_signup`.`is_waitlist` = 1)) then 1 end)) AS `waitlist_count` from `activity_signup` where (`activity_signup`.`is_deleted` = 0) group by `activity_signup`.`activity_id`) `signup_stats` on((`a`.`id` = `signup_stats`.`activity_id`))) where (`a`.`is_deleted` = 0);


-- ----------------------------
-- View structure for view v_merchant_detail
-- ----------------------------
DROP VIEW IF EXISTS `v_merchant_detail`;
CREATE ALGORITHM=UNDEFINED DEFINER=`youxiangfu`@`%` SQL SECURITY DEFINER VIEW `v_merchant_detail` AS select `m`.`id` AS `id`,`m`.`name` AS `name`,`m`.`description` AS `description`,`m`.`logo` AS `logo`,`m`.`images` AS `images`,`m`.`phone` AS `phone`,`m`.`address` AS `address`,`m`.`longitude` AS `longitude`,`m`.`latitude` AS `latitude`,`m`.`business_hours` AS `business_hours`,`m`.`tags` AS `tags`,`m`.`rating` AS `rating`,`m`.`review_count` AS `review_count`,`m`.`status` AS `status`,`m`.`create_time` AS `create_time`,`m`.`update_time` AS `update_time`,`mc`.`name` AS `category_name`,`mc`.`icon` AS `category_icon`,(select count(0) from `coupon` `c` where ((`c`.`merchant_id` = `m`.`id`) and (`c`.`status` = 1) and (`c`.`end_time` > now()))) AS `available_coupon_count` from (`merchant` `m` left join `merchant_category` `mc` on((`m`.`category_id` = `mc`.`id`))) where (`m`.`is_deleted` = 0);


-- ----------------------------
-- View structure for view v_user_coupon_detail
-- ----------------------------
DROP VIEW IF EXISTS `v_user_coupon_detail`;
CREATE ALGORITHM=UNDEFINED DEFINER=`youxiangfu`@`%` SQL SECURITY DEFINER VIEW `v_user_coupon_detail` AS select `uc`.`id` AS `id`,`uc`.`user_id` AS `user_id`,`uc`.`coupon_code` AS `coupon_code`,`uc`.`status` AS `status`,`uc`.`receive_time` AS `receive_time`,`uc`.`use_time` AS `use_time`,`uc`.`expire_time` AS `expire_time`,`c`.`name` AS `coupon_name`,`c`.`description` AS `coupon_description`,`c`.`type` AS `coupon_type`,`c`.`discount_amount` AS `discount_amount`,`c`.`discount_rate` AS `discount_rate`,`c`.`min_amount` AS `min_amount`,`m`.`name` AS `merchant_name`,`m`.`logo` AS `merchant_logo`,`m`.`address` AS `merchant_address` from ((`user_coupon` `uc` left join `coupon` `c` on((`uc`.`coupon_id` = `c`.`id`))) left join `merchant` `m` on((`c`.`merchant_id` = `m`.`id`)));


-- ----------------------------
-- Procedure structure for procedure sp_expire_coupons
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_expire_coupons`;
delimiter ;;
CREATE DEFINER=`youxiangfu`@`%` PROCEDURE `sp_expire_coupons`()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- 更新过期的用户优惠券状态
    UPDATE user_coupon 
    SET status = 3 
    WHERE status = 1 AND expire_time < NOW();
    
    COMMIT;
END;;
delimiter ;


-- ----------------------------
-- Procedure structure for procedure sp_user_checkin
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_checkin`;
delimiter ;;
CREATE DEFINER=`youxiangfu`@`%` PROCEDURE `sp_user_checkin`(IN p_user_id BIGINT,
    OUT p_result INT,
    OUT p_message VARCHAR(255))
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = -1;
        SET p_message = '签到失败，系统异常';
    END;
    
    START TRANSACTION;
    
    -- 检查今日是否已签到
    SELECT COUNT(*) INTO v_count 
    FROM sys_config 
    WHERE config_key = CONCAT('user_checkin_', p_user_id, '_', DATE_FORMAT(NOW(), '%Y%m%d'));
    
    IF v_count > 0 THEN
        SET p_result = 0;
        SET p_message = '今日已签到';
    ELSE
        -- 记录签到
        INSERT INTO sys_config (config_key, config_value, config_desc) 
        VALUES (CONCAT('user_checkin_', p_user_id, '_', DATE_FORMAT(NOW(), '%Y%m%d')), NOW(), '用户签到记录');
        
        SET p_result = 1;
        SET p_message = '签到成功';
    END IF;
    
    COMMIT;
END;;
delimiter ;


