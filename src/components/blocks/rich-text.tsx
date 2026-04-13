// Renders serialized Lexical rich text from Payload.
// For a full renderer, install @payloadcms/richtext-lexical and use its JSX
// serializer. This is a lightweight fallback that covers common node types.

import React from "react";

type SerializedNode = {
  type: string;
  version?: number;
  children?: SerializedNode[];
  text?: string;
  format?: number;
  tag?: string;
  listType?: string;
  fields?: {
    url?: string;
    newTab?: boolean;
    linkType?: string;
  };
  src?: string;
  altText?: string;
  width?: number;
  height?: number;
};

type LexicalContent = {
  root?: {
    children?: SerializedNode[];
  };
};

function SerializeNode({
  node,
}: {
  node: SerializedNode;
}): React.ReactElement | null {
  switch (node.type) {
    case "text": {
      let el: React.ReactElement = (
        <React.Fragment>{node.text}</React.Fragment>
      );
      if (node.format) {
        if (node.format & 1) el = <strong>{el}</strong>;
        if (node.format & 2) el = <em>{el}</em>;
        if (node.format & 8) el = <code>{el}</code>;
        if (node.format & 16)
          el = <del className="line-through">{el}</del>;
      }
      return el;
    }
    case "paragraph":
      return (
        <p className="mb-4 leading-relaxed">
          {node.children?.map((c, i) => (
            <SerializeNode key={i} node={c} />
          ))}
        </p>
      );
    case "heading":
      return React.createElement(
        node.tag ?? "h2",
        {
          className:
            node.tag === "h1"
              ? "text-3xl font-bold mb-4 mt-8"
              : node.tag === "h2"
                ? "text-2xl font-bold mb-3 mt-6"
                : node.tag === "h3"
                  ? "text-xl font-semibold mb-2 mt-5"
                  : "text-lg font-semibold mb-2 mt-4",
        },
        node.children?.map((c, i) => <SerializeNode key={i} node={c} />)
      );
    case "list":
      return node.listType === "bullet" ? (
        <ul className="list-disc list-inside mb-4 space-y-1">
          {node.children?.map((c, i) => (
            <SerializeNode key={i} node={c} />
          ))}
        </ul>
      ) : (
        <ol className="list-decimal list-inside mb-4 space-y-1">
          {node.children?.map((c, i) => (
            <SerializeNode key={i} node={c} />
          ))}
        </ol>
      );
    case "listitem":
      return (
        <li>
          {node.children?.map((c, i) => (
            <SerializeNode key={i} node={c} />
          ))}
        </li>
      );
    case "link":
      return (
        <a
          href={node.fields?.url ?? "#"}
          target={node.fields?.newTab ? "_blank" : undefined}
          rel={node.fields?.newTab ? "noopener noreferrer" : undefined}
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {node.children?.map((c, i) => (
            <SerializeNode key={i} node={c} />
          ))}
        </a>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-gray-600">
          {node.children?.map((c, i) => (
            <SerializeNode key={i} node={c} />
          ))}
        </blockquote>
      );
    case "horizontalrule":
      return <hr className="my-8 border-gray-200" />;
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.src ?? ""}
          alt={node.altText ?? ""}
          width={node.width}
          height={node.height}
          className="rounded-lg my-6 max-w-full"
        />
      );
    default:
      if (node.children?.length) {
        return (
          <React.Fragment>
            {node.children.map((c, i) => (
              <SerializeNode key={i} node={c} />
            ))}
          </React.Fragment>
        );
      }
      return null;
  }
}

type RichTextBlockProps = {
  blockType: "richText";
  content: LexicalContent | null | undefined;
  maxWidth?: "normal" | "wide" | "full";
};

export function RichTextBlock({
  content,
  maxWidth = "normal",
}: RichTextBlockProps) {
  if (!content?.root?.children) return null;

  const maxWidthClass =
    maxWidth === "normal"
      ? "max-w-3xl"
      : maxWidth === "wide"
        ? "max-w-5xl"
        : "max-w-full";

  return (
    <section className="py-12">
      <div className={`mx-auto px-6 ${maxWidthClass} prose prose-gray`}>
        {content.root.children.map((node, i) => (
          <SerializeNode key={i} node={node} />
        ))}
      </div>
    </section>
  );
}
