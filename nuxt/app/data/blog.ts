export interface Post {
  slug: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string[];
}

export const posts: Post[] = [
  {
    slug: 'real-time-tracking',
    title: 'Real-time Package Tracking: Why It Matters',
    author: 'PackTrack Team',
    date: '2026-03-12',
    excerpt: 'A look at how live shipment status changes operations from reactive to predictive.',
    body: [
      'When every package broadcasts its position, status, and warehouse in real time, dispatchers stop chasing exceptions and start preventing them. The shift from end-of-day reporting to live event streams is the single biggest UX upgrade modern logistics teams can make.',
      'Real-time tracking also unlocks customer-facing trust. Recipients no longer rely on vague "in transit" labels — they can see the exact warehouse holding their package and the next planned hop. Studies from major carriers show that exposure to live status data reduces support tickets by up to 40%.',
      'On the operations side, live data feeds can drive automatic re-routing, capacity rebalancing, and SLA alerts. The dashboard you build today is the autopilot you trust tomorrow.',
    ],
  },
  {
    slug: 'warehouse-capacity',
    title: 'Optimizing Warehouse Capacity Utilization',
    author: 'Logistics Insights',
    date: '2026-02-28',
    excerpt:
      'Three heuristics to keep utilization above 70% without spiking past 95% and breaking flow.',
    body: [
      'A warehouse running at 50% utilization is bleeding rent; one running at 95% is bleeding throughput. The healthy zone sits between 70% and 90% — high enough to amortize fixed costs, low enough to absorb daily variance.',
      "First heuristic: rolling-window forecasting. Use the last 14 days of inbound + outbound flow to predict tomorrow's peak load. Pre-stage staff and pallet positions accordingly.",
      'Second: dynamic zoning. The hot SKUs of last quarter are not the hot SKUs of next quarter. Re-rank zone assignments monthly using a simple ABC analysis on movement frequency.',
      'Third: capacity-aware routing. When a hub crosses 90% utilization, the dispatch system should automatically prefer alternate hubs for the next batch of inbounds. The dashboard makes this decision visible — the operator just clicks accept.',
    ],
  },
  {
    slug: 'multi-hub-logistics',
    title: 'Best Practices for Multi-Hub Logistics',
    author: 'PackTrack Team',
    date: '2026-01-18',
    excerpt:
      'Coordinating shipments across two or more hubs requires consistent state, not just connected systems.',
    body: [
      'A single warehouse is easy. Two warehouses is hard. Five warehouses without a coherent state model is a daily firefight. The transition from one-hub to multi-hub logistics is where most operational software starts to fall apart.',
      'The first invariant is package identity. Each package needs a single source-of-truth ID that never changes as it moves between hubs. Logs are appended, not rewritten. The package-log entity that tracks fromWarehouse and toWarehouse on every transfer is what makes a multi-hub network legible.',
      'The second invariant is hub independence. Each hub should be able to ingest, store, and dispatch without coordination from a central server. Synchronization happens after the fact — eventual consistency, not strong consistency. The package log is the thing that converges.',
      'Finally, never expose hub topology to the customer. They asked where their package is, not which warehouse it currently sleeps in. Translate internal hub state into human-friendly status messages.',
    ],
  },
];
