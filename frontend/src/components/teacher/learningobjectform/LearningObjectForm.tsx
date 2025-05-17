import React from 'react';
import { motion } from 'framer-motion';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import StepNavigation from './StepNavigation';
import { Props } from './types';
import { useLearningObjectForm } from './hooks/useLearningObjectForm';
import BasicInfoStep from './steps/BasicInfoStep';
import ContentDetailsStep from './steps/ContentDetailsStep';
import UsageSettingsStep from './steps/UsageSettingsStep';
import AvailabilityStep from './steps/AvailabilityStep';
import HtmlOrQuestionStep from './steps/HtmlOrQuestionStep';

const LearningObjectForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
  const f = useLearningObjectForm(initialData, onSuccess);

  return (
    <section>
      <Container>
        <BoxBorder extraClasses="m-a mxw-800 p-20">
          <h2 className="text-2xl font-semibold mb-4">
            {f.isEdit ? 'Edit Learning Object' : 'New Learning Object'}
          </h2>

          <form onSubmit={f.handleSubmit}>
            {f.step === 1 && (
              <motion.div
                key={`step1-${f.subStep}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6"
              >
                {f.subStep === 1 && <BasicInfoStep {...f} />}
                {f.subStep === 2 && <ContentDetailsStep {...f} />}
                {f.subStep === 3 && <UsageSettingsStep {...f} />}
                {f.subStep === 4 && <AvailabilityStep {...f} />}
              </motion.div>
            )}

            {f.step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6"
              >
                <HtmlOrQuestionStep {...f} />
              </motion.div>
            )}

            <StepNavigation {...f} onCancel={onCancel} />
          </form>
        </BoxBorder>
      </Container>
    </section>
  );
};

export default LearningObjectForm;
