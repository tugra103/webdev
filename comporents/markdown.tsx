"use client";

import React, { useMemo } from "react";
import MarkdownIt from "markdown-it";

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  const md = useMemo(
    () =>
      new MarkdownIt({
        html: false,
        linkify: true,
        typographer: true,
      }),
    []
  );

  const tokens = useMemo(() => md.parse(content, {}), [content, md]);

  const renderInline = (children: any[]): React.ReactNode[] => {
    if (!children) return [];

    return children.map((t, i) => {
      switch (t.type) {
        case "text":
          return <span key={i}>{t.content}</span>;

        case "code_inline":
          return <code key={i}>{t.content}</code>;

        case "strong_open":
          return <strong key={i}>{children[i + 1]?.content}</strong>;

        case "em_open":
          return <em key={i}>{children[i + 1]?.content}</em>;

        case "link_open": {
          const href =
            t.attrs?.find((a: any) => a[0] === "href")?.[1] ?? "#";

          return (
            <a key={i} href={href} target="_blank" rel="noreferrer">
              {children[i + 1]?.content}
            </a>
          );
        }

        default:
          return null;
      }
    });
  };

  const renderTokens = (tokens: any[]): React.ReactNode[] => {
    const output: React.ReactNode[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      switch (t.type) {
        case "paragraph_open":
          output.push(
            <p key={i}>{renderInline(tokens[i + 1]?.children || [])}</p>
          );
          break;

        case "heading_open": {
          const level = Number(t.tag.replace("h", ""));
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;

          output.push(
            <Tag key={i}>
              {renderInline(tokens[i + 1]?.children || [])}
            </Tag>
          );
          break;
        }

        case "bullet_list_open": {
          const items: React.ReactNode[] = [];
          let j = i + 1;

          while (tokens[j] && tokens[j].type !== "bullet_list_close") {
            if (tokens[j].type === "list_item_open") {
              items.push(
                <li key={j}>
                  {renderInline(tokens[j + 2]?.children || [])}
                </li>
              );
            }
            j++;
          }

          output.push(<ul key={i}>{items}</ul>);
          break;
        }

        case "fence":
          output.push(
            <pre key={i}>
              <code>{t.content}</code>
            </pre>
          );
          break;

        case "blockquote_open":
          output.push(
            <blockquote key={i}>
              {renderInline(tokens[i + 1]?.children || [])}
            </blockquote>
          );
          break;

        default:
          break;
      }
    }

    return output;
  };

  return <div className="markdown">{renderTokens(tokens)}</div>;
}