import base64

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.analysis import PoopAnalysisResult
from app.services.vision_service import vision_service

router = APIRouter()


@router.post("/analyze", response_model=PoopAnalysisResult)
async def analyze_poop(image_file: UploadFile = File(...)):
    """
    배변 분석 API: 이미지를 직접(Multipart) 받아 AI 분석 결과를 반환합니다.
    (Byte Array 스트림 전송 - A안 반영)
    """
    try:
        # 파일 내용을 바이트로 읽음
        contents = await image_file.read()

        # vision_service가 내부적으로 base64를 기대할 수 있으므로
        # 일단 base64로 인코딩해서 전달 (기존 서비스 호환성 고려)
        img_base64 = base64.b64encode(contents).decode("utf-8")

        result = await vision_service.analyze_poop_image(img_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
