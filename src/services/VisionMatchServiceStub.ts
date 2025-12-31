import { IVisionMatchService, VisionMatchResult, VisionThreshold } from "./VisionMatchService";

const THRESHOLDS: Record<VisionThreshold, number> = {
  low: 0.7,
  med: 0.8,
  high: 0.88,
};

function stringHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // keep 32-bit
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function toVector(input: string, dim = 8): number[] {
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < input.length; i += 1) {
    vec[i % dim] += input.charCodeAt(i) * 0.01;
  }
  return vec;
}

function cosineLikeScore(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / Math.sqrt(magA * magB);
}

export class VisionMatchServiceStub implements IVisionMatchService {
  constructor(private readonly seed: number = Date.now()) {}

  async compare(referenceUris: string[], liveCaptureUri: string, threshold: VisionThreshold = "med"): Promise<VisionMatchResult> {
    if (referenceUris.length === 0) {
      return {
        matched: false,
        score: 0,
        bestReferenceId: null,
        thresholdUsed: threshold,
      };
    }

    const rand = seededRandom(stringHash(liveCaptureUri) + this.seed);
    const liveVec = toVector(liveCaptureUri);

    let bestScore = -1;
    let bestRef: string | null = null;

    for (const ref of referenceUris) {
      // TODO: Replace vector construction with real embeddings from vision API
      const refVec = toVector(ref);
      const base = cosineLikeScore(refVec, liveVec);
      const noise = (rand() - 0.5) * 0.05; // small deterministic jitter
      const score = Math.max(0, Math.min(1, base + noise));
      if (score > bestScore) {
        bestScore = score;
        bestRef = ref;
      }
    }

    const thresholdValue = THRESHOLDS[threshold];
    return {
      matched: bestScore >= thresholdValue,
      score: bestScore,
      bestReferenceId: bestRef,
      thresholdUsed: threshold,
    };
  }
}
