import React from 'react'
import type { FileItem } from '../types'
export interface CodeEditor {
    file: FileItem | null
}

import { Editor } from '@monaco-editor/react';

export const CodeEditor = ({ file }: CodeEditor) => {
    if (!file) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                Select a file to view its contents
            </div>
        );
    }
    return (
        <Editor
            height="100%"
            defaultLanguage="typescript"
            theme="vs-dark"
            value={file?.content || ''}
            options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
            }}
        />
    );
}

