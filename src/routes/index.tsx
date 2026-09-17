import { createFileRoute } from "@tanstack/react-router";
import { LoheApp } from "@/components/lohe-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <LoheApp />;
}
