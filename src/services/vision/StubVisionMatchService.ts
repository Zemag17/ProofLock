import { ReferencePhoto, VisionMatchResult } from "@types/domain";
import { VisionMatchService } from "./VisionMatchService";

export class StubVisionMatchService implements VisionMatchService {
  async compareLiveCapture(
    referencePhotos: ReferencePhoto[],
    livePhotoUri: string
  ): Promise<VisionMatchResult> {
    // TODO: Replace with real vision service call
    if (referencePhotos.length === 0) {
      return { matched: false, score: 0, reason: "No reference photos" };
    }

    const pseudoScore = Math.min(0.9, 0.5 + Math.random() * 0.4);
    return {
      matched: pseudoScore > 0.65,
      score: pseudoScore,
      reason: "Stubbed vision match",
    };
  }
}
