# Nova Scanner v2 — Active-First Research Branch

Status: scaffold for testing; not wired into live execution.

## Goal

Use limited scan/API capacity on candidates where a move **is starting**, then spend remaining capacity on developing/maybe setups. Discover price behavior first; decide between shares/options later.

## Priority buckets

1. **ACTIVE** — movement has begun, evidence confirms it, and price is not excessively extended.
2. **DEVELOPING** — promising structure but missing confirmation; revisit only after ACTIVE candidates.
3. **BACKGROUND** — log for research/outcome tracking; no scarce enrichment calls unless promoted.

## First-pass inputs

Designed to work without options data so the same core can run premarket:

- price acceleration / short-window momentum
- relative-volume level and acceleration
- proximity to / break of recent high, resistance, or range boundary
- VWAP relationship when session data supports it
- dollar-volume / liquidity floor
- extension penalty so late vertical moves are demoted
- market/sector alignment when available
- overnight gap and overnight/premarket volume

## Options enrichment

Only after the underlying survives the first pass:

- bid/ask spread quality
- option volume and open interest
- volume/OI
- IV and IV change
- strike concentration
- expiration / delta / distance from strike

A strong underlying setup may therefore resolve to SHARES, OPTIONS, or NO TRADE downstream.

## Candidate contract

```ts
type ScannerStage = "ACTIVE" | "DEVELOPING" | "BACKGROUND";

type ScannerCandidate = {
  symbol: string;
  observedAt: string;
  session: "overnight" | "premarket" | "regular" | "afterhours";
  stage: ScannerStage;
  score: number; // setup-strength score, not predicted return probability
  reasonCodes: string[];
  metrics: {
    priceChangePct?: number;
    momentum5mPct?: number;
    momentum15mPct?: number;
    relativeVolume?: number;
    relativeVolumeAcceleration?: number;
    dollarVolume?: number;
    distanceFromVwapPct?: number;
    distanceFromBreakoutPct?: number;
    overnightGapPct?: number;
    extensionPct?: number;
  };
  enrichment?: {
    optionsRequested: boolean;
    optionsQuality?: "GOOD" | "MIXED" | "POOR";
    catalystRequested: boolean;
    patternRequested: boolean;
    predictionRequested: boolean;
  };
};
```

## Reason codes v0

- PRICE_ACCEL
- RVOL_HIGH
- RVOL_ACCEL
- BREAKOUT_NEAR
- BREAKOUT_CONFIRMED
- VWAP_HOLD
- VWAP_RECLAIM
- OVERNIGHT_GAP
- OVERNIGHT_HOLD
- MARKET_ALIGNED
- SECTOR_ALIGNED
- LIQUID
- OPTIONS_FLOW
- CATALYST
- EXTENDED
- ILLIQUID
- WIDE_SPREAD

## Promotion logic — initial test defaults

Thresholds below are intentionally provisional and must be tuned with replay/backtests before live use.

ACTIVE should require:
- minimum liquidity passes;
- at least one movement signal (PRICE_ACCEL / BREAKOUT_CONFIRMED / VWAP_RECLAIM);
- at least one confirmation signal (RVOL_HIGH / RVOL_ACCEL / OVERNIGHT_HOLD / MARKET_ALIGNED);
- no hard rejection such as ILLIQUID;
- extension penalty below the late-chase threshold.

DEVELOPING:
- has structure/momentum evidence but lacks one ACTIVE confirmation;
- queued behind ACTIVE candidates and rescanned only if budget remains.

BACKGROUND:
- all other observed names;
- logged so rejected candidates can be outcome-tested later.

## Scan-budget policy

1. Cheap underlying scan across the available universe.
2. Rank ACTIVE candidates first.
3. Enrich ACTIVE candidates with scarce calls.
4. If budget remains, rescan/enrich highest DEVELOPING candidates.
5. Persist all candidates and their rejection/promotion reasons.
6. Never spend options-chain calls in premarket when options data is unavailable.

## Duplicate/noise control

Use a symbol + setup-state cooldown. Do not emit another alert unless:
- stage changes;
- score changes materially;
- a new reason code appears/disappears;
- breakout/VWAP state changes;
- cooldown expires.

## Downstream handoff

Scanner does **not** predict returns.

ACTIVE survivors are handed to:
1. Pattern/Analog Analyzer — historical comparable setups and realized outcomes.
2. Prediction Analyzer — scenario estimates using current + analog evidence.
3. Instrument/Risk Filter — shares vs options vs no trade.
4. Nova final review.

Predictions must be stored separately from realized outcomes so model opinions never become training labels.

## Outcome fields to persist

For ACTIVE, DEVELOPING, and rejected candidates where data is available:

- +30 minute return
- +60 minute return
- regular-session close return
- next-session return
- maximum favorable excursion
- maximum adverse excursion
- whether breakout held/failed
- eventual stage transitions

## First test plan

- Replay historical sessions with the same scan budget we actually have.
- Compare old scanner output vs ACTIVE-first output.
- Measure: candidates surfaced before move, false positives, time-to-detection, API calls per useful candidate, and missed moves.
- Tune thresholds only on the development sample.
- Freeze thresholds and test on a separate out-of-sample period.
- Keep this branch research-only until those results are acceptable.
