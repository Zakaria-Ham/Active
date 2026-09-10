export type Tab = "home" | "schedule" | "tasks" | "map" | "settings";
export type Category = "sport" | "study" | "activity";
export type SportType = "swim" | "run" | "football" | "gym" | "hike" | "custom";
export type StudyType = "elementary" | "middle" | "high" | "uni" | "personal";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  name: string;
  description: string;
  date: string;
  place: string;
  timeStart: string;
  timeEnd: string;
  category: Category;
  sportType?: SportType;
  sportCustomName?: string;
  trailFrom?: string;
  trailTo?: string;
  studyType?: StudyType;
  priority: Priority;
  color: string;
  done: boolean;
  lat: number;
  lng: number;
}

export interface AppSettings {
  language: string;
  homeMode: "current" | "next";
  mapShowDone: boolean;
  mapShowFuture: boolean;
  startHour: number;
  accentColor: string;
  homeLatitude?: number;
  homeLongitude?: number;
  homePlace?: string;
  workLatitude?: number;
  workLongitude?: number;
  workPlace?: string;
  pitchLatitude?: number;
  pitchLongitude?: number;
  pitchPlace?: string;
}
