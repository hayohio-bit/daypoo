package com.daypoo.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;

@Builder
public record PooRecordCreateRequest(
    @NotNull(message = "화장실 정보는 필수입니다.") Long toiletId,
    Integer bristolScale,
    String color,
    List<String> conditionTags,
    List<String> dietTags,
    @NotNull(message = "위도는 필수입니다.") double latitude,
    @NotNull(message = "경도는 필수입니다.") double longitude,
    String imageBase64 // AI 분석용 (Optional)
    ) {}
