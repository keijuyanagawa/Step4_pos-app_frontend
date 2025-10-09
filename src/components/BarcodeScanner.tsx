'use client';

  

import { useEffect, useRef } from 'react';

import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

  

interface BarcodeScannerProps {

  onDetected: (barcode: string) => void;

  onClose: () => void;

  isOpen: boolean;

}

  

export default function BarcodeScanner({ onDetected, onClose, isOpen }: BarcodeScannerProps) {

  const videoRef = useRef<HTMLVideoElement>(null);

  // クリーンアップ処理のために、リーダーのインスタンスとストリームをrefで保持

  const controlsRef = useRef<{

    reader: BrowserMultiFormatReader,

    stream: MediaStream

  } | null>(null);

  

  useEffect(() => {

    // モーダルが開いていて、かつvideo要素がマウントされている場合のみ処理を実行

    if (isOpen && videoRef.current) {

      // スキャナーを起動する非同期関数

      const startScanner = async () => {

        // 既存のコントロールがあれば念のため停止（再試行などのケース）

        if (controlsRef.current) {

          controlsRef.current.reader.reset();

          controlsRef.current.stream.getTracks().forEach(track => track.stop());

        }

        const reader = new BrowserMultiFormatReader();

        controlsRef.current = { reader, stream: new MediaStream() }; // 初期化

  

        try {

          // 最も基本的な設定で背面カメラを要求

          const constraints: MediaStreamConstraints = {

            video: {

              facingMode: 'environment',

            },

          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          // 取得したストリームとリーダーをrefに保存

          controlsRef.current = { reader, stream };

  

          if (videoRef.current) {

            videoRef.current.srcObject = stream;

            // ユーザー操作なしで再生を開始するためにmutedは重要

            await videoRef.current.play();

  

            console.log('Scanner started successfully.');

  

            // 取得したストリームを使って継続的にスキャンを開始

            reader.decodeFromStream(stream, videoRef.current, (result, error) => {

              // クリーンアップ後にコールバックが呼ばれることがあるため、controlsRefの存在を確認

              if (!controlsRef.current) return;

  

              if (result) {

                console.log('Barcode detected:', result.getText());

                onDetected(result.getText());

                onClose(); // 成功したらモーダルを閉じる

              }

  

              if (error && !(error instanceof NotFoundException)) {

                console.error('Barcode scan error:', error);

              }

            });

          }

        } catch (error) {

          console.error('Failed to start scanner:', error);

          // エラーが発生した場合もモーダルを閉じる

          onClose();

        }

      };

  

      startScanner();

    }

  

    // クリーンアップ関数: isOpenがfalseになるか、コンポーネントがアンマウントされる時に実行

    return () => {

      if (controlsRef.current) {

        console.log('Cleaning up scanner...');

        // スキャンを停止し、カメラの電源をオフにする

        controlsRef.current.reader.reset();

        controlsRef.current.stream.getTracks().forEach(track => track.stop());

        controlsRef.current = null;

      }

    };

  }, [isOpen, onDetected, onClose]); // 依存配列

  

  if (!isOpen) {

    return null;

  }

  

  // UIはCSS干渉を避けるため、極力シンプルに

  return (

    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-lg w-full max-w-md mx-auto flex flex-col">

        <div className="p-4 border-b flex justify-between items-center">

          <h2 className="text-lg font-semibold">バーコードをスキャン</h2>

          <button onClick={onClose} className="text-2xl leading-none">&times;</button>

        </div>

        <div className="relative w-full bg-black" style={{ paddingTop: '75%' /* 4:3 Aspect Ratio */ }}>

          <video

            ref={videoRef}

            className="absolute top-0 left-0 w-full h-full object-cover"

            playsInline // iOSでインライン再生に必要

            muted      // 自動再生に必要

          />

          {/* 必要であればここにスキャンガイドのオーバーレイを追加 */}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 border-4 border-green-500 rounded-lg pointer-events-none"></div>

        </div>

        <div className="p-4 text-center">

          <button onClick={onClose} className="text-gray-600">キャンセル</button>

        </div>

      </div>

    </div>

  );

}