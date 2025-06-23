import React, { useState } from 'react';

const AIInput = () => {
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleChange = async (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 5) {
      const res = await fetch('/api/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value }),
      });

      const data = await res.json();
      setSuggestion(data.suggestion);
    }
  };

  return (
    <div className="p-4">
      <textarea
        value={input}
        onChange={handleChange}
        placeholder="Start typing your sleep note..."
        className="w-full p-2 border rounded"
      />
      {suggestion && (
        <div className="mt-2 p-2 bg-gray-100 rounded">
          💡 Suggestion: {suggestion}
        </div>
      )}
    </div>
  );
};

export default AIInput;
