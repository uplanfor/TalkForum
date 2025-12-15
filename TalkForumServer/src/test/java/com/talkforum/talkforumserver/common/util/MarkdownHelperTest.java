package com.talkforum.talkforumserver.common.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * MarkdownIntroHelper工具类的单元测试
 * 测试Markdown格式去除、简介生成和封面图片提取功能
 */
public class MarkdownHelperTest {

    @Test
    @DisplayName("测试标准Markdown文本格式去除")
    public void testRemoveMarkdownFormat() {
        String markdown = "# 标题\n\n这是一个**粗体**和*斜体*的示例。\n\n" +
                "## 列表示例\n- 项目1\n- 项目2\n\n" +
                "这是一个[链接](https://example.com)和![图片](https://example.com/image.jpg)。\n\n" +
                "```java\npublic class Test {}\n```\n\n" +
                "> 引用文本\n\n" +
                "---\n\n" +
                "| 列1 | 列2 |\n|-----|-----|\n| 值1 | 值2 |";
        
        String intro = MarkdownHelper.getIntro(markdown, 100);
        
        // 验证标题被去除
        assertFalse(intro.contains("# 标题"));
        assertFalse(intro.contains("## 列表示例"));
        
        // 验证粗体和斜体被去除
        assertFalse(intro.contains("**粗体**"));
        assertFalse(intro.contains("*斜体*"));
        assertTrue(intro.contains("粗体"));
        assertTrue(intro.contains("斜体"));
        
        // 验证列表被处理
        assertFalse(intro.contains("- 项目1"));
        assertFalse(intro.contains("- 项目2"));
        
        // 验证链接被处理
        assertFalse(intro.contains("[链接](https://example.com)"));
        assertTrue(intro.contains("链接"));
        
        // 验证图片被处理
        assertFalse(intro.contains("![图片](https://example.com/image.jpg)"));
        assertTrue(intro.contains("[图片]"));
        
        // 验证代码块被处理
        assertFalse(intro.contains("```java"));
        assertTrue(intro.contains("[代码块]"));
        
        // 验证引用被处理
        assertFalse(intro.contains("> 引用文本"));
        assertTrue(intro.contains("引用文本"));
        
        // 验证水平线被去除
        assertFalse(intro.contains("---"));
        
        // 验证表格被处理
        assertFalse(intro.contains("| 列1 | 列2 |"));
    }

    @Test
    @DisplayName("测试纯文本处理")
    public void testPlainText() {
        String plainText = "这是一个纯文本，没有任何Markdown格式。它包含多个句子。这是第三个句子。";
        String intro = MarkdownHelper.getIntro(plainText, 50);
        
        assertEquals(50, intro.length());
        assertTrue(intro.endsWith("..."));
        assertTrue(intro.contains("这是一个纯文本"));
    }

    @Test
    @DisplayName("测试短文本处理")
    public void testShortText() {
        String shortText = "短文本";
        String intro = MarkdownHelper.getIntro(shortText, 50);
        
        assertEquals(shortText, intro);
        assertFalse(intro.endsWith("..."));
    }

    @Test
    @DisplayName("测试空文本处理")
    public void testEmptyText() {
        String emptyText = "";
        String intro = MarkdownHelper.getIntro(emptyText, 50);
        
        assertEquals("暂无简介", intro);
        
        String nullText = null;
        intro = MarkdownHelper.getIntro(nullText, 50);
        
        assertEquals("暂无简介", intro);
    }

    @Test
    @DisplayName("测试仅包含图片的文本")
    public void testImageOnlyText() {
        String imageText = "![图片1](https://example.com/image1.jpg)\n\n![图片2](https://example.com/image2.jpg)";
        String intro = MarkdownHelper.getIntro(imageText, 50);
        
        assertEquals("[图片] [图片]", intro);
    }

    @Test
    @DisplayName("测试提取第一个图片链接")
    public void testExtractFirstImage() {
        String markdown = "这是一段文本，包含![第一张图片](https://example.com/image1.jpg)和![第二张图片](https://example.com/image2.jpg)。";
        String imageUrl = MarkdownHelper.extractFirstImage(markdown);
        
        assertEquals("https://example.com/image1.jpg", imageUrl);
    }

    @Test
    @DisplayName("测试提取带标题的图片链接")
    public void testExtractImageWithTitle() {
        String markdown = "这是一段文本，包含![图片描述](https://example.com/image.jpg \"图片标题\")。";
        String imageUrl = MarkdownHelper.extractFirstImage(markdown);
        
        assertEquals("https://example.com/image.jpg", imageUrl);
    }

    @Test
    @DisplayName("测试无图片的文本")
    public void testNoImageText() {
        String noImageText = "这是一段没有图片的文本。";
        String imageUrl = MarkdownHelper.extractFirstImage(noImageText);
        
        assertNull(imageUrl);
    }

    @Test
    @DisplayName("测试复杂URL的图片链接")
    public void testComplexImageUrl() {
        String markdown = "这是一段文本，包含![图片](https://example.com/path with spaces/image.jpg?param=value&other=value)。";
        String imageUrl = MarkdownHelper.extractFirstImage(markdown);
        
        assertEquals("https://example.com/path with spaces/image.jpg?param=value&other=value", imageUrl);
    }

    @Test
    @DisplayName("测试智能截断在句子结束处")
    public void testTruncateAtSentenceEnd() {
        String text = "这是第一句话。这是第二句话！这是第三句话？这是第四句话。";
        String intro = MarkdownHelper.getIntro(text, 25);
        
        assertTrue(intro.contains("这是第一句话。"));
        assertTrue(intro.endsWith("..."));
    }

    @Test
    @DisplayName("测试超长文本处理")
    public void testLongText() {
        StringBuilder longText = new StringBuilder();
        for (int i = 0; i < 100; i++) {
            longText.append("这是第").append(i).append("句话。");
        }
        
        String intro = MarkdownHelper.getIntro(longText.toString(), 100);
        
        assertTrue(intro.length() <= 103); // 100字符 + "..."
        assertTrue(intro.endsWith("..."));
    }

    @Test
    @DisplayName("测试嵌套Markdown格式")
    public void testNestedMarkdownFormat() {
        String markdown = "这是***粗斜体***文本，包含**粗体中的*斜体***内容。";
        String intro = MarkdownHelper.getIntro(markdown, 50);
        
        assertFalse(intro.contains("***粗斜体***"));
        assertFalse(intro.contains("**粗体中的*斜体***"));
        assertTrue(intro.contains("粗斜体"));
        assertTrue(intro.contains("粗体中的"));
        assertTrue(intro.contains("斜体"));
    }

    @Test
    @DisplayName("测试删除线格式")
    public void testStrikethroughFormat() {
        String markdown = "这是~~删除线~~文本。";
        String intro = MarkdownHelper.getIntro(markdown, 50);
        
        assertFalse(intro.contains("~~删除线~~"));
        assertTrue(intro.contains("删除线"));
    }

    @Test
    @DisplayName("测试脚注格式")
    public void testFootnoteFormat() {
        String markdown = "这是文本[^1]，包含脚注。\n\n[^1]: 脚注内容";
        String intro = MarkdownHelper.getIntro(markdown, 50);
        
        assertFalse(intro.contains("[^1]"));
        assertFalse(intro.contains("[^1]: 脚注内容"));
        assertTrue(intro.contains("这是文本"));
        assertTrue(intro.contains("包含脚注"));
    }

    @Test
    @DisplayName("测试HTML标签去除")
    public void testHtmlTagRemoval() {
        String markdown = "这是包含<div>HTML标签</div>的文本。";
        String intro = MarkdownHelper.getIntro(markdown, 50);
        
        assertFalse(intro.contains("<div>"));
        assertFalse(intro.contains("</div>"));
        assertTrue(intro.contains("HTML标签"));
    }

    @Test
    @DisplayName("测试Setext风格标题")
    public void testSetextStyleHeaders() {
        String markdown = "这是一级标题\n========\n\n这是二级标题\n--------\n\n这是正文内容。";
        String intro = MarkdownHelper.getIntro(markdown, 50);
        
        assertFalse(intro.contains("========"));
        assertFalse(intro.contains("--------"));
        assertTrue(intro.contains("这是一级标题"));
        assertTrue(intro.contains("这是二级标题"));
        assertTrue(intro.contains("这是正文内容"));
    }
}