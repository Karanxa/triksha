import { GenerateScriptParams } from './scriptGeneratorTypes';
import { generatePythonScript } from './pythonScriptGenerator';
import { generatePyTorchScript } from './pytorchScriptGenerator';
import { generateTensorFlowScript } from './tensorflowScriptGenerator';

export const generateTrainingScript = ({
  model,
  datasetId,
  taskType,
  scriptLanguage,
  parameters
}: GenerateScriptParams): string => {
  switch (scriptLanguage) {
    case 'pytorch':
      return generatePyTorchScript({ model, datasetId, taskType, parameters });
    case 'tensorflow':
      return generateTensorFlowScript({ model, datasetId, taskType, parameters });
    case 'python':
    default:
      return generatePythonScript({ model, datasetId, taskType, parameters });
  }
};