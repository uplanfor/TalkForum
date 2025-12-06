package com.talkforum.talkforumserver.invitecode;

import com.talkforum.talkforumserver.common.dto.DeleteInviteCodesDTO;
import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.dto.UpdateInviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.common.vo.PageVO;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

/**
 * 邀请码服务接口
 * 定义了邀请码相关的所有业务操作，包括获取、生成、验证、使用、删除等功能
 */
public interface InviteCodeService {

    /**
     * 获取用户的邀请码列表
     * @param userId 用户ID
     * @return 邀请码列表，如果用户没有邀请码则自动生成一组默认邀请码
     */
    List<InviteCode> getInviteCodes(Long userId);

    /**
     * 生成邀请码
     * @param userId 创建者用户ID
     * @param inviteCodeDTO 邀请码生成参数，包含数量、过期时间和最大使用次数
     * @return 生成的邀请码列表
     */
    List<InviteCode> generateInviteCodes(Long userId, InviteCodeDTO inviteCodeDTO);

    /**
     * 验证邀请码是否有效
     * @param code 邀请码字符串
     * @return 验证结果，true表示有效，false表示无效
     */
    boolean validateInviteCode(String code);

    /**
     * 使用邀请码
     * 验证邀请码有效性并增加使用次数
     * @param code 邀请码字符串
     * @return 使用结果，true表示使用成功，false表示使用失败
     */
    boolean useInviteCode(String code);

    /**
     * 获取邀请码详细信息
     * @param code 邀请码字符串
     * @return 邀请码对象，如果不存在则返回null
     */
    InviteCode getInviteCode(String code);

    /**
     * 删除单个邀请码
     * @param code 邀请码字符串
     * @return 删除结果，true表示删除成功，false表示删除失败
     */
    boolean deleteInviteCode(String code);

    /**
     * 管理员获取所有邀请码列表（分页）
     * @param page 页码
     * @param pageSize 每页大小
     * @return 分页的邀请码列表
     */
    PageVO<InviteCode> adminGetInviteCodes(int page, int pageSize);
    
    /**
     * 更新邀请码信息
     * @param updateInviteCodeDTO 更新参数，包含邀请码、新的最大使用次数和过期时间
     * @return 成功更新的记录数，0表示更新失败
     */
    int updateInviteCodes(UpdateInviteCodeDTO updateInviteCodeDTO);
    
    /**
     * 批量删除邀请码
     * @param deleteInviteCodesDTO 删除参数，包含要删除的邀请码列表
     * @return 删除数量
     */
    int deleteInviteCodes(DeleteInviteCodesDTO deleteInviteCodesDTO);
}
