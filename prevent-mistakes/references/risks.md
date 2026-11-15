# Risk prompts

Read only the sections the change touches. Each section says when it applies, what to look for, and a check that would catch the failure. A risk you cannot tie to code, tests, or history stays labeled **assumed**.

## Compatibility

Applies when: changing a function signature, exported name, CLI flag, config key, file or wire format, database schema, HTTP route, or default value.

Look for: every caller (search the name, re-exports, string-based lookups such as reflection, routes, env vars); serialized data already on disk or in flight; consumers outside the repo (published package, API clients).

Check: type-check or build all callers; a test that reads the old format; a deprecation path when outside consumers exist.

## State ownership

Applies when: two places write the same state, a cache shadows a source, a list is kept in sync by hand, or a value is copied then mutated.

Look for: who creates, mutates, and invalidates the state; duplicated sources of truth; mutation of shared references (default arguments, module-level objects, props).

Check: a test that mutates through one path and reads through the other; prefer giving the state one owner over syncing two.

## Async ordering and cancellation

Applies when: callbacks, promises, futures, threads, goroutines, event handlers, timers, retries, or subscriptions are involved.

Look for:
- stale results: an older request resolving after a newer one and overwriting it
- missing cancellation: work continuing after the user navigated away, the component unmounted, or the request was superseded
- unawaited work: floating promises, fire-and-forget tasks whose errors vanish
- races on shared state; check-then-act without a lock or atomic operation
- cleanup: listeners, timers, sockets, and tasks released on every exit path

Fix with explicit ordering: a request token or generation counter, an abort signal, structured concurrency, a lock. Sleeps and arbitrary delays hide races without removing them.

Check: control resolution order deterministically (deferred promises, fake clocks, channels you release by hand), resolve the older request last, assert the newer result wins and the older one is discarded or cancelled.

## Error handling

Applies when: adding or changing try/catch, error returns, retries, fallbacks, default values on failure, or logging.

Look for: caught-and-ignored errors; a fallback that turns an outage into wrong data; retries without a bound; error types callers rely on; partial writes left after a failure.

Check: a test that injects the failure and asserts it surfaces (raised, returned, or reported) with useful context.

## Security boundaries

Applies when: input crosses a trust boundary (user, network, file, environment, another service), or the change touches auth, permissions, secrets, paths, queries, shell commands, or HTML output.

Look for: validation moved or skipped; string-built queries, commands, or paths; secrets in logs or errors; authorization checked at one entry point but not a sibling one.

Check: a test with hostile input (traversal path, injection string, unauthorized user) that must be rejected.

## Performance

Applies when: the change sits in a hot path, loops over data that grows, adds I/O inside a loop, or the task claims a speed-up.

Look for: N+1 queries, quadratic loops, unbounded memory, synchronous I/O on a latency-sensitive thread, lost caching.

Check: a measurement on a realistic workload before and after, on the same machine, repeated enough to see noise. Without a measurement, report the performance effect as unverified.
