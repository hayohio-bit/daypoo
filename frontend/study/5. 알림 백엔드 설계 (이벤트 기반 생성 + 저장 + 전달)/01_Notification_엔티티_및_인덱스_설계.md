# 섹션 1: Notification 엔티티 및 인덱스 설계

이 스터디 자료는 DayPoo 알림 시스템의 JPA 엔티티 설계와 대규모 트래픽 대비 인덱스 전략을 다룹니다.

## 1. 실제 구현된 엔티티 클래스 분석

현재 `backend/src/main/java/com/daypoo/api/entity/Notification.java` 파일에 작성된 엔티티 코드입니다. BaseTimeEntity를 상속받아 생성 및 수정 시간을 자동으로 관리하며, 알림의 '내용(`content`)'과 '클릭 이동경로(`redirectUrl`)'를 포함합니다.

```java
package com.daypoo.api.entity;

import com.daypoo.api.entity.enums.NotificationType;
import com.daypoo.api.global.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 알림 수신자 (지연 로딩 적용)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private NotificationType type;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "redirect_url")
  private String redirectUrl; // 클릭 시 이동할 페이지 경로

  @Column(name = "is_read", nullable = false)
  private boolean isRead = false;

  @Builder
  public Notification(
      User user, NotificationType type, String title, String content, String redirectUrl) {
    this.user = user;
    this.type = type;
    this.title = title;
    this.content = content;
    this.redirectUrl = redirectUrl;
    this.isRead = false; // 초기값 명시적 세팅
  }

  // 데이터의 무결성을 지키기 위해 setter 대신 비즈니스 메서드 사용
  public void markAsRead() {
    this.isRead = true;
  }
}
```

## 2. [추가 스터디 제안] 인덱스 및 데이터 보존 설계

현재 JPA 어노테이션 상에는 명시되어 있지 않지만, RDBMS 단에서 반드시 적용해야 할 인덱싱 전략 및 확장 기능입니다.

### 복합 인덱스 (Composite Index)
유저가 앱에 진입할 때 가장 먼저 호출되는 "내 알림 개수" 및 "내 알림 목록" API의 병목을 없애기 위해 `@Table` 레벨에 인덱스를 선언하는 것이 좋습니다.
- **index_user_read:** `CREATE INDEX idx_user_read ON notifications(user_id, is_read);`
- **index_user_created:** `CREATE INDEX idx_user_created ON notifications(user_id, created_at DESC);`

```java
// 개선 제안: @Table 속성에 적용
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_read", columnList = "user_id, is_read"),
    @Index(name = "idx_user_created", columnList = "user_id, created_at DESC")
})
```

---

> [!TIP] 알림 설계 핵심
> **소프트 삭제 vs 하드 삭제** <br>
> 알림은 시간이 지남에 따라 무한히 쌓이는 "로그형 트랜잭션 데이터"입니다. is_deleted 등을 두는 소프트 삭제(Soft Delete)는 디스크 용량과 쿼리 성능(index)을 악화시키므로, DayPoo 알림 도메인에서는 영구 딜리트(Hard Delete)를 채택하는 것이 가장 이상적입니다.

> [!WARNING] 성능 고려 사항
> **보존 기간 (TTL 스케줄링)** <br>
> 수백만 회원의 알림 정보가 적재되면 DB가 비대해집니다. 별도의 `@Scheduled`를 통해 생성된 지 30일이 지난 알림 데이터를 새벽(Off-Peak) 시간에 주기적으로 물리 식별/삭제(배치 처리)하여 DB 사용량을 최적화해야 합니다.
