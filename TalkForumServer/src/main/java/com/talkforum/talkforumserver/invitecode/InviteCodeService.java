package com.talkforum.talkforumserver.invitecode;

import com.talkforum.talkforumserver.common.dto.InviteCodeDTO;
import com.talkforum.talkforumserver.common.entity.InviteCode;
import com.talkforum.talkforumserver.common.vo.PageVO;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public interface InviteCodeService {

    List<InviteCode> getInviteCodes(Long userId);

    List<InviteCode> generateInviteCodes(Long userId, InviteCodeDTO inviteCodeDTO);

    boolean validateInviteCode(String code);

    boolean useInviteCode(String code);

    InviteCode getInviteCode(String code);

    boolean deleteInviteCode(String code);

    PageVO<InviteCode> adminGetInviteCodes(int page, int pageSize);
}
