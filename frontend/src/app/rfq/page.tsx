"use client"

import { DataTable } from "@/components/datatable";
import { getRFQs } from "@/lib/api";
import { useEffect, useState } from "react";
import { RFQResponse } from "@/lib/apiTypes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
    const router = useRouter();
    const [data, setData] = useState<RFQResponse[]>([]);
    const [columns, setColumns] = useState<{ header: string, accessorKey: string }[]>([]);

    function getColumnsFromData(data: RFQResponse[]): { header: string; accessorKey: string }[] {
        if (!data.length) return [];
        // Filter out the 'raw' field as it's too long to display in the table
        const keys = Object.keys(data[0]).filter(key => key !== 'raw');
        return keys.map((key) => ({
            header: key.charAt(0).toUpperCase() + key.slice(1),
            accessorKey: key,
        }));
    }

    useEffect(() => {
        (async () => {
            const rfqData = await getRFQs();
            setData(rfqData);
            setColumns(getColumnsFromData(rfqData));
        })();
    }, []);

    const onRowClicked = (data: RFQResponse) => {
        router.push(`/rfq/details?id=${data.id}`);
    }

    const onDeleteClicked = (data: RFQResponse) => {
        // TODO: Implement delete functionality
        console.log("Delete clicked for:", data.id);
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold my-5">RFQs</h1>
            <div>
                {data && columns &&
                    <DataTable
                        onRowClicked={(data) => onRowClicked(data as RFQResponse)}
                        onDeleteClicked={(data) => onDeleteClicked(data as RFQResponse)}
                        columns={columns}
                        data={data}
                    />
                }
            </div>
        </div>
    );
}
