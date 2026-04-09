# 섹션 4: 관리자 CRUD 모달 기능과 유효성 검증

**[정합성 검증 완료 사항]**
> `package.json` 검사 결과 `Zod`와 `zod-validation-error` 라이브러리는 **현재 프론트엔드 프로젝트에 설치되어 있지 않습니다.**
> 현재의 폼 유효성 검사는 수동 if문 상태(`!title || !price_` 등)로 관리되고 있으나, 이를 대체할 Zod 도입 방법을 제안하며, 팝업 애니메이션은 `framer-motion`의 `AnimatePresence`를 통해 매우 유려하게 다뤄지고 있음을 검증했습니다.

## 1. 현재의 Framer Motion 모달 패턴 (팝업 & 다이얼로그)

DayPoo 시스템 상 항목을 제거하거나, 역할을 수정할 때 화면 중앙에 뜨는 다이얼로그들은 Framer Motion의 `backdrop`과 `scale/opacity` 방식을 이용해 Apple 스타일로 유려하게 작성되었습니다.

```tsx
// AdminPage.tsx - 사용자 삭제 확인 다이얼로그(Delete Confirm) 일부 파편
<AnimatePresence>
  {showDeleteModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full mx-auto outline-none overflow-hidden"
      >
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 ...">
                <Trash2 size={32} />
            </div>
            <h3 className="mt-6 text-xl font-black">정말 삭제하시겠습니까?</h3>
            {/* Optimistic Delete 패턴 사용 중 */}
            <div className="flex gap-3 w-full mt-8">
               <button onClick={() => setShowDeleteModal(false)}>취소</button>
               <button onClick={handleDeleteExecute}>삭제하기</button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```
이 방식은 DOM에서 아예 노드를 언마운트 시키기 때문에 안전하며, 퇴장(`exit`) 애니메이션까지 보장합니다.

## 2. [도입 제언] Zod 폼 유효성 심화 적용

아이템 및 칭호를 생성하는 `AdminItemCreateRequest` 등 복잡한 페이로드를 조립할 때, 현재는 `<input onChange={e => setFormData(...)} />` 로만 처리되어 무결성을 100% 검증하기 힘듭니다.
터미널에서 `npm install zod @hookform/resolvers react-hook-form` 설치 후 적용해야 합니다.

```tsx
// [Zod 스키마 정의 예시] ItemCreateModal.tsx 하위에서 사용
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const itemSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
  price: z.number().min(0, "가격은 0 이하여선 안됩니다."),
  type: z.enum(["AVATAR", "THEME"]),
  imageUrl: z.string().url("올바른 이미지 URL이 필요합니다.")
});

type ItemFormData = z.infer<typeof itemSchema>;

// 모달 내부 컴포넌트 로직
const { register, handleSubmit, formState: { errors } } = useForm<ItemFormData>({
  resolver: zodResolver(itemSchema)
});

return (
  <form onSubmit={handleSubmit(api.createItem)}>
     <input {...register("name")} />
     {errors.name && <p className="text-red-500">{errors.name.message}</p>}
  </form>
);
```
