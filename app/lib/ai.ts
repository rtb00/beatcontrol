const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';

export async function getGenreAndSuggestions(
  title: string,
  artist: string
): Promise<{ genre: string; suggestions: string[] }> {
  const fallback = { genre: 'Unbekannt', suggestions: [] };

  if (!GROQ_API_KEY) return fallback;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'Du bist ein Musik-Experte und DJ. Antworte NUR mit einem JSON-Objekt. Keine Erklärungen.',
          },
          {
            role: 'user',
            content: `Für den Song "${title}" von "${artist}": 1) Bestimme das Genre (ein Wort, z.B. Pop, Rock, Hip-Hop, Schlager, EDM, R&B, Latin, Jazz, Klassik). 2) Schlage 3 Songs vor die gut danach passen würden (Titel - Artist Format). Antwort als JSON: {"genre": "...", "suggestions": ["Song1 - Artist1", "Song2 - Artist2", "Song3 - Artist3"]}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return fallback;

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';

    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) return fallback;

    const parsed = JSON.parse(content.slice(start, end + 1));
    return {
      genre: typeof parsed.genre === 'string' && parsed.genre.trim() ? parsed.genre.trim() : 'Unbekannt',
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((s: unknown) => typeof s === 'string').slice(0, 3)
        : [],
    };
  } catch {
    return fallback;
  }
}
