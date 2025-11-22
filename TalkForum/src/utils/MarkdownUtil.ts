import hljs from "highlight.js";
import { Marked, Renderer, type Tokens } from "marked";
import { markedHighlight } from "marked-highlight";
import DOMPurify from "dompurify";

/** 目录节点接口（树状结构） */
export interface TocNode {
  name: string;       // 标题文本
  id: string;         // 标题唯一ID（用于跳转）
  level: number;      // 标题级别（1~6 对应 h1~h6）
  children: TocNode[]; // 子标题（嵌套结构）
}

/** 内部使用的 Renderer：独立收集目录，避免污染 */
class InternalRenderer extends Renderer {
  // 目录容器：每个 Renderer 实例独立持有（函数每次调用都会新建实例，天然隔离）
  private tocTree: TocNode[] = [];
  private currentParents: TocNode[] = [];

  // 重写标题渲染：收集目录 + 生成ID
  heading({ text, depth }: Tokens.Heading): string {
    const id = `${depth}-${text.replace(/\s+/g, "-")}`; // 替换空格，避免跳转失败
    const node: TocNode = { name: text, id, level: depth, children: [] };

    // 维护嵌套层级（栈结构）
    while (this.currentParents.length && this.currentParents.at(-1)!.level >= depth) {
      this.currentParents.pop();
    }
    this.currentParents.length ? this.currentParents.at(-1)!.children.push(node) : this.tocTree.push(node);
    this.currentParents.push(node);

    return `<h${depth} id="${id}">${text}</h${depth}>`;
  }

  // 获取目录树（内部用，不对外暴露）
  getTocTree(): TocNode[] {
    return this.tocTree;
  }
}

/**
 * 解析 Markdown 文本，返回 HTML 和树状目录
 * @param text - 输入的 Markdown 字符串
 * @returns { html: string; tocNodeTree: TocNode[] } - 解析结果（HTML + 树状目录）
 */
export async function parseMarkdown(text: string): Promise<{ html: string; tocNodeTree: TocNode[] }> {
  try {
    const markedInstance = new Marked();
    const renderer = new InternalRenderer();

    // 2. 配置（固定核心配置，用户无需关心）
    markedInstance.use({
      async: true,
      pedantic: false,
      gfm: true,
    });

    // 3. 代码高亮（固定配置，用户无需关心）
    markedInstance.use(markedHighlight({
      langPrefix: "hljs language-",
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang)? lang : "shell";
        return hljs.highlight(code, { language }).value;
      },
    }));

    // 4. 注册自定义 Renderer（收集目录）.解析 Markdown
    const html = await markedInstance.parse(text, {renderer});

    // 5. 返回结果（严格匹配用户要求的结构）
    return {
      html: DOMPurify.sanitize(html),
      tocNodeTree: renderer.getTocTree(), // 从独立 Renderer 中拿目录树
    };
  } catch (error) {
    console.error("Markdown Parser Error:", error);
    // 失败兜底：返回错误提示 HTML + 空目录
    return {
      html: `<p>failed to parse content!</p>`,
      tocNodeTree: [],
    };
  }
}