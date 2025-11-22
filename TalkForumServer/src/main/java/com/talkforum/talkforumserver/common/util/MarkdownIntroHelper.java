package com.talkforum.talkforumserver.common.util;

public class MarkdownIntroHelper {

    /**
     * 核心方法：Markdown 转论坛简介（零依赖）
     * @param markdown 原始 Markdown 内容
     * @param maxLength 简介最大长度
     * @return 纯文本简介
     */
    public static String getIntro(String markdown, int maxLength) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return "暂无简介";
        }

        // 1. 正则去除 Markdown 格式（覆盖论坛常用语法）
        String plainText = removeMarkdownFormat(markdown);

        // 2. 清理文本（合并空白、去除首尾空格）
        String cleanedText = cleanText(plainText);

        // 3. 智能截断（和之前逻辑一致）
        return truncateText(cleanedText, maxLength);
    }

    /**
     * 正则去除 Markdown 格式（关键步骤）
     */
    private static String removeMarkdownFormat(String markdown) {
        // 1. 去除标题：# 、## 等
        markdown = markdown.replaceAll("^#{1,6}\\s+", "");
        // 2. 去除粗体/斜体：** ** 、* * 、__ __
        markdown = markdown.replaceAll("\\*\\*(.*?)\\*\\*", "$1");
        markdown = markdown.replaceAll("\\*(.*?)\\*", "$1");
        markdown = markdown.replaceAll("__(.*?)__", "$1");
        // 3. 去除链接：[文本](url) → 保留文本
        markdown = markdown.replaceAll("\\[(.*?)\\]\\([^)]*\\)", "$1");
        // 4. 去除图片：![描述](url) → 替换为 [图片]
        markdown = markdown.replaceAll("!\\[(.*?)\\]\\([^)]*\\)", "[图片]");
        // 5. 去除行内代码：`代码` → 保留代码文本
        markdown = markdown.replaceAll("`(.*?)`", "$1");
        // 6. 去除代码块：```...``` → 替换为 [代码块]
        markdown = markdown.replaceAll("```[\\s\\S]*?```", "[代码块]");
        // 7. 去除列表：- 、* 、1. 等前缀
        markdown = markdown.replaceAll("^\\s*[-*+]\\s+", "- ");
        markdown = markdown.replaceAll("^\\s*\\d+\\.\\s+", "");
        // 8. 去除引用：>
        markdown = markdown.replaceAll("^\\s*>\\s+", "");
        // 9. 去除分割线：--- 、*** 等
        markdown = markdown.replaceAll("^\\s*[-*=_]{3,}\\s*$", "");
        // 10. 去除 HTML 标签（防止用户插入 HTML）
        markdown = markdown.replaceAll("<[^>]+>", "");
        return markdown;
    }

    /**
     * 清理文本（和之前逻辑一致）
     */
    private static String cleanText(String text) {
        text = text.replaceAll("\\n+", " "); // 合并换行
        text = text.replaceAll("\\s+", " "); // 合并空格
        return text.trim();
    }

    /**
     * 智能截断（和之前逻辑一致）
     */
    private static String truncateText(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        int truncateIndex = maxLength;
        char lastChar = text.charAt(truncateIndex - 1);
        // 避免截断中文词组/英文单词
        if (Character.isLetterOrDigit(lastChar)) {
            while (truncateIndex > 0 && Character.isLetterOrDigit(text.charAt(truncateIndex - 1))) {
                truncateIndex--;
            }
            if (truncateIndex == 0) {
                truncateIndex = maxLength;
            }
        }
        return text.substring(0, truncateIndex) + "...";
    }
}
