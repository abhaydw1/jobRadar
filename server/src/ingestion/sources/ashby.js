// Ashby's public posting API — no authentication required.
// Docs: https://developers.ashbyhq.com/reference/posting-api-job-board
// Response shape: { jobs: [...], apiVersion: string }
// Job fields: id, title, location (string), isRemote, descriptionPlain,
//             descriptionHtml, jobUrl, publishedAt, employmentType, ...
const BASE_URL = "https://api.ashbyhq.com/posting-api/job-board";

export function createAshbyAdapter({ companySlug, companyName }) {
  return {
    source: "ashby",
    sourceCompany: companySlug,

    async fetchJobs() {
      const res = await fetch(`${BASE_URL}/${companySlug}`);

      if (!res.ok) {
        throw new Error(
          `Ashby fetch failed for "${companySlug}": ${res.status} ${res.statusText}`,
        );
      }

      const data = await res.json();
      const jobs = data?.jobs ?? [];

      return jobs.map((job) => ({
        source: "ashby",
        sourceCompany: companySlug,
        sourceJobId: String(job.id),
        title: job.title ?? "Untitled",
        company: companyName,
        location: typeof job.location === "string" ? job.location : "",
        remote: job.isRemote === true,
        // Ashby provides both descriptionPlain and descriptionHtml.
        // Pass plain text so the normalizer skips the HTML stripper.
        descriptionPlain: job.descriptionPlain ?? "",
        sourceUrl: job.jobUrl ?? `https://jobs.ashbyhq.com/${companySlug}/${job.id}`,
        postedAt: job.publishedAt ? new Date(job.publishedAt) : new Date(),
      }));
    },
  };
}
