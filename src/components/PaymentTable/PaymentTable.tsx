import mock from "../../data/mock.json";
import type { MockData, Consumption } from "../../types";
import { buildTableModel } from "../../domain/buildTableModel";
import React, { useMemo, useState } from "react";

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

// 필터링을 위한 컬럼 설정 정의
type ColDef = {
  key: string;
  label: string;
  getValue: (c: Consumption) => string | number;
  width?: number; // 너비 고정을 위해 추가
  style?: React.CSSProperties;
};

const COLUMNS: ColDef[] = [
  { key: "styleNumber", label: "Style No.", getValue: (c) => c.salesOrder.styleNumber, width: 100 },
  { key: "supplierItemCode", label: "Supplier Item #", getValue: (c) => c.supplierItemCode, width: 120 },
  { key: "fabricName", label: "Fabric Name", getValue: (c) => c.fabricName, width: 100 },
  { key: "fabricColor", label: "Fabric Color", getValue: (c) => c.colorName, width: 80 },
  { key: "orderQuantity", label: "Order Qty", getValue: (c) => c.orderQuantity, style: { textAlign: "right" }, width: 50 },
  { key: "unit", label: "Unit", getValue: (c) => c.unit, width: 40 },
  { key: "unitPrice", label: "U/price", getValue: (c) => c.unitPrice, style: { textAlign: "right" }, width: 50 },
  { key: "orderAmount", label: "Amount", getValue: (c) => c.orderAmount, style: { textAlign: "right" }, width: 80 },
];

export default function PaymentTable() {

  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const vm = buildTableModel(filteredData as MockData);
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
  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    // 닫을 때 필터 초기화 여부는 기획에 따라 다르지만, 보통 유지하거나 초기화함. 
    // 여기서는 유지.
  };

  const handleFilterChange = (key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 상단 툴바 / Search Toggle */}
      <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <h2 style={{ margin: 0, marginRight: "auto" }}>Payment Table</h2>
        <button
          onClick={handleToggleSearch}
          style={{
            padding: "8px 16px",
            background: isSearchOpen ? "#2563eb" : "#e5e7eb",
            color: isSearchOpen ? "#fff" : "#000",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Search {isSearchOpen ? "ON" : "OFF"}
        </button>
      </div>

      <div style={{ overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <table style={{ borderCollapse: "collapse", width: "max-content", tableLayout: "fixed" }}>
          <thead>
            {/* 1) 상단 그룹 헤더: Ordered / Payable(결제들) / Total */}
            <tr>
              <th
                colSpan={8}
                style={thGroup}
              >
                Ordered
              </th>

              {vm.payments.map((p) => (
                <th key={p.id} colSpan={3} style={{ ...thGroup, verticalAlign: "top", minWidth: 260 }}>
                  <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    Payable (payment #{p.id})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "6px 0", fontSize: 13, fontWeight: 400 }}>
                    
                    {/* Payment Due */}
                    <div style={{ color: "#374151", fontWeight: 600 }}>Payment Due</div>
                    <div style={{ color: "#111827" }}>
                      {p.paymentDueDate ? new Date(p.paymentDueDate).toISOString().slice(0, 10).replace(/-/g, '.') : "-"}
                    </div>

                    {/* Payment Date & Status */}
                    <div style={{ color: "#374151", fontWeight: 600 }}>Payment Date</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#111827" }}>{p.paidAt && new Date(p.paidAt).toISOString().slice(0, 10).replace(/-/g, '.')}</span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                          background: p.paymentStatus === "PAID" ? "#dbeafe" : "#f3f4f6",
                          color: p.paymentStatus === "PAID" ? "#1e40af" : "#4b5563",
                        }}
                      >
                        {p.paymentStatus}
                      </span>
                    </div>

                    {/* Attachment */}
                    <div style={{ color: "#374151", fontWeight: 600 }}>Attachment</div>
                    <div>
                      {[...(p.sourcingFiles || []), ...(p.financeFiles || [])].length > 0 ? (
                        <div style={{ display: "inline-flex", alignItems: "center", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                          File...
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </div>

                    {/* Memo */}
                    <div style={{ color: "#374151", fontWeight: 600 }}>Memo</div>
                    <div style={{ whiteSpace: "normal", wordBreak: "break-all", color: "#111827" }}>
                      {p.memo || <span style={{ color: "#9ca3af" }}>-</span>}
                    </div>
                  </div>
                </th>
              ))}

              <th colSpan={2} style={thGroup}>
                Total (Order)
              </th>
            </tr>

            {/* 2) 검색 행 (Toggle ON 시 표시) */}
            {isSearchOpen && (
              <tr style={{ background: "#f1f5f9" }}>
                {COLUMNS.map((col) => (
                  <th key={col.key} style={{ padding: 4 }}>
                    <select
                      value={filters[col.key] || "All"}
                      onChange={(e) => handleFilterChange(col.key, e.target.value)}
                      style={{ width: "100%", padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                    >
                      <option value="All">All</option>
                      {uniqueValues[col.key]?.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </th>
                ))}

                {/* Payable / Total 영역은 검색 필터 없음 (Ordered 기준 필터링) 
                    남은 colspan 채우기:
                    - Payments: 3 * payments.length
                    - Total: 2
                */}
                <th colSpan={vm.payments.length * 3 + 2} style={{ background: "#f8fafc" }} />
              </tr>
            )}

            {/* 3) 컬럼 헤더 */}
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} style={{ ...th, width: col.width, ...(col.key === 'orderAmount' ? { ...thRight, ...dividerRight } : (col.style?.textAlign === 'right' ? thRight : th)) }}>
                  {col.label}
                </th>
              ))}

              {/* Payable columns (per payment) */}
              {vm.payments.map((p) => (
                <FragmentPayCols key={p.id} />
              ))}

              {/* Total columns */}
              <th style={{ ...thRight, width: 90 }}>Qty</th>
              <th style={{ ...thRight, width: 100 }}>Amount</th>
            </tr>
          </thead>

          <tbody>
            {vm.groups.map((g) => (
              <GroupSection key={g.salesOrderId} group={g} paymentIds={vm.payments.map((p) => p.id)} />
            ))}

            {/* Grand Total */}
            <tr>
              <td style={tdTotalLabel} colSpan={7}>
                G.TTL
              </td>
              <td style={tdTotalNum}>{money(vm.grandTotalOrderAmount)}</td>

              {vm.payments.map((p) => {
                const total = paymentGrandTotals[p.id];
                return (
                  <React.Fragment key={p.id}>
                    <td style={tdTotalNum}>{total.shipped > 0 ? total.shipped.toLocaleString() : ""}</td>
                    <td style={tdDim} />
                    <td style={tdTotalNum}>{total.amount > 0 ? money(total.amount) : ""}</td>
                  </React.Fragment>
                );
              })}

              <td style={tdTotalNum}>{vm.grandTotalOrderQuantity.toLocaleString()}</td>
              <td style={tdTotalNum}>{money(vm.grandTotalOrderAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Payable 컬럼 3개 헤더 재사용 */
function FragmentPayCols() {
  return (
    <>
      <th style={{ ...thRight, width: 90 }}>Shipped Qty</th>
      <th style={{ ...thRight, width: 80 }}>U/price</th>
      <th style={{ ...thRight, width: 90 }}>Amount</th>
    </>
  );
}

function GroupSection({
  group,
  paymentIds,
}: {
  group: ReturnType<typeof buildTableModel>["groups"][number];
  paymentIds: number[];
}) {
  // payment별 subtotal(이 그룹 내에서) 계산: shipped/amount 합
  const paySub = paymentIds.map((pid) => {
    let shipped = 0;
    let amount = 0;
    for (const r of group.rows) {
      const cell = r.payableByPaymentId[pid];
      if (cell) {
        shipped += cell.shippedQuantity ?? 0;
        amount += cell.amount ?? 0;
      }
    }
    return { pid, shipped, amount };
  });

  return (
    <>
      {group.rows.map((r) => {
        const c = r.consumption;
        return (
          <tr key={c.id}>
            <td style={td}>{c.salesOrder.styleNumber}</td>
            <td style={td}>{c.supplierItemCode}</td>
            <td style={td}>{c.fabricName}</td>
            <td style={td}>{c.colorName}</td>
            <td style={tdRight}>{c.orderQuantity.toLocaleString()}</td>
            <td style={td}>{c.unit}</td>
            <td style={tdRight}>{c.unitPrice.toLocaleString()}</td>
            <td style={tdRight}>{c.orderAmount.toLocaleString()}</td>

            {paymentIds.map((pid) => {
              const cell = r.payableByPaymentId[pid];
              return (
                <React.Fragment key={`${pid}:${c.id}`}>
                  <td style={tdRight}>{cell ? cell.shippedQuantity.toLocaleString() : ""}</td>
                  <td style={tdRight}>{cell ? cell.unitPrice.toLocaleString() : ""}</td>
                  <td style={tdRight}>{cell ? cell.amount.toLocaleString() : ""}</td>
                </React.Fragment>
              );
            })}

            <td style={tdRight}>{c.orderQuantity.toLocaleString()}</td>
            <td style={tdRight}>{c.orderAmount.toLocaleString()}</td>
          </tr>
        );
      })}

      {/* Sub Total row (그룹 끝) */}
      <tr>
        <td style={tdTotalLabel} colSpan={7}>
          Sub.TTL (SalesOrder {group.salesOrderId})
        </td>
        <td style={tdTotalNum}>{money(group.subTotalOrderAmount)}</td>

        {paySub.map((s) => (
          <React.Fragment key={s.pid}>
            <td style={tdTotalNum}>{s.shipped ? s.shipped.toLocaleString() : ""}</td>
            <td style={tdDim} />
            <td style={tdTotalNum}>{s.amount ? money(s.amount) : ""}</td>
          </React.Fragment>
        ))}

        <td style={tdTotalNum}>{group.subTotalOrderQuantity.toLocaleString()}</td>
        <td style={tdTotalNum}>{money(group.subTotalOrderAmount)}</td>
      </tr>
    </>
  );
}

// ---- styles (최소) ----
const thGroup: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
  fontSize: 13,
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const thRight: React.CSSProperties = {
  ...th,
  textAlign: "right",
};

const td: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const tdRight: React.CSSProperties = {
  ...td,
  textAlign: "right",
};

const tdTotalLabel: React.CSSProperties = {
  ...td,
  fontWeight: 700,
  background: "#f8fafc",
};

const tdTotalNum: React.CSSProperties = {
  ...tdRight,
  fontWeight: 700,
  background: "#f8fafc",
};

const tdDim: React.CSSProperties = {
  ...td,
  background: "#f8fafc",
};

const dividerRight: React.CSSProperties = {
  borderRight: "2px solid #e5e7eb",
};
