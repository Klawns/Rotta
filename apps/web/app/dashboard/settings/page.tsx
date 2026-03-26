"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsTabs } from "./_components/settings-tabs";
import { GeneralSettings } from "./_components/general-settings";
import { SecuritySettings } from "./_components/security-settings";
import { DangerZone } from "./_components/danger-zone";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    const renderContent = () => {
        switch (activeTab) {
            case "general":
                return <GeneralSettings />;
            case "security":
                return <SecuritySettings />;
            case "danger":
                return <DangerZone />;
            default:
                return <GeneralSettings />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-32 px-4 sm:px-6">
            <div className="flex flex-col gap-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-display font-black text-text-primary tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20 transform -rotate-3 transition-transform hover:rotate-0">
                                <Settings2 size={28} className="text-primary-foreground" />
                            </div>
                            Configurações
                        </h2>
                        <p className="text-text-secondary text-lg font-medium opacity-80 pl-2 border-l-2 border-primary/30">
                            Personalize sua experiência e gerencie sua conta.
                        </p>
                    </div>

                    <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                <main className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -10, filter: "blur(10px)" }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
