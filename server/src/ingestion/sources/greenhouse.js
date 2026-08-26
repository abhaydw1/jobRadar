const BASE_URL = "https://boards-api.greenhouse.io/v1/boards";

export function createGreenhouseAdapter({ companyToken, companyName }) {
  return {
    source: "greenhouse",
    sourceCompany: companyToken,

    async fetchJobs() {
      const res = await fetch(
        `${BASE_URL}/${companyToken}/jobs?content=true`,
      );

      if (!res.ok) {
        throw new Error(
          `Greenhouse fetch failed for "${companyToken}": ${res.status} ${res.statusText}`,
        );
      }

      const data = await res.json();

      return data.jobs.map((job) => ({
        source: "greenhouse",
        sourceCompany: companyToken,
        sourceJobId: String(job.id),
        title: job.title,
        company: companyName,
        location: job.location?.name ?? "",
        descriptionHtml: job.content ?? "",
        sourceUrl: job.absolute_url,
        postedAt: job.first_published
          ? new Date(job.first_published)
          : new Date(),
      }));
    },
  };
}
