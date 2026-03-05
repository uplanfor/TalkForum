package com.talkforum.talkforumserver.common.util;

import com.vladsch.flexmark.ast.*;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.util.ast.NodeVisitor;
import com.vladsch.flexmark.util.ast.VisitHandler;
import com.vladsch.flexmark.util.data.MutableDataSet;

import java.util.StringJoiner;
import java.util.regex.Pattern;

/**
 * Markdown工具类（基于Flexmark实现，无用户内容留存）
 */
public final class MarkdownHelper {
    // Flexmark解析器单例（仅初始化一次，提升性能，无状态）
    private static final Parser FLEXMARK_PARSER;

    // 句子结束标点（用于智能截断）
    private static final String SENTENCE_END_PUNCTUATION = "。！？；，.";

    static {
        // 初始化Flexmark解析器（仅启用基础Markdown解析能力）
        MutableDataSet options = new MutableDataSet();
        FLEXMARK_PARSER = Parser.builder(options).build();
    }

    /**
     * 提取Markdown文本的简介（严格匹配指定方法签名）
     * @param markdown 原始Markdown文本
     * @param maxLength 简介最大长度
     * @return 处理后的简介文本
     */
    public static String getIntro(String markdown, int maxLength) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return "";
        }

        // 1. 基于Flexmark AST解析去除所有Markdown格式（替代正则，更精准）
        String plainText = removeMarkdownFormat(markdown);

        // 2. 清理文本（合并空白、去除首尾空格）
        String cleanedText = cleanText(plainText);

        // 3. 智能截断（优先在句子结束处截断）
        return truncateText(cleanedText, maxLength);
    }

    /**
     * 提取Markdown文本中的第一个图片链接（严格匹配指定方法签名）
     * @param markdown 原始 Markdown 内容
     * @return 第一个图片的URL，若无图片则返回null
     */
    public static String extractFirstImage(String markdown) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return null;
        }

        // 基于Flexmark AST解析图片节点（比正则更可靠，覆盖所有标准Markdown图片语法）
        Node document = FLEXMARK_PARSER.parse(markdown);
        final String[] firstImageUrl = {null};

        // 遍历AST找第一个Image节点
        NodeVisitor visitor = new NodeVisitor(
                new VisitHandler<>(Image.class, image -> {
                    if (firstImageUrl[0] == null) {
                        firstImageUrl[0] = image.getUrl().toString();
                    }
                })
        );
        visitor.visit(document);

        return firstImageUrl[0];
    }

    // ===================== 内部辅助方法（仅工具类内部调用） =====================
    /**
     * 基于Flexmark AST解析去除所有Markdown格式，提取纯文本
     */
    private static String removeMarkdownFormat(String markdown) {
        Node document = FLEXMARK_PARSER.parse(markdown);
        StringJoiner joiner = new StringJoiner(" ");

        // 遍历AST，仅提取纯文本节点，忽略所有Markdown格式节点
        NodeVisitor visitor = new NodeVisitor(
                // 提取标题文本
                new VisitHandler<>(Heading.class, heading -> extractTextFromNode(heading, joiner)),
                // 提取段落文本
                new VisitHandler<>(Paragraph.class, paragraph -> extractTextFromNode(paragraph, joiner)),
                // 提取列表项文本
                new VisitHandler<>(ListItem.class, listItem -> extractTextFromNode(listItem, joiner)),
                // 忽略图片、链接、代码块、表格等格式节点
                new VisitHandler<>(Image.class, image -> {}),
                new VisitHandler<>(Link.class, link -> {}),
                new VisitHandler<>(FencedCodeBlock.class, code -> {})
        );
        visitor.visit(document);

        return joiner.toString();
    }

    /**
     * 从AST节点中提取纯文本
     */
    private static void extractTextFromNode(Node node, StringJoiner joiner) {
        for (Node child : node.getChildren()) {
            if (child instanceof Text) {
                joiner.add(((Text) child).getChars().toString());
            } else if (child.getChildren() != null) {
                extractTextFromNode(child, joiner);
            }
        }
    }

    /**
     * 清理文本：合并多个空白符为单个空格，去除首尾空格
     */
    private static String cleanText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        // 合并所有空白符（空格、换行、制表符等）为单个空格，再去首尾空格
        return text.replaceAll("\\s+", " ").trim();
    }

    /**
     * 智能截断文本：优先在句子结束标点处截断，保证语义完整
     */
    private static String truncateText(String text, int maxLength) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        if (maxLength <= 0) {
            return "";
        }
        if (text.length() <= maxLength) {
            return text;
        }

        // 第一步：找maxLength范围内最后一个句子结束标点
        int truncateIndex = -1;
        for (int i = maxLength - 1; i >= 0; i--) {
            if (SENTENCE_END_PUNCTUATION.contains(String.valueOf(text.charAt(i)))) {
                truncateIndex = i + 1; // 包含标点
                break;
            }
        }

        // 第二步：若没找到句子结束标点，直接截断到maxLength
        if (truncateIndex == -1) {
            truncateIndex = maxLength;
        }

        // 第三步：截断并补充省略号
        String truncated = text.substring(0, truncateIndex).trim();
        return truncated + "...";
    }
}