import { useState, useMemo } from "react";
import mock from "../data/mock.json";
import { COLUMNS, type MockData } from "../types";
import { buildTableModel } from "../domain/buildTableModel";

export function usePaymentTableData() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  // 1. 전체 데이터에서 각 컬럼별 고유값(Candidate) 추출
  const uniqueValues = useMemo(() => {
    const map: Record<string, Set<string | number>> = {};
    COLUMNS.forEach((col) => {
      map[col.key] = new Set();
    });

    mock.consumptions.forEach((c) => {
      COLUMNS.forEach((col) => {
        const val = col.getValue(c);
        map[col.key].add(val);
      });
    });

    // 정렬하여 배열로 반환
    const result: Record<string, (string | number)[]> = {};
    Object.keys(map).forEach((key) => {
      // 숫자/문자 정렬 처리
      result[key] = Array.from(map[key]).sort((a, b) => {
        if (typeof a === "number" && typeof b === "number") return a - b;
        return String(a).localeCompare(String(b));
      });
    });
    return result;
  }, []);

  const filteredData = useMemo(() => {
    const filteredConsumptions = mock.consumptions.filter((c) => {
      // 모든 활성 필터 조건을 만족해야 함 (AND)
      return Object.entries(filters).every(([key, filterVal]) => {
        if (!filterVal || filterVal === "All") return true;
        const colDef = COLUMNS.find((col) => col.key === key);
        if (!colDef) return true;

        const rowVal = String(colDef.getValue(c));
        return rowVal === filterVal;
      });
    });

    return {
      ...mock,
      consumptions: filteredConsumptions,
    } as MockData;
  }, [filters]);

  const vm = buildTableModel(filteredData);

  // Payment 별 Grand Total 미리 계산 (G.TTL 행용)
  const paymentGrandTotals = useMemo(() => {
    const totals: Record<number, { shipped: number; amount: number }> = {};
    
    // 초기화
    vm.payments.forEach((p) => {
      totals[p.id] = { shipped: 0, amount: 0 };
    });

    // 집계
    vm.groups.forEach((g) => {
      g.rows.forEach((r) => {
        vm.payments.forEach((p) => {
          const cell = r.payableByPaymentId[p.id];
          if (cell) {
            totals[p.id].shipped += cell.shippedQuantity ?? 0;
            totals[p.id].amount += cell.amount ?? 0;
          }
        });
      });
    });
    
    return totals;
  }, [vm]);

  const handleFilterChange = (key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  return {
    filters,
    uniqueValues,
    filteredData,
    vm,
    paymentGrandTotals,
    handleFilterChange,
  };
}
