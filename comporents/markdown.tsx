import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  const md = useMemo(() => {
    return new MarkdownIt({
      html: true,      // HTML destekle
      linkify: true,   // linkleri otomatik algıla
      typographer: true
    });
  }, []);

  const html = useMemo(() => {
    const raw = md.render(content);
    return DOMPurify.sanitize(raw);
  }, [content, md]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}