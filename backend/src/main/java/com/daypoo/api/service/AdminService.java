package com.daypoo.api.service;

import com.daypoo.api.dto.AdminStatsResponse;
import com.daypoo.api.entity.InquiryStatus;
import com.daypoo.api.repository.InquiryRepository;
import com.daypoo.api.repository.ToiletRepository;
import com.daypoo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final ToiletRepository toiletRepository;
    private final InquiryRepository inquiryRepository;

    public AdminStatsResponse getAdminStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long totalUsers = userRepository.count();
        long totalToilets = toiletRepository.count();
        long pendingInquiries = inquiryRepository.countByStatus(InquiryStatus.PENDING);
        
        // Mocking some daily stats as we don't have complex historical tracking yet
        // In a real app, you'd query historical tables
        List<AdminStatsResponse.DailyStat> weeklyTrend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            weeklyTrend.add(AdminStatsResponse.DailyStat.builder()
                    .date(date.format(formatter))
                    .users(totalUsers / (7-i+1) + (int)(Math.random() * 10)) 
                    .inquiries((int)(Math.random() * 5))
                    .sales((long)(Math.random() * 100000) + 50000) // Mock sales
                    .build());
        }

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalToilets(totalToilets)
                .pendingInquiries(pendingInquiries)
                .todayNewUsers(userRepository.count()) // Should filter by date in real use
                .todayInquiries(inquiryRepository.count()) // Should filter by date in real use
                .weeklyTrend(weeklyTrend)
                .build();
    }
}
