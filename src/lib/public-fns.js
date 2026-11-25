import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { contactAllowed } from "@/lib/admin.server";

const asItems = (result) => (Array.isArray(result) ? result : result?.items ?? []);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/**
 * Everything the public site renders. Published records only, read with the
 * service role so drafts never reach a visitor, and each list capped.
 */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const sdk = context.getDb().asServiceRole;
  try {
    const [settings, content, services, projects, faqs, testimonials, seeded] = await Promise.all([
      sdk.entities.BusinessSettings.filter({ key: "main" }, { limit: 1 }),
      sdk.entities.WebsiteContent.filter({ key: "main", status: "published" }, { limit: 1 }),
      sdk.entities.Service.filter({ is_published: true }, { sort: "sort_order", limit: 60 }),
      sdk.entities.PortfolioProject.filter({ is_published: true }, { sort: "sort_order", limit: 60 }),
      sdk.entities.Faq.filter({ is_published: true }, { sort: "sort_order", limit: 60 }),
      sdk.entities.Testimonial.filter({ is_published: true }, { sort: "sort_order", limit: 40 }),
      sdk.entities.SiteSeed.count({}),
    ]);

    return {
      settings: asItems(settings)[0] ?? null,
      content: asItems(content)[0] ?? null,
      services: asItems(services),
      projects: asItems(projects),
      faqs: asItems(faqs),
      testimonials: asItems(testimonials),
      seeded: seeded > 0,
    };
  } catch (error) {
    console.error("getSiteContent failed:", error?.message || error);
    return { settings: null, content: null, services: [], projects: [], faqs: [], testimonials: [] };
  }
});

/**
 * Public inquiry intake. Creates (or reuses) the customer record, then the
 * inquiry. Runs with the service role because the two records must stay linked
 * and anonymous visitors may not read either one.
 */
export const submitInquiry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      full_name: z.string().trim().min(2).max(120),
      business_name: z.string().trim().max(160).optional().default(""),
      email: z.string().trim().min(5).max(200).regex(EMAIL_RE, "Enter a valid email address"),
      phone: z.string().trim().max(40).optional().default(""),
      website_type: z.string().trim().max(120).optional().default(""),
      project_description: z.string().trim().min(10).max(5000),
      budget: z.string().trim().max(80).optional().default(""),
      additional_info: z.string().trim().max(2000).optional().default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    const sdk = context.getDb().asServiceRole;
    const email = data.email.toLowerCase();

    if (!(await contactAllowed(context.getDb()))) {
      return { ok: false, error: "We've already received a few messages from this device. Please email us directly, or try again a little later." };
    }

    const recent = asItems(
      await sdk.entities.Inquiry.filter({ email }, { sort: "-created_date", limit: 1 }),
    )[0];
    if (recent) {
      const ageMinutes = (Date.now() - new Date(recent.created_date).getTime()) / 60000;
      if (ageMinutes < 10 && recent.project_description === data.project_description) {
        return { ok: true, duplicate: true };
      }
    }

    const existing = asItems(await sdk.entities.Customer.filter({ email }, { limit: 1 }))[0];
    let customerId = existing?.id;
    if (!customerId) {
      const customer = await sdk.entities.Customer.create({
        full_name: data.full_name,
        business_name: data.business_name,
        email,
        phone: data.phone,
        status: "Potential Customer",
        source: "Website inquiry",
      });
      customerId = customer.id;
    }

    const inquiry = await sdk.entities.Inquiry.create({
      customer_id: customerId,
      full_name: data.full_name,
      business_name: data.business_name,
      email,
      phone: data.phone,
      website_type: data.website_type,
      project_description: data.project_description,
      budget: data.budget,
      additional_info: data.additional_info,
      status: "New",
      is_read: false,
      source: "Website contact form",
      submitted_at: new Date().toISOString(),
    });

    return { ok: true, inquiry_id: inquiry.id };
  });