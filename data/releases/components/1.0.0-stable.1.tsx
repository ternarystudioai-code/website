"use client";

import React from "react";

export default function Release0190Beta1() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">1.0.0-stable.1</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Beta release with experimental features
        </p>
        <p className="text-sm text-gray-500">
          Ternary v1.0.0-stable.1 includes experimental features and improvements for testing.
        </p>
      </div>

      {/* Demo */}
      <section className="space-y-2">
        <div className="mx-auto my-2 max-w-3xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="relative w-full aspect-video">
            <iframe
              src="https://app.supademo.com/embed/cmeajwv4z00cxxn0ietpahdoe?embed_v=2&utm_source=embed"
              loading="lazy"
              title="Ternary 1.0.0-stable.1 Feature Demo"
              allow="clipboard-write"
              className="absolute inset-0 w-full h-full"
              frameBorder={0}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Highlights</h2>
        <h3 className="text-xl font-semibold">Experimental features</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          New experimental features for community testing and feedback.
        </p>
        <h3 className="text-xl font-semibold">Performance optimizations</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Initial performance optimizations for better user experience.
        </p>
        <h2 className="text-2xl font-semibold">Feedback</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We'd love to hear your thoughts on this beta release. Please share your feedback with us through our community channels.
        </p>
      </section>
    </div>
  );
}
