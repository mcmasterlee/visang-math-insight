# 비상 수학 인사이트 — GitHub/Vercel 배포용

이 버전은 GitHub 공개/비공개 저장소에 올릴 수 있도록 실제 API 키 파일을 완전히 제거했습니다.

## 사용자가 할 일
1. 이 폴더 전체를 GitHub 저장소에 업로드합니다.
2. Supabase에서 프로젝트를 만들고 `docs/SUPABASE_SETUP.sql`을 SQL Editor에서 실행합니다.
3. Vercel에서 GitHub 저장소를 Import합니다.
4. Vercel > Project > Settings > Environment Variables에 아래 7개 값을 등록합니다.
   - NAVER_CLIENT_ID
   - NAVER_CLIENT_SECRET
   - OPENAI_API_KEY
   - OPENAI_MODEL (`gpt-5-mini`)
   - SUPABASE_URL
   - SUPABASE_SECRET_KEY
   - CRON_SECRET (본인이 정한 긴 임의 문자열)
5. Vercel에서 Redeploy 합니다.

## 중요
- 실제 API 키를 GitHub 파일에 입력하지 마세요.
- `.env.example`은 이름만 보여주는 빈 예시 파일입니다.
- 이미 실제 OpenAI API 키를 GitHub Push Protection에 노출했다면 해당 키는 폐기하고 새 키를 발급하는 것을 권장합니다.
