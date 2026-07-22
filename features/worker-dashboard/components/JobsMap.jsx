"use client";

import PullMap from "../../dashboard/components/pull-map";

export default function JobsMap(props) {
  const items = props.jobs.map((job) => ({
    id: String(job.id),
    coordinates: job.coordinates,
    title: job.role,
    subtitle: `${job.company} · ${job.distance}`,
    value: job.pay,
  }));

  return (
    <PullMap
      items={items}
      radius={props.radius}
      focusRequest={props.focusRequest}
      onSelectItem={(id) => {
        const job = props.jobs.find((item) => String(item.id) === id);
        if (job) props.onSelectJob(job);
      }}
    />
  );
}
