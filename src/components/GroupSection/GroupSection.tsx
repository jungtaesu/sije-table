import { Fragment } from "react";
import type { buildTableModel } from "../../domain/buildTableModel";
import { money } from "../../utils/format";

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

  // 누적 합계 (SubTotal용)
  const totalShippedSum = paySub.reduce((acc, curr) => acc + curr.shipped, 0);
  const totalAmountSum = paySub.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <>
      {group.rows.map((r) => {
        const c = r.consumption;
        
        // Row별 누적 합계 계산
        const rowShipped = paymentIds.reduce((sum, pid) => {
           const cell = r.payableByPaymentId[pid];
           return sum + (cell?.shippedQuantity ?? 0);
        }, 0);
        const rowAmount = paymentIds.reduce((sum, pid) => {
           const cell = r.payableByPaymentId[pid];
           return sum + (cell?.amount ?? 0);
        }, 0);

        return (
          <tr key={c.id}>
            <td className="pt-td">{c.salesOrder.styleNumber}</td>
            <td className="pt-td">{c.supplierItemCode}</td>
            <td className="pt-td">{c.fabricName}</td>
            <td className="pt-td">{c.colorName}</td>
            <td className="pt-td-right">{c.orderQuantity.toLocaleString()}</td>
            <td className="pt-td">{c.unit}</td>
            <td className="pt-td-right">{c.unitPrice.toLocaleString()}</td>
            <td className="pt-td-right">{c.orderAmount.toLocaleString()}</td>

            {paymentIds.map((pid) => {
              const cell = r.payableByPaymentId[pid];
              return (
                <Fragment key={`${pid}:${c.id}`}>
                  <td className="pt-td-right">{cell ? cell.shippedQuantity.toLocaleString() : ""}</td>
                  <td className="pt-td-right">{cell ? cell.unitPrice.toLocaleString() : ""}</td>
                  <td className="pt-td-right">{cell ? cell.amount.toLocaleString() : ""}</td>
                </Fragment>
              );
            })}

            <td className="pt-td-right">{rowShipped.toLocaleString()}</td>
            <td className="pt-td-right">{rowAmount.toLocaleString()}</td>
          </tr>
        );
      })}

      {/* Sub Total row (그룹 끝) */}
      <tr>
        <td className="pt-td-total-label" colSpan={7}>
          Sub.TTL (SalesOrder {group.salesOrderId})
        </td>
        <td className="pt-td-total-num">{money(group.subTotalOrderAmount)}</td>

        {paySub.map((s) => (
          <Fragment key={s.pid}>
            <td className="pt-td-total-num">{s.shipped ? s.shipped.toLocaleString() : ""}</td>
            <td className="pt-td-dim" />
            <td className="pt-td-total-num">{s.amount ? money(s.amount) : ""}</td>
          </Fragment>
        ))}

        <td className="pt-td-total-num">{totalShippedSum.toLocaleString()}</td>
        <td className="pt-td-total-num">{money(totalAmountSum)}</td>
      </tr>
    </>
  );
}

export default GroupSection;