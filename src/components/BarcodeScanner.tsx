'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  BrowserMultiFormatReader, 
  NotFoundException,
  DecodeHintType,
  BarcodeFormat
} from '@zxing/library';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onDetected, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // カメラストリームの停止
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  };

  // カメラスキャン開始
  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // ZXingのリーダー初期化（ヒントを設定して読み取り精度を向上）
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,        // JANコード（標準）
        BarcodeFormat.EAN_8,         // JANコード（短縮版）
        BarcodeFormat.CODE_128,      // CODE128
        BarcodeFormat.CODE_39,       // CODE39
        BarcodeFormat.UPC_A,         // UPCコード
        BarcodeFormat.UPC_E,         // UPCコード（短縮版）
        BarcodeFormat.QR_CODE,       // QRコード
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true); // より正確にスキャン

      const codeReader = new BrowserMultiFormatReader(hints);
      readerRef.current = codeReader;

      // 利用可能なカメラデバイスを取得
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('カメラが見つかりません');
      }

      // 背面カメラを優先的に選択（スマホ対応）
      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoInputDevices[0];

      // バーコードスキャン開始
      await codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            // バーコード検出成功
            const barcodeText = result.getText().trim(); // 前後の空白を削除
            console.log('=== Barcode Scan Success ===');
            console.log('Raw value:', result.getText());
            console.log('Trimmed value:', barcodeText);
            console.log('Barcode format:', result.getBarcodeFormat());
            console.log('Length:', barcodeText.length);
            console.log('===========================');
            
            // スキャンしたバーコードを表示
            setLastScannedBarcode(barcodeText);
            
            // 検出したバーコードを親コンポーネントに通知
            onDetected(barcodeText);
            
            // スキャンを停止してモーダルを閉じる
            stopScanning();
            onClose();
          }
          
          if (error && !(error instanceof NotFoundException)) {
            // NotFoundException以外のエラーは表示
            console.error('Scan error:', error);
          }
        }
      );

      // MediaStreamを保存（後でクリーンアップするため）
      if (videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }

    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('カメラへのアクセスが拒否されました。ブラウザの設定からカメラの使用を許可してください。');
        } else if (err.name === 'NotFoundError') {
          setError('カメラが見つかりません。デバイスにカメラが接続されているか確認してください。');
        } else if (err.name === 'NotReadableError') {
          setError('カメラが使用中です。他のアプリケーションを閉じてから再試行してください。');
        } else {
          setError(`エラーが発生しました: ${err.message}`);
        }
      } else {
        setError('カメラの起動に失敗しました');
      }
      
      setIsScanning(false);
    }
  };

  // モーダルが開いた時にスキャン開始
  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    // クリーンアップ
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-2xl max-h-screen flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">バーコードスキャン</h2>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* カメラプレビュー */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center p-6">
              <div className="text-red-500 mb-4 text-6xl">⚠️</div>
              <p className="text-white text-lg mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  startScanning();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                再試行
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                muted
              />
              
              {/* スキャンガイド */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-80 h-60">
                  {/* スキャンエリア枠 */}
                  <div className="absolute inset-0 border-4 border-green-500 rounded-lg shadow-lg">
                    {/* 角のマーカー */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                  </div>
                  
                  {/* スキャンライン（アニメーション） */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute w-full h-1 bg-green-400 shadow-lg animate-scan"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* 説明テキスト */}
              <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                <p className="text-white text-lg font-semibold bg-black bg-opacity-60 py-2 px-4 rounded-full inline-block mb-2">
                  バーコードを枠内に合わせてください
                </p>
                {/* デバッグ用：最後にスキャンしたバーコード値を表示 */}
                {lastScannedBarcode && (
                  <div className="text-yellow-300 text-sm bg-black bg-opacity-80 py-2 px-4 rounded-lg inline-block">
                    検出: {lastScannedBarcode}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* フッター（手入力モード切替） */}
        <div className="bg-white p-4 text-center">
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            手入力モードに戻る
          </button>
        </div>
      </div>

      {/* スキャンラインのアニメーション用CSS */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}


