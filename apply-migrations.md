# 데이터베이스 마이그레이션 적용 가이드

## 1. Supabase 대시보드에서 SQL 실행

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭
4. 새 쿼리 생성
5. `database-migrations.sql` 파일의 내용을 복사해서 붙여넣기
6. 실행 버튼 클릭

## 2. 또는 Supabase CLI 사용 (권장)

### 개발 브랜치 생성 후 적용
```bash
# Supabase CLI 설치 (아직 안했다면)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 개발 브랜치 생성
supabase branches create user-management

# 새 마이그레이션 파일 생성
supabase migration new create_user_profiles

# database-migrations.sql 내용을 새로 생성된 마이그레이션 파일에 복사

# 마이그레이션 적용
supabase db push
```

## 3. 마이그레이션 적용 후 확인사항

1. **테이블 생성 확인**
   - `user_profiles` 테이블이 생성되었는지 확인
   - `conversations` 테이블에 `user_id` 컬럼이 추가되었는지 확인
   - `messages` 테이블에 `user_id` 컬럼이 추가되었는지 확인

2. **RLS 정책 확인**
   - 각 테이블의 Row Level Security가 활성화되었는지 확인
   - 사용자별 데이터 접근 정책이 적용되었는지 확인

3. **인덱스 확인**
   - 성능 최적화를 위한 인덱스가 생성되었는지 확인

## 4. 웹 애플리케이션 테스트

마이그레이션 완료 후:
1. 웹 애플리케이션을 새로고침
2. 새 대화 생성 시도
3. 사용자 프로필 설정 기능 테스트
4. 기존 대화가 있다면 사용자별로 격리되는지 확인

## 5. 문제 해결

### 권한 오류가 발생하는 경우:
```sql
-- auth.users 테이블 권한 확인
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO service_role;
```

### 기존 데이터가 있는 경우:
```sql
-- 현재 인증된 사용자로 기존 데이터 할당 (주의: 실제 환경에서는 신중하게 실행)
-- UPDATE public.conversations SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE public.messages SET user_id = auth.uid() WHERE user_id IS NULL;
```

## 6. 롤백 방법

문제가 발생한 경우:
```sql
-- user_id 컬럼 제거
ALTER TABLE public.conversations DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.messages DROP COLUMN IF EXISTS user_id;

-- user_profiles 테이블 삭제
DROP TABLE IF EXISTS public.user_profiles;
```