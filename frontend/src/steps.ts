import type {Step} from "./types";

/* 
    Prompt: Parse Input XML and convert it into steps
    Input:
        <boltArtifact id=\"project-import\" title=\"Project Files\">
            <boltAction type=\"file\" filePath=\"eslint.config.js\">import js from '@eslint/js';\nimport globals from 'globals'
            </boltAction>
            <boltAction type="shell">
                node index.js
            </boltAction>
        </boltArtifact>';
    Output: 
    [   {
            "title":"Project Files",
            "status":"pending"
        },{
            "title":"Create eslint.config.js",
            "code":"import js from '@eslint/js';\nimport globals from 'globals",
            type:StepsType.CreateFile
        },{
            title:"Run command",
            "code":"node index.js",
            type:StepsType.RunScript
        }
    ]
    The input can have strings in the middle they need to be ignored
*/

export function parseXml(response:string):Step[]{
    // Extract the XML content between <boltArtifact> tags
    const xmlMatch = response.match(/<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/);
    if(!xmlMatch){
        return [];
    }
    const xmlContent = xmlMatch[1];
    let steps: Step[]=[];
    let stepId = 1;

    // Extract artifact title
   const titleMatch = response.match(/title="([^"]*)"/);
    const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';

    // Add initial artifact step
    steps.push({
        id:stepId++,
        title:artifactTitle,
        description:'',
        type:"CreateFolder",
        status:'pending'
    });

     // Regular expression to find boltAction elements
    const actionRegex = /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
    let match;
    
    while((match = actionRegex.exec(xmlContent)) != null){
        const [,type,filePath,content] = match;
        // Shell command step
        if(type==='shell'){
            steps.push({
                id:stepId++,
                title: `Run command`,
                description: '',
                type:"RunScript",
                status:'pending',
                code: content.trim()
            });
        }
        else if(type==='file'){
            // File execution step
            steps.push({
                id:stepId++,
                title: `Create ${filePath || 'file'}`,
                type:"CreateFile",
                description: '',
                status:'pending',
                code:content.trim(),
                path:filePath
            });
        }
    } 
    return steps;
}