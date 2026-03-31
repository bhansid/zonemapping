import { useMemo, useState } from "react";

export default function AdminOrdersView({ orders }: any) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [agentFilter, setAgentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  function formatDate(d: string) {
    const date = new Date(d);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const grouped = useMemo(() => {
    const map: any = {};

    orders.forEach((row: any) => {
      const id = row.Order_ID;
      if (!map[id]) map[id] = [];
      map[id].push(row);
    });

    return Object.values(map)
      .map((items: any) => {
        const first = items[0];

        const total = items.reduce(
          (sum: number, i: any) =>
            sum + Number(i.Total || 0),
          0
        );

        return {
          id: first.Order_ID,
          date: first.Date,
          retailer: first.Client_Name,
          phone: first.Phone,
          agent: first.Agent,
          address: first.BuildingRoad,
          notes: first.Notes,
          items,
          total,
          count: items.length
        };
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [orders]);

  const filtered = grouped.filter((o: any) => {
    const matchesSearch =
      `${o.retailer} ${o.id} ${o.agent} ${o.phone}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesAgent =
      !agentFilter || o.agent === agentFilter;

    const matchesDate =
      !dateFilter ||
      o.date?.slice(0, 10) === dateFilter;

    return matchesSearch && matchesAgent && matchesDate;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Orders</h2>

      <input
        placeholder="Search retailer / order id / agent / phone"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 16,
          border: "1px solid #ddd",
          borderRadius: 6
        }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <select
          value={agentFilter}
          onChange={e => setAgentFilter(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">All Agents</option>
          {[...new Set(grouped.map((o: any) => o.agent))].map(
            (a: any) => (
              <option key={a}>{a}</option>
            )
          )}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ padding: 8 }}
        />
      </div>

      <div className="table">
        <div className="thead">
          <div>Order ID</div>
          <div>Date</div>
          <div>Retailer</div>
          <div>Agent</div>
          <div>Products</div>
          <div>Total</div>
          <div></div>
        </div>

        {filtered.map((o: any) => (
          <div key={o.id} className="row">
            <div>#{o.id.slice(-4)}</div>
            <div>{formatDate(o.date)}</div>
            <div>{o.retailer}</div>
            <div>{o.agent}</div>
            <div>{o.count}</div>
            <div>{o.total}</div>
            <div>
              <button onClick={() => setSelected(o)}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="overlay">
          <div className="popup">
            <h3>Order #{selected.id.slice(-4)}</h3>

            <div className="meta">
              <div><b>Retailer:</b> {selected.retailer}</div>
              <div><b>Phone:</b> {selected.phone}</div>
              <div><b>Agent:</b> {selected.agent}</div>
              <div><b>Address:</b> {selected.address}</div>
              <div><b>Notes:</b> {selected.notes}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((i: any, idx: number) => (
                  <tr key={idx}>
                    <td>{i.Product}</td>
                    <td>{i.Qty}</td>
                    <td>{i.Price}</td>
                    <td>{i.Total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="popup-footer">
              <b>Total: {selected.total}</b>
            </div>

            <div className="actions">
              <button onClick={() => window.print()}>
                Print
              </button>

              <button onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
      .table{
        border:1px solid #ddd;
        border-radius:8px;
        overflow:hidden;
      }

      .thead,.row{
        display:grid;
        grid-template-columns:140px 160px 1fr 120px 80px 100px 80px;
        padding:10px;
        align-items:center;
      }

      .thead{
        background:#f3f4f6;
        font-weight:600;
      }

      .row{
        border-top:1px solid #eee;
      }

      .overlay{
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.4);
        display:flex;
        align-items:center;
        justify-content:center;
      }

      .popup{
        background:white;
        padding:20px;
        width:700px;
        max-width:95%;
        border-radius:8px;
      }

      .meta{
        margin-bottom:10px;
        display:grid;
        gap:4px;
      }

      table{
        width:100%;
        border-collapse:collapse;
      }

      th,td{
        border:1px solid #eee;
        padding:6px;
        text-align:left;
      }

      .popup-footer{
        margin-top:10px;
        text-align:right;
      }

      .actions{
        margin-top:12px;
        display:flex;
        justify-content:flex-end;
        gap:10px;
      }

      button{
        padding:8px 12px;
        cursor:pointer;
        border:1px solid #ddd;
        background:white;
        border-radius:6px;
      }
      `}</style>
    </div>
  );
}