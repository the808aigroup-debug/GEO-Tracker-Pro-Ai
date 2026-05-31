// Apollo.io integration for Agent 26 (Digital PR). Finds an editor/journalist
// at an outlet's domain and reveals their email. No-op if APOLLO_API_KEY unset.
//
// Two-step per Apollo's API:
//   1) People Search (free, no email)  → find the right person at the domain
//   2) People Enrichment / match (costs a credit) → reveal the email
//
// NOTE: built to Apollo's documented API but NOT yet tested against a live key.
// On first real run, if emails don't come back, check the response shape and
// adjust the param names (Apollo occasionally renames search filters).

const SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/search";
const MATCH_URL = "https://api.apollo.io/api/v1/people/match";
const TITLES = ["editor", "journalist", "writer", "reporter", "host", "contributor", "producer"];

export async function apolloFindContact(domain) {
  const key = process.env.APOLLO_API_KEY;
  if (!key || !domain) return null;
  const headers = { "Content-Type": "application/json", "X-Api-Key": key, "Cache-Control": "no-cache" };

  try {
    // 1) Search for a relevant person at the outlet.
    const sres = await fetch(SEARCH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ q_organization_domains: domain, person_titles: TITLES, page: 1, per_page: 1 }),
    });
    if (!sres.ok) return { error: `Apollo search ${sres.status}` };
    const sjson = await sres.json();
    const person = (sjson.people && sjson.people[0]) || (sjson.contacts && sjson.contacts[0]) || null;
    if (!person) return { name: "", title: "", email: "(no contact found at this outlet)" };

    // 2) Enrich to reveal the email (consumes a credit).
    let email = person.email || "";
    try {
      const mres = await fetch(MATCH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          first_name: person.first_name,
          last_name: person.last_name,
          organization_name: person.organization && person.organization.name,
          domain,
          reveal_professional_emails: true,
        }),
      });
      if (mres.ok) {
        const mjson = await mres.json();
        email = (mjson.person && mjson.person.email) || email;
      }
    } catch { /* keep search-level email if any */ }

    return {
      name: [person.first_name, person.last_name].filter(Boolean).join(" "),
      title: person.title || "",
      email: email || "(email not revealed)",
    };
  } catch (e) {
    return { error: e.message };
  }
}
