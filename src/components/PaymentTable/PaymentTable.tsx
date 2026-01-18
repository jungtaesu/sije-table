import mock from "../../data/mock.json";
import type { MockData } from "../../types";
import { buildTableModel } from "../../domain/buildTableModel";

export default function PaymentTable() {
  const vm = buildTableModel(mock as MockData);

  return (
    <div>
      <h2>Debug VM</h2>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8, overflow: "auto" }}>
        {JSON.stringify(vm, null, 2)}
      </pre>
    </div>
  );
}
