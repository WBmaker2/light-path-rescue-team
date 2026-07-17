import type { MissionDefinition } from "./types";

export function predictionMatchesObservation(mission: MissionDefinition, predictionId: string, setupId: string) {
  return mission.predictions.find((choice) => choice.id === predictionId)?.matchingSetupIds?.includes(setupId) ?? false;
}
