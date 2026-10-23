import "./LandingPage.css";

interface LandingPageProps {
  page?: string;
}

export function LandingPage({ page = "index.html" }: LandingPageProps) {
  return <iframe className="landing-frame" src={`/landing/${page}`} title="Oil Express" />;
}
