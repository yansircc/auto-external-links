"use client";

import { motion } from "framer-motion";
import { KeywordEditor } from "@/components/keyword-editor/editor";
import { PageHeader } from "@/components/page-header";
import { useKeywordAnalysis } from "@/hooks/use-keyword-analysis";

export default function Home() {
  const {
    text,
    matches,
    keywordMetadata,
    selectedKeywordIds,
    isLoading,
    isEditing,
    hasLinks,
    handleSubmit,
    handleToggleKeyword,
    handleConfirm,
    handleEditClick,
    handleNewAnalysis,
  } = useKeywordAnalysis();

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-background to-muted/20"
    >
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          showNewButton={hasLinks}
          onNewAnalysis={handleNewAnalysis}
        />

        <motion.div layout className="rounded-lg border bg-card shadow-sm">
          <KeywordEditor
            text={text}
            matches={matches}
            keywordMetadata={keywordMetadata}
            selectedKeywordIds={selectedKeywordIds}
            isLoading={isLoading}
            isEditing={isEditing}
            hasLinks={hasLinks}
            onSubmit={handleSubmit}
            onToggleKeyword={handleToggleKeyword}
            onConfirm={handleConfirm}
            onEditClick={handleEditClick}
          />
        </motion.div>
      </div>
    </motion.main>
  );
}
