import React from 'react';

interface Props {
  t: (key: string) => string;
}

const Legend: React.FC<Props> = ({ t }) => (
  <div className="flex flex-col items-start bg-transparent">
    <div className="flex gap-3 bg-transparent">
      <div className="w-5 h-5 bg-dwengo-green-transparent-light border-1 border-gray-400" />
      <span className="text-sm italic text-gray-600">
        {t('lp_view.legend.teacher_exclusive')}
      </span>
    </div>
    <div className="flex gap-3 bg-transparent">
      <div className="w-5 h-5 border-b-1 border-x-1 border-gray-400" />
      <span className="text-sm italic text-gray-600">
        {t('lp_view.legend.student_content')}
      </span>
    </div>
  </div>
);

export default Legend;
