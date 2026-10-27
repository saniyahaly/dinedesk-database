
"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const welcomeMessage =
  "Welcome to DineDesk Restaurant! 👋 I'm your database-powered assistant. Ask about our menu, prices, timings, delivery, reservations, and more.";

const quickQuestions = [
  "When do you open?",
  "Are you open on Sunday?",
  "View menu",
  "Burger price",
  "Delivery time",
  "Book a table",
];

const menu = [
  {
    emoji: "🍔",
    name: "Classic Beef Burger",
    price: "PKR 800",
    detail: "Juicy beef, crisp lettuce, and signature sauce.",
  },
  {
    emoji: "🍔",
    name: "Chicken Burger",
    price: "PKR 650",
    detail: "Tender chicken with fresh vegetables.",
  },
  {
    emoji: "🍕",
    name: "Cheese Lovers Pizza",
    price: "PKR 1,200",
    detail: "A golden crust loaded with delicious cheese.",
  },
  {
    emoji: "🍝",
    name: "Creamy Pasta",
    price: "PKR 750",
    detail: "A comforting creamy pasta with Italian herbs.",
  },
  {
    emoji: "🍟",
    name: "Loaded Fries",
    price: "PKR 400",
    detail: "Golden fries with our special dip.",
  },
  {
    emoji: "🥗",
    name: "Garden Salad",
    price: "PKR 500",
    detail: "Fresh vegetables with a light dressing.",
  },
];

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: welcomeMessage,
    },
  ]);

  const nextId = useRef(2);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const generationRef = useRef(0);

  useEffect(() => {
    if (chatOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages, loading, chatOpen]);

  async function askQuestion(question: string) {
    const clean = question.trim();

    if (!clean || busyRef.current) return;

    busyRef.current = true;
    const generation = generationRef.current;

    const id = nextId.current;
    nextId.current += 2;

    setMessages((previous) => [
      ...previous,
      {
        id,
        sender: "user",
        text: clean,
      },
    ]);

    setInput("");
    setLoading(true);
    setChatOpen(true);

    let answer = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          message: clean,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Request failed");
      }

      answer = result.answer;
    } catch (error) {
      console.error(error);

      answer =
        "Sorry, I couldn't connect to the restaurant database. Please try again.";
    } finally {
      if (generationRef.current === generation) {
        setMessages((previous) => [
          ...previous,
          {
            id: id + 1,
            sender: "bot",
            text: answer,
          },
        ]);

        setLoading(false);
        busyRef.current = false;
      }
    }
  }

  function resetChat() {
    generationRef.current += 1;
    busyRef.current = false;
    nextId.current += 2;
    setMessages([
      {
        id: nextId.current++,
        sender: "bot",
        text: welcomeMessage,
      },
    ]);
    setInput("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#29251f]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-orange-100 bg-[#fffaf4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#home" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a13d20] text-2xl">
              🍽️
            </span>

            <div>
              <p className="text-xl font-black tracking-tight">
                DineDesk<span className="text-[#a13d20]">.</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                Food · Family · Flavour
              </p>
            </div>
          </a>

          <div className="hidden gap-8 text-sm font-medium text-stone-600 md:flex">
            <a href="#home" className="hover:text-[#a13d20]">
              Home
            </a>
            <a href="#menu" className="hover:text-[#a13d20]">
              Our Menu
            </a>
            <a href="#about" className="hover:text-[#a13d20]">
              About
            </a>
            <a href="#contact" className="hover:text-[#a13d20]">
              Contact
            </a>
          </div>

          <button
            onClick={() => setChatOpen(true)}
            className="rounded-full bg-[#a13d20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#812e17]"
          >
            Ask us 💬
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="bg-[#f5e8d8]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#a13d20]">
              ✦ Good food, good mood
            </span>

            <h1 className="mt-8 max-w-xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              A little taste of{" "}
              <span className="font-serif italic text-[#a13d20]">
                happiness.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">
              Delicious flavours, comforting classics and a smarter
              way to explore our restaurant. Discover your next
              favourite meal.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#menu"
                className="rounded-full bg-[#a13d20] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#812e17]"
              >
                Explore Our Menu →
              </a>

              <button
                onClick={() => setChatOpen(true)}
                className="rounded-full border border-stone-300 bg-white/80 px-7 py-4 text-sm font-bold transition hover:border-[#a13d20]"
              >
                Chat With Us
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm text-stone-600">
              <span>✦ Fresh flavours</span>
              <span>✦ Comfort food</span>
              <span>✦ Made with care</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[3rem] bg-[#e7c8a6] opacity-50 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white/70 bg-[#f9dfbd] p-8 text-center shadow-2xl">
              <div className="flex min-h-[360px] flex-col items-center justify-center">
                <span className="text-9xl">🍔</span>

                <span className="mt-6 rounded-full bg-white/80 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#a13d20]">
                  Your next favourite
                </span>

                <h2 className="mt-5 font-serif text-4xl font-bold">
                  Made to satisfy.
                </h2>

                <p className="mt-3 text-sm text-stone-600">
                  Great food meets helpful technology.
                </p>
              </div>

              <button
                onClick={() => setChatOpen(true)}
                className="mt-4 w-full rounded-2xl bg-white/90 px-5 py-4 text-sm font-bold text-[#a13d20] transition hover:bg-white"
              >
                💬 Have a question? Ask our assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a13d20]">
            Straight from our kitchen
          </p>

          <h2 className="mt-4 text-4xl font-black">
            Crowd favourites.
          </h2>

          <p className="mt-4 text-stone-500">
            Explore our fictional sample menu and discover something
            delicious.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((item) => (
            <article
              key={item.name}
              className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#f9eee2] to-[#f1d6b9]">
                <span className="text-8xl transition group-hover:scale-110">
                  {item.emoji}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold">
                  {item.name}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-stone-500">
                  {item.detail}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-orange-100 pt-5">
                  <span className="font-black text-[#a13d20]">
                    {item.price}
                  </span>

                  <button
                    onClick={() => {
                      setChatOpen(true);
                    }}
                    className="rounded-full bg-[#fff1e3] px-4 py-2 text-xs font-bold text-[#a13d20] hover:bg-orange-100"
                  >
                    Ask us →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-7 text-center text-xs text-stone-500">
          These are demonstration menu items and fictional prices.
        </p>
      </section>

      {/* About */}
      <section id="about" className="bg-[#f5e8d8] py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <div className="flex min-h-80 flex-col items-center justify-center rounded-[2.5rem] bg-[#e8d0b7] p-8 text-center">
            <span className="text-8xl">👨‍🍳</span>
            <h2 className="mt-5 font-serif text-3xl font-bold">
              Good food. Great company.
            </h2>
            <p className="mt-3 text-stone-600">
              Food, family and memorable moments.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a13d20]">
              A little about us
            </p>

            <h2 className="mt-4 text-4xl font-black">
              More than a meal.
            </h2>

            <p className="mt-6 leading-8 text-stone-600">
              DineDesk is a fictional restaurant created for a student
              chatbot development project. This version uses a
              Supabase database to store questions, answers and
              matching phrases.
            </p>

            <p className="mt-4 leading-8 text-stone-600">
              New restaurant FAQs can be added directly in the
              database without editing the chatbot code.
            </p>

            <button
              onClick={() => setChatOpen(true)}
              className="mt-8 rounded-full bg-[#a13d20] px-7 py-4 text-sm font-bold text-white hover:bg-[#812e17]"
            >
              Meet Our Virtual Assistant →
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[#30251f] py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300">
              Let's talk
            </p>

            <h2 className="mt-4 text-4xl font-black">
              Got a question?
              <br />
              We're all ears.
            </h2>

            <p className="mt-5 text-stone-300">
              Ask our assistant about the sample restaurant's
              menu, opening hours, prices, and services.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-xl font-bold">
              💬 DineDesk Virtual Assistant
            </h3>

            <p className="mt-3 text-sm text-stone-300">
              Answers retrieved from our restaurant knowledge database.
            </p>

            <button
              onClick={() => setChatOpen(true)}
              className="mt-6 w-full rounded-full bg-orange-600 py-4 text-sm font-bold hover:bg-orange-700"
            >
              Start Conversation →
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#241b17] px-5 py-7 text-center text-xs text-stone-400">
        © 2026 DineDesk Restaurant · Fictional student project ·
        Database-driven chatbot
      </footer>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chatbot"
          className="fixed bottom-6 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#a13d20] text-3xl text-white shadow-2xl transition hover:scale-110 sm:right-8"
        >
          💬
          <span className="absolute right-0 top-0 h-4 w-4 rounded-full border-2 border-white bg-green-400" />
        </button>
      )}

      {/* Chatbot Window */}
      {chatOpen && (
        <section
          aria-label="DineDesk restaurant chatbot"
          className="fixed bottom-3 right-3 z-50 flex h-[min(610px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl sm:bottom-7 sm:right-7"
        >
          <header className="flex shrink-0 items-center gap-3 bg-[#a13d20] px-4 py-4 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl">
              🍽️
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-bold">
                DineDesk Assistant
              </h2>

              <p className="mt-1 text-xs text-orange-100">
                ● Online · Database connected
              </p>
            </div>

            <button
              onClick={resetChat}
              title="New conversation"
              aria-label="Reset conversation"
              className="rounded-full px-2 py-1 text-xl hover:bg-white/15"
            >
              ↻
            </button>

            <button
              onClick={() => setChatOpen(false)}
              aria-label="Close chatbot"
              className="rounded-full px-2 py-1 text-2xl hover:bg-white/15"
            >
              ×
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fffaf5] p-4">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Restaurant support
            </p>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a13d20] text-xs text-white">
                    🍴
                  </div>
                )}

                <div
                  className={`max-w-[84%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[13px] leading-6 ${
                    message.sender === "user"
                      ? "rounded-br-sm bg-[#a13d20] text-white"
                      : "rounded-bl-sm border border-orange-100 bg-white text-stone-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                role="status"
                className="flex items-center gap-2 text-xs text-stone-500"
              >
                <span className="animate-pulse">🍴</span>
                Checking restaurant database...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="shrink-0 border-t border-orange-100 bg-white px-3 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Quick questions
            </p>

            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  disabled={loading}
                  onClick={() => askQuestion(question)}
                  className="rounded-full border border-orange-200 bg-orange-50 px-2 py-2 text-[11px] font-medium text-[#a13d20] transition hover:bg-orange-100 disabled:opacity-40"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              askQuestion(input);
            }}
            className="flex shrink-0 items-center gap-2 border-t border-orange-100 bg-white p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder="Ask your question..."
              aria-label="Your question"
              className="min-w-0 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none focus:border-[#a13d20]"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send question"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a13d20] text-xl text-white hover:bg-[#812e17] disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
