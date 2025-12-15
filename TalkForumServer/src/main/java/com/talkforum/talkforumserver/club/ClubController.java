package com.talkforum.talkforumserver.club;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.ClubProfileDTO;
import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.common.util.I18n;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clubs")
public class ClubController {
    @Autowired
    private ClubService clubService;

    @GetMapping("/")
    public Result getClubList(int page, int count) {
        return Result.success(I18n.t("club.list.success"), clubService.getClubList(page, count));
    }

    @GetMapping("/{clubId}")
    public Result getClubById(@PathVariable long clubId) {
        return Result.success(I18n.t("club.get.success"), clubService.getClubById(clubId));
    }

    @LoginRequired
    @PostMapping("/{clubId}/members/")
    public Result inviteMember(@PathVariable long clubId, long userId) {
        clubService.inviteMember(clubId, userId);
        return Result.success(I18n.t("club.member.invite.success"));
    }

    @LoginRequired
    @DeleteMapping("/{clubId}/members/{userId}")
    public Result removeMember(@PathVariable long clubId, @PathVariable long userId) {
        clubService.removeMember(clubId, userId);
        return Result.success(I18n.t("club.member.remove.success"));
    }

    @LoginRequired
    @PutMapping("/{clubId}")
    public Result updateClub(@PathVariable long clubId, ClubProfileDTO clubProfileDTO) {
        clubService.updateClub(clubId, clubProfileDTO);
        return Result.success(I18n.t("club.update.success"));
    }

    @LoginRequired
    @DeleteMapping("/{clubId}")
    public Result deleteClub(@PathVariable long clubId) {
        clubService.deleteClub(clubId);
        return Result.success(I18n.t("club.delete.success"));
    }
}
