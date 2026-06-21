"use client";

import { useState, useEffect } from "react";
import OverviewTab from "@/components/dashboard/OverviewTab";
import { API } from "@/lib/types";
import type { Article } from "@/lib/types";

export default function OverviewPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data: Article[]) => { setArticles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return <OverviewTab articles={articles} loading={loading} />;
}
