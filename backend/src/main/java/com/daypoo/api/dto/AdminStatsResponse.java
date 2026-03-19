package com.daypoo.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalToilets;
    private long pendingInquiries;
    private long todayNewUsers;
    private long todayInquiries;
    private List<DailyStat> weeklyTrend;

    @Getter
    @Builder
    public static class DailyStat {
        private String date;
        private long users;
        private long inquiries;
        private long sales;
    }
}
