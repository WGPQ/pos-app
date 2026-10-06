import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashResetToken, RecoveryEmailError, sendInvitationEmail } from "@/lib/password-recovery";

export async function deliverUserInvitation(user: { id: number; email: string }, businessName: string) {
  let resetId: string | undefined;
  try {
    const token = randomBytes(32).toString("base64url");
    const reset = await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    resetId = reset.id;
    const emailId = await sendInvitationEmail(user.email, token, businessName);
    console.info("User invitation accepted by Resend", { emailId });
    return true;
  } catch (error) {
    console.error("User invitation delivery failed", error instanceof RecoveryEmailError ? { status: error.status, providerCode: error.providerCode, invalidField: error.invalidField } : { providerCode: "network_or_unexpected_error" });
    if (resetId) await prisma.passwordResetToken.deleteMany({ where: { id: resetId } }).catch(() => undefined);
    return false;
  }
}
