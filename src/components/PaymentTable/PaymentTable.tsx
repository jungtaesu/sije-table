import { COLUMNS } from "../../types";
import { useState, Fragment } from "react";
import GroupSection from "../GroupSection/GroupSection";
import { money } from "../../utils/format";
import "./PaymentTable.css";
import FragmentPayCols from "./FragmentPayCols";
import { usePaymentTableData } from "../../hooks/usePaymentTableData";

export default function PaymentTable() {

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { filters, uniqueValues, handleFilterChange, vm, paymentGrandTotals } = usePaymentTableData();

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    // 닫을 때 필터 초기화 여부는 기획에 따라 다르지만, 보통 유지하거나 초기화함. 
    // 여기서는 유지.
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
                className="pt-th-group"
              >
                Ordered
              </th>

              {vm.payments.map((p) => (
                <th key={p.id} colSpan={3} className="pt-th-group" style={{ verticalAlign: "top", minWidth: 260 }}>
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

              <th colSpan={2} className="pt-th-group">
                Total (Shipped)
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
              {COLUMNS.map((col) => {
                const combinedClass = [
                  col.style?.textAlign === 'right' ? 'pt-th-right' : 'pt-th',
                  col.key === 'orderAmount' ? 'pt-divider-right' : ''
                ].filter(Boolean).join(' ');

                return (
                  <th key={col.key} className={combinedClass} style={{ width: col.width }}>
                    {col.label}
                  </th>
                );
              })}

              {/* Payable columns (per payment) */}
              {vm.payments.map((p) => (
                <FragmentPayCols key={p.id} />
              ))}

              {/* Total columns */}
              <th className="pt-th-right" style={{ width: 90 }}>Shipped Qty</th>
              <th className="pt-th-right" style={{ width: 100 }}>Total Amount</th>
            </tr>
          </thead>

          <tbody>
            {vm.groups.map((g) => (
              <GroupSection key={g.salesOrderId} group={g} paymentIds={vm.payments.map((p) => p.id)} />
            ))}

            {/* Grand Total */}
            <tr>
              <td className="pt-td-total-label" colSpan={7}>
                G.TTL
              </td>
              <td className="pt-td-total-num">{money(vm.grandTotalOrderAmount)}</td>

              {vm.payments.map((p) => {
                const total = paymentGrandTotals[p.id];
                return (
                  <Fragment key={p.id}>
                    <td className="pt-td-total-num">{total.shipped > 0 ? total.shipped.toLocaleString() : ""}</td>
                    <td className="pt-td-dim" />
                    <td className="pt-td-total-num">{total.amount > 0 ? money(total.amount) : ""}</td>
                  </Fragment>
                );
              })}

              <td className="pt-td-total-num">
                {Object.values(paymentGrandTotals)
                  .reduce((acc, curr) => acc + curr.shipped, 0)
                  .toLocaleString()}
              </td>
              <td className="pt-td-total-num">
                {money(
                  Object.values(paymentGrandTotals).reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
