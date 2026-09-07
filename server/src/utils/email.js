import nodemailer from "nodemailer";

/*
=========================================================
TRANSPORTER
=========================================================
*/

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

/*
=========================================================
HELPERS
=========================================================
*/

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function emailWrapper(content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>ShopSphere</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f1e9;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e9;padding:40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:580px;background:#fffdf9;border-radius:24px;border:1px solid #ded5ca;overflow:hidden;">
              <tr>
                <td style="background:#674936;padding:28px 36px;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
                    🛍️ ShopSphere
                  </p>
                  <p style="margin:6px 0 0;font-size:12px;color:#e8d5c8;font-weight:600;">
                    Your trusted multi-vendor marketplace
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:36px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="background:#f5f1e9;border-top:1px solid #ded5ca;padding:20px 36px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#9b9087;font-weight:600;">
                    © ${new Date().getFullYear()} ShopSphere. All rights reserved.
                  </p>
                  <p style="margin:6px 0 0;font-size:11px;color:#b5a99e;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/*
=========================================================
EMAIL 1 — WELCOME EMAIL (CUSTOMER / VENDOR)
=========================================================
*/

export async function sendWelcomeEmail({ name, email, role }) {
  if (!transporter) {
    console.log("SMTP not configured — skipping welcome email.");
    return;
  }

  const isVendor = role === "VENDOR";

  const content = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#30251f;">
      Welcome to ShopSphere${name ? `, ${name.split(" ")[0]}` : ""}! 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#746a62;line-height:1.7;">
      ${isVendor
        ? "Your vendor account is live. Set up your store, add products, and start selling to thousands of customers."
        : "Your account is ready. Browse hundreds of stores, add items to your cart, and enjoy seamless checkout."
      }
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e9;border-radius:16px;padding:20px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:#9b9087;text-transform:uppercase;letter-spacing:0.1em;">
            Account Type
          </p>
          <p style="margin:0;font-size:15px;font-weight:900;color:#674936;">
            ${isVendor ? "🏪 Vendor Account" : "🛒 Customer Account"}
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-size:13px;color:#746a62;line-height:1.7;">
      ${isVendor
        ? "Head to your Vendor Dashboard to create your first store and start listing products."
        : "Start exploring stores and find something you love today."
      }
    </p>
    <p style="margin:28px 0 0;font-size:13px;color:#9b9087;">
      Happy ${isVendor ? "selling" : "shopping"}, <strong style="color:#674936;">${name?.split(" ")[0] || "there"}</strong> 🙌
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Welcome to ShopSphere${name ? `, ${name.split(" ")[0]}` : ""}! 🎉`,
    html: emailWrapper(content),
  });
}

/*
=========================================================
EMAIL 2 — ORDER CONFIRMATION (CUSTOMER)
=========================================================
*/

export async function sendOrderEmail({
  to,
  orderId,
  total,
  items = [],
  shippingAddress = {},
  customerName = "",
}) {
  if (!transporter) {
    console.log("SMTP not configured — skipping order email.");
    return;
  }

  const shortId = orderId?.toString().slice(-8).toUpperCase();

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #ede8e0;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#30251f;">${item.name}</p>
        <p style="margin:3px 0 0;font-size:12px;color:#9b9087;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #ede8e0;text-align:right;">
        <p style="margin:0;font-size:13px;font-weight:900;color:#674936;">
          ${formatCurrency(item.price * item.quantity)}
        </p>
      </td>
    </tr>
  `).join("");

  const content = `
    <div style="display:inline-block;background:#e7f3e8;border-radius:50%;width:56px;height:56px;text-align:center;line-height:56px;font-size:24px;margin-bottom:20px;">✓</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#30251f;">Order Confirmed!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#746a62;line-height:1.7;">
      Hey ${customerName?.split(" ")[0] || "there"}, your payment was verified and your order has been placed successfully.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f8;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#6a9aa2;text-transform:uppercase;letter-spacing:0.1em;">Order ID</p>
          <p style="margin:0;font-size:16px;font-weight:900;color:#30251f;">#${shortId}</p>
        </td>
      </tr>
    </table>
    ${items.length ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td colspan="2" style="padding-bottom:8px;">
          <p style="margin:0;font-size:12px;font-weight:900;color:#9b9087;text-transform:uppercase;letter-spacing:0.1em;">Items Ordered</p>
        </td>
      </tr>
      ${itemRows}
      <tr>
        <td style="padding-top:14px;">
          <p style="margin:0;font-size:14px;font-weight:900;color:#30251f;">Total</p>
        </td>
        <td style="padding-top:14px;text-align:right;">
          <p style="margin:0;font-size:18px;font-weight:900;color:#674936;">${formatCurrency(total)}</p>
        </td>
      </tr>
    </table>
    ` : ""}
    ${shippingAddress?.addressLine ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e9;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:11px;font-weight:900;color:#9b9087;text-transform:uppercase;letter-spacing:0.1em;">Delivering To</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#30251f;">${shippingAddress.fullName || ""}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#746a62;line-height:1.6;">
            ${shippingAddress.addressLine},<br/>
            ${shippingAddress.city}, ${shippingAddress.state} — ${shippingAddress.pincode}
          </p>
          <p style="margin:4px 0 0;font-size:13px;color:#746a62;">📞 ${shippingAddress.phone}</p>
        </td>
      </tr>
    </table>
    ` : ""}
    <p style="margin:0;font-size:13px;color:#9b9087;line-height:1.7;">
      You can track your order status from the <strong style="color:#674936;">My Orders</strong> section in your account.
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Confirmed — #${shortId} | ShopSphere`,
    html: emailWrapper(content),
  });
}

/*
=========================================================
EMAIL 3 — NEW ORDER NOTIFICATION (VENDOR)
=========================================================
*/

export async function sendVendorOrderEmail({
  vendorEmail,
  vendorName = "",
  orderId,
  total,
  items = [],
  shippingAddress = {},
}) {
  if (!transporter) {
    console.log("SMTP not configured — skipping vendor email.");
    return;
  }

  const shortId = orderId?.toString().slice(-8).toUpperCase();

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #ede8e0;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#30251f;">${item.name}</p>
        <p style="margin:3px 0 0;font-size:12px;color:#9b9087;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #ede8e0;text-align:right;">
        <p style="margin:0;font-size:13px;font-weight:900;color:#674936;">
          ${formatCurrency(item.price * item.quantity)}
        </p>
      </td>
    </tr>
  `).join("");

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#30251f;">🎉 New Order Received!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#746a62;line-height:1.7;">
      Hey ${vendorName?.split(" ")[0] || "there"}, you just received a new order on ShopSphere. Get it ready for dispatch!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f8;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#6a9aa2;text-transform:uppercase;letter-spacing:0.1em;">Order ID</p>
          <p style="margin:0;font-size:16px;font-weight:900;color:#30251f;">#${shortId}</p>
        </td>
      </tr>
    </table>
    ${items.length ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td colspan="2" style="padding-bottom:8px;">
          <p style="margin:0;font-size:12px;font-weight:900;color:#9b9087;text-transform:uppercase;letter-spacing:0.1em;">Items Ordered</p>
        </td>
      </tr>
      ${itemRows}
      <tr>
        <td style="padding-top:14px;">
          <p style="margin:0;font-size:14px;font-weight:900;color:#30251f;">Order Total</p>
        </td>
        <td style="padding-top:14px;text-align:right;">
          <p style="margin:0;font-size:18px;font-weight:900;color:#674936;">${formatCurrency(total)}</p>
        </td>
      </tr>
    </table>
    ` : ""}
    ${shippingAddress?.addressLine ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e9;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:11px;font-weight:900;color:#9b9087;text-transform:uppercase;letter-spacing:0.1em;">Ship To</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#30251f;">${shippingAddress.fullName || ""}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#746a62;line-height:1.6;">
            ${shippingAddress.addressLine},<br/>
            ${shippingAddress.city}, ${shippingAddress.state} — ${shippingAddress.pincode}
          </p>
          <p style="margin:4px 0 0;font-size:13px;color:#746a62;">📞 ${shippingAddress.phone}</p>
        </td>
      </tr>
    </table>
    ` : ""}
    <p style="margin:0;font-size:13px;color:#9b9087;line-height:1.7;">
      Log in to your <strong style="color:#674936;">Vendor Dashboard</strong> to manage and update this order.
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: vendorEmail,
    subject: `New Order #${shortId} — ${formatCurrency(total)} | ShopSphere`,
    html: emailWrapper(content),
  });
}