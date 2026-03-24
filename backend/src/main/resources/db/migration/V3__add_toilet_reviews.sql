-- 화장실 리뷰 시스템 스키마 추가 (V3)

-- 1. 화장실 리뷰 테이블 생성
CREATE TABLE toilet_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    toilet_id BIGINT NOT NULL,
    rating INT NOT NULL COMMENT '1-5 별점',
    emoji_tags TEXT COMMENT '이모지 태그 (쉼표 구분)',
    comment TEXT COMMENT '리뷰 내용',
    helpful_count INT DEFAULT 0 COMMENT '도움됨 클릭 수',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_toilet FOREIGN KEY (toilet_id) REFERENCES toilets (id) ON DELETE CASCADE
);

-- 2. 화장실 테이블에 통계 및 AI 요약 컬럼 추가
ALTER TABLE toilets ADD COLUMN avg_rating DOUBLE DEFAULT 0.0;
ALTER TABLE toilets ADD COLUMN review_count INT DEFAULT 0;
ALTER TABLE toilets ADD COLUMN ai_summary TEXT;

-- 3. 검색 성능 향상을 위한 인덱스 추가
CREATE INDEX idx_reviews_toilet_created ON toilet_reviews (toilet_id, created_at DESC);
CREATE INDEX idx_reviews_user ON toilet_reviews (user_id);
