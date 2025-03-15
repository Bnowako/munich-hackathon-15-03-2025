"use client"

import { useEffect, useState } from "react";
import { getRFQ } from "@/lib/api";
import { RFQResponse } from "@/lib/apiTypes";
import { useSearchParams } from "next/navigation";

export default function RFQDetailsPage() {
    const [rfq, setRFQ] = useState<RFQResponse | null>(null);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        if (!id) return;
        
        (async () => {
            const rfqData = await getRFQ(id);
            setRFQ(rfqData);
        })();
    }, [id]);

    if (!id) {
        return <div className="container mx-auto p-5">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                No RFQ ID provided
            </div>
        </div>;
    }

    if (!rfq) {
        return <div className="container mx-auto p-5">
            <div className="animate-pulse">Loading...</div>
        </div>;
    }

    return (
        <div className="container mx-auto p-5">
            <div className="mb-4">
                <button 
                    onClick={() => window.history.back()}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Overview
                </button>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6">{rfq.title}</h1>
                
                <div className="grid gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {rfq.requirements.map((req, index) => (
                                <li key={index} className="text-gray-700">{req}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
