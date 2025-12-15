package com.talkforum.talkforumserver.common.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Markdown处理工具类
 * 提供Markdown格式去除、简介生成和封面图片提取功能
 */
public class MarkdownHelper {

    /**
     * 核心方法：Markdown 转论坛简介
     * @param markdown 原始 Markdown 内容
     * @param maxLength 简介最大长度
     * @return 纯文本简介
     */
    public static String getIntro(String markdown, int maxLength) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return "no introduction";
        }

        // 1. 增强的正则去除 Markdown 格式
        String plainText = removeMarkdownFormat(markdown);

        // 2. 清理文本（合并空白、去除首尾空格）
        String cleanedText = cleanText(plainText);

        // 3. 智能截断（优先在句子结束处截断）
        return truncateText(cleanedText, maxLength);
    }

    /**
     * 提取Markdown文本中的第一个图片链接
     * @param markdown 原始 Markdown 内容
     * @return 第一个图片的URL，若无图片则返回null
     */
    public static String extractFirstImage(String markdown) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return null;
        }

        // 匹配标准Markdown图片格式：![alt](url) 或 ![alt](url "title")
        Pattern imagePattern = Pattern.compile("!\\[(.*?)\\]\\(([^\\s]+)(?:\\s+\"([^\"]*)\")?\\)");
        Matcher matcher = imagePattern.matcher(markdown);
        
        if (matcher.find()) {
            // 返回第一个匹配的图片URL
            return matcher.group(2);
        }
        
        return null;
    }

    /**
     * 增强的正则去除 Markdown 格式
     * 支持更全面的Markdown语法元素
     */
    private static String removeMarkdownFormat(String markdown) {
        if (markdown == null) {
            return "";
        }
        
        // 1. 去除代码块（先处理，避免内容被其他规则干扰）
        markdown = markdown.replaceAll("```[\\s\\S]*?```", "[codeblock]");
        
        // 2. 去除行内代码
        markdown = markdown.replaceAll("`([^`]+)`", "$1");
        
        // 3. 去除标题（支持ATX和Setext风格）
        markdown = markdown.replaceAll("^#{1,6}\\s+(.+)$", "$1");
        markdown = markdown.replaceAll("^(.+)\\n[=-]+\\n", "$1");
        
        // 4. 去除粗体和斜体（处理嵌套情况）
        markdown = markdown.replaceAll("\\*\\*\\*([^*]+)\\*\\*\\*", "$1"); // ***粗斜体***
        markdown = markdown.replaceAll("___([^_]+)___", "$1"); // ___粗斜体___
        markdown = markdown.replaceAll("\\*\\*([^*]+)\\*\\*", "$1"); // **粗体**
        markdown = markdown.replaceAll("__([^_]+)__", "$1"); // __粗体__
        markdown = markdown.replaceAll("\\*([^*]+)\\*", "$1"); // *斜体*
        markdown = markdown.replaceAll("_([^_]+)_", "$1"); // _斜体_
        
        // 5. 去除链接（保留链接文本）
        markdown = markdown.replaceAll("\\[([^\\]]+)\\]\\(([^)]+)\\)", "$1");
        
        // 6. 去除图片（替换为[图片]）
        markdown = markdown.replaceAll("!\\[(.*?)\\]\\(([^\\s]+)(?:\\s+\"([^\"]*)\")?\\)", "[image]");
        
        // 7. 去除引用（支持多行引用）
        markdown = markdown.replaceAll("^>\\s+(.+)$", "$1");
        
        // 8. 去除列表（有序和无序）
        markdown = markdown.replaceAll("^\\s*[-*+]\\s+(.+)$", "$1");
        markdown = markdown.replaceAll("^\\s*\\d+\\.\\s+(.+)$", "$1");
        
        // 9. 去除水平线
        markdown = markdown.replaceAll("^\\s*[-*_]{3,}\\s*$", "");
        
        // 10. 去除表格（简化处理）
        markdown = markdown.replaceAll("\\|(.+)\\|", "$1");
        markdown = markdown.replaceAll("^[-+|\\s]+$", "");
        
        // 11. 去除删除线
        markdown = markdown.replaceAll("~~([^~]+)~~", "$1");
        
        // 12. 去除HTML标签
        markdown = markdown.replaceAll("<[^>]+>", "");
        
        // 13. 去除脚注
        markdown = markdown.replaceAll("\\[\\^([^\\]]+)\\]", "");
        markdown = markdown.replaceAll("\\[\\^([^\\]]+)\\]:.*", "");
        
        return markdown;
    }

    /**
     * 清理文本
     * 合并空白字符，去除首尾空格
     */
    private static String cleanText(String text) {
        if (text == null) {
            return "";
        }
        
        // 合并换行和空格
        text = text.replaceAll("\\n+", " ");
        text = text.replaceAll("\\s+", " ");
        
        return text.trim();
    }

    /**
     * 智能截断文本
     * 优先在句子结束处截断，避免截断词语
     */
    private static String truncateText(String text, int maxLength) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        
        if (text.length() <= maxLength) {
            return text;
        }
        
        // 首先尝试在句子结束处截断（句号、问号、感叹号）
        int truncateIndex = findSentenceEnd(text, maxLength);
        
        // 如果找不到合适的句子结束位置，尝试在空格处截断
        if (truncateIndex <= 0) {
            truncateIndex = findSpacePosition(text, maxLength);
        }
        
        // 如果仍然找不到合适位置，直接在maxLength处截断
        if (truncateIndex <= 0) {
            truncateIndex = maxLength;
        }
        
        return text.substring(0, truncateIndex) + "...";
    }
    
    /**
     * 在指定长度内查找句子结束位置
     */
    private static int findSentenceEnd(String text, int maxLength) {
        int searchEnd = Math.min(text.length(), maxLength);
        
        // 从后向前查找句子结束符
        for (int i = searchEnd - 1; i >= 0; i--) {
            char c = text.charAt(i);
            if (c == '。' || c == '！' || c == '？' || c == '.' || c == '!' || c == '?') {
                return i + 1; // 包含句子结束符
            }
        }
        
        return -1; // 未找到
    }
    
    /**
     * 在指定长度内查找空格位置
     */
    private static int findSpacePosition(String text, int maxLength) {
        int searchEnd = Math.min(text.length(), maxLength);
        
        // 从后向前查找空格
        for (int i = searchEnd - 1; i >= 0; i--) {
            if (Character.isWhitespace(text.charAt(i))) {
                return i; // 不包含空格
            }
        }
        
        return -1; // 未找到
    }
}