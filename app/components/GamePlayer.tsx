'use client';
import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

export default function GamePlayer({ zipUrl, gameTitle, onClose }: { zipUrl: string, gameTitle: string, onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameHtml, setGameHtml] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        // 1. 下載 ZIP 檔
        const response = await fetch(zipUrl);
        if (!response.ok) throw new Error('無法下載遊戲檔案');
        const blob = await response.blob();

        // 2. 解壓縮 ZIP
        const zip = await JSZip.loadAsync(blob);

        // 3. 尋找 index.html
        const indexFile = zip.file('index.html');
        if (!indexFile) {
          throw new Error('ZIP 檔案中找不到 index.html');
        }

        // 4. 讀取 HTML 內容
        let htmlContent = await indexFile.async('string');

        // 5. 處理相對路徑 (將圖片、CSS、JS 轉成 Base64 或 Blob URL 注入)
        // 為了簡化，我們先限制：遊戲必須是單一 HTML 檔，或者資源都在同一個資料夾
        // 這裡我們把找到的其他檔案轉成 Blob URL 並替換到 HTML 中
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

          const blobUrl = `data:${mimeType};base64,${fileData}`;
          
          // 將 HTML 中引用的路徑替換為 Base64 資料
          // (例如 src="script.js" 變成 src="data:...")
          htmlContent = htmlContent.split(`"${filename}"`).join(`"${blobUrl}"`);
          htmlContent = htmlContent.split(`'${filename}'`).join(`'${blobUrl}'`);
        });

        await Promise.all(filePromises);

        setGameHtml(htmlContent);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || '載入遊戲失敗');
        setLoading(false);
      }
    };

    loadGame();
  }, [zipUrl]);

  return (
    <div className="fixed inset-0 z-[999999] bg-black flex flex-col">
      {/* 頂部控制列 */}
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

      {/* 遊戲畫面區 */}
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
            <p>{error}</p>
            <button onClick={onClose} className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg">Go Back</button>
          </div>
        )}

        {!loading && !error && gameHtml && (
          <iframe
            ref={iframeRef}
            srcDoc={gameHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            title={gameTitle}
          />
        )}
      </div>
    </div>
  );
}