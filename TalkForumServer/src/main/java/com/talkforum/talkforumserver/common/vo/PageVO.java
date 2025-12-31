package com.talkforum.talkforumserver.common.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(
        name = "PageVO",
        description = "分页数据"
)
public class PageVO<T> {
    @Schema(
            description = "分页后的数据列表"
    )
    private List<T> data;
    @Schema(
            description = "数据总数"
    )
    private Long total;


    public PageVO() {}
    public PageVO(List<T> data, Long total) {
        this.data = data;
        this.total = total;
    }
}
