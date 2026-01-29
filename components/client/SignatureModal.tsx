"use client";

import { useRef, useState, useEffect } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSign: (signatureData: string) => Promise<void>;
    quoteReference: string;
    amount: string;
};

export default function SignatureModal({ isOpen, onClose, onSign, quoteReference, amount }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSigned, setIsSigned] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    // Reset canvas when opening
    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                setIsSigned(false);
            }
        }
    }, [isOpen]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        e.preventDefault(); // Prevent scrolling on touch

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setIsSigned(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.closePath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setIsSigned(false);
        }
    };

    const handleSign = async () => {
        if (!canvasRef.current || !isSigned) return;

        try {
            setIsSigning(true);
            const dataUrl = canvasRef.current.toDataURL("image/png");
            await onSign(dataUrl);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSigning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1a1a1a]">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#2f2f2f] dark:text-white">Signer le devis</h2>
                    <p className="mt-1 text-sm text-[#6a6a6a] dark:text-gray-400">
                        Vous êtes sur le point de signer le devis <span className="font-medium text-black dark:text-white">{quoteReference}</span> d'un montant de <span className="font-medium text-black dark:text-white">{amount}</span>.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-[#333] dark:bg-[#222]">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                        Votre signature
                    </p>
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="h-48 w-full touch-none rounded-lg bg-white shadow-sm dark:bg-[#111]"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    <div className="mt-2 text-right">
                        <button
                            onClick={clearCanvas}
                            className="text-xs text-[#6a6a6a] hover:text-red-500 dark:text-gray-400"
                        >
                            Effacer
                        </button>
                    </div>
                </div>

                <div className="mb-6 text-xs text-[#6a6a6a] dark:text-gray-400">
                    <p>En signant ce document, vous acceptez les conditions générales de vente et validez le devis.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-full border border-[#ece7ef] bg-white px-4 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSign}
                        disabled={!isSigned || isSigning}
                        className="flex-1 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {isSigning ? "Signature en cours..." : "Valider la signature"}
                    </button>
                </div>
            </div>
        </div>
    );
}
