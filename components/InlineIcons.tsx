"use client";
import * as React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export function IconLeaf(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M20.5 3.5c-6 0-9.9 2.4-12 6.4C6 13 6.5 16 9 18.5c.3.3.8.3 1.1 0l3.3-3.3c.4-.4.1-1-.4-1H11l2-2.1c4-4.1 7.5-5.6 7.5-8.6zM4 20c3 0 5.5-1.2 7.4-3.1l.6-.6-1.4-1.4-.6.6C8.5 17.5 6.5 18.5 4 18.5V20z"/>
    </svg>
  );
}
export function IconCamera(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 4l1.5 2H20a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h3L9 4zm3 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"/>
    </svg>
  );
}
export function IconChart(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 20h16v-2H4v2zM6 10h2v6H6v-6zm5-4h2v10h-2V6zm5 3h2v7h-2V9z"/>
    </svg>
  );
}
export function IconCog(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l-1.9-.5a7 7 0 00-.7-1.7l1.1-1.6-1.4-1.4-1.6 1.1c-.5-.3-1.1-.5-1.7-.7L12 4 11.5 6c-.6.2-1.2.4-1.7.7L8.2 5.6 6.8 7l1.1 1.6c-.3.5-.5 1.1-.7 1.7L4 12l2 .5c.2.6.4 1.2.7 1.7L5.6 16.8 7 18.2l1.6-1.1c.5.3 1.1.5 1.7.7L12 20l.5-1.9c.6-.2 1.2-.4 1.7-.7l1.6 1.1 1.4-1.4-1.1-1.6c.3-.5.5-1.1.7-1.7L21 12z"/>
    </svg>
  );
}
