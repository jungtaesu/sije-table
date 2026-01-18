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
│   └── PaymentTable/      # 메인 컴포넌트
│       ├── PaymentTable.tsx
│       └── PaymentTable.css (선택 사항)
├── data/
│   └── mock.json          # 제공된 Mock 데이터
├── domain/
│   └── buildTableModel.ts # 핵심 로직: 원본 데이터를 테이블 뷰 모델로 변환 (그룹핑, 합계 등)
├── types.ts               # TypeScript 타입 정의
├── App.tsx                # 엔트리 컴포넌트
└── main.tsx               # 진입점
```

## 설계 의도 및 트레이드오프

1.  **로직과 뷰의 분리 (도메인 모델 패턴)**
    -   복잡한 테이블 로직(그룹핑, Breakdown 매핑, Sub Total 계산)을 `domain/buildTableModel.ts`로 분리했습니다.
    -   **장점**: React 컴포넌트는 렌더링에만 집중하여 코드가 깔끔해지고, 로직에 대한 유닛 테스트가 용이합니다.
    -   **단점**: `TableVM`, `GroupVM` 같은 중간 뷰 모델(View Model) 타입 정의가 필요하여 보일러플레이트가 다소 발생합니다.

2.  **필터링 아키텍처**
    -   필터링은 `buildTableModel` 함수에 데이터를 전달하기 **전** 단계에서 원본 `consumptions` 리스트에 대해 수행됩니다.
    -   **이유**: 이를 통해 그룹핑 및 Sub Total 로직이 현재 화면에 보이는 아이템 기준으로 자동 재계산되도록 했습니다. (필터링된 뷰에 맞는 소계 표시)
    -   **트레이드오프**: "필터 옵션"(드롭다운 후보군)은 필터링된 결과가 아니라 **전체** 데이터셋(`mock.consumptions`)에서 추출합니다. 이는 현재 뷰가 비어있더라도 사용자가 전체 옵션을 볼 수 있게 하고, 다중 컬럼 필터링 시 옵션이 사라져 혼란을 주는 것을 방지하기 위함입니다.

3.  **표준 HTML Table 사용**
    -   CSS Grid나 Flexbox 대신 기본 `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` 태그를 사용했습니다.
    -   **이유**: 표 데이터(Tabular Data)에 대한 시맨틱 정확성을 지키고, 접근성을 높이며, 그룹 헤더나 Sub Total 행의 `colspan` 처리를 자연스럽게 하기 위함입니다.
