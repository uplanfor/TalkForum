package com.talkforum.talkforumserver.invitecode;

import com.talkforum.talkforumserver.common.dto.UpdateInviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 邀请码数据访问层接口
 * 定义了邀请码相关的数据库操作，包括增删改查等基本操作
 */
@Mapper
public interface InviteCodeMapper {
    /**
     * 插入新的邀请码记录
     * @param inviteCode 邀请码对象
     * @return 成功插入的记录数
     */
    int insert(InviteCode inviteCode);
    
    /**
     * 根据邀请码字符串查询邀请码信息
     * @param code 邀请码字符串
     * @return 邀请码对象，如果不存在则返回null
     */
    InviteCode selectByCode(String code);
    
    /**
     * 根据创建者ID查询邀请码列表
     * @param creatorId 创建者ID
     * @return 邀请码列表
     */
    List<InviteCode> selectByCreatorId(Long creatorId);

    /**
     * 检查邀请码是否有效
     * 验证邀请码是否存在、未过期且未超过使用次数
     * @param code 邀请码字符串
     * @return 有效记录数，大于0表示有效
     */
    int checkInviteCodeValid(String code);
    
    /**
     * 增加邀请码使用次数
     * @param code 邀请码字符串
     * @return 成功更新的记录数
     */
    int updateUsedCount(String code);
    
    /**
     * 删除单个邀请码
     * @param code 邀请码字符串
     * @return 成功删除的记录数
     */
    int deleteByCode(String code);
    
    /**
     * 批量删除邀请码
     * @param codes 邀请码字符串列表
     * @return 成功删除的记录数
     */
    int deleteByCodes(List<String> codes);


    /**
     * 管理员分页查询所有邀请码
     * @param page 页码
     * @param pageSize 每页大小
     * @return 邀请码列表
     */
    List<InviteCode> adminGetInviteCodes(int page, int pageSize);

    /**
     * 统计邀请码总数
     * @return 邀请码总数
     */
    long countInviteCodes();

    int updateInviteCodes(UpdateInviteCodeDTO updateInviteCodeDTO);
}
