"use client";

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="flex h-screen bg-gray-50">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
                <AppHeader />
                {children}
            </div>
        </div>
    );
}
