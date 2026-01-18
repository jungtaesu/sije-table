// src/domain/buildTableModel.ts
import type { Consumption, MockData, Payment, PaymentBreakdown } from "../types";

type BreakdownCell = {
  shippedQuantity: number;
  unitPrice: number;
  amount: number;
};

export type RowVM = {
  consumption: Consumption;
  // paymentId별 셀 데이터
  payableByPaymentId: Record<number, BreakdownCell | null>;
};

export type GroupVM = {
  salesOrderId: number;
  salesOrderStyleNumber: string;
  rows: RowVM[];
  subTotalOrderAmount: number;
  subTotalOrderQuantity: number;
};

export type TableVM = {
  payments: Payment[];
  groups: GroupVM[];
  grandTotalOrderAmount: number;
  grandTotalOrderQuantity: number;
};

/** key: `${paymentId}:${itemId}` */
function makeBreakdownKey(paymentId: number, itemId: number) {
  return `${paymentId}:${itemId}`;
}

export function buildTableModel(data: MockData): TableVM {
  const { payments, consumptions, paymentBreakdowns } = data;

  // 1) breakdown lookup 만들기 (O(1) 접근)
  const breakdownMap = new Map<string, PaymentBreakdown>();
  for (const b of paymentBreakdowns) {
    breakdownMap.set(makeBreakdownKey(b.paymentId, b.itemId), b);
  }

  // 2) salesOrder.id로 그룹핑
  const groupMap = new Map<number, Consumption[]>();
  for (const c of consumptions) {
    const key = c.salesOrder.id;
    const arr = groupMap.get(key) ?? [];
    arr.push(c);
    groupMap.set(key, arr);
  }

  // 3) groups VM 만들기
  const groups: GroupVM[] = [];
  for (const [salesOrderId, items] of groupMap.entries()) {
    const rows: RowVM[] = items.map((c) => {
      const payableByPaymentId: Record<number, BreakdownCell | null> = {};

      for (const p of payments) {
        const bd = breakdownMap.get(makeBreakdownKey(p.id, c.id));
        payableByPaymentId[p.id] = bd
          ? { shippedQuantity: bd.shippedQuantity, unitPrice: bd.unitPrice, amount: bd.amount }
          : null;
      }

      return { consumption: c, payableByPaymentId };
    });

    const subTotalOrderAmount = items.reduce((sum, c) => sum + (c.orderAmount ?? 0), 0);
    const subTotalOrderQuantity = items.reduce((sum, c) => sum + (c.orderQuantity ?? 0), 0);

    // 그룹 메타(대표값)
    const salesOrderStyleNumber = items[0]?.salesOrder?.styleNumber ?? String(salesOrderId);

    groups.push({
      salesOrderId,
      salesOrderStyleNumber,
      rows,
      subTotalOrderAmount,
      subTotalOrderQuantity,
    });
  }

  // (선택) 정렬: salesOrderId 오름차순
  groups.sort((a, b) => a.salesOrderId - b.salesOrderId);

  const grandTotalOrderAmount = groups.reduce((sum, g) => sum + g.subTotalOrderAmount, 0);
  const grandTotalOrderQuantity = groups.reduce((sum, g) => sum + g.subTotalOrderQuantity, 0);

  return {
    payments,
    groups,
    grandTotalOrderAmount,
    grandTotalOrderQuantity,
  };
}
