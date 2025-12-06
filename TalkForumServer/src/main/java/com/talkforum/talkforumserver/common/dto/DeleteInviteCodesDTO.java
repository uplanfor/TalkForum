package com.talkforum.talkforumserver.common.dto;

import com.sun.istack.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class DeleteInviteCodesDTO {
    @NotNull
    private List<String> codes;
}