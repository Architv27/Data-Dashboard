// src/components/Tabs.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Tabs.css';

type Tab = {
  title: string;
  value: string;
  content: React.ReactNode;
};

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);

  return (
    <>
      <div className="tabs-container" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab.value === tab.value ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab.value === tab.value}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default Tabs;
