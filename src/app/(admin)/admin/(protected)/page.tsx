import Link from "next/link";
import { Container } from "@/components/ui/Container";
import dbConnect from "@/lib/db/mongoose";
import Service from "@/models/Service";
import Project from "@/models/Project";
import Partner from "@/models/Partner";

export default async function AdminDashboardPage() {
  await dbConnect();

  // Fetch counts in parallel
  const [totalServices, publishedServices, totalProjects, totalPartners] =
    await Promise.all([
      Service.countDocuments({}),
      Service.countDocuments({ status: "published" }),
      Project.countDocuments({}),
      Partner.countDocuments({}),
    ]);

  const stats = [
    {
      name: "Total Services",
      value: totalServices,
      desc: "All catalog offerings",
    },
    {
      name: "Published Services",
      value: publishedServices,
      desc: "Publicly visible",
    },
    {
      name: "Total Projects",
      value: totalProjects,
      desc: "Architectural portfolio",
    },
    {
      name: "Total Partners",
      value: totalPartners,
      desc: "Associated brand logos",
    },
  ];

  const quickLinks = [
    {
      name: "Add Service",
      href: "/admin/services/new",
      desc: "Create a new service offering",
      bg: "bg-accent/10 hover:bg-accent/20 border-accent/30 text-dark",
    },
    {
      name: "Add Project",
      href: "/admin/projects/new",
      desc: "Publish a completed/ongoing work",
      bg: "bg-accent/10 hover:bg-accent/20 border-accent/30 text-dark",
    },
    {
      name: "Manage Partners",
      href: "/admin/partners",
      desc: "Upload and toggle partner logos",
      bg: "bg-dark/5 hover:bg-dark/10 border-dark/10 text-dark",
    },
    {
      name: "Company Settings",
      href: "/admin/settings",
      desc: "Edit core office metadata and info",
      bg: "bg-dark/5 hover:bg-dark/10 border-dark/10 text-dark",
    },
  ];

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage your website offerings, catalog, dynamic portfolio, and
            configurations.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm transition hover:shadow"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                {stat.name}
              </p>
              <p className="mt-2 text-3xl font-bold text-dark">{stat.value}</p>
              <p className="mt-1 text-xs text-muted/85">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-dark">Quick Actions</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col justify-between rounded-xl border p-6 transition shadow-sm ${link.bg}`}
              >
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">
                    {link.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted/90">{link.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
