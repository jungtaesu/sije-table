# Payment Table UI 과제

프론트엔드 포지션을 위한 Payment Table UI 구현 과제입니다.

## 실행 방법

```bash
# 의존성 설치
npm install (또는 pnpm install, yarn)

# 개발 서버 시작
npm run dev
```

터미널에 표시되는 URL (http://localhost:5173 등)을 열어 확인하세요.

## 요구사항 체크리스트

- [x] **Sub Total**: `salesOrder.id` 기준으로 consumptions를 그룹핑하고, 각 그룹별 Sub Total(orderAmount 합계) 표시.
- [x] **Search UI**: 상단에 검색 필터 행을 열고 닫을 수 있는 토글 버튼 구현.
- [x] **Filtering**: 
    - 검색 행에 각 컬럼별 드롭다운 제공.
    - 드롭다운 후보군은 데이터셋의 고유값(Unique Values)으로 구성.
    - 기본값은 "All".
    - 다중 필터 선택 시 AND 조건 적용.
- [x] **Mapping**: Payment, Breakdown, Consumption 간의 매핑 관계를 화면에서 식별 가능하도록 구현.

## 폴더 구조

```
src/
├── components/
│   ├── GroupSection/      # 행 그룹(SalesOrder) 렌더링
│   │   └── GroupSection.tsx
│   └── PaymentTable/      # 메인 테이블 컴포넌트
│       ├── PaymentTable.tsx
│       ├── PaymentTable.css
│       └── FragmentPayCols.tsx # 컬럼 헤더 조각 재사용
├── data/
│   └── mock.json          # 제공된 Mock 데이터
├── domain/
│   └── buildTableModel.ts # 핵심 로직: 원본 데이터를 테이블 뷰 모델로 변환
├── hooks/
│   └── usePaymentTableData.ts # 데이터 필터링 및 가공 로직 분리
├── utils/
│   └── format.ts          # 유틸리티 (화폐 포맷 등)
├── types.ts               # TypeScript 타입 정의
├── App.tsx                # 엔트리 컴포넌트
└── main.tsx               # 진입점
```

## 설계 의도 및 트레이드오프

1.  **로직과 뷰의 분리 (도메인 모델 패턴)**
    -   복잡한 테이블 로직(그룹핑, Breakdown 매핑, Sub Total 계산)을 `domain/buildTableModel.ts`로 분리했습니다.
    -   **장점**: React 컴포넌트는 렌더링에만 집중하여 코드가 깔끔해지고, 로직별 테스트가 용이합니다.
    -   **단점**: `TableVM`, `GroupVM` 같은 중간 뷰 모델(View Model) 타입 정의가 필요하여 보일러플레이트가 다소 발생합니다.

2.  **Custom Hook을 통한 관심사 분리 (Data Logic Separation)**
    -   데이터 필터링, 고유값 추출, 뷰 모델 생성, 합계 계산 등의 데이터 처리를 `usePaymentTableData` 훅으로 완전히 분리했습니다.
    -   **의도**: UI 컴포넌트(`PaymentTable`)는 화면을 그리는 방법(How to render)에만 집중하고, 어떤 데이터를 그릴지(What to render)는 훅이 담당하도록 책임을 나눴습니다.
    -   **효과**: 컴포넌트 내부의 코드가 획기적으로 줄어들어 가독성을 높이고 추후 비즈니스 로직 변경 시 훅 내부만 수정하면 되므로 유지보수성이 향상되었습니다.

3.  **컴포넌트 파편화 및 스타일 최적화**
    -   **컴포넌트 분할**: 거대한 테이블을 관리하기 쉽게 만들기 위해 반복되는 행 그룹은 `GroupSection`으로, 중복되는 헤더 컬럼은 `FragmentPayCols`로 분할하였습니다.
    -   **CSS 추출**: 초기 개발 속도를 위해 사용했던 인라인 스타일을 `PaymentTable.css`로 추출하여 JSX 가독성을 높이고 렌더링 성능을 최적화했습니다.
    -   **트레이드오프**: 파일 개수가 늘어나는 단점이 있지만, 각 파일의 역할이 명확해져 협업과 디버깅에 유리하다고 판단했습니다.
