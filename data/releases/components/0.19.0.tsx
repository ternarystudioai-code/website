"use client";

import React from "react";

export default function Release0190() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">0.19.0</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Experimental Docker support and new community templates
        </p>
      </div>

      <div className="mx-auto my-2 max-w-3xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
        <img
          src="/releases/0.19.0/hero.png"
          alt="0.19.0 overview"
          className="w-full h-auto"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Highlights</h2>
        <h3 className="text-xl font-semibold">Docker support (experimental)</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          0.19.0 introduces experimental Docker support for safer code execution.
        </p>
        <h3 className="text-xl font-semibold">New community templates</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Three new templates have been added to help you get started faster.
        </p>
      </section>
    </div>
  );
}
