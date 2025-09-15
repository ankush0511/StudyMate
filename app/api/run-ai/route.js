// app/api/run-ai/route.js
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { aiTask, query } = await req.json();
        console.log(aiTask, query)

        let pythonScriptPath;

        if (aiTask === "doubt-solving") {
            pythonScriptPath = path.join(process.cwd(), 'ai_code', 'doubt-solving', 'main.py');
        } else if (aiTask === "flashcards_mindmap") { 
            pythonScriptPath = path.join(process.cwd(), 'ai_code', 'flashcards-mindmap', 'main.py');
        } else if(aiTask === "career"){
            pythonScriptPath = path.join(process.cwd(), 'ai_code','career', 'main.py');
        } else if(aiTask === "mcq"){
            pythonScriptPath = path.join(process.cwd(), 'ai_code','mcq', 'main.py');
        } else if(aiTask === "yt-summarizer"){
            pythonScriptPath = path.join(process.cwd(), 'ai_code','yt-summarizer', 'main.py');
        }

        const python = spawn('python', [pythonScriptPath]);

        let result = '';
        let error = '';

        python.stdout.on('data', (data) => {
            result += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.stdin.write(JSON.stringify({ query, aiTask }));
        python.stdin.end();

        const pythonExitCode = await new Promise((resolve, reject) => {
            python.on('close', (code) => {
                resolve(code);
            });
            python.on('error', (err) => {
                reject(err);
            });
        });

        if (error) {
            return new Response(JSON.stringify({ error: 'Python Error: ' + error }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            console.log("Before: ", result)
            const output = JSON.parse(result);
            console.log("After: ", result)

            if (output.error) {
                return new Response(JSON.stringify({ error: output.error }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            return new Response(JSON.stringify({ response: output.response }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Failed to parse Python output or invalid output format' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}