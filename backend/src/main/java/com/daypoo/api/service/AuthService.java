package com.daypoo.api.service;

import com.daypoo.api.dto.LoginRequest;
import com.daypoo.api.dto.SignUpRequest;
import com.daypoo.api.dto.TokenResponse;
import com.daypoo.api.dto.UserResponse;
import com.daypoo.api.entity.User;
import com.daypoo.api.global.exception.BusinessException;
import com.daypoo.api.global.exception.ErrorCode;
import com.daypoo.api.repository.UserRepository;
import com.daypoo.api.security.JwtProvider;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtProvider jwtProvider;
  private final EmailService emailService;

  @Transactional(readOnly = true)
  public UserResponse getCurrentUserInfo() {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    return UserResponse.from(user);
  }

  @Transactional
  public void signUp(SignUpRequest request) {
    checkUsernameDuplicate(request.username());
    checkNicknameDuplicate(request.nickname());

    User user =
        User.builder()
            .username(request.username())
            .password(passwordEncoder.encode(request.password()))
            .nickname(request.nickname())
            .role(User.Role.ROLE_USER)
            .build();

    userRepository.save(user);
  }

  public void checkUsernameDuplicate(String username) {
    if (userRepository.existsByUsername(username)) {
      throw new BusinessException(ErrorCode.USERNAME_ALREADY_EXISTS);
    }
  }

  public void checkNicknameDuplicate(String nickname) {
    if (userRepository.existsByNickname(nickname)) {
      throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
    }
  }

  @Transactional
  public TokenResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByUsername(request.username())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    if (!passwordEncoder.matches(request.password(), user.getPassword())) {
      throw new BusinessException(ErrorCode.INVALID_PASSWORD);
    }

    String accessToken = jwtProvider.createAccessToken(user.getUsername(), user.getRole().name());
    String refreshToken = jwtProvider.createRefreshToken(user.getUsername());

    return TokenResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
  }

  @Transactional
  public void resetPassword(String username) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    // 1. 임시 비밀번호 생성 (8자리)
    String tempPassword = UUID.randomUUID().toString().substring(0, 8);

    // 2. 사용자 비밀번호 업데이트
    user.updatePassword(passwordEncoder.encode(tempPassword));

    // 3. 이메일 발송
    String subject = "[대똥여지도] 임시 비밀번호 안내";
    String text =
        String.format(
            "안녕하세요, 대똥여지도(DayPoo)입니다.\n\n"
                + "요청하신 임시 비밀번호를 안내해 드립니다.\n"
                + "임시 비밀번호: %s\n\n"
                + "로그인 후 반드시 비밀번호를 변경해 주세요.",
            tempPassword);

    emailService.sendEmail(user.getUsername(), subject, text);
  }
}
