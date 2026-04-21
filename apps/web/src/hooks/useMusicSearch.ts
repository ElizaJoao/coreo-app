"use client";

import { useEffect, useRef, useState } from "react";

export type MusicSearchResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl: string;
  previewUrl: string | null;
};

type ItunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl60: string;
  previewUrl?: string;
  wrapperType: string;
  kind: string;
};

type ItunesResponse = {
  results: ItunesTrack[];
};

export function useMusicSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6&media=music`;
        const res = await fetch(url);
        const data = (await res.json()) as ItunesResponse;
        setResults(
          data.results
            .filter((t) => t.wrapperType === "track")
            .map((t) => ({
              trackId: t.trackId,
              trackName: t.trackName,
              artistName: t.artistName,
              artworkUrl: t.artworkUrl60.replace("60x60", "100x100"),
              previewUrl: t.previewUrl ?? null,
            })),
        );
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { query, setQuery, results, isSearching };
}
