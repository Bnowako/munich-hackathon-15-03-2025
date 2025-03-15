"use client"

import { useEffect, useState } from "react";
import { getRFQ } from "@/lib/api";
import { RFQResponse } from "@/lib/apiTypes";
import { useSearchParams } from "next/navigation";

export default function RFQDetailsPage() {
    const [rfq, setRFQ] = useState<RFQResponse | null>(null);
    const [requirementNotes, setRequirementNotes] = useState<{ [key: number]: string }>({});
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        if (!id) return;
        
        (async () => {
            const rfqData = await getRFQ(id);
            setRFQ(rfqData);
            // Initialize empty notes for each requirement
            const initialNotes = rfqData.requirements.reduce((acc, _, index) => {
                acc[index] = '';
                return acc;
            }, {} as { [key: number]: string });
            setRequirementNotes(initialNotes);
        })();
    }, [id]);

    const handleNoteChange = (index: number, note: string) => {
        setRequirementNotes(prev => ({
            ...prev,
            [index]: note
        }));
    };

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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requirement
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rfq.requirements.map((req, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {req}
                                            </td>
                                            <td className="px-6 py-4">
                                                <textarea
                                                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                                                    rows={3}
                                                    placeholder="Add your notes here..."
                                                    value={requirementNotes[index] || ''}
                                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
