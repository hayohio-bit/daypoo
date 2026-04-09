# 섹션 5: NotificationService 내부 비즈니스 로직 분석

이 문서는 DayPoo 백엔드 애플리케이션의 핵심인 알림 저장, 권한 검증 기능이 포함된 `NotificationService.java`의 실제 코드 로직을 깊이 있게 다룹니다.

## 1. 알림 도메인의 필수 비즈니스 로직 스캔

서버 자원(Memory, CPU) 관리가 제일 까다로운 SSE 커넥션 및 기본 알림 제어 코드가 위치한 서비스 계층입니다.

```java
// ... [가독성을 위해 SSE 처리 로직(subscribe, removeEmitter 등)은 제외하고 CRUD만 집중 리뷰합니다]

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;

  /**
   * 알림 생성 로직
   * @Transactional 속성을 통해 DB 저장이 무결하게 이뤄집니다.
   */
  @Transactional
  public void send(
      User user, NotificationType type, String title, String content, String redirectUrl) {
    Notification notification =
        Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .content(content)
            .redirectUrl(redirectUrl)
            .build();

    notificationRepository.save(notification);

    // [이후 섹션 6에서 깊이 다룰 Redis Pub/Sub을 통한 실시간 푸시 발송 파트]
    // ...
  }

  /**
   * 내 알림 전체 읽음 처리 (일괄 변경)
   */
  @Transactional
  public void markAllAsRead(User user) {
    // 영속성 컨텍스트를 활용한 더티 체킹(Dirty Checking) 방식 (추천)
    // 혹은 JPQL "UPDATE Notification n SET n.isRead = true WHERE n.user = :user" 방식 (대량 데이터 성능 우위)
    List<Notification> notifications = notificationRepository.findAllByUserAndIsReadFalse(user);
    notifications.forEach(Notification::markAsRead);
  }

  /**
   * 알림 개별 삭제 로직과 권한 검증(Authorization)
   */
  @Transactional
  public void deleteNotification(Long notificationId, User user) {
    Notification notification =
        notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    // [중요 보안 포인트] 본인의 알림만 삭제할 수 있도록 강제 ID 검사 수행 (IDOR 취약점 예방)
    if (!notification.getUser().getId().equals(user.getId())) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    notificationRepository.delete(notification);
  }
}
```

## 2. 권한 검증 메커니즘 (IDOR 공격 대비)

위스니펫에서 구현된 개별 삭제(`deleteNotification`) 메서드는 보안 관점에서 매우 훌륭합니다.

만약 악의적인 사용자가 자신의 토큰을 인증한 후 엔드포인트 파라미터만 변조하여 `DELETE /api/v1/notifications/999` (다른 사람의 알림 ID) 주소로 스크립트 공격을 가할 수 있습니다. 이를 예방하기 위해 알림 엔티티 내에 박힌 `User.ID`와 파라미터 세션에서 인증받은 `User.ID`를 깊숙이 교차 검증하는 로직(`!notification.getUser().getId().equals(user.getId())`)은 보안 핵심 사례입니다.

---

> [!TIP] 알림 설계 핵심
> **대량의 일괄 업데이트 (Bulk Update) 적용 고민** <br>
> 현재 `markAllAsRead`는 읽지 않은 알림 전체 리스트를 `SELECT`해서 `List<Notification>`의 루프를 돌며 더티 체킹을 유도하고 있습니다. 이는 트래픽이 적을 땐 우아한 객체지향 코드이나 유저당 알림이 수십 개만 넘어도 하나하나 쿼리가 나가는 병목 현상을 야기합니다. 실무에서는 명시적인 **@Query("UPDATE Notification") 벌크 연산**을 통해 단 건의 DB 커넥션으로 업데이트를 끝내는 방식으로 튜닝하는 것이 권장됩니다.
