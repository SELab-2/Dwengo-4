import React from 'react';
import { MathJax } from 'better-react-mathjax';

const LearningObjectContent: React.FC<{ rawHtml: string }> = ({ rawHtml }) => {
  // for blockly iframes, replace them with a button that leads to the blockly simulator instead of embedding
  // (it's not possible to embed because of the cross-origin policy from blockly)
  const modifiedHtml = rawHtml
    .replace(/action="([^"]*\/)readonly([^"]*)"/g, 'action="$1simulator$2"')
    .replace(
      /<iframe[^>]*name="blockly_iframe_([^"]+)"[^>]*><\/iframe>/g,
      (_, id) => {
        return `
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
      `;
      },
    );

  return (
    <MathJax>
      <div
        id="learning-object-content"
        className="prose max-w-none prose-img:max-w-full prose-img:w-auto text-justify"
        dangerouslySetInnerHTML={{
          __html: modifiedHtml,
        }}
      />
    </MathJax>
  );
};

export default LearningObjectContent;
