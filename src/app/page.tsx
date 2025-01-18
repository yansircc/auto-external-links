import { KeywordEditorContainer } from "@/components/keyword-editor/keyword-editor-container";
import SiteHeader from "@/components/layout/site-header";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  // 获取所有需要的翻译
  const [headerT, formT, previewT, linkedContentT, featuresT] =
    await Promise.all([
      getTranslations("keyword-editor.header"),
      getTranslations("keyword-editor.form"),
      getTranslations("keyword-editor.preview"),
      getTranslations("keyword-editor.linked-content"),
      getTranslations("keyword-editor.features"),
    ]);

  // 组合所有翻译数据
  const messages = {
    header: {
      title: headerT("title"),
      description: headerT("description"),
    },
    form: {
      title: formT("title"),
      description: formT("description"),
      placeholder: formT("placeholder"),
      analyze: formT("analyze"),
      analyzing: formT("analyzing"),
    },
    preview: {
      description: previewT("description"),
      confirm: previewT("confirm"),
      gettingLinks: previewT("gettingLinks"),
    },
    linkedContent: {
      description: linkedContentT("description"),
      copyMarkdown: linkedContentT("copyMarkdown"),
      copyMarkdownWithFootnotes: linkedContentT("copyMarkdownWithFootnotes"),
      copied: linkedContentT("copied"),
      footnotes: linkedContentT("footnotes"),
      preferred: linkedContentT("preferred"),
    },
    features: {
      ai: {
        title: featuresT("ai.title"),
        description: featuresT("ai.description"),
      },
      links: {
        title: featuresT("links.title"),
        description: featuresT("links.description"),
      },
      optimization: {
        title: featuresT("optimization.title"),
        description: featuresT("optimization.description"),
      },
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="my-14 w-full">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold">{messages.header.title}</h1>
              <p className="text-muted-foreground">
                {messages.header.description}
              </p>
            </div>
            <KeywordEditorContainer messages={messages} />
          </div>
        </div>
      </main>
    </>
  );
}
