import "./styles/style_postcardplaceholder.css"

const PostCardPlaceholder = () => {
    return (
        <div className="card skeleton">
            <div className="author-info">
                <div className="skeleton-avatar" />
                <div className="author-info-text">
                    <div className="skeleton-text skeleton-text-name" />
                    <div className="skeleton-text skeleton-text-date" />
                </div>
            </div>

            <div className="skeleton-text skeleton-title" />
            <div className="skeleton-text skeleton-content" />

            <div className="detail">
                <span className="skeleton-stat" />
                <span className="skeleton-stat" />
                <span className="skeleton-stat" />
            </div>
        </div>
    )
}

export default PostCardPlaceholder
