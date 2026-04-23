import React from "react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: false,       // 🔒 XSS kapalı
  linkify: true,
  typographer: true,
});

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  const tokens = md.parse(content, {});

  const renderTokens = (tokens: any[], indexOffset = 0): React.ReactNode[] => {
    const output: React.ReactNode[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      switch (t.type) {
        case "paragraph_open":
          output.push(<p key={indexOffset + i}>{renderInline(tokens[i + 1].children)}</p>);
          break;

        case "heading_open": {
          const level = Number(t.tag.replace("h", ""));
          const Heading = `h${level}` as keyof JSX.IntrinsicElements;

          const content = tokens[i + 1]?.children;
          output.push(
            <Heading key={indexOffset + i}>
              {renderInline(content)}
            </Heading>
          );
          break;
        }

        case "bullet_list_open": {
          const items: React.ReactNode[] = [];
          let j = i + 1;

          while (tokens[j].type !== "bullet_list_close") {
            if (tokens[j].type === "list_item_open") {
              items.push(
                <li key={j}>
                  {renderInline(tokens[j + 2].children)}
                </li>
              );
            }
            j++;
          }

          output.push(<ul key={indexOffset + i}>{items}</ul>);
          break;
        }

        case "fence":
          output.push(
            <pre key={indexOffset + i}>
              <code>{t.content}</code>
            </pre>
          );
          break;
      }
    }

    return output;
  };

  const renderInline = (children: any[]): React.ReactNode[] => {
    if (!children) return [];

    return children.map((t, i) => {
      switch (t.type) {
        case "text":
          return <span key={i}>{t.content}</span>;

        case "strong_open":
          return <strong key={i}>{children[i + 1]?.content}</strong>;

        case "em_open":
          return <em key={i}>{children[i + 1]?.content}</em>;

        case "code_inline":
          return <code key={i}>{t.content}</code>;

        case "link_open":
          const href = t.attrs?.find((a: any) => a[0] === "href")?.[1];
          return (
            <a key={i} href={href} target="_blank" rel="noreferrer">
              {children[i + 1]?.content}
            </a>
          );

        default:
          return null;
      }
    });
  };

  return <div>{renderTokens(tokens)}</div>;
}