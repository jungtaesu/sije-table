import mock from "../../data/mock.json";
import type { MockData } from "../../types";
import { buildTableModel } from "../../domain/buildTableModel";
import React from "react";

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

export default function PaymentTable() {
  const vm = buildTableModel(mock as MockData);

  return (
    <div style={{ overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100 }}>
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
              <th key={p.id} colSpan={3} style={thGroup}>
                Payable (payment #{p.id})
                <div style={{ fontWeight: 400, fontSize: 12, marginTop: 6, opacity: 0.85 }}>
                  Due: {new Date(p.paymentDueDate).toISOString().slice(0, 10)} / Status:{" "}
                  {p.paymentStatus}
                </div>
              </th>
            ))}

            <th colSpan={2} style={thGroup}>
              Total (Order)
            </th>
          </tr>

          {/* 2) 컬럼 헤더 */}
          <tr>
            {/* Ordered columns */}
            <th style={th}>Style No.</th>
            <th style={th}>Supplier Item #</th>
            <th style={th}>Fabric Name</th>
            <th style={th}>Fabric Color</th>
            <th style={thRight}>Order Qty</th>
            <th style={th}>Unit</th>
            <th style={thRight}>U/price</th>
            <th style={thRight}>Amount</th>

            {/* Payable columns (per payment) */}
            {vm.payments.map((p) => (
              <FragmentPayCols key={p.id} />
            ))}

            {/* Total columns */}
            <th style={thRight}>Qty</th>
            <th style={thRight}>Amount</th>
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

            {vm.payments.map((p) => (
              <td key={p.id} colSpan={3} style={tdDim} />
            ))}

            <td style={tdTotalNum}>{vm.grandTotalOrderQuantity.toLocaleString()}</td>
            <td style={tdTotalNum}>{money(vm.grandTotalOrderAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Payable 컬럼 3개 헤더 재사용 */
function FragmentPayCols() {
  return (
    <>
      <th style={thRight}>Shipped Qty</th>
      <th style={thRight}>U/price</th>
      <th style={thRight}>Amount</th>
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
