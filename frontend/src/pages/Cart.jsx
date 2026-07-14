import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "lib/api";
import { Button } from "components/ui/button";
import { toast } from "sonner";
import { Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.post("/cart/remove", { courseId: id });
    toast.success("Removed");
    load();
  };

  const loadRzp = () => new Promise((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });

  const checkout = async () => {
    if (items.length === 0) return;
    setPaying(true);
    try {
      const { data: order } = await api.post("/payment/create-order", {
        courseIds: items.map((i) => i.id),
      });

      const finish = async (resp) => {
        try {
          await api.post("/payment/verify", {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            courseIds: order.courseIds,
          });
          toast.success("Payment successful — you're enrolled!");
          // clear cart items server-side
          for (const c of items) await api.post("/cart/remove", { courseId: c.id }).catch(() => {});
          nav("/dashboard");
        } catch (e) {
          toast.error("Verification failed");
        }
      };

      if (order.mock) {
        // Mock flow — auto verify
        await finish({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature",
        });
        return;
      }

      const ok = await loadRzp();
      if (!ok) { toast.error("Razorpay SDK failed"); return; }

      const opts = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "SkillBridge",
        description: `Enroll in ${items.length} course(s)`,
        order_id: order.orderId,
        handler: finish,
        theme: { color: "#FFD60A" },
      };
      new window.Razorpay(opts).open();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Checkout failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-black text-4xl tracking-tighter text-white">Your Cart</h1>
      <p className="text-zinc-500 mt-2">{items.length} course(s) in cart</p>

      {loading ? (
        <div className="mt-10 text-zinc-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-800 p-16 text-center">
          <ShoppingBag className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-white font-semibold mt-4">Cart is empty</p>
          <p className="text-zinc-500 text-sm mt-2">Explore the catalog to find courses.</p>
          <Link to="/catalog" className="inline-block mt-6">
            <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items-list">
            {items.map((c) => (
              <div key={c.id} className="bg-[#121214] border border-zinc-800/60 rounded-2xl p-5 flex gap-5">
                <img src={c.thumbnail} alt={c.courseName || "Course thumbnail"} className="w-40 aspect-video object-cover rounded-xl bg-zinc-900" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-[#FFD60A]">{c.category?.name}</p>
                  <h3 className="font-display font-bold text-white mt-1">{c.courseName}</h3>
                  <p className="text-xs text-zinc-500 mt-1">By {c.instructor?.firstName} {c.instructor?.lastName}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-white">₹{c.price}</span>
                    <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs" data-testid={`cart-remove-${c.id}`}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-[#121214] border border-zinc-800/60 rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg text-white mb-4">Summary</h3>
              <div className="flex justify-between text-sm text-zinc-400 py-2">
                <span>Subtotal</span><span className="text-white">₹{total}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400 py-2">
                <span>Tax</span><span className="text-white">₹0</span>
              </div>
              <div className="border-t border-zinc-800 mt-3 pt-3 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-2xl font-black text-white font-display">₹{total}</span>
              </div>
              <Button onClick={checkout} disabled={paying} className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold mt-6" data-testid="cart-checkout-btn">
                {paying ? "Processing..." : "Checkout"}
              </Button>
              <p className="text-xs text-zinc-500 mt-3 text-center">Secure payment via Razorpay</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
