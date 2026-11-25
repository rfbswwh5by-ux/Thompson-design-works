import { db } from "@/lib/db-client";

/** Filter that always yields an array, whether the SDK returns a page or a list. */
export async function listRecords(entity, query = {}, options = { limit: 200 }) {
  const result = await db.entities[entity].filter(query, options);
  return Array.isArray(result) ? result : result?.items ?? [];
}

export const ENTITIES = {
  inquiry: "Inquiry",
  customer: "Customer",
  project: "Project",
  note: "InquiryNote",
  update: "ProjectUpdate",
  file: "ProjectFile",
  communication: "Communication",
  service: "Service",
  portfolio: "PortfolioProject",
  testimonial: "Testimonial",
  faq: "Faq",
  content: "WebsiteContent",
  settings: "BusinessSettings",
  event: "SiteEvent",
};

export const INQUIRY_STATUSES = ["New", "Contacted", "In Discussion", "Proposal Sent", "Won", "Lost"];
export const CUSTOMER_STATUSES = ["Potential Customer", "Active Customer", "Previous Customer", "Not Interested"];
export const PROJECT_STAGES = [
  "New Client",
  "Initial Consultation",
  "Project Requirements",
  "Design & Development",
  "Internal Review",
  "Demo Ready",
  "Client Review",
  "Revisions Requested",
  "Final Approval",
  "Completed",
  "Website Launched",
];

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export const slugify = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");