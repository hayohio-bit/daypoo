package com.daypoo.api.service;

import com.daypoo.api.entity.Title;
import com.daypoo.api.entity.User;
import com.daypoo.api.entity.UserTitle;
import com.daypoo.api.repository.PooRecordRepository;
import com.daypoo.api.repository.TitleRepository;
import com.daypoo.api.repository.UserTitleRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TitleAchievementService {

  private final PooRecordRepository recordRepository;
  private final TitleRepository titleRepository;
  private final UserTitleRepository userTitleRepository;

  /** 유저의 업적 달성 여부를 검사하고 칭호를 부여함 */
  @Transactional
  public void checkAndGrantTitles(User user) {
    List<Title> allTitles = titleRepository.findAll();

    for (Title title : allTitles) {
      if (userTitleRepository.existsByUserAndTitle(user, title)) {
        continue;
      }

      boolean achieved = checkAchievement(user, title);
      if (achieved) {
        grantTitle(user, title);
      }
    }
  }

  private boolean checkAchievement(User user, Title title) {
    long count;
    switch (title.getAchievementType()) {
      case "TOTAL_RECORDS":
        count = recordRepository.countByUser(user);
        return count >= title.getAchievementThreshold();

      case "UNIQUE_TOILETS":
        // 로직 생략 (필요시 구현)
        return false;

      default:
        return false;
    }
  }

  private void grantTitle(User user, Title title) {
    UserTitle userTitle = UserTitle.builder().user(user).title(title).build();
    userTitleRepository.save(userTitle);
    log.info("New title granted to user {}: {}", user.getUsername(), title.getName());
    // TODO: 알림 발송 (Push/In-app)
  }
}
