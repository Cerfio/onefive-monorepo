import React from 'react';

type TextNode = {
  mode: string;
  text: string;
  type: string;
  style: string;
  detail: number;
  format: number;
  version: number;
};

type ParagraphNode = {
  type: 'paragraph';
  format: string;
  indent: number;
  version: number;
  children: TextNode[];
  direction: string;
  textStyle: string;
  textFormat: number;
};

type HeadingNode = {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  type: 'heading';
  format: string;
  indent: number;
  version: number;
  children: TextNode[];
  direction: string;
};

type ContentNode = ParagraphNode | HeadingNode;

type LexicalContent = {
  root: {
    type: string;
    format: string;
    indent: number;
    version: number;
    children: ContentNode[];
    direction: string;
  };
};

interface LexicalRendererProps {
  content: LexicalContent | string;
}

const LexicalRenderer: React.FC<LexicalRendererProps> = ({ content }) => {
  if (!content || typeof content !== 'object' || !content.root) {
    return null;
  }

  const { root } = content;
  
  return (
    <div>
      {root.children.map((node, index) => {
        if (node.type === 'paragraph') {
          return (
            <p key={index} className="mb-4">
              {node.children?.map((child, childIndex) => (
                <span key={childIndex}>{child.text}</span>
              ))}
            </p>
          );
        } else if (node.type === 'heading') {
          const HeadingTag = node.tag as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag key={index} className="my-4 font-bold">
              {node.children?.map((child, childIndex) => (
                <span key={childIndex}>{child.text}</span>
              ))}
            </HeadingTag>
          );
        }
        return null;
      })}
    </div>
  );
};

export default LexicalRenderer; 