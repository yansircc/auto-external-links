import { KeywordEditorContainer } from "@/components/keyword-editor/keyword-editor-container";
import SiteHeader from "@/components/layout/site-header";
import { getMessages } from "./messages";

export default async function Home() {
	// 获取所有需要的翻译
	const messages = await getMessages();

	return (
		<>
			<SiteHeader />
			<main className="flex-1">
				<div className="my-14 w-full">
					<div className="mx-auto max-w-5xl px-4">
						<div className="mb-8 space-y-2">
							<h1 className="font-bold text-3xl">{messages.header.title}</h1>
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
