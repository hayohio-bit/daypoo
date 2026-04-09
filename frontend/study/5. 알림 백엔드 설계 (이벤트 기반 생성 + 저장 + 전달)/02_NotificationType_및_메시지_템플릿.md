# 섹션 2: NotificationType Enum과 메시지 템플릿

이 문서에서는 현재 프로젝트의 알림 카테고리 구성 체계를 리뷰하고, 향후 알림 생성 로직을 단순화하기 위한 "메시지 템플릿 로직" 제안을 다룹니다.

## 1. 실제 구현된 NotificationType Enum

DayPoo 시스템은 현재 알림 성격에 따라 가장 중요한 **5개의 카테고리**로 세분화하여 설계되어 있습니다. 이 방식은 클라이언트 측에서 카테고리에 맞춰 뱃지 색상을 바꾸거나, 아이콘을 다르게 노출할 때 매우 효과적입니다.

```java
package com.daypoo.api.entity.enums;

// 현재 구현된 Enum
public enum NotificationType {
  HEALTH,      // 건강/리포트 관련 (예: AI 변 분석 보고서 완료)
  SOCIAL,      // 랭킹/리액션 관련 (예: 동네 똥왕 등극)
  SYSTEM,      // 공지 관련 (예: 점검 안내)
  EMERGENCY,   // 관리자용 또는 급똥 지수 관련 긴급 알림
  ACHIEVEMENT  // 업적/칭호/연속기록 달성 관련
}
```

## 2. [확장 스터디 제안] 템플릿 치환 로직 도입

현재는 `Service` 계층에서 `String`을 직접 더해서 `title`과 `content`를 조립해야 합니다. 스터디 요구사항에서 제안하신 방식처럼 Enum 자체에 **제목/내용 템플릿 규칙**을 위임하면 비즈니스 로직(Service)의 결합도를 낮출 수 있습니다.

### 확장된 NotificationType (스터디 참고용)

```java
package com.daypoo.api.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Getter
@RequiredArgsConstructor
public enum NotificationType {

  // 기존 HEALTH 도메인 세분화
  HEALTH_REPORT("🔔 주간 리포트", "회원님의 주간 배변 리포트가 완성되었어요."),
  
  // 기존 SOCIAL(랭킹) 도메인 세분화 및 변수({..}) 활용
  RANKING_UP("🎉 순위 상승", "축하합니다! 순위가 {oldRank}위에서 {newRank}위로 상승했습니다!"),
  RANKING_DOWN("📉 순위 하락", "앗, 순위가 {newRank}위로 떨어졌어요. 분발하세요!"),
  
  // 기존 ACHIEVEMENT 도메인 세분화
  TITLE_EARNED("🏆 칭호 획득", "와우! '{titleName}' 칭호를 획득했습니다."),
  STREAK_ACHIEVED("🔥 연속 기록", "대단해요! {days}일 연속 기록 달성!");

  private final String titleTemplate;
  private final String messageTemplate;

  /**
   * 플레이스홀더({key})를 인자로 받은 Map 값으로 치환하는 팩토리 메서드
   */
  public String generateMessage(Map<String, String> args) {
      if (args == null || args.isEmpty()) {
          return this.messageTemplate;
      }
      
      String generated = this.messageTemplate;
      for (Map.Entry<String, String> entry : args.entrySet()) {
          generated = generated.replace("{" + entry.getKey() + "}", entry.getValue());
      }
      return generated;
  }
}
```

---

> [!TIP] 알림 설계 핵심
> **Enum 템플릿 위임 패턴 (Strategy)** <br>
> 서비스 로직에서 하드코딩된 스트링 덧셈(`"순위가 " + oldRank + "위에서..."`)을 남발하면 다국어 처리(i18n)가 불가능해지고 테스트가 힘들어집니다. 알림 도메인 내부(Enum)에서 메시지를 생성하여 내보내는 역할 위임(Responsibility Delegation)이 객체 지향적인 클린 아키텍처의 시작입니다.

> [!WARNING] 성능 고려 사항
> **메타데이터 파싱 (Metadata JSON)** <br>
> 앱 클라이언트에서 "터치 시 특정 화면의 특정 ID로 이동"하려면 파라미터가 필요합니다. `redirectUrl`로 하드코딩하지 않고, `metadata` (JSON 형식 `{"targetId": 152, "type": "RANK"}`) 문자열을 DB에 저장하면 앱 딥링크(App DeepLink) 라우팅 성능이 획기적으로 향상됩니다.
