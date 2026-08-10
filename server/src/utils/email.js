import nodemailer from "nodemailer";

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      })
    : null;

export async function sendOrderEmail({ to, orderId, total }) {
  if (!transporter) {
    console.log("SMTP not configured; skipping email:", to);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `ShopSphere order ${orderId}`,
    text: `Your order ${orderId} was placed successfully. Total: ₹${total}.`
  });
}
