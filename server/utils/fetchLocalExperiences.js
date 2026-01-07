//server/utils/fetchLocalExperiences.js
const { HfInference } = require('@huggingface/inference');
const { process } = require("./env");

async function fetchLocalExperiences(destination) {
  const modelId = "HuggingFaceH4/zephyr-7b-beta"; 
  const hf = new HfInference(process.env.HF_TOKEN);
  const prompt = `Suggest some popular local experiences and activities for tourists visiting ${destination}.`;

  const response = await hf.textGeneration({
    inputs: prompt,
    model: modelId,
    parameters: {
      max_length: 500,
      return_full_text: true,
    },
  });

  if (!response.ok && !response.status >= 200 && response.status < 300) {
    throw new Error('Error generating text with Hugging Face');
  }

  const generatedText = response.generated_text.trim();
  const localExperiences = generatedText.split('\n'); // Split into experiences

  return localExperiences;
}

module.exports = fetchLocalExperiences;