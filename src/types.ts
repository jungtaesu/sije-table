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
