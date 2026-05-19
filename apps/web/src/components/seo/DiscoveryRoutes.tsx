import { Link, useParams } from 'react-router-dom';

import { SeoHead } from '../SeoHead';

type DiscoveryPageProps = {
  title: string;
  description: string;
  canonicalPath: string;
};

function DiscoveryPage({ title, description, canonicalPath }: DiscoveryPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-stone-950 text-white">
      <SeoHead title={`${title} | Eventio`} description={description} canonicalPath={canonicalPath} />
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
        <div className="max-w-3xl space-y-8">
          <Link
            to="/calendar"
            className="inline-flex rounded-full border border-white/15 px-4 py-2 text-[10px] font-black tracking-widest text-stone-300 uppercase transition-colors hover:border-white/30 hover:text-white"
          >
            Open Calendar
          </Link>
          <div className="space-y-5">
            <h1 className="text-5xl leading-none font-black tracking-tighter uppercase md:text-7xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 font-medium text-stone-400 md:text-lg">
              {description}
            </p>
          </div>
          <Link
            to="/calendar"
            className="inline-flex rounded-full bg-white px-6 py-3 text-xs font-black tracking-widest text-stone-950 uppercase transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Browse Events
          </Link>
        </div>
      </section>
    </main>
  );
}

export function HackathonsPage() {
  return (
    <DiscoveryPage
      title="Hackathons"
      description="Discover upcoming hackathons, build challenges, and developer competitions across Eventio."
      canonicalPath="/hackathons"
    />
  );
}

export function OnlineHackathonsPage() {
  return (
    <DiscoveryPage
      title="Online Hackathons"
      description="Find remote-friendly hackathons and virtual build challenges you can join from anywhere."
      canonicalPath="/hackathons/online"
    />
  );
}

export function IndiaHackathonsPage() {
  return (
    <DiscoveryPage
      title="India Hackathons"
      description="Explore upcoming hackathons, contests, and student developer events across India."
      canonicalPath="/hackathons/india"
    />
  );
}

export function AiHackathonsPage() {
  return (
    <DiscoveryPage
      title="AI Hackathons"
      description="Browse AI, ML, and data-focused hackathons for builders working on intelligent products."
      canonicalPath="/hackathons/ai"
    />
  );
}

export function Web3HackathonsPage() {
  return (
    <DiscoveryPage
      title="Web3 Hackathons"
      description="Track blockchain, crypto, and Web3 hackathons from the Eventio calendar."
      canonicalPath="/hackathons/web3"
    />
  );
}

export function PuneHackathonsPage() {
  return (
    <DiscoveryPage
      title="Pune Hackathons"
      description="Find hackathons, coding contests, and developer meetups happening around Pune."
      canonicalPath="/hackathons/pune"
    />
  );
}

export function StudentHackathonsPage() {
  return (
    <DiscoveryPage
      title="Student Hackathons"
      description="Discover student-friendly hackathons, campus build events, and beginner competitions."
      canonicalPath="/student-hackathons"
    />
  );
}

export function FreeHackathonsPage() {
  return (
    <DiscoveryPage
      title="Free Hackathons"
      description="Browse free-to-enter hackathons and no-cost developer challenges."
      canonicalPath="/free-hackathons"
    />
  );
}

export function ThisWeekPage() {
  return (
    <DiscoveryPage
      title="Events This Week"
      description="See hackathons, programming contests, and developer events happening this week."
      canonicalPath="/events/this-week"
    />
  );
}

export function ThisMonthPage() {
  return (
    <DiscoveryPage
      title="Events This Month"
      description="Plan your month with upcoming developer events, hackathons, and coding contests."
      canonicalPath="/events/this-month"
    />
  );
}

export function CategoryPage() {
  const { category = 'events' } = useParams();
  const label = category.replace(/-/g, ' ');

  return (
    <DiscoveryPage
      title={`${label} Events`}
      description={`Explore ${label} events, challenges, and opportunities on Eventio.`}
      canonicalPath={`/category/${category}`}
    />
  );
}

export function TagPage() {
  const { tag = 'developer' } = useParams();

  return (
    <DiscoveryPage
      title={`#${tag} Events`}
      description={`Find developer events and competitions tagged with ${tag}.`}
      canonicalPath={`/tag/${tag}`}
    />
  );
}

export function CityPage() {
  const { city = 'global' } = useParams();
  const label = city.replace(/-/g, ' ');

  return (
    <DiscoveryPage
      title={`${label} Events`}
      description={`Browse hackathons, contests, and developer events in ${label}.`}
      canonicalPath={`/city/${city}`}
    />
  );
}

export function CompanyPage() {
  const { company = 'company' } = useParams();
  const label = company.replace(/-/g, ' ');

  return (
    <DiscoveryPage
      title={`${label} Events`}
      description={`Discover events, hiring challenges, and developer programs from ${label}.`}
      canonicalPath={`/company/${company}`}
    />
  );
}

export function OrganizerPage() {
  const { organizer = 'organizer' } = useParams();
  const label = organizer.replace(/-/g, ' ');

  return (
    <DiscoveryPage
      title={`${label} Events`}
      description={`Explore developer events and competitions organized by ${label}.`}
      canonicalPath={`/organizer/${organizer}`}
    />
  );
}
