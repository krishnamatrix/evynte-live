import { Box } from '@mui/material';

interface RichHTMLContentProps {
  html: string;
}

export default function RichHTMLContent({ html }: RichHTMLContentProps) {
  return (
    html ? (
    <Box
      sx={{
        "& p": {
          margin: "4px 0", // shrink space
          lineHeight: 1.4,
          padding: 0,
        },
        "& p:first-of-type": {
          marginTop: 0,
        },
        "& p:last-of-type": {
          marginBottom: 0,
        },
        "& ul": {
          margin: "4px 0 4px 20px",
          padding: 0,
        },
        "& li": {
          margin: "2px 0",
        },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
    ) : null
  );
}
