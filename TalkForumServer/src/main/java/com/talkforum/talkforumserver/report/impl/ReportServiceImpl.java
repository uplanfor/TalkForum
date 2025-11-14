package com.talkforum.talkforumserver.report.impl;

import com.talkforum.talkforumserver.common.result.Result;
import com.talkforum.talkforumserver.report.ReportMapper;
import com.talkforum.talkforumserver.report.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(rollbackFor = Exception.class)
public class ReportServiceImpl implements ReportService {
    @Autowired
    private ReportMapper reportMapper;
}
