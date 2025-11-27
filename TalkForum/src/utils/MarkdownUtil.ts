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

  table(token: Tokens.Table): string {
    const headerHtml = token.header
      .map((cell, index) => {
        const align = token.align[index]; // 当前列的对齐方式
        const alignStyle = align ? `style="text-align: ${align};"` : "";
        return `<th ${alignStyle}>${cell.text}</th>`;
      })
      .join("");
    const thead = `<tr>${headerHtml}</tr>`;

    // 2. 生成表体 HTML（TableCell[][] -> <td> 标签，结合 align 对齐）
    const bodyHtml = token.rows
      .map((row) => {
        const tdHtml = row
          .map((cell, index) => {
            const align = token.align[index];
            const alignStyle = align ? `style="text-align: ${align};"` : "";
            return `<td ${alignStyle}>${cell.text}</td>`;
          })
          .join("");
        return `<tr>${tdHtml}</tr>`;
      })
      .join("");
    const tbody = bodyHtml;

    // 3. 完整表格结构 + 外层滚动容器
    return `<div class="table-wrapper"><table>
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table></div>`;
  }

  code(token: Tokens.Code): string {
    const language = (token.lang || "shell").toUpperCase();
    const highlightedCode = token.text;
    const codeBlockId = `code-block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const codeLines = highlightedCode.split('\n'); // 按换行符分割代码
    const lineCount = codeLines.length; // 总行数（含空行，确保行号连续）
    const lineNumbersHtml = Array.from({ length: lineCount }, (_, i) =>
      `<span class="code-line-number">${i + 1}</span>`
    ).join('');

    const header = `
  <div class="code-block-header">
    <span class="code-lang-tag">${language}</span>
    <label for="${codeBlockId}" class="code-collapse-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </label>
    <input 
      type="checkbox" 
      id="${codeBlockId}" 
      class="code-collapse-checkbox" 
      hidden
      ${lineCount <= 20 ? "checked" : ""}
    >
  </div>
`;

    const codeContent = `
      <div class="code-block-content">
        <div class="code-container">
          <!-- 行号列 -->
          <div class="code-line-numbers">${lineNumbersHtml}</div>
          <!-- 代码列（保留原有高亮） -->
          <pre><code class="hljs language-${language}">${highlightedCode}</code></pre>
        </div>
      </div>
    `;

    return `<div class="code-block">${header}${codeContent}</div>`;
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
        const language = hljs.getLanguage(lang) ? lang : "shell";
        return hljs.highlight(code, { language }).value;
      },
    }));

    // 4. 注册自定义 Renderer（收集目录）.解析 Markdown
    const html = await markedInstance.parse(text, { renderer });

    // // 4.1 将树转换为json格式

    // const tocNodeTree = renderer.getTocTree();
    // const jsonTocNodeTree = JSON.stringify(tocNodeTree);
    // console.log("目录树：", renderer.getTocTree());
    // console.log("目录树JSON：", jsonTocNodeTree);

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