import type { MissionId } from "./types";

type SessionRecord = { id: MissionId };

export function mainMissionRecords<T extends SessionRecord>(records: T[]): T[] {
  return records.filter((record) => record.id !== "light-needed-to-see");
}
