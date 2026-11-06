'use client';
import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

export default function GamePlayer({ zipUrl, gameTitle, onClose }: { zipUrl: string, gameTitle: string, onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameUrl, setGameUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let currentBlobUrl = ''; 

    const loadGame = async () => {
      try {
        const response = await fetch(zipUrl);
        if (!response.ok) throw new Error('Failed to fetch game file');
        const blob = await response.blob();

        const zip = await JSZip.loadAsync(blob);

        const indexFile = zip.file('index.html');
        if (!indexFile) {
          throw new Error('Cannot find index.html in the zip file');
        }

        let htmlContent = await indexFile.async('string');
        
        // 🚀 關鍵修復：去除可能導致解析失敗的 BOM 隱藏字元
        htmlContent = htmlContent.replace(/^\uFEFF/, '').trim();

        // 處理相對路徑 (將圖片、CSS、JS 轉成 Base64 並替換)
        const filePromises = Object.keys(zip.files).map(async (filename) => {
          if (filename === 'index.html' || zip.files[filename].dir) return;
          const fileData = await zip.files[filename].async('base64');
          const ext = filename.split('.').pop()?.toLowerCase();
          
          let mimeType = 'application/octet-stream';
          if (ext === 'js') mimeType = 'text/javascript';
          else if (ext === 'css') mimeType = 'text/css';
          else if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          else if (ext === 'mp3') mimeType = 'audio/mpeg';
          else if (ext === 'wav') mimeType = 'audio/wav';
          else if (ext === 'json') mimeType = 'application/json';

          const base64Url = `data:${mimeType};base64,${fileData}`;
          
          // 簡單的正則替換路徑
          const regex = new RegExp(`(['"])\\.\\/${filename}\\1|(['"])${filename}\\2`, 'g');
          htmlContent = htmlContent.replace(regex, `"${base64Url}"`);
        });

        await Promise.all(filePromises);

        // 🚀 關鍵修復：使用 Blob URL 代替 srcDoc
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        currentBlobUrl = URL.createObjectURL(htmlBlob);
        setGameUrl(currentBlobUrl);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load game');
        setLoading(false);
      }
    };

    loadGame();

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [zipUrl]);

  return (
    <div className="fixed inset-0 z-[999999] bg-black flex flex-col">
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          <h2 className="text-white font-bold text-lg">{gameTitle}</h2>
        </div>
        <button 
          onClick={onClose}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-1.5 rounded-lg font-bold transition text-sm"
        >
          Stop Game
        </button>
      </div>

      <div className="flex-1 relative bg-gray-950">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-400">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-mono text-sm animate-pulse">Extracting Game Files...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
            <p className="text-2xl mb-2">⚠️ Error</p>
            <p className="text-center px-4">{error}</p>
            <button onClick={onClose} className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg">Go Back</button>
          </div>
        )}

        {!loading && !error && gameUrl && (
          <iframe
            ref={iframeRef}
            src={gameUrl} // 🚀 改用 Blob URL
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
            title={gameTitle}
          />
        )}
      </div>
    </div>
  );
}