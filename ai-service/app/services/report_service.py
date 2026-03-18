from openai import OpenAI
from app.core.config import settings
from app.schemas.analysis import HealthReportRequest, HealthReportResponse
import loguru
import json

logger = loguru.logger

class ReportService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_health_report(self, request: HealthReportRequest) -> HealthReportResponse:
        """
        누적된 배변 데이터를 바탕으로 AI 건강 리포트 생성
        """
        logger.info(f"Generating health report for user {request.userId} ({request.reportType})...")
        
        # 기록 데이터를 텍스트로 변환하여 프롬프트 구성
        records_summary = "\n".join([
            f"- Data: {r.createdAt}, Bristol Scale: {r.bristolScale}, Color: {r.color}, Tags: {r.conditionTags}/{r.dietTags}"
            for r in request.records
        ])

        prompt = f"""
        당신은 소화기 건강 전문 AI 분석가입니다. 사용자의 최근 배변 기록을 분석하여 전문적인 건강 리포트를 작성해주세요.

        [분석 데이터 - 리포트 타입: {request.reportType}]
        {records_summary}

        분석 시 다음 사항을 고려하세요:
        1. 배변 형태(Bristol Scale)의 변화 추이
        2. 식단 태그와 배변 결과 사이의 상관관계 (예: 특정 음식 섭취 후 설사 여부)
        3. 전반적인 건강 점수 (0-100점)

        응답은 반드시 유효한 JSON 형태여야 하며, 다음 필드를 포함해야 합니다:
        - reportType: "{request.reportType}"
        - healthScore: 분석된 건강 점수 (정수)
        - summary: 현재 상태에 대한 2~3문장의 요약 (한국어)
        - solution: 건강 개선을 위한 구체적인 솔루션 (한국어)
        - insights: 데이터에서 발견된 주요 통계 및 인사이트 리스트 (한국어)
        - analyzedAt: 분석 완료 시각 (ISO 8601 형식)
        """

        try:
            response = self.client.beta.chat.completions.parse(
                model=settings.MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a professional medical health analyst who provides data-driven gastrointestinal health reports."},
                    {"role": "user", "content": prompt}
                ],
                response_format=HealthReportResponse,
            )

            result = response.choices[0].message.parsed
            logger.info("Health report generation complete.")
            return result

        except Exception as e:
            logger.error(f"Error during health report generation: {str(e)}")
            raise e

report_service = ReportService()
