export type RoleKind = "master" | "slave" | "trainee" | "other";

export type StationKind = "golshahr" | "tehran" | "other";

export type DayKind = "weekday" | "thursday" | "friday";

/** [گلشهر، تهران] — خالی یعنی آن سمت حرکت ندارد */
export type TimePair = [string | null, string | null];

export type TimetableBook = Record<DayKind, TimePair[]>;

export interface Trip {
  role: RoleKind;
  roleRaw: string;
  personnelId: string;
  firstName: string;
  lastName: string;
  origin: StationKind;
  originRaw: string;
  dest: StationKind;
  destRaw: string;
  time: string;
  minutes: number;
  date: string;
  sourceRow: number;
}

export interface CrewMember {
  personnelId: string;
  firstName: string;
  lastName: string;
  role: RoleKind;
  displayName: string;
}

export interface SlotAssignment {
  time: string;
  origin: StationKind;
  dest: StationKind;
  masters: CrewMember[];
  slaves: CrewMember[];
  trainees: CrewMember[];
  vacantMaster: boolean;
  vacantSlave: boolean;
  emptyNamed: boolean;
}

export interface TimetableRow {
  golTime: string | null;
  tehTime: string | null;
  section: "morning" | "midday" | "evening";
}

export interface DriverTripCell {
  time: string;
  role: RoleKind;
  origin: StationKind;
  dest: StationKind;
}

export interface DriverRow {
  personnelId: string;
  firstName: string;
  lastName: string;
  trips: DriverTripCell[];
  tripCount: number;
  unusual: boolean;
}

export interface WarningItem {
  level: "error" | "warn" | "info";
  code: string;
  message: string;
}

export interface ParseMeta {
  fileName: string;
  reportDate: string;
  processDate: string;
  userName: string;
  line: string;
  title: string;
  sheetName: string;
  rowCount: number;
}

export interface ProcessResult {
  meta: ParseMeta;
  trips: Trip[];
  dayKind: DayKind;
  weekdayName: string;
  timetableRows: TimetableRow[];
  slots: SlotAssignment[];
  drivers: DriverRow[];
  warnings: WarningItem[];
  stats: {
    tripCount: number;
    namedTripCount: number;
    driverCount: number;
    filledCrewPairs: number;
    vacantSlots: number;
    traineeCount: number;
  };
}
