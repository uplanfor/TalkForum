package com.talkforum.talkforumserver.invitecode.impl;

import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.invitecode.InviteCodeMapper;
import com.talkforum.talkforumserver.invitecode.InviteCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class InviteCodeServiceImpl implements InviteCodeService {
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int CODE_LENGTH = 12;

    @Autowired
    InviteCodeMapper inviteCodeMapper;

    @Override
    public List<InviteCode> getInviteCodes(Long userId) {
        return inviteCodeMapper.selectByCreatorId(userId);
    }

    @Override
    public List<InviteCode> generateInviteCodes(Long userId, InviteCodeDTO inviteCodeDTO) {
        List<InviteCode> inviteCodes = new ArrayList<>();
        if (inviteCodeDTO.generateCount > 10) {
            inviteCodeDTO.generateCount = 10;
        }

        for (int i = 0; i < inviteCodeDTO.generateCount; i++) {
            InviteCode code = new InviteCode();
            code.code = (generateUniqueCode());
            code.creatorId = (userId);
            code.createdAt = (new Date());
            code.expiredAt = (new Date(System.currentTimeMillis() + inviteCodeDTO.expireDays * 24 * 60 * 60 * 1000));
            code.maxCount = (inviteCodeDTO.maxCount);
            code.usedCount = (0);

            inviteCodeMapper.insert(code);
            inviteCodes.add(code);
        }
        return inviteCodes;
    }

    @Override
    public boolean validateInviteCode(String code) {
        InviteCode inviteCode = inviteCodeMapper.selectByCode(code);
        return inviteCode != null && 
               inviteCode.getUsedCount() < inviteCode.getMaxCount() && 
               inviteCode.getExpiredAt().after(new Date());
    }

    @Override
    public boolean useInviteCode(String code) {
        if (!validateInviteCode(code)) {
            return false;
        }
        inviteCodeMapper.updateUsedCount(code);
        return true;
    }

    @Override
    public InviteCode getInviteCode(String code) {
        return inviteCodeMapper.selectByCode(code);
    }

    @Override
    public boolean deleteInviteCode(String code) {
        return inviteCodeMapper.deleteByCode(code) > 0;
    }


    private String generateUniqueCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (inviteCodeMapper.selectByCode(code) != null);
        return code;
    }

    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
