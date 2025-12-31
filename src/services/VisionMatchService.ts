export type VisionThreshold = "low" | "med" | "high";

export interface VisionMatchResult {
  matched: boolean;
  score: number;
  bestReferenceId: string | null;
  thresholdUsed: VisionThreshold;
}

export interface IVisionMatchService {
  compare(referenceUris: string[], liveCaptureUri: string, threshold?: VisionThreshold): Promise<VisionMatchResult>;
}
