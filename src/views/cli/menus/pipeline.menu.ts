export const presetQuantity = Number(process.env.PRESET) || 8;
export const PipelineMenu = [
  'back',
  'health',
  `last ${presetQuantity} stages`,
  `last ${presetQuantity} build summaries`,
  'list failing acc tests',
  'console output',
  'build summary',
];
