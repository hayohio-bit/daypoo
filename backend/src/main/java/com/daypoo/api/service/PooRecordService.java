package com.daypoo.api.service;

import com.daypoo.api.dto.AiAnalysisResponse;
import com.daypoo.api.dto.PooRecordCreateRequest;
import com.daypoo.api.dto.PooRecordResponse;
import com.daypoo.api.entity.PooRecord;
import com.daypoo.api.entity.Toilet;
import com.daypoo.api.entity.User;
import com.daypoo.api.mapper.PooRecordMapper;
import com.daypoo.api.repository.PooRecordRepository;
import com.daypoo.api.repository.ToiletRepository;
import com.daypoo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PooRecordService {

  private final PooRecordRepository recordRepository;
  private final ToiletRepository toiletRepository;
  private final UserRepository userRepository;
  private final LocationVerificationService locationVerificationService;
  private final GeocodingService geocodingService;
  private final TitleAchievementService titleAchievementService;
  private final PooRecordMapper recordMapper;
  private final AiClient aiClient;

  private final RankingService rankingService;

  // 보상 설정
  private static final int REWARD_EXP = 10;
  private static final int REWARD_POINTS = 5;

  /** 화장실 도착 체크인 담당 */
  @Transactional
  public void checkIn(String username, Long toiletId, double lat, double lon) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

    // 위치 검증 (확대된 150m 반경 사용)
    boolean isNear = locationVerificationService.isWithinAllowedDistance(toiletId, lat, lon);
    if (!isNear) {
      throw new RuntimeException("화장실 반경 내에 있지 않습니다.");
    }

    // 도착 시간 기록
    locationVerificationService.recordArrivalTime(user.getId(), toiletId);
    log.info("User {} checked-in at toilet {}.", username, toiletId);
  }

  @Transactional
  public PooRecordResponse createRecord(String username, PooRecordCreateRequest request) {

    // 1. 엔티티 검증
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

    Toilet toilet =
        toiletRepository
            .findById(request.toiletId())
            .orElseThrow(() -> new RuntimeException("Toilet not found: " + request.toiletId()));

    // 2. 물리적 위치 반경 내(50m)에 있는지 공간 쿼리 검증
    boolean isNear =
        locationVerificationService.isWithinAllowedDistance(
            request.toiletId(), request.latitude(), request.longitude());

    if (!isNear) {
      throw new RuntimeException("화장실 반경(150m) 밖에서는 인증할 수 없습니다.");
    }

    // 2.2 체류 시간 검증 (A안: 최소 1분)
    boolean stayedEnough =
        locationVerificationService.hasStayedLongEnough(user.getId(), toilet.getId());
    if (!stayedEnough) {
      throw new RuntimeException("정확한 분석을 위해 최소 1분 이상 화장실에 머물러야 합니다.");
    }

    // 3. 레디스 Rate Limiter(어뷰징 체크)
    boolean allowed = locationVerificationService.checkAndSetCooldown(user.getId(), toilet.getId());
    if (!allowed) {
      throw new RuntimeException("이미 최근 코인/경험치를 획득한 화장실입니다.");
    }

    // 4. AI 분석 (이미지가 있을 경우)
    Integer finalBristolScale = request.bristolScale();
    String finalColor = request.color();

    if (request.imageBase64() != null && !request.imageBase64().isEmpty()) {
      AiAnalysisResponse aiResult = aiClient.analyzePoopImage(request.imageBase64());
      finalBristolScale = aiResult.bristolScale();
      finalColor = aiResult.color();
      log.info("AI Analysis result applied: Bristol {}, Color {}", finalBristolScale, finalColor);
    }

    // 5. 정확한 행정동 명칭 추출 (Reverse Geocoding)
    String regionName = geocodingService.reverseGeocode(request.latitude(), request.longitude());

    // 6. 기록 생성
    PooRecord record =
        PooRecord.builder()
            .user(user)
            .toilet(toilet)
            .bristolScale(finalBristolScale)
            .color(finalColor)
            .conditionTags(String.join(",", request.conditionTags()))
            .dietTags(String.join(",", request.dietTags()))
            .regionName(regionName)
            .build();

    PooRecord savedRecord = recordRepository.save(record);

    // 7. 유저 보상 체계(TX)
    user.addExpAndPoints(REWARD_EXP, REWARD_POINTS);
    userRepository.save(user); // 포인트 변경 사항 명시적 저장

    // 8. 실시간 랭킹 업데이트
    rankingService.updateGlobalRank(user);
    rankingService.updateRegionRank(user, regionName);

    // 9. 업적/칭호 달성 검사 (Epic 2)
    titleAchievementService.checkAndGrantTitles(user);

    log.info(
        "User {} earned {} EXP and {} Points for recording toilet {}. Global/Region rank updated.",
        username,
        REWARD_EXP,
        REWARD_POINTS,
        toilet.getId());

    // 8. Response 조합
    return PooRecordResponse.builder()
        .id(savedRecord.getId())
        .toiletId(toilet.getId())
        .toiletName(toilet.getName())
        .bristolScale(savedRecord.getBristolScale())
        .color(savedRecord.getColor())
        .conditionTags(request.conditionTags())
        .dietTags(request.dietTags())
        .createdAt(savedRecord.getCreatedAt())
        .build();
  }
}
