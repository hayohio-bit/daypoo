package com.daypoo.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminToiletUpdateRequest(
    @NotBlank(message = "이름은 필수 입력값입니다.") String name,
    String address,
    String openHours,
    boolean is24h,
    boolean isUnisex) {}
