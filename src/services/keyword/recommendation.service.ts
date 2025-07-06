import { BaseService } from "@/services/base/base.service";

/**
 * 推荐理由生成服务
 * 基于上下文为关键词生成智能推荐理由
 */
export class RecommendationService extends BaseService {
	protected readonly serviceName = "RecommendationService";

	/**
	 * 提取关键词周围的上下文
	 */
	private extractContext(
		text: string,
		keyword: string,
		contextLength = 150,
	): string {
		const lowerText = text.toLowerCase();
		const lowerKeyword = keyword.toLowerCase();
		const index = lowerText.indexOf(lowerKeyword);

		if (index === -1) return "";

		// 获取关键词前后的文本
		const start = Math.max(0, index - contextLength);
		const end = Math.min(text.length, index + keyword.length + contextLength);

		// 找到完整的句子边界
		let contextStart = start;
		let contextEnd = end;

		// 向前找到句子开始
		for (let i = index; i >= start; i--) {
			if (text[i] === "." || text[i] === "!" || text[i] === "?") {
				contextStart = i + 1;
				break;
			}
		}

		// 向后找到句子结束
		for (let i = index + keyword.length; i <= end; i++) {
			if (text[i] === "." || text[i] === "!" || text[i] === "?") {
				contextEnd = i + 1;
				break;
			}
		}

		return text.slice(contextStart, contextEnd).trim();
	}

	/**
	 * 分析关键词在上下文中的作用
	 */
	private analyzeKeywordRole(
		context: string,
		keyword: string,
	): {
		role: string;
		importance: string;
	} {
		const lowerContext = context.toLowerCase();
		const lowerKeyword = keyword.toLowerCase();

		// 检查是否是定义或解释
		if (
			lowerContext.includes(`${lowerKeyword} is`) ||
			lowerContext.includes(`${lowerKeyword} are`) ||
			lowerContext.includes(`${lowerKeyword} refers to`)
		) {
			return {
				role: "definition",
				importance: "understanding the fundamental concept",
			};
		}

		// 检查是否是功能或作用描述
		if (
			lowerContext.includes("function") ||
			lowerContext.includes("purpose") ||
			lowerContext.includes("role") ||
			lowerContext.includes("used for") ||
			lowerContext.includes("helps") ||
			lowerContext.includes("enables")
		) {
			return {
				role: "function",
				importance: "understanding how it works",
			};
		}

		// 检查是否是过程或步骤
		if (
			lowerContext.includes("process") ||
			lowerContext.includes("step") ||
			lowerContext.includes("stage") ||
			lowerContext.includes("phase")
		) {
			return {
				role: "process",
				importance: "understanding the workflow",
			};
		}

		// 检查是否是优势或好处
		if (
			lowerContext.includes("advantage") ||
			lowerContext.includes("benefit") ||
			lowerContext.includes("improve") ||
			lowerContext.includes("enhance") ||
			lowerContext.includes("better")
		) {
			return {
				role: "benefit",
				importance: "understanding the advantages",
			};
		}

		// 检查是否是问题或挑战
		if (
			lowerContext.includes("problem") ||
			lowerContext.includes("challenge") ||
			lowerContext.includes("issue") ||
			lowerContext.includes("difficult")
		) {
			return {
				role: "challenge",
				importance: "understanding potential issues",
			};
		}

		// 默认情况
		return {
			role: "concept",
			importance: "deepening your knowledge",
		};
	}

	/**
	 * 生成上下文感知的查询
	 */
	generateContextAwareQuery(text: string, keyword: string): string {
		const context = this.extractContext(text, keyword);
		const { role } = this.analyzeKeywordRole(context, keyword);

		switch (role) {
			case "definition":
				return `What is ${keyword} and how does it work?`;
			case "function":
				return `How does ${keyword} function in practice?`;
			case "process":
				return `What are the steps involved in ${keyword}?`;
			case "benefit":
				return `What are the advantages of ${keyword}?`;
			case "challenge":
				return `How to overcome ${keyword} challenges?`;
			default:
				return `What is ${keyword}?`;
		}
	}

	/**
	 * 生成上下文感知的推荐理由
	 */
	generateContextAwareReason(text: string, keyword: string): string {
		const context = this.extractContext(text, keyword);
		const { role, importance } = this.analyzeKeywordRole(context, keyword);

		// 提取上下文中的关键信息
		const contextWords = context.toLowerCase().split(/\s+/);
		const keywordIndex = contextWords.findIndex((word) =>
			word.includes(keyword.toLowerCase()),
		);

		// 找出关键词相关的动词和形容词
		const relevantWords: string[] = [];
		for (
			let i = Math.max(0, keywordIndex - 5);
			i < Math.min(contextWords.length, keywordIndex + 5);
			i++
		) {
			const word = contextWords[i];
			if (
				word &&
				word.length > 3 &&
				![
					"the",
					"and",
					"for",
					"with",
					"from",
					"that",
					"this",
					"what",
					"when",
					"where",
					"which",
				].includes(word)
			) {
				relevantWords.push(word);
			}
		}

		// 根据角色和上下文生成推荐理由
		switch (role) {
			case "definition":
				return `Understanding ${keyword} will help you grasp ${this.findRelatedConcept(relevantWords)} better.`;

			case "function":
				if (context.includes("quality")) {
					return `Exploring ${keyword}'s function will enhance your knowledge of production quality and efficiency.`;
				} else if (context.includes("control")) {
					return `Learning about ${keyword} will improve your understanding of process control and optimization.`;
				} else {
					return `Discovering how ${keyword} works will deepen your understanding of ${importance}.`;
				}

			case "process":
				return `Understanding the ${keyword} process will help you master ${this.findRelatedConcept(relevantWords)}.`;

			case "benefit":
				return `Learning about ${keyword} will show you how to achieve better results in ${this.findRelatedConcept(relevantWords)}.`;

			case "challenge":
				return `Understanding ${keyword} will help you overcome common challenges and improve outcomes.`;

			default:
				// 尝试从上下文中提取更具体的理由
				if (relevantWords.length > 0) {
					const relatedConcept = this.findRelatedConcept(relevantWords);
					return `Exploring ${keyword} will enhance your understanding of ${relatedConcept}.`;
				}
				return `Deepening your knowledge of ${keyword} will provide valuable insights.`;
		}
	}

	/**
	 * 从相关词中找到最相关的概念
	 */
	private findRelatedConcept(words: string[]): string {
		// 优先寻找技术相关的词
		const technicalWords = words.filter((word) =>
			[
				"system",
				"process",
				"method",
				"technique",
				"technology",
				"mechanism",
				"operation",
				"function",
				"performance",
				"quality",
				"efficiency",
				"production",
				"manufacturing",
				"design",
				"structure",
				"component",
				"material",
			].some((tech) => word.includes(tech)),
		);

		if (technicalWords.length > 0 && technicalWords[0]) {
			return technicalWords[0];
		}

		// 寻找动作相关的词
		const actionWords = words.filter(
			(word) =>
				word.endsWith("ing") || word.endsWith("tion") || word.endsWith("ment"),
		);

		if (actionWords.length > 0 && actionWords[0]) {
			return actionWords[0];
		}

		// 返回最长的词作为概念
		return words.reduce(
			(longest, current) =>
				current.length > longest.length ? current : longest,
			"the concept",
		);
	}
}
