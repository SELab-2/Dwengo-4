
/* LearningObjectContent.tsx */
import React from 'react';
import { MathJax } from 'better-react-mathjax';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import OpenPrompt from './OpenPrompt';

const LearningObjectContent: React.FC<{ rawHtml: string }> = ({ rawHtml }) => {
  // for blockly iframes, replace with simulator button
  const modifiedHtml = rawHtml
    .replace(/action="([^"]*\/)readonly([^\"]*)"/g, 'action="$1simulator$2"')
    .replace(
      /<iframe[^>]*name="blockly_iframe_([^"]+)"[^>]*><\/iframe>/g,
      (_, id) => `
        <button type="button" onclick="document.getElementById('blockly_form_${id}').submit();" style="
          margin-top: 5px;
          padding: 0.375rem 0.75rem;
          border-radius: 0.25rem;
          background-color: #87C544;
          color: white;
          border: none;
          cursor: pointer;
        ">
          Open Blockly Simulator
        </button>
      `,
    );

  // probeer JSON te parsen voor interactieve vragen
  try {
    const data = JSON.parse(rawHtml);
    if (data && typeof data.prompt === 'string') {
      if (Array.isArray(data.options) && data.options[0]) {
        return <MultipleChoiceQuestion prompt={data.prompt} options={data.options} />;
      }
      if (typeof data.answer === 'string') {
        return <OpenPrompt prompt={data.prompt} answer={data.answer} />;
      }
    }
  } catch {
    // ongeldig JSON: fallback
  }

  return (
    <MathJax>
      <div
        id="learning-object-content"
        className="prose max-w-none prose-img:max-w-full prose-img:w-auto text-justify"
        dangerouslySetInnerHTML={{ __html: modifiedHtml }}
      />
    </MathJax>
  );
};

export default LearningObjectContent;
