import { useEffect, useMemo, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

const TABS = ["Cables", "UBON", "Others"];

const PRODUCT_MAP: any = {
  Cables: [
    "C to C",
    "USB to C",
    "USB to iPhone",
    "USB to Micro",
    "USB Female Connector"
  ],
  UBON: [
    "Neckband",
    "Earphone",
    "Powerbank 1",
    "Powerbank 2",
    "Charger 65W",
    "Charger 120W",
    "Speaker 1",
    "Speaker 2"
  ],
  Others: ["Charger 65W", "Charger 45W"]
};

export default function RegisterSale() {
  const [tab, setTab] = useState("Cables");
  const [retailers, setRetailers] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [addition, setAddition] = useState(0);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [form, setForm] = useState({
    agent: "Amit",
    clientName: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetch(`${API}?action=retailers`)
      .then(r => r.json())
      .then(d => setRetailers(d.data));
  }, []);

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r: any) =>
      r.Retailer_Name?.toLowerCase().includes(
        clientSearch.toLowerCase()
      )
    );
  }, [clientSearch, retailers]);

  const subtotal = cart.reduce(
    (sum, i) => sum + i.qty * (i.price || 0),
    0
  );

  const total =
    subtotal - Number(discount || 0) + Number(addition || 0);

  const addQty = (product: string) => {
    const existing = cart.find(c => c.product === product);

    if (existing) {
      setCart(
        cart.map(c =>
          c.product === product
            ? { ...c, qty: c.qty + 1 }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        { product, qty: 1, price: "", category: tab }
      ]);
    }
  };

  const removeQty = (product: string) => {
    const existing = cart.find(c => c.product === product);
    if (!existing) return;

    if (existing.qty === 1) {
      setCart(cart.filter(c => c.product !== product));
    } else {
      setCart(
        cart.map(c =>
          c.product === product
            ? { ...c, qty: c.qty - 1 }
            : c
        )
      );
    }
  };

  const updateItem = (i: number, key: string, val: any) => {
    const copy = [...cart];
    copy[i][key] = val;
    setCart(copy);
  };

  const incCartQty = (i: number) => {
  const copy = [...cart];
  copy[i].qty += 1;
  setCart(copy);
};

const decCartQty = (i: number) => {
  const copy = [...cart];
  if (copy[i].qty === 1) {
    copy.splice(i, 1);
  } else {
    copy[i].qty -= 1;
  }
  setCart(copy);
};

const deleteItem = (i: number) => {
  const copy = [...cart];
  copy.splice(i, 1);
  setCart(copy);
};

  const saveSale = async () => {
    setLoading(true);
    setSuccess(false);

    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "save_sale",
        ...form,
        notes,
        discount,
        addition,
        items: cart
      })
    });

    const data = await res.json();
    setOrderId(data?.data?.orderId || "");

  setLoading(false);
setSuccess(true);
setShowConfirmation(true);

setTimeout(() => {
  setShowConfirmation(false);
  setSuccess(false);
  setShowCart(false);
  setCart([]);
}, 2000);
  };

  return (
    <div className="container">
      <h2 className="title">REGISTER SALE</h2>

      {loading && (
        <div className="overlay">
          <div className="loader">
            {success ? (
              <>
                <div className="tick">✓</div>
                <div>Order Saved</div>
                <div className="orderId">{orderId}</div>
              </>
            ) : (
              "Registering Sale..."
            )}
          </div>
        </div>
      )}

      {showConfirmation && (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <div className="confirm-tick">✓</div>
      <div className="confirm-text">Sale Registered</div>
      <div className="confirm-id">{orderId}</div>
    </div>
  </div>
)}

      <div className="form-grid">
        <input value="Amit" disabled />

        <div className="client-wrapper">
          <input
            placeholder="Search Client"
            value={clientSearch}
            onFocus={() => setShowSuggestions(true)}
            onChange={e =>
              setClientSearch(e.target.value)
            }
          />

          {showSuggestions && clientSearch && (
            <div className="suggestions">
              {filteredRetailers.map(
                (r: any, i: number) => (
                  <div
                    key={i}
                    className="suggestion-item"
                    onClick={() => {
                      setForm({
                        ...form,
                        clientName:
                          r.Retailer_Name,
                        phone: r.Phone
                      });
                      setClientSearch(
                        r.Retailer_Name
                      );
                      setShowSuggestions(false);
                    }}
                  >
                    {r.Retailer_Name}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={e =>
            setForm({
              ...form,
              phone: e.target.value
            })
          }
        />

        <input
          placeholder="Building + Road"
          value={form.address}
          onChange={e =>
            setForm({
              ...form,
              address: e.target.value
            })
          }
        />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="products">
        {PRODUCT_MAP[tab].map(
          (p: string, index: number) => {
            const item = cart.find(
              c => c.product === p
            );

            return (
              <div
                key={p}
                className={`row ${
                  index % 2 === 0
                    ? "even"
                    : "odd"
                }`}
              >
                <span>{p}</span>

                <input
                  placeholder="P/P"
                  type="number"
                  value={item?.price || ""}
                  onChange={e => {
                    const index =
                      cart.findIndex(
                        c => c.product === p
                      );
                    if (index > -1)
                      updateItem(
                        index,
                        "price",
                        e.target.value
                      );
                  }}
                />

                <div className="qty">
                  <button onClick={() => removeQty(p)}>-</button>
                  <span>{item?.qty || 0}</span>
                  <button onClick={() => addQty(p)}>+</button>
                </div>

                
              </div>
            );
          }
        )}
      </div>

      {cart.length > 0 && (
        <div className="sticky" onClick={() => setShowCart(true)}>
          See Cart ({cart.length}) — {total}
        </div>
      )}

      {showCart && (
        <div className="sidebar">
          <h3>Cart</h3>

          {cart.map((item, i) => (
            <div key={i} className="cart-row">
              <span>{item.product}</span>
              <input
                type="number"
                value={item.qty}
                onChange={e =>
                  updateItem(i, "qty", e.target.value)
                }
              />
              <input
                type="number"
                value={item.price}
                onChange={e =>
                  updateItem(i, "price", e.target.value)
                }
              />
            </div>
          ))}

          <div className="calc">
            <div>Subtotal: {subtotal}</div>

            <input
              placeholder="Discount"
              type="number"
              value={discount}
              onChange={e =>
                setDiscount(e.target.value)
              }
            />

            <input
              placeholder="Addition"
              type="number"
              value={addition}
              onChange={e =>
                setAddition(e.target.value)
              }
            />

            <textarea
              placeholder="Notes"
              value={notes}
              onChange={e =>
                setNotes(e.target.value)
              }
            />

            <div className="total">Total: {total}</div>
          </div>

          <button className="save" onClick={saveSale}>
            Register Sale
          </button>
        </div>
      )}

      <style>{`
.container{max-width:60%;margin:auto;padding:20px;padding-bottom:90px}
@media(max-width:768px){.container{max-width:100%}}

.title{text-align:center;margin-bottom:20px}

.form-grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:768px){.form-grid{grid-template-columns:1fr 1fr}}

.client-wrapper{position:relative}
.client-wrapper input{width:100%}

.suggestions{position:absolute;width:100%;background:white;border:1px solid #ddd;z-index:50;max-height:200px;overflow:auto}

.suggestion-item{padding:12px;cursor:pointer}
.suggestion-item:hover{background:#f5f5f5}

.tabs{display:flex;margin-top:15px}
.tabs button{flex:1;padding:12px;border:none;background:#eee;font-weight:600}
.tabs .active{background:black;color:white}


.even{background:#f7f7f7}
.odd{background:#fff}



.qty button{
padding:4px 10px;
}

.qty button{padding:6px 14px;background:#eee;border:none;font-weight:bold}

.sticky{position:fixed;bottom:0;left:0;right:0;background:black;color:white;padding:14px;text-align:center;font-weight:600}

.sidebar{position:fixed;right:0;top:0;width:360px;height:100%;background:white;padding:15px;overflow:auto;box-shadow:-5px 0 20px rgba(0,0,0,0.1)}

.cart-row{display:grid;grid-template-columns:1fr 70px 70px;gap:6px;margin-bottom:6px}

.calc input,.calc textarea{width:100%;margin-top:6px;padding:6px}
.total{font-weight:bold;margin-top:8px}

.save{width:100%;padding:12px;background:#16a34a;color:white;border:none;margin-top:10px}

.overlay{position:fixed;inset:0;background:white;display:flex;align-items:center;justify-content:center;z-index:999}
.loader{text-align:center;font-size:20px;color:#16a34a}
.tick{font-size:40px;margin-bottom:10px}
.orderId{margin-top:8px;font-size:14px}

.cart-qty{
  display:flex;
  align-items:center;
  gap:6px;
}

.cart-qty button{
  padding:4px 10px;
  background:#eee;
  border:none;
}

.delete{
  background:#eee;
  border:none;
  padding:4px 10px;
  cursor:pointer;
}
  .confirm-overlay{
  position:fixed;
  inset:0;
  background:white;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1000;
}

.confirm-box{
  text-align:center;
}

.confirm-tick{
  font-size:60px;
  color:#16a34a;
  font-weight:bold;
}

.confirm-text{
  margin-top:10px;
  font-size:18px;
  font-weight:600;
}

.confirm-id{
  margin-top:6px;
  font-size:14px;
  color:#16a34a;
}

.row{
display:grid;
grid-template-columns: 1fr 60px 100px;
padding:12px 10px;
align-items:center;
gap:8px;
}

.row span{
font-size:15px;
line-height:1.2;
}

.row input{
width:100%;
height:38px;
padding:0 6px;
font-size:13px;
}

.qty{
display:flex;
align-items:center;
justify-content:flex-end;
gap:4px;
height:38px;
}

.qty span{
min-width:18px;
text-align:center;
}

.qty button{
height:38px;
padding:0 10px;
background:#eee;
border:none;
font-weight:bold;
border-radius:6px;
}

@media(max-width:768px){
.row{
grid-template-columns: 1fr 55px 95px;
padding:10px 8px;
}

.row input{
height:36px;
}

.qty{
height:36px;
}

.qty button{
height:36px;
}
}
`}</style>
    </div>
  );
}