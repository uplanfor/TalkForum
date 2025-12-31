package com.talkforum.talkforumserver.service.impl;

import com.talkforum.talkforumserver.common.dto.DeleteInviteCodesDTO;
import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.dto.UpdateInviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.common.vo.PageVO;
import com.talkforum.talkforumserver.mapper.InviteCodeMapper;
import com.talkforum.talkforumserver.service.InviteCodeService;
import com.talkforum.talkforumserver.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 邀请码服务实现类
 * 提供邀请码的生成、验证、使用、管理等功能的具体实现
 */
@Component
public class InviteCodeServiceImpl implements InviteCodeService {
    // 生成邀请码使用的字符集
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // 邀请码长度
    private static final int CODE_LENGTH = 12;

    @Autowired
    InviteCodeMapper inviteCodeMapper;
    @Autowired
    private UserMapper userMapper;

    /**
     * 获取用户的邀请码列表
     * 如果用户没有邀请码，则自动生成一个默认邀请码
     * @param userId 用户ID
     * @return 邀请码列表
     */
    @Override
    public List<InviteCode> getInviteCodes(Long userId) {
        List<InviteCode> inviteCodes = inviteCodeMapper.selectByCreatorId(userId);
        if (inviteCodes == null || inviteCodes.isEmpty()) {
            inviteCodes = generateInviteCodes(userId, new InviteCodeDTO(1, 21, 1));
        }
        return inviteCodes;
    }

    /**
     * 生成指定数量的邀请码
     * 限制最多生成10个邀请码，避免滥用
     * @param userId 创建者ID
     * @param inviteCodeDTO 邀请码生成参数，包含数量、有效期和最大使用次数
     * @return 生成的邀请码列表
     */
    @Override
    public List<InviteCode> generateInviteCodes(Long userId, InviteCodeDTO inviteCodeDTO) {
        List<InviteCode> inviteCodes = new ArrayList<>();
        if (inviteCodeDTO.getCount() > 10) {
            inviteCodeDTO.setCount(10);
        }

        for (int i = 0; i < inviteCodeDTO.getCount(); i++) {
            InviteCode code = new InviteCode();
            code.code = (generateUniqueCode());
            code.creatorId = (userId);
            code.createdAt = (new Date());
            code.expiredAt = (new Date(System.currentTimeMillis() + inviteCodeDTO.getExpiredDays() * 24 * 60 * 60 * 1000));
            code.maxCount = (inviteCodeDTO.getMaxCount());
            code.usedCount = (0);

            inviteCodeMapper.insert(code);
            inviteCodes.add(code);
        }
        return inviteCodes;
    }

    /**
     * 分页获取所有邀请码（管理员功能）
     * @param page 页码
     * @param pageSize 每页大小
     * @return 包含邀请码列表和总数的分页对象
     */
    @Override
    public PageVO<InviteCode> adminGetInviteCodes(int page, int pageSize) {
        List<InviteCode> data = inviteCodeMapper.adminGetInviteCodes(page, pageSize);
        return new PageVO<>(data, inviteCodeMapper.countInviteCodes());
    }

    /**
     * 更新邀请码信息
     * 可以更新最大使用次数和有效期
     * @param updateInviteCodeDTO 更新参数，包含邀请码和要更新的字段
     * @return 成功更新的记录数
     */
    @Override
    public int updateInviteCodes(UpdateInviteCodeDTO updateInviteCodeDTO) {
        if (updateInviteCodeDTO == null) {
            return 0;
        }
        List<String> inviteCodes = updateInviteCodeDTO.getCodes();
        if (inviteCodes == null || inviteCodes.isEmpty()) {
            return 0;
        }
        if(updateInviteCodeDTO.getMaxCount() >= 0) {
            updateInviteCodeDTO.setExpiredAt(new Date(System.currentTimeMillis() + updateInviteCodeDTO.getExpiredDays() * 24 * 60 * 60 * 1000));
            return inviteCodeMapper.updateInviteCodes(updateInviteCodeDTO);
        }
        return 0;
    }

    /**
     * 验证邀请码是否有效
     * 检查邀请码是否存在、未过期且未超过使用次数
     * @param code 邀请码字符串
     * @return 邀请码是否有效
     */
    public boolean validateInviteCode(String code) {
        InviteCode inviteCode = inviteCodeMapper.selectByCode(code);
        return inviteCode != null &&
                inviteCode.getUsedCount() < inviteCode.getMaxCount() &&
                inviteCode.getExpiredAt().after(new Date());
    }

    /**
     * 批量删除邀请码
     * @param deleteInviteCodesDTO 包含要删除的邀请码列表
     * @return 是否全部删除成功
     */
    @Override
    public int deleteInviteCodes(DeleteInviteCodesDTO deleteInviteCodesDTO) {
        if (deleteInviteCodesDTO.getCodes() == null || deleteInviteCodesDTO.getCodes().isEmpty()) {
            return 0;
        }
        return inviteCodeMapper.deleteByCodes(deleteInviteCodesDTO.getCodes());
    }

    /**
     * 使用邀请码
     * 验证邀请码有效性并增加使用次数
     * @param code 邀请码字符串
     * @return 是否使用成功
     */
    public boolean useInviteCode(String code) {
        if (!validateInviteCode(code)) {
            return false;
        }
        inviteCodeMapper.updateUsedCount(code);
        return true;
    }

    /**
     * 根据邀请码字符串获取邀请码信息
     * @param code 邀请码字符串
     * @return 邀请码对象
     */
    public InviteCode getInviteCode(String code) {
        return inviteCodeMapper.selectByCode(code);
    }

    /**
     * 删除单个邀请码
     * @param code 邀请码字符串
     * @return 是否删除成功
     */
    public boolean deleteInviteCode(String code) {
        return inviteCodeMapper.deleteByCode(code) > 0;
    }

    /**
     * 生成唯一的邀请码
     * 确保生成的邀请码在数据库中不存在
     * @return 唯一的邀请码字符串
     */
    private String generateUniqueCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (inviteCodeMapper.selectByCode(code) != null);
        return code;
    }

    /**
     * 生成随机邀请码
     * 使用预定义的字符集生成指定长度的随机字符串
     * @return 随机邀请码字符串
     */
    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
