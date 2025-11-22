import "./styles/style_postdocument.css"

interface PostDocumentProps {
  content: string;
}

const PostDocument = ({ content }: PostDocumentProps) => {
  return (
    <div className="post-document">
      <div className="post-window">
        <div className="post-header"></div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: content }}></div>
        <div className="post-comment">

        </div>
      </div>
    </div>
  );
}

export default PostDocument;