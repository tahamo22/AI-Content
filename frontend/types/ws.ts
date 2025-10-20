export type WSMetricMessage = {
  t: "metrics";
  speech_level?: number;
  wpm_est?: number;
  eye_contact?: number;
  posture?: number;
};
