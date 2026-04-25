import { notFound } from "next/navigation";
import { auth } from "../../../auth";
import { getSchedulesByUser } from "../../../lib/schedule-service";
import { getChoreographiesByUser } from "../../../lib/choreography-service";
import { ScheduleClient } from "./ScheduleClient";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [schedules, choreographies] = await Promise.all([
    getSchedulesByUser(session.user.id),
    getChoreographiesByUser(session.user.id),
  ]);

  return (
    <ScheduleClient
      initialSchedules={schedules}
      choreographies={choreographies}
    />
  );
}
