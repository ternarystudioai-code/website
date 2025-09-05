"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    {
      question: "What is Ternary?",
      answer:
        "Ternary is a lightweight workspace for building AI agents and apps. Design prompts and rules, connect tools and data sources, test conversations, and ship to production—all in one place.",
    },
    {
      question: "Which AI models are supported?",
      answer:
        "We support 19+ providers out of the box including OpenAI, Anthropic, Google, Mistral, Cohere, Azure OpenAI, Together, Perplexity, and local models via Ollama. Bring your own API keys.",
    },
    {
      question: "Does it work offline / local‑first?",
      answer:
        "Yes. Ternary is local‑first: projects and prompts live on your machine by default, and you can develop offline. You choose when and what to sync to the cloud.",
    },
    {
      question: "How does Supabase integrate?",
      answer:
        "First‑class Supabase support: Auth, Postgres, Row‑Level Security, Realtime, Storage, and Edge Functions. Use our hooks and templates to scaffold a full‑stack app quickly.",
    },
    {
      question: "How do I deploy?",
      answer:
        "Instant deploy with our Next.js template. Export a production build and deploy to Vercel or Netlify in a click. Serverless API routes are already wired to your providers.",
    },
    {
      question: "What platforms are supported?",
      answer:
        "Windows, macOS, and Linux. The website auto‑detects your OS and offers the correct download, and you can view all installers from the Downloads page.",
    },
    {
      question: "How much does it cost?",
      answer:
        "The app is free to get started. You pay your own model/provider costs. Team and pro features are available—see Pricing for details.",
    },
    {
      question: "Where can I get help?",
      answer:
        "Check the built‑in docs and troubleshooting guides, or open an issue on GitHub. You can also reach us from the Help Center in the app.",
    },
  ]

  return (
    <section id="faq" className="relative overflow-hidden pb-120 pt-24">
      {/* Background blur effects */}
      <div className="bg-primary/20 absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>
      <div className="bg-primary/20 absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>

      <div className="z-10 container mx-auto px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="border-primary/40 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 uppercase">
            <span>✶</span>
            <span className="text-sm">Faqs</span>
          </div>
        </motion.div>

        <motion.h2
          className="mx-auto mt-6 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Questions? We've got{" "}
          <span className="bg-gradient-to-b from-foreground via-rose-200 to-primary bg-clip-text text-transparent">
            answers
          </span>
        </motion.h2>

        {(() => {
          const mid = Math.ceil(faqs.length / 2)
          const col1 = faqs.slice(0, mid)
          const col2 = faqs.slice(mid)
          return (
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              {[col1, col2].map((col, colIdx) => (
                <div key={`col-${colIdx}`} className="flex flex-col gap-6">
                  {col.map((faq, i) => {
                    const index = colIdx === 0 ? i : i + mid
                    return (
                      <motion.div
                        key={`${colIdx}-${i}`}
                        className="from-secondary/40 to-secondary/10 rounded-2xl border border-white/10 bg-gradient-to-b p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset] transition-all duration-300 hover:border-white/20 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.06 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleItem(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            toggleItem(index)
                          }
                        }}
                        {...(index === faqs.length - 1 && { "data-faq": faq.question })}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="m-0 font-medium pr-4">{faq.question}</h3>
                          <motion.div
                            animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            {openItems.includes(index) ? (
                              <Minus className="text-primary flex-shrink-0 transition duration-300" size={24} />
                            ) : (
                              <Plus className="text-primary flex-shrink-0 transition duration-300" size={24} />
                            )}
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {openItems.includes(index) && (
                            <motion.div
                              className="mt-4 text-muted-foreground leading-relaxed overflow-hidden"
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{
                                duration: 0.4,
                                ease: "easeInOut",
                                opacity: { duration: 0.2 },
                              }}
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </section>
  )
}
