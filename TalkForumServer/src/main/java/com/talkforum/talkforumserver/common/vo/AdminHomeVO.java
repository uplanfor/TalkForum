package com.talkforum.talkforumserver.common.vo;

import lombok.Data;

@Data
public class AdminHomeVO {
    private long totalUsers;
    private long totalPosts;
    private long totalReports;
    private long postsNotHandled;
    private long commentsNotHandled;
    private long reportsNotHandled;
}
