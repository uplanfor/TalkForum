package com.talkforum.talkforumserver.report;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/reports")
@RestController
public class ReportController {
    @Autowired
    ReportService reportService;
}
