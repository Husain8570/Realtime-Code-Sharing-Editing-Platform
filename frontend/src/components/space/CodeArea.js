import { Box } from "@mui/material";
import CodeSettings from "./CodeSettings";
import Editor from "./Editor";
import Output from "./OutputDisplay"; // Import Output component

export default function CodeArea({ spaceId, output }) {
  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 80px)",
        borderRadius: 4,
        gap: 2, // Adds spacing between sections
      }}
    >
      {/* Code Editor Section */}
      <Box sx={{ flex: 2, borderRadius: 4, overflow: "hidden" }}>
        <Editor spaceId={spaceId} />
        <CodeSettings />
      </Box>

      {/* Output Section */}
      <Box
        sx={{
          flex: 1,
          borderRadius: 4,
          bgcolor: "background.paper",
          p: 2,
          overflow: "auto",
        }}
      >
        <Output output={output} />
      </Box>
    </Box>
  );
}
