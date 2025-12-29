'use client';
import React from 'react'

const HomePage = () => {
  return (
     <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {"Inicio"}
        </h2>
      </div>
    </div>
  )
}

export default HomePage
