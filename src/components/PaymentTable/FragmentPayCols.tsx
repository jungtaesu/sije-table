/** Payable 컬럼 3개 헤더 재사용 */
function FragmentPayCols() {
  return (
    <>
      <th className="pt-th-right" style={{ width: 90 }}>Shipped Qty</th>
      <th className="pt-th-right" style={{ width: 80 }}>U/price</th>
      <th className="pt-th-right" style={{ width: 90 }}>Amount</th>
    </>
  );
}

export default FragmentPayCols;