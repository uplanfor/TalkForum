package com.talkforum.talkforumserver.common.vo;

import lombok.Data;

import java.util.List;

@Data
public class PageVO<T> {
    private List<T> data;
    private Long total;
    public PageVO() {}
    public PageVO(List<T> data, Long total) {
        this.data = data;
        this.total = total;
    }
}
