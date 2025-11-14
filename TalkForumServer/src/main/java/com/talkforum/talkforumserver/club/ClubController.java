package com.talkforum.talkforumserver.club;

import com.talkforum.talkforumserver.common.anno.LoginRequired;
import com.talkforum.talkforumserver.common.dto.ClubProfileDTO;
import com.talkforum.talkforumserver.common.result.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clubs")
public class ClubController {
    @Autowired
    private ClubService clubService;

    @GetMapping("/")
    public Result getClubList(int page, int count) {
        return Result.success(clubService.getClubList(page, count));
    }

    @GetMapping("/{clubId}")
    public Result getClubById(@PathVariable long clubId) {
        return Result.success(clubService.getClubById(clubId));
    }

    @LoginRequired
    @PostMapping("/{clubId}/members/")
    public Result inviteMember(@PathVariable long clubId, long userId) {
        clubService.inviteMember(clubId, userId);
        return Result.success();
    }

    @LoginRequired
    @DeleteMapping("/{clubId}/members/{userId}")
    public Result removeMember(@PathVariable long clubId, @PathVariable long userId) {
        clubService.removeMember(clubId, userId);
        return Result.success();
    }

    @LoginRequired
    @PutMapping("/{clubId}")
    public Result updateClub(@PathVariable long clubId, ClubProfileDTO clubProfileDTO) {
        clubService.updateClub(clubId, clubProfileDTO);
        return Result.success();
    }

    @LoginRequired
    @DeleteMapping("/{clubId}")
    public Result deleteClub(@PathVariable long clubId) {
        clubService.deleteClub(clubId);
        return Result.success();
    }
}
