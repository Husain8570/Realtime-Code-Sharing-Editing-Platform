import React from "react";
import { Box, Typography } from "@mui/material";

const Output = ({ output }) => {
  return (
    <Box
      sx={{
        backgroundColor: "black",
        color: "lime",
        p: 2,
        mt: 2,
        borderRadius: "10px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap", // Preserve newlines
      }}
    >
      <Typography variant="h6">Output:</Typography>
      <Typography variant="body1">
        {output}
      </Typography>
    </Box>
  );
};

export default Output;
