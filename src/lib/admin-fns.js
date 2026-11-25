import { callAdmin } from "@/lib/db-client";

/**
 * Sends a message to the customer's stored email address — never to an
 * address supplied by the caller — and records the outcome (server side, in
 * src/lib/admin.server.js). Needs RESEND_API_KEY and EMAIL_FROM to deliver.
 */
export const sendCustomerEmail = ({ data }) => callAdmin("sendCustomerEmail", data);
