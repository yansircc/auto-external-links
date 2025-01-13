"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Plus } from "lucide-react";
import { BlacklistManager } from "@/components/blacklist-manager";

interface PageHeaderProps {
  showNewButton: boolean;
  onNewAnalysis: () => void;
}

export function PageHeader({ showNewButton, onNewAnalysis }: PageHeaderProps) {
  return (
    <motion.div className="relative flex items-center justify-between" layout>
      <motion.h1
        className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        外链自动化
      </motion.h1>

      <div className="flex items-center gap-3">
        {showNewButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button
              variant="default"
              onClick={onNewAnalysis}
              className="shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              新建分析
            </Button>
          </motion.div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shadow-sm transition-all hover:shadow-md"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">设置</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                网址黑名单
              </DialogTitle>
            </DialogHeader>
            <BlacklistManager />
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
