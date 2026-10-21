import type { Category, Pattern } from "./types";

export const categories: { name: Category; blurb: string }[] = [
  { name: "Resiliency", blurb: "Keep working when the things you depend on don't." },
  { name: "Data", blurb: "Store, split and read data at scale without fighting it." },
  { name: "Messaging", blurb: "Let services talk without waiting on each other." },
  { name: "Traffic & edge", blurb: "Control what reaches your services, and how fast." },
  { name: "Structure & migration", blurb: "Shape systems so they can change safely over time." },
];

export const patterns: Pattern[] = [
  {
    slug: "circuit-breaker",
    name: "Circuit Breaker",
    category: "Resiliency",
    summary: "Stop calling a failing service so it can recover, and fail fast instead of hanging.",
    problem:
      "When a downstream service slows down or fails, callers keep sending requests and waiting on timeouts. Threads and connections pile up, and one sick service drags the whole system down with it.",
    solution: [
      "Wrap remote calls in a proxy that counts failures. While failures stay under a threshold the breaker is closed and calls pass through.",
      "Once the threshold is crossed the breaker opens: calls fail immediately with a fallback, without touching the struggling service. After a cool-down it goes half-open and lets a few trial calls through. If they succeed it closes again; if not, it reopens.",
    ],
    steps: [
      "Closed: requests flow normally and failures are counted in a rolling window.",
      "Failure rate crosses the threshold, so the breaker trips to Open.",
      "Open: every call returns the fallback instantly for the cool-down period.",
      "Half-open: a small number of trial requests are allowed through.",
      "Trials succeed and the breaker closes, or fail and it opens again.",
    ],
    useWhen: [
      "You call remote services that can fail for longer than a single retry would cover.",
      "A slow dependency could exhaust threads, connections or memory in the caller.",
      "You have a sensible fallback: cached data, a default, or a clear error.",
    ],
    avoidWhen: [
      "The resource is local and in-memory; the overhead buys you nothing.",
      "You need it as a substitute for fixing exceptions in your own business logic.",
    ],
    services: {
      aws: "Envoy or Resilience4j on ECS/EKS; Lambda with function-level error handling",
      azure: "Polly in .NET apps; Azure API Management circuit breaker on backends",
      gcp: "Cloud Service Mesh (Envoy outlier detection)",
      openSource: "Resilience4j, Polly, Istio, Envoy",
    },
    related: ["retry", "bulkhead", "sidecar"],
    diagram: {
      nodes: [
        { id: "c", label: "Caller", x: 90, y: 150, kind: "client" },
        { id: "b", label: "Breaker", note: "closed, open, half-open", x: 300, y: 150, kind: "gateway" },
        { id: "s", label: "Inventory API", note: "failing", x: 530, y: 90, kind: "faulty" },
        { id: "f", label: "Fallback", note: "cached result", x: 530, y: 220, kind: "store" },
      ],
      edges: [
        { from: "c", to: "b", flow: true },
        { from: "b", to: "s", label: "tripped", dashed: true, flow: true, tone: "fault" },
        { from: "b", to: "f", label: "fail fast", flow: true },
      ],
    },
  },
  {
    slug: "retry",
    name: "Retry with Backoff",
    category: "Resiliency",
    summary: "Repeat a failed call after a growing, jittered delay to ride out brief glitches.",
    problem:
      "Cloud networks and managed services have short, transient faults: a dropped connection, a throttled request, a node being replaced. Treating every one of these as a hard failure makes your app look far less reliable than its dependencies.",
    solution: [
      "Retry operations that fail with errors known to be transient, such as timeouts, HTTP 429 and 503. Wait longer between each attempt (exponential backoff) and add randomness (jitter) so thousands of clients don't retry in lockstep.",
      "Cap the number of attempts and the total time, and make sure the operation is idempotent so a repeated call can't charge a card twice.",
    ],
    steps: [
      "Call the service.",
      "On a transient error, wait base × 2ⁿ plus random jitter.",
      "Try again, up to the attempt limit.",
      "Give up and surface the error, or hand over to a circuit breaker.",
    ],
    useWhen: [
      "Faults are short-lived and likely to clear within seconds.",
      "The operation is idempotent, or you send an idempotency key.",
    ],
    avoidWhen: [
      "The failure is permanent, such as a 400 or a validation error.",
      "Retries at several layers would multiply into a retry storm.",
      "A user is waiting and a fast failure is more useful than a slow success.",
    ],
    services: {
      aws: "Built into the AWS SDKs (standard and adaptive retry modes); Step Functions Retry",
      azure: "Built-in retry policies in Azure SDKs; Durable Functions retry options",
      gcp: "Google Cloud client libraries retry settings; Cloud Tasks retry config",
      openSource: "Polly, Resilience4j, tenacity (Python), p-retry (Node)",
    },
    related: ["circuit-breaker", "queue-load-leveling"],
    diagram: {
      nodes: [
        { id: "c", label: "Client", x: 90, y: 150, kind: "client" },
        { id: "r", label: "Retry policy", note: "1s → 2s → 4s + jitter", x: 310, y: 150, kind: "gateway" },
        { id: "s", label: "Payments API", note: "503 then 200", x: 535, y: 150, kind: "service" },
      ],
      edges: [
        { from: "c", to: "r", flow: true },
        { from: "r", to: "s", label: "attempt n", flow: true },
      ],
    },
  },
  {
    slug: "bulkhead",
    name: "Bulkhead",
    category: "Resiliency",
    summary: "Isolate resources into separate pools so one failure can't sink everything.",
    problem:
      "If every feature shares one thread pool, connection pool or cluster, a single slow dependency can consume all of it. Unrelated features then fail too, even though nothing is wrong with them.",
    solution: [
      "Partition resources the way a ship's hull is divided into watertight compartments. Give each dependency or tenant its own pool with its own limits.",
      "When one pool is saturated, its callers are rejected quickly while the other pools carry on serving traffic.",
    ],
    steps: [
      "Identify consumers or dependencies that should not affect each other.",
      "Give each one a bounded pool: threads, connections, instances or a whole deployment.",
      "Reject or queue work when a pool is full instead of borrowing from others.",
    ],
    useWhen: [
      "Some dependencies are less reliable than others.",
      "You serve multiple tenants or priorities and want to protect the important ones.",
    ],
    avoidWhen: [
      "The system is small enough that separate pools mostly waste capacity.",
    ],
    services: {
      aws: "Separate ECS services or EKS node groups; Lambda reserved concurrency per function",
      azure: "Separate App Service plans or AKS node pools",
      gcp: "Separate GKE node pools; Cloud Run max instances per service",
      openSource: "Resilience4j Bulkhead, Polly Bulkhead, Kubernetes resource quotas",
    },
    related: ["circuit-breaker", "throttling"],
    diagram: {
      nodes: [
        { id: "c", label: "API", x: 90, y: 150, kind: "client" },
        { id: "p1", label: "Pool A", note: "10 threads", x: 300, y: 70, kind: "gateway" },
        { id: "p2", label: "Pool B", note: "10 threads", x: 300, y: 230, kind: "gateway" },
        { id: "s1", label: "Reports", note: "slow", x: 530, y: 70, kind: "faulty" },
        { id: "s2", label: "Checkout", note: "healthy", x: 530, y: 230, kind: "service" },
      ],
      edges: [
        { from: "c", to: "p1", flow: true },
        { from: "c", to: "p2", flow: true },
        { from: "p1", to: "s1", dashed: true, flow: true, tone: "fault" },
        { from: "p2", to: "s2", flow: true },
      ],
    },
  },
  {
    slug: "throttling",
    name: "Rate Limiting",
    category: "Traffic & edge",
    summary: "Cap how much any one client can ask for, so the system stays up for everyone.",
    problem:
      "Traffic spikes, buggy clients and abusive users can send far more requests than your backend can handle. Without a limit, a single noisy caller can degrade service for all the others.",
    solution: [
      "Enforce a request budget per client, key or tenant, usually with a token bucket or sliding window. Requests within the budget pass; the rest receive HTTP 429 with a Retry-After header.",
      "Apply the limit as close to the edge as possible, so rejected traffic costs you almost nothing.",
    ],
    steps: [
      "Identify the caller by API key, user or IP address.",
      "Take a token from that caller's bucket.",
      "If a token was available, forward the request.",
      "If the bucket is empty, return 429 and tell the client when to retry.",
    ],
    useWhen: [
      "You expose a public or partner API.",
      "Backend capacity is fixed or expensive to scale quickly.",
      "You sell tiers with different usage allowances.",
    ],
    avoidWhen: [
      "Traffic is internal and already shaped by a queue.",
    ],
    services: {
      aws: "Amazon API Gateway usage plans and throttling; AWS WAF rate-based rules",
      azure: "Azure API Management rate-limit and quota policies",
      gcp: "Apigee quotas; Cloud Armor rate limiting",
      openSource: "NGINX limit_req, Envoy rate limit service, Redis-backed limiters",
    },
    related: ["gateway", "bulkhead", "queue-load-leveling"],
    diagram: {
      nodes: [
        { id: "u1", label: "Client A", x: 90, y: 80, kind: "client" },
        { id: "u2", label: "Client B", note: "too many calls", x: 90, y: 220, kind: "client" },
        { id: "l", label: "Rate limiter", note: "token bucket", x: 320, y: 150, kind: "gateway" },
        { id: "s", label: "Orders API", x: 540, y: 150, kind: "service" },
      ],
      edges: [
        { from: "u1", to: "l", flow: true },
        { from: "u2", to: "l", label: "429", flow: true, tone: "fault" },
        { from: "l", to: "s", flow: true },
      ],
    },
  },
  {
    slug: "cache-aside",
    name: "Cache-Aside",
    category: "Data",
    summary: "Load data into a cache on demand and read from it first to cut database load.",
    problem:
      "Reading the same data from the primary database again and again is slow and expensive, and the database becomes the bottleneck long before the app servers do.",
    solution: [
      "The application checks the cache first. On a hit it uses the cached value. On a miss it reads from the database, writes the result into the cache with an expiry, and returns it.",
      "On writes, update the database and then invalidate the cached entry so the next read refreshes it.",
    ],
    steps: [
      "Look the key up in the cache.",
      "Hit: return the cached value.",
      "Miss: read from the database.",
      "Store the result in the cache with a TTL, then return it.",
    ],
    useWhen: [
      "Reads far outnumber writes.",
      "Slightly stale data is acceptable for a short time.",
    ],
    avoidWhen: [
      "Data changes constantly and must always be exact.",
      "The working set is too large or too random to get a useful hit rate.",
    ],
    services: {
      aws: "Amazon ElastiCache (Valkey, Redis OSS or Memcached); DynamoDB Accelerator (DAX)",
      azure: "Azure Managed Redis",
      gcp: "Memorystore for Valkey or Redis",
      openSource: "Valkey, Redis, Memcached",
    },
    related: ["cqrs", "sharding"],
    diagram: {
      nodes: [
        { id: "a", label: "App", x: 90, y: 150, kind: "client" },
        { id: "c", label: "Cache", note: "TTL 5 min", x: 330, y: 70, kind: "store" },
        { id: "d", label: "Database", x: 330, y: 230, kind: "store" },
      ],
      edges: [
        { from: "a", to: "c", label: "1. read", flow: true },
        { from: "a", to: "d", label: "2. on miss", dashed: true, flow: true },
        { from: "d", to: "c", label: "3. populate", dashed: true },
      ],
    },
  },
  {
    slug: "cqrs",
    name: "CQRS",
    category: "Data",
    summary: "Use separate models for writing data and reading it, each shaped for its job.",
    problem:
      "One data model serving both writes and complex queries ends up as a compromise. Writes need validation and consistency; reads need denormalised views and joins. Contention between the two hurts both.",
    solution: [
      "Command Query Responsibility Segregation splits the system in two. Commands change state through a write model that enforces rules. Queries read from one or more read models built for the screens and reports that use them.",
      "The read side is kept up to date from events or change streams, so it is usually eventually consistent.",
    ],
    steps: [
      "A command arrives and is validated by the write model.",
      "The change is stored and an event is published.",
      "Projectors consume the event and update read models.",
      "Queries are answered from the read models only.",
    ],
    useWhen: [
      "Read and write loads are very different in shape or volume.",
      "Several teams or screens need differently shaped views of the same data.",
      "You already use event sourcing.",
    ],
    avoidWhen: [
      "The domain is simple CRUD; CQRS adds moving parts for little gain.",
      "Users must always read their own writes instantly and you can't design around it.",
    ],
    services: {
      aws: "DynamoDB with DynamoDB Streams feeding Amazon OpenSearch Service",
      azure: "Azure Cosmos DB change feed feeding Azure AI Search or a read container",
      gcp: "Firestore or Spanner change streams feeding BigQuery",
      openSource: "Axon Framework, Debezium, Kafka",
    },
    related: ["event-sourcing", "pub-sub", "cache-aside"],
    diagram: {
      nodes: [
        { id: "u", label: "Client", x: 80, y: 150, kind: "client" },
        { id: "w", label: "Command API", x: 270, y: 70, kind: "service" },
        { id: "r", label: "Query API", x: 270, y: 230, kind: "service" },
        { id: "ws", label: "Write store", x: 500, y: 70, kind: "store" },
        { id: "rs", label: "Read model", note: "denormalised", x: 500, y: 230, kind: "store" },
      ],
      edges: [
        { from: "u", to: "w", label: "commands", flow: true },
        { from: "u", to: "r", label: "queries" },
        { from: "w", to: "ws", flow: true },
        { from: "ws", to: "rs", label: "events", dashed: true, flow: true },
        { from: "r", to: "rs" },
      ],
    },
  },
  {
    slug: "event-sourcing",
    name: "Event Sourcing",
    category: "Data",
    summary: "Store every change as an immutable event, and rebuild state by replaying them.",
    problem:
      "A normal table only holds the latest state. You lose the history of how it got there, which matters for audits, debugging and building new views of old data.",
    solution: [
      "Instead of updating rows, append events such as OrderPlaced or ItemRemoved to an append-only log. The current state of an entity is the result of replaying its events in order.",
      "Snapshots speed up replay for long-lived entities, and projections turn the event stream into queryable views.",
    ],
    steps: [
      "Load past events for the entity (or the latest snapshot plus newer events).",
      "Replay them to get the current state.",
      "Validate the command against that state.",
      "Append the new event to the log and publish it.",
    ],
    useWhen: [
      "You need a full audit trail, such as for finance or healthcare records.",
      "You want to rebuild or add read models from historical data.",
    ],
    avoidWhen: [
      "The domain is simple and history has no business value.",
      "The team is new to eventual consistency and schema versioning of events.",
    ],
    services: {
      aws: "Amazon Kinesis Data Streams or Amazon MSK; DynamoDB as an append-only store",
      azure: "Azure Event Hubs; Azure Cosmos DB with change feed",
      gcp: "Pub/Sub with Bigtable or Spanner as the event store",
      openSource: "EventStoreDB (KurrentDB), Apache Kafka, Marten",
    },
    related: ["cqrs", "pub-sub", "saga"],
    diagram: {
      nodes: [
        { id: "c", label: "Order service", x: 100, y: 150, kind: "service" },
        { id: "l", label: "Event log", note: "append-only", x: 320, y: 150, kind: "queue" },
        { id: "p1", label: "Orders view", x: 540, y: 70, kind: "store" },
        { id: "p2", label: "Audit report", x: 540, y: 230, kind: "store" },
      ],
      edges: [
        { from: "c", to: "l", label: "append", flow: true },
        { from: "l", to: "p1", label: "project", flow: true },
        { from: "l", to: "p2", label: "replay", dashed: true, flow: true },
      ],
    },
  },
  {
    slug: "sharding",
    name: "Sharding",
    category: "Data",
    summary: "Split a dataset across many databases by a key, so each holds only a slice.",
    problem:
      "A single database server has limits on storage, connections and write throughput. Scaling it up gets expensive, and eventually there's no bigger machine to buy.",
    solution: [
      "Partition data horizontally by a shard key such as tenant ID or a hash of user ID. Each shard is an independent database holding a subset of rows.",
      "A routing layer, or the client library, maps each key to its shard. Choose a key that spreads load evenly and keeps related data together.",
    ],
    steps: [
      "Pick a shard key that matches your main access pattern.",
      "Hash or range-map the key to a shard.",
      "Route each read and write to that shard.",
      "Rebalance by splitting or moving shards as data grows.",
    ],
    useWhen: [
      "Data or write volume has outgrown a single node.",
      "Most queries can be answered from one key's data.",
    ],
    avoidWhen: [
      "Queries often join or aggregate across all data.",
      "A managed service already partitions for you and you haven't hit its limits.",
    ],
    services: {
      aws: "DynamoDB partition keys; Aurora Limitless Database",
      azure: "Azure Cosmos DB partition keys; Azure Database for PostgreSQL elastic clusters (Citus)",
      gcp: "Spanner and Bigtable (automatic splitting by key range)",
      openSource: "Citus, Vitess, MongoDB sharding",
    },
    related: ["cache-aside", "cqrs"],
    diagram: {
      nodes: [
        { id: "a", label: "App", x: 90, y: 150, kind: "client" },
        { id: "r", label: "Shard router", note: "hash(user_id)", x: 300, y: 150, kind: "gateway" },
        { id: "s1", label: "Shard A–H", x: 530, y: 55, kind: "store" },
        { id: "s2", label: "Shard I–P", x: 530, y: 150, kind: "store" },
        { id: "s3", label: "Shard Q–Z", x: 530, y: 245, kind: "store" },
      ],
      edges: [
        { from: "a", to: "r", flow: true },
        { from: "r", to: "s1" },
        { from: "r", to: "s2", flow: true },
        { from: "r", to: "s3" },
      ],
    },
  },
  {
    slug: "pub-sub",
    name: "Publisher–Subscriber",
    category: "Messaging",
    summary: "Broadcast events to any number of interested services without knowing who they are.",
    problem:
      "When one service has to call every other service that cares about an event, it becomes tightly coupled to all of them. Adding a new consumer means changing and redeploying the producer.",
    solution: [
      "The publisher sends each event once to a topic. A message broker delivers a copy to every subscription on that topic.",
      "Subscribers can be added or removed without the publisher noticing, and each processes messages at its own pace.",
    ],
    steps: [
      "The publisher emits an event to a topic.",
      "The broker fans out a copy to each subscription.",
      "Each subscriber processes and acknowledges its copy independently.",
    ],
    useWhen: [
      "Several services react to the same event.",
      "You want producers and consumers to evolve and scale separately.",
    ],
    avoidWhen: [
      "You need a direct, synchronous answer from one specific service.",
      "Strict global ordering across all consumers is required.",
    ],
    services: {
      aws: "Amazon SNS; Amazon EventBridge",
      azure: "Azure Service Bus topics; Azure Event Grid",
      gcp: "Google Cloud Pub/Sub; Eventarc",
      openSource: "Apache Kafka, RabbitMQ, NATS",
    },
    related: ["queue-load-leveling", "event-sourcing", "saga"],
    diagram: {
      nodes: [
        { id: "p", label: "Order service", x: 100, y: 150, kind: "service" },
        { id: "t", label: "order.placed", note: "topic", x: 310, y: 150, kind: "queue" },
        { id: "s1", label: "Email", x: 535, y: 55, kind: "service" },
        { id: "s2", label: "Inventory", x: 535, y: 150, kind: "service" },
        { id: "s3", label: "Analytics", x: 535, y: 245, kind: "service" },
      ],
      edges: [
        { from: "p", to: "t", label: "publish", flow: true },
        { from: "t", to: "s1", flow: true },
        { from: "t", to: "s2", flow: true },
        { from: "t", to: "s3", flow: true },
      ],
    },
  },
  {
    slug: "queue-load-leveling",
    name: "Queue-Based Load Leveling",
    category: "Messaging",
    summary: "Put a queue between bursty callers and a service so it works at a steady pace.",
    problem:
      "Traffic arrives in spikes, but the service behind it has a fixed throughput. During a burst it gets overwhelmed and starts timing out, even though average load is fine.",
    solution: [
      "Callers drop work onto a durable queue and return right away. Workers pull messages at the rate they can handle.",
      "The queue absorbs the spike; queue depth becomes the signal to scale workers out or back in.",
    ],
    steps: [
      "Producer enqueues a message and responds to the user immediately.",
      "Workers poll the queue and process messages at a steady rate.",
      "Failed messages are retried, then moved to a dead-letter queue.",
      "Queue depth drives autoscaling of the workers.",
    ],
    useWhen: [
      "Work can happen a few seconds or minutes after the request.",
      "Load is bursty and the backend is slow or costly to scale.",
    ],
    avoidWhen: [
      "The caller needs the result in the same request.",
    ],
    services: {
      aws: "Amazon SQS with Lambda or ECS workers",
      azure: "Azure Queue Storage or Service Bus queues with Azure Functions",
      gcp: "Cloud Tasks; Pub/Sub pull subscriptions with Cloud Run",
      openSource: "RabbitMQ, BullMQ, KEDA for queue-based autoscaling",
    },
    related: ["pub-sub", "throttling", "retry"],
    diagram: {
      nodes: [
        { id: "u", label: "Web tier", note: "bursty", x: 90, y: 150, kind: "client" },
        { id: "q", label: "Queue", note: "+ dead-letter", x: 310, y: 150, kind: "queue" },
        { id: "w1", label: "Worker", x: 535, y: 85, kind: "service" },
        { id: "w2", label: "Worker", x: 535, y: 215, kind: "service" },
      ],
      edges: [
        { from: "u", to: "q", label: "enqueue", flow: true },
        { from: "q", to: "w1", label: "pull", flow: true },
        { from: "q", to: "w2", flow: true },
      ],
    },
  },
  {
    slug: "saga",
    name: "Saga",
    category: "Messaging",
    summary: "Run a business transaction across services as steps, with undo actions if one fails.",
    problem:
      "With a database per microservice you can't wrap an order, a payment and a shipment in one ACID transaction. Two-phase commit is slow and poorly supported in the cloud.",
    solution: [
      "Break the transaction into a sequence of local transactions, one per service. Each step publishes an event or reply that triggers the next.",
      "If a step fails, run compensating transactions for the steps that already completed, such as refunding a payment or releasing stock. Coordination can be choreographed through events or orchestrated by a central workflow.",
    ],
    steps: [
      "Create the order in a pending state.",
      "Reserve stock in the inventory service.",
      "Charge the payment; if it fails, release the stock and cancel the order.",
      "On success, confirm the order.",
    ],
    useWhen: [
      "A business process spans several services, each with its own data.",
      "Every step has a meaningful compensating action.",
    ],
    avoidWhen: [
      "Everything lives in one database; use a normal transaction.",
      "Steps can't be undone and partial completion is unacceptable.",
    ],
    services: {
      aws: "AWS Step Functions",
      azure: "Azure Durable Functions; Logic Apps",
      gcp: "Google Cloud Workflows",
      openSource: "Temporal, Camunda, MassTransit sagas",
    },
    related: ["pub-sub", "event-sourcing", "retry"],
    diagram: {
      nodes: [
        { id: "o", label: "Orchestrator", x: 100, y: 150, kind: "gateway" },
        { id: "a", label: "Orders", x: 330, y: 55, kind: "service" },
        { id: "b", label: "Inventory", x: 330, y: 150, kind: "service" },
        { id: "c", label: "Payments", note: "declined", x: 330, y: 245, kind: "faulty" },
        { id: "u", label: "Release stock", note: "compensate", x: 550, y: 150, kind: "service" },
      ],
      edges: [
        { from: "o", to: "a", label: "1", flow: true },
        { from: "o", to: "b", label: "2", flow: true },
        { from: "o", to: "c", label: "3", flow: true, tone: "fault" },
        { from: "c", to: "u", label: "undo", dashed: true, flow: true, tone: "fault" },
      ],
    },
  },
  {
    slug: "gateway",
    name: "API Gateway",
    category: "Traffic & edge",
    summary: "Give clients one entry point that routes, authenticates and shapes calls to many services.",
    problem:
      "Clients that talk to a dozen microservices directly need to know every address, handle auth for each, and make many round trips. Every internal change risks breaking them.",
    solution: [
      "Place a gateway in front of the services. It routes requests by path or host, and handles cross-cutting concerns once: TLS, authentication, rate limiting, request transformation and logging.",
      "Services stay private behind it and can be split, merged or moved without clients noticing.",
    ],
    steps: [
      "Client calls a single public endpoint.",
      "The gateway validates the token and applies limits.",
      "It routes the request to the right backend service.",
      "It returns the response, optionally reshaped for the client.",
    ],
    useWhen: [
      "You run several backend services behind one product.",
      "Mobile or web clients need a stable, simple API.",
    ],
    avoidWhen: [
      "There is only one service; a load balancer is enough.",
      "You'd put business logic in the gateway; keep it thin.",
    ],
    services: {
      aws: "Amazon API Gateway; Application Load Balancer path routing",
      azure: "Azure API Management; Azure Front Door",
      gcp: "API Gateway; Apigee",
      openSource: "Kong, Envoy Gateway, Traefik, NGINX",
    },
    related: ["throttling", "strangler-fig", "sidecar"],
    diagram: {
      nodes: [
        { id: "m", label: "Mobile", x: 85, y: 85, kind: "client" },
        { id: "w", label: "Web", x: 85, y: 215, kind: "client" },
        { id: "g", label: "Gateway", note: "auth, routing", x: 300, y: 150, kind: "gateway" },
        { id: "s1", label: "/users", x: 535, y: 55, kind: "service" },
        { id: "s2", label: "/orders", x: 535, y: 150, kind: "service" },
        { id: "s3", label: "/search", x: 535, y: 245, kind: "service" },
      ],
      edges: [
        { from: "m", to: "g", flow: true },
        { from: "w", to: "g", flow: true },
        { from: "g", to: "s1" },
        { from: "g", to: "s2", flow: true },
        { from: "g", to: "s3" },
      ],
    },
  },
  {
    slug: "strangler-fig",
    name: "Strangler Fig",
    category: "Structure & migration",
    summary: "Replace a legacy system piece by piece behind a router, instead of a risky big-bang rewrite.",
    problem:
      "Rewriting a large legacy application in one go takes years, freezes feature work, and has a high chance of failing at cut-over.",
    solution: [
      "Put a routing facade in front of the old system. Build new functionality, one feature at a time, as a new service, and switch that route to it.",
      "Over time more traffic goes to the new system until the legacy one handles nothing and can be switched off, like a strangler fig that grows around its host tree.",
    ],
    steps: [
      "Add a facade that sends all traffic to the legacy app.",
      "Rebuild one feature as a new service.",
      "Route that feature's paths to the new service.",
      "Repeat until the legacy app can be retired.",
    ],
    useWhen: [
      "You're migrating a monolith to the cloud or to microservices.",
      "The business can't pause while a rewrite happens.",
    ],
    avoidWhen: [
      "The system is small enough to replace in one step.",
      "Requests can't be intercepted at a single point.",
    ],
    services: {
      aws: "Application Load Balancer or Amazon API Gateway routing; AWS Migration Hub Refactor Spaces",
      azure: "Azure Front Door or Application Gateway path routing",
      gcp: "Cloud Load Balancing URL maps",
      openSource: "NGINX, Envoy, Kong",
    },
    related: ["gateway", "sidecar"],
    diagram: {
      nodes: [
        { id: "u", label: "Users", x: 90, y: 150, kind: "client" },
        { id: "f", label: "Facade", note: "path routing", x: 300, y: 150, kind: "gateway" },
        { id: "l", label: "Legacy monolith", note: "shrinking", x: 525, y: 80, kind: "faulty" },
        { id: "n", label: "New service", note: "/billing", x: 525, y: 220, kind: "service" },
      ],
      edges: [
        { from: "u", to: "f", flow: true },
        { from: "f", to: "l", dashed: true },
        { from: "f", to: "n", flow: true },
      ],
    },
  },
  {
    slug: "sidecar",
    name: "Sidecar",
    category: "Structure & migration",
    summary: "Run supporting features in a separate process right next to your app.",
    problem:
      "Every service needs logging, metrics, TLS, retries and config. Building these into each app, in each language, means duplicated work and inconsistent behaviour.",
    solution: [
      "Deploy a helper container alongside each application container, sharing its network and lifecycle, like a Kubernetes pod with two containers.",
      "The sidecar handles the cross-cutting concerns, so the app stays focused on business logic and can be written in any language.",
    ],
    steps: [
      "Package the shared capability as its own container.",
      "Deploy it in the same pod or task as the application.",
      "Route the app's network traffic or telemetry through it.",
    ],
    useWhen: [
      "Many services in different languages need the same platform features.",
      "You want to roll out a service mesh or telemetry without code changes.",
    ],
    avoidWhen: [
      "Latency between the app and sidecar would matter at your scale.",
      "The feature is tiny and a library would do.",
    ],
    services: {
      aws: "Amazon ECS task definitions with multiple containers; EKS pods",
      azure: "Azure Kubernetes Service; Azure Container Apps with Dapr",
      gcp: "GKE pods; Cloud Run multi-container (sidecars)",
      openSource: "Envoy, Istio, Linkerd, Dapr, OpenTelemetry Collector",
    },
    related: ["gateway", "circuit-breaker", "retry"],
    diagram: {
      nodes: [
        { id: "in", label: "Traffic", x: 85, y: 150, kind: "client" },
        { id: "sc", label: "Sidecar", note: "mTLS, metrics", x: 290, y: 150, kind: "gateway" },
        { id: "app", label: "App", x: 470, y: 150, kind: "service" },
        { id: "obs", label: "Telemetry", x: 290, y: 260, kind: "store" },
      ],
      edges: [
        { from: "in", to: "sc", flow: true },
        { from: "sc", to: "app", label: "localhost", flow: true },
        { from: "sc", to: "obs", dashed: true, flow: true },
      ],
    },
  },
];

export function getPattern(slug: string) {
  return patterns.find((p) => p.slug === slug);
}

export function patternsByCategory() {
  return categories.map((c) => ({
    ...c,
    patterns: patterns.filter((p) => p.category === c.name),
  }));
}
