import { ReferencePhoto, VisionMatchResult } from "@types/domain";

export interface VisionMatchService {
  compareLiveCapture(
    referencePhotos: ReferencePhoto[],
    livePhotoUri: string
  ): Promise<VisionMatchResult>;
}
