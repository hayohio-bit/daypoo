package com.daypoo.api.service;

import com.daypoo.api.dto.*;
import com.daypoo.api.entity.*;
import com.daypoo.api.entity.enums.InquiryStatus;
import com.daypoo.api.entity.enums.ItemType;
import com.daypoo.api.entity.enums.Role;
import com.daypoo.api.global.exception.BusinessException;
import com.daypoo.api.global.exception.ErrorCode;
import com.daypoo.api.repository.*;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminManagementService {

  private final UserRepository userRepository;
  private final ToiletRepository toiletRepository;
  private final InquiryRepository inquiryRepository;
  private final ItemRepository itemRepository;
  private final InventoryRepository inventoryRepository;
  private final PaymentRepository paymentRepository;

  // --- 유저 관리 ---

  @Transactional(readOnly = true)
  public Page<AdminUserListResponse> getUsers(String search, Role role, Pageable pageable) {
    Specification<User> spec =
        (root, query, cb) -> {
          List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
          if (search != null && !search.isBlank()) {
            predicates.add(
                cb.or(
                    cb.like(root.get("email"), "%" + search + "%"),
                    cb.like(root.get("nickname"), "%" + search + "%")));
          }
          if (role != null) {
            predicates.add(cb.equal(root.get("role"), role));
          }
          return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

    return userRepository
        .findAll(spec, pageable)
        .map(
            user ->
                AdminUserListResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .role(user.getRole())
                    .level(user.getLevel())
                    .points(user.getPoints())
                    .recordCount(user.getRecords().size())
                    .createdAt(user.getCreatedAt())
                    .build());
  }

  @Transactional(readOnly = true)
  public AdminUserDetailResponse getUserDetail(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_USER_NOT_FOUND));

    long paymentCount = paymentRepository.countByUserId(userId);
    Long totalAmount = paymentRepository.sumAmountByUserId(userId);

    return AdminUserDetailResponse.builder()
        .id(user.getId())
        .email(user.getEmail())
        .nickname(user.getNickname())
        .role(user.getRole())
        .level(user.getLevel())
        .exp(user.getExp())
        .points(user.getPoints())
        .recordCount(user.getRecords().size())
        .paymentCount(paymentCount)
        .totalPaymentAmount(totalAmount != null ? totalAmount : 0L)
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }

  @Transactional
  public void updateUserRole(Long userId, Role role, String currentAdminEmail) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_USER_NOT_FOUND));

    if (user.getEmail().equals(currentAdminEmail)) {
      throw new BusinessException(ErrorCode.ADMIN_CANNOT_CHANGE_OWN_ROLE);
    }

    user.updateRole(role);
  }

  // --- 화장실 관리 ---

  @Transactional(readOnly = true)
  public Page<AdminToiletListResponse> getToilets(String search, Pageable pageable) {
    Page<Toilet> toilets;
    if (search != null && !search.isBlank()) {
      toilets = toiletRepository.findByNameContainingOrAddressContaining(search, search, pageable);
    } else {
      toilets = toiletRepository.findAll(pageable);
    }

    return toilets.map(
        t ->
            AdminToiletListResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .mngNo(t.getMngNo())
                .address(t.getAddress())
                .openHours(t.getOpenHours())
                .is24h(t.is24h())
                .isUnisex(t.isUnisex())
                .latitude(t.getLocation() != null ? t.getLocation().getY() : 0)
                .longitude(t.getLocation() != null ? t.getLocation().getX() : 0)
                .createdAt(t.getCreatedAt())
                .build());
  }

  @Transactional
  public void updateToilet(Long toiletId, AdminToiletUpdateRequest request) {
    Toilet toilet =
        toiletRepository
            .findById(toiletId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_TOILET_NOT_FOUND));

    toilet.update(
        request.name(),
        request.address(),
        request.openHours(),
        request.is24h(),
        request.isUnisex());
  }

  // --- 문의 관리 ---

  @Transactional(readOnly = true)
  public Page<AdminInquiryListResponse> getInquiries(InquiryStatus status, Pageable pageable) {
    Page<Inquiry> inquiries;
    if (status != null) {
      inquiries = inquiryRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);
    } else {
      inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    return inquiries.map(
        i ->
            AdminInquiryListResponse.builder()
                .id(i.getId())
                .userName(i.getUser().getNickname())
                .userEmail(i.getUser().getEmail())
                .type(i.getType().getLabel())
                .title(i.getTitle())
                .status(i.getStatus())
                .createdAt(i.getCreatedAt())
                .build());
  }

  @Transactional(readOnly = true)
  public AdminInquiryDetailResponse getInquiryDetail(Long inquiryId) {
    Inquiry inquiry =
        inquiryRepository
            .findById(inquiryId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_INQUIRY_NOT_FOUND));

    return AdminInquiryDetailResponse.builder()
        .id(inquiry.getId())
        .userName(inquiry.getUser().getNickname())
        .userEmail(inquiry.getUser().getEmail())
        .type(inquiry.getType().getLabel())
        .title(inquiry.getTitle())
        .content(inquiry.getContent())
        .answer(inquiry.getAnswer())
        .status(inquiry.getStatus())
        .createdAt(inquiry.getCreatedAt())
        .updatedAt(inquiry.getUpdatedAt())
        .build();
  }

  @Transactional
  public void answerInquiry(Long inquiryId, AdminInquiryAnswerRequest request) {
    Inquiry inquiry =
        inquiryRepository
            .findById(inquiryId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_INQUIRY_NOT_FOUND));

    if (inquiry.getStatus() == InquiryStatus.COMPLETED) {
      throw new BusinessException(ErrorCode.ADMIN_INQUIRY_ALREADY_ANSWERED);
    }

    inquiry.answer(request.answer());
  }

  // --- 상점 아이템 관리 ---

  @Transactional(readOnly = true)
  public Page<ItemResponse> getItems(ItemType type, Pageable pageable) {
    Page<Item> items;
    if (type != null) {
      items = itemRepository.findAllByType(type, pageable);
    } else {
      items = itemRepository.findAll(pageable);
    }

    return items.map(
        item ->
            ItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .type(item.getType())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .build());
  }

  @Transactional
  public ItemResponse createItem(AdminItemCreateRequest request) {
    Item item =
        Item.builder()
            .name(request.name())
            .description(request.description())
            .type(request.type())
            .price(request.price())
            .imageUrl(request.imageUrl())
            .build();

    Item saved = itemRepository.save(item);
    return ItemResponse.builder()
        .id(saved.getId())
        .name(saved.getName())
        .description(saved.getDescription())
        .type(saved.getType())
        .price(saved.getPrice())
        .imageUrl(saved.getImageUrl())
        .build();
  }

  @Transactional
  public ItemResponse updateItem(Long itemId, AdminItemUpdateRequest request) {
    Item item =
        itemRepository
            .findById(itemId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_ITEM_NOT_FOUND));

    item.update(
        request.name(), request.description(), request.type(), request.price(), request.imageUrl());

    return ItemResponse.builder()
        .id(item.getId())
        .name(item.getName())
        .description(item.getDescription())
        .type(item.getType())
        .price(item.getPrice())
        .imageUrl(item.getImageUrl())
        .build();
  }

  @Transactional
  public void deleteItem(Long itemId) {
    if (!itemRepository.existsById(itemId)) {
      throw new BusinessException(ErrorCode.ADMIN_ITEM_NOT_FOUND);
    }

    if (inventoryRepository.existsByItemId(itemId)) {
      throw new BusinessException(ErrorCode.ADMIN_ITEM_IN_USE);
    }

    itemRepository.deleteById(itemId);
  }
}
