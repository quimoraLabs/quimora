// import React from 'react'

function Cards({ cat }) {
  return (
    <div
      key={cat}
      className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition cursor-pointer hover:border-blue-500 dark:bg-neutral-800"
    >
      <h4 className="text-lg font-semibold">{cat}</h4>
      <p className="text-sm text-slate-500 mt-1">Practice {cat} questions</p>
    </div>
  );
}

export default Cards;
