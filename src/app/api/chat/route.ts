
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type FAQ = {
  id: number;
  question: string;
  answer: string;
  patterns: string[];
};

const fallback =
  "Sorry, I don't have a confirmed answer to that question. Please ask about our menu, opening hours, prices, delivery, reservations, or payment methods.";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(input: string, phrase: string): boolean {
  const normalizedPhrase = normalize(phrase);

  if (!normalizedPhrase) return false;

  return ` ${input} `.includes(` ${normalizedPhrase} `);
}

function findBestAnswer(
  message: string,
  faqs: FAQ[]
): string {
  const input = normalize(message);

  // First check whether the question matches exactly.
  const exactQuestion = faqs.find(
    (faq) => normalize(faq.question) === input
  );

  if (exactQuestion) return exactQuestion.answer;

  // Next check exact alternative phrases.
  const exactPattern = faqs.find((faq) =>
    faq.patterns.some(
      (pattern) => normalize(pattern) === input
    )
  );

  if (exactPattern) return exactPattern.answer;

  // Match longer, more specific phrases first.
  let bestAnswer = fallback;
  let bestScore = 0;
  let tied = false;

  for (const faq of faqs) {
    const phrases = [faq.question, ...faq.patterns];
    let faqScore = 0;

    for (const phrase of phrases) {
      if (!containsPhrase(input, phrase)) continue;

      const normalizedPhrase = normalize(phrase);
      const wordCount = normalizedPhrase.split(" ").length;

      const score =
        wordCount * 100 + normalizedPhrase.length;

      faqScore = Math.max(faqScore, score);
    }

    if (faqScore > bestScore) {
      bestScore = faqScore;
      bestAnswer = faq.answer;
      tied = false;
    } else if (faqScore > 0 && faqScore === bestScore) {
      tied = true;
    }
  }

  // Avoid guessing when two rules are equally strong.
  if (bestScore === 0 || tied) return fallback;

  return bestAnswer;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 500
    ) {
      return NextResponse.json(
        { error: "Enter a question under 500 characters." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      console.error("Supabase configuration is missing.");

      return NextResponse.json(
        { error: "Database configuration is missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Read the latest active FAQs from Supabase.
    // No hardcoded restaurant answers here.
    const { data, error } = await supabase
      .from("restaurant_faqs")
      .select("id, question, answer, patterns")
      .eq("is_active", true)
      .order("id", { ascending: true })
      .limit(1000);

    if (error) {
      console.error("Supabase query failed:", error.message);

      return NextResponse.json(
        { error: "Could not read the knowledge base." },
        { status: 503 }
      );
    }

    const faqs: FAQ[] = (data ?? []).map((row) => ({
      id: Number(row.id),
      question: String(row.question),
      answer: String(row.answer),
      patterns: Array.isArray(row.patterns)
        ? row.patterns.filter(
            (value: unknown): value is string =>
              typeof value === "string"
          )
        : [],
    }));

    const answer = findBestAnswer(message, faqs);

    return NextResponse.json(
      { answer },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Chat endpoint error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
