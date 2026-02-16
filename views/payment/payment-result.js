(() => {
  const status = (location.pathname.split("/").pop() || "").toLowerCase();
  const cartId = new URLSearchParams(location.search).get("cart_id");

  const title = document.getElementById("title");
  const msg = document.getElementById("msg");

  console.log("Payment Result Page Loaded:", { status, cartId });

  if (status === "success") {
    title.textContent = "✅ تم الدفع بنجاح";
    msg.textContent = `يمكنك إغلاق الصفحة والعودة للتطبيق. رقم العملية: ${cartId || "-"}`;
  } else if (status === "failed") {
    title.textContent = "❌ فشل الدفع";
    msg.textContent = `لم تكتمل العملية. يمكنك إغلاق الصفحة والعودة للتطبيق. رقم السلة: ${cartId || "-"}`;
  } else {
    title.textContent = "⚠️ حدث خطأ";
    msg.textContent = "حاول مرة أخرى لاحقًا.";
  }
})();
