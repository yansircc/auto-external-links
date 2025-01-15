"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type SerperResponse } from "@/lib/serper/schema";
import { cn } from "@/lib/utils";

interface LinkSwitcherProps {
  link: string;
  title: string | null;
  alternatives: {
    preferred: SerperResponse["organic"];
    regular: SerperResponse["organic"];
    blacklisted: SerperResponse["organic"];
  };
  onLinkChange: (link: string, title: string) => void;
  children: React.ReactNode;
}

export function LinkSwitcher({
  link,
  title,
  alternatives,
  onLinkChange,
  children,
}: LinkSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    console.log("LinkSwitcher alternatives:", {
      link,
      title,
      alternatives: {
        preferred: alternatives.preferred,
        regular: alternatives.regular,
        blacklisted: alternatives.blacklisted,
      },
      hasPreferred: alternatives.preferred.length,
      hasRegular: alternatives.regular.length,
      hasBlacklisted: alternatives.blacklisted.length,
    });
  }, [alternatives, link, title]);

  const hasAlternatives =
    alternatives.preferred.length > 0 ||
    alternatives.regular.length > 0 ||
    alternatives.blacklisted.length > 0;

  console.log("hasAlternatives:", hasAlternatives);

  if (!hasAlternatives) {
    console.log("No alternatives available, rendering simple link");
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 underline hover:text-blue-900 group-hover:text-blue-700"
        title={title ?? undefined}
      >
        {children}
      </a>
    );
  }

  console.log("Rendering Popover with alternatives");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center text-blue-700 underline hover:text-blue-900 group-hover:text-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
            console.log("PopoverTrigger clicked");
          }}
        >
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={title ?? undefined}
          >
            {children}
          </a>
          <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0"
        align="start"
        sideOffset={5}
        onInteractOutside={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
      >
        <Tabs defaultValue="preferred" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferred">
              首选网站
              {alternatives.preferred.length > 0 && (
                <span className="ml-1 text-xs">
                  ({alternatives.preferred.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="regular">
              其他网站
              {alternatives.regular.length > 0 && (
                <span className="ml-1 text-xs">
                  ({alternatives.regular.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="blacklisted">
              已屏蔽
              {alternatives.blacklisted.length > 0 && (
                <span className="ml-1 text-xs">
                  ({alternatives.blacklisted.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="preferred" className="mt-0">
              <div className="space-y-2">
                {alternatives.preferred.map((result) => (
                  <button
                    key={result.link}
                    type="button"
                    onClick={() => {
                      onLinkChange(result.link, result.title);
                      setOpen(false);
                    }}
                    className={cn(
                      "block w-full rounded-lg border p-2 text-left text-sm hover:bg-accent",
                      link === result.link && "border-primary",
                    )}
                  >
                    <p className="line-clamp-1 font-medium">{result.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {result.link}
                    </p>
                  </button>
                ))}
                {alternatives.preferred.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    暂无首选网站结果
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="regular" className="mt-0">
              <div className="space-y-2">
                {alternatives.regular.map((result) => (
                  <button
                    key={result.link}
                    type="button"
                    onClick={() => {
                      onLinkChange(result.link, result.title);
                      setOpen(false);
                    }}
                    className={cn(
                      "block w-full rounded-lg border p-2 text-left text-sm hover:bg-accent",
                      link === result.link && "border-primary",
                    )}
                  >
                    <p className="line-clamp-1 font-medium">{result.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {result.link}
                    </p>
                  </button>
                ))}
                {alternatives.regular.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    暂无其他网站结果
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="blacklisted" className="mt-0">
              <div className="space-y-2">
                {alternatives.blacklisted.map((result) => (
                  <div
                    key={result.link}
                    className="block w-full rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-left text-sm"
                  >
                    <p className="line-clamp-1 font-medium line-through">
                      {result.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground line-through">
                      {result.link}
                    </p>
                  </div>
                ))}
                {alternatives.blacklisted.length === 0 && (
                  <p className="text-sm text-muted-foreground">暂无屏蔽网站</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
