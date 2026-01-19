import { Box, Typography } from "@mui/material";
import { FaQuestionCircle } from "react-icons/fa";
import styles from "../../styles/productUI.module.css";

function AskQuestionButton({ onClick }) {
  return (
    <Box onClick={onClick} className={styles.askQuestion}>
      <FaQuestionCircle size={20} />
      <Typography fontWeight={600}>Ask a Question</Typography>
    </Box>
  );
}

export default AskQuestionButton;
