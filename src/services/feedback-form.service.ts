// Service -- Google Forms feedback URL builder with pre-filled name, roll number, and device info
import { useProfileStore } from "@/stores/profile.store";

const FORM_BASE =
  "https://docs.google.com/forms/d/e/1FAIpQLSc-fEhoV6BB0sK56eb0Gq4BvVquugq_zS3g2PuGorsW7Y5Npw/viewform";

const ENTRY = {
  name: "entry.208660685",
  rollNo: "entry.1362474066",
  device: "entry.656914191",
};

function getDeviceSummary(): string {
  const ua = navigator.userAgent;

  const android = ua.match(/Android[\s/]([\d.]+)/)?.[1];
  const ios = ua.match(/iPhone OS ([\d_]+)/)?.[1];
  const windows = ua.match(/Windows NT ([\d.]+)/);
  const mac = ua.match(/Mac OS X ([\d_]+)/);

  const chrome = ua.match(/Chrome\/([\d.]+)/)?.[1];
  const safari = ua.match(/Version\/([\d.]+).*Safari/)?.[1];
  const firefox = ua.match(/Firefox\/([\d.]+)/)?.[1];
  const edge = ua.match(/Edg\/([\d.]+)/)?.[1];

  let os = "Unknown OS";
  if (android) os = `Android ${android}`;
  else if (ios) os = `iOS ${ios.replace(/_/g, ".")}`;
  else if (windows) os = "Windows";
  else if (mac) os = "macOS";

  let browser = "Unknown browser";
  if (edge) browser = `Edge ${edge.split(".")[0]}`;
  else if (chrome) browser = `Chrome ${chrome.split(".")[0]}`;
  else if (firefox) browser = `Firefox ${firefox.split(".")[0]}`;
  else if (safari) browser = `Safari ${safari.split(".")[0]}`;

  return `${os}, ${browser}`;
}

export function openFeedbackForm() {
  const profile = useProfileStore();

  const params = new URLSearchParams({
    [ENTRY.name]: profile.profile?.name ?? "",
    [ENTRY.rollNo]: profile.profile?.roll_no ?? "",
    [ENTRY.device]: getDeviceSummary(),
  });

  window.open(`${FORM_BASE}?${params.toString()}`, "_blank");
}
