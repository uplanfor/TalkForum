package com.talkforum.talkforumserver.constant;

public class InteractionConstant {
    public static final int POST_DISLIKE = -1;
    public static final int POST_LIKE = 1;
    public static final int POST_NONE = 0;

    public static final int COMMENT_DISLIKE = -1;
    public static final int COMMENT_LIKE = 1;
    public static final int COMMENT_NONE = 0;

    public static final int USER_FOLLOWING = 1;
    public static final int USER_NO_FOLLOWING = 0;

    public static final String INTERACTION_TYPE_POST = "POST";
    public static final String INTERACTION_TYPE_COMMENT = "COMMENT";
    public static final String INTERACTION_TYPE_USER = "USER";
}
