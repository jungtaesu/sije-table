import type { CSSProperties } from "react";

// src/types.ts
export type Payment = {
  id: number;
  paymentStatus: string;
  paymentDueDate: string;
  requestedAt: string | null;
  pendingAt: string | null;
  paidAt: string | null;
  memo: string | null;
  sourcingFiles: unknown[];
  financeFiles: unknown[];
};

export type SalesOrder = {
  id: number;
  styleNumber: string;
  styleCode: string;
  createUser: { id: number; name: string; engName: string; profileImage: string };
};

export type Consumption = {
  id: number;
  unitPrice: number;
  orderQuantity: number;
  orderAmount: number;
  fabricName: string;
  fabricClass: string;
  fabricDetail: string;
  supplierItemCode: string;
  brandItemCode: string | null;
  colorName: string;
  sopoNo: string;
  unit: string;
  garmentColorName: string;
  garmentSize: { id: number; name: string; orderNum: number };
  salesOrder: SalesOrder;
};

export type PaymentBreakdown = {
  id: string;
  type: string;
  shippedQuantity: number;
  unitPrice: number;
  amount: number;
  itemId: number;     // consumption.id
  paymentId: number;  // payment.id
};

export type MockData = {
  payments: Payment[];
  consumptions: Consumption[];
  paymentBreakdowns: PaymentBreakdown[];
};

// 필터링을 위한 컬럼 설정 정의
type ColDef = {
  key: string;
  label: string;
  getValue: (c: Consumption) => string | number;
  width?: number; // 너비 고정을 위해 추가
  style?: CSSProperties;
};

export const COLUMNS: ColDef[] = [
  { key: "styleNumber", label: "Style No.", getValue: (c) => c.salesOrder.styleNumber, width: 100 },
  { key: "supplierItemCode", label: "Supplier Item #", getValue: (c) => c.supplierItemCode, width: 120 },
  { key: "fabricName", label: "Fabric Name", getValue: (c) => c.fabricName, width: 100 },
  { key: "fabricColor", label: "Fabric Color", getValue: (c) => c.colorName, width: 80 },
  { key: "orderQuantity", label: "Order Qty", getValue: (c) => c.orderQuantity, style: { textAlign: "right" }, width: 50 },
  { key: "unit", label: "Unit", getValue: (c) => c.unit, width: 40 },
  { key: "unitPrice", label: "U/price", getValue: (c) => c.unitPrice, style: { textAlign: "right" }, width: 50 },
  { key: "orderAmount", label: "Amount", getValue: (c) => c.orderAmount, style: { textAlign: "right" }, width: 80 },
];