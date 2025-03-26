const axios = require("axios");
require("dotenv").config();

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const API_KEY = process.env.JUDGE0_API_KEY;

const langIds = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  c: 50,
  csharp: 51,
  php: 68,
  swift: 83,
};



const runCode = async (req, res) => {
  const { language, code } = req.body;
  
  if (!langIds[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    const response = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      { source_code: code, language_id: langIds[language] },
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const { stdout, stderr, message, compile_output } = response.data;

    if (compile_output) {
      return res.json({ error: `Compilation Error:\n${compile_output}` });
    }
    
    if (stderr) {
      return res.json({ error: `Runtime Error:\n${stderr}` });
    }

    res.json({ output: stdout || "No output" });

  } catch (error) {
    console.error("Execution Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Execution failed" });
  }
};

module.exports = runCode;
