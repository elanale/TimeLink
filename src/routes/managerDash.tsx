import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/managerDash')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
  <div>Manager Dashboard</div>
  );
}
