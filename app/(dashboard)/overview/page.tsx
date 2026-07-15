"use client";

import { useState, useEffect } from "react";
import OverviewTab from "@/components/dashboard/OverviewTab";
import { API, ANALYTICS_API } from "@/lib/types";
import type { Article, GeoEntry, DeviceEntry } from "@/lib/types";

export default function OverviewPage() {
  const [articles, setArticles]     = useState<Article[]>([]);
  const [geoData, setGeoData]       = useState<GeoEntry[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceEntry[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(API).then((r) => r.json()).catch(() => []),
      fetch(`${ANALYTICS_API}/geo`).then((r) => r.json()).catch(() => []),
      fetch(`${ANALYTICS_API}/devices`).then((r) => r.json()).catch(() => []),
    ]).then(([arts, geo, devices]) => {
      setArticles(arts as Article[]);
      if (Array.isArray(geo) && geo.length > 0)     setGeoData(geo as GeoEntry[]);
      if (Array.isArray(devices) && devices.length > 0) setDeviceData(devices as DeviceEntry[]);
      setLoading(false);
    });
  }, []);

  return (
    <OverviewTab
      articles={articles}
      loading={loading}
      geoData={geoData}
      deviceData={deviceData}
    />
  );
}
