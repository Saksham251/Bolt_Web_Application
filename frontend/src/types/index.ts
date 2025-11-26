export type StepType = 'RunScript' | 'CreateFile' | 'EditFile' | 'CreateFolder' | 'DeleteFile';

export interface Step {
    id: number;
    title: string;
    type: StepType;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    code?: string;
    path?: string;
}
export interface Project {
    prompt:string;
    steps:Step[]
}

export interface FileItem {
    name:string;
    type:'file' | 'folder';
    children?: FileItem[];
    content?:string;
    path?:string;
}

export interface FileViewerProps {
    file:FileItem | null;
    onClose:()=>void;
}