import React from 'react';

// Renders richtext fields: HTML (from rich editor) or plain text with paragraphs.
export default function RichContent({ html, className = '' }) {
  if (!html) return null;
  const hasTags = /<[a-z][\s\S]*>/i.test(html);
  if (hasTags) {
    return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <div className={className}>
      {html.split(/\n{2,}/).filter(Boolean).map((p, i) => (
        <p key={i} className="mb-4 last:mb-0 leading-relaxed">{p}</p>
      ))}
    </div>
  );
}